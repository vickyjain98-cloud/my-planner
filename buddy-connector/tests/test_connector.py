import json
from datetime import date
from pathlib import Path

import pytest

from myplanner_connector import PlannerClient, PlannerNotConnected, QueueGate, Suggestion
from myplanner_connector.diary import MarkdownDiarySink, SQLiteDiarySink, build_entries
from myplanner_connector.drive import PlannerDrive
from myplanner_connector.insights import candidates, context_text
from myplanner_connector.ledger import Ledger
from myplanner_connector.memory import index_entries
from myplanner_connector.models import Feed
from myplanner_connector import pipeline
from tests.fakes import FakeDrive

FEED = json.loads((Path(__file__).parent / "sample_feed.json").read_text())
TODAY = date.fromisoformat(FEED["generatedAt"][:10])


def make(feed=FEED, gate=None, folder=True):
    fd = FakeDrive(with_folder=folder)
    if feed is not None:
        fd.put("buddy-feed.json", feed)
    ledger = Ledger(":memory:")
    return fd, PlannerClient(PlannerDrive(fd), ledger, gate(ledger) if gate else None)


def test_not_connected_messages():
    _, c = make(feed=None)
    with pytest.raises(PlannerNotConnected, match="Settings"):
        c.feed()
    _, c = make(feed=None, folder=False)
    with pytest.raises(PlannerNotConnected, match="same Google Cloud project"):
        c.feed()
    assert c.status()["connected"] is False


def test_feed_parses_app_output():
    _, c = make()
    f = c.feed()
    assert f.name == "Harshita" and f.allowed("events") and f.data["studyPlan"]["weekday"]
    assert c.status()["connected"] is True


def test_suggestion_validation():
    with pytest.raises(Exception):
        Suggestion(kind="evil", title="x")
    with pytest.raises(Exception):
        Suggestion(kind="task", title="x", time="25:00")
    s = Suggestion(kind="task", title="  Revise\nUnit 2 ", why="weak").with_id()
    assert s.title == "Revise Unit 2" and s.id.startswith("buddy-")


def test_propose_writes_inbox_once_and_respects_app_limits():
    fd, c = make()
    r = c.propose([{"kind": "study", "title": "Revise Unit 2", "date": "2026-11-20", "time": "16:00", "end": "17:00", "priority": "high", "why": "weak area"}])
    assert len(r["sent"]) == 1
    box = fd.get("buddy-inbox.json")
    assert box["items"][0]["kind"] == "study" and box["items"][0]["priority"] == "high"
    assert c.propose([{"kind": "study", "title": "Revise Unit 2", "date": "2026-11-20", "time": "16:00", "why": "x"}])["skipped"]


def test_decisions_flow_back_and_inbox_is_pruned():
    fd, c = make()
    sid = c.propose([{"kind": "task", "title": "Book library slot", "why": "exam"}])["sent"][0]
    feed = dict(FEED, data=dict(FEED["data"], inboxDecisions=[{"id": sid, "status": "approved"}]))
    fd.files = {k: v for k, v in fd.files.items() if v.get("name") != "buddy-feed.json"}
    fd.put("buddy-feed.json", feed)
    c.feed()
    assert c.suggestions()[0]["status"] == "approved"
    c.propose([{"kind": "note", "title": "Another", "why": "y"}])
    assert [i["title"] for i in fd.get("buddy-inbox.json")["items"]] == ["Another"]


def test_withdraw():
    fd, c = make()
    sid = c.propose([{"kind": "reminder", "title": "Call Nani", "why": "birthday"}])["sent"][0]
    assert c.withdraw(sid)
    box = fd.get("buddy-inbox.json")
    assert sid in box["withdrawn"] and not box["items"]
    assert not c.withdraw(sid)


