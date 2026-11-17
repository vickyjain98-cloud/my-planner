"""Buddy OS ↔ My Planner connector.

My Planner keeps each person's data in a "My Planner" folder in their own Google Drive.
When the person switches on Settings → Connections → Buddy OS, the app writes
`buddy-feed.json` (only the categories they allow) and reads `buddy-inbox.json`
(suggestions from Buddy, shown on Today with Approve / Dismiss).

This package is Buddy's side of that contract:
    PlannerClient   read the feed, propose suggestions, read the decisions
    insights        rule-based suggestion candidates (Buddy's LLM can refine the wording)
    memory          daily summaries for Buddy's ChromaDB / RAG memory
    tools           LangGraph / LangChain tools
    api             FastAPI router for Buddy's backend
"""
from .client import PlannerClient, PlannerNotConnected
from .models import Feed, Suggestion
from .gate import ApprovalGate, PlannerInboxGate, QueueGate

__all__ = ["PlannerClient", "PlannerNotConnected", "Feed", "Suggestion", "ApprovalGate", "PlannerInboxGate", "QueueGate"]
__version__ = "0.1.0"
