"""Buddy's main entry point for My Planner."""
from __future__ import annotations

import warnings
from datetime import datetime, timezone

from .config import FEED_FILE, FEED_SCHEMA, INBOX_FILE, MAX_INBOX, SUPPORTED_SCHEMA, Settings
from .drive import PlannerDrive
from .gate import ApprovalGate, PlannerInboxGate, QueueGate
from .ledger import Ledger
from .models import Feed, Suggestion


class PlannerNotConnected(RuntimeError):
    """The person hasn't switched Buddy on in My Planner yet (or the app hasn't synced since)."""


class PlannerClient:
    def __init__(self, drive: PlannerDrive, ledger: Ledger, gate: ApprovalGate | None = None):
        self.drive, self.ledger = drive, ledger
        self.gate = gate or PlannerInboxGate()

    # ---------- construction ----------
    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "PlannerClient":
        from .auth import session

        settings = settings or Settings.from_env()
        http = session(settings)
        if http is None:
            raise PlannerNotConnected(f"Buddy isn't signed in for profile '{settings.profile}'. Run: myplanner login --profile {settings.profile}")
        ledger = Ledger(settings.ledger_path)
        gate = QueueGate(ledger) if settings.gate_mode == "buddy" else PlannerInboxGate()
        return cls(PlannerDrive(http), ledger, gate)

    # ---------- reading ----------
    def feed(self) -> Feed:
        raw, meta = self.drive.read_json(FEED_FILE)
        if raw is None:
            if not self.drive.folder_id():
                raise PlannerNotConnected("No 'My Planner' folder is visible to Buddy. Open My Planner, sync once, and make sure Buddy uses an OAuth client from the same Google Cloud project.")
            raise PlannerNotConnected("Buddy is not switched on in My Planner. In the app: Settings → Connections → Buddy OS, tick what Buddy may read, then sync.")
        feed = Feed.model_validate(raw)
        if feed.schema_ != FEED_SCHEMA:
            raise ValueError(f"Unexpected file format: {feed.schema_!r}")
        if feed.schemaVersion > SUPPORTED_SCHEMA:
            warnings.warn(f"My Planner feed schema {feed.schemaVersion} is newer than this connector ({SUPPORTED_SCHEMA}); update the connector.")
        self._sync_decisions(feed)
        return feed

    def status(self) -> dict:
        out = {"folder": bool(self.drive.folder_id()), "connected": False, "gate": getattr(self.gate, "mode", "custom")}
        try:
            f = self.feed()
        except PlannerNotConnected as e:
            out["message"] = str(e)
            return out
        age_h = (datetime.now(timezone.utc) - datetime.fromisoformat(f.generatedAt.replace("Z", "+00:00"))).total_seconds() / 3600
        counts: dict[str, int] = {}
        for s in self.ledger.all():
            counts[s["status"]] = counts.get(s["status"], 0) + 1
        out.update(connected=True, name=f.name, appVersion=f.appVersion, categories=f.categories,
                   feedAgeHours=round(age_h, 1), suggestions=counts)
        return out

    # ---------- suggesting ----------
    def propose(self, items: list[Suggestion | dict]) -> dict:
        """Offer suggestions to the person. Nothing changes in their planner until they tap Approve."""
        report = {"sent": [], "queued": [], "skipped": []}
        to_send: list[Suggestion] = []
        for it in items:
            s = (it if isinstance(it, Suggestion) else Suggestion.model_validate(it)).with_id()
            if self.ledger.has(s.id):
                report["skipped"].append(s.id)
                continue
            if self.gate.submit(s) == "send":
                to_send.append(s)
            else:
                report["queued"].append(s.id)
        to_send += [s for s in self.gate.approved() if s.id not in {x.id for x in to_send}]
        if to_send:
            self._write_inbox(add=to_send)
            for s in to_send:
                self.ledger.record(s, status="in-planner-inbox")
            self.gate.mark_sent([s.id for s in to_send])
            report["sent"] = [s.id for s in to_send]
        return report

    def withdraw(self, sid: str) -> bool:
        """Take back a suggestion the person hasn't decided on yet."""
        if not self.ledger.set_status(sid, "withdrawn", only_from="in-planner-inbox"):
            return False
        self._write_inbox(withdraw=[sid])
        return True

    def suggestions(self) -> list[dict]:
        return self.ledger.all()

    # ---------- internals ----------
    def _sync_decisions(self, feed: Feed) -> None:
        for sid, st in feed.decisions.items():
            if st in ("approved", "dismissed", "withdrawn"):
                self.ledger.set_status(sid, st)

    def _write_inbox(self, add: list[Suggestion] = (), withdraw: list[str] = ()) -> None:
        box, _ = self.drive.read_json(INBOX_FILE)
        box = box if isinstance(box, dict) else {}
        items = [i for i in box.get("items", []) if isinstance(i, dict) and i.get("id")]
        gone = set(box.get("withdrawn", [])) | set(withdraw)
        decided = {s["id"] for s in self.ledger.all() if s["status"] in ("approved", "dismissed", "withdrawn")}
        # keep the file small: drop items the person already decided on or that were withdrawn
        items = [i for i in items if i["id"] not in decided and i["id"] not in gone]
        have = {i["id"] for i in items}
        items += [s.to_inbox() for s in add if s.id not in have]
        if len(items) > MAX_INBOX:
            raise ValueError(f"The planner inbox holds at most {MAX_INBOX} open suggestions; wait for decisions first.")
        self.drive.write_json(INBOX_FILE, {"schema": "my-planner-inbox", "schemaVersion": 1,
                                           "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                                           "items": items, "withdrawn": sorted(gone)[-200:]})