def test_buddy_gate_queues_until_approved():
    fd, c = make(gate=QueueGate)
    r = c.propose([{"kind": "habit", "title": "Evening walk", "why": "energy"}])
    assert r["queued"] and fd.get("buddy-inbox.json") is None
    assert c.gate.approve(r["queued"][0])
    assert c.propose([])["sent"] == r["queued"]
    assert fd.get("buddy-inbox.json")["items"][0]["title"] == "Evening walk"


def test_insights_are_explained_and_stable():
    f = Feed.model_validate(FEED)
    c1, c2 = candidates(f, today=TODAY), candidates(f, today=TODAY)
    assert c1 and [x.id for x in c1] == [x.id for x in c2]
    assert all(x.why for x in c1)
    kinds = {x.kind for x in c1}
    assert "study" in kinds  # studying below plan in the sample
    txt = context_text(f, today=TODAY)
    assert "Harshita" in txt and "Study:" in txt


def test_insights_respect_sharing():
    f = Feed.model_validate(dict(FEED, categories=[]))
    assert candidates(f, today=TODAY) == []
    assert "shared: nothing" in context_text(f, today=TODAY)


def test_diary_entries_and_sinks(tmp_path):
    f = Feed.model_validate(FEED)
    es = build_entries(f, "harshita", days=7, today=TODAY)
    assert es and all(e.key.startswith("my-planner:harshita:") for e in es)
    yesterday = [e for e in es if e.date < TODAY.isoformat()][0]
    assert "**Habits:**" in yesterday.body and "**Study:**" in yesterday.body
    assert any("**Journal:**" in e.body for e in es) and any("**Mood:**" in e.body for e in es)
    # no mood/journal if not shared
    f2 = Feed.model_validate(dict(FEED, categories=["habits", "study"]))
    assert not any("Mood" in e.body or "Journal" in e.body for e in build_entries(f2, "h", today=TODAY))
    md = MarkdownDiarySink(tmp_path / "diary")
    assert md.upsert(es) == len(es) and list((tmp_path / "diary" / "harshita").glob("*.md"))
    sq = SQLiteDiarySink(str(tmp_path / "buddy.db"))
    sq.upsert(es); sq.upsert(es)
    assert sq.db.execute("select count(*) from diary_entries").fetchone()[0] == len(es)


class FakeCollection:
    def __init__(self):
        self.docs = {}

    def upsert(self, ids, documents, metadatas):
        for i, d, m in zip(ids, documents, metadatas):
            self.docs[i] = (d, m)


def test_memory_and_pipeline(tmp_path):
    fd, c = make()
    col = FakeCollection()
    out = pipeline.run(c, "harshita", sink=MarkdownDiarySink(tmp_path), collection=col, today=TODAY)
    assert out["diary"] == out["memory"] == len(col.docs) > 0 and out["proposed"] is None
    assert all(m["type"] == "diary" for _, m in col.docs.values())
    out2 = pipeline.run(c, "harshita", collection=col, today=TODAY, propose=True)
    assert out2["proposed"]["sent"] and len(col.docs) == out["memory"]  # upsert, no duplicates


def test_tools_and_api():
    fd, c = make()
    from myplanner_connector.tools import make_tools
    tools = {t.name: t for t in make_tools(lambda: c)}
    assert "Harshita" in tools["planner_briefing"].invoke({"days": 7})
    assert "approval" in tools["planner_propose"].invoke({"kind": "reminder", "title": "Water", "why": "hydration", "time": "11:00"})
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from myplanner_connector.api import make_router
    app = FastAPI()
    app.include_router(make_router(lambda p: c), prefix="/planner")
    t = TestClient(app)
    assert t.get("/planner/harshita/status").json()["connected"]
    assert t.get("/planner/harshita/diary").json()
    assert t.post("/planner/harshita/suggestions", json=[{"kind": "bad", "title": "x"}]).status_code == 422
    r = t.post("/planner/harshita/suggestions", json=[{"kind": "task", "title": "Print notes", "why": "exam"}]).json()
    assert r["sent"]
    assert t.delete(f"/planner/harshita/suggestions/{r['sent'][0]}").status_code == 200
