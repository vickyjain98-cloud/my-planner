/* My Planner — core: utilities, state, local cache, merge. No network code here. */
"use strict";
(function () {
  const MP = (window.MP = window.MP || {});

  /* ---------- utilities ---------- */
  const pad2 = (n) => String(n).padStart(2, "0");
  MP.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  MP.iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  MP.parseISO = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  MP.today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  MP.nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  MP.addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  MP.fmt = (d, o) => d.toLocaleDateString("en-IN", o);
  MP.tMin = (t) => (t ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : null);
  MP.fmtT = (t) => { if (!t) return ""; let h = +t.slice(0, 2); const m = t.slice(3, 5); const ap = h < 12 ? "am" : "pm"; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
  MP.minToT = (m) => `${pad2(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad2(((m % 60) + 60) % 60)}`;
  MP.secOf = (t) => { const h = +String(t || "00").slice(0, 2); return h < 12 ? "m" : h < 17 ? "a" : "e"; };
  MP.uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  MP.monday = (d) => MP.addD(d, -((d.getDay() + 6) % 7));
  MP.hash = (str) => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };

  /* ---------- state ---------- */
  MP.MAPS = ["days", "tasks", "events", "dates", "weeks", "ink", "typed", "sent", "inbox"];
  MP.blank = () => ({
    v: 1,
    profile: {
      u: 0, name: "", theme: "sage", todayView: "overview", printView: "detailed", alerts: 10,
      collections: { classic: true, secret: true, love: true, study: true }, fav: [], mine: [],
      timetable: [], weekend: null, habits: [],
      practice: { text: "", start: "", len: 33 },
      share: { on: false, emails: [], docId: "", last: "" },
      links: { buddy: { on: false, cats: { habits: true, study: true, tasks: true, events: true, mood: false, journal: false }, inbox: true } },
      sound: { auto: true, type: "brown", vol: 0.5, breakStop: true, playlist: "" },
      setupDone: false
    },
    days: {}, tasks: {}, events: {}, dates: {}, weeks: {}, ink: {}, typed: {}, sent: {}, inbox: {}
  });

  /* Validate a loaded or restored object so a damaged file can never break the app. */
  MP.sanitize = (o) => {
    const b = MP.blank();
    if (!o || typeof o !== "object" || o.v !== 1) return b;
    const out = { v: 1, profile: Object.assign(b.profile, typeof o.profile === "object" && o.profile ? o.profile : {}) };
    for (const k of MP.MAPS) out[k] = o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) ? o[k] : {};
    if (!Array.isArray(out.profile.timetable)) out.profile.timetable = [];
    if (!Array.isArray(out.profile.habits)) out.profile.habits = [];
    if (!Array.isArray(out.profile.mine)) out.profile.mine = [];
    if (!Array.isArray(out.profile.fav)) out.profile.fav = [];
    if (out.profile.setupDone && !out.profile.seenVersion) out.profile.seenVersion = "1.2"; /* people who set up before version tracking see the 1.3 note once */
    return out;
  };

  /* Record-level merge: for every record the newer `u` (updated-at) wins; tombstones keep deletions. */
  MP.merge = (a, b) => {
    a = MP.sanitize(a); b = MP.sanitize(b);
    const out = { v: 1, profile: (b.profile.u || 0) > (a.profile.u || 0) ? b.profile : a.profile };
    for (const k of MP.MAPS) {
      const m = {};
      const keys = new Set([...Object.keys(a[k]), ...Object.keys(b[k])]);
      keys.forEach((key) => {
        const x = a[k][key], y = b[k][key];
        m[key] = !x ? y : !y ? x : (y.u || 0) > (x.u || 0) ? y : x;
      });
      out[k] = m;
    }
    return out;
  };

  /* ---------- Integration layer (for Buddy OS and future apps) ----------
     MP.bus: in-app events other modules can listen to (no data leaves the app through it).
     MP.connectors: registry of connections; each declares the data categories it may read,
     and every action that changes something outside the app needs the person's approval. */
  const handlers = {};
  MP.bus = {
    on: (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); return () => { handlers[ev] = handlers[ev].filter((f) => f !== fn); }; },
    emit: (ev, data) => { [...(handlers[ev] || []), ...(handlers["*"] || [])].forEach((f) => { try { f(ev, data); } catch (e) { console.warn("bus", e); } }); }
  };
  MP.connectors = {};
  MP.registerConnector = (c) => { if (c && c.id) MP.connectors[c.id] = c; };
  MP.SCHEMA_VERSION = 1;

  /* ---------- IndexedDB cache (this device only) ---------- */
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    if (!("indexedDB" in window)) return rej(new Error("no idb"));
    const r = indexedDB.open("my-planner", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction("kv", mode); const s = t.objectStore("kv"); const r = fn(s); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }); };
  MP.idbGet = (k) => tx("readonly", (s) => s.get(k)).catch(() => null);
  MP.idbSet = (k, v) => tx("readwrite", (s) => s.put(v, k)).catch(() => null);
  MP.idbDel = (k) => tx("readwrite", (s) => s.delete(k)).catch(() => null);
  MP.idbClearAll = () => tx("readwrite", (s) => s.clear()).catch(() => null);

  /* Small, non-sensitive device preferences only (theme for the splash, last account hint). */
  MP.pref = {
    get: (k) => { try { return localStorage.getItem("mp-" + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem("mp-" + k, v); } catch (e) {} },
    del: (k) => { try { localStorage.removeItem("mp-" + k); } catch (e) {} }
  };
})();
