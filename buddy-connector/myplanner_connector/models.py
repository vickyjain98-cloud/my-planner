"""The data contract between My Planner (schemaVersion 1) and Buddy OS."""
from __future__ import annotations

import hashlib
import re
from datetime import date as _date
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

Kind = Literal["task", "event", "reminder", "study", "habit", "affirmation", "note"]
Priority = Literal["low", "med", "high", "urgent"]
_HM = re.compile(r"^\d{2}:\d{2}$")


class Suggestion(BaseModel):
    """One item Buddy proposes. It appears on the person's Today screen with Approve / Dismiss.

    Limits mirror what the app accepts, so nothing is silently cut off.
    """
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="", max_length=80)
    kind: Kind
    title: str = Field(min_length=1, max_length=160)
    date: Optional[str] = None
    time: Optional[str] = None
    end: Optional[str] = None
    priority: Optional[Priority] = None
    why: str = Field(default="", max_length=240)

    @field_validator("date")
    @classmethod
    def _d(cls, v):
        if v in (None, ""):
            return None
        _date.fromisoformat(v)
        return v

    @field_validator("time", "end")
    @classmethod
    def _t(cls, v):
        if v in (None, ""):
            return None
        if not _HM.match(v) or not (0 <= int(v[:2]) < 24 and 0 <= int(v[3:]) < 60):
            raise ValueError("use HH:MM, 24-hour")
        return v

    @field_validator("title", "why")
    @classmethod
    def _plain(cls, v):
        return " ".join(str(v).split())  # one line of plain text; the app also escapes it

    def with_id(self) -> "Suggestion":
        """A stable id from the content, so the same idea is never proposed twice."""
        if self.id:
            return self
        key = "|".join([self.kind, self.title.lower(), self.date or "", self.time or ""])
        return self.model_copy(update={"id": "buddy-" + hashlib.sha1(key.encode()).hexdigest()[:16]})

    def to_inbox(self) -> dict:
        d = {k: v for k, v in self.model_dump().items() if v not in (None, "")}
        return d


class Feed(BaseModel):
    """`buddy-feed.json`, written by the app on every sync while Buddy is connected."""
    model_config = ConfigDict(extra="allow")
    schema_: str = Field(alias="schema")
    schemaVersion: int
    appVersion: Optional[str] = None
    timeZone: Optional[str] = None
    generatedAt: str
    categories: list[str] = []
    data: dict[str, Any] = {}

    def allowed(self, cat: str) -> bool:
        return cat in self.categories

    @property
    def name(self) -> str:
        return self.data.get("name") or "you"

    @property
    def decisions(self) -> dict[str, str]:
        return {d["id"]: d["status"] for d in self.data.get("inboxDecisions", []) if isinstance(d, dict) and "id" in d}
