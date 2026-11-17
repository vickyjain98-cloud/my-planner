"""Google sign-in for Buddy (desktop flow), with the token stored privately on Buddy's machine.

Uses only the drive.file scope. Because My Planner also uses drive.file, Buddy must sign in with an
OAuth client from the SAME Google Cloud project as the app; then it can see the files the app created
(and nothing else in the person's Drive).
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from .config import SCOPES, Settings


def _cipher():
    key = os.environ.get("BUDDY_TOKEN_KEY")  # optional: a Fernet key to encrypt tokens at rest
    if not key:
        return None
    from cryptography.fernet import Fernet  # optional dependency
    return Fernet(key.encode())


def _write_private(path: Path, text: str) -> None:
    c = _cipher()
    data = c.encrypt(text.encode()) if c else text.encode()
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "wb") as f:
        f.write(data)


def _read_private(path: Path) -> str:
    raw = path.read_bytes()
    c = _cipher()
    return c.decrypt(raw).decode() if c else raw.decode()


def load_credentials(settings: Settings):
    """Saved credentials for this profile, refreshed if needed; None if Buddy has not signed in yet."""
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    if not settings.token_path.exists():
        return None
    creds = Credentials.from_authorized_user_info(json.loads(_read_private(settings.token_path)), SCOPES)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        _write_private(settings.token_path, creds.to_json())
    return creds if creds and creds.valid else None


def login(settings: Settings, open_browser: bool = True):
    """One-time sign-in in the browser; stores a refresh token for this profile only."""
    from google_auth_oauthlib.flow import InstalledAppFlow

    if not settings.client_secret or not Path(settings.client_secret).exists():
        raise SystemExit("Set MYPLANNER_CLIENT_SECRET to the Desktop OAuth client JSON (see README, step 2).")
    flow = InstalledAppFlow.from_client_secrets_file(str(settings.client_secret), SCOPES)
    creds = flow.run_local_server(port=0, open_browser=open_browser, prompt="consent", access_type="offline")
    _write_private(settings.token_path, creds.to_json())
    return creds


def logout(settings: Settings) -> bool:
    """Forget this profile's token on Buddy's machine (the person can also revoke at myaccount.google.com/permissions)."""
    if settings.token_path.exists():
        settings.token_path.unlink()
        return True
    return False


def session(settings: Settings):
    """An authorised HTTP session for the Drive API, or None if not signed in."""
    from google.auth.transport.requests import AuthorizedSession

    creds = load_credentials(settings)
    return AuthorizedSession(creds) if creds else None
