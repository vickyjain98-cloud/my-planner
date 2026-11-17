"""One job that ties My Planner into the rest of Buddy: Diary → Memory → Insights.

Run it on Buddy's scheduler (e.g. every evening and on start-up) or from the CLI / API.
Proposing suggestions is off unless asked, and always goes through the approval gate.
"""
from __future__ import annotations

from datetime import date

from . import insights as _insights
from .client import PlannerClient
from .diary import DiarySink, build_entries
from .memory import index_entries


def run(client: PlannerClient, profile: str, sink: DiarySink | None = None, collection=None,
        days: int = 7, propose: bool = False, today: date | None = None) -> dict:
    feed = client.feed()
    entries = build_entries(feed, profile, days=days, today=today)
    out = {"profile": profile, "name": feed.name, "categories": feed.categories, "diary": 0, "memory": 0, "candidates": [], "proposed": None}
    if sink is not None:
        out["diary"] = sink.upsert(entries)
    if collection is not None:
        out["memory"] = index_entries(collection, entries)
    cands = _insights.candidates(feed, today=today)
    out["candidates"] = [c.model_dump(exclude_none=True) for c in cands]
    if propose and cands:
        out["proposed"] = client.propose(cands)
    return out
