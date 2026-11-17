"""A small local record (SQLite) of what Buddy proposed and what the person decided.

Holds only suggestion text Buddy itself wrote, plus statuses; never a copy of the planner.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from pathlib import Path

from .models import Suggestion


class Ledger:
    def __init__(self, path: Path | str):
        self.path = str(path)
        new = self.path != ":memory:" and not Path(self.path).exists()
        self.db = sqlite3.connect(self.path, check_same_thread=False)
        self.db.execute("""create table if not exists suggestions(
            id text primary key, body text not null, status text not null, created real not null, updated real not null)""")
        self.db.commit()
        if new:
            try:
                os.chmod(self.path, 0o600)
            except OSError:
                pass

    def record(self, s: Suggestion, status: str) -> None:
        now = time.time()
        self.db.execute("insert into suggestions(id, body, status, created, updated) values(?,?,?,?,?) "
                        "on conflict(id) do update set body=excluded.body, status=excluded.status, updated=excluded.updated",
                        (s.id, s.model_dump_json(), status, now, now))
        self.db.commit()

    def has(self, sid: str) -> bool:
        return self.db.execute("select 1 from suggestions where id=?", (sid,)).fetchone() is not None

    def set_status(self, sid: str, status: str, only_from: str | None = None) -> bool:
        q, args = "update suggestions set status=?, updated=? where id=?", [status, time.time(), sid]
        if only_from:
            q += " and status=?"
            args.append(only_from)
        cur = self.db.execute(q, args)
        self.db.commit()
        return cur.rowcount > 0

    def by_status(self, status: str) -> list[Suggestion]:
        rows = self.db.execute("select body from suggestions where status=? order by created", (status,)).fetchall()
        return [Suggestion.model_validate_json(r[0]) for r in rows]

    def all(self) -> list[dict]:
        rows = self.db.execute("select body, status, created, updated from suggestions order by created desc").fetchall()
        return [dict(json.loads(b), status=st, created=c, updated=u) for b, st, c, u in rows]
