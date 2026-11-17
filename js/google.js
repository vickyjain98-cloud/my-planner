/* My Planner — Google sign-in, Drive storage and Calendar.
   Privacy: least-privilege scopes (drive.file = only files this app creates),
   Calendar is asked for only when the person first taps "Send to Calendar",
   the access token lives in memory only and is never written to disk. */
"use strict";
(function () {
  const MP = window.MP;
  const CFG = window.MP_CONFIG || {};
  const BASE = "openid email profile https://www.googleapis.com/auth/drive.file";
  const CAL = "https://www.googleapis.com/auth/calendar.events";
  const G = (MP.G = { user: null, token: null, exp: 0, hasCal: false, folderId: null, files: {}, status: "off" });

  let client = null;
  const ready = () => new Promise((res, rej) => {
    let n = 0;
    const t = setInterval(() => {
      if (window.google && google.accounts && google.accounts.oauth2) { clearInterval(t); res(); }
      else if (++n > 100) { clearInterval(t); rej(new Error("Google sign-in could not load. Check your internet connection.")); }
    }, 100);
  });

  /* Must be called from a tap/click (browsers block pop-ups otherwise). */
  G.authorize = async (extraCal) => {
    if (!CFG.clientId) throw new Error("This copy of My Planner has no Google client ID yet (see the setup guide).");
    await ready();
    return new Promise((res, rej) => {
      const scope = extraCal || G.hasCal ? BASE + " " + CAL : BASE;
      client = google.accounts.oauth2.initTokenClient({
        client_id: CFG.clientId, scope, include_granted_scopes: true,
        callback: (r) => {
          if (r.error) return rej(new Error(r.error_description || r.error));
          G.token = r.access_token;
          G.exp = Date.now() + (Number(r.expires_in || 3600) - 120) * 1000;
          G.hasCal = google.accounts.oauth2.hasGrantedAllScopes(r, CAL);
          res(G.token);
        },
        error_callback: (e) => rej(new Error(e && e.type === "popup_closed" ? "Sign-in window was closed." : "Sign-in was blocked or cancelled."))
      });
      const hint = MP.pref.get("hint");
      client.requestAccessToken(Object.assign({ prompt: "" }, hint ? { login_hint: hint } : {}));
    });
  };
  G.valid = () => !!G.token && Date.now() < G.exp;

  G.signOutToken = () => {
    if (G.token && window.google && google.accounts) { try { google.accounts.oauth2.revoke(G.token, () => {}); } catch (e) {} }
    G.token = null; G.exp = 0; G.user = null; G.folderId = null; G.files = {}; G.status = "off";
  };

  async function api(url, opts = {}) {
    if (!G.valid()) { const e = new Error("reauth"); e.reauth = true; throw e; }
    const r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: "Bearer " + G.token }, opts.headers || {}) }));
    if (r.status === 401) { G.token = null; const e = new Error("reauth"); e.reauth = true; throw e; }
    if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error("Google returned " + r.status + (t ? ": " + t.slice(0, 160) : "")); }
    return r.status === 204 ? null : r;
  }
  G.api = api;

  G.userinfo = async () => {
    const r = await api("https://www.googleapis.com/oauth2/v3/userinfo");
    const u = await r.json();
    G.user = { sub: u.sub, email: String(u.email || "").toLowerCase(), name: u.name || "", picture: u.picture || "" };
    return G.user;
  };

  G.allowed = (email) => {
    const list = (CFG.allowedEmails || []).map((x) => String(x).toLowerCase().trim()).filter(Boolean);
    return !list.length || list.includes(String(email).toLowerCase());
  };

  /* ---------- Drive ---------- */
  const DRV = "https://www.googleapis.com/drive/v3/files";
  const UPL = "https://www.googleapis.com/upload/drive/v3/files";
  const q = (s) => encodeURIComponent(s);

  G.ensureFolder = async () => {
    if (G.folderId) return G.folderId;
    const r = await api(`${DRV}?q=${q("name='My Planner' and mimeType='application/vnd.google-apps.folder' and trashed=false")}&fields=files(id)&spaces=drive`);
    const j = await r.json();
    if (j.files && j.files.length) return (G.folderId = j.files[0].id);
    const c = await api(DRV + "?fields=id", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "My Planner", mimeType: "application/vnd.google-apps.folder", description: "Private data for the My Planner app. Only you can see it unless you share it." }) });
    return (G.folderId = (await c.json()).id);
  };

  G.listFiles = async () => {
    const f = await G.ensureFolder();
    const r = await api(`${DRV}?q=${q(`'${f}' in parents and trashed=false`)}&fields=files(id,name,version,mimeType)&pageSize=200&spaces=drive`);
    const j = await r.json();
    const map = {};
    (j.files || []).forEach((x) => { map[x.name] = x; });
    return map;
  };

  G.download = async (id) => (await api(`${DRV}/${id}?alt=media`)).json();

  G.upload = async (name, obj, id) => {
    const body = JSON.stringify(obj);
    if (id) {
      const r = await api(`${UPL}/${id}?uploadType=media&fields=id,version`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
      return r.json();
    }
    const f = await G.ensureFolder();
    const bnd = "mp" + Math.random().toString(36).slice(2);
    const meta = JSON.stringify({ name, parents: [f], mimeType: "application/json" });
    const r = await api(`${UPL}?uploadType=multipart&fields=id,version`, { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + bnd }, body: `--${bnd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--` });
    return r.json();
  };

  G.deleteFile = (id) => api(`${DRV}/${id}`, { method: "DELETE" });

  /* ---------- Sync engine: data split into parts so ink (handwriting) never slows the main file ---------- */
  G.parts = (S) => {
    const main = {}; Object.keys(S).forEach((k) => { if (k !== "ink") main[k] = S[k]; });
    const p = { "planner.json": main };
    Object.keys(S.ink).forEach((key) => {
      const m = (key.match(/\d{4}-\d{2}/) || ["misc"])[0];
      const n = `ink-${m}.json`;
      (p[n] = p[n] || { v: 1, ink: {} }).ink[key] = S.ink[key];
    });
    return p;
  };

  const pushed = {};     // part name -> hash of last uploaded content
  const versions = {};   // part name -> Drive version last seen
  G.resetSync = () => { Object.keys(pushed).forEach((k) => delete pushed[k]); Object.keys(versions).forEach((k) => delete versions[k]); };

  /* Pull remote changes, merge (newer record wins), then push anything that differs. Returns merged state. */
  G.sync = async (S) => {
    const files = await G.listFiles();
    let merged = S;
    for (const name of Object.keys(files)) {
      if (!/^planner\.json$|^ink-[\w-]+\.json$/.test(name)) continue;
      const f = files[name];
      if (versions[name] === f.version) continue;
      const remote = await G.download(f.id);
      if (name === "planner.json") merged = MP.merge(merged, Object.assign({}, remote, { v: 1, ink: {} }));
      else { const r = MP.blank(); r.ink = (remote && remote.ink) || {}; r.profile.u = -1; merged = MP.merge(merged, r); }
      versions[name] = f.version;
    }
    const parts = G.parts(merged);
    for (const name of Object.keys(parts)) {
      const h = MP.hash(JSON.stringify(parts[name]));
      if (pushed[name] === h) continue;
      const res = await G.upload(name, parts[name], files[name] && files[name].id);
      files[name] = { id: res.id, version: res.version };
      versions[name] = res.version; pushed[name] = h;
    }
    /* Buddy OS bridge (opt-in): publish a structured feed and read suggestions from Buddy's inbox file. */
    const L = merged.profile.links && merged.profile.links.buddy;
    if (L && L.on && MP.buildFeed) {
      const feed = MP.buildFeed(merged);
      const fh = MP.hash(JSON.stringify(feed.data));
      if (pushed["buddy-feed.json"] !== fh) { const r = await G.upload("buddy-feed.json", feed, files["buddy-feed.json"] && files["buddy-feed.json"].id); files["buddy-feed.json"] = r; pushed["buddy-feed.json"] = fh; }
      if (L.inbox && files["buddy-inbox.json"] && versions["buddy-inbox.json"] !== files["buddy-inbox.json"].version) {
        const box = await G.download(files["buddy-inbox.json"].id);
        versions["buddy-inbox.json"] = files["buddy-inbox.json"].version;
        (Array.isArray(box && box.items) ? box.items : []).slice(0, 100).forEach((it) => {
          if (!it || !it.id || merged.inbox[String(it.id).slice(0, 80)]) return;
          const kind = ["task", "event", "reminder", "study", "habit", "affirmation", "note"].includes(it.kind) ? it.kind : "note";
          const hm = (x) => (/^\d{2}:\d{2}$/.test(x || "") ? x : "");
          merged.inbox[String(it.id).slice(0, 80)] = { kind, title: String(it.title || "").slice(0, 160), date: /^\d{4}-\d{2}-\d{2}$/.test(it.date || "") ? it.date : "", time: hm(it.time), end: hm(it.end), priority: ["low", "med", "high", "urgent"].includes(it.priority) ? it.priority : "", why: String(it.why || "").slice(0, 240), status: "pending", u: Date.now() };
        });
        /* Buddy can take back a suggestion the person hasn't decided on yet */
        (Array.isArray(box && box.withdrawn) ? box.withdrawn : []).slice(0, 200).forEach((wid) => { const x = merged.inbox[String(wid).slice(0, 80)]; if (x && x.status === "pending") { x.status = "withdrawn"; x.u = Date.now(); } });
      }
    } else if (files["buddy-feed.json"]) { try { await G.deleteFile(files["buddy-feed.json"].id); } catch (e) {} delete pushed["buddy-feed.json"]; }
    return merged;
  };

  G.deleteEverything = async () => {
    const files = await G.listFiles();
    for (const n of Object.keys(files)) await G.deleteFile(files[n].id);
    if (G.folderId) await G.deleteFile(G.folderId);
    G.folderId = null;
  };

  /* ---------- Calendar (only items the person chooses) ---------- */
  G.ensureCal = async () => { if (!G.hasCal || !G.valid()) await G.authorize(true); if (!G.hasCal) throw new Error("Calendar permission was not given."); };
  G.calInsert = async (ev) => {
    await G.ensureCal();
    const r = await api("https://www.googleapis.com/calendar/v3/calendars/primary/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ev) });
    return (await r.json()).id;
  };
  G.calDelete = async (id) => { await G.ensureCal(); try { await api("https://www.googleapis.com/calendar/v3/calendars/primary/events/" + encodeURIComponent(id), { method: "DELETE" }); } catch (e) { if (!/ 410| 404/.test(e.message)) throw e; } };

  /* ---------- Opt-in family progress summary (a view-only Google Doc, no entries or mood) ---------- */
  G.writeSummaryDoc = async (html, docId, title) => {
    if (docId) {
      try { await api(`${UPL}/${docId}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": "text/html; charset=UTF-8" }, body: html }); return docId; }
      catch (e) { if (e.reauth) throw e; }
    }
    const f = await G.ensureFolder();
    const bnd = "mp" + Math.random().toString(36).slice(2);
    const meta = JSON.stringify({ name: title, parents: [f], mimeType: "application/vnd.google-apps.document" });
    const r = await api(`${UPL}?uploadType=multipart&fields=id`, { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + bnd }, body: `--${bnd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n--${bnd}--` });
    return (await r.json()).id;
  };
  G.shareReader = (fileId, email) => api(`${DRV}/${fileId}/permissions?sendNotificationEmail=true&fields=id`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "user", role: "reader", emailAddress: email }) });
})();
