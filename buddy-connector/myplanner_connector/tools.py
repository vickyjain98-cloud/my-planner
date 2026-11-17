"""LangGraph / LangChain tools so Buddy's agent can use My Planner.

Read tools return plain text. The one write tool only *proposes*: the person approves in the app
(and, in "buddy" gate mode, in Buddy first).
"""
from __future__ import annotations

from typing import Callable, Optional

from . import insights
from .client import PlannerClient, PlannerNotConnected
from .models import Suggestion


def make_tools(get_client: Callable[[], PlannerClient]):
    from langchain_core.tools import StructuredTool

    import functools

    def _safe(fn):
        @functools.wraps(fn)  # keeps the signature, so the agent sees the real arguments
        def wrapped(*a, **k):
            try:
                return fn(*a, **k)
            except PlannerNotConnected as e:
                return f"My Planner is not connected: {e}"
            except ValueError as e:
                return f"Not sent: {e}"
        return wrapped

    @_safe
    def planner_briefing(days: int = 7) -> str:
        """Summary of the person's planner for the last N days: habits, study, to-dos, upcoming schedule (and mood if shared)."""
        return insights.context_text(get_client().feed(), days=days)

    @_safe
    def planner_upcoming(days: int = 7) -> str:
        """The person's scheduled items (reminders, study, events, tasks with times) for the next N days."""
        f = get_client().feed()
        if not f.allowed("events"):
            return "The person has not shared their schedule with Buddy."
        from datetime import date, timedelta
        end = (date.today() + timedelta(days=days)).isoformat()
        rows = [u for u in f.data.get("upcoming", []) if u["date"] <= end]
        return "\n".join(f"{u['date']} {u.get('time') or 'all day'}{('-' + u['end']) if u.get('end') else ''} · {u['title']} · {u['kind']} · {u.get('priority') or '-'}" for u in rows) or "Nothing scheduled."

    @_safe
    def planner_suggestion_ideas() -> str:
        """Rule-based ideas Buddy could suggest, each with a reason. Does not send anything."""
        c = insights.candidates(get_client().feed())
        return "\n".join(f"- [{s.kind}] {s.title} ({s.date or ''} {s.time or ''}) — {s.why}" for s in c) or "No suggestions right now."

    @_safe
    def planner_propose(kind: str, title: str, why: str, date: Optional[str] = None, time: Optional[str] = None,
                        end: Optional[str] = None, priority: Optional[str] = None) -> str:
        """Propose ONE item to the person's My Planner (kind: task, reminder, study, event, habit, affirmation, note;
        date YYYY-MM-DD; time/end HH:MM; priority low/med/high/urgent; why = one short reason).
        It appears on their Today screen and is added only if they tap Approve."""
        s = Suggestion(kind=kind, title=title, why=why, date=date, time=time, end=end, priority=priority)
        r = get_client().propose([s])
        if r["sent"]:
            return "Sent to the person's planner for approval."
        if r["queued"]:
            return "Queued in Buddy's approval queue; it goes to the planner after you approve it in Buddy."
        return "Already suggested earlier; not sent again."

    @_safe
    def planner_suggestion_status() -> str:
        """What happened to Buddy's earlier suggestions (approved, dismissed, waiting)."""
        rows = get_client().suggestions()[:20]
        return "\n".join(f"{r['status']}: [{r['kind']}] {r['title']}" for r in rows) or "No suggestions yet."

    return [StructuredTool.from_function(f) for f in
            (planner_briefing, planner_upcoming, planner_suggestion_ideas, planner_propose, planner_suggestion_status)]
