"""Minimal Google Drive v3 access to the "My Planner" folder (no googleapiclient needed)."""
from __future__ import annotations

import json
import uuid
from typing import Any

from .config import FOLDER_NAME

API = "https://www.googleapis.com/drive/v3"
UPLOAD = "https://www.googleapis.com/upload/drive/v3"
FOLDER_MIME = "application/vnd.google-apps.folder"


class DriveError(RuntimeError):
    pass


class PlannerDrive:
    """Reads and writes small JSON files in the person's My Planner folder.

    `http` is any object with a requests-style `.request(method, url, **kw)` returning a response with
    `.status_code`, `.json()`, `.text` — google.auth's AuthorizedSession in production, a fake in tests.
    """

    def __init__(self, http):
        self.http = http
        self._folder: str | None = None

    def _call(self, method: str, url: str, **kw) -> Any:
        r = self.http.request(method, url, timeout=30, **kw)
        if r.status_code == 404:
            return None
        if r.status_code >= 400:
            raise DriveError(f"Drive {method} {url.split('?')[0]} → {r.status_code}: {r.text[:200]}")
        if r.status_code == 204 or not r.text:
            return {}
        return r.json()

    def folder_id(self) -> str | None:
        if self._folder:
            return self._folder
        q = f"name='{FOLDER_NAME}' and mimeType='{FOLDER_MIME}' and trashed=false"
        res = self._call("GET", f"{API}/files", params={"q": q, "fields": "files(id,name)", "spaces": "drive"}) or {}
        files = res.get("files") or []
        self._folder = files[0]["id"] if files else None
        return self._folder

    def files(self) -> dict[str, dict]:
        fid = self.folder_id()
        if not fid:
            return {}
        res = self._call("GET", f"{API}/files", params={"q": f"'{fid}' in parents and trashed=false",
                                                         "fields": "files(id,name,version,modifiedTime)", "pageSize": 200}) or {}
        return {f["name"]: f for f in res.get("files", [])}

    def read_json(self, name: str) -> tuple[Any, dict | None]:
        meta = self.files().get(name)
        if not meta:
            return None, None
        data = self._call("GET", f"{API}/files/{meta['id']}", params={"alt": "media"})
        if isinstance(data, (dict, list)):
            return data, meta
        return None, meta

    def write_json(self, name: str, obj: Any) -> dict:
        """Create or replace a JSON file in the My Planner folder."""
        fid = self.folder_id()
        if not fid:
            raise DriveError("No 'My Planner' folder visible. Open My Planner and sync once, and sign Buddy in with an OAuth client from the same Google Cloud project.")
        body = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
        meta = self.files().get(name)
        if meta:
            return self._call("PATCH", f"{UPLOAD}/files/{meta['id']}", params={"uploadType": "media", "fields": "id,version"},
                              data=body.encode(), headers={"Content-Type": "application/json"})
        boundary = "mp" + uuid.uuid4().hex
        payload = (f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                   + json.dumps({"name": name, "parents": [fid], "mimeType": "application/json"})
                   + f"\r\n--{boundary}\r\nContent-Type: application/json\r\n\r\n{body}\r\n--{boundary}--")
        return self._call("POST", f"{UPLOAD}/files", params={"uploadType": "multipart", "fields": "id,version"},
                          data=payload.encode(), headers={"Content-Type": f"multipart/related; boundary={boundary}"})
