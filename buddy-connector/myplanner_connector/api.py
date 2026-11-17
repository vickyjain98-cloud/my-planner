"""FastAPI router for Buddy's backend: mount with app.include_router(make_router(get_client), prefix="/planner")."""
from __future__ import annotations

from typing import Callable

from . import insights, pipeline
from .client import PlannerClient, PlannerNotConnected
from .diary import DiarySink, build_entries
from .models import Suggestion


def make_router(get_client: Callable[[str], PlannerClient], get_sink: Callable[[], DiarySink] | None = None,
                get_collection: Callable[[], object] | None = None):
    from fastapi import APIRouter, HTTPException

    r = APIRouter(tags=["my-planner"])

    def client(profile: str) -> PlannerClient:
        try:
            return get_client(profile)
        except PlannerNotConnected as e:
            raise HTTPException(409, str(e))

    def feed(profile: str):
        try:
            return client(profile).feed()
        except PlannerNotConnected as e:
            raise HTTPException(409, str(e))

    @r.get("/{profile}/status")
    def status(profile: str):
        return client(profile).status()

    @r.get("/{profile}/briefing")
    def briefing(profile: str, days: int = 7):
        return {"text": insights.context_text(feed(profile), days=days)}

    @r.get("/{profile}/upcoming")
    def upcoming(profile: str):
        f = feed(profile)
        return f.data.get("upcoming", []) if f.allowed("events") else []

    @r.get("/{profile}/diary")
    def diary(profile: str, days: int = 7):
        return [e.__dict__ | {"key": e.key} for e in build_entries(feed(profile), profile, days=days)]

    @r.get("/{profile}/insights")
    def ideas(profile: str):
        return [s.model_dump(exclude_none=True) for s in insights.candidates(feed(profile))]

    @r.get("/{profile}/suggestions")
    def list_suggestions(profile: str):
        c = client(profile)
        try:
            c.feed()  # refresh decisions
        except PlannerNotConnected:
            pass
        return c.suggestions()

    @r.post("/{profile}/suggestions")
    def propose(profile: str, items: list[Suggestion]):
        try:
            return client(profile).propose(items)
        except ValueError as e:
            raise HTTPException(422, str(e))

    @r.delete("/{profile}/suggestions/{sid}")
    def withdraw(profile: str, sid: str):
        if not client(profile).withdraw(sid):
            raise HTTPException(404, "Not found, or the person already decided on it.")
        return {"withdrawn": sid}

    @r.post("/{profile}/run")
    def run(profile: str, propose: bool = False, days: int = 7):
        try:
            return pipeline.run(client(profile), profile, sink=get_sink() if get_sink else None,
                                collection=get_collection() if get_collection else None, days=days, propose=propose)
        except PlannerNotConnected as e:
            raise HTTPException(409, str(e))

    return r
