"""Where the connector keeps its own small files. Nothing here holds planner data."""
from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

SCOPES = ["https://www.googleapis.com/auth/drive.file"]  # same least-privilege scope as the app
FOLDER_NAME = "My Planner"
FEED_FILE = "buddy-feed.json"
INBOX_FILE = "buddy-inbox.json"
FEED_SCHEMA = "my-planner-feed"
SUPPORTED_SCHEMA = 1
MAX_INBOX = 100  # the app reads at most 100 items


def home() -> Path:
    p = Path(os.environ.get("BUDDY_MYPLANNER_HOME", Path.home() / ".buddy" / "myplanner"))
    p.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(p, 0o700)
    except OSError:
        pass
    return p


def safe_profile(name: str) -> str:
    """Profile names become file names, so keep them plain."""
    n = re.sub(r"[^a-z0-9_-]", "", (name or "default").lower())[:40]
    return n or "default"


@dataclass
class Settings:
    profile: str = "default"
    client_secret: Path | None = None   # Desktop OAuth client JSON from the *same* Google Cloud project as the app
    gate_mode: str = "planner"           # "planner": the app's Approve/Dismiss is the human gate; "buddy": also queue in Buddy first

    @classmethod
    def from_env(cls, profile: str | None = None) -> "Settings":
        cs = os.environ.get("MYPLANNER_CLIENT_SECRET")
        return cls(profile=safe_profile(profile or os.environ.get("MYPLANNER_PROFILE", "default")),
                   client_secret=Path(cs) if cs else None,
                   gate_mode=os.environ.get("MYPLANNER_GATE", "planner"))

    @property
    def token_path(self) -> Path:
        return home() / f"{self.profile}.token"

    @property
    def ledger_path(self) -> Path:
        return home() / f"{self.profile}.db"
