"""Daily diary entries for Buddy's Diary, built from the My Planner feed.

One entry per day, written in plain language, using only the categories the person shared.
The same entries feed Buddy's memory (see memory.py), so Diary and RAG always agree.

Where the entries go is pluggable (a "sink"):
    MarkdownDiarySink  one .md file per day in a folder (default: ~/.buddy/diary/my-planner)
    SQLiteDiarySink    a `diary_entries` table in Buddy's SQLite/PostgreSQL-compatible database
    HTTPDiarySink      POST to Buddy's own FastAPI diary endpoint
Entries are upserted by (source, profile, date), so re-running a day updates it instead of duplicating.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from dataclasses import asdict, dataclass, field
from datetime import date, timedelta
from pathlib import Path
from typing import Protocol

from .models import Feed

MOOD_SCALE = {1: "very low", 2: "low", 3: "okay", 4: "good", 5: "strong"}


@dataclass
class DiaryEntry:
    date: str
    profile: str
    title: str
    body: str
    tags: list[str] = field(default_factory=list)
    metrics: dict = field(default_factory=dict)
    source: str = "my-planner"

    @property
    def key(self) -> str:
        return f"{self.source}:{self.profile}:{self.date}"

    def markdown(self) -> str:
        tags = " ".join("#" + t for t in self.tags)
        return f"# {self.title}\n\n{self.body}\n\n{tags}\n"


def _by_date(rows, k="date"):
    return {r[k]: r for r in rows or [] if isinstance(r, dict) and r.get(k)}


def build_entries(feed: Feed, profile: str, days: int = 7, today: date | None = None) -> list[DiaryEntry]:
    """Diary entries for the last `days` days (today included), skipping days with nothing recorded."""
    t = today or date.today()
    habits = feed.data.get("habits") or {}
    hnames = {h["id"]: h["name"] for h in habits.get("list", [])}
    hdays = _by_date(habits.get("days"))
    study = _by_date(feed.data.get("study"))
    mood = _by_date(feed.data.get("mood"))
    upcoming = feed.data.get("upcoming") or []
    journal: dict[str, list[str]] = {}
    for j in feed.data.get("journal") or []:
        if j.get("date"):
            journal.setdefault(j["date"], []).append(j.get("text", ""))
    tasks_due: dict[str, list[dict]] = {}
    for x in feed.data.get("tasks") or []:
        if x.get("due"):
            tasks_due.setdefault(x["due"], []).append(x)

    out: list[DiaryEntry] = []
    for i in range(days):
        d = (t - timedelta(days=i)).isoformat()
        parts, tags, metrics = [], ["my-planner"], {}
        if d in hdays and feed.allowed("habits"):
            h = hdays[d]
            done = [hnames.get(k, k) for k, v in h.get("marks", {}).items() if v == "d"]
            part = [hnames.get(k, k) for k, v in h.get("marks", {}).items() if v == "p"]
            missed = [hnames.get(k, k) for k, v in h.get("marks", {}).items() if v == "m"]
            pct = round((h.get("pct") or 0) * 100)
            s = f"**Habits:** {pct}% of the day's habits."
            if done: s += f" Done: {', '.join(done)}."
            if part: s += f" Partly: {', '.join(part)}."
            if missed: s += f" Missed: {', '.join(missed)}."
            parts.append(s); metrics["habitsPct"] = pct; tags.append("habits")
        if d in study and feed.allowed("study"):
            st = study[d]
            s = f"**Study:** {st.get('hours', 0):.1f} hours"
            if st.get("blocksDone"): s += f", {st['blocksDone']} block(s) completed"
            if st.get("focus"): s += f", focus {st['focus']}/5"
            parts.append(s + "."); metrics["studyHours"] = st.get("hours", 0); tags.append("study")
        if feed.allowed("tasks"):
            due = tasks_due.get(d, [])
            if due:
                done_t = [x["title"] for x in due if x.get("done")]
                open_t = [x["title"] for x in due if not x.get("done")]
                s = "**To-dos due:**"
                if done_t: s += f" finished {', '.join(done_t)}."
                if open_t: s += f" still open: {', '.join(open_t)}."
                parts.append(s); tags.append("tasks")
        if feed.allowed("events"):
            evs = [u for u in upcoming if u.get("date") == d]
            if evs:
                parts.append("**Schedule:** " + "; ".join(f"{u.get('time') or 'all day'} {u['title']}" + (f" ({u['priority']})" if u.get("priority") else "") for u in evs) + ".")
                tags.append("schedule")
        if d in mood and feed.allowed("mood"):
            m = mood[d]
            bits = [f"{lab} {x['w']}" + (f" ({MOOD_SCALE.get(x.get('s'), x.get('s'))})" if x.get("s") else "")
                    for lab, x in (("morning", m.get("am")), ("evening", m.get("pm"))) if x and x.get("w")]
            if m.get("sleep") is not None: bits.append(f"slept {m['sleep']} h")
            if bits:
                parts.append("**Mood:** " + ", ".join(bits) + "."); tags.append("mood")
        if d in journal and feed.allowed("journal"):
            parts.append("**Journal:**\n\n" + "\n\n".join("> " + txt.replace("\n", "\n> ") for txt in journal[d] if txt))
            tags.append("journal")
        if not parts:
            continue
        nice = date.fromisoformat(d).strftime("%a %d %b %Y")
        out.append(DiaryEntry(date=d, profile=profile, title=f"{feed.name} · {nice} · My Planner", body="\n\n".join(parts), tags=tags, metrics=metrics))
    return out


class DiarySink(Protocol):
    def upsert(self, entries: list[DiaryEntry]) -> int: ...


class MarkdownDiarySink:
    def __init__(self, folder: Path | str | None = None):
        self.folder = Path(folder or os.environ.get("BUDDY_DIARY_DIR", Path.home() / ".buddy" / "diary" / "my-planner"))
        self.folder.mkdir(parents=True, exist_ok=True)

    def upsert(self, entries):
        for e in entries:
            p = self.folder / e.profile / f"{e.date}.md"
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(e.markdown(), encoding="utf-8")
        return len(entries)


class SQLiteDiarySink:
    """Writes to a `diary_entries` table (created if missing) in Buddy's SQLite database."""

    def __init__(self, db_path: str):
        self.db = sqlite3.connect(db_path, check_same_thread=False)
        self.db.execute("""create table if not exists diary_entries(
            key text primary key, source text, profile text, date text, title text, body text,
            tags text, metrics text, updated real)""")
        self.db.commit()

    def upsert(self, entries):
        for e in entries:
            self.db.execute("""insert into diary_entries values(?,?,?,?,?,?,?,?,?)
                on conflict(key) do update set title=excluded.title, body=excluded.body, tags=excluded.tags,
                metrics=excluded.metrics, updated=excluded.updated""",
                            (e.key, e.source, e.profile, e.date, e.title, e.body, json.dumps(e.tags), json.dumps(e.metrics), time.time()))
        self.db.commit()
        return len(entries)


class HTTPDiarySink:
    """POSTs each entry to Buddy's diary endpoint, e.g. http://localhost:8000/diary/entries (localhost only by default)."""

    def __init__(self, url: str, token: str | None = None, allow_remote: bool = False):
        from urllib.parse import urlparse
        host = urlparse(url).hostname or ""
        if not allow_remote and host not in ("localhost", "127.0.0.1", "::1"):
            raise ValueError("Diary endpoint must be on this machine unless allow_remote=True (keeps personal data local).")
        self.url, self.token = url, token

    def upsert(self, entries):
        import requests
        h = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        for e in entries:
            r = requests.post(self.url, json=dict(asdict(e), key=e.key), headers=h, timeout=15)
            r.raise_for_status()
        return len(entries)


def sink_from_env() -> DiarySink:
    if os.environ.get("BUDDY_DIARY_URL"):
        return HTTPDiarySink(os.environ["BUDDY_DIARY_URL"], os.environ.get("BUDDY_DIARY_TOKEN"))
    if os.environ.get("BUDDY_DB_PATH"):
        return SQLiteDiarySink(os.environ["BUDDY_DB_PATH"])
    return MarkdownDiarySink()
