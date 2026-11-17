"""An in-memory stand-in for the Google Drive REST API (only what the connector uses)."""
import json
import re
from urllib.parse import parse_qs, urlparse


class Resp:
    def __init__(self, status, body=None):
        self.status_code = status
        self._b = body
        self.text = "" if body is None else (body if isinstance(body, str) else json.dumps(body))

    def json(self):
        return json.loads(self.text)


class FakeDrive:
    def __init__(self, with_folder=True):
        self.files, self.n, self.calls = {}, 0, []
        if with_folder:
            self.files["fold"] = {"name": "My Planner", "folder": True, "v": 1}

    def put(self, name, obj):
        fid = f"f{len(self.files) + 1}"
        self.files[fid] = {"name": name, "parent": "fold", "body": json.dumps(obj), "v": 1}
        return fid

    def get(self, name):
        for f in self.files.values():
            if f.get("name") == name and not f.get("folder"):
                return json.loads(f["body"])
        return None

    def request(self, method, url, params=None, data=None, headers=None, timeout=None):
        self.calls.append((method, url))
        u, params = urlparse(url), params or {}
        q = params.get("q", "")
        if u.path == "/drive/v3/files" and method == "GET":
            if "name='My Planner'" in q:
                return Resp(200, {"files": [{"id": k, "name": f["name"]} for k, f in self.files.items() if f.get("folder")]})
            par = re.search(r"'([^']+)' in parents", q).group(1)
            return Resp(200, {"files": [{"id": k, "name": f["name"], "version": str(f["v"])} for k, f in self.files.items() if f.get("parent") == par]})
        m = re.match(r"^/drive/v3/files/([^/]+)$", u.path)
        if m and method == "GET":
            f = self.files.get(m.group(1))
            return Resp(200, f["body"]) if f else Resp(404, "nf")
        if u.path == "/upload/drive/v3/files" and method == "POST":
            b = data.decode()
            meta = json.loads(b.split("\r\n\r\n")[1].split("\r\n")[0])
            body = b.split("\r\n\r\n")[2].rsplit("\r\n--", 1)[0]
            fid = f"n{len(self.files) + 1}"
            self.files[fid] = {"name": meta["name"], "parent": meta["parents"][0], "body": body, "v": 1}
            return Resp(200, {"id": fid, "version": "1"})
        m = re.match(r"^/upload/drive/v3/files/([^/]+)$", u.path)
        if m and method == "PATCH":
            f = self.files[m.group(1)]
            f["body"], f["v"] = data.decode(), f["v"] + 1
            return Resp(200, {"id": m.group(1), "version": str(f["v"])})
        return Resp(404, "nf")
