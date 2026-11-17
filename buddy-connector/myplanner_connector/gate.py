"""Buddy's human approval gate, applied to suggestions for My Planner.

Writing a suggestion into the planner's inbox changes nothing by itself: the person still has to tap
Approve in the app before anything is added. Two modes:

* PlannerInboxGate ("planner", default) — the app's Approve / Dismiss *is* the human gate.
* QueueGate ("buddy") — suggestions wait in Buddy's own approval queue first; only approved ones are
  written to the planner inbox. Use this if Buddy's policy is that every outbound write needs approval.
"""
from __future__ import annotations

from typing import Protocol

from .models import Suggestion


class ApprovalGate(Protocol):
    def submit(self, s: Suggestion) -> str: ...          # returns "send" or "queued"
    def approved(self) -> list[Suggestion]: ...          # queued items now approved, ready to send
    def mark_sent(self, ids: list[str]) -> None: ...


class PlannerInboxGate:
    mode = "planner"

    def submit(self, s: Suggestion) -> str:
        return "send"

    def approved(self) -> list[Suggestion]:
        return []

    def mark_sent(self, ids: list[str]) -> None:
        pass


class QueueGate:
    """Keeps pending suggestions in the connector's ledger until someone approves them in Buddy."""
    mode = "buddy"

    def __init__(self, ledger):
        self.ledger = ledger

    def submit(self, s: Suggestion) -> str:
        self.ledger.record(s, status="awaiting-buddy-approval")
        return "queued"

    def approve(self, sid: str) -> bool:
        return self.ledger.set_status(sid, "approved-in-buddy", only_from="awaiting-buddy-approval")

    def reject(self, sid: str) -> bool:
        return self.ledger.set_status(sid, "rejected-in-buddy", only_from="awaiting-buddy-approval")

    def approved(self) -> list[Suggestion]:
        return self.ledger.by_status("approved-in-buddy")

    def mark_sent(self, ids: list[str]) -> None:
        for i in ids:
            self.ledger.set_status(i, "sent")
