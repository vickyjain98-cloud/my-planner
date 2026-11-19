/* My Planner — screens, events and start-up. All user text is escaped before display. */
"use strict";
(function () {
  const MP = window.MP, D = window.MP_DATA, G = MP.G, CFG = window.MP_CONFIG || {};
  const { esc: E, iso, parseISO, today, nowMin, addD, fmt, tMin, fmtT, minToT, secOf, uid, monday } = MP;
  const TZ = (Intl.DateTimeFormat().resolvedOptions().timeZone) || "Asia/Kolkata";

  /* ---------- icons ---------- */
  const ICON = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    timetable: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', habits: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    dash: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', study: '<path d="M3 6l9-3 9 3-9 3z"/><path d="M7 8v5c0 2 2.5 3 5 3s5-1 5-3V8"/>',
    planner: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    todo: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
    affirm: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>', three: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    mood: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/><circle cx="9" cy="10" r=".8"/><circle cx="15" cy="10" r=".8"/>',
    dates: '<path d="M4 11h16v9H4z"/><path d="M3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>', print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    prefs: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/>', redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h2"/>',
    eraser: '<path d="M7 21h10M5.5 14.5l7-7 5 5-7 7H8z"/><path d="M12.5 7.5l2-2 5 5-2 2"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', kbd: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/>',
    penm: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    journal: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5V14"/><circle cx="12" cy="17" r=".8"/>',
    ideas: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  MP.ic = (k, s = 20) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[k] || ""}</svg>`;
  const ic = MP.ic;

  const SCREENS = [["today", "Today"], ["timetable", "Timetable"], ["habits", "Habits"], ["dash", "Habit Dashboard"], ["study", "Activity"], ["planner", "Planner"], ["todo", "To-Do"], ["affirm", "Affirmations"], ["journal", "Journal"], ["diary", "Diary"], ["three", "3-6-9"], ["mood", "Mood & Wellness"], ["dates", "Special Dates"], ["history", "History & Search"], ["print", "Print"], ["prefs", "Settings"], ["ideas", "Suggestions"], ["help", "Help & Guide"], ["review", "Weekly review"]];
  const THEMES = [["sage", "Sage Botanical"], ["lavender", "Lavender Dream"], ["beige", "Beige Minimal"], ["blush", "Blush Floral"], ["midnight", "Midnight Moon"], ["ocean", "Ocean Calm"]];
  /* Choose your menu (1.11): hidden screens keep all their data. People who set up before 1.11 keep the full menu. */
  ICON.review = ICON.dash;
  ICON.diary = '<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M9 7h7M9 11h5"/><path d="M19 7h2M19 11h2M19 15h2"/>';
  const MENU_SIMPLE = ["today", "planner", "todo", "study", "habits", "journal", "diary", "prefs", "help"];
  const shownScreen = (r) => { const m = P().menu; return r === "today" || r === "prefs" || !m || !m.hide || !m.hide[r]; };
  const menuSimple = () => ({ preset: "simple", hide: Object.fromEntries(SCREENS.filter((x) => !MENU_SIMPLE.includes(x[0])).map((x) => [x[0], true])) });
  const TYPES = ["Activity", "Fixed", "Break", "Rest", "Planning", "Morning", "Free"]; /* stored type "Study" = Activity → Study (kept so older data and devices still work) */
  const TCOL = { Study: "var(--acc)", Fixed: "var(--acc2)", Break: "#CFE0D3", Rest: "#D3E3EA", Planning: "#F1DFAE", Morning: "#F4D3BB", Free: "#E1D7EF" };
  const MOODCOL = { calm: "#8FB6A3", happy: "#F2C66D", focused: "#7C9CC9", grateful: "#C99BC7", anxious: "#E59B7E", tired: "#B8B2A7", low: "#7E7FA8", irritable: "#D9776F" };
  const MOODVAL = { happy: 1, grateful: 0.9, calm: 0.85, focused: 0.8, tired: 0.45, irritable: 0.35, anxious: 0.3, low: 0.2 };

  let route = "today";
  const view = { dash: "week", plan: "month", pm: null, todo: "matrix", hist: null, tdv: "135", tt: "wd", q: "" };
  let mode = "signin"; // signin | demo | google

  /* ---------- state access ---------- */
  MP.S = MP.blank();
  const P = () => MP.S.profile;
  const touchP = () => { P().u = Date.now(); MP.changed(); };
  const dayRec = (k) => MP.S.days[k] || (MP.S.days[k] = { u: 0 });
  const touchDay = (k) => { dayRec(k).u = Date.now(); MP.changed(); MP.bus.emit("day.updated", { date: k }); };
  const live = (m) => Object.entries(MP.S[m]).filter(([, v]) => v && !v.del);
  const putRec = (m, id, obj) => { MP.S[m][id] = Object.assign({}, obj, { u: Date.now() }); MP.changed(); MP.bus.emit(m + ".saved", { id }); };
  const delRec = (m, id) => { MP.S[m][id] = { del: 1, u: Date.now() }; MP.changed(); MP.bus.emit(m + ".deleted", { id }); };

  const ttFor = (d) => { const we = d.getDay() === 0 || d.getDay() === 6; const rows = we && Array.isArray(P().weekend) ? P().weekend : P().timetable; const o = ((MP.S.days[iso(d)] || {}).tto) || {};
    /* 1.14: a block changed for "This occurrence" only is stored on that date (days[k].tto) and marked changed */
    return rows.map((r) => (o[r.id] ? (o[r.id].del ? null : Object.assign({}, r, o[r.id], { chg: true })) : r)).filter(Boolean).sort((a, b) => (a.start || "").localeCompare(b.start || "")); };
  const studyRows = (d) => ttFor(d).filter((r) => r.type === "Study");
  /* ---------- Activities (1.12) ---------- */
  const isAct = (r) => r.type === "Study" || r.type === "Activity";
  const actOf = (r) => (r.type === "Study" ? "Study" : r.act || "Other");
  const DEF_ACTS = ["Study", "Work", "Meditation", "Reading", "Exercise"];
  const acts = () => (Array.isArray(P().acts) ? P().acts : DEF_ACTS.map((n) => ({ name: n })));
  const ensureActs = () => { if (!Array.isArray(P().acts)) P().acts = DEF_ACTS.map((n) => ({ name: n })); return P().acts; };
  const actNames = () => { const out = acts().map((a) => a.name); [...P().timetable, ...(Array.isArray(P().weekend) ? P().weekend : [])].forEach((r) => { if (isAct(r) && !out.includes(actOf(r))) out.push(actOf(r)); }); return out; };
  const actRows = (d, name) => ttFor(d).filter((r) => isAct(r) && (!name || actOf(r) === name));
  const actMins = (d, name) => { const rec = MP.S.days[iso(d)], rows = actRows(d, name); return { plan: rows.reduce((s, r) => s + rowLen(r), 0), done: rec && rec.study ? rows.reduce((s, r) => s + (rec.study[r.id] ? rowLen(r) : 0), 0) : 0 }; };
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) : ""}` : `${m} min`);
  const actHabit = (name) => { const a = acts().find((x) => x.name === name), hs = P().habits.filter((h) => h.active !== false); if (a && a.hab) return hs.find((h) => h.id === a.hab); return hs.find((h) => h.name.trim().toLowerCase() === name.toLowerCase()); };
  /* Marking a block done also ticks the habit linked to that activity (Settings → Activities). */
  function blockDone(k, rowId, on) {
    const r = dayRec(k); r.study = r.study || {}; r.study[rowId] = on;
    if (on) { const row = ttFor(parseISO(k)).find((x) => x.id === rowId), h = row && actHabit(actOf(row)); if (h) { r.h = r.h || {}; if (r.h[h.id] !== "d") { r.h[h.id] = "d"; MP.toast(h.name + " ticked in Habits"); } } }
    touchDay(k);
  }
  const rowLen = (r) => { const a = tMin(r.start), b = tMin(r.end); return a == null || b == null ? 0 : (b - a + 1440) % 1440; };
  const studyHours = (d) => { const rec = MP.S.days[iso(d)]; if (!rec || !rec.study) return 0; return studyRows(d).reduce((s, r) => s + (rec.study[r.id] ? rowLen(r) : 0), 0) / 60; };
  const activeHabits = () => P().habits.filter((h) => h.active !== false);
  /* Flexible habits (1.12): h.freq = undefined/{k:"daily"} | {k:"days",days:[0-6]} | {k:"week",n} | {k:"count",n,unit}.
     Habits without freq stay "every day", exactly as before. Weekly habits are tracked by the week, not in the daily score. */
  const dueOn = (h, d) => { const f = h.freq; if (!f || f.k === "daily" || f.k === "count") return true; if (f.k === "days") return (f.days || []).includes(d.getDay()); return false; };
  const weekDone = (h, d) => { const m = monday(d); let n = 0; for (let i = 0; i < 7; i++) { const v = ((MP.S.days[iso(addD(m, i))] || {}).h || {})[h.id]; n += v === "d" ? 1 : v === "p" ? 0.5 : 0; } return n; };
  const freqText = (h) => { const f = h.freq; if (!f || f.k === "daily") return "Every day"; if (f.k === "days") return (f.days || []).map((x) => WDN[x]).join(" "); if (f.k === "week") return f.n + "× a week"; return f.n + (f.unit ? " " + f.unit : "") + " a day"; };
  const dayPct = (d) => { const rec = MP.S.days[iso(d)], hs = activeHabits().filter((h) => dueOn(h, d)); if (!rec || !rec.h || !hs.length) return null; const vals = hs.map((h) => rec.h[h.id]).filter(Boolean); if (!vals.length) return null; return hs.reduce((s, h) => s + (rec.h[h.id] === "d" ? 1 : rec.h[h.id] === "p" ? 0.5 : 0), 0) / hs.length; };
  const streak = () => { let n = 0; const t = today(); for (let i = 0; i < 800; i++) { const dd = addD(t, -i); if (activeHabits().length && !activeHabits().some((h) => dueOn(h, dd))) continue; /* rest day: nothing due, streak carries on */ const p = dayPct(dd); if (i === 0 && (p === null || p < 0.7)) continue; if (p !== null && p >= 0.7) n++; else break; } return n; };
  const bestStreak = () => { const keys = Object.keys(MP.S.days).sort(); let best = 0, cur = 0, prev = null; keys.forEach((k) => { const d = parseISO(k); const p = dayPct(d); const cont = prev && (d - prev) / 864e5 === 1; if (p !== null && p >= 0.7) { cur = cont ? cur + 1 : 1; best = Math.max(best, cur); } else cur = 0; prev = d; }); return best; };
  const moonOf = (d) => D.moons[iso(d)] || "";
  const moonName = (k) => (k === "P" ? "Purnima" : k === "A" ? "Amavasya" : "");
  const portalOf = (d) => D.portals[d.getMonth() + 1 + "-" + d.getDate()] || "";
  const nextMoon = () => { const t = today(); for (let i = 0; i < 40; i++) { const d = addD(t, i); const m = moonOf(d); if (m) return { d, m: moonName(m), i }; } return null; };
  const moodOf = (d) => { const r = MP.S.days[iso(d)]; const m = r && r.mood; return m ? (m.pm || m.am || {}).w || "" : ""; };
  const tasks = () => live("tasks").map(([id, t]) => Object.assign({ id }, t));
  /* ---------- To-Do (1.11): one list; priority is worked out from Urgent + Important ----------
     Old tasks keep every field they had: their date is read from their old due date and the
     1-3-5 size (b) is kept, only no longer shown. Nothing is rewritten until the person edits a task. */
  const TPRI = [["Do it now", "pri-urg", "urgent"], ["Plan for later", "pri-med", "med"], ["Assign someone", "pri-high", "high"], ["Ignore", "pri-low", "low"]];
  const tPri = (t) => (t.urg && t.imp ? 0 : t.imp ? 1 : t.urg ? 2 : 3);
  const tDay = (t) => (t.inbox ? "" : t.d || t.due || "");
  const dayOf = (ms) => iso(new Date(ms));
  const tLate = (t) => { const d = tDay(t), k = iso(today()); return !t.done && d && d < k ? Math.round((parseISO(k) - parseISO(d)) / 864e5) : 0; };
  const tCreated = (t) => (t.c > 1.5e12 ? dayOf(t.c) : tDay(t));
  const tByPri = (a, b) => tPri(a) - tPri(b) || (a.due || "9").localeCompare(b.due || "9") || (a.c || 0) - (b.c || 0);
  const taskGroups = () => {
    const k = iso(today()), T = tasks(), doneToday = (t) => t.done && t.doneAt && dayOf(t.doneAt) === k;
    return {
      overdue: T.filter((t) => tLate(t) > 0).sort((a, b) => tPri(a) - tPri(b) || tLate(b) - tLate(a)),
      today: [...T.filter((t) => !t.done && tDay(t) === k).sort(tByPri), ...T.filter(doneToday).sort((a, b) => a.doneAt - b.doneAt)],
      upcoming: T.filter((t) => !t.done && tDay(t) > k).sort((a, b) => tDay(a).localeCompare(tDay(b)) || tByPri(a, b)),
      inbox: T.filter((t) => !t.done && !tDay(t)).sort(tByPri),
      done: T.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))
    };
  };

  function dailyAff(d) {
    const w = moodOf(d), p = portalOf(d), mo = moonOf(d), n = Math.floor(d.getTime() / 864e5);
    if (w === "anxious" || w === "low") { const it = D.aff.calm.items; return { text: it[n % it.length][0], src: "Calm · because you logged " + w }; }
    if (p) return { text: D.special.portal, src: p + " · intention" };
    if (mo) { const arr = D.special[mo]; return { text: arr[n % arr.length], src: moonName(mo) + (mo === "P" ? " · release & gratitude" : " · set intentions") }; }
    const pool = [];
    Object.keys(P().collections).forEach((k) => { if (P().collections[k] && D.aff[k]) D.aff[k].items.forEach((x) => pool.push([x[0], x[1] || D.aff[k].name])); });
    P().mine.forEach((x) => pool.push([x, "My lines"]));
    const x = pool[n % (pool.length || 1)] || ["I am enough.", "Self-love"];
    return { text: x[0], src: x[1] };
  }

  /* ---------- UI helpers ---------- */
  MP.toast = (m) => { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(MP.toast.h); MP.toast.h = setTimeout(() => t.classList.remove("on"), 3200); };
  const modal = (html) => { const m = document.getElementById("modal"); m.querySelector(".in").innerHTML = html; m.classList.add("on"); const f = m.querySelector("input,select,button"); if (f) f.focus(); };
  const closeModal = () => document.getElementById("modal").classList.remove("on");
  MP.modal = modal; MP.closeModal = closeModal;
  const head = (lab, title, extra = "") => `<div class="between hdr"><div><div class="lab">${lab}</div><h1 class="title">${title}</h1></div>${extra}</div>`;
  const ring = (p, size = 120, stroke = 12, label = "") => { const r = (size - stroke) / 2, c = 2 * Math.PI * r; p = Math.max(0, Math.min(1, p || 0)); return `<svg role="img" aria-label="${Math.round(p * 100)}%" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--soft)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--acc)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="${label ? 47 : 53}%" text-anchor="middle" style="font-family:var(--disp)" font-size="${size / 4.2}" fill="var(--ink)">${Math.round(p * 100)}%</text>${label ? `<text x="50%" y="66%" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="700">${label}</text>` : ""}</svg>`; };
  const bars = (vals, labels, h = 150, fv = (v) => Math.round(v * 100) + "%") => { const w = Math.max(260, vals.length * 44), bw = Math.min(28, (w / vals.length) * 0.55); let s = `<svg role="img" aria-label="Bar chart" viewBox="0 0 ${w} ${h + 34}" width="100%" style="max-width:${w}px">`; vals.forEach((v, i) => { const x = (i + 0.5) * (w / vals.length), bh = Math.max(2, Math.min(1, v || 0) * h); s += `<rect x="${x - bw / 2}" y="${h - bh + 10}" width="${bw}" height="${bh}" rx="${bw / 3}" fill="var(--acc)" opacity="${v === null ? 0.2 : 1}"/><text x="${x}" y="${h + 28}" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="600">${labels[i]}</text>${v !== null ? `<text x="${x}" y="${h - bh + 4}" text-anchor="middle" font-size="10" fill="var(--ink)" font-weight="700">${fv(v)}</text>` : ""}`; }); return s + "</svg>"; };
  const lineChart = (series, labels, h = 150) => { const w = Math.max(300, labels.length * 26); let s = `<svg role="img" aria-label="Line chart" viewBox="0 0 ${w} ${h + 30}" width="100%">`; const cols = ["var(--acc)", "var(--acc2)"]; series.forEach((ser, k) => { const pts = ser.map((v, i) => (v == null ? null : [(i + 0.5) * (w / labels.length), 10 + h - v * h])); let seg = []; const flush = () => { if (seg.length > 1) s += `<polyline fill="none" stroke="${cols[k]}" stroke-width="2.5" stroke-linejoin="round" points="${seg.map((p) => p.join(",")).join(" ")}"/>`; seg = []; }; pts.forEach((p) => { if (p) { seg.push(p); s += `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${cols[k]}"/>`; } else flush(); }); flush(); }); labels.forEach((l, i) => { if (labels.length < 16 || i % 3 === 0) s += `<text x="${(i + 0.5) * (w / labels.length)}" y="${h + 26}" text-anchor="middle" font-size="10" fill="var(--muted)">${l}</text>`; }); return s + "</svg>"; };
  const dots = (cls, v) => `<span class="dot ${cls}">${v === "d" ? "✓" : v === "p" ? "½" : v === "m" ? "✕" : ""}</span>`;
  const sel = (attr, opts, cur, extra = "") => `<select class="f" ${attr} ${extra}>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${E(v)}" ${String(cur) === String(v) ? "selected" : ""}>${E(l)}</option>`; }).join("")}</select>`;

  /* Calendar: items register what they would send; nothing is sent until the person taps. */
  const CALQ = {};
  const calBtn = (key, label, spec) => { CALQ[key] = { label, spec }; const s = MP.S.sent[key]; return s && !s.del ? `<span class="row" style="gap:6px"><span class="pill tiny">✓ In Calendar</span><button class="link tiny" data-calrm="${E(key)}">Remove</button></span>` : `<button class="link noprint" data-cal="${E(key)}">${ic("cal", 16)} Send to Calendar</button>`; };
  const remind = (mins) => ({ useDefault: false, overrides: [{ method: "popup", minutes: mins }] });
  /* ---------- Time zones (1.13): a home zone (India by default); meetings can be booked in another zone ---------- */
  const ZONES = [["Asia/Kolkata", "India"], ["Europe/London", "UK"], ["America/New_York", "US Eastern"], ["America/Chicago", "US Central"], ["America/Los_Angeles", "US Pacific"], ["Asia/Dubai", "Dubai"], ["Asia/Singapore", "Singapore"], ["Australia/Sydney", "Sydney"], ["Europe/Berlin", "Central Europe"], ["Asia/Tokyo", "Tokyo"]];
  const HOME = () => P().tz || "Asia/Kolkata";
  const tzParts = (ms, tz) => Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const tzOff = (tz, ms) => { const q = tzParts(ms, tz); return Date.UTC(+q.year, +q.month - 1, +q.day, +q.hour % 24, +q.minute) - Math.floor(ms / 60000) * 60000; };
  const wallToMs = (d, t, tz) => { const b = Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), +t.slice(0, 2), +t.slice(3, 5)); let ms = b - tzOff(tz, b); ms = b - tzOff(tz, ms); return ms; };
  const msToWall = (ms, tz) => { const q = tzParts(ms, tz); return { d: `${q.year}-${q.month}-${q.day}`, t: `${String(+q.hour % 24).padStart(2, "0")}:${q.minute}` }; };
  const zoneName = (tz) => { const z = ZONES.find((x) => x[0] === tz); return z ? z[1] : String(tz).split("/").pop().replace(/_/g, " "); };
  const allZones = () => { try { return Intl.supportedValuesOf("timeZone"); } catch (e) { return ZONES.map((z) => z[0]); } };
  const zoneOpts = (cur) => { const top = ZONES.map((z) => [z[0], z[1]]); if (cur && !top.some((z) => z[0] === cur)) top.push([cur, zoneName(cur)]); return [...top, ...allZones().filter((z) => !top.some((x) => x[0] === z)).map((z) => [z, z.replace(/_/g, " ")])]; };
  /* ---------- Google Calendar inside the planner (1.13): read-only, kept on this device, never copied to Drive ---------- */
  let GC = { items: [], at: 0, busy: false };
  const gcKey = () => "gcal:" + (G.user ? G.user.sub : "none");
  const gcOn = () => mode === "google" && (P().gcal || {}).on !== false;
  const safeLink = (u) => (/^https:\/\//i.test(String(u || "")) ? String(u) : "");
  const joinUrl = (txt) => { const m = String(txt || "").match(/https:\/\/[^\s<>"]*(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|teams\.live\.com|webex\.com)[^\s<>"]*/i); return m ? m[0] : ""; };
  function normG(it, cid, color) {
    if (!it || it.status === "cancelled" || !it.start) return null;
    const allDay = !!it.start.date; let d, t = "", d2, t2 = "";
    if (allDay) { d = it.start.date; d2 = iso(addD(parseISO(it.end.date), -1)); }
    else { const a = msToWall(Date.parse(it.start.dateTime), HOME()), b = msToWall(Date.parse(it.end.dateTime), HOME()); d = a.d; t = a.t; d2 = b.d; t2 = b.t; }
    return { id: it.id, cal: cid, color: color || "", title: String(it.summary || "(no title)").slice(0, 200), d, t, d2, t2, allDay, link: safeLink(it.htmlLink), loc: String(it.location || "").slice(0, 300), desc: String(it.description || "").slice(0, 1500), join: safeLink(it.hangoutLink) || joinUrl(it.location) || joinUrl(it.description), att: (it.attendees || []).filter((x) => !x.self).map((x) => ({ e: x.email, s: x.responseStatus })).slice(0, 50) };
  }
  async function gcalLoadCache() { try { const c = await MP.idbGet(gcKey()); if (c && Array.isArray(c.items)) GC.items = c.items; } catch (e) {} }
  async function gcalRefresh(force) {
    if (!gcOn() || !G.hasCal || !G.valid() || GC.busy) return;
    if (!force && Date.now() - GC.at < 60e3) return;
    GC.busy = true;
    try {
      const t = today(), tmin = addD(t, -30).toISOString(), tmax = addD(t, 181).toISOString(), cals = Object.entries((P().gcal || {}).cals || { primary: { on: true } }).filter(([, v]) => v && v.on), out = [];
      for (const [cid, v] of cals) { const items = await G.calList(cid, tmin, tmax); (items || []).forEach((it) => { const g = normG(it, cid, v.color); if (g) out.push(g); }); }
      GC.items = out; GC.at = Date.now(); await MP.idbSet(gcKey(), { items: out });
      if (["today", "planner", "timetable", "study"].includes(route) && !document.activeElement.matches("input,textarea,select")) MP.render();
    } catch (e) { console.warn("calendar", e.message); }
    GC.busy = false;
  }
  setInterval(() => { if (document.visibilityState === "visible") gcalRefresh(); }, 5 * 60e3);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") gcalRefresh(); });
  const sentIds = () => new Set(Object.values(MP.S.sent || {}).filter((x) => x && !x.del && x.id).map((x) => x.id));
  /* Google events on date k, minus anything the planner itself sent (shown once, as the planner item) */
  const gOn = (k) => { if (!gcOn()) return []; const sid = sentIds(); return GC.items.filter((g) => !sid.has(g.id) && !sid.has(String(g.id).split("_")[0]) && g.d <= k && (g.d2 || g.d) >= k).sort((a, b) => (a.allDay ? "" : a.t).localeCompare(b.allDay ? "" : b.t)); };
  const gById = (id) => GC.items.find((g) => g.id === id || String(g.id).split("_")[0] === id);
  const gTime = (g, k) => (g.allDay ? "All day" : `${g.d === k ? fmtT(g.t) : "…"}–${(g.d2 || g.d) === k ? fmtT(g.t2) : "…"}`);
  /* "Meetings & events" time for a day: Google events + planner events with a start and end */
  const meetMins = (k) => { let m = 0; gOn(k).filter((g) => !g.allDay).forEach((g) => { const a = g.d === k ? tMin(g.t) : 0, b = (g.d2 || g.d) === k ? tMin(g.t2) : 1440; m += Math.max(0, b - a); }); evOn(k).filter((e) => e.kind === "event" && e.time && e.end).forEach((e) => { m += Math.max(0, tMin(e.end) - tMin(e.time)); }); return m; };
  const RSVP = { accepted: "✓ accepted", declined: "✕ declined", tentative: "? maybe", needsAction: "· no reply yet" };
  function gcalDialog(id) {
    const g = gById(id); if (!g) return;
    modal(`<div class="between"><h2>${E(g.title)}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="small"><b>${fmt(parseISO(g.d), { weekday: "long", day: "numeric", month: "long" })} · ${E(gTime(g, g.d))}</b></div>
      ${g.loc ? `<div class="small">📍 ${E(g.loc)}</div>` : ""}${g.desc ? `<div class="small muted" style="white-space:pre-line;max-height:180px;overflow:auto">${E(g.desc.replace(/<[^>]+>/g, " "))}</div>` : ""}
      ${g.att.length ? `<div class="stack" style="gap:2px"><span class="lab">Guests</span>${g.att.map((a) => `<span class="small">${E(a.e)} <span class="muted">${RSVP[a.s] || ""}</span></span>`).join("")}</div>` : ""}
      <span class="tiny muted">From your Google Calendar. Change it there; the planner shows it as it is.</span>
      <div class="row" style="justify-content:flex-end">${g.join ? `<a class="btn" href="${E(g.join)}" target="_blank" rel="noopener noreferrer">Join</a>` : ""}${g.link ? `<a class="btn ghost" href="${E(g.link)}" target="_blank" rel="noopener noreferrer">Open in Google Calendar ↗</a>` : ""}<button class="btn ghost" data-close>Close</button></div>`);
  }
  const gRow = (g, k, showDate) => `<div class="between wrap sched gsched" style="${g.color ? "border-left-color:" + E(g.color) : ""}"><button class="link left" data-gev="${E(g.id)}" style="text-align:left"><b>${showDate ? fmt(parseISO(k), { weekday: "short", day: "numeric" }) + " · " : ""}${E(gTime(g, k))}</b> · ${E(g.title)}</button><span class="row" style="gap:6px">${g.join && soonOrNow(k, g.t, g.t2) ? `<a class="btn sm" href="${E(g.join)}" target="_blank" rel="noopener noreferrer">Join</a>` : g.join ? `<a class="link tiny" href="${E(g.join)}" target="_blank" rel="noopener noreferrer">Join link</a>` : ""}<span class="pill tiny">${ic("cal", 12)} Google</span></span></div>`;
  const soonOrNow = (k, t, t2) => { if (k !== iso(today()) || !t) return false; const n = nowMin(); return n >= tMin(t) - 10 && n <= (t2 ? tMin(t2) : tMin(t) + 60); };
  const timedEv = (summary, date, start, end, rec) => Object.assign({ summary, start: { dateTime: `${date}T${start}:00`, timeZone: HOME() }, end: { dateTime: `${date}T${end}:00`, timeZone: HOME() }, reminders: remind(P().alerts || 10), source: { title: "My Planner", url: location.origin + location.pathname } }, rec ? { recurrence: [rec] } : {});
  const allDayEv = (summary, date, rec) => Object.assign({ summary, start: { date }, end: { date: iso(addD(parseISO(date), 1)) }, reminders: remind(900) }, rec ? { recurrence: [rec] } : {});

  /* ---------- screens ---------- */
  const V = {};

  const shortD = (k) => fmt(parseISO(k), { weekday: "short", day: "numeric", month: "short" });
  /* Tasks show as a table on wider screens (Task · Priority · Date · Due · Steps) and as a stacked list on phones. */
  const taskHead = () => `<div class="thead"><span></span><span>Task</span><span>Priority</span><span>Date</span><span>Due</span><span>Steps</span><span></span></div>`;
  function taskRow(t) {
    const p = TPRI[tPri(t)], late = tLate(t), k = iso(today()), subs = t.sub || [], sd = subs.filter((x) => x.done).length, inCal = MP.S.sent["task-" + t.id] && !MP.S.sent["task-" + t.id].del;
    const dTxt = tDay(t) ? (tDay(t) === k ? "Today" : shortD(tDay(t))) : "Inbox", dueTxt = t.due ? fmt(parseISO(t.due), { day: "numeric", month: "short" }) : "", dueOver = !t.done && t.due && t.due < k;
    const meta = [tDay(t) && tDay(t) !== k && !late ? shortD(tDay(t)) : "", t.due ? `<span class="${dueOver ? "over" : ""}">due ${dueTxt}</span>` : "", subs.length ? `${sd} of ${subs.length} steps` : "", inCal && t.cal ? `${ic("cal", 12)} ${fmtT(t.cal.t)}` : ""].filter(Boolean).join(" · ");
    return `<div class="tkrow ${t.done ? "done" : ""}"><input type="checkbox" class="cb" data-done="${E(t.id)}" ${t.done ? "checked" : ""} aria-label="Done"><div class="tbody">
      ${late || (dueOver && t.due !== tDay(t)) ? `<div class="tpills">${late ? `<span class="pill tiny late">Overdue ${late} day${late > 1 ? "s" : ""}</span>` : ""}${dueOver && t.due !== tDay(t) ? '<span class="pill tiny late">Past deadline</span>' : ""}</div>` : ""}
      <div class="tpills mobonly"><span class="pill tiny ${p[1]}">${p[0]}</span></div>
      ${topIds(iso(today())).includes(t.id) && !t.done ? '<span class="pill tiny sel" style="align-self:flex-start" title="One of your top 3 today">★ Top 3</span>' : ""}<button class="ttext" data-tedit="${E(t.id)}">${E(t.t)}</button>${meta ? `<div class="tiny muted mobonly">${meta}</div>` : ""}${inCal && t.cal ? `<div class="tiny muted deskonly">${ic("cal", 12)} In Calendar at ${fmtT(t.cal.t)}</div>` : ""}
      ${subs.length && !t.done ? `<div class="subs">${subs.map((x) => `<label class="row tiny ${x.done ? "sdone" : ""}"><input type="checkbox" class="cb sm" data-sub="${E(t.id)}|${E(x.id)}" ${x.done ? "checked" : ""}> ${E(x.t)}</label>`).join("")}</div>` : ""}</div>
      <span class="tcell deskonly"><span class="pill tiny ${p[1]}">${p[0]}</span></span><span class="tcell deskonly small ${late ? "over" : ""}">${dTxt}</span><span class="tcell deskonly small ${dueOver ? "over" : ""}">${dueTxt || "—"}</span><span class="tcell deskonly small">${subs.length ? `${sd}/${subs.length}` : "—"}</span>
      <span class="row tacts"><button class="tool ${t.pin ? "on" : ""}" data-tpin="${E(t.id)}" title="${t.pin ? "Remove from post-its" : "Show as a post-it"}" aria-label="Post-it">📌</button></span></div>`;
  }
  const moveAll = () => `<span class="row" style="gap:6px"><button class="btn ghost sm" data-tmove="0">Move all to today</button><button class="btn ghost sm" data-tmove="1">Move all to tomorrow</button></span>`;
  /* Today: the whole list. Overdue first, then today's tasks; anything ticked today stays, struck through, until midnight. */
  /* ---------- Time picker (1.16): tap a time box → hour and minute with ▲▼ (hold to repeat), scroll or swipe on them, AM/PM ---------- */
  let tp = null;
  const tpClose = () => { if (tp) { tp.box.remove(); tp = null; } };
  function tpOpen(inp) {
    tpClose(); const v = inp.value || minToT(Math.ceil(nowMin() / 5) * 5 % 1440), m = tMin(v);
    tp = { inp, h: Math.floor(m / 60), mi: m % 60, box: document.createElement("div") };
    tp.box.className = "tpick"; tp.box.setAttribute("role", "dialog"); tp.box.setAttribute("aria-label", "Pick a time");
    const draw = () => { const h12 = tp.h % 12 || 12; tp.box.innerHTML = `<div class="tpcols"><div class="tpc" data-tpw="h"><button type="button" data-tps="h|1" aria-label="Hour up">▲</button><b>${h12}</b><button type="button" data-tps="h|-1" aria-label="Hour down">▼</button></div><span class="tpsep">:</span><div class="tpc" data-tpw="m"><button type="button" data-tps="m|5" aria-label="Minutes up">▲</button><b>${String(tp.mi).padStart(2, "0")}</b><button type="button" data-tps="m|-5" aria-label="Minutes down">▼</button></div><div class="tpap"><button type="button" class="${tp.h < 12 ? "on" : ""}" data-tpap="am">AM</button><button type="button" class="${tp.h >= 12 ? "on" : ""}" data-tpap="pm">PM</button></div></div>
      <div class="tpquick">${[0, 15, 30, 45].map((q) => `<button type="button" data-tpq="${q}">:${String(q).padStart(2, "0")}</button>`).join("")}</div><div class="row" style="justify-content:space-between"><button type="button" class="link tiny" data-tpclear>Clear</button><span class="row" style="gap:6px"><button type="button" class="btn ghost sm" data-tpcancel>Cancel</button><button type="button" class="btn sm" data-tpok>Done</button></span></div>`; };
    tp.draw = draw; draw(); document.body.appendChild(tp.box);
    const r = inp.getBoundingClientRect(), bw = 206, left = Math.min(window.innerWidth - bw - 8, Math.max(8, r.left)), top = r.bottom + 190 > window.innerHeight ? Math.max(8, r.top - 190) : r.bottom + 6;
    Object.assign(tp.box.style, { left: left + "px", top: top + "px" });
  }
  const tpStep = (w, n) => { if (!tp) return; if (w === "h") tp.h = (tp.h + n + 24) % 24; else { let t2 = tp.h * 60 + tp.mi + n; t2 = (t2 + 1440) % 1440; if (Math.abs(n) === 5) t2 = Math.round(t2 / 5) * 5 % 1440; tp.h = Math.floor(t2 / 60); tp.mi = t2 % 60; } tp.draw(); };
  const tpSet = (val) => { const inp = tp.inp; tpClose(); inp.value = val; if (inp.dataset.ttf) inp.dataset.tpset = "1"; inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); };
  /* tapping a time box opens the picker instead of the phone's clock; typing with a keyboard still works */
  document.addEventListener("pointerdown", (e) => { const inp = e.target.closest && e.target.closest('input[type="time"]'); if (!inp || inp.disabled) return; e.preventDefault(); tpOpen(inp); }, true);
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('input[type="time"]')) e.preventDefault(); }, true);
  let tpRep = null; const tpStop = () => { clearTimeout(tpRep); clearInterval(tpRep); tpRep = null; };
  document.addEventListener("pointerdown", (e) => { const b = e.target.closest && e.target.closest("[data-tps]"); if (!b || !tp) return; e.preventDefault(); const [w, n] = b.dataset.tps.split("|"); tpStep(w, +n); tpRep = setTimeout(() => { tpRep = setInterval(() => tpStep(w, +n), 90); }, 400); });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => document.addEventListener(ev, tpStop));
  document.addEventListener("wheel", (e) => { const c = e.target.closest && e.target.closest("[data-tpw]"); if (!c || !tp) return; e.preventDefault(); tpStep(c.dataset.tpw, c.dataset.tpw === "h" ? (e.deltaY < 0 ? 1 : -1) : (e.deltaY < 0 ? 5 : -5)); }, { passive: false });
  let tpY = null; document.addEventListener("touchstart", (e) => { const c = e.target.closest && e.target.closest("[data-tpw]"); tpY = c && tp ? [c.dataset.tpw, e.touches[0].clientY] : null; }, { passive: true });
  document.addEventListener("touchmove", (e) => { if (!tpY) return; const dy = e.touches[0].clientY - tpY[1]; if (Math.abs(dy) >= 18) { tpStep(tpY[0], tpY[0] === "h" ? (dy < 0 ? 1 : -1) : (dy < 0 ? 5 : -5)); tpY[1] = e.touches[0].clientY; } e.preventDefault(); }, { passive: false });
  document.addEventListener("click", (e) => {
    if (!tp) return; const b = e.target.closest("button"); if (!tp.box.contains(e.target)) { if (!e.target.closest('input[type="time"]')) tpClose(); return; }
    if (!b) return; const dd = b.dataset;
    if (dd.tpap) { if (dd.tpap === "am" && tp.h >= 12) tp.h -= 12; if (dd.tpap === "pm" && tp.h < 12) tp.h += 12; tp.draw(); }
    if (dd.tpq !== undefined) { tp.mi = +dd.tpq; tp.draw(); }
    if (dd.tpok !== undefined) tpSet(minToT(tp.h * 60 + tp.mi));
    if (dd.tpclear !== undefined) tpSet("");
    if (dd.tpcancel !== undefined) tpClose();
  });
  document.addEventListener("keydown", (e) => { if (tp && e.key === "Escape") tpClose(); if (tp && e.key === "Enter") tpSet(minToT(tp.h * 60 + tp.mi)); });

  /* ---------- Set up your planner (1.16): a checklist on Today until the menu has been chosen ---------- */
  const SETUP_STEPS = () => [
    ["menu", "Choose your menu", "Pick Simple or Full, or tick only the screens you use. Hidden screens keep their data.", "menu", !!(P().menu && P().menu.chosen)],
    ["acts", "Your activities", "Check the activity types (Study, Work, Meditation…) and link them to habits.", "acts", !!(P().setupSeen || {}).acts],
    ["rit", "Plan my day and Shut down", "Choose whether they appear, and the time of the evening reminder.", "rit", !!(P().setupSeen || {}).rit],
    ...(mode === "google" ? [["gcal", "Google Calendar", "Show your Google Calendar inside the planner.", "gcal", !!(P().gcal && P().gcal.on !== undefined) || !!(P().setupSeen || {}).gcal]] : []),
    ["lock", "Journal lock (optional)", "Lock Journal, Mood, 3-6-9 and History with a PIN.", "lock", !!P().lock || !!(P().setupSeen || {}).lock]
  ];
  function setupCard() {
    const st = SETUP_STEPS(), menuDone = st[0][4], left = st.filter((x) => !x[4]).length;
    if (menuDone && (P().setupSeen || {}).hidden) return ""; if (!left) return "";
    return `<section class="card stack setupcard mb"><div class="between wrap"><span class="lab">Set up your planner · ${st.length - left} of ${st.length} done</span>${menuDone ? `<button class="link tiny" data-setuphide>Hide this</button>` : `<span class="tiny over">Please choose your menu</span>`}</div>
      ${st.map(([id, ttl, txt, anchor, done]) => `<div class="between wrap small setuprow ${done ? "done" : ""}"><span style="flex:1;min-width:180px"><b>${done ? "✓ " : ""}${E(ttl)}</b><br><span class="tiny muted">${E(txt)}</span></span>${done ? "" : `<button class="btn ${id === "menu" ? "" : "ghost"} sm" data-setupgo="${anchor}">${id === "menu" ? "Choose now" : "Open"}</button>`}</div>`).join("")}</section>`;
  }
  /* settings opens at the right card, highlighted */
  const setupFocus = () => { const a = view.sAnchor; if (!a || route !== "prefs") return; view.sAnchor = ""; const el = document.getElementById("set-" + a); if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2600); } if ((P().setupSeen || {})[a] === undefined && a !== "menu") { P().setupSeen = Object.assign({}, P().setupSeen, { [a]: true }); touchP(); } };
  /* people who used the planner before 1.16: a one-time prompt to choose their menu */
  let menuAsked = false;
  function maybeMenuPrompt() {
    if (menuAsked || route !== "today" || !P().setupDone || (P().menu && P().menu.chosen) || mode === "signin") return; menuAsked = true;
    try { if (sessionStorage.getItem("mp-menuask")) return; sessionStorage.setItem("mp-menuask", "1"); } catch (e) {}
    setTimeout(() => { if (document.getElementById("modal").classList.contains("on")) return; modal(`<h2>Choose the screens you see</h2><p class="small">My Planner has many screens. Pick the ones you use and hide the rest; nothing is deleted, and you can change it any time in Settings → Menu.</p>
      <div class="stack"><button class="btn" data-menup="simple" data-menuclose>Simple: Today, Planner, To-Do, Activity, Habits, Journal, Settings, Help</button><button class="btn ghost" data-menup="full" data-menuclose>Full: show everything</button><button class="btn ghost" data-setupgo="menu">Let me pick the screens</button><button class="link tiny" data-close>Ask me later</button></div>`); }, 900);
  }

  /* ---------- Plan my day and Shut down (1.15) ---------- */
  const RIT = () => P().ritual || { plan: true, shut: true, at: "21:30" };
  const ritSet = (o) => { P().ritual = Object.assign({}, RIT(), o); touchP(); };
  const topIds = (k) => ((MP.S.days[k] || {}).top3 || []).filter((id) => MP.S.tasks[id] && !MP.S.tasks[id].del);
  const ritTaskRow = (t, k) => `<div class="between wrap small rit-row"><span style="flex:1;min-width:160px">${tLate(t) ? `<span class="pill tiny late">Overdue ${tLate(t)}d</span> ` : ""}${E(t.t.split("\n")[0])}</span><span class="row" style="gap:4px"><button class="pill tiny ${tDay(t) === k ? "sel" : "out"}" data-rmove="${E(t.id)}|0">Today</button><button class="pill tiny out" data-rmove="${E(t.id)}|1">Tomorrow</button><button class="pill tiny out" data-rmove="${E(t.id)}|inbox">Later</button><button class="pill tiny out" data-rmove="${E(t.id)}|drop">Drop</button></span></div>`;
  function planDialog() {
    const t = today(), k = iso(t), G2 = taskGroups(), cands = [...G2.overdue, ...G2.today.filter((x) => !x.done)], top = topIds(k);
    const cal = [...evOn(k).map((e) => [e.time || "", `${e.time ? fmtT(e.time) : "All day"} · ${E(e.t)}`]), ...gOn(k).map((g) => [g.allDay ? "" : g.t, `${E(gTime(g, k))} · ${E(g.title)} <span class="tiny muted">Google</span>`])].sort((a, b) => a[0].localeCompare(b[0]));
    const am = actMins(t);
    modal(`<div class="between"><h2>Plan my day</h2><button class="tool" data-close aria-label="Close">✕</button></div><span class="small muted">${fmt(t, { weekday: "long", day: "numeric", month: "long" })} · about 2 minutes</span>
      ${G2.overdue.length ? `<div class="stack" style="gap:4px"><span class="lab over">1 · Unfinished from before · ${G2.overdue.length}</span>${G2.overdue.map((x) => ritTaskRow(x, k)).join("")}</div>` : `<span class="small">1 · Nothing left over from before. 🎉</span>`}
      <div class="stack" style="gap:4px"><span class="lab">2 · Today's calendar</span>${cal.map((c) => `<span class="small">${c[1]}</span>`).join("") || '<span class="small muted">Nothing booked today.</span>'}</div>
      <div class="stack" style="gap:4px"><span class="lab">3 · Pick your top 3</span>${cands.map((x) => `<label class="row small"><input type="checkbox" class="cb sm" data-rtop="${E(x.id)}" ${top.includes(x.id) ? "checked" : ""}> <span class="pill tiny ${TPRI[tPri(x)][1]}">${TPRI[tPri(x)][0]}</span> ${E(x.t.split("\n")[0])}</label>`).join("") || '<span class="small muted">No tasks for today yet. Add one with quick add.</span>'}</div>
      <div class="stack" style="gap:4px"><span class="lab">4 · Today's activities</span>${actNames().map((n) => { const m = actMins(t, n); return m.plan ? `<span class="small">${E(n)} · ${hm(m.plan)} planned</span>` : ""; }).join("") || '<span class="small muted">No activities in today\'s timetable.</span>'}${am.plan ? `<span class="tiny muted">${hm(am.plan)} in all</span>` : ""}</div>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-planskip>Skip today</button><button class="btn" data-plandone>Start my day</button></div>`);
  }
  function shutDialog() {
    const t = today(), k = iso(t), G2 = taskGroups(), open = [...G2.overdue, ...G2.today.filter((x) => !x.done)], done = G2.today.filter((x) => x.done), rec = MP.S.days[k] || {};
    modal(`<div class="between"><h2>Shut down</h2><button class="tool" data-close aria-label="Close">✕</button></div><span class="small muted">Close the day so tomorrow starts clean.</span>
      <div class="stack" style="gap:4px"><span class="lab">Done today · ${done.length}</span>${done.map((x) => `<span class="small">✓ ${E(x.t.split("\n")[0])}</span>`).join("") || '<span class="small muted">Nothing ticked yet. Tick anything you did:</span>'}</div>
      ${open.length ? `<div class="stack" style="gap:4px"><span class="lab">Still open · ${open.length}</span>${open.map((x) => `<div class="between wrap small rit-row"><label class="row" style="flex:1;min-width:160px"><input type="checkbox" class="cb sm" data-done="${E(x.id)}"> ${E(x.t.split("\n")[0])}</label><span class="row" style="gap:4px"><button class="pill tiny out" data-rmove="${E(x.id)}|1">Tomorrow</button><button class="pill tiny out" data-rmove="${E(x.id)}|inbox">Later</button><button class="pill tiny out" data-rmove="${E(x.id)}|drop">Drop</button></span></div>`).join("")}<button class="link tiny" data-rmoveall style="align-self:flex-start">Move everything still open to tomorrow</button></div>` : `<div class="stack" style="gap:2px"><span class="lab">Still open · 0</span><span class="small muted">Nothing left open today. When a to-do for today (or an overdue one) isn\'t ticked, it shows here with three buttons: Tomorrow, Later (Inbox) and Drop.</span></div>`}
      <label class="stack small">One line about today<input class="f" id="shutnote" maxlength="200" value="${E((rec.shut || {}).note || "")}" placeholder="What went well, or what you'd change"></label>
      <div class="stack" style="gap:4px"><span class="lab">Evening mood</span><div class="row">${Object.keys(MOODCOL).map((w) => `<button class="moodbtn sm" data-shutmood="${w}" style="${((rec.mood || {}).pm || {}).w === w ? `background:${MOODCOL[w]};color:#1d1d1d` : ""}">${w}</button>`).join("")}</div></div>
      <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Not now</button><button class="btn" data-shutdone>Shut down</button></div>`);
  }
  /* Plan my day opens by itself the first time the planner is opened each morning (4 am onwards), unless it was done or skipped */
  let planChecked = "";
  function maybePlan() {
    const k = iso(today()), h = new Date().getHours(); if (planChecked === k || route !== "today" || RIT().plan === false || h < 4 || h >= 17 || !P().setupDone || mode === "signin") return;
    planChecked = k; if ((MP.S.days[k] || {}).plan) return;
    try { if (localStorage.getItem("mp-plan-seen") === k) return; localStorage.setItem("mp-plan-seen", k); } catch (e) {}
    setTimeout(() => { if (!document.getElementById("modal").classList.contains("on")) planDialog(); }, 600);
  }
  /* in-app shut-down nudge at the chosen time (the Calendar reminder covers it when the app is closed) */
  setInterval(() => { const n = new Date(), k = iso(n), at = RIT().at || "21:30"; if (mode === "signin" || RIT().shut === false || !P().setupDone) return; if (minToT(n.getHours() * 60 + n.getMinutes()) === at && !(MP.S.days[k] || {}).shut) { try { if (sessionStorage.getItem("mp-shut") === k) return; sessionStorage.setItem("mp-shut", k); } catch (e) {} notify("Time to shut down", "Close the day in 2 minutes: tap Shut down on Today."); } }, 30000);
  async function shutCal(on) { /* a daily Google Calendar reminder for Shut down; created / removed from Settings */
    if (mode !== "google") return; const R = RIT();
    try {
      if (R.calId) { await G.calDelete(R.calId); ritSet({ calId: "" }); }
      if (on && G.hasCal) { const at = R.at || "21:30", ev = timedEv("🌙 Shut down your day · My Planner", iso(today()), at, minToT(Math.min(tMin(at) + 5, 1439)), "RRULE:FREQ=DAILY"); ev.reminders = remind(0); const id = await G.calInsert(ev); ritSet({ calId: id }); MP.toast("Daily shut-down reminder added to Google Calendar"); }
    } catch (er) { MP.toast("Calendar: " + er.message); }
  }

  /* ---------- Weekly review (1.15) ---------- */
  V.review = () => {
    const t = today(), m = view.rvw ? parseISO(view.rvw) : monday(addD(t, t.getDay() === 0 ? 0 : 0)), days = [...Array(7)].map((_, i) => addD(m, i)), ks = days.map(iso), wk = iso(m), past = days.filter((d) => d <= t);
    const pcts = days.map((d) => (d <= t ? dayPct(d) : null)), avgP = (() => { const v = pcts.filter((x) => x !== null && x !== undefined); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; })();
    const acts = actNames().map((n) => ({ n, done: past.reduce((s2, d) => s2 + actMins(d, n).done, 0), plan: past.reduce((s2, d) => s2 + actMins(d, n).plan, 0) })).filter((x) => x.plan || x.done);
    const meet = ks.reduce((s2, k) => s2 + meetMins(k), 0);
    const T = tasks(), doneW = T.filter((x) => x.done && x.doneAt && ks.includes(dayOf(x.doneAt))), stillLate = T.filter((x) => tLate(x) > 0).length, carried = T.filter((x) => !x.done && tDay(x) && tDay(x) < ks[0]).length;
    const locked = lockOn() && !unlocked;
    const moodV = days.map((d) => { const r = MP.S.days[iso(d)] || {}, w = r.mood && (r.mood.pm || r.mood.am || {}).w; return w ? MOODVAL[w] : null; });
    const wins = [...ks.flatMap((k) => typedOf("win-" + k).map((x) => [k, x])), ...doneW.filter((x) => tPri(x) === 0).map((x) => [dayOf(x.doneAt), "Done: " + x.t.split("\n")[0]])].slice(0, 12);
    const jh = locked ? [] : ks.map((k) => [k, typedOf("journal-" + k)[0] || ((MP.S.days[k] || {}).shut || {}).note || ""]).filter((x) => x[1]);
    const wrec = MP.S.weeks[wk] || {}, nk = iso(addD(m, 7)), nrec = MP.S.weeks[nk] || {};
    return `${head(`${fmt(m, { day: "numeric", month: "short" })} – ${fmt(addD(m, 6), { day: "numeric", month: "short", year: "numeric" })}`, "Weekly review", `<div class="row"><button class="btn ghost sm" data-rvw="-7" aria-label="Previous week">‹</button><button class="btn ghost sm" data-rvw="0">This week</button><button class="btn ghost sm" data-rvw="7" aria-label="Next week">›</button></div>`)}
      <div class="grid g3"><section class="card row" style="gap:16px;flex-wrap:nowrap">${ring(avgP, 110, 11, "HABITS")}<div class="small muted">Average of the days so far. Rest days don't count against you.</div></section>
        <section class="card stack"><span class="lab">To-dos</span><div class="between"><span>Done this week</span><b>${doneW.length}</b></div><div class="between"><span>Carried in from earlier weeks</span><b>${carried}</b></div><div class="between"><span>Overdue right now</span><b class="${stillLate ? "over" : ""}">${stillLate}</b></div></section>
        <section class="card stack"><span class="lab">Time</span>${acts.map((x) => `<div class="between small"><span>${E(x.n)}</span><b>${hm(x.done)} <span class="muted">of ${hm(x.plan)}</span></b></div>`).join("") || '<span class="small muted">No activities this week.</span>'}${meet ? `<div class="between small"><span>Meetings & events</span><b>${hm(meet)}</b></div>` : ""}</section></div>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Habits by day</span>${bars(pcts.map((x) => x || 0), days.map((d) => fmt(d, { weekday: "short" })))}</section>
        <section class="card stack"><span class="lab">Mood trend</span>${locked ? `<span class="small">${ic("lock", 14)} Locked. <button class="link" data-go="mood">Unlock</button></span>` : moodV.some((x) => x !== null) ? lineChart([moodV], days.map((d) => fmt(d, { weekday: "short" }))) : '<span class="small muted">No mood check-ins this week.</span>'}</section></div>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Top wins</span>${wins.map((w) => `<div class="small"><span class="muted">${fmt(parseISO(w[0]), { weekday: "short" })}</span> · ${E(w[1])}</div>`).join("") || '<span class="small muted">Your Today\'s win notes and finished Do it now tasks show here.</span>'}</section>
        <section class="card stack"><span class="lab">Journal highlights</span>${locked ? `<span class="small">${ic("lock", 14)} Locked. <button class="link" data-go="journal">Unlock</button></span>` : jh.map((x) => `<div class="small"><span class="muted">${fmt(parseISO(x[0]), { weekday: "short" })}</span> · ${E(x[1].slice(0, 140))}</div>`).join("") || '<span class="small muted">First lines of your journal and shut-down notes show here.</span>'}</section></div>
      <section class="card stack mt"><span class="lab">This week's reflection</span><div class="grid g2"><label class="stack small">What worked<textarea class="f" rows="2" maxlength="500" data-wkf="worked" data-wk="${wk}">${E(wrec.worked || "")}</textarea></label><label class="stack small">One thing to change<textarea class="f" rows="2" maxlength="500" data-wkf="change" data-wk="${wk}">${E(wrec.change || "")}</textarea></label></div></section>
      <section class="card stack mt"><span class="lab">Start next week (${fmt(parseISO(nk), { day: "numeric", month: "short" })})</span>${[1, 2, 3].map((i) => `<label class="row small" style="gap:8px"><b style="width:60px">Goal ${i}</b><input class="f" style="flex:1" maxlength="200" data-wkf="g${i}" data-wk="${nk}" value="${E(nrec["g" + i] || "")}" placeholder="One clear goal"></label>`).join("")}<div class="row"><button class="btn ghost sm" data-go="timetable">Check next week's timetable →</button></div></section>`;
  };

  /* Quick add (1.13): type it the way you'd say it; the chips show what was understood (tap to correct). */
  const quickBox = () => `<section class="card stack qadd"><div class="row" style="flex-wrap:nowrap"><input class="f" id="qadd" data-qin autocomplete="off" maxlength="300" placeholder="Type it as you'd say it, e.g. Call bank tomorrow 6 pm · kal subah 9 baje doctor" style="flex:1" aria-label="Quick add"><button class="btn" data-qsave>${ic("plus", 16)} Add</button></div><div class="row" id="qprev" style="gap:4px"></div></section>`;
  const KLABEL = { task: "To-Do task", reminder: "Reminder", event: "Meeting / event" };
  function quickPreview() {
    const box = document.getElementById("qprev"), v = field("qadd"); if (!box) return;
    if (!v) { box.innerHTML = ""; return; }
    const q = MP.quickParse(v), chips = [KLABEL[q.kind], q.d ? (q.d === iso(today()) ? "Today" : shortD(q.d)) : "", q.time ? fmtT(q.time) + (q.end ? "–" + fmtT(q.end) : "") : "", q.rep ? repText({ d: q.d || iso(today()), rep: q.rep, repDays: q.repDays, repEnd: "never" }) : "", q.due ? "due " + shortD(q.due) : "", q.urg || q.imp ? TPRI[tPri(q.kind === "task" ? { urg: q.urg, imp: true } : q)][0] : ""].filter(Boolean);
    box.innerHTML = `<span class="small"><b>${E(q.t)}</b></span>${chips.map((c) => `<button class="pill tiny" data-qfix>${E(c)}</button>`).join("")}<span class="tiny muted">tap a chip to change it</span>`;
  }
  async function quickSave(fix) {
    const v = field("qadd"); if (!v) return; const q = MP.quickParse(v);
    if (q.kind === "task") {
      const preset = { t: q.t, d: q.d || iso(today()), due: q.due, urg: q.urg, imp: true }; /* Important starts ticked, as in the form */
      if (fix) return taskDialog(null, preset);
      const tid = uid(); putRec("tasks", tid, Object.assign({ done: false, c: Date.now(), sub: [] }, preset)); MP.render(); MP.toast("Added to your list: " + q.t); return;
    }
    const pri = q.urg && q.imp ? "urgent" : q.urg ? "high" : "med";
    const rec = { d: q.d || iso(today()), time: q.time, end: q.time ? q.end : "", t: q.t.slice(0, 120), kind: q.kind, pri, rem: q.time ? (q.kind === "reminder" ? "0" : "10") : "", rep: q.rep, repDays: q.repDays, repEnd: q.rep ? "never" : "", repUntil: "", repCount: "", note: "" };
    if (fix) return schedDialog(null, rec);
    if (rec.rep && !repMatch(rec, rec.d)) { for (let i = 1; i < 400; i++) { const dk = iso(addD(parseISO(rec.d), i)); if (repMatch(rec, dk)) { rec.d = dk; break; } } }
    const eid = uid(); putRec("events", eid, rec); MP.render(); MP.toast(`${KLABEL[q.kind]} added: ${q.t}${q.time ? " · " + fmtT(q.time) : ""}`);
    if (mode === "google" && G.hasCal) await sendKey("ev-" + eid, { kind: "event", e: MP.S.events[eid] }, true);
  }
  function todoCard() {
    const G = taskGroups(), n = G.overdue.length + G.today.length, dn = G.today.filter((t) => t.done).length;
    return `<section class="card stack mt"><div class="between wrap"><span class="lab">To-dos · ${dn} of ${n} done</span><span class="row" style="gap:6px"><button class="btn sm" data-tnew>${ic("plus", 16)} Task</button><button class="link" data-go="todo">To-Do →</button></span></div>
      ${G.overdue.length ? `<div class="between wrap"><span class="lab over">Overdue · ${G.overdue.length}</span>${moveAll()}</div><div class="ttable">${taskHead()}${G.overdue.map(taskRow).join("")}</div><span class="lab">Today</span>` : ""}
      ${G.today.length ? `<div class="ttable">${taskHead()}${G.today.map(taskRow).join("")}</div>` : ""}${G.today.length ? "" : '<span class="small muted">Nothing for today. Tap Task to add one.</span>'}</section>`;
  }
  /* Post-its: pinned tasks only, coloured by priority; write on them with the S Pen; drag the handle to reorder. */
  /* 1.16: post-its float over every screen (top right by default). Drag one anywhere by its top bar; positions are kept per device. */
  const PP = () => { try { return JSON.parse(localStorage.getItem("mp-postpos") || "{}"); } catch (e) { return {}; } };
  const PPsave = (o) => { try { localStorage.setItem("mp-postpos", JSON.stringify(o)); } catch (e) {} };
  function postitLayer() {
    let L = document.getElementById("postlayer"); if (!L) { L = document.createElement("div"); L.id = "postlayer"; document.body.appendChild(L); }
    const inApp = mode !== "signin" && P().setupDone && route !== "day";
    const k = iso(today()), T = inApp ? tasks().filter((t) => t.pin && (!t.done || (t.doneAt && dayOf(t.doneAt) === k))).sort((a, b) => (a.pinO || 0) - (b.pinO || 0)).slice(0, 8) : [];
    if (!T.length) { L.innerHTML = ""; return; }
    const pos = PP(), small = window.innerWidth < 700, col = (localStorage.getItem("mp-postcol") || (small ? "1" : "")) === "1", W = small ? 150 : 180;
    if (col) { L.innerHTML = `<button class="postchip" data-postcol="0" title="Show your post-its">📌 ${T.length}</button>`; return; }
    /* 1.16.1: one post-it at a time, with ‹ 1 of 5 › to move between them */
    let n = 0; try { n = +localStorage.getItem("mp-postidx") || 0; } catch (e) {} n = ((n % T.length) + T.length) % T.length;
    const t = T[n], p = pos.stack, x = p ? Math.min(Math.max(0, p.x * window.innerWidth), window.innerWidth - W) : window.innerWidth - W - 16, y = p ? Math.min(Math.max(50, p.y * window.innerHeight), window.innerHeight - 150) : 58, ink = ((MP.S.ink["postit-" + t.id] || {}).s || []).length;
    L.innerHTML = `<button class="postchip on" data-postcol="1" title="Tuck the post-its away">📌 ${T.length} · hide</button><div class="pfloat p${tPri(t)} ${t.done ? "done" : ""} ${T.length > 1 ? "pstack" : ""}" data-pid="${E(t.id)}" style="left:${x}px;top:${y}px;width:${W}px;--r:${(n % 3) - 1}deg">
        <div class="pbar" title="Drag to move"><span class="row" style="gap:2px"><button class="tool" data-pnote="${E(t.id)}" title="Write on it" aria-label="Write on this post-it">${ic("penm", 14)}</button><input type="checkbox" class="cb sm" data-done="${E(t.id)}" ${t.done ? "checked" : ""} aria-label="Done"></span><button class="tool" data-tpin="${E(t.id)}" title="Unpin" aria-label="Unpin">✕</button></div>
        <button class="ptext" data-tedit="${E(t.id)}">${E(t.t)}</button>${ink ? `<canvas class="printink" data-printink="postit-${E(t.id)}" height="70"></canvas>` : ""}
        ${T.length > 1 ? `<div class="pnav"><button class="tool" data-postnav="-1" aria-label="Previous post-it">‹</button><span>${n + 1} of ${T.length}</span><button class="tool" data-postnav="1" aria-label="Next post-it">›</button></div>` : ""}</div>`;
    L.querySelectorAll("[data-printink]").forEach(drawPrintInk);
  }
  let pdrag = null;
  document.addEventListener("pointerdown", (e) => { const bar = e.target.closest(".pfloat .pbar"); if (!bar || e.target.closest("button,input")) return; const n = bar.closest(".pfloat"), r = n.getBoundingClientRect(); e.preventDefault(); pdrag = { n, id: "stack", dx: e.clientX - r.left, dy: e.clientY - r.top }; n.classList.add("lift"); n.style.zIndex = 60; try { bar.setPointerCapture(e.pointerId); } catch (er) {} });
  document.addEventListener("pointermove", (e) => { if (!pdrag) return; const x = Math.min(Math.max(0, e.clientX - pdrag.dx), window.innerWidth - pdrag.n.offsetWidth), y = Math.min(Math.max(0, e.clientY - pdrag.dy), window.innerHeight - 40); pdrag.n.style.left = x + "px"; pdrag.n.style.top = y + "px"; });
  document.addEventListener("pointerup", () => { if (!pdrag) return; const n = pdrag.n, o = PP(), z = Math.max(10, ...Object.values(o).map((v) => v.z || 0)) + 1; o[pdrag.id] = { x: parseFloat(n.style.left) / window.innerWidth, y: parseFloat(n.style.top) / window.innerHeight, z }; PPsave(o); n.classList.remove("lift"); n.style.zIndex = z; pdrag = null; });
  window.addEventListener("resize", () => { clearTimeout(window._mpPl); window._mpPl = setTimeout(postitLayer, 200); });
  function postitStrip() {
    const k = iso(today()), T = tasks().filter((t) => t.pin && (!t.done || (t.doneAt && dayOf(t.doneAt) === k))).sort((a, b) => (a.pinO || 0) - (b.pinO || 0)).slice(0, 8);
    if (!T.length) return "";
    return `<section class="stack mt" style="gap:6px"><span class="lab">Post-its</span><div class="postits">${T.map((t) => { const ink = ((MP.S.ink["postit-" + t.id] || {}).s || []).length;
      return `<div class="postit p${tPri(t)} ${t.done ? "done" : ""}" data-pid="${E(t.id)}"><div class="between"><span class="phandle" title="Drag to reorder" aria-label="Drag to reorder">⋮⋮</span><span class="row" style="gap:2px"><button class="tool" data-pnote="${E(t.id)}" title="Write on it" aria-label="Write on this post-it">${ic("penm", 15)}</button><input type="checkbox" class="cb sm" data-done="${E(t.id)}" ${t.done ? "checked" : ""} aria-label="Done"></span></div>
        <button class="ptext" data-tedit="${E(t.id)}">${E(t.t)}</button>${ink ? `<canvas class="printink" data-printink="postit-${E(t.id)}" height="80"></canvas>` : ""}</div>`; }).join("")}</div></section>`;
  }
  const writeBtns = () => `<span class="row" style="gap:4px"><button class="link" data-write="pen">${ic("penm", 16)} Write</button><span class="muted">·</span><button class="link" data-write="type">${ic("kbd", 16)} Type</button></span>`;

  function daySheet() {
    const t = today(), k = iso(t), rec = dayRec(k), a = dailyAff(t), now = nowMin();
    const sec = { m: "Morning", a: "Afternoon", e: "Evening" }; let last = "";
    const rowsArr = ttFor(t);
    const rows = rowsArr.map((r, i) => {
      let h = ""; const s = secOf(r.start); if (s !== last) { h += `<div class="sechead">${sec[s]}</div>`; last = s; }
      const st = tMin(r.start), en = r.end ? tMin(r.end) : (rowsArr[i + 1] ? tMin(rowsArr[i + 1].start) : 1440);
      const isNow = now >= st && now < (en > st ? en : 1440), past = en > st && en <= now, isS = isAct(r);
      h += `<div class="trow ${isNow ? "now" : ""} ${isS ? "study" : ""} ${past && !isNow ? "past" : ""}"><span class="ttime">${fmtT(r.start)}${r.end ? " – " + fmtT(r.end) : ""}</span><span style="flex:1">${E(r.text)}${isNow ? ' <span class="tiny">· now</span>' : ""}</span>${isS ? `<input type="checkbox" class="cb" data-blk="${E(r.id)}" ${rec.study && rec.study[r.id] ? "checked" : ""} aria-label="Block done">` : '<span style="width:20px"></span>'}</div>`;
      return h;
    }).join("") || `<p class="small muted">No timetable yet. <button class="link" data-go="timetable">Set it up →</button></p>`;
    const gToday = gOn(k); const gHtml = gToday.length ? `<div class="sechead">Google Calendar</div>${gToday.map((g) => `<div class="trow"><span class="ttime">${E(gTime(g, k))}</span><span style="flex:1"><button class="link left" data-gev="${E(g.id)}">${E(g.title)}</button></span></div>`).join("")}` : "";
    const top = (() => { const picked = topIds(k).map((id) => Object.assign({ id }, MP.S.tasks[id])).filter((x) => !x.done); if (picked.length) return picked; const G = taskGroups(); return [...G.overdue, ...G.today.filter((x) => !x.done)].sort(tByPri).slice(0, 3); })();
    const sr = studyRows(t), done = sr.filter((r) => rec.study && rec.study[r.id]).length;
    return `<div class="grid sheetgrid"><section class="card" style="padding:12px 14px"><div class="between"><span class="lab">${E(P().name || "My")}'s day</span><span class="tiny muted">Now · ${fmtT(minToT(now))}</span></div>${rows}${gHtml}<div class="between small" style="margin-top:10px"><span class="muted">Study blocks done</span><b>${done} of ${sr.length}</b></div></section>
      <div class="stack" style="gap:16px"><section class="card stack soft"><div class="between"><span class="lab">Today's affirmation</span>${writeBtns()}</div><p class="quote" style="font-size:19px">“${E(a.text)}”</p></section>
      <section class="card stack"><span class="lab">Top 3 to-dos</span>${top.map((x) => `<label class="row small" style="gap:8px"><input type="checkbox" class="cb" data-done="${E(x.id)}">${E(x.t)}</label>`).join("") || '<span class="small muted">None picked yet.</span>'}</section>
      <section class="card stack"><span class="lab">Wellness check-in</span>${wellRows(rec, k, 24)}</section>
      <section class="stack" style="gap:6px"><span class="lab">Grateful for</span>${MP.padHTML("grateful-" + k, 2, 40)}</section>
      <section class="stack" style="gap:6px"><span class="lab">Today's win</span>${MP.padHTML("win-" + k, 2, 40)}</section></div></div>`;
  }
  const wellRows = (rec, k, sz = 30) => `<div class="between small"><span>Water</span><span class="row" style="gap:3px">${[...Array(8)].map((_, i) => `<button class="pill dotbtn" data-water="${i + 1}" aria-label="${i + 1} glasses" style="width:${sz}px;height:${sz}px;background:${i < (rec.water || 0) ? "var(--acc)" : "var(--soft)"}"></button>`).join("")}</span></div>
    <div class="between small"><span>Energy</span><span class="row" style="gap:3px">${[1, 2, 3, 4, 5].map((n) => `<button class="pill num ${rec.energy === n ? "sel" : ""}" data-energy="${n}">${n}</button>`).join("")}</span></div>`;

  function dayClock() {
    const t = today(), rows = ttFor(t), now = nowMin();
    if (!rows.length) return `<section class="card"><p class="small muted">Add your timetable to see the day clock. <button class="link" data-go="timetable">Set it up →</button></p></section>`;
    const R = 150, r0 = 92, C = 170;
    const pt = (m, rad) => { const a = (m / 1440) * 2 * Math.PI - Math.PI / 2; return [C + rad * Math.cos(a), C + rad * Math.sin(a)]; };
    const arc = (a, b, col, lab) => { if (b <= a) b += 1440; const big = b - a > 720 ? 1 : 0; const [x1, y1] = pt(a, R), [x2, y2] = pt(b, R), [x3, y3] = pt(b, r0), [x4, y4] = pt(a, r0); return `<path d="M${x1},${y1} A${R},${R} 0 ${big} 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 ${big} 0 ${x4},${y4}Z" fill="${col}" stroke="var(--surf)" stroke-width="2"><title>${E(lab)}</title></path>`; };
    let g = ""; rows.forEach((r, i) => { const st = tMin(r.start); const en = r.end ? tMin(r.end) : rows[i + 1] ? tMin(rows[i + 1].start) : tMin(rows[0].start) + 1440; g += arc(st, en, r.text.toLowerCase().includes("sleep") ? "#3A3F5C" : TCOL[r.type] || "var(--soft)", fmtT(r.start) + " " + r.text); });
    let ticks = ""; for (let h = 0; h < 24; h += 3) { const [x, y] = pt(h * 60, R + 14); ticks += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--muted)">${h === 0 ? "12a" : h < 12 ? h : h === 12 ? "12p" : h - 12}</text>`; }
    const [hx, hy] = pt(now, R + 4);
    const cur = rows.slice().reverse().find((r) => tMin(r.start) <= now) || rows[rows.length - 1];
    const nx = rows[rows.indexOf(cur) + 1];
    return `<div class="grid g2" style="align-items:center"><section class="card center"><svg role="img" aria-label="Day clock" viewBox="0 0 340 340" width="100%" style="max-width:380px">${g}${ticks}<line x1="${C}" y1="${C}" x2="${hx}" y2="${hy}" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="${C}" cy="${C}" r="6" fill="var(--ink)"/><text x="${C}" y="${C - 26}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--muted)" letter-spacing="1.5">NOW · ${E(fmtT(minToT(now)).toUpperCase())}</text><text x="${C}" y="${C + 30}" text-anchor="middle" style="font-family:var(--disp)" font-size="15" fill="var(--ink)">${E(String(cur.text).split("·")[0].trim().slice(0, 22))}</text></svg></section>
      <section class="card stack"><span class="lab">Now</span><h2>${E(cur.text)}</h2><span class="small muted">${fmtT(cur.start)}${cur.end ? " – " + fmtT(cur.end) : ""}</span>${nx ? `<span class="lab" style="margin-top:8px">Next</span><div class="small"><b>${fmtT(nx.start)}</b> · ${E(nx.text)}</div>` : ""}
      <div class="row tiny" style="margin-top:10px">${Object.entries(TCOL).map(([k, c]) => `<span class="row" style="gap:5px"><i class="key" style="background:${c}"></i>${k}</span>`).join("")}<span class="row" style="gap:5px"><i class="key" style="background:#3A3F5C"></i>Sleep</span></div></section></div>`;
  }
  function journalSpread() {
    const t = today(), k = iso(t), a = dailyAff(t);
    return `<div class="card spread sheetgrid"><div class="stack page"><div style="font-family:var(--disp);font-size:24px">${fmt(t, { weekday: "long" })}<span class="muted" style="font-size:16px"> · ${fmt(t, { day: "numeric", month: "long" })}</span></div>
      ${ttFor(t).map((r) => `<div class="row small jrow ${isAct(r) ? "b" : ""}"><span style="width:62px" class="muted">${fmtT(r.start)}</span><span style="flex:1">${E(r.text)}</span></div>`).join("") || '<span class="small muted">No timetable yet.</span>'}</div>
      <div class="stack page"><p class="quote" style="font-size:18px;text-align:center">“${E(a.text)}”</p><span class="lab">Dear diary</span>${MP.padHTML("journal-" + k, 9, 40)}<span class="lab">Grateful for</span>${MP.padHTML("grateful-" + k, 2, 40)}</div></div>`;
  }

  V.today = () => {
    const t = today(), k = iso(t), rec = dayRec(k), a = dailyAff(t), nm = nextMoon(), p = portalOf(t), tv = P().todayView || "overview";
    const sr = actRows(t), doneB = sr.filter((r) => rec.study && rec.study[r.id]).length, nb = sr.find((r) => !(rec.study && rec.study[r.id])), am = actMins(t);
    const pr = P().practice, pday = pr.start ? Math.floor((t - parseISO(pr.start)) / 864e5) + 1 : 0;
    const hour = new Date().getHours(), greet = hour < 4 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 22 ? "Good evening" : "Good night";
    const headr = `<div class="between hdr" style="align-items:flex-start"><div><div class="lab">${fmt(t, { weekday: "long", day: "numeric", month: "long" })}</div><h1 class="title">${greet},<br><em>${E(P().name || "friend")}</em></h1></div>
      <div class="stack" style="align-items:flex-end;gap:10px"><div class="row" style="gap:8px"><button class="btn sm" data-sched>${ic("plus", 16)} Add / schedule</button><label class="row small" style="gap:8px"><span class="lab">View</span>${sel("data-tviewsel", [["overview", "Summary"], ["sheet", "Detailed day sheet"], ["clock", "Day clock"], ["journal", "Journal spread"]], tv, 'aria-label="Day view" style="width:auto;font-weight:700"')}</label></div>
      <div class="row">${nm ? `<span class="pill ${nm.m === "Purnima" ? "c-moon" : "c-ama"}">${nm.m === "Purnima" ? "○" : "●"} ${nm.m} ${nm.i === 0 ? "today" : "in " + nm.i + " day" + (nm.i > 1 ? "s" : "")} · ${fmt(nm.d, { weekday: "short", day: "numeric", month: "short" })}</span>` : ""}${p ? `<span class="pill c-portal">✦ ${E(p)}</span>` : ""}${pr.text && pday >= 1 && pday <= pr.len ? `<span class="pill out">3-6-9 · Day ${pday} of ${pr.len}</span>` : ""}</div></div></div>`;
    if (tv === "sheet") return headr + whatsNewCard() + schedCard() + daySheet();
    if (tv === "clock") return headr + dayClock();
    if (tv === "journal") return headr + (lockOn() && !unlocked ? `<section class="card stack center"><span class="small">${ic("lock", 16)} Your journal is locked.</span><button class="btn sm" data-go="journal">Unlock</button></section>` : journalSpread());
    const hs = activeHabits().filter((h) => dueOn(h, t) || (h.freq && h.freq.k === "week")), pct = dayPct(t) || 0, tm = moodOf(t);
    const ritBar = `<div class="row ritbar">${!(MP.S.days[k] || {}).plan && RIT().plan !== false && new Date().getHours() < 17 ? (() => { const g = taskGroups(), od = g.overdue.length, td = g.today.filter((x) => !x.done).length; return `<button class="planhero" data-planopen><span class="phsun" aria-hidden="true">☀</span><span class="phtxt"><b>Plan my day</b><span>${od ? `${od} left over from before · ` : ""}${td ? `${td} to-do${td > 1 ? "s" : ""} for today · ` : ""}about 2 minutes</span></span><span class="phgo">Start ›</span></button>`; })() : ""}${new Date().getHours() >= 16 && RIT().shut !== false ? `<button class="btn ${(MP.S.days[k] || {}).shut ? "ghost" : ""} sm" data-shutopen>🌙 ${(MP.S.days[k] || {}).shut ? "Shut down again" : "Shut down my day"}</button>` : ""}${t.getDay() === 0 || t.getDay() === 6 ? `<button class="btn ghost sm" data-go="review">📊 Your weekly review</button>` : ""}</div>`;
    return headr + whatsNewCard() + setupCard() + ritBar + quickBox() + `<div class="grid g2">
      <section class="card stack"><div class="between"><span class="lab">Today's affirmation</span>${writeBtns()}</div><p class="quote">“${E(a.text)}”</p><span class="tiny muted">${E(a.src)}</span></section>
      <section class="card hero stack">${sr.length ? (nb ? `<div class="between"><span class="lab inherit">Up next · ${fmtT(nb.start)}</span><span class="tiny" style="opacity:.85">${rowLen(nb)} min</span></div><h2 class="inherit">${E(nb.text)}</h2><span class="small" style="opacity:.85">${E(actOf(nb))}</span>` : `<h2 class="inherit">All activities done today</h2>`) : `<h2 class="inherit">No activities yet</h2><span class="small">Add Activity rows in your Timetable.</span>`}
      <div class="bar"><i style="width:${sr.length ? (doneB / sr.length) * 100 : 0}%"></i></div><div class="between wrap"><span class="small" style="opacity:.9">${doneB} of ${sr.length} blocks · ${hm(am.done)} of ${hm(am.plan)} done</span><button class="btn inv" data-go="study">Timer</button></div></section></div>
      <section class="card stack mt"><div class="between"><span class="lab">Habits today</span><span class="small accb">${hs.filter((h) => (rec.h || {})[h.id] === "d").length} of ${hs.length} · ${Math.round(pct * 100)}%</span></div>
      ${hs.length ? `<div class="row habrow">${hs.map((h) => { const f = h.freq || {}, cnt = f.k === "count" ? `<b class="tiny">${((rec.hn || {})[h.id] || 0)}/${f.n}</b>` : f.k === "week" ? `<b class="tiny">${weekDone(h, t)}/${f.n} wk</b>` : ""; return `<button class="hb" data-h="${E(h.id)}" aria-label="${E(h.name)}: tap to change">${dots((rec.h || {})[h.id] || "e", (rec.h || {})[h.id])}<span>${E(h.name.split(" ")[0])}</span>${cnt}</button>`; }).join("")}</div><span class="tiny muted">Tap a circle: empty → Done (100%) → Partial (50%) → Missed</span>` : `<span class="small muted">No habits yet. <button class="link" data-go="habits">Add habits →</button></span>`}</section>
      ${schedCard()}${inboxCard()}${todoCard()}<div class="grid g2 mt">
      <section class="card stack"><div class="between"><span class="lab">Mood check-in</span><button class="link" data-go="mood">Open →</button></div>
      <div class="row">${Object.keys(MOODCOL).map((w) => `<button class="moodbtn" data-moodq="${w}" style="${tm === w ? `background:${MOODCOL[w]};color:#1d1d1d` : ""}">${w}</button>`).join("")}</div>
      <div class="between"><div><div class="lab">Winning streak</div><div class="big">${streak()} days</div></div><div class="row" style="gap:6px">${[...Array(7)].map((_, i) => { const d = addD(monday(t), i), q = dayPct(d), on = q !== null && q >= 0.7; return `<span class="wd"><span class="wdot ${on ? "on" : ""}"></span>${"MTWTFSS"[i]}</span>`; }).join("")}</div></div></section></div>`;
  };

  V.timetable = () => {
    const we = view.tt === "we" && Array.isArray(P().weekend), rows = (we ? P().weekend : P().timetable).slice().sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const tabs = `<div class="row"><div class="tabs"><button class="${!we ? "on" : ""}" data-ttv="wd">${Array.isArray(P().weekend) ? "Weekdays" : "Every day"}</button>${Array.isArray(P().weekend) ? `<button class="${we ? "on" : ""}" data-ttv="we">Weekend</button>` : ""}</div>${Array.isArray(P().weekend) ? `<button class="btn ghost sm" data-weoff>Use one timetable</button>` : `<button class="btn ghost sm" data-weon>Different weekend timetable</button>`}</div>`;
    const per = {}; rows.filter(isAct).forEach((r) => { per[actOf(r)] = (per[actOf(r)] || 0) + rowLen(r); });
    return `${head("Your routine", "Timetable", tabs)}<section class="card"><div class="tablewrap"><table class="t"><thead><tr><th>Start</th><th>End</th><th>What</th><th>Type</th><th class="noprint"></th></tr></thead><tbody>
      ${rows.map((r) => `<tr class="${isAct(r) ? "srow" : ""}"><td><input class="f sm" type="time" value="${E(r.start)}" data-ttf="start" data-id="${E(r.id)}" aria-label="Start"></td><td><input class="f sm" type="time" value="${E(r.end || "")}" data-ttf="end" data-id="${E(r.id)}" aria-label="End"></td><td><input class="f" value="${E(r.text)}" maxlength="120" data-ttf="text" data-id="${E(r.id)}" aria-label="Activity"></td><td><div class="stack" style="gap:4px">${sel(`data-ttf="type" data-id="${E(r.id)}"`, TYPES, isAct(r) ? "Activity" : r.type, 'aria-label="Type"')}${isAct(r) ? sel(`data-ttact="${E(r.id)}"`, [...actNames().map((n) => [n, n]), ["__new", "+ Add type…"]], actOf(r), 'aria-label="Activity type"') : ""}</div></td><td class="noprint"><span class="row" style="gap:4px;flex-wrap:nowrap">${isAct(r) && r.start && r.end ? calBtn("tt-" + r.id, r.text, { kind: "block", row: r }) : ""}<button class="tool" data-ttdel="${E(r.id)}" aria-label="Delete row">${ic("trash", 16)}</button></span></td></tr>`).join("") || `<tr><td colspan="5" class="small muted">No rows yet.</td></tr>`}
      ${!we || (today().getDay() % 6 === 0) ? gOn(iso(today())).filter((g) => !g.allDay).map((g) => `<tr class="grow"><td class="small">${fmtT(g.d === iso(today()) ? g.t : "00:00")}</td><td class="small">${fmtT((g.d2 || g.d) === iso(today()) ? g.t2 : "23:59")}</td><td><button class="link left" data-gev="${E(g.id)}">${E(g.title)}</button></td><td class="small">${ic("cal", 12)} Google Calendar · today</td><td></td></tr>`).join("") : ""}
      </tbody></table></div><div class="row mt"><button class="btn" data-ttadd>${ic("plus", 16)} Add a row</button>${!rows.length ? `<button class="btn ghost" data-ttsuggest>Use a suggested routine</button>` : ""}</div>
      <p class="tiny muted">Planned: ${Object.keys(per).map((n) => `${E(n)} ${hm(per[n])}`).join(" · ") || "no activities yet"}. Rows of type <b>Activity</b> are timed on the Activity screen; pick what kind in the box under it. Times save as you type.</p></section>`;
  };

  V.habits = () => {
    const t = today(), days = [...Array(7)].map((_, i) => addD(t, i - 6)), hs = P().habits;
    return `${head("Done 100% · Partial 50% · Missed", "Habits", `<button class="btn ghost" data-go="dash">${ic("dash", 16)} Dashboard</button>`)}
      <section class="card tablewrap"><table class="t"><thead><tr><th>Habit</th>${days.map((d) => `<th class="c">${fmt(d, { weekday: "short" })}<br>${d.getDate()}</th>`).join("")}</tr></thead><tbody>
      ${activeHabits().map((h) => `<tr><td><b>${E(h.name)}</b><div class="tiny muted">${E(freqText(h))}${h.freq && h.freq.k === "week" ? ` · ${weekDone(h, t)} of ${h.freq.n} this week` : ""}</div>${h.def ? `<div class="tiny muted">100% = ${E(h.def)}</div>` : ""}</td>${days.map((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id] || "e"; return `<td class="c ${dueOn(h, d) || (h.freq && h.freq.k === "week") ? "" : "nd"}"><button class="hb inline" data-hd="${iso(d)}" data-hi="${E(h.id)}" aria-label="${E(h.name)} on ${fmt(d, { weekday: "long" })}">${dots(v + " smd", v)}</button></td>`; }).join("")}</tr>`).join("") || `<tr><td colspan="8" class="small muted">Add your first habit below.</td></tr>`}</tbody></table></section>
      <section class="card stack mt"><span class="lab">Manage habits</span>${hs.map((h) => `<div class="row" style="gap:8px"><input class="f" style="flex:2;min-width:140px" value="${E(h.name)}" maxlength="60" data-hname="${E(h.id)}" aria-label="Habit name"><input class="f" style="flex:2;min-width:140px" value="${E(h.def || "")}" maxlength="80" placeholder="What counts as 100%?" data-hdef="${E(h.id)}" aria-label="What counts as 100%"><button class="btn ghost sm" data-hact="${E(h.id)}">${h.active === false ? "Resume" : "Pause"}</button></div>
        <div class="row small" style="gap:6px;margin:-2px 0 8px">${sel(`data-hfreq="${E(h.id)}"`, [["daily", "Every day"], ["days", "Chosen days"], ["week", "Times a week"], ["count", "A count each day"]], (h.freq || {}).k || "daily", 'style="width:auto" aria-label="How often"')}
        ${(h.freq || {}).k === "days" ? [1, 2, 3, 4, 5, 6, 0].map((x) => `<label class="pill row"><input type="checkbox" data-hday="${E(h.id)}|${x}" ${(h.freq.days || []).includes(x) ? "checked" : ""}> ${WDN[x]}</label>`).join("") : ""}
        ${(h.freq || {}).k === "week" ? `<input class="f" type="number" min="1" max="7" value="${h.freq.n}" data-hn="${E(h.id)}" style="width:64px" aria-label="Times a week"> times a week` : ""}
        ${(h.freq || {}).k === "count" ? `<input class="f" type="number" min="1" max="99" value="${h.freq.n}" data-hn="${E(h.id)}" style="width:64px" aria-label="Count"><input class="f" maxlength="20" value="${E(h.freq.unit || "")}" placeholder="e.g. glasses" data-hunit="${E(h.id)}" style="width:110px" aria-label="Unit"> a day (tap on Today to add one)` : ""}</div>`).join("")}
      <div class="row"><input class="f" id="newh" placeholder="New habit, e.g. Drink 8 glasses of water" maxlength="60" style="flex:1"><button class="btn" data-hadd>${ic("plus", 16)} Add</button></div>
      <div class="row">${D.suggest.habits.filter((x) => !hs.some((h) => h.name === x)).slice(0, 8).map((x) => `<button class="pill out" data-hsug="${E(x)}">+ ${E(x)}</button>`).join("")}</div><span class="tiny muted">Paused habits keep their history and don't count towards your score. Days a habit isn't due (rest days) don't break your streak; weekly habits are counted by the week.</span></section>`;
  };

  V.dash = () => {
    const w = view.dash === "week", t = today(), span = w ? 7 : 30, days = [...Array(span)].map((_, i) => addD(t, i - span + 1));
    const hs = activeHabits();
    const per = hs.map((h) => { let s = 0, f = 0; const due = h.freq && h.freq.k === "week" ? (h.freq.n * span) / 7 : days.filter((d) => dueOn(h, d)).length || 1; days.forEach((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; if (v === "d") { s += 1; f++; } else if (v === "p") { s += 0.5; f++; } }); return { h: h.name, c: Math.min(1, s / due), f }; });
    const eff = per.length ? per.reduce((a, b) => a + b.c, 0) / per.length : 0;
    const prevDays = days.map((d) => addD(d, -span)); const prevEff = (() => { if (!hs.length) return 0; let tot = 0; hs.forEach((h) => { prevDays.forEach((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; tot += v === "d" ? 1 : v === "p" ? 0.5 : 0; }); }); return tot / (hs.length * span); })();
    const delta = Math.round((eff - prevEff) * 100);
    const daily = days.map(dayPct), win = daily.filter((x) => x !== null && x >= 0.7).length, full = daily.filter((x) => x === 1).length;
    const wk = iso(monday(t)), wrec = MP.S.weeks[wk] || {};
    const heat = w ? "" : `<section class="card stack mt tablewrap"><span class="lab">Last 30 days · heatmap</span><div class="heat" style="grid-template-columns:130px repeat(30,minmax(14px,1fr))">${hs.map((h) => `<span class="tiny b">${E(h.name)}</span>` + days.map((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; return `<i class="hc ${v || ""}" title="${iso(d)}"></i>`; }).join("")).join("")}</div><span class="tiny muted">Green = done · gold = partial · rose = missed</span></section>`;
    return `${head(w ? "This week" : "Last 30 days", "Habit Dashboard", `<div class="tabs"><button class="${w ? "on" : ""}" data-dv="week">Week</button><button class="${!w ? "on" : ""}" data-dv="month">Month</button></div>`)}
      <div class="grid g3"><section class="card row" style="gap:16px;flex-wrap:nowrap">${ring(eff, 120, 12, "EFFICIENCY")}<div class="small muted">Everything you did ÷ the days each habit was due, across all habits (Partial counts 50%).</div></section>
      <section class="card stack"><span class="lab">Winning streak</span><div class="big xl">${streak()} days</div><span class="small muted">Days in a row with 70%+ of habits done · best ${bestStreak()}</span></section>
      <section class="card stack"><span class="lab">${w ? "This week" : "Last 30 days"}</span><div class="between"><span>Winning days</span><b>${win} / ${span}</b></div><div class="between"><span>100% days</span><b>${full}</b></div><div class="between"><span>vs previous ${w ? "week" : "30 days"}</span><b class="accb">${delta >= 0 ? "+" : ""}${delta}%</b></div></section></div>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Daily completion</span>${w ? bars(daily, days.map((d) => fmt(d, { weekday: "short" }))) : lineChart([daily], days.map((d) => d.getDate()))}</section>
      <section class="card stack"><span class="lab">Consistency by habit</span>${per.map((p) => `<div class="stack" style="gap:4px"><div class="between small"><span>${E(p.h)}</span><b>${Math.round(p.c * 100)}%</b></div><div class="bar"><i style="width:${p.c * 100}%"></i></div></div>`).join("") || '<span class="small muted">No habits yet.</span>'}</section></div>${heat}
      <section class="card stack mt"><span class="lab">This week's reflection · saved to this week only</span><div class="grid g2"><label class="stack small">What worked<textarea class="f" rows="2" maxlength="500" data-wkf="worked" data-wk="${wk}">${E(wrec.worked || "")}</textarea></label><label class="stack small">One thing to change<textarea class="f" rows="2" maxlength="500" data-wkf="change" data-wk="${wk}">${E(wrec.change || "")}</textarea></label></div></section>`;
  };

  /* ---------- Timer (1.12): any length, optional breaks; remembers its end time across reloads ---------- */
  const TMR = () => P().timer || (P().timer = { breaks: false, every: 50, blen: 10, keep: true, cal: true });
  let tm = (() => { try { const x = JSON.parse(localStorage.getItem("mp-timer2") || "null"); return x && Array.isArray(x.segs) ? x : null; } catch (e) { return null; } })() || { segs: [], i: 0, run: false, endAt: 0, left: 0, row: "", label: "" };
  const tmSave = () => { try { localStorage.setItem("mp-timer2", JSON.stringify(tm)); } catch (e) {} };
  const tmLeft = () => Math.max(0, Math.round(((tm.run ? tm.endAt - Date.now() : tm.left)) / 1000));
  const tmFmt = (sec) => `${sec >= 3600 ? Math.floor(sec / 3600) + ":" : ""}${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  function tmPlan(min, brk) { const T = TMR(); if (!brk || min < 60) return [{ k: "f", m: min }]; const sg = []; let left = min; while (left > 0) { const f = Math.min(T.every || 50, left); sg.push({ k: "f", m: f }); left -= f; if (left > (T.blen || 10)) { sg.push({ k: "b", m: T.blen || 10 }); left -= T.blen || 10; } } return sg; }
  function timerCard(rows) {
    const k = iso(today()), rec = dayRec(k), nb = rows.find((r) => !(rec.study && rec.study[r.id])), T = TMR(), on = tm.segs.length > 0, seg = on ? tm.segs[tm.i] : null;
    const picks = [5, 10, 15, 25, 30, 45, 60, 90].map((n) => `<button class="pill num" data-tquick="${n}">${n}</button>`).join("");
    return `<section class="card hero stack center"><span class="lab inherit">${on ? `${seg.k === "b" ? "Break" : "Focus"}${tm.segs.length > 1 ? ` · part ${tm.i + 1} of ${tm.segs.length}` : ""}` : "Timer"}</span>${on && tm.label ? `<span class="small" style="opacity:.9">${E(tm.label)}</span>` : ""}
      <div class="timer" id="timerv">${tmFmt(on ? tmLeft() : (nb ? rowLen(nb) : 25) * 60)}</div>
      ${on ? `<div class="row"><button class="btn inv" data-tpause>${tm.run ? "Pause" : "Resume"}</button><button class="btn outline" data-tstop>Stop</button></div>`
        : `<div class="row">${nb ? `<button class="btn inv" data-tstart="${E(nb.id)}">Start ${E(actOf(nb))} · ${rowLen(nb)} min</button>` : ""}<button class="btn outline" data-tpomo>25 + 5</button></div>
      <div class="stack" style="gap:6px;align-items:center"><span class="small" style="opacity:.9">Or set your own (minutes)</span><div class="row" style="justify-content:center">${picks}</div><div class="row"><input class="f" type="number" min="1" max="600" id="tcmin" placeholder="e.g. 40" style="width:100px" aria-label="Minutes"><button class="btn outline sm" data-tcustom>Start</button></div></div>`}
      <label class="row small" style="opacity:.95"><input type="checkbox" data-tbrk ${T.breaks ? "checked" : ""}> Add breaks to sessions of 60 min or more (${T.blen || 10} min after every ${T.every || 50})</label>
      <span class="small" style="opacity:.85">When a block's timer ends, the block is ticked for you.</span></section>`;
  }
  let wl = null, lastTouch = Date.now();
  async function wakeOn() { if (TMR().keep === false || !tm.run) return; try { if ("wakeLock" in navigator && !wl) { wl = await navigator.wakeLock.request("screen"); wl.addEventListener("release", () => (wl = null)); } } catch (e) {} }
  const wakeOff = () => { try { if (wl) wl.release(); } catch (e) {} wl = null; dimOff(); };
  function dimOff() { const d = document.getElementById("dimv"); if (d) d.remove(); lastTouch = Date.now(); }
  function dimOn() { if (document.getElementById("dimv")) return; const d = document.createElement("div"); d.id = "dimv"; d.innerHTML = `<div class="dimt" id="dimt">${tmFmt(tmLeft())}</div><div class="dims">${E(tm.label || "")} · tap to return</div>`; document.body.appendChild(d); }
  async function calBackup(on) {
    if (mode !== "google" || !G.hasCal || TMR().cal === false) return;
    try {
      if (tm.cal) { const id = tm.cal; tm.cal = ""; tmSave(); await G.calDelete(id); }
      if (!on || !tm.run) return;
      let end = tm.endAt; for (let j = tm.i + 1; j < tm.segs.length; j++) end += tm.segs[j].m * 60e3;
      const e = new Date(end), st = `${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
      const ev = timedEv("⏰ " + (tm.label || "Timer") + " ends", iso(e), st, minToT(Math.min(1439, tMin(st) + 1))); ev.reminders = remind(0);
      tm.cal = await G.calInsert(ev); tmSave();
    } catch (er) {}
  }
  function tmStart(min, o = {}) {
    if (tm.segs.length) tmStop(true);
    tm = { segs: o.pomo ? [{ k: "f", m: 25 }, { k: "b", m: 5 }] : tmPlan(min, TMR().breaks), i: 0, run: true, endAt: 0, left: 0, row: o.row || "", label: o.label || (o.pomo ? "Focus 25 + 5" : min + "-minute timer"), cal: "" };
    tm.endAt = Date.now() + tm.segs[0].m * 60e3; tmSave();
    if ("Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch (er) {} }
    if (SND().auto) startSound(); wakeOn(); calBackup(true); MP.render();
  }
  function tmStop(silent) { const had = tm.cal; tm = { segs: [], i: 0, run: false, endAt: 0, left: 0, row: "", label: "", cal: had }; calBackup(false).then(() => { tm.cal = ""; tmSave(); }); tmSave(); stopSound(); wakeOff(); if (!silent) MP.render(); }
  function tmTick() {
    if (!tm.run || !tm.segs.length) return;
    let changed = false;
    while (tm.run && Date.now() >= tm.endAt) {
      const cur = tm.segs[tm.i]; tm.i++; changed = true;
      if (tm.i >= tm.segs.length) {
        if (tm.row) { const k = iso(today()), row = ttFor(today()).find((x) => x.id === tm.row); blockDone(k, tm.row, true); notify("Time's up", row ? `"${row.text}" ticked.` : tm.label); }
        else notify("Time's up", tm.label || "Timer finished");
        const c = tm.cal; tm = { segs: [], i: 0, run: false, endAt: 0, left: 0, row: "", label: "", cal: c }; calBackup(false); stopSound(); wakeOff(); tmSave(); MP.render(); return;
      }
      const nx = tm.segs[tm.i]; tm.endAt += nx.m * 60e3;
      notify(cur.k === "f" ? "Break time" : "Back to focus", cur.k === "f" ? `Take ${nx.m} minutes.` : `${nx.m} minutes of focus.`);
      if (nx.k === "b" && SND().breakStop) stopSound(); if (nx.k === "f" && SND().auto) startSound();
    }
    if (changed) { tmSave(); if (route === "study") MP.render(); }
    const el = document.getElementById("timerv"); if (el) el.textContent = tmFmt(tmLeft());
    const dt = document.getElementById("dimt"); if (dt) dt.textContent = tmFmt(tmLeft());
    if (TMR().keep !== false && Date.now() - lastTouch > 30000) dimOn();
  }
  setInterval(tmTick, 1000);
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, () => { lastTouch = Date.now(); if (document.getElementById("dimv")) dimOff(); }, true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && tm.run) { tmTick(); wakeOn(); } });
  if (tm.run) setTimeout(() => { tmTick(); wakeOn(); }, 500);
  const SND = () => P().sound || (P().sound = { auto: true, type: "brown", vol: 0.5, breakStop: true, playlist: "" });
  const safeUrl = (u) => /^https:\/\/[^\s"'<>]+$/i.test(u || "") ? u : "";
  function soundCard() {
    const sd = SND();
    return `<section class="card stack mt"><div class="between wrap"><span class="lab">Study music · opens YouTube</span><span class="tiny muted">${navigator.onLine ? "Needs internet" : "You're offline right now"}</span></div>
      <div class="row">${YT.map((x) => `<a class="pill out ytl" href="${ytUrl(x[1])}" target="_blank" rel="noopener noreferrer">▶ ${E(x[0])}</a>`).join("")}${safeUrl(sd.playlist) ? `<a class="pill sel ytl" href="${E(sd.playlist)}" target="_blank" rel="noopener noreferrer">♫ My playlist</a>` : ""}</div>
      <span class="tiny muted">Opens in the YouTube app or a new tab, outside My Planner. Save your own Spotify or YouTube playlist in Settings.</span></section>`;
  }
  const YT = [["Lo-fi study beats", "lofi hip hop study music"], ["Classical for studying", "classical music for studying concentration"], ["Piano for focus", "calm piano music for focus"], ["Indian flute & sitar", "indian classical instrumental flute sitar for study"], ["Rain sounds", "rain sounds for studying 1 hour"], ["Brown noise", "brown noise for focus 1 hour"], ["Deep focus ambient", "deep focus ambient music for studying"], ["Nature · forest", "forest nature sounds for concentration"], ["Alpha waves", "alpha waves focus music"], ["Instrumental Bollywood", "bollywood instrumental music for study"]];
  const ytUrl = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
  const BUILTIN_SOUNDS = false; /* built-in generated sounds switched off at Vicky's request; YouTube links only */
  const startSound = () => { if (!BUILTIN_SOUNDS) return; const sd = SND(); if (MP.sound) MP.sound.play(sd.type, sd.vol); };
  const stopSound = () => { if (MP.sound) MP.sound.stop(); };
  function miniPlayer() {
    const el = document.getElementById("mini"); if (!el) return;
    const on = MP.sound && MP.sound.playing();
    el.innerHTML = on ? `<span>♪ ${E((MP.SOUNDS.find((x) => x[0] === on) || ["", "Focus sound"])[1])}</span><button class="btn sm" data-snd="stop" aria-label="Stop focus sound">■ Stop</button>` : "";
    el.classList.toggle("on", !!on);
  }
  V.study = () => {
    const t = today(), k = iso(t), rec = dayRec(k), selA = view.act || "", names = actNames(), rows = actRows(t, selA || null);
    const days = [...Array(7)].map((_, i) => addD(t, i - 6)), hrs = days.map((d) => actMins(d, selA || null).done / 60), mx = Math.max(4, ...hrs);
    const chips = `<div class="row mb">${[["", "All activities"], ...names.map((n) => [n, n])].map(([v, l]) => `<button class="pill ${selA === v ? "sel" : "out"}" data-actsel="${E(v)}">${E(l)}</button>`).join("")}</div>`;
    return `${head(`${rows.length} block${rows.length === 1 ? "" : "s"} today · edit them in Timetable`, selA ? E(selA) : "Activity")}${chips}
      <div class="grid g2">${timerCard(rows)}
      <section class="card stack"><span class="lab">Today's blocks</span>${rows.map((r) => `<div class="between wrap"><label class="row" style="gap:10px"><input type="checkbox" class="cb" data-blk="${E(r.id)}" ${rec.study && rec.study[r.id] ? "checked" : ""}><span><b>${fmtT(r.start)} – ${fmtT(r.end)}</b><br><span class="small muted">${E(actOf(r))} · ${E(r.text)} · ${rowLen(r)} min</span></span></label><span class="row" style="gap:6px"><button class="btn ghost sm" data-tstart="${E(r.id)}">Start timer</button>${calBtn("tt-" + r.id, r.text, { kind: "block", row: r })}</span></div>`).join("") || `<span class="small muted">No ${selA ? E(selA) + " " : ""}blocks today. <button class="link" data-go="timetable">Add Activity rows →</button></span>`}
      <div class="stack" style="gap:4px;border-top:1px solid var(--line);padding-top:8px">${names.map((n) => { const m = actMins(t, n); return m.plan || m.done ? `<div class="between small"><span>${E(n)}</span><b>${hm(m.done)} of ${hm(m.plan)}</b></div>` : ""; }).join("") || '<span class="tiny muted">Done against planned shows here.</span>'}${meetMins(k) ? `<div class="between small"><span>Meetings & events</span><b>${hm(meetMins(k))}</b></div>` : ""}</div>
      <div class="between small"><span>Focus today</span><span class="row" style="gap:4px">${[1, 2, 3, 4, 5].map((n) => `<button class="pill num ${rec.focus === n ? "sel" : ""}" data-focus="${n}">${n}</button>`).join("")}</span></div>
      <div class="between small"><span>Phone away?</span><span class="row" style="gap:4px">${["Yes", "No"].map((x) => `<button class="pill num ${rec.phone === x ? "sel" : ""}" data-phone="${x}">${x}</button>`).join("")}</span></div>
      <label class="stack small">What got in the way?<input class="f" maxlength="200" value="${E(rec.block || "")}" data-dayf="block"></label></section></div>
      ${soundCard()}
      <section class="card stack mt"><span class="lab">Hours ${selA ? "of " + E(selA) : "of all activities"} · last 7 days</span>${bars(hrs.map((h) => h / mx), days.map((d) => fmt(d, { weekday: "short" })), 140, (v) => (v * mx).toFixed(1) + "h")}</section>`;
  };

  /* ---------- Day and Week view (1.14), like Outlook: half-hour grid, drag to move or resize ---------- */
  const SLOT = 28; /* pixels per half hour */
  function lanes(arr) {
    arr.sort((a, b) => a.s - b.s || b.e - a.e); const res = []; let cl = [], end = -1;
    const flush = () => { const cols = []; cl.forEach((it) => { let c = cols.findIndex((x) => x <= it.s); if (c < 0) { c = cols.length; cols.push(0); } cols[c] = it.e; it.lane = c; }); cl.forEach((it) => (it.lanes = cols.length)); res.push(...cl); cl = []; };
    arr.forEach((it) => { if (cl.length && it.s >= end) { flush(); end = -1; } cl.push(it); end = Math.max(end, it.e); }); if (cl.length) flush(); return res;
  }
  function dayItems(k) {
    const d = parseISO(k), out = [], strip = [];
    ttFor(d).forEach((r) => { if (!r.start) return; const a = tMin(r.start); let b = r.end ? tMin(r.end) : a + 30; if (b <= a) b = r.end ? 1440 : Math.min(1440, a + 30); out.push({ src: "tt", id: r.id, s: a, e: b, title: r.text, sub: isAct(r) ? actOf(r) : r.type, cls: isAct(r) ? "b-act" : "b-tt", chg: r.chg }); });
    evOn(k).forEach((e) => { if (e.time) { const a = tMin(e.time), b = e.end ? tMin(e.end) : a + (e.kind === "reminder" ? 15 : 30); out.push({ src: "ev", id: e.id, s: a, e: Math.max(b, a + 15), title: e.t, sub: (SLABEL[e.kind] || "Event") + (e.tz && e.tzT ? ` · ${fmtT(e.tzT)} ${zoneName(e.tz)}` : ""), cls: "b-ev " + (PRICLS[e.pri] || ""), rep: !!e.rep }); } else strip.push({ src: "ev", id: e.id, title: e.t }); });
    tasks().forEach((t) => { if (t.cal && t.cal.d === k) out.push({ src: "task", id: t.id, s: tMin(t.cal.t), e: tMin(t.cal.t) + 15, title: t.t.split("\n")[0], sub: "To-do", cls: "b-task" + (t.done ? " done" : "") }); else if (tDay(t) === k && !t.done) strip.push({ src: "task", id: t.id, title: "To-do · " + t.t.split("\n")[0] }); });
    gOn(k).forEach((g) => { if (g.allDay) strip.push({ src: "g", id: g.id, title: g.title }); else { const a = g.d === k ? tMin(g.t) : 0, b = (g.d2 || g.d) === k ? tMin(g.t2) : 1440; out.push({ src: "g", id: g.id, s: a, e: Math.max(b, a + 15), title: g.title, sub: "Google", cls: "b-g", color: g.color }); } });
    const md = k.slice(5); live("dates").forEach(([id, x]) => { if (x.md === md) strip.push({ src: "date", id, title: (x.type === "Birthday" ? "✿ " : "♥ ") + x.n }); });
    const mo = moonOf(d), po = portalOf(d); if (mo) strip.push({ src: "x", title: (mo === "P" ? "○ " : "● ") + moonName(mo) }); if (po) strip.push({ src: "x", title: "✦ " + po });
    return { items: lanes(out), strip };
  }
  const blkHTML = (it, k) => { const top = (it.s / 30) * SLOT, h = Math.max(14, ((it.e - it.s) / 30) * SLOT - 2), w = 100 / it.lanes, drag = it.src !== "g";
    return `<div class="blk ${it.cls} ${it.chg ? "chg" : ""} ${it.e - it.s < 45 ? "short" : ""}" data-bsrc="${it.src}" data-bid="${E(it.id)}" data-bk="${k}" data-bs="${it.s}" data-be="${it.e}" title="${E(it.title)}" style="top:${top}px;height:${h}px;left:calc(${it.lane * w}% + 2px);width:calc(${w}% - 4px);${it.color ? "border-left-color:" + E(it.color) : ""}">
      ${drag ? '<span class="grip" aria-label="Drag to move">⋮⋮</span>' : ""}<b>${E(it.title)}</b><span>${fmtT(minToT(it.s))}${it.e - it.s >= 30 ? "–" + fmtT(minToT(Math.min(it.e, 1439))) : ""}${it.sub ? " · " + E(it.sub) : ""}${it.chg ? " · changed" : ""}</span>${drag ? '<i class="rz" aria-label="Drag to change length"></i>' : ""}</div>`; };
  V.day = () => {
    const k = view.dayK || iso(today()), wk = view.dv === "week", phone = window.innerWidth < 760, t = today();
    const days = wk ? (phone ? [0, 1, 2].map((i) => iso(addD(parseISO(k), i))) : [...Array(7)].map((_, i) => iso(addD(monday(parseISO(k)), i)))) : [k];
    const data = days.map((dk) => [dk, dayItems(dk)]), tz2 = P().tz2 && P().tz2 !== HOME() ? P().tz2 : "";
    const title = wk ? `${fmt(parseISO(days[0]), { day: "numeric", month: "short" })} – ${fmt(parseISO(days[days.length - 1]), { day: "numeric", month: "short", year: "numeric" })}` : fmt(parseISO(k), { weekday: "long", day: "numeric", month: "long" });
    const nav = `<div class="row" style="gap:6px"><button class="btn ghost sm" data-dnav="0">Today</button><button class="btn ghost sm" data-dnav="-1" aria-label="Back">‹</button><button class="btn ghost sm" data-dnav="1" aria-label="Forward">›</button><div class="tabs"><button class="${wk ? "" : "on"}" data-dvw="day">Day</button><button class="${wk ? "on" : ""}" data-dvw="week">Week</button></div><button class="btn sm" data-sched="${k}">${ic("plus", 16)} Add / schedule</button></div>`;
    const strip7 = `<div class="dstrip7">${[-3, -2, -1, 0, 1, 2, 3].map((i) => { const dd = addD(parseISO(k), i), kk = iso(dd); return `<button class="${kk === k ? "on" : ""} ${kk === iso(t) ? "td" : ""}" data-dpick="${kk}"><span>${fmt(dd, { weekday: "short" })}</span><b>${dd.getDate()}</b></button>`; }).join("")}</div>`;
    const mm = (() => { const m0 = new Date(parseISO(k).getFullYear(), parseISO(k).getMonth(), 1), st = addD(m0, -((m0.getDay() + 6) % 7)); return `<div class="dmini"><b class="small">${fmt(m0, { month: "long", year: "numeric" })}</b><div class="dmm">${"MTWTFSS".split("").map((x) => `<span class="muted">${x}</span>`).join("")}${[...Array(42)].map((_, i) => { const dd = addD(st, i), kk = iso(dd); return `<button class="${dd.getMonth() !== m0.getMonth() ? "o" : ""} ${kk === k ? "sel" : ""} ${kk === iso(t) ? "td" : ""}" data-dpick="${kk}">${dd.getDate()}</button>`; }).join("")}</div><button class="link tiny" data-go="planner">← Month view</button></div>`; })();
    const nowM = nowMin(), cols = data.map(([dk, x]) => `<div class="dcol ${dk === iso(t) ? "istoday" : ""}" data-dk="${dk}">${[...Array(48)].map((_, i) => `<div class="hslot ${i % 2 ? "" : "hr"}" data-slot="${dk}|${minToT(i * 30)}"></div>`).join("")}${x.items.map((it) => blkHTML(it, dk)).join("")}${dk === iso(t) ? `<div class="nowline" style="top:${(nowM / 30) * SLOT}px"></div>` : ""}</div>`).join("");
    const tcol = `<div class="tcol">${[...Array(24)].map((_, h) => `<div class="tl" style="height:${SLOT * 2}px">${fmtT(minToT(h * 60)).replace(":00", "")}</div>`).join("")}</div>`;
    const tcol2 = tz2 ? `<div class="tcol t2">${[...Array(24)].map((_, h) => `<div class="tl" style="height:${SLOT * 2}px">${fmtT(msToWall(wallToMs(days[0], minToT(h * 60), HOME()), tz2).t).replace(":00", "")}</div>`).join("")}</div>` : "";
    const heads = `<div class="dhead" style="grid-template-columns:${tz2 ? "52px " : ""}52px repeat(${days.length},minmax(0,1fr))">${tz2 ? `<span class="tiny muted c">${E(zoneName(tz2))}</span>` : ""}<span class="tiny muted c">${E(zoneName(HOME()))}</span>${data.map(([dk, x]) => `<div class="dh ${dk === iso(t) ? "td" : ""}">${wk ? `<button class="link" data-dpick="${dk}" data-dvday>${fmt(parseISO(dk), { weekday: "short" })} <b>${parseISO(dk).getDate()}</b></button>` : ""}<div class="dstrip">${x.strip.map((it) => `<button class="chip ${it.src === "g" ? "c-gcal" : it.src === "task" ? "c-task" : "c-ev"}" ${it.src === "g" ? `data-gev="${E(it.id)}"` : it.src === "task" ? `data-tedit="${E(it.id)}"` : it.src === "ev" ? `data-sedit="${E(it.id)}"` : ""}>${E(it.title)}</button>`).join("")}</div></div>`).join("")}</div>`;
    return `${head(wk ? "Week" : "Day", E(title), nav)}${phone ? strip7 : ""}<div class="dwrap ${phone || wk ? "" : "withmini"}">${phone || wk ? "" : mm}
      <section class="card dcard">${heads}<div class="dgrid" id="dgrid"><div class="dbody" style="grid-template-columns:${tz2 ? "52px " : ""}52px repeat(${days.length},minmax(0,1fr));height:${SLOT * 48}px">${tcol2}${tcol}${cols}</div></div>
      <span class="tiny muted">Tap an empty slot to add · tap a block to open it · drag a block (or its ⋮⋮ grip on a phone) to move it, or its bottom edge to change its length. Google Calendar items open in Google to change.</span></section></div>`;
  };
  let lastW = window.innerWidth; window.addEventListener("resize", () => { if (route === "day" && (lastW < 760) !== (window.innerWidth < 760)) MP.render(); lastW = window.innerWidth; });
  /* scroll the grid to 9 am, or to now on today, the first time a date is shown */
  const dayScroll = () => { const g = document.getElementById("dgrid"); if (!g || view.dscr === view.dayK + view.dv) return; view.dscr = view.dayK + view.dv; const k = view.dayK || iso(today()), m = k === iso(today()) || view.dv === "week" ? Math.max(0, nowMin() - 90) : 9 * 60; g.scrollTop = (m / 30) * SLOT; };
  /* applying a change: one date only, or the whole series */
  let pend = null;
  const scopeAsk = (p) => { pend = p; modal(`<h2>${p.del ? "Delete" : "Change"} a repeating item</h2><p class="small">“${E(p.title)}” repeats. ${p.del ? "Delete" : "Change"} it for:</p><div class="stack"><button class="btn" data-scope="one">This occurrence (${fmt(parseISO(p.k), { weekday: "short", day: "numeric", month: "short" })} only)</button><button class="btn ghost" data-scope="all">The entire series</button><button class="btn ghost" data-close>Cancel</button></div>`); };
  async function evPush(eid) {
    const e = MP.S.events[eid], s2 = MP.S.sent["ev-" + eid]; if (!e || mode !== "google" || !s2 || s2.del) return;
    try { const tell = (e.guests || []).length ? (window.confirm("Send the new time to your guests?") ? "all" : "none") : "none"; await G.calPatch(s2.id, buildEv(e), evQs(e, tell)); } catch (er) { MP.toast("Saved here, but Google Calendar said: " + er.message); }
  }
  const evTimes = (e, k, s, en) => { const o = { d: k, time: minToT(s), end: en > s ? minToT(Math.min(en, 1439)) : "" }; if (e.tz) { const a = msToWall(wallToMs(k, o.time, HOME()), e.tz); o.tzD = a.d; o.tzT = a.t; o.tzEnd = o.end ? msToWall(wallToMs(k, o.end, HOME()), e.tz).t : ""; } return o; };
  function evOccurrence(id, k, patch, del) {
    const e = MP.S.events[id]; if (!e) return; e.skip = [...new Set([...(e.skip || []), k])]; e.u = Date.now();
    if (!del) { const c = Object.assign({}, e, { d: k, rep: "", repDays: [], repEnd: "", repUntil: "", repCount: "", from: id }, patch); delete c.skip; delete c.u; putRec("events", uid(), c); }
    MP.changed(); MP.render(); MP.toast(MP.S.sent["ev-" + id] && !MP.S.sent["ev-" + id].del ? "Changed for this day only. Google Calendar still shows the usual time that day; change it there too if you need to." : "Changed for this day only");
  }
  function applyScope(which) {
    const p = pend; pend = null; closeModal(); if (!p) return;
    if (p.src === "tt") {
      if (which === "one") { const r = dayRec(p.k); r.tto = r.tto || {}; r.tto[p.id] = p.del ? { del: 1 } : Object.assign({}, (r.tto[p.id] || {}), p.patch); touchDay(p.k); MP.toast(p.del ? "Removed for this day only" : "Changed for this day only"); }
      else if (p.del) { ["timetable", "weekend"].forEach((kk) => { if (Array.isArray(P()[kk])) P()[kk] = P()[kk].filter((r) => r.id !== p.id); }); touchP(); MP.toast("Removed from every day"); }
      else { Object.keys(p.patch).forEach((f) => setTT(p.id, f, p.patch[f])); MP.toast("Changed for every day"); }
    } else if (p.src === "ev") {
      if (which === "one") { const pt = Object.assign({}, p.full || p.patch); ["rep", "repDays", "repEnd", "repUntil", "repCount"].forEach((f) => delete pt[f]); return evOccurrence(p.id, p.k, Object.assign(pt, { d: p.k }), p.del); }
      if (p.del) { const key = "ev-" + p.id, s2 = MP.S.sent[key]; if (s2 && !s2.del && mode === "google") G.calDelete(s2.id).catch(() => {}); if (s2 && !s2.del) MP.S.sent[key] = { del: 1, u: Date.now() }; delRec("events", p.id); }
      else { const e = MP.S.events[p.id], keepD = e.d, keepTz = e.tzD; if (p.full) { Object.assign(e, p.full); } else { Object.assign(e, p.patch); e.d = keepD; if (keepTz) e.tzD = keepTz; } e.u = Date.now(); MP.changed(); evPush(p.id); }
    }
    MP.render();
  }
  /* routine block from the day page: view / edit / delete */
  function rtDialog(id, k) {
    const r = ttFor(parseISO(k)).find((x) => x.id === id); if (!r) return;
    modal(`<div class="between"><h2>${E(r.text)}</h2><button class="tool" data-close aria-label="Close">✕</button></div><span class="small muted">Part of your daily routine${r.chg ? " · changed for this day" : ""}</span>
      <div class="grid g2"><label class="stack small">Start<input class="f" type="time" id="rts" value="${E(r.start || "")}"></label><label class="stack small">End<input class="f" type="time" id="rte" value="${E(r.end || "")}"></label></div>
      <label class="stack small">What<input class="f" id="rtt" maxlength="120" value="${E(r.text)}"></label>
      ${isAct(r) ? `<label class="stack small">Activity type${sel('id="rta"', actNames(), actOf(r))}</label>` : ""}
      <div class="row" style="justify-content:flex-end"><button class="btn ghost danger" data-rtdel="${E(id)}|${k}">Delete</button>${isAct(r) && k === iso(today()) ? `<button class="btn ghost" data-tstart="${E(id)}">Start timer</button>` : ""}<button class="btn ghost" data-close>Cancel</button><button class="btn" data-rtsave="${E(id)}|${k}">Save</button></div>`);
  }
  /* dragging blocks: mouse or S Pen anywhere on a block; finger on the ⋮⋮ grip (so the page still scrolls) */
  let bd = null;
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".blk"); if (!b || route !== "day" || b.dataset.bsrc === "g") return;
    const rz = !!e.target.closest(".rz"), grip = !!e.target.closest(".grip");
    if (e.pointerType === "touch" && !rz && !grip) return;
    bd = { el: b, rz, src: b.dataset.bsrc, id: b.dataset.bid, k: b.dataset.bk, s: +b.dataset.bs, e: +b.dataset.be, y0: e.clientY, x0: e.clientX, moved: false, nk: b.dataset.bk, ns: +b.dataset.bs, ne: +b.dataset.be, pid: e.pointerId };
    if (rz || grip || e.pointerType !== "touch") { try { b.setPointerCapture(e.pointerId); } catch (er) {} }
    if (rz || grip) e.preventDefault();
  });
  document.addEventListener("pointermove", (e) => {
    if (!bd) return; const dy = e.clientY - bd.y0, dx = e.clientX - bd.x0;
    if (!bd.moved && Math.hypot(dx, dy) < 5) return; bd.moved = true; e.preventDefault();
    const dm = Math.round((dy / SLOT) * 2) * 15;
    if (bd.rz) { bd.ne = Math.max(bd.s + 15, Math.min(1440, bd.e + dm)); bd.el.style.height = ((bd.ne - bd.s) / 30) * SLOT - 2 + "px"; }
    else {
      const len = bd.e - bd.s; bd.ns = Math.max(0, Math.min(1440 - len, bd.s + dm)); bd.ne = bd.ns + len; bd.el.style.top = (bd.ns / 30) * SLOT + "px";
      bd.el.style.pointerEvents = "none"; const u = document.elementFromPoint(e.clientX, e.clientY), col = u && u.closest(".dcol"); bd.el.style.pointerEvents = "";
      if (col && col.dataset.dk !== bd.nk) { bd.nk = col.dataset.dk; col.appendChild(bd.el); }
    }
    bd.el.classList.add("dragging"); const sp = bd.el.querySelector("span:not(.grip)"); if (sp) sp.textContent = fmtT(minToT(bd.ns)) + "–" + fmtT(minToT(Math.min(bd.ne, 1439)));
  });
  document.addEventListener("pointerup", () => {
    if (!bd) return; const x = bd; bd = null;
    if (!x.moved) { if (x.src === "tt") return rtDialog(x.id, x.k); if (x.src === "ev") return schedDialog(x.id); if (x.src === "task") return taskDialog(x.id); return; }
    if (x.ns === x.s && x.ne === x.e && x.nk === x.k) return MP.render();
    blockMoved(x);
  });
  document.addEventListener("pointercancel", () => { if (bd) { bd = null; MP.render(); } });
  /* tap an empty half-hour: the full Add / schedule form, date and times filled in (like Outlook) */
  document.addEventListener("click", (e) => { const sl = e.target.closest("[data-slot]"); if (!sl || route !== "day") return; const [sk, st] = sl.dataset.slot.split("|"); schedDialog(null, { kind: "event", d: sk, time: st, end: minToT(Math.min(tMin(st) + 30, 1439)) }); });
  function blockMoved(x) {
    if (x.src === "task") { const t = MP.S.tasks[x.id]; if (!t || !t.cal) return MP.render(); t.cal = { d: x.nk, t: minToT(x.ns) }; t.u = Date.now(); MP.changed(); MP.render(); MP.toast("Moved to " + fmtT(minToT(x.ns))); return taskCalSync(x.id); }
    if (x.src === "tt") {
      if (x.nk !== x.k) { MP.toast("Routine blocks move within their own day. Use Timetable to change other days."); return MP.render(); }
      const r = ttFor(parseISO(x.k)).find((y) => y.id === x.id); MP.render();
      return scopeAsk({ src: "tt", id: x.id, k: x.k, title: r ? r.text : "", patch: { start: minToT(x.ns), end: minToT(Math.min(x.ne, 1439)) } });
    }
    if (x.src === "ev") {
      const e = MP.S.events[x.id]; if (!e) return MP.render(); const patch = evTimes(e, x.nk, x.ns, x.ne);
      if (e.rep) { if (x.nk !== x.k) { MP.render(); return evOccurrence(x.id, x.k, Object.assign(patch, { d: x.nk })); } MP.render(); return scopeAsk({ src: "ev", id: x.id, k: x.k, title: e.t, patch }); }
      Object.assign(e, patch); e.u = Date.now(); MP.changed(); MP.render(); MP.toast("Moved to " + fmt(parseISO(x.nk), { weekday: "short", day: "numeric" }) + ", " + fmtT(minToT(x.ns))); evPush(x.id);
    }
  }

  V.planner = () => {
    const m = view.pm || (view.pm = new Date(today().getFullYear(), today().getMonth(), 1)), y = m.getFullYear(), t = today();
    if (view.plan === "year") return `${head("Year at a glance", String(y), `<div class="row"><button class="btn ghost sm" data-py="-1" aria-label="Previous year">‹</button><button class="btn ghost sm" data-py="1" aria-label="Next year">›</button><div class="tabs"><button data-pv="month">Month</button><button class="on" data-pv="year">Year</button></div></div>`)}<div class="grid g3">${[...Array(12)].map((_, mi) => { const f = new Date(y, mi, 1), st = addD(f, -((f.getDay() + 6) % 7)); return `<section class="card stack"><button class="link mname" data-ym="${mi}">${fmt(f, { month: "long" })}</button><div class="mini">${[...Array(42)].map((_, k2) => { const d = addD(st, k2), mo = moonOf(d); return `<span class="${d.getMonth() !== mi ? "o" : ""} ${mo === "P" ? "c-moon" : mo === "A" ? "c-ama" : ""} ${iso(d) === iso(t) ? "td" : ""}">${d.getDate()}</span>`; }).join("")}</div></section>`; }).join("")}</div>`;
    const f = new Date(y, m.getMonth(), 1), st = addD(f, -((f.getDay() + 6) % 7)), weeks = Math.ceil((((f.getDay() + 6) % 7) + new Date(y, m.getMonth() + 1, 0).getDate()) / 7);
    const EV = live("events").map(([id, e]) => Object.assign({ id }, e)), DT = live("dates").map(([id, e]) => Object.assign({ id }, e));
    let cells = "<span></span>" + ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((x) => `<span class="h">${x}</span>`).join("");
    for (let w = 0; w < weeks; w++) {
      cells += `<span class="wk">WEEK ${w + 1}</span>`;
      for (let k2 = 0; k2 < 7; k2++) {
        const d = addD(st, w * 7 + k2), ch = [], mo = moonOf(d), po = portalOf(d), md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (mo) ch.push(`<span class="chip ${mo === "P" ? "c-moon" : "c-ama"}">${mo === "P" ? "○" : "●"} ${moonName(mo)}</span>`);
        if (po) ch.push(`<span class="chip c-portal">✦ ${E(po.replace(" Portal", ""))}</span>`);
        DT.forEach((x) => { if (x.md === md) ch.push(`<span class="chip c-bday">${x.type === "Birthday" ? "✿" : "♥"} ${E(x.n)}</span>`); });
        EV.forEach((x) => { if (occurs(x, iso(d))) { const y = tzOnDay(x, iso(d)); ch.push(`<span class="chip c-ev">${y.time ? fmtT(y.time) + " " : ""}${E(x.t)}</span>`); } });
        gOn(iso(d)).slice(0, 4).forEach((g) => ch.push(`<span class="chip c-gcal" style="${g.color ? "border-left:3px solid " + E(g.color) : ""}">${!g.allDay && g.d === iso(d) ? fmtT(g.t) + " " : ""}${E(g.title)}</span>`));
        const h = d <= t ? actMins(d).done / 60 : 0; if (h) ch.push(`<span class="c-study">${h.toFixed(1)} h done</span>`);
        cells += `<button class="day ${d.getMonth() !== m.getMonth() ? "out" : ""} ${iso(d) === iso(t) ? "today" : ""}" data-day="${iso(d)}" aria-label="${fmt(d, { weekday: "long", day: "numeric", month: "long" })}"><span class="n">${d.getDate()}</span>${ch.join("")}</button>`;
      }
    }
    return `${head("Week by week · Mon–Sun", `${fmt(m, { month: "long" })} <em>${y}</em>`, `<div class="row"><button class="btn ghost sm" data-pm="-1" aria-label="Previous month">‹</button><button class="btn ghost sm" data-pm="0">Today</button><button class="btn ghost sm" data-pm="1" aria-label="Next month">›</button><div class="tabs"><button class="on" data-pv="month">Month</button><button data-pv="year">Year</button></div></div>`)}
      <div class="row small legend"><span class="chip c-moon">○ Purnima</span><span class="chip c-ama">● Amavasya</span><span class="chip c-portal">✦ Portal</span><span class="chip c-bday">✿ Birthday · ♥ Anniversary</span><span class="chip c-ev">Event</span></div>
      <div class="cal">${cells}</div>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Add an event</span><div class="row"><input class="f" type="date" id="evd" value="${iso(t)}" style="width:auto" aria-label="Date"><input class="f" type="time" id="evtm" style="width:auto" aria-label="Time (optional)"><input class="f" id="evt" maxlength="120" placeholder="e.g. Mock test" style="flex:1;min-width:140px" aria-label="Event"><button class="btn" data-addev>Add</button></div>
      ${EV.filter((e) => e.d >= iso(addD(t, -1))).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 12).map((e) => `<div class="between small wrap"><span><b>${fmt(parseISO(e.d), { day: "numeric", month: "short" })}${e.time ? " · " + fmtT(e.time) : ""}</b> · ${E(e.t)}</span><span class="row" style="gap:6px">${calBtn("ev-" + e.id, e.t, { kind: "event", e })}<button class="tool" data-evdel="${E(e.id)}" aria-label="Delete event">${ic("trash", 16)}</button></span></div>`).join("")}</section>
      <section class="card stack"><span class="lab">Week goals · saved per week</span>${[...Array(weeks)].map((_, w) => { const wk = iso(addD(st, w * 7)); return `<label class="row small" style="gap:8px"><b style="width:56px">Week ${w + 1}</b><input class="f" style="flex:1" maxlength="200" data-wkf="goal" data-wk="${wk}" value="${E((MP.S.weeks[wk] || {}).goal || "")}" placeholder="Goal for this week"></label>`; }).join("")}<span class="tiny muted">Purnima / Amavasya: tithi at sunrise, New Delhi. Fasting (vrat) days can fall a day earlier; check your family calendar for those.</span></section></div>`;
  };

  V.todo = () => {
    const G = taskGroups(), months = {};
    G.done.forEach((t) => { const m = t.doneAt ? fmt(new Date(t.doneAt), { month: "long", year: "numeric" }) : "Before 18 Nov 2026"; (months[m] = months[m] || []).push(t); });
    const sec = (title, arr, extra = "") => (arr.length ? `<section class="card stack mb"><div class="between wrap"><span class="lab">${title} · ${arr.length}</span>${extra}</div><div class="ttable">${taskHead()}${arr.map(taskRow).join("")}</div></section>` : "");
    const fmtLong = (k) => (k ? fmt(parseISO(k), { day: "numeric", month: "short", year: "numeric" }) : "—");
    return `${head("One list · priority is set from Urgent + Important", "To-Do", `<button class="btn" data-tnew>${ic("plus", 16)} New task</button>`)}
      ${quickBox()}<div class="mb"></div>${sec('<span class="over">Overdue</span>', G.overdue, moveAll())}
      ${sec("Today", G.today) || '<section class="card mb"><span class="small muted">Nothing for today. Tap New task.</span></section>'}
      ${sec("Upcoming", G.upcoming)}${sec("Inbox · no date yet", G.inbox)}
      <section class="card stack"><div class="between wrap"><span class="lab">Completed tasks · ${G.done.length}</span><input class="f" data-tq placeholder="Search completed tasks" style="width:auto;min-width:200px" aria-label="Search completed tasks"></div>
      ${Object.keys(months).map((m, i) => `<details ${i === 0 ? "open" : ""}><summary class="small b">${E(m)} · ${months[m].length}</summary><div class="ctab"><div class="ch">Task</div><div class="ch">Priority</div><div class="ch">Created</div><div class="ch">Completed</div><div class="ch"></div>
        ${months[m].map((t) => `<div class="cr" data-ctrow="${E(t.t.toLowerCase())}"><div>${E(t.t)}</div><div><span class="pill tiny ${TPRI[tPri(t)][1]}">${TPRI[tPri(t)][0]}</span></div><div>${fmtLong(tCreated(t))}</div><div>${t.doneAt ? fmtLong(dayOf(t.doneAt)) : "before 18 Nov 2026"}</div><div><button class="link tiny" data-tundo="${E(t.id)}">Not done</button></div></div>`).join("")}</div></details>`).join("") || '<span class="small muted">Tasks you tick done are listed here with the date each was created and completed.</span>'}</section>`;
  };
  /* The task form: Date, Task, Urgent, Important, Due date, sub-tasks, post-it, 5-minute Calendar block. */
  const chk = (id) => !!(document.getElementById(id) || {}).checked;
  function calSlot(dk) { /* 2 hours from now, rounded up to 5 minutes; past midnight goes to the next day */
    const later = new Date(Date.now() + 2 * 3600e3); let m = Math.ceil((later.getHours() * 60 + later.getMinutes()) / 5) * 5, d = dk;
    if (iso(later) !== iso(new Date()) || m >= 1440) d = iso(addD(parseISO(dk), 1));
    if (m >= 1440) m -= 1440; return { d, t: minToT(Math.min(m, 1430)) };
  }
  function taskDialog(id, preset) {
    const t = id ? Object.assign({}, MP.S.tasks[id]) : Object.assign({ t: "", d: iso(today()), urg: false, imp: true, due: "", pin: false, sub: [] }, preset || {});
    const k = tDay(t), signed = mode === "google", sent = id && MP.S.sent["task-" + id] && !MP.S.sent["task-" + id].del;
    modal(`<div class="between"><h2>${id ? "Edit task" : "New task"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="grid g2"><label class="stack small">Date<input class="f" type="date" id="tfd" value="${E(k || iso(today()))}"></label><label class="stack small">Due date (deadline, optional)<input class="f" type="date" id="tfdue" value="${E(t.due && t.due !== k ? t.due : t.due || "")}"></label></div>
      <label class="row small"><input type="checkbox" id="tfinbox" data-tfp ${id && !k ? "checked" : ""}> No date yet: keep it in the Inbox</label>
      <label class="stack small">Task<textarea class="f" id="tft" rows="3" maxlength="1000" placeholder="Write it in as much detail as you like">${E(t.t)}</textarea></label>
      <div class="row"><label class="pill row"><input type="checkbox" id="tfu" data-tfp ${t.urg ? "checked" : ""}> Urgent</label><label class="pill row"><input type="checkbox" id="tfi" data-tfp ${t.imp ? "checked" : ""}> Important</label><span class="small accb" id="tfpri"></span></div>
      <label class="stack small">Steps (optional, one per line)<textarea class="f" id="tfsub" rows="2" maxlength="3000" placeholder="e.g. Find the form&#10;Fill it in&#10;Post it">${E((t.sub || []).map((x) => x.t).join("\n"))}</textarea></label>
      <label class="row small"><input type="checkbox" id="tfpin" ${t.pin ? "checked" : ""}> Show as a post-it on Today</label>
      <div class="row small" style="gap:8px;flex-wrap:wrap"><label class="row"><input type="checkbox" id="tfcal" data-tfp ${sent ? "checked" : ""} ${signed ? "" : "disabled"}> Add to Google Calendar as a 5-minute block</label><label class="row tfcalt" ${sent ? "" : "hidden"}>at <input class="f" type="time" id="tfct" value="${E(sent && t.cal ? t.cal.t : calSlot(k || iso(today())).t)}" style="width:auto"></label>${signed ? "" : '<span class="muted">(sign in with Google to use)</span>'}</div>
      <div class="row" style="justify-content:flex-end">${id ? `<button class="btn ghost danger" data-tdel="${E(id)}">Delete</button>` : ""}<button class="btn ghost" data-close>Cancel</button><button class="btn" data-tsave="${E(id || "")}">${id ? "Save" : "Add task"}</button></div>`);
    tfRefresh();
  }
  function tfRefresh() {
    const out = document.getElementById("tfpri"); if (!out) return;
    out.textContent = "→ Priority: " + TPRI[tPri({ urg: chk("tfu"), imp: chk("tfi") })][0];
    document.querySelectorAll(".tfcalt").forEach((x) => (x.hidden = !chk("tfcal")));
    const d = document.getElementById("tfd"); if (d) d.disabled = chk("tfinbox");
  }
  async function taskSave(id) {
    const txt = ((document.getElementById("tft") || {}).value || "").trim().slice(0, 1000); if (!txt) { MP.toast("Write the task first"); return; }
    const inbox = chk("tfinbox"), d = inbox ? "" : field("tfd") || iso(today()), tid = id || uid(), old = MP.S.tasks[tid] || {};
    const lines = ((document.getElementById("tfsub") || {}).value || "").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 30);
    const sub = lines.map((x) => (old.sub || []).find((o) => o.t === x) || { id: uid(), t: x.slice(0, 200), done: false });
    const rec = Object.assign({}, old, { t: txt, d, inbox, due: field("tfdue"), urg: chk("tfu"), imp: chk("tfi"), pin: chk("tfpin"), sub, c: old.c || Date.now(), done: !!old.done });
    delete rec.del; delete rec.id; if (rec.pin && !old.pin) rec.pinO = Date.now();
    if (chk("tfcal") && mode === "google") { const ct = field("tfct"), slot = calSlot(d || iso(today())); rec.cal = { d: !old.cal && ct === slot.t ? slot.d : (old.cal && old.cal.t === ct ? old.cal.d : d || iso(today())), t: ct || slot.t }; } else delete rec.cal;
    putRec("tasks", tid, rec); closeModal(); MP.render(); MP.toast(id ? "Saved" : inbox ? "Added to the Inbox" : "Added to your list");
    await taskCalSync(tid);
  }
  const taskEv = (t) => { const ev = timedEv((t.done ? "✓ " : "") + "To-do · " + t.t.split("\n")[0].slice(0, 100), t.cal.d, t.cal.t, minToT(tMin(t.cal.t) + 5)); ev.description = t.t + "\n\nPriority: " + TPRI[tPri(t)][0] + (t.due ? "\nDue: " + t.due : ""); ev.colorId = PRICOL[TPRI[tPri(t)][2]]; ev.reminders = remind(0); return ev; };
  async function taskCalSync(tid) {
    const t = MP.S.tasks[tid], key = "task-" + tid, s = MP.S.sent[key], had = s && !s.del;
    if (mode !== "google" || (!had && (!t || !t.cal))) return;
    try {
      if (!t || t.del || !t.cal) { await calRemove(key); return; }
      if (had) await G.calPatch(s.id, taskEv(t));
      else { const cid = await G.calInsert(taskEv(t)); MP.S.sent[key] = { id: cid, u: Date.now() }; MP.changed(); MP.toast("Added to your Google Calendar"); MP.render(); }
    } catch (e) { MP.toast(e.reauth ? "Please tap sync to reconnect, then try again." : "Calendar: " + e.message); }
  }
  function markDone(id, on) {
    const x = MP.S.tasks[id]; if (!x) return;
    x.done = on; x.doneAt = on ? Date.now() : null; x.u = Date.now(); MP.changed(); MP.render();
    if (x.cal) taskCalSync(id);
  }
  function postitPad(id) {
    const t = MP.S.tasks[id]; if (!t) return;
    modal(`<div class="between"><h2>Post-it</h2><button class="tool" data-pclose aria-label="Close">✕</button></div><b class="small">${E(t.t)}</b>${MP.padHTML("postit-" + id, 5, 40)}<div class="row" style="justify-content:flex-end"><button class="btn" data-pclose>Done</button></div>`);
    MP.setupPads();
  }

  V.affirm = () => {
    const a = dailyAff(today()), C = P().collections;
    return `${head("Today and your library", "Affirmations")}
      <section class="card stack mb"><span class="lab">Today</span><p class="quote" style="font-size:28px">“${E(a.text)}”</p><span class="tiny muted">${E(a.src)}</span></section>
      <div class="row mb">${Object.keys(D.aff).filter((k) => k !== "calm").map((k) => `<label class="pill row"><input type="checkbox" data-col="${k}" ${C[k] ? "checked" : ""}> ${D.aff[k].name}</label>`).join("")}</div>
      <div class="grid g2">${Object.keys(D.aff).map((k) => `<section class="card stack ${k !== "calm" && !C[k] ? "dim" : ""}"><div><div class="lab">${D.aff[k].name}</div><div class="tiny muted">${D.aff[k].note}</div></div>${D.aff[k].items.map((x, i) => `<div class="between" style="align-items:flex-start;gap:8px"><span class="aff">${E(x[0])}${x[1] ? `<br><span class="tiny muted">${E(x[1])}</span>` : ""}</span><button class="tool ${P().fav.includes(k + ":" + i) ? "fav" : ""}" data-fav="${k}:${i}" aria-label="Favourite">${ic("star", 18)}</button></div>`).join("")}</section>`).join("")}
      <section class="card stack"><div class="lab">My lines · private</div><div class="tiny muted">Add favourite lines from your own books, or write your own. They join the daily rotation.</div>${P().mine.map((x, i) => `<div class="between"><span class="aff">${E(x)}</span><button class="tool" data-mdel="${i}" aria-label="Delete">${ic("trash", 16)}</button></div>`).join("")}<div class="row"><input class="f" id="mine" maxlength="240" placeholder="Type your line" style="flex:1"><button class="btn sm" data-addmine>Add</button></div></section></div>
      <section class="card between mt"><span class="small">Want to write more? The Journal has gratitude, thought records, scripting, prompts and more.</span><button class="btn ghost sm" data-go="journal">${ic("journal", 16)} Open Journal</button></section>`;
  };


  /* ---------- Journal: trending formats; private, never shared ---------- */
  const PROMPTS = ["What is taking up the most space in my mind today, and why?", "What did I learn about myself this week?", "When did I feel most like myself recently?", "What am I avoiding, and what is one small step towards it?", "What would I tell a friend in my situation?", "Which belief about myself is ready to be retired?", "What does a good day look like for me right now?", "What drained my energy today, and what gave it back?", "What am I proud of that nobody else saw?", "Where in my body do I feel stress, and what is it telling me?", "What boundary would make my life easier?", "Who do I want to thank, and for what?", "What is one thing I can let be good enough?", "What would my future self want me to start today?", "What did I do today just for me?", "Which fear is smaller than it looks?", "What surprised me today?", "What did I handle better than I would have a year ago?", "If my week had a title, what would it be?", "What do I need more of, and less of?", "What made me laugh recently?", "Which small habit is quietly changing my life?", "What question have I been afraid to ask?", "What does rest actually look like for me?", "Describe a place where I feel completely at ease.", "What am I learning in my studies that excites me?", "What would I do with a free, guilt-free day?", "What is a kind thing I can say to myself right now?", "What is one conversation I need to have?", "What did a difficult moment teach me?"];
  const SHADOW = ["What trait in others irritates me most, and where might it live in me?", "What did I learn as a child about anger, and how do I express it now?", "When do I feel jealous, and what does it show me I want?", "What do I pretend not to care about?", "What part of me do I hide to be liked?", "Which criticism stings the most, and why?", "What would I do differently if no one was watching?", "What am I still waiting for someone else to give me permission for?", "When do I abandon my own needs?", "What story about myself am I ready to rewrite?"];
  const JT = [
    ["free", "Free write · morning pages", "Write whatever comes, without stopping or editing. Many people fill about three pages first thing in the morning.", [["", 14]]],
    ["grat", "Gratitude", "Three specific things, and why each mattered.", [["1. I'm grateful for…", 2], ["2. I'm grateful for…", 2], ["3. I'm grateful for…", 2]]],
    ["am", "Morning intention + evening review", "Two minutes in the morning, two at night.", [["Morning · three things I'm grateful for", 3], ["Morning · what would make today great?", 3], ["Morning · today's affirmation", 1], ["Evening · three good things that happened", 3], ["Evening · how could today have been even better?", 2]]],
    ["prompt", "Prompt of the day", "A new question every day.", [["@prompt", 8]]],
    ["shadow", "Shadow work", "Gentle questions about the parts of you that are easy to ignore. Go slowly; stop if it feels heavy.", [["@shadow", 9]]],
    ["cbt", "Thought record (CBT)", "Untangle a difficult thought, step by step.", [["Situation · what happened?", 2], ["Automatic thought · what went through my mind?", 2], ["Emotion · what did I feel, and how strongly (0–100)?", 1], ["Evidence for the thought", 2], ["Evidence against the thought", 2], ["Balanced thought", 2], ["Emotion now (0–100)", 1]]],
    ["script", "Scripting", "Write about your goal as if it has already happened, in the present tense, with feeling and detail.", [["Today is… and I am so grateful that…", 10]]],
    ["321", "3-2-1", "Quick and light.", [["3 joys from today", 3], ["2 things I appreciate about myself", 2], ["1 moment I want to remember", 1]]],
    ["rbt", "Rose · Bud · Thorn", "A highlight, something growing, and a challenge.", [["Rose · a highlight", 2], ["Bud · something I'm looking forward to", 2], ["Thorn · a challenge", 2]]],
    ["dream", "Dream journal", "Write it down before it fades.", [["What happened in the dream?", 6], ["How did it feel, and what might it connect to?", 3]]],
    ["dump", "Brain dump", "Empty your head: tasks, worries, ideas. Sort later.", [["", 12]]],
    ["letter", "Letter to future me", "Write to yourself a year from now.", [["Dear future me,", 12]]],
    ["line", "One line a day", "A single line each day. See the same date from earlier years below.", [["Today in one line", 1]]]
  ];
  const jKey = (k, tpl, i) => (tpl === "free" ? "journal-" + k : `jr-${k}-${tpl}-${i}`);
  const hasEntry = (key) => { const t = MP.S.typed[key], n = MP.S.ink[key]; return (t && t.l && t.l.some(Boolean)) || (n && n.s && n.s.length); };
  V.diary = () => (MP.diaryView ? MP.diaryView() : "");
  V.vault = () => (MP.vaultView ? MP.vaultView() : "");
  V.journal = () => {
    const k = view.jd || iso(today()), d = parseISO(k), tplId = view.jt || P().journalTpl || "grat", tpl = JT.find((x) => x[0] === tplId) || JT[1], n = Math.floor(d.getTime() / 864e5);
    const fields = tpl[3].map((f, i) => {
      const label = f[0] === "@prompt" ? PROMPTS[(n + (view.jshuf || 0)) % PROMPTS.length] : f[0] === "@shadow" ? SHADOW[(n + (view.jshuf || 0)) % SHADOW.length] : f[0];
      return `<section class="stack" style="gap:6px">${label ? `<span class="${f[0].startsWith("@") ? "quote jq" : "lab"}">${E(label)}</span>` : ""}${MP.padHTML(jKey(k, tpl[0], i), f[1], 40)}</section>`;
    }).join("");
    let extra = "";
    if (tpl[0] === "line") { const past = [1, 2, 3, 4, 5].map((y) => { const pd = new Date(d.getFullYear() - y, d.getMonth(), d.getDate()), pk = jKey(iso(pd), "line", 0), t = MP.S.typed[pk]; return t && t.l && t.l[0] ? `<div class="small"><b>${pd.getFullYear()}</b> · ${E(t.l[0])}</div>` : ""; }).join(""); extra = `<section class="card stack mt"><span class="lab">On this day</span>${past || '<span class="small muted">Earlier years will appear here.</span>'}</section>`; }
    const entries = {}; [...Object.keys(MP.S.typed), ...Object.keys(MP.S.ink)].forEach((key) => { let m = key.match(/^jr-(\d{4}-\d{2}-\d{2})-(\w+)-/) || key.match(/^journal-(\d{4}-\d{2}-\d{2})$/); if (m && hasEntry(key)) { const dk = m[1], t = m[2] || "free"; (entries[dk] = entries[dk] || new Set()).add(t); } });
    const recent = Object.keys(entries).sort().reverse().slice(0, 14);
    const shuffle = tpl[0] === "prompt" || tpl[0] === "shadow" ? `<button class="link" data-jshuf>Another question</button>` : "";
    return `${head(`${fmt(d, { weekday: "long", day: "numeric", month: "long" })} · ${ic("lock", 12)} private`, "Journal", `<div class="row"><input class="f" type="date" value="${k}" max="${iso(today())}" data-jdate style="width:auto" aria-label="Journal date"></div>`)}
      <section class="card stack mb"><div class="between wrap"><label class="row small" style="gap:8px"><span class="lab">Format</span>${sel("data-jtpl", JT.map((x) => [x[0], x[1]]), tpl[0], 'style="width:auto;font-weight:700" aria-label="Journal format"')}</label>${shuffle}</div><span class="small muted">${E(tpl[2])}</span></section>
      <div class="stack" style="gap:16px">${fields}</div>${extra}
      <section class="card stack mt"><span class="lab">Recent entries</span>${recent.map((dk) => `<div class="between small"><button class="link" data-jgo="${dk}">${fmt(parseISO(dk), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</button><span class="muted">${[...entries[dk]].map((t) => (JT.find((x) => x[0] === t) || [t, t])[1]).join(" · ")}</span></div>`).join("") || '<span class="small muted">Your entries will be listed here.</span>'}<span class="tiny muted">${ic("lock", 12)} Your journal is private. It is never included in the family summary.</span></section>`;
  };

  V.three = () => {
    const pr = P().practice, t = today(), k = iso(t), rec = dayRec(k), sits = rec.sits || {};
    const start = pr.start ? parseISO(pr.start) : null, day = start ? Math.floor((t - start) / 864e5) + 1 : 0;
    let done = 0; if (start) for (let i = 0; i < pr.len; i++) { const s = (MP.S.days[iso(addD(start, i))] || {}).sits || {}; if (s.m && s.a && s.n) done++; }
    return `${head(start && day >= 1 ? `Day ${Math.min(day, pr.len)} of ${pr.len}` : "Write it 3, 6 and 9 times", "3-6-9 Practice")}
      <section class="card stack mb"><span class="lab">My affirmation</span><textarea class="f quoteinput" rows="2" maxlength="240" data-prf="text" placeholder="e.g. I am calm, focused and fully prepared.">${E(pr.text)}</textarea>
      <div class="row small"><label class="row" style="gap:6px">Start<input class="f" type="date" value="${E(pr.start)}" data-prf="start" style="width:auto"></label><span class="muted">Length</span>${[21, 33, 45].map((n) => `<button class="pill num ${pr.len === n ? "sel" : ""}" data-plen="${n}">${n} days</button>`).join("")}</div>
      ${start ? `<div class="dotrow">${"●".repeat(done)}${"○".repeat(Math.max(0, pr.len - done))}</div><span class="tiny muted">${done} of ${pr.len} days complete</span>` : ""}</section>
      <div class="stack" style="gap:18px">${[["Morning", 3, "m"], ["Afternoon", 6, "a"], ["Night", 9, "n"]].map((s) => `<section class="stack"><div class="between"><h2>${s[0]} · write it ${s[1]}×</h2><label class="pill row"><input type="checkbox" data-sit="${s[2]}" ${sits[s[2]] ? "checked" : ""}> Done</label></div>${MP.padHTML("369-" + k + "-" + s[2], s[1], 46)}</section>`).join("")}</div>
      <p class="tiny muted">Use the pen or keyboard icon on each toolbar to switch between writing and typing. Your palm can rest on the screen while you write with the S Pen.</p>`;
  };

  V.mood = () => {
    const t = today(), k = iso(t), rec = dayRec(k), md = rec.mood || {};
    const mk = (slot, label) => `<section class="card stack"><span class="lab">${label}</span><div class="row">${Object.keys(MOODCOL).map((w) => `<button class="moodbtn" data-mood="${slot}:${w}" style="${(md[slot] || {}).w === w ? `background:${MOODCOL[w]};color:#1d1d1d` : ""}">${w}</button>`).join("")}</div><div class="row small"><span class="muted">Strength</span>${[1, 2, 3, 4, 5].map((n) => `<button class="pill num ${(md[slot] || {}).s === n ? "sel" : ""}" data-ms="${slot}:${n}">${n}</button>`).join("")}</div></section>`;
    const y = t.getFullYear();
    const pix = `<div class="pix"><span></span>${"JFMAMJJASOND".split("").map((x) => `<span class="muted c b">${x}</span>`).join("")}${[...Array(31)].map((_, di) => `<span class="muted r">${di + 1}</span>` + [...Array(12)].map((_, mi) => { const d = new Date(y, mi, di + 1); if (d.getMonth() !== mi) return "<span></span>"; const w = moodOf(d); return `<i style="${w ? "background:" + MOODCOL[w] : ""}" title="${iso(d)} ${w}"></i>`; }).join("")).join("")}</div>`;
    const days = [...Array(14)].map((_, i) => addD(t, i - 13));
    const pairs = Object.keys(MP.S.days).map((kk) => { const r = MP.S.days[kk]; const w = r.mood && (r.mood.pm || r.mood.am || {}).w; return w && r.sleep ? [r.sleep, MOODVAL[w]] : null; }).filter(Boolean);
    const hi = pairs.filter((p) => p[0] >= 7), lo = pairs.filter((p) => p[0] < 7), avg = (a) => a.reduce((s, p) => s + p[1], 0) / a.length;
    const insight = hi.length >= 4 && lo.length >= 4 ? `On days you slept 7+ hours, your mood averaged <b>${Math.round(avg(hi) * 100)}</b> vs <b>${Math.round(avg(lo) * 100)}</b> on shorter nights (out of 100).` : "Log mood and sleep for a couple of weeks to see your patterns here.";
    return `${head("Morning and evening check-in", "Mood & Wellness")}
      <div class="grid g2">${mk("am", "Morning")}${mk("pm", "Evening · at daily review")}</div>
      <section class="card stack mt"><span class="lab">What affected my mood? (optional)</span><input class="f" maxlength="240" placeholder="Type here" value="${E(rec.note || "")}" data-dayf="note"></section>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Wellness</span>${wellRows(rec, k)}
      <label class="between small">Slept (hours)<input class="f" type="number" min="0" max="16" step=".5" value="${rec.sleep ?? ""}" style="width:90px" data-sleep></label>
      <span class="lab">Grateful for</span>${MP.padHTML("grateful-" + k, 2, 40)}<span class="lab">Today's win</span>${MP.padHTML("win-" + k, 2, 40)}</section>
      <section class="card stack"><span class="lab">Mood vs sleep · last 14 days</span>${lineChart([days.map((d) => { const w = moodOf(d); return w ? MOODVAL[w] : null; }), days.map((d) => { const r = MP.S.days[iso(d)]; return r && r.sleep ? Math.min(1, Math.max(0, (r.sleep - 4) / 6)) : null; })], days.map((d) => d.getDate()), 130)}<div class="row tiny"><span class="accb">— mood</span><span style="color:var(--acc2);font-weight:700">— sleep</span></div><p class="small" style="margin:0">${insight}</p></section></div>
      <section class="card stack mt tablewrap"><div class="between"><span class="lab">Year in Pixels · ${y}</span><span class="tiny muted">${ic("lock", 12)} Private · never in the family summary</span></div><div style="min-width:420px;max-width:560px">${pix}</div><div class="row tiny">${Object.entries(MOODCOL).map(([w, c]) => `<span class="row" style="gap:4px"><i class="key" style="background:${c}"></i>${w}</span>`).join("")}</div></section>`;
  };

  V.dates = () => {
    const t = today(), DT = live("dates").map(([id, x]) => Object.assign({ id }, x)).map((x) => { const [mm, dd] = String(x.md).split("-").map(Number); let nx = new Date(t.getFullYear(), mm - 1, dd); if (nx < t) nx = new Date(t.getFullYear() + 1, mm - 1, dd); return Object.assign(x, { nx, days: Math.round((nx - t) / 864e5) }); }).sort((a, b) => a.days - b.days);
    return `${head("Birthdays and anniversaries", "Special Dates")}
      <section class="card stack mb"><div class="between wrap"><span class="lab">Add someone · repeats every year</span>${mode === "google" && live("dates").some(([id]) => !(MP.S.sent["date-" + id] && !MP.S.sent["date-" + id].del)) ? `<button class="link" data-dallcal>${ic("cal", 16)} Add all to Google Calendar</button>` : ""}</div><div class="row"><input class="f" id="dn" maxlength="60" placeholder="Name" style="flex:1;min-width:120px"><input class="f" id="dr" maxlength="40" placeholder="Relation (e.g. Cousin)" style="flex:1;min-width:120px">${sel('id="dty"', ["Birthday", "Anniversary"], "Birthday", 'style="width:auto"')}<input class="f" id="dd" type="date" style="width:auto" aria-label="Date"><button class="btn" data-adddate>Add</button></div></section>
      <section class="card tablewrap"><table class="t"><thead><tr><th>Name</th><th>Relation</th><th>Type</th><th>Next</th><th></th></tr></thead><tbody>
      ${DT.map((x) => `<tr><td><b>${E(x.n)}</b></td><td>${E(x.rel || "")}</td><td><span class="chip c-bday">${E(x.type)}</span></td><td class="small">${fmt(x.nx, { day: "numeric", month: "short" })} · ${x.days === 0 ? "today" : "in " + x.days + " days"}</td><td><span class="row" style="gap:6px;flex-wrap:nowrap">${calBtn("date-" + x.id, x.n + " · " + x.type, { kind: "date", x })}<button class="tool" data-ddel="${E(x.id)}" aria-label="Delete">${ic("trash", 16)}</button></span></td></tr>`).join("") || `<tr><td colspan="5" class="small muted">No dates yet.</td></tr>`}
      </tbody></table><p class="tiny muted">Each one repeats every year. "Send to Calendar" adds a yearly event with a reminder at 9 AM the day before.</p></section>`;
  };

  V.history = () => {
    const k = view.hist || iso(addD(today(), -1)), d = parseISO(k), rec = MP.S.days[k] || {}, m = rec.mood || {};
    const q = view.q.trim().toLowerCase();
    let results = "";
    if (q.length >= 2) {
      const hits = [];
      tasks().forEach((x) => { if (x.t.toLowerCase().includes(q)) hits.push(["To-Do", x.t, x.due || ""]); });
      live("events").forEach(([, x]) => { if (String(x.t).toLowerCase().includes(q)) hits.push(["Event", x.t, x.d]); });
      Object.entries(MP.S.typed).forEach(([key, v]) => { if (v && v.l && v.l.join(" ").toLowerCase().includes(q)) hits.push([key.startsWith("jr-") || key.startsWith("journal-") ? "Journal" : "Writing", v.l.filter(Boolean).join(" · "), (key.match(/\d{4}-\d{2}-\d{2}/) || [""])[0]]); });
      Object.entries(MP.S.days).forEach(([kk, v]) => { if (v.note && v.note.toLowerCase().includes(q)) hits.push(["Mood note", v.note, kk]); });
      Object.entries(MP.S.weeks).forEach(([kk, v]) => { const s = [v.goal, v.worked, v.change].filter(Boolean).join(" · "); if (s.toLowerCase().includes(q)) hits.push(["Week", s, kk]); });
      P().mine.forEach((x) => { if (x.toLowerCase().includes(q)) hits.push(["My lines", x, ""]); });
      results = `<section class="card stack mb"><span class="lab">${hits.length} result${hits.length === 1 ? "" : "s"}</span>${hits.slice(0, 50).map((h) => `<div class="between small wrap"><span><span class="pill tiny">${h[0]}</span> ${E(h[1]).slice(0, 200)}</span>${h[2] ? `<button class="link" data-hgo="${E(h[2])}">${E(h[2])}</button>` : ""}</div>`).join("")}</section>`;
    }
    return `${head("Nothing is ever overwritten", "History & Search", `<input class="f" type="date" value="${k}" max="${iso(today())}" data-hist style="width:auto" aria-label="Pick a date">`)}
      <section class="card row mb"><span style="color:var(--muted)">${ic("search", 18)}</span><input class="f" id="hq" value="${E(view.q)}" placeholder="Search to-dos, events, writing, notes, week goals…" style="flex:1" aria-label="Search"><button class="btn sm" data-hsearch>Search</button></section>${results}
      <div class="grid g3"><section class="card stack center"><span class="lab">${fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>${ring(dayPct(d) || 0, 110, 11, "HABITS")}</section>
      <section class="card stack"><span class="lab">Activities</span>${actRows(d).map((r) => `<div class="between small"><span>${fmtT(r.start)} · ${E(actOf(r))} · ${E(r.text)}</span><b>${rec.study && rec.study[r.id] ? "✓" : "–"}</b></div>`).join("") || '<span class="small muted">No blocks</span>'}${rec.focus ? `<div class="between small"><span>Focus</span><b>${rec.focus}/5</b></div>` : ""}</section>
      <section class="card stack"><span class="lab">Mood</span>${["am", "pm"].map((x) => (m[x] && m[x].w ? `<div class="between small"><span>${x === "am" ? "Morning" : "Evening"}</span><span class="pill" style="background:${MOODCOL[m[x].w]};color:#1d1d1d">${m[x].w}${m[x].s ? " · " + m[x].s : ""}</span></div>` : "")).join("") || '<span class="small muted">No entries</span>'}${rec.sleep ? `<div class="between small"><span>Slept</span><b>${rec.sleep} h</b></div>` : ""}</section></div>
      <section class="card stack mt"><span class="lab">Habits that day</span><div class="row">${P().habits.map((h) => { const v = (rec.h || {})[h.id] || "e"; return `<span class="row small" style="gap:6px">${dots(v + " smd", v)}${E(h.name)}</span>`; }).join("") || '<span class="small muted">No habits</span>'}</div></section>`;
  };

  /* ---------- print ---------- */
  const pHead = (sub) => { const t = today(); return `<div class="between"><div><div class="lab">${sub}</div><div class="phead">${E(P().name || "My")}’s Day</div></div><div style="text-align:right"><div class="lab">${fmt(t, { weekday: "long" })}</div><div style="font-family:var(--disp);font-size:17px">${fmt(t, { day: "numeric", month: "long", year: "numeric" })}</div><div class="tiny" style="color:#5B4B9A;font-weight:700">${E([portalOf(t), moonName(moonOf(t))].filter(Boolean).join(" · "))}</div></div></div>`; };
  const typedOf = (key) => ((MP.S.typed[key] && MP.S.typed[key].l) || []).filter(Boolean);
  const PV = {
    summary: () => { const t = today(), a = dailyAff(t); return `${pHead("Summary")}<div class="pquote">“${E(a.text)}”</div><div class="grid g2"><div class="stack" style="gap:6px"><div class="lab">Study blocks</div>${studyRows(t).map((r) => `<div class="small">○ <b>${fmtT(r.start)}</b> ${E(r.text)}</div>`).join("")}</div><div class="stack" style="gap:6px"><div class="lab">Top 3</div>${tasks().filter((x) => !x.done && x.b).slice(0, 3).map((x) => `<div class="small">○ ${E(x.t)}</div>`).join("")}<div class="lab" style="margin-top:6px">Habits</div><div class="small">${activeHabits().map((h) => "○ " + E(h.name.split(" ")[0])).join("  ")}</div></div></div><div class="tiny muted c cut">✂ half page · two days fit on one A4 sheet</div>`; },
    detailed: () => { const t = today(), a = dailyAff(t); let last = ""; const sec = { m: "Morning", a: "Afternoon", e: "Evening" }; return `${pHead("My daily rhythm")}<div class="pgrid"><div class="stack" style="gap:2px">${ttFor(t).map((r) => { let h = ""; const s = secOf(r.start); if (s !== last) { h = `<div class="psec">${sec[s]}</div>`; last = s; } return h + `<div class="prow ${isAct(r) ? "study" : ""}"><span>${fmtT(r.start)}${r.end ? "–" + fmtT(r.end) : ""}</span>${E(r.text)}</div>`; }).join("")}</div><div class="stack" style="gap:8px"><div class="pquote sm">“${E(a.text)}”</div><div class="lab">Top 3 to-dos</div>${(() => { const G = taskGroups(); return [...G.overdue, ...G.today.filter((x) => !x.done)].sort(tByPri).slice(0, 3); })().map((x) => `<div class="tiny">○ ${E(x.t.split("\n")[0])}</div>`).join("")}<div class="lab">Wellness</div><div class="tiny">Water ○○○○○○○○</div><div class="tiny">Mood 1 2 3 4 5 · Energy 1 2 3 4 5</div><div class="tiny">Slept ____ hrs</div><div class="lab">Grateful for</div><div class="pline hand">${E(typedOf("grateful-" + iso(t)).join(" "))}</div><div class="lab">Today's win</div><div class="pline hand">${E(typedOf("win-" + iso(t)).join(" "))}</div><div class="tiny" style="color:#5B4B9A;margin-top:auto">pause at 11:11 & 08:08 · breathe</div></div></div>`; },
    hourly: () => { const t = today(); let rows = ""; for (let h = 6; h <= 23; h++) { const ev = ttFor(t).filter((r) => Math.floor(tMin(r.start) / 60) === h); rows += `<div class="hrow"><span class="tiny muted b">${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}</span><div class="hev">${ev.map((r) => `<span class="tiny" style="border-left:3px solid ${TCOL[r.type]};${isAct(r) ? "background:var(--soft);font-weight:700" : ""}">${fmtT(r.start)} ${E(r.text)}</span>`).join("")}</div><span class="hnote"></span></div>`; } return `${pHead("Hourly time-blocks")}<div style="flex:1">${rows}</div>`; },
    journal: () => { if (lockOn() && !unlocked) return `${pHead("Journal spread")}<p class="small">${ic("lock", 14)} Your journal is locked. Open Journal, unlock it, then come back to print.</p>`; const t = today(), a = dailyAff(t), typed = typedOf("journal-" + iso(t)), inks = ((MP.S.ink["journal-" + iso(t)] || {}).s || []).length; return `${pHead("Journal spread")}<div class="pgrid eq"><div class="stack" style="gap:3px">${ttFor(t).map((r) => `<div class="tiny jrow ${isAct(r) ? "b" : ""}"><span class="muted">${fmtT(r.start)}</span> ${E(r.text)}</div>`).join("")}</div><div class="stack" style="gap:6px"><div class="pquote sm">“${E(a.text)}”</div><div class="lab">Dear diary</div>${typed.map((x) => `<div class="pline hand">${E(x)}</div>`).join("")}${inks ? `<canvas class="printink" data-printink="journal-${iso(t)}" height="300"></canvas>` : ""}${[...Array(Math.max(4, 14 - typed.length - (inks ? 6 : 0)))].map(() => `<div class="pline"></div>`).join("")}</div></div>`; }
  };
  V.print = () => { const pv = P().printView || "detailed"; return `${head("Preview before printing", "Print", `<button class="btn" data-print>${ic("print", 16)} Print / save as PDF</button>`)}<div class="row noprint mb"><label class="row small" style="gap:8px"><span class="lab">Layout</span>${sel("data-printsel", [["summary", "Summary one-pager"], ["detailed", "Detailed Daily Rhythm"], ["hourly", "Hourly time-block sheet"], ["journal", "Journal spread"]], pv, 'style="width:auto;font-weight:700" aria-label="Print layout"')}</label><span class="tiny muted">A4 portrait · uses your theme · typed and handwritten entries print too</span></div><section class="card a4" id="printarea">${PV[pv]()}</section>`; };

  /* ---------- Suggestions & feedback ---------- */
  const FB_TYPES = ["New feature", "Improve something", "Problem / bug", "Design & look", "Other"];
  const FB_IMP = ["Nice to have", "Important", "Urgent problem"];
  const fbTo = () => String(CFG.feedbackEmail || "").trim();
  const fbList = () => live("feedback").map(([id, f]) => Object.assign({ id }, f)).sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  const fbLine = (f) => `• [${f.type} · ${f.imp}${f.screen ? " · " + f.screen : ""}] ${f.text}`;
  const fbBrief = (items) => `My Planner suggestions from ${P().name || "a user"}${G.user && G.user.email ? " (" + G.user.email + ")" : ""}\nVersion ${MP.VERSION} · ${fmt(today(), { day: "numeric", month: "short", year: "numeric" })}\n\n` + items.map((f) => `${fmt(new Date(f.at), { day: "numeric", month: "short" })} ${fbLine(f)}`).join("\n\n");
  const fbDocHTML = () => `<html><body style="font-family:Arial"><h1>My Planner suggestions · ${E(P().name || "")}</h1><p>Shared with ${E(fbTo())} from My Planner. Only suggestions are in this document, never planner entries.</p>${fbList().map((f) => `<h3>${E(fmt(new Date(f.at), { day: "numeric", month: "long", year: "numeric" }))} · ${E(f.type)} · ${E(f.imp)}${f.screen ? " · " + E(f.screen) : ""}</h3><p>${E(f.text).replace(/\n/g, "<br>")}</p>`).join("")}</body></html>`;
  function openEmail(items) {
    const to = fbTo(); if (!to) { MP.toast("No feedback email is set up in this copy."); return; }
    const body = fbBrief(items).slice(0, 1800);
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent("My Planner suggestion" + (items.length > 1 ? "s" : "") + " · " + (P().name || ""))}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }
  async function syncFeedbackDoc() {
    const fs = P().fbShare; if (!fs.on || mode !== "google" || !fbTo()) return false;
    const id = await G.writeSummaryDoc(fbDocHTML(), fs.docId, `My Planner suggestions · ${P().name || "user"}`);
    if (id !== fs.docId) { await G.shareReader(id, fbTo()); fs.docId = id; touchP(); }
    return true;
  }
  V.ideas = () => {
    const list = fbList();
    return `${head("Tell us what would make My Planner better", "Suggestions")}
      <section class="card stack mb"><span class="lab">New suggestion</span>
      <div class="grid g3"><label class="stack small">Type${sel('id="fbtype"', FB_TYPES, FB_TYPES[0])}</label><label class="stack small">Which screen?${sel('id="fbscreen"', [["", "Whole app / not sure"], ...SCREENS.map((x) => [x[1], x[1]])], "")}</label><label class="stack small">How important?${sel('id="fbimp"', FB_IMP, FB_IMP[0])}</label></div>
      <label class="stack small">Your suggestion<textarea class="f" id="fbtext" rows="5" maxlength="2000" placeholder="Describe what you'd like added or changed, and why it would help you. (On a Samsung tab you can handwrite here with the S Pen.)"></textarea></label>
      <div class="row"><button class="btn" data-fbsend>Save & send to ${E(fbTo() ? "Vicky" : "the owner")}</button><button class="btn ghost" data-fbsave>Just save it for now</button></div>
      <span class="tiny muted">Sending opens a ready-written email to ${E(fbTo() || "the app owner")}; tap Send in your email app.${mode === "google" ? (P().fbShare.on ? " Your suggestions are also kept in a Google Doc shared with " + E(fbTo()) + "." : " You can also keep a running Google Doc of your suggestions shared with " + E(fbTo()) + ".") : ""}</span></section>
      <section class="card stack"><div class="between wrap"><span class="lab">My suggestions · ${list.length}</span>${list.length ? `<span class="row" style="gap:6px"><button class="btn ghost sm" data-fbbrief>View brief</button><button class="btn ghost sm" data-fbemailall>Email all</button></span>` : ""}</div>
      ${list.map((f) => `<div class="stack" style="gap:4px;border-bottom:1px solid var(--line);padding-bottom:10px"><div class="between wrap"><span class="small"><span class="pill tiny">${E(f.type)}</span> <span class="pill tiny out">${E(f.imp)}</span>${f.screen ? ` <span class="tiny muted">${E(f.screen)}</span>` : ""}</span><span class="tiny muted">${fmt(new Date(f.at), { day: "numeric", month: "short", year: "numeric" })} · ${f.status === "sent" ? "✓ sent" : "saved"}</span></div><span class="small" style="white-space:pre-wrap">${E(f.text)}</span><span class="row" style="gap:8px"><button class="link tiny" data-fbone="${E(f.id)}">Email this</button><button class="link tiny" data-fbdel="${E(f.id)}">Delete</button></span></div>`).join("") || '<span class="small muted">No suggestions yet. Your ideas are saved here and in your Google Drive.</span>'}
      ${mode === "google" && fbTo() ? `<label class="row small"><input type="checkbox" class="cb" data-fbshare ${P().fbShare.on ? "checked" : ""}> Keep my suggestions in a Google Doc shared with ${E(fbTo())}</label>` : ""}</section>`;
  };
  async function fbSubmit(send) {
    const text = field("fbtext"); if (text.length < 3) { MP.toast("Please write your suggestion first."); return; }
    const id = uid(), rec = { at: new Date().toISOString(), type: field("fbtype") || FB_TYPES[0], screen: field("fbscreen"), imp: field("fbimp") || FB_IMP[0], text: text.slice(0, 2000), status: send ? "sent" : "saved" };
    putRec("feedback", id, rec); MP.render();
    try { if (await syncFeedbackDoc()) MP.toast("Saved and added to your shared suggestions doc"); else MP.toast(send ? "Saved · opening your email" : "Saved"); } catch (e) { MP.toast("Saved. The shared doc will update at the next sync."); }
    if (send) openEmail([rec]);
  }

  /* ---------- Help & User Guide ---------- */
  const blockHTML = (b) => { const [k, v] = b; if (k === "p") return `<p class="small" style="margin:0;line-height:1.55">${E(v)}</p>`; if (k === "steps") return `<ol class="small hlist">${v.map((x) => `<li>${E(x)}</li>`).join("")}</ol>`; if (k === "list") return `<ul class="small hlist">${v.map((x) => `<li>${E(x)}</li>`).join("")}</ul>`; if (k === "tip") return `<div class="small soft" style="border-radius:12px;padding:10px 12px">💡 ${E(v)}</div>`.replace("💡", "Tip:"); return ""; };
  V.help = () => {
    const H = window.MP_HELP || [], q = (view.hq || "").trim().toLowerCase();
    const match = (s) => !q || (s.title + " " + JSON.stringify(s.body)).toLowerCase().includes(q);
    const shown = H.filter(match);
    return `${head("User guide · version " + E(MP.VERSION), "Help & Guide")}
      <section class="card row mb"><span class="muted">${ic("search", 18)}</span><input class="f" id="helpq" value="${E(view.hq || "")}" placeholder="Search the guide, e.g. sync, S Pen, post-it" style="flex:1" aria-label="Search the guide"></section>
      <section class="card stack mb"><span class="lab">Contents</span><div class="row">${H.map((s, i) => `<button class="pill out" data-hsec="${s.id}">${i + 1}. ${E(s.title)}</button>`).join("")}</div></section>
      <div class="stack" style="gap:14px">${shown.map((s) => `<section class="card stack" id="help-${s.id}"><div class="between wrap"><h2>${H.indexOf(s) + 1}. ${E(s.title)}</h2>${s.route ? `<button class="btn ghost sm" data-go="${s.route}">Open this screen →</button>` : ""}</div>${s.body.map(blockHTML).join("")}</section>`).join("") || '<p class="small muted">Nothing matches. Try another word.</p>'}</div>
      <p class="tiny muted c mt">Still stuck? Ask the person who set up My Planner for your family.</p>`;
  };

  /* ---------- settings ---------- */
  V.prefs = () => {
    const sh = P().share, acc = mode === "google" && G.user ? E(G.user.email) : "Demo mode · this device only";
    const mp = (P().menu || {}).preset || (P().menu ? "custom" : "full");
    return `${head("Make it yours", "Settings")}
      <section class="card stack mb" id="set-menu"><div class="between wrap"><span class="lab">Menu · choose the screens you see</span><span class="row" style="gap:6px"><button class="btn sm ${mp === "simple" ? "" : "ghost"}" data-menup="simple">Simple</button><button class="btn sm ${mp === "full" ? "" : "ghost"}" data-menup="full">Full</button></span></div>
        <div class="row">${SCREENS.filter((x) => x[0] !== "today" && x[0] !== "prefs").map((x) => `<label class="pill row"><input type="checkbox" data-menus="${x[0]}" ${shownScreen(x[0]) ? "checked" : ""}> ${x[1]}</label>`).join("")}</div>
        <span class="tiny muted">Hidden screens keep all their data; tick them again any time. Today and Settings always stay.</span>${P().menu && P().menu.chosen ? "" : `<button class="btn sm" data-menukeep style="align-self:flex-start">Keep this menu</button>`}</section>
      <section class="card stack mb" id="set-gcal"><span class="lab">Google Calendar · time zones · meeting links</span>
        ${mode !== "google" ? '<span class="small muted">Sign in with Google to see your Google Calendar inside the planner.</span>' : G.hasCal ? `<label class="row small"><input type="checkbox" data-gcon ${(P().gcal || {}).on !== false ? "checked" : ""}> Show my Google Calendar inside the planner (Today, Planner, Timetable, day sheets)</label>
          <div class="row small" style="gap:6px">Calendars: <b>${Object.values((P().gcal || {}).cals || { primary: { on: true, name: "Main calendar" } }).filter((v) => v.on).map((v) => E(v.name || "Main calendar")).join(", ")}</b><button class="btn ghost sm" data-gcpick>Choose calendars</button><button class="btn ghost sm" data-gcnow>Refresh now</button></div>`
          : `<div class="row"><button class="btn sm" data-gcconnect>Connect Google Calendar</button></div><span class="tiny muted">Shows the events in your Google Calendar inside the planner. Google will ask you to allow it once.</span>`}
        <span class="tiny muted">Google events are shown on this device only. They are never copied into your My Planner files in Drive, and they never go to Buddy.</span>
        <div class="grid g2"><label class="stack small">Home time zone${sel("data-tzhome", zoneOpts(HOME()), HOME())}</label><label class="stack small">Second time zone on the day page${sel("data-tz2", [["", "None"], ...zoneOpts(P().tz2 || "")], P().tz2 || "")}</label></div>
        <div class="grid g2"><label class="stack small">My Zoom link (optional)<input class="f" type="url" maxlength="300" data-mlink="zoom" value="${E((P().mlinks || {}).zoom || "")}" placeholder="https://zoom.us/j/…"></label><label class="stack small">My Teams link (optional)<input class="f" type="url" maxlength="300" data-mlink="teams" value="${E((P().mlinks || {}).teams || "")}" placeholder="https://teams.microsoft.com/…"></label></div></section>
      <section class="card stack mb" id="set-rit"><span class="lab">Plan my day · Shut down</span>
        <label class="row small"><input type="checkbox" data-ritplan ${RIT().plan !== false ? "checked" : ""}> Show Plan my day the first time I open the planner each morning</label>
        <label class="row small"><input type="checkbox" data-ritshut ${RIT().shut !== false ? "checked" : ""}> Remind me to shut down my day at <input class="f" type="time" data-ritat value="${E(RIT().at || "21:30")}" style="width:auto"></label>
        ${mode === "google" ? `<label class="row small"><input type="checkbox" data-ritcal ${RIT().cal ? "checked" : ""} ${G.hasCal ? "" : "disabled"}> Also as a daily Google Calendar reminder (rings even when the app is closed)${G.hasCal ? "" : " · connect Google Calendar above first"}</label>` : ""}</section>
      ${MP.voiceCard ? MP.voiceCard() : ""}
      <section class="card stack mb" id="set-lock"><span class="lab">Privacy · journal lock</span>
        ${lockOn() ? `<div class="small">${ic("lock", 14)} On: Journal, Mood, 3-6-9 and History ask for your PIN${bioId() ? " or fingerprint / face" : ""}. They lock again 5 minutes after you leave the app.</div>
        <div class="row">${bioOK() && !bioId() ? `<button class="btn sm" data-bioset>Use fingerprint or face on this device</button>` : ""}${bioId() ? `<button class="btn ghost sm" data-biooff>Stop using fingerprint / face here</button>` : ""}<button class="btn ghost sm" data-pinchange>Change PIN</button><button class="btn ghost sm danger" data-pinoff>Turn the lock off</button></div>`
        : `<span class="small">Lock Journal, Mood, 3-6-9 and History with a PIN (and fingerprint or face where your phone supports it), so anyone holding the phone can't read them.</span><button class="btn sm" data-pinchange style="align-self:flex-start">Set a PIN</button>`}
        <span class="tiny muted">The PIN is stored only as a scrambled code. Your entries are already protected by your Google account in your own Drive; the lock stops someone holding the phone from reading them in the app. Forgot it? Sign in with Google again to reset.</span></section>
      <section class="stack mb"><span class="lab">Theme</span><div class="grid g3">${THEMES.map((t) => `<button class="themecard ${P().theme === t[0] ? "on" : ""}" data-theme-pick="${t[0]}" data-theme="${t[0]}"><div class="tc"><div class="tcn">${t[1]}</div><div class="row" style="gap:6px">${["--acc", "--acc2", "--soft", "--surf"].map((v) => `<i class="swi" style="background:var(${v})"></i>`).join("")}</div><div class="tch">Up next · Study block</div></div></button>`).join("")}</div></section>
      <div class="grid g2"><section class="card stack"><span class="lab">Profile</span><label class="stack small">Name on Today<input class="f" maxlength="40" value="${E(P().name)}" data-name></label><div class="small">Signed in as <b>${acc}</b></div><div class="row"><button class="btn ghost sm" data-signout>Sign out</button></div></section>
      <section class="card stack" id="set-acts"><span class="lab">Activities</span>${acts().map((a, ix) => `<div class="row" style="gap:6px;flex-wrap:nowrap">${a.name === "Study" ? `<b class="small" style="flex:1">Study</b>` : `<input class="f" style="flex:1;min-width:90px" value="${E(a.name)}" maxlength="30" data-actname="${ix}" aria-label="Activity name">`}${sel(`data-acthab="${ix}"`, [["", "Habit: same name"], ...P().habits.filter((h) => h.active !== false).map((h) => [h.id, "Habit: " + h.name])], a.hab || "", 'style="width:auto;max-width:170px" aria-label="Linked habit"')}${a.name === "Study" ? "" : `<button class="tool" data-actdel="${ix}" aria-label="Remove ${E(a.name)}">${ic("trash", 16)}</button>`}</div>`).join("")}
        <div class="row"><input class="f" id="newact" placeholder="New type, e.g. Music practice" maxlength="30" style="flex:1"><button class="btn sm" data-actadd>${ic("plus", 14)} Add</button></div><span class="tiny muted">Finishing an activity block ticks its linked habit for that day.</span>
        <span class="lab mt">Timer</span><label class="row small"><input type="checkbox" data-tkeep ${TMR().keep !== false ? "checked" : ""}> Keep the screen on while a timer runs (goes black and dim after 30 seconds to save battery)</label>
        <label class="row small"><input type="checkbox" data-tcal ${TMR().cal !== false ? "checked" : ""}> Backup alert through Google Calendar, so it rings even if the app is closed</label>
        <div class="row small">Breaks: <input class="f" type="number" min="10" max="120" value="${TMR().every || 50}" data-tevery style="width:70px" aria-label="Minutes of focus"> min focus, then <input class="f" type="number" min="2" max="60" value="${TMR().blen || 10}" data-tblen style="width:64px" aria-label="Break minutes"> min break</div></section>
      <section class="card stack"><span class="lab">Study music</span>
      <label class="stack small">My study playlist link (optional, e.g. Spotify or YouTube)<input class="f" type="url" maxlength="300" placeholder="https://…" value="${E(SND().playlist)}" data-playlist></label><span class="tiny muted">It appears as a button on the Study screen, next to the YouTube suggestions.</span></section>
      <section class="card stack"><span class="lab">Google Calendar</span><label class="between small">Alert for timed items${sel("data-alert", [5, 10, 15, 30, 60].map((n) => [n, n + " min before"]), P().alerts, 'style="width:auto"')}</label><label class="between small">Add birthdays & anniversaries automatically (every year)<input type="checkbox" class="cb" data-autodates ${P().autoDates !== false ? "checked" : ""}></label><span class="tiny muted">Other items go to your Calendar only when you choose (the tick box in Add / schedule, or Send to Calendar). Calendar permission is asked for only the first time.</span></section>
      <section class="card stack"><span class="lab">Family progress summary · opt-in</span><label class="row small"><input type="checkbox" data-shareon ${sh.on ? "checked" : ""} ${mode !== "google" ? "disabled" : ""}> Share a weekly progress summary</label>
      <label class="stack small">Parent emails (comma separated)<input class="f" maxlength="200" value="${E(sh.emails.join(", "))}" data-shareemails placeholder="papa@gmail.com" ${mode !== "google" ? "disabled" : ""}></label>
      <span class="tiny muted">Shared as a view-only Google Doc: habit %, study hours, winning streak and days studied. <b>Never shared:</b> entries, notes, to-dos, affirmations, handwriting, mood or Year in Pixels. Turn it off any time; the doc is deleted.</span><button class="btn ghost sm" data-go="family" style="align-self:flex-start">Preview what's shared</button></section>
      <section class="card stack"><span class="lab">Connections</span>
      <div class="between small"><span><b>Google Drive</b> · private storage</span><span class="pill tiny">${mode === "google" ? "Connected" : "Off in demo"}</span></div>
      <div class="between small"><span><b>Google Calendar</b> · only items you send</span><span class="pill tiny">${G.hasCal ? "Allowed" : "Asks when first used"}</span></div>
      <label class="between small"><span><b>Buddy OS</b> · share a feed, receive suggestions</span><input type="checkbox" class="cb" data-buddy ${P().links.buddy.on ? "checked" : ""} ${mode !== "google" ? "disabled" : ""}></label>
      ${P().links.buddy.on ? `<div class="stack" style="gap:6px;padding-left:8px;border-left:3px solid var(--soft)"><span class="tiny muted">What Buddy may read (written to <b>buddy-feed.json</b> in your My Planner folder):</span><div class="row">${[["habits", "Habits"], ["study", "Study"], ["tasks", "To-dos"], ["events", "Events & dates"], ["mood", "Mood & sleep"], ["journal", "Journal (typed)"]].map((c) => `<label class="pill row"><input type="checkbox" data-bcat="${c[0]}" ${P().links.buddy.cats[c[0]] ? "checked" : ""}> ${c[1]}</label>`).join("")}</div><label class="row small"><input type="checkbox" data-bauto ${P().links.buddy.auto !== false ? "checked" : ""}> Add what I tell Buddy without asking (reminders, meetings, follow-ups, mood and journal I dictate)</label><label class="row small"><input type="checkbox" data-binbox ${P().links.buddy.inbox ? "checked" : ""}> Show Buddy's own suggestions on Today for my approval</label><label class="row small"><input type="checkbox" data-bring ${P().links.buddy.ring ? "checked" : ""}> Let Buddy ring my reminders (this app stays quiet, so I'm not alerted twice)</label></div>` : ""}
      <div class="between small"><span class="muted">More apps (health, notes, task apps, webhooks)</span><span class="pill tiny out">Ready to add later</span></div>
      <span class="tiny muted">Every connection is off until you switch it on, shows exactly what it can read, and anything it suggests needs your approval.</span></section>
      <section class="card stack"><span class="lab">Your data</span><span class="small">${mode === "google" ? `Saved privately in the <b>My Planner</b> folder of your Google Drive. Only this app and you can see it.` : `Demo mode: saved in this browser only.`}</span>
      <div class="row"><button class="btn ghost sm" data-backup>Download backup</button><label class="btn ghost sm" style="cursor:pointer">Restore backup<input type="file" accept="application/json,.json" data-restore hidden></label><button class="btn ghost sm" data-csv>Export daily log (CSV)</button></div>
      <button class="btn danger sm" data-wipe style="align-self:flex-start">Delete all my data…</button></section></div>
      <p class="tiny muted c mt">My Planner ${MP.VERSION} · <button class="learnlink" data-go="help">Help & user guide</button> · <button class="learnlink" data-vhist>Version history</button> · <a class="learnlink" href="privacy.html" target="_blank" rel="noopener">Privacy policy</a> · <a class="learnlink" href="terms.html" target="_blank" rel="noopener">Terms</a> · no ads, no tracking, no analytics.</p>`;
  };

  const weekSummary = () => {
    const t = today(), m = monday(t), days = [...Array(7)].map((_, i) => addD(m, i)).filter((d) => d <= t);
    const pcts = days.map(dayPct).filter((x) => x !== null), hrs = days.reduce((s, d) => s + studyHours(d), 0), studied = days.filter((d) => studyHours(d) > 0).length;
    const byAct = actNames().map((n) => ({ n, h: days.reduce((s2, d) => s2 + actMins(d, n).done, 0) / 60 })).filter((x) => x.h > 0 && x.n !== "Study");
    return { byAct, name: P().name || "", from: m, to: addD(m, 6), habits: pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0, hrs, studied, n: days.length, streak: streak() };
  };
  V.family = () => { const s = weekSummary(); return `${head("Exactly what a parent sees", "Family summary preview", `<button class="btn ghost" data-go="prefs">Back</button>`)}
    <div class="grid g3"><section class="card stack center">${ring(s.habits, 120, 12, "HABITS")}<b>${E(s.name)}</b></section><section class="card stack"><span class="lab">Study this week</span><div class="big xl">${s.hrs.toFixed(1)} h</div><span class="small muted">${s.studied} of ${s.n} days</span></section><section class="card stack"><span class="lab">Winning streak</span><div class="big xl">${s.streak} days</div></section></div>
    ${s.byAct.length ? `<section class="card stack mt"><span class="lab">Other activities this week</span>${s.byAct.map((x) => `<div class="between small"><span>${E(x.n)}</span><b>${x.h.toFixed(1)} h</b></div>`).join("")}</section>` : ""}
    <p class="small muted mt">${ic("lock", 14)} Not shared: entries, journal, notes, to-dos, affirmations, handwriting, mood and Year in Pixels.</p>`; };
  const summaryHTML = () => { const s = weekSummary(); return `<html><body style="font-family:Arial"><h1>${E(s.name)} · My Planner progress</h1><p>Week of ${fmt(s.from, { day: "numeric", month: "long" })} – ${fmt(s.to, { day: "numeric", month: "long", year: "numeric" })} · updated ${fmt(today(), { day: "numeric", month: "short" })}</p><table border="1" cellpadding="6" style="border-collapse:collapse"><tr><td>Habits completed</td><td><b>${Math.round(s.habits * 100)}%</b></td></tr><tr><td>Study this week</td><td><b>${s.hrs.toFixed(1)} hours</b> on ${s.studied} of ${s.n} days</td></tr><tr><td>Winning streak</td><td><b>${s.streak} days</b></td></tr>${s.byAct.map((x) => `<tr><td>${E(x.n)}</td><td><b>${x.h.toFixed(1)} hours</b></td></tr>`).join("")}</table><p style="color:#777">Shared by ${E(s.name)} from My Planner. Entries, notes and mood are private and never included.</p></body></html>`; };

  /* ---------- Buddy OS feed: only the categories the person allows ---------- */
  MP.buildFeed = (S) => {
    const cats = (S.profile.links.buddy || {}).cats || {}, t = today(), past = [...Array(30)].map((_, i) => addD(t, -i)), data = { name: S.profile.name || "" };
    if (cats.habits) data.habits = { list: S.profile.habits.filter((h) => h.active !== false).map((h) => ({ id: h.id, name: h.name })), days: past.map((d) => ({ date: iso(d), pct: dayPct(d), marks: ((S.days[iso(d)] || {}).h) || {} })).filter((x) => x.pct !== null), streak: streak() };
    if (cats.study) {
      data.study = past.map((d) => ({ date: iso(d), hours: +studyHours(d).toFixed(2), focus: (S.days[iso(d)] || {}).focus || null, blocksDone: studyRows(d).filter((r) => ((S.days[iso(d)] || {}).study || {})[r.id]).length })).filter((x) => x.hours || x.focus);
      const blk = (rows) => (Array.isArray(rows) ? rows : []).filter((r) => r.type === "Study").map((r) => ({ id: r.id, start: r.start, end: r.end || null, text: r.text }));
      data.studyPlan = { weekday: blk(S.profile.timetable), weekend: Array.isArray(S.profile.weekend) ? blk(S.profile.weekend) : null };
      /* 1.12: every activity type (Study stays above, unchanged) */
      const ab = (rows) => (Array.isArray(rows) ? rows : []).filter(isAct).map((r) => ({ id: r.id, start: r.start, end: r.end || null, text: r.text, activity: actOf(r) }));
      data.activityPlan = { weekday: ab(S.profile.timetable), weekend: Array.isArray(S.profile.weekend) ? ab(S.profile.weekend) : null };
      data.activities = past.map((d) => { const o = {}; actNames().forEach((n) => { const m = actMins(d, n); if (m.done) o[n] = +(m.done / 60).toFixed(2); }); return { date: iso(d), hours: o }; }).filter((x) => Object.keys(x.hours).length);
    }
    if (cats.tasks) data.tasks = Object.entries(S.tasks).filter(([, v]) => v && !v.del).map(([id, v]) => ({ id, title: v.t, date: tDay(v) || null, due: v.due || null, urgent: !!v.urg, important: !!v.imp, priority: TPRI[tPri(v)][0], size: v.b || null, done: !!v.done, createdAt: v.c ? new Date(v.c).toISOString() : null, completedAt: v.doneAt ? new Date(v.doneAt).toISOString() : null, inbox: !tDay(v), steps: (v.sub || []).length ? { done: v.sub.filter((x) => x.done).length, total: v.sub.length } : null }));
    if (cats.events) {
      const evx = ([id, v]) => ({ id, title: v.t, kind: v.kind || "event", date: v.d, time: v.time || null, end: v.end || null, priority: v.pri || null, reminderMin: v.rem === undefined || v.rem === "" ? null : +v.rem, repeat: v.rep ? { rule: v.rep, days: v.repDays || [], ends: v.repEnd || "never", until: v.repUntil || null, count: v.repCount ? +v.repCount : null, text: repText(v) } : null });
      data.events = Object.entries(S.events).filter(([, v]) => v && !v.del && (v.d >= iso(t) || v.rep)).map(evx);
      data.upcoming = [...Array(14)].flatMap((_, i) => { const k = iso(addD(t, i)); return Object.entries(S.events).filter(([, v]) => v && !v.del && occurs(v, k)).map(([id, v]) => ({ id, date: k, time: v.time || null, end: v.end || null, title: v.t, kind: v.kind || "event", priority: v.pri || null })); }); data.specialDates = Object.entries(S.dates).filter(([, v]) => v && !v.del).map(([id, v]) => ({ id, name: v.n, relation: v.rel, type: v.type, monthDay: v.md })); }
    if (cats.events) data.meetings = [...Array(21)].map((_, i) => iso(addD(t, i - 14))).map((k) => ({ date: k, minutes: meetMins(k) })).filter((x) => x.minutes);
    if (cats.mood) data.mood = past.map((d) => { const r = S.days[iso(d)] || {}; return { date: iso(d), am: (r.mood || {}).am || null, pm: (r.mood || {}).pm || null, sleep: r.sleep ?? null }; }).filter((x) => x.am || x.pm || x.sleep);
    if (cats.journal) data.journal = Object.entries(S.typed).filter(([k, v]) => /^(jr-|journal-)/.test(k) && v && v.l && v.l.some(Boolean)).map(([k, v]) => ({ key: k, date: (k.match(/\d{4}-\d{2}-\d{2}/) || [""])[0], text: v.l.filter(Boolean).join("\n") }));
    if ((S.profile.links.buddy || {}).auto !== false) data.autoAddFromBuddy = true;
    data.inboxDecisions = Object.entries(S.inbox).filter(([, v]) => v && v.status !== "pending").map(([id, v]) => ({ id, status: v.status }));
    return { schema: "my-planner-feed", schemaVersion: MP.SCHEMA_VERSION, appVersion: MP.VERSION, timeZone: HOME(), generatedAt: new Date().toISOString(), categories: Object.keys(cats).filter((k) => cats[k]), data };
  };
  /* ---------- What's new ---------- */
  const vNum = (v) => String(v || "0").split(".").map((n) => +n || 0);
  const vNewer = (a, b) => { const x = vNum(a), y = vNum(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
  const unseen = () => { const seen = P().seenVersion; if (!seen) return []; return (D.changelog || []).filter((c) => vNewer(c.v, seen) && !vNewer(c.v, MP.VERSION)); };
  const whatsNewCard = () => { const list = unseen(); if (!list.length) return ""; return `<section class="card stack mb" style="box-shadow:inset 0 0 0 2px var(--acc)"><div class="between"><span class="lab">✨ What's new in My Planner ${E(MP.VERSION)}</span><button class="btn sm" data-wnseen>Got it</button></div>${list.map((c) => `<div class="stack" style="gap:4px"><b class="small">Version ${E(c.v)}</b>${c.items.map((x) => `<span class="small">• ${E(x)}</span>`).join("")}</div>`).join("")}</section>`; };
  const historyHTML = () => `<div class="between"><h2>Version history</h2><button class="tool" data-close aria-label="Close">✕</button></div><span class="small muted">You're on version ${E(MP.VERSION)}. Updates arrive automatically the next time you open the app while online.</span>${(D.changelog || []).map((c) => `<div class="stack" style="gap:4px"><b>Version ${E(c.v)} · <span class="muted small">${fmt(parseISO(c.date), { day: "numeric", month: "short", year: "numeric" })}</span></b>${c.items.map((x) => `<span class="small">• ${E(x)}</span>`).join("")}</div>`).join("")}<button class="btn" data-close style="align-self:flex-end">Close</button>`;
  const inboxPending = () => live("inbox").filter(([, v]) => v.status === "pending");
  /* Buddy's mood 1-5 as the planner's mood word + strength (the reverse of Buddy's own mapping). */
  const BUDDY_MOOD = { 5: ["happy", 5], 4: ["calm", 3], 3: ["calm", 1], 2: ["low", 3], 1: ["low", 5] };
  /* Put one inbox item into the planner. Record ids come from the inbox id, so two devices adding
     the same item at once end up with one record after sync, not two. Returns a short label. */
  function applyInbox(id, it) {
    const pri = it.priority || "", rid = "bd-" + id.replace(/[^\w-]/g, "").slice(0, 60), by = it.by === "owner" ? "You asked Buddy" : "Suggested by Buddy";
    if (it.kind === "task") putRec("tasks", rid, { t: it.title, d: it.date || iso(today()), due: "", done: false, urg: pri === "high" || pri === "urgent", imp: pri !== "low", c: Date.now() });
    else if (["event", "reminder", "study"].includes(it.kind)) putRec("events", rid, { d: it.date || iso(today()), time: it.time, end: it.time ? it.end || "" : "", t: it.title, kind: it.kind, pri: pri || "med", rem: it.kind === "reminder" || it.time ? (it.kind === "reminder" ? "0" : "10") : "", rep: "", note: it.why ? by + ": " + it.why : by });
    else if (it.kind === "habit") { P().habits.push({ id: rid, name: it.title.slice(0, 60), def: "", active: true }); touchP(); }
    else if (it.kind === "affirmation") { P().mine.push(it.title); touchP(); }
    else if (it.kind === "mood") {
      const m = BUDDY_MOOD[Math.round(+it.title)]; if (!m) return "";
      const k = it.date || iso(today()), r = dayRec(k), slot = it.time ? (tMin(it.time) < 900 ? "am" : "pm") : new Date().getHours() < 15 ? "am" : "pm";
      r.mood = r.mood || {};
      if (r.mood[slot] && r.mood[slot].w) return "mood (kept the one you set)"; /* never overwrite the person's own mood */
      r.mood[slot] = { w: m[0], s: m[1] }; touchDay(k); return "mood";
    } else if (it.kind === "journal") {
      const k = "journal-" + (it.date || iso(today())), text = (it.note || it.title || "").trim(); if (!text) return "";
      const rec = MP.S.typed[k] || { u: 0, l: [] }, lines = (rec.l || []).slice(), chunks = [];
      text.split(/\n+/).forEach((ln) => { let s = ln.trim(); while (s.length > 300) { const cut = s.lastIndexOf(" ", 300) > 200 ? s.lastIndexOf(" ", 300) : 300; chunks.push(s.slice(0, cut)); s = s.slice(cut).trim(); } if (s) chunks.push(s); });
      let i = lines.length; while (i > 0 && !lines[i - 1]) i--; /* straight after the last line already written */
      chunks.forEach((c) => { lines[i++] = c; });
      MP.S.typed[k] = { u: Date.now(), l: lines }; MP.changed(); return "journal";
    } else return "";
    return it.kind;
  }
  function approveInbox(id) {
    const it = MP.S.inbox[id]; if (!it) return;
    applyInbox(id, it);
    it.status = "approved"; it.u = Date.now(); MP.changed(); MP.bus.emit("inbox.approved", { id, kind: it.kind }); MP.toast("Added to your planner"); MP.render();
  }
  /* What the person told Buddy goes straight in when "Add what I tell Buddy without asking" is on.
     Buddy's own ideas (by: "buddy") always wait for Approve / Dismiss. */
  MP.autoAddFromBuddy = () => {
    const L = P().links.buddy; if (!L || !L.on || L.auto === false) return 0;
    const done = [];
    live("inbox").forEach(([id, it]) => {
      if (it.status !== "pending" || it.by !== "owner") return;
      const what = applyInbox(id, it);
      it.status = "approved"; it.u = Date.now(); MP.bus.emit("inbox.approved", { id, kind: it.kind, auto: true });
      if (what) done.push(it.kind === "mood" || it.kind === "journal" ? what : it.title);
    });
    if (done.length) { MP.changed(); MP.toast(done.length === 1 ? "From Buddy: added " + done[0] : `From Buddy: added ${done.length} items to your planner`); }
    return done.length;
  };
  const inboxCard = () => { const pend = inboxPending(); if (!pend.length) return ""; return `<section class="card stack mt" style="box-shadow:inset 0 0 0 2px var(--acc2)"><div class="between"><span class="lab">Suggestions from Buddy · ${pend.length}</span><span class="tiny muted">Nothing is added until you approve</span></div>${pend.slice(0, 5).map(([id, v]) => `<div class="between wrap"><span class="small"><span class="pill tiny">${E(v.kind)}</span>${v.by === "owner" ? ' <span class="pill tiny">you asked</span>' : ""}${v.priority ? ` <span class="pill tiny ${PRICLS[v.priority] || ""}">${E(v.priority)}</span>` : ""} <b>${E(v.kind === "mood" ? "Mood " + v.title + " / 5" : v.title)}</b>${v.date ? " · " + fmt(parseISO(v.date), { day: "numeric", month: "short" }) : ""}${v.time ? " · " + fmtT(v.time) + (v.end ? "–" + fmtT(v.end) : "") : ""}${v.why ? `<br><span class="tiny muted">${E(v.why)}</span>` : ""}</span><span class="row" style="gap:6px"><button class="btn sm" data-inok="${E(id)}">Approve</button><button class="btn ghost sm" data-inno="${E(id)}">Dismiss</button></span></div>`).join("")}${pend.length > 5 ? `<span class="tiny muted">${pend.length - 5} more appear as you decide on these.</span>` : ""}</section>`; };

  /* ---------- onboarding: blank, with suggestions ---------- */
  let wiz = { step: 1, name: "", theme: "sage", routine: true, habits: [], cols: { classic: true, secret: true, love: true, study: true } };
  V.setup = () => {
    const st = wiz.step, dotsH = `<div class="row" style="gap:6px">${[1, 2, 3, 4].map((i) => `<i class="wz ${i <= st ? "on" : ""}"></i>`).join("")}</div>`;
    let body = "";
    if (st === 1) body = `<label class="stack small">What should My Planner call you?<input class="f" id="wname" maxlength="40" value="${E(wiz.name || (G.user && G.user.name ? G.user.name.split(" ")[0] : ""))}"></label><span class="lab">Choose your look</span><div class="grid g3">${THEMES.map((t) => `<button class="themecard ${wiz.theme === t[0] ? "on" : ""}" data-wtheme="${t[0]}" data-theme="${t[0]}"><div class="tc"><div class="tcn">${t[1]}</div><div class="tch">Up next</div></div></button>`).join("")}</div>`;
    if (st === 2) body = `<p class="small">Start from a suggested daily routine and edit it later, or start with an empty timetable.</p><label class="row"><input type="radio" name="rt" data-wrt="1" ${wiz.routine ? "checked" : ""}> Suggested routine (wake 7:00 · 4 study blocks · sleep 11:00)</label><label class="row"><input type="radio" name="rt" data-wrt="0" ${!wiz.routine ? "checked" : ""}> Start blank</label>${wiz.routine ? `<div class="card soft stack" style="gap:3px">${D.suggest.routine.map((r) => `<div class="row small" style="gap:10px"><span style="width:70px" class="muted">${fmtT(r[0])}</span>${E(r[2])}</div>`).join("")}</div>` : ""}`;
    if (st === 3) body = `<p class="small">Pick a few habits to track. You can add your own later.</p><div class="row">${D.suggest.habits.map((x) => `<button class="pill ${wiz.habits.includes(x) ? "sel" : "out"}" data-whab="${E(x)}">${wiz.habits.includes(x) ? "✓ " : "+ "}${E(x)}</button>`).join("")}</div>`;
    if (st === 4) body = `<p class="small">Which affirmation collections would you like in your daily rotation?</p>${Object.keys(D.aff).filter((k) => k !== "calm").map((k) => `<label class="row small"><input type="checkbox" data-wcol="${k}" ${wiz.cols[k] ? "checked" : ""}> <b>${D.aff[k].name}</b> · <span class="muted">${D.aff[k].note}</span></label>`).join("")}`;
    return `<div class="setup">${head(`Step ${st} of 4`, st === 1 ? "Welcome to <em>My Planner</em>" : st === 2 ? "Your day" : st === 3 ? "Your habits" : "Your affirmations", dotsH)}<section class="card stack">${body}<div class="between mt">${st > 1 ? `<button class="btn ghost" data-wback>Back</button>` : "<span></span>"}<button class="btn" data-wnext>${st < 4 ? "Next" : "Start planning"}</button></div></section></div>`;
  };
  function finishSetup() {
    const p = P(); p.name = wiz.name.trim(); p.theme = wiz.theme; p.collections = Object.assign({}, wiz.cols);
    if (!p.timetable.length && wiz.routine) p.timetable = D.suggest.routine.map((r) => ({ id: uid(), start: r[0], end: r[1], text: r[2], type: r[3] }));
    wiz.habits.forEach((n) => { if (!p.habits.some((h) => h.name === n)) p.habits.push({ id: uid(), name: n, def: "", active: true }); });
    if (!p.menu) p.menu = menuSimple(); /* new people start on the Simple menu */
    p.seenVersion = MP.VERSION; p.setupDone = true; touchP(); go("today");
  }

  /* ---------- shell ---------- */
  const signinHTML = (msg) => `<div class="signin"><div class="card stack center" style="max-width:440px;padding:28px"><div class="brand big2">My <span>Planner</span></div><p class="small muted">Your private planner. Everything you write is saved in your own Google Drive, and only you can see it.</p>
    ${msg ? `<p class="small over" role="alert">${E(msg)}</p>` : ""}${CFG.clientId ? `<button class="btn gbtn" data-signin><svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Sign in with Google</button>` : `<p class="small over">This copy isn't connected to Google yet. Follow the setup guide to add your client ID.</p>`}
    <button class="link" data-demo>Try it without signing in (saved on this device only)</button><p class="tiny muted">${ic("lock", 12)} No ads, no tracking. My Planner only sees the files it creates in your Drive.</p><p class="tiny muted"><a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a> · <a href="terms.html" target="_blank" rel="noopener">Terms of use</a></p></div></div>`;

  function shell() {
    const inApp = mode !== "signin" && P().setupDone;
    document.getElementById("side").innerHTML = inApp ? `<div class="brand">My <span>Planner</span></div>${statusPill()}<button class="navbtn navadd" data-sched>${ic("plus")}Add / schedule</button>` + SCREENS.filter((s) => shownScreen(s[0])).map((s) => `<button class="navbtn ${route === s[0] || (route === "day" && s[0] === "planner") ? "on" : ""}" data-go="${s[0]}">${ic(s[0])}${s[1]}</button>${s[0] === "study" ? actNav() : ""}`).join("") : "";
    const quick = [["today", "Today"], ["planner", "Planner"], ["habits", "Habits"], ["todo", "To-Do"], ["more", "More"]];
    document.getElementById("bottom").innerHTML = inApp ? quick.map((q) => `<button class="${route === q[0] || (q[0] === "more" && !quick.some((x) => x[0] === route)) ? "on" : ""}" data-go="${q[0]}">${ic(q[0], 22)}${q[1]}</button>`).join("") : "";
    document.getElementById("sheetin").innerHTML = `<button class="navbtn navadd" data-sched>${ic("plus", 22)}Add / schedule</button>` + SCREENS.filter((s) => shownScreen(s[0])).map((s) => `<button class="navbtn ${route === s[0] ? "on" : ""}" data-go="${s[0]}">${ic(s[0], 22)}${s[1]}</button>${s[0] === "study" ? actNav() : ""}`).join("");
    document.body.classList.toggle("bare", !inApp);
  }
  function statusPill() {
    if (mode === "demo") return `<span class="status">Demo · this device only</span>`;
    if (!navigator.onLine) return `<span class="status">Offline · saved on this device</span>`;
    if (G.status === "sync") return `<span class="status ok">● Syncing…</span>`;
    if (G.status === "ok") return `<span class="status ok">● Synced to Drive</span>`;
    if (G.status === "err") return `<button class="status warn" data-resync>Sync problem · tap to retry</button>`;
    return `<button class="status warn" data-resync>○ Tap to sync with Drive</button>`;
  }
  /* ---------- Journal lock (1.12): PIN (stored only as a salted hash) or this device's fingerprint / face ---------- */
  const LOCKED = ["journal", "mood", "three", "history", "diary"];
  let unlocked = false, hiddenAt = 0;
  const lockOn = () => !!(P().lock && P().lock.h);
  const isLocked = (r) => lockOn() && !unlocked && LOCKED.includes(r);
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const pinHash = async (pin, salt) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + ":" + pin)));
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))), unb64 = (x) => Uint8Array.from(atob(x), (c) => c.charCodeAt(0));
  const bioId = () => { try { return localStorage.getItem("mp-bio") || ""; } catch (e) { return ""; } };
  const bioOK = () => !!(window.PublicKeyCredential && navigator.credentials);
  function lockHTML() {
    return `${head("Private", "Locked", "")}<section class="card stack" style="max-width:420px;margin:0 auto;align-items:center;text-align:center">${ic("lock", 28)}
      <p class="small">Journal, Diary, Mood, 3-6-9 and History are locked.</p>
      ${bioId() && bioOK() ? `<button class="btn" data-unbio>Unlock with fingerprint or face</button>` : ""}
      <div class="row" style="justify-content:center"><input class="f" type="password" inputmode="numeric" maxlength="6" id="pinin" placeholder="PIN" style="width:130px;text-align:center;letter-spacing:.3em" aria-label="PIN"><button class="btn ${bioId() ? "ghost" : ""}" data-unpin>Unlock</button></div>
      <button class="link tiny" data-pinforgot>Forgot your PIN?</button></section>`;
  }
  async function tryPin() { const v = field("pinin"), L = P().lock; if (!L) return; if ((await pinHash(v, L.s)) === L.h) { unlocked = true; MP.render(); } else { MP.toast("That PIN isn't right"); const f = document.getElementById("pinin"); if (f) { f.value = ""; f.focus(); } } }
  async function tryBio() { try { await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: "public-key", id: unb64(bioId()) }], userVerification: "required", timeout: 60000 } }); unlocked = true; MP.render(); } catch (e) { MP.toast("Fingerprint / face didn't unlock it. Use your PIN."); } }
  async function setBio() { try { const c = await navigator.credentials.create({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: "My Planner" }, user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "my-planner-lock", displayName: "My Planner lock" }, pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" }, timeout: 60000 } }); localStorage.setItem("mp-bio", b64(c.rawId)); MP.toast("Fingerprint / face unlock is on for this device"); MP.render(); } catch (e) { MP.toast("This device or browser couldn't set up fingerprint / face. Your PIN still works."); } }
  async function setPin() { const a = field("pin1"), b = field("pin2"); if (!/^\d{4,6}$/.test(a)) { MP.toast("Use 4 to 6 digits"); return; } if (a !== b) { MP.toast("The two PINs don't match"); return; } const salt = hex(crypto.getRandomValues(new Uint8Array(16))); P().lock = { s: salt, h: await pinHash(a, salt) }; touchP(); unlocked = true; closeModal(); MP.render(); MP.toast("Journal lock is on"); }
  function pinForgot() {
    if (mode !== "google") { modal(`<h2>Forgot your PIN?</h2><p class="small">In demo mode the PIN can't be reset. Your entries are safe on this device.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-close>OK</button></div>`); return; }
    modal(`<h2>Reset your PIN</h2><p class="small">Sign in with your Google account again to prove it's you. The lock is then removed, and you can set a new PIN in Settings → Privacy.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-pinreset>Sign in with Google</button></div>`);
  }
  async function pinReset() { try { await G.authorize(true); delete P().lock; try { localStorage.removeItem("mp-bio"); } catch (e) {} touchP(); unlocked = true; closeModal(); MP.render(); MP.toast("Lock removed. Set a new PIN in Settings → Privacy."); } catch (e) { MP.toast("Google sign-in didn't finish, so the PIN wasn't reset."); } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 5 * 60e3 && unlocked) { unlocked = false; if (LOCKED.includes(route)) MP.render(); } });

  MP.render = () => {
    document.body.dataset.theme = P().theme || MP.pref.get("theme") || "sage";
    MP.pref.set("theme", document.body.dataset.theme);
    shell();
    const main = document.getElementById("main");
    if (mode === "signin") { main.innerHTML = signinHTML(MP._msg); return; }
    if (!P().setupDone) { main.innerHTML = V.setup(); return; }
    const top = mode === "google" ? `<div class="mobstatus">${statusPill()}</div>` : `<div class="mobstatus">${statusPill()}</div>`;
    main.innerHTML = top + (isLocked(route) ? lockHTML() : (V[route] || V.today)());
    MP.setupPads(); MP.growTyped && MP.growTyped();
    if (route === "diary" && MP.diaryAfter) MP.diaryAfter();
    if (route === "day") dayScroll();
    postitLayer();
    if (route === "today") { maybeMenuPrompt(); if (P().menu && P().menu.chosen) maybePlan(); }
    if (route === "prefs") setupFocus();
    document.querySelectorAll("[data-printink]").forEach(drawPrintInk);
    miniPlayer();
  };
  function drawPrintInk(cv) {
    const strokes = ((MP.S.ink[cv.dataset.printink] || {}).s || []), w = cv.clientWidth || 300, ctx = cv.getContext("2d");
    cv.width = w; const maxY = Math.max(40, ...strokes.flatMap((s) => s.p.map((q) => q[1]))); const sc = Math.min(1, 300 / maxY); cv.height = maxY * sc + 10;
    strokes.forEach((s) => { ctx.strokeStyle = s.c; ctx.lineWidth = Math.max(1, s.z * sc); ctx.lineCap = "round"; ctx.beginPath(); s.p.forEach((q, i) => (i ? ctx.lineTo(q[0] * w, q[1] * sc) : ctx.moveTo(q[0] * w, q[1] * sc))); ctx.stroke(); });
  }
  /* Sidebar: each activity type with time done against planned today */
  function actNav() {
    if (mode === "signin" || !P().setupDone) return "";
    const t = today(), items = actNames().map((n) => [n, actMins(t, n)]).filter(([, m]) => m.plan || m.done);
    const mm = meetMins(iso(t));
    return items.length || mm ? `<div class="navsub">${items.map(([n, m]) => `<button class="navsubbtn ${route === "study" && view.act === n ? "on" : ""}" data-actgo="${E(n)}"><span>${E(n)}</span><span class="tiny">${hm(m.done)} / ${hm(m.plan)}</span></button>`).join("")}${mm ? `<button class="navsubbtn" data-go="planner"><span>Meetings & events</span><span class="tiny">${hm(mm)}</span></button>` : ""}</div>` : "";
  }
  function go(r) {
    if (r === "more") { document.getElementById("sheet").classList.add("on"); return; }
    document.getElementById("sheet").classList.remove("on");
    route = r; try { history.replaceState(null, "", "#" + r); } catch (e) {}
    MP.render(); window.scrollTo(0, 0);
  }
  MP.go = go; MP.route = () => route;

  /* ---------- saving & syncing ---------- */
  let saveT = null, syncT = null, syncing = false, again = false;
  const cacheKey = () => (mode === "google" && G.user ? "state:" + G.user.sub : "state:demo");
  MP.changed = () => {
    clearTimeout(saveT); saveT = setTimeout(() => MP.idbSet(cacheKey(), MP.S), 300);
    if (mode === "google") { clearTimeout(syncT); syncT = setTimeout(syncNow, 2500); }
  };
  async function syncNow() {
    if (mode !== "google" || !navigator.onLine) return;
    if (!G.valid()) { G.status = "need"; refreshStatus(); return; }
    if (syncing) { again = true; return; }
    syncing = true; G.status = "sync"; refreshStatus();
    try {
      const before = JSON.stringify(MP.S);
      const merged = await G.sync(MP.S);
      const changed = JSON.stringify(merged) !== before;
      MP.S = MP.sanitize(merged);
      if (MP.autoAddFromBuddy() && !again) again = true; /* send the decisions straight back to Buddy */
      await MP.idbSet(cacheKey(), MP.S);
      G.status = "ok";
      if (changed && !document.activeElement.matches("input,textarea")) MP.render();
      maybeSummary();
      if (!GC.at && !GC.items.length) await gcalLoadCache();
      gcalRefresh();
    } catch (e) { G.status = e.reauth ? "need" : "err"; console.warn("sync", e.message); }
    syncing = false; refreshStatus();
    if (again) { again = false; syncNow(); }
  }
  MP.syncNow = syncNow;
  function refreshStatus() { document.querySelectorAll(".status").forEach((el) => { el.outerHTML = statusPill(); }); }
  async function maybeSummary() {
    const sh = P().share; if (!sh.on || !sh.emails.length || sh.last === iso(today())) return;
    try {
      const id = await G.writeSummaryDoc(summaryHTML(), sh.docId, `My Planner progress · ${P().name || "summary"}`);
      if (id !== sh.docId) { for (const em of sh.emails) await G.shareReader(id, em); sh.docId = id; }
      sh.last = iso(today()); touchP();
    } catch (e) { console.warn("summary", e.message); }
  }

  async function signIn() {
    try {
      MP._msg = ""; await G.authorize(false);
      const u = await G.userinfo();
      if (!G.allowed(u.email)) { G.signOutToken(); MP._msg = "This Google account isn't on this planner's family list. Ask the person who set it up to add you."; mode = "signin"; MP.render(); return; }
      MP.pref.set("hint", u.email); MP.pref.set("sub", u.sub);
      mode = "google";
      const cached = await MP.idbGet("state:" + u.sub);
      MP.S = MP.sanitize(cached || MP.blank());
      G.resetSync(); MP.render();
      await syncNow();
      if (!P().setupDone) MP.render();
    } catch (e) { MP._msg = e.message; if (mode !== "google") mode = "signin"; MP.render(); }
  }
  async function reconnect() { try { await G.authorize(G.hasCal); if (!G.user) await G.userinfo(); G.status = "need"; await syncNow(); } catch (e) { MP.toast(e.message); } }

  function signOutDialog() {
    modal(`<h2>Sign out</h2><label class="row small"><input type="checkbox" id="wipeLocal" checked> Also remove my planner from this device (recommended on shared devices)</label><p class="tiny muted">Your data stays safe in your Google Drive either way.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-dosignout>Sign out</button></div>`);
  }
  async function doSignOut() {
    const wipe = document.getElementById("wipeLocal").checked; closeModal();
    try { if (mode === "google" && G.valid()) await syncNow(); } catch (e) {}
    if (wipe) { await MP.idbDel(cacheKey()); MP.pref.del("hint"); MP.pref.del("sub"); }
    stopSound(); G.signOutToken(); mode = "signin"; MP.S = MP.blank(); route = "today"; MP.render();
  }
  function wipeDialog() {
    modal(`<h2>Delete all my data</h2><p class="small">This permanently deletes your My Planner folder from Google Drive${mode === "google" ? "" : " (demo: this device)"} and everything on this device: timetable, habits, entries, handwriting, mood and settings. Items you already sent to Google Calendar stay there. <b>This cannot be undone.</b> Download a backup first if you might want it later.</p><label class="stack small">Type DELETE to confirm<input class="f" id="wipeconf" autocomplete="off"></label><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn danger" data-dowipe>Delete everything</button></div>`);
  }
  async function doWipe() {
    if (document.getElementById("wipeconf").value.trim() !== "DELETE") { MP.toast('Type DELETE in capitals to confirm'); return; }
    closeModal();
    try {
      if (mode === "google") { if (!G.valid()) await G.authorize(false); if (P().share.docId) { try { await G.deleteFile(P().share.docId); } catch (e) {} } await G.deleteEverything(); }
      await MP.idbDel(cacheKey()); MP.pref.del("hint"); MP.pref.del("sub");
      G.signOutToken(); mode = "signin"; MP.S = MP.blank(); MP._msg = "All your My Planner data has been deleted."; MP.render();
    } catch (e) { MP.toast("Could not delete: " + e.message); }
  }
  const download = (name, text, type) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  function csvLog() {
    const hs = P().habits, rows = [["date", "habits_pct", ...hs.map((h) => h.name), "study_hours", "activity_hours", "focus", "mood_am", "mood_pm", "sleep", "water", "energy"]];
    Object.keys(MP.S.days).sort().forEach((k) => { const r = MP.S.days[k], d = parseISO(k), p = dayPct(d); rows.push([k, p == null ? "" : Math.round(p * 100), ...hs.map((h) => ({ d: "Done", p: "Partial", m: "Missed" }[(r.h || {})[h.id]] || "")), studyHours(d).toFixed(1), (actMins(d).done / 60).toFixed(1), r.focus || "", ((r.mood || {}).am || {}).w || "", ((r.mood || {}).pm || {}).w || "", r.sleep ?? "", r.water ?? "", r.energy ?? ""]); });
    return rows.map((r) => r.map((c) => { let s = String(c); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(",")).join("\n");
  }

  /* Calendar dialog */
  function calDialog(key) {
    const q = CALQ[key]; if (!q) return;
    const s = q.spec, t = iso(today());
    let opts = "";
    if (s.kind === "block") opts = `<label class="row small"><input type="radio" name="cr" value="once" checked> Today only (${fmtT(s.row.start)}–${fmtT(s.row.end)})</label><label class="row small"><input type="radio" name="cr" value="daily"> Every day at this time</label>`;
    else if (s.kind === "task") opts = `<p class="small">Adds "${E(s.t.t)}" on ${fmt(parseISO(s.t.due), { weekday: "short", day: "numeric", month: "short" })} at 9:00 am, with an alert ${P().alerts} min before.</p>`;
    else if (s.kind === "event") opts = `<p class="small">Adds "${E(s.e.t)}" on ${fmt(parseISO(s.e.d), { weekday: "short", day: "numeric", month: "short" })}${s.e.time ? " at " + fmtT(s.e.time) : " (all day)"}${s.e.rem !== undefined && s.e.rem !== "" ? ", with its reminder" : ""}${s.e.rep ? ", repeating" : ""}.</p>`;
    else if (s.kind === "date") opts = `<p class="small">Adds a yearly event for ${E(s.x.n)} (${E(s.x.type)}) with a reminder at 9 AM the day before.</p>`;
    modal(`<h2>Send to Google Calendar</h2>${opts}<p class="tiny muted">Only this item is sent. The first time, Google will ask you to allow My Planner to add events.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-calgo="${E(key)}">Add to Calendar</button></div>`);
    void t;
  }
  async function calSend(key) {
    const q = CALQ[key], s = q.spec, choice = (document.querySelector('input[name="cr"]:checked') || {}).value; closeModal();
    if (mode !== "google") { MP.toast("Sign in with Google to use Calendar."); return; }
    try {
      let ev;
      if (s.kind === "block") ev = timedEv(actOf(s.row) + " · " + s.row.text, iso(today()), s.row.start, s.row.end, choice === "daily" ? "RRULE:FREQ=DAILY" : null);
      else if (s.kind === "task") ev = timedEv("To-do · " + s.t.t, s.t.due, "09:00", "09:30");
      else if (s.kind === "event") ev = buildEv(MP.S.events[s.e.id] || s.e);
      else if (s.kind === "date") { const [mm, dd] = s.x.md.split("-").map(Number); let y = today().getFullYear(); if (new Date(y, mm - 1, dd) < today()) y++; ev = allDayEv(`${s.x.n} · ${s.x.type}`, `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`, "RRULE:FREQ=YEARLY"); }
      const id = await G.calInsert(ev);
      MP.S.sent[key] = { id, u: Date.now() }; MP.changed(); MP.toast("Added to your Google Calendar"); MP.render();
    } catch (e) { MP.toast(e.reauth ? "Please tap sync to reconnect, then try again." : "Calendar: " + e.message); }
  }
  async function calRemove(key) {
    const s = MP.S.sent[key]; if (!s || s.del) return;
    try { if (mode === "google") await G.calDelete(s.id); MP.S.sent[key] = { del: 1, u: Date.now() }; MP.changed(); MP.toast("Removed from Calendar"); MP.render(); } catch (e) { MP.toast("Calendar: " + e.message); }
  }

  function dayDialog(k) {
    const d = parseISO(k), EV = live("events").filter(([, e]) => occurs(e, k)), mo = moonOf(d), po = portalOf(d);
    const md = k.slice(5), DT = live("dates").filter(([, x]) => x.md === md);
    modal(`<div class="between"><h2>${fmt(d, { weekday: "long", day: "numeric", month: "long" })}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      ${mo ? `<div class="small">${mo === "P" ? "○" : "●"} ${moonName(mo)}</div>` : ""}${po ? `<div class="small">✦ ${E(po)}</div>` : ""}
      ${DT.map(([, x]) => `<div class="small">${x.type === "Birthday" ? "✿" : "♥"} ${E(x.n)} · ${E(x.type)}</div>`).join("")}
      ${EV.map(([, e]) => `<div class="small">• ${e.time ? fmtT(e.time) + " · " : ""}${E(e.t)}</div>`).join("") || (!mo && !po && !DT.length ? '<div class="small muted">Nothing planned.</div>' : "")}
      ${actMins(d).done ? `<div class="small accb">${hm(actMins(d).done)} of activities done</div>` : ""}
      <div class="row"><input class="f" type="time" id="ddtm" style="width:auto" aria-label="Time"><input class="f" id="ddt" maxlength="120" placeholder="Add an event on this day" style="flex:1"><button class="btn sm" data-dayadd="${k}">Add</button></div>
      <div class="between wrap"><button class="link" data-hgo="${k}">Open this day in History →</button><button class="btn sm" data-sched="${k}">${ic("plus", 16)} Add / schedule</button></div>`);
  }

  /* ---------- Add / schedule (one form for reminders, tasks, habits, study, events, dates) ---------- */
  const SKINDS = [["reminder", "⏰ Reminder"], ["task", "✓ New task (To-Do)"], ["habit", "◎ Habit"], ["study", "⏱ Activity session"], ["event", "📅 Meeting / event / appointment"], ["wellbeing", "❀ Journal · affirmation · mood"], ["date", "✿ Birthday / anniversary"]];
  const SLABEL = { reminder: "Reminder", task: "Task", habit: "Habit", study: "Activity", event: "Event", wellbeing: "Wellbeing", date: "Special date" };
  const SPRI = [["low", "Low"], ["med", "Medium"], ["high", "High"], ["urgent", "Urgent"]];
  const PRICOL = { low: "2", med: "5", high: "6", urgent: "11" };
  const PRICLS = { low: "pri-low", med: "pri-med", high: "pri-high", urgent: "pri-urg" };
  const SREM = [["", "No reminder"], ["0", "At the time"], ["5", "5 min before"], ["10", "10 min before"], ["15", "15 min before"], ["30", "30 min before"], ["60", "1 hour before"], ["1440", "1 day before"]];
  /* Repeats: one model for the app and Google Calendar (RRULE). Older items used DAILY/WEEKLY/MONTHLY/YEARLY and still work. */
  const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], WDN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const ORD = ["", "first", "second", "third", "fourth"];
  const nthOf = (dt) => { const n = Math.ceil(dt.getDate() / 7); return n >= 5 ? -1 : n; };
  const isLastWk = (dt) => addD(dt, 7).getMonth() !== dt.getMonth();
  const ordTxt = (n) => (n === -1 ? "last" : ORD[n]);
  const dayNum = (n) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
  const repOpts = (dk) => { const dt = parseISO(dk || iso(today())), wn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dt.getDay()];
    return [["DAILY", "Every day (all 7 days)"], ["WEEKDAYS", "Every weekday (Mon–Fri)"], ["WEEKENDS", "Weekends (Sat–Sun)"], ["WEEKLY", "Weekly on chosen days"], ["BIWEEKLY", "Every 2 weeks on " + wn], ["MONTHLY", "Monthly on the " + dayNum(dt.getDate())], ["MONTHLY_NTH", "Monthly on the " + ordTxt(nthOf(dt)) + " " + wn], ["YEARLY", "Every year on " + fmt(dt, { day: "numeric", month: "short" })]]; };
  const repDaysOf = (e) => (Array.isArray(e.repDays) && e.repDays.length ? e.repDays : [WD[parseISO(e.d).getDay()]]);
  /* does date k fit the pattern (ignoring the end rule)? */
  const repMatch = (e, k) => {
    const a = parseISO(e.d), b = parseISO(k), wd = WD[b.getDay()];
    switch (e.rep) {
      case "DAILY": return true;
      case "WEEKDAYS": return b.getDay() >= 1 && b.getDay() <= 5;
      case "WEEKENDS": return b.getDay() === 0 || b.getDay() === 6;
      case "WEEKLY": return repDaysOf(e).includes(wd);
      case "BIWEEKLY": return a.getDay() === b.getDay() && Math.round((b - a) / 864e5) % 14 === 0;
      case "MONTHLY": return a.getDate() === b.getDate();
      case "MONTHLY_NTH": { const n = nthOf(a); return a.getDay() === b.getDay() && (n === -1 ? isLastWk(b) : nthOf(b) === n); }
      case "YEARLY": return e.d.slice(5) === k.slice(5);
      default: return false;
    }
  };
  const repText = (e) => {
    if (!e.rep) return "One-time";
    const o = repOpts(e.d).find((x) => x[0] === e.rep); let t2 = e.rep === "WEEKLY" ? "Weekly on " + repDaysOf(e).map((x) => WDN[WD.indexOf(x)]).join(", ") : o ? o[1].replace(" (all 7 days)", "") : "Repeats";
    if (e.repEnd === "until" && e.repUntil) t2 += " · until " + fmt(parseISO(e.repUntil), { day: "numeric", month: "short", year: "numeric" });
    if (e.repEnd === "count" && e.repCount) t2 += " · " + e.repCount + " times";
    return t2;
  };
  const rrule = (e, timed) => {
    if (!e.rep) return null;
    const a = parseISO(e.d), n = nthOf(a);
    let r = { DAILY: "FREQ=DAILY", WEEKDAYS: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", WEEKENDS: "FREQ=WEEKLY;BYDAY=SA,SU", WEEKLY: "FREQ=WEEKLY;BYDAY=" + repDaysOf(e).join(","), BIWEEKLY: "FREQ=WEEKLY;INTERVAL=2;BYDAY=" + WD[a.getDay()], MONTHLY: "FREQ=MONTHLY;BYMONTHDAY=" + a.getDate(), MONTHLY_NTH: "FREQ=MONTHLY;BYDAY=" + n + WD[a.getDay()], YEARLY: "FREQ=YEARLY" }[e.rep];
    if (!r) return null;
    if (e.repEnd === "until" && e.repUntil) r += ";UNTIL=" + e.repUntil.replace(/-/g, "") + (timed ? "T235959Z" : "");
    else if (e.repEnd === "count" && +e.repCount > 0) r += ";COUNT=" + Math.min(+e.repCount, 999);
    return "RRULE:" + r;
  };
  /* does event e happen on date k (handles repeats)? */
  const occurs = (e, k) => {
    if (!e || !e.d || k < e.d) return false; if (Array.isArray(e.skip) && e.skip.includes(k)) return false; if (e.d === k) return true;
    if (!e.rep || !repMatch(e, k)) return false;
    if (e.repEnd === "until" && e.repUntil && k > e.repUntil) return false;
    if (e.repEnd === "count" && +e.repCount > 0) { let c = 0; for (let dt = parseISO(e.d), i = 0; i < 4000; i++, dt = addD(dt, 1)) { const dk = iso(dt); if (dk === e.d || repMatch(e, dk)) c++; if (dk === k) return c <= +e.repCount; } return false; }
    return true;
  };
  const tzOnDay = (e, k) => { if (!e.tz || !e.rep || k === e.d || !e.tzT) return e; try { const shift = Math.round((parseISO(e.d) - parseISO(e.tzD || e.d)) / 864e5), td = iso(addD(parseISO(k), -shift)), a = msToWall(wallToMs(td, e.tzT, e.tz), HOME()); if (a.d !== k) return e; const o = Object.assign({}, e, { time: a.t }); if (e.tzEnd) o.end = msToWall(wallToMs(td, e.tzEnd, e.tz), HOME()).t; return o; } catch (er) { return e; } };
  const evOn = (k) => live("events").filter(([, e]) => occurs(e, k)).map(([id, e]) => tzOnDay(Object.assign({ id }, e), k)).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  /* the Google Calendar event for one of our events */
  function buildEv(e) {
    const title = (e.kind && e.kind !== "event" ? SLABEL[e.kind] + " · " : "") + e.t;
    const desc = [e.pri ? "Priority: " + (SPRI.find((p) => p[0] === e.pri) || [, ""])[1] : "", e.note || "", "Added from My Planner"].filter(Boolean).join("\n");
    const rec = rrule(e, !!e.time);
    const hasRem = e.rem !== undefined && e.rem !== null && e.rem !== "";
    let ev;
    if (e.time) {
      ev = timedEv(title, e.d, e.time, e.end && e.end > e.time ? e.end : minToT(Math.min(tMin(e.time) + (e.kind === "study" ? 50 : 30), 1439)), rec);
      ev.reminders = e.rem === undefined ? remind(P().alerts || 10) : hasRem ? remind(Number(e.rem)) : { useDefault: false, overrides: [] };
    } else {
      ev = allDayEv(title, e.d, rec);
      ev.reminders = hasRem || e.rem === undefined ? remind(900) : { useDefault: false, overrides: [] }; /* all-day: 9 AM the day before */
    }
    ev.description = desc; if (e.pri) ev.colorId = PRICOL[e.pri];
    if (e.tz && e.tzT && e.time) { const en = e.tzEnd || minToT(Math.min(tMin(e.tzT) + 30, 1439)); ev.start = { dateTime: `${e.tzD || e.d}T${e.tzT}:00`, timeZone: e.tz }; ev.end = { dateTime: `${e.tzD || e.d}T${en}:00`, timeZone: e.tz }; }
    if (Array.isArray(e.guests) && e.guests.length) ev.attendees = e.guests.map((email) => ({ email }));
    if (e.meet && e.meet.k === "meet" && !e.meet.url) ev.conferenceData = { createRequest: { requestId: uid(), conferenceSolutionKey: { type: "hangoutsMeet" } } };
    else if (e.meet && e.meet.url) { ev.location = e.meet.url; ev.description += "\nJoin: " + e.meet.url; }
    return ev;
  }
  const evQs = (e, notify) => [`sendUpdates=${e.guests && e.guests.length ? notify || "all" : "none"}`, e.meet && e.meet.k === "meet" ? "conferenceDataVersion=1" : ""].filter(Boolean).join("&");
  const parseGuests = (txt) => { const ok = [], bad = []; String(txt || "").split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean).forEach((x) => (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(x) ? (ok.includes(x) ? 0 : ok.push(x)) : bad.push(x))); return { ok: ok.slice(0, 50), bad }; };
  const knownGuests = () => { try { return JSON.parse(localStorage.getItem("mp-guests") || "[]"); } catch (e) { return []; } };
  const rememberGuests = (list) => { try { localStorage.setItem("mp-guests", JSON.stringify([...new Set([...list, ...knownGuests()])].slice(0, 100))); } catch (e) {} };
  function schedDialog(id, preset) {
    const e0 = id ? Object.assign({}, MP.S.events[id]) : null;
    if (e0 && e0.tz && e0.tzT) { e0.d = e0.tzD || e0.d; e0.time = e0.tzT; e0.end = e0.tzEnd || ""; } /* edit in the meeting's own zone */
    const e = e0 ? e0 : id ? Object.assign({}, MP.S.events[id]) : Object.assign({ kind: "reminder", d: iso(today()), time: "", end: "", pri: "med", rem: "10", rep: "" }, preset || {});
    const signed = mode === "google", inCal = id && MP.S.sent["ev-" + id] && !MP.S.sent["ev-" + id].del;
    const habOpts = [["", "— choose a habit —"], ...P().habits.filter((h) => h.active !== false).map((h) => [h.id, h.name]), ["__new", "+ New habit (uses the title)"]];
    modal(`<div class="between"><h2>${id ? "Edit" : "Add / schedule"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">What is it?${sel('id="skind" data-skind', SKINDS, e.kind)}</label>
      <label class="stack small"><span id="stlab">${e.kind === "date" ? "Name" : "Title"}</span><input class="f" id="stitle" maxlength="120" value="${E(e.t || "")}" placeholder="e.g. Call Dr. Mehta · Revise Unit 3 · Drink water"></label>
      <div class="sk-act stack small" ${e.kind === "study" ? "" : "hidden"}><label class="stack small">Activity type${sel('id="sact"', actNames(), e.act || "Study")}</label></div>
      <div class="sk-habit stack small" ${e.kind === "habit" ? "" : "hidden"}><label class="stack small">Which habit?${sel('id="shab"', habOpts, e.hab || "")}</label></div>
      <div class="sk-date grid g2" ${e.kind === "date" ? "" : "hidden"}><label class="stack small">Type${sel('id="sdtype"', ["Birthday", "Anniversary"], "Birthday")}</label><label class="stack small">Relation<input class="f" id="srel" maxlength="40" placeholder="e.g. Cousin"></label></div>
      <div class="grid g3"><label class="stack small">Date<input class="f" type="date" id="sdate" data-skind value="${E(e.d)}"></label><label class="stack small sk-time">Start time<input class="f" type="time" id="stime" value="${E(e.time || "")}"></label><label class="stack small sk-time">End time (optional)<input class="f" type="time" id="send" value="${E(e.end || "")}"></label></div>
      <div class="sk-tz small"><button type="button" class="link tiny" data-tzshow ${e.tz ? "hidden" : ""}>Different time zone?</button><label class="stack small sk-tzbox" ${e.tz ? "" : "hidden"}>Time zone of the times above${sel('id="stz" data-skind', zoneOpts(e.tz || HOME()), e.tz || HOME())}</label><span class="tiny muted" id="stzsay"></span></div>
      <div class="sk-meet stack" style="gap:8px" ${e.kind === "event" ? "" : "hidden"}>
        <label class="stack small">Invite people (email addresses, separated by commas)<input class="f" id="sguests" list="guestlist" data-skind value="${E((e.guests || []).join(", "))}" placeholder="name@example.com, …" autocomplete="off"></label><datalist id="guestlist">${knownGuests().map((x) => `<option value="${E(x)}">`).join("")}</datalist><div class="row" id="sgchips" style="gap:4px"></div>
        ${id && (e.guests || []).length && MP.S.sent["ev-" + id] && gById(MP.S.sent["ev-" + id].id) ? `<div class="stack" style="gap:2px"><span class="lab">Replies</span>${gById(MP.S.sent["ev-" + id].id).att.map((a) => `<span class="small">${E(a.e)} <span class="muted">${RSVP[a.s] || ""}</span></span>`).join("")}</div>` : ""}
        <div class="grid g2"><label class="stack small">Meeting link${sel('id="smeet" data-skind', [["", "None"], ["meet", "Google Meet (created for you)"], ["zoom", "Zoom"], ["teams", "Microsoft Teams"], ["other", "Other link"]], (e.meet || {}).k || "")}</label><label class="stack small sk-murl" ${(e.meet || {}).k && e.meet.k !== "meet" ? "" : "hidden"}>Paste the link<input class="f" id="smurl" type="url" value="${E((e.meet || {}).k !== "meet" ? (e.meet || {}).url || "" : "")}" placeholder="https://"></label></div>
        ${(e.meet || {}).k === "meet" && e.meet.url ? `<span class="small">Meet link: <a href="${E(safeLink(e.meet.url))}" target="_blank" rel="noopener noreferrer">${E(e.meet.url)}</a></span>` : ""}</div>
      <div class="grid g3"><label class="stack small">Priority${sel('id="spri"', SPRI, e.pri || "med")}</label><label class="stack small">Reminder${sel('id="srem"', SREM, e.rem ?? "")}</label><label class="stack small sk-rep">How often?${sel('id="soften" data-skind', [["once", "One-time"], ["rep", "Recurring"]], e.rep ? "rep" : "once")}</label></div>
      <div class="sk-repbox stack card soft" style="gap:10px;padding:12px" ${e.rep ? "" : "hidden"}>
        <label class="stack small">Repeats${sel('id="srep" data-skind', repOpts(e.d), e.rep || (e.kind === "study" ? "WEEKDAYS" : "DAILY"))}</label>
        <div class="sk-wdays row small" style="gap:6px;flex-wrap:wrap" ${e.rep === "WEEKLY" ? "" : "hidden"}>${[1, 2, 3, 4, 5, 6, 0].map((i) => `<label class="pill row"><input type="checkbox" data-skind data-swd="${WD[i]}" ${(e.rep === "WEEKLY" ? repDaysOf(e) : [WD[parseISO(e.d).getDay()]]).includes(WD[i]) ? "checked" : ""}> ${WDN[i]}</label>`).join("")}</div>
        <div class="grid g2"><label class="stack small">Ends${sel('id="sendby" data-skind', [["never", "Never"], ["until", "On a date"], ["count", "After a number of times"]], e.repEnd || "never")}</label>
        <label class="stack small sk-until" ${e.repEnd === "until" ? "" : "hidden"}>End date<input class="f" type="date" id="suntil" data-skind value="${E(e.repUntil || "")}"></label>
        <label class="stack small sk-count" ${e.repEnd === "count" ? "" : "hidden"}>Number of times<input class="f" type="number" min="1" max="999" id="scount" data-skind value="${E(e.repCount || 10)}"></label></div>
        <span class="tiny muted" id="sreptxt"></span></div>
      <div class="sk-yearly small muted" ${e.kind === "date" ? "" : "hidden"}>↻ Repeats every year automatically.</div>
      <label class="stack small">Notes (optional)<textarea class="f" id="snote" rows="2" maxlength="500">${E(e.note || "")}</textarea></label>
      <label class="row small" style="gap:8px"><input type="checkbox" id="scal" ${signed && (inCal || !id) ? "checked" : ""} ${signed ? "" : "disabled"}> ${inCal ? "Keep in Google Calendar (updates it)" : "Also add to Google Calendar"}${signed ? "" : ' <span class="muted">(sign in with Google to use)</span>'}</label>
      <span class="tiny muted" id="shint">With a time, the reminder pops up on your phone through Google Calendar, and in the app while it is open. Without a time it is an all-day item; the reminder comes at 9 AM the day before.</span>
      <div class="row" style="justify-content:flex-end">${id ? `<button class="btn ghost danger" data-sdel="${E(id)}">Delete</button>` : ""}<button class="btn ghost" data-close>Cancel</button><button class="btn" data-ssave="${E(id || "")}">${id ? "Save" : "Add"}</button></div>`);
    schedKind();
  }
  function schedKind(src) {
    const k = field("skind"), q = (s) => document.querySelectorAll(s);
    if (src === "skind" && (k === "habit" || k === "study")) { const o = document.getElementById("soften"), r = document.getElementById("srep"); if (o && o.value === "once") { o.value = "rep"; if (r) r.value = k === "habit" ? "DAILY" : "WEEKDAYS"; } }
    q(".sk-habit").forEach((x) => (x.hidden = k !== "habit")); q(".sk-act").forEach((x) => (x.hidden = k !== "study"));
    q(".sk-meet").forEach((x) => (x.hidden = k !== "event")); q(".sk-tz").forEach((x) => (x.hidden = k === "date" || k === "task"));
    const mk = field("smeet"); q(".sk-murl").forEach((x) => (x.hidden = !mk || mk === "meet"));
    if (src === "smeet" && (mk === "zoom" || mk === "teams")) { const u = document.getElementById("smurl"), saved = (P().mlinks || {})[mk]; if (u && !u.value && saved) u.value = saved; }
    const gc = document.getElementById("sgchips"); if (gc) { const g2 = parseGuests(field("sguests")); gc.innerHTML = g2.ok.map((x) => `<span class="pill tiny">${E(x)}</span>`).join("") + g2.bad.map((x) => `<span class="pill tiny late">${E(x)}?</span>`).join(""); }
    const ts = document.getElementById("stzsay"), z = field("stz"); if (ts) ts.textContent = z && z !== HOME() && field("stime") && field("sdate") ? (() => { const a = msToWall(wallToMs(field("sdate"), field("stime"), z), HOME()); return `= ${fmtT(a.t)}${a.d !== field("sdate") ? " (" + fmt(parseISO(a.d), { weekday: "short", day: "numeric", month: "short" }) + ")" : ""} ${zoneName(HOME())} time`; })() : ""; q(".sk-date").forEach((x) => (x.hidden = k !== "date"));
    q(".sk-time,.sk-rep").forEach((x) => (x.hidden = k === "date")); q(".sk-yearly").forEach((x) => (x.hidden = k !== "date"));
    const recur = k !== "date" && field("soften") === "rep"; q(".sk-repbox").forEach((x) => (x.hidden = !recur));
    if (src === "sdate" && field("sdate")) { const on = [...document.querySelectorAll("[data-swd]:checked")]; if (on.length <= 1) { const w2 = WD[parseISO(field("sdate")).getDay()]; document.querySelectorAll("[data-swd]").forEach((x) => (x.checked = x.dataset.swd === w2)); } }
    const rs = document.getElementById("srep"), dk = field("sdate");
    if (rs && dk) { const cur = rs.value; rs.innerHTML = repOpts(dk).map(([v, l]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${E(l)}</option>`).join(""); }
    q(".sk-wdays").forEach((x) => (x.hidden = field("srep") !== "WEEKLY"));
    const eb = field("sendby"); q(".sk-until").forEach((x) => (x.hidden = eb !== "until")); q(".sk-count").forEach((x) => (x.hidden = eb !== "count"));
    const tx = document.getElementById("sreptxt"); if (tx && recur && dk) tx.textContent = "Summary: " + repText(schedRep({ d: dk }));
    const l = document.getElementById("stlab"); if (l) l.textContent = k === "date" ? "Name" : "Title";
    if (k === "reminder" && !field("stime")) { const tm = document.getElementById("stime"); if (tm) tm.value = "09:00"; }
  }
  /* read the repeat fields from the form into an event */
  function schedRep(o) {
    if (field("soften") !== "rep") return Object.assign(o, { rep: "", repDays: [], repEnd: "", repUntil: "", repCount: "" });
    o.rep = field("srep"); o.repDays = o.rep === "WEEKLY" ? [...document.querySelectorAll("[data-swd]:checked")].map((x) => x.dataset.swd) : [];
    if (o.rep === "WEEKLY" && !o.repDays.length) o.repDays = [WD[parseISO(o.d).getDay()]];
    o.repEnd = field("sendby") || "never"; o.repUntil = o.repEnd === "until" ? field("suntil") : ""; o.repCount = o.repEnd === "count" ? String(Math.max(1, Math.min(999, parseInt(field("scount"), 10) || 1))) : "";
    return o;
  }
  async function schedSave(id) {
    const kind = field("skind"); let title = field("stitle").slice(0, 120); const d = field("sdate") || iso(today());
    let toCal = (document.getElementById("scal") || {}).checked;
    if (kind === "habit" && !title) { const h = P().habits.find((x) => x.id === field("shab")); if (h) title = h.name; }
    if (!title) { MP.toast(kind === "date" ? "Add the person's name" : "Add a title"); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { MP.toast("Pick a date"); return; }
    if (kind === "date") {
      const did = uid(); putRec("dates", did, { n: title, rel: field("srel").slice(0, 40), type: field("sdtype") || "Birthday", md: d.slice(5) });
      closeModal(); MP.render(); MP.toast("Saved in Special dates");
      if (toCal) { await sendKey("date-" + did, { kind: "date", x: MP.S.dates[did] }); }
      return;
    }
    const time = field("stime"), end = field("send"), pri = field("spri"), rem = field("srem"), note = field("snote").slice(0, 500);
    if (end && time && end <= time) { MP.toast("End time should be after the start time"); return; }
    const eid = id || uid(), old = MP.S.events[eid] || {};
    const rec = schedRep({ d, time, end: time ? end : "", t: title, kind, pri, rem, note });
    if (kind === "study") rec.act = field("sact") || "Study";
    /* another time zone: keep the meeting's own time, and store the home-zone time the planner shows */
    const z = field("stz");
    if (time && z && z !== HOME() && kind !== "date" && kind !== "task") { const a = msToWall(wallToMs(rec.d, time, z), HOME()); Object.assign(rec, { tz: z, tzD: rec.d, tzT: time, tzEnd: end || "", d: a.d, time: a.t, end: end ? msToWall(wallToMs(rec.d, end, z), HOME()).t : "" }); }
    /* guests and meeting link (meetings only) */
    let notify = "all";
    if (kind === "event") {
      const g2 = parseGuests(field("sguests")); if (g2.bad.length) { MP.toast("Check these addresses: " + g2.bad.join(", ")); return; }
      if (g2.ok.length) rec.guests = g2.ok;
      const mk = field("smeet");
      if (mk) { const keep = old.meet && old.meet.k === "meet" && mk === "meet" ? old.meet.url || "" : ""; rec.meet = { k: mk, url: mk === "meet" ? keep : field("smurl") }; if (mk !== "meet" && !safeLink(rec.meet.url)) { MP.toast("Paste the meeting link (it starts with https://)"); return; } }
      if ((rec.guests || rec.meet && rec.meet.k === "meet") && mode !== "google") { MP.toast("Sign in with Google to invite people or create a Meet link"); return; }
      if (rec.guests || (rec.meet && rec.meet.k === "meet")) toCal = true;
      const fresh = (rec.guests || []).filter((x) => !(old.guests || []).includes(x));
      if (fresh.length && !window.confirm(`Send a Google Calendar invite from your Gmail address to:\n\n${fresh.join("\n")}\n\nOK to send?`)) return;
      if (id && (old.guests || []).length && !fresh.length && (old.time !== rec.time || old.d !== rec.d || old.end !== rec.end || old.t !== rec.t)) notify = window.confirm("Send the update to your guests?") ? "all" : "none";
      if (rec.guests) rememberGuests(rec.guests);
    }
    if (rec.rep && rec.repEnd === "until" && (!rec.repUntil || rec.repUntil < d)) { MP.toast("Pick an end date after the start date"); return; }
    if (rec.rep && !repMatch(rec, rec.d)) { for (let i = 1; i < 400; i++) { const dk = iso(addD(parseISO(rec.d), i)); if (repMatch(rec, dk)) { rec.d = dk; break; } } } /* start on the first day that fits */
    if (kind === "habit") { let hid = field("shab"); if (hid === "__new" || (!hid && title)) { hid = uid(); P().habits.push({ id: hid, name: title.slice(0, 60), def: "", active: true }); touchP(); } rec.hab = hid; }
    if (kind === "task" && !id) {
      const tid = uid(), tk = { t: title.slice(0, 1000), d, due: "", done: false, urg: pri === "urgent" || pri === "high", imp: pri !== "low", c: Date.now(), sub: [] };
      if (toCal && mode === "google") { const slot = calSlot(d); tk.cal = { d: time ? d : slot.d, t: time || slot.t }; }
      putRec("tasks", tid, tk); closeModal(); MP.render(); MP.toast("Added to Today and your To-Do list"); await taskCalSync(tid); return;
    }
    if (kind === "task") {
      const tid = old.tid && MP.S.tasks[old.tid] && !MP.S.tasks[old.tid].del ? old.tid : uid(), prev = MP.S.tasks[tid] || {};
      putRec("tasks", tid, Object.assign({ b: "", done: false }, prev, { t: title.slice(0, 160), due: d, urg: pri === "urgent" || pri === "high", imp: pri !== "low" }));
      rec.tid = tid;
    }
    if (route === "day" && id && old.rep && rec.rep && (old.time !== rec.time || old.end !== rec.end || old.t !== rec.t || old.pri !== rec.pri || old.note !== rec.note)) { const full = Object.assign({}, rec, { d: old.d }); return scopeAsk({ src: "ev", id, k: view.dayK || iso(today()), title: old.t, patch: rec, full }); }
    putRec("events", eid, rec); closeModal(); MP.render();
    MP.toast(id ? "Saved" : kind === "task" ? "Added to Today and your To-Do list" : "Added to your schedule");
    if (rem !== "" && time && "Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch (er) {} }
    const key = "ev-" + eid, sent = MP.S.sent[key], wasIn = sent && !sent.del;
    if (mode !== "google") return;
    try {
      const withPeople = (rec.guests && rec.guests.length) || (old.guests && old.guests.length) || rec.meet;
      if (wasIn && toCal && id && withPeople) { /* invites: update in place, so guests get an update, not a cancel + new invite */
        const j = await G.calPatch(sent.id, buildEv(MP.S.events[eid]), evQs(Object.assign({}, rec, { guests: rec.guests || old.guests }), notify));
        if (rec.meet && rec.meet.k === "meet" && j && j.hangoutLink) { MP.S.events[eid].meet = { k: "meet", url: safeLink(j.hangoutLink) }; MP.S.events[eid].u = Date.now(); MP.changed(); }
        MP.toast(notify === "all" && (rec.guests || []).length ? "Saved; guests were sent the update" : "Saved and updated in Google Calendar"); MP.render(); gcalRefresh(true); return;
      }
      if (wasIn && (!toCal || id)) { try { await G.calDelete(sent.id, (old.guests || []).length ? "sendUpdates=all" : ""); } catch (er) {} MP.S.sent[key] = { del: 1, u: Date.now() }; MP.changed(); }
      if (toCal) await sendKey(key, { kind: "event", e: MP.S.events[eid] }, true);
      else if (wasIn) MP.toast("Removed from Google Calendar");
      MP.render();
    } catch (er) { MP.toast(er.reauth ? "Saved. Tap sync to reconnect, then use Send to Calendar." : "Saved, but Calendar said: " + er.message); }
  }
  async function sendKey(key, spec, quiet) {
    if (mode !== "google") return;
    try {
      let ev;
      if (spec.kind === "event") ev = buildEv(spec.e);
      else { const x = spec.x, [mm, dd] = x.md.split("-").map(Number); let y = today().getFullYear(); if (new Date(y, mm - 1, dd) < today()) y++; ev = allDayEv(`${x.n} · ${x.type}`, `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`, "RRULE:FREQ=YEARLY"); }
      const cid = await G.calInsert(ev, spec.kind === "event" ? evQs(spec.e) : "");
      MP.S.sent[key] = { id: cid, u: Date.now() };
      if (spec.kind === "event" && spec.e.meet && spec.e.meet.k === "meet" && G.lastEv && G.lastEv.hangoutLink) { const eid = key.slice(3), r = MP.S.events[eid]; if (r) { r.meet = { k: "meet", url: safeLink(G.lastEv.hangoutLink) }; r.u = Date.now(); } }
      MP.changed(); MP.render(); gcalRefresh(true);
      MP.toast(quiet ? "Saved and added to Google Calendar" : "Added to your Google Calendar");
    } catch (er) { MP.toast(er.reauth ? "Saved. Tap sync to reconnect, then use Send to Calendar." : "Saved, but Calendar said: " + er.message); }
  }
  /* birthdays & anniversaries go to Google Calendar as yearly events automatically (Settings can turn this off) */
  const autoDate = (did) => { if (mode === "google" && P().autoDates !== false && MP.S.dates[did]) sendKey("date-" + did, { kind: "date", x: MP.S.dates[did] }, true); };
  /* Today card: what's scheduled today, and the next few days */
  const schedRow = (e, showDate) => `<div class="between wrap sched ${PRICLS[e.pri] || ""}"><button class="link left" data-sedit="${E(e.id)}" style="text-align:left"><b>${showDate ? fmt(parseISO(e.d), { weekday: "short", day: "numeric" }) + " · " : ""}${e.time ? fmtT(e.time) + (e.end ? "–" + fmtT(e.end) : "") : "All day"}</b>${e.tz && e.tzT ? ` <span class="tiny muted">(${fmtT(e.tzT)} ${E(zoneName(e.tz))})</span>` : ""} · ${E(e.t)}${e.guests && e.guests.length ? ` <span class="tiny muted">· ${e.guests.length} guest${e.guests.length > 1 ? "s" : ""}</span>` : ""}</button><span class="row" style="gap:6px">${e.meet && safeLink(e.meet.url) ? `<a class="${soonOrNow(e.d, e.time, e.end) ? "btn sm" : "link tiny"}" href="${E(e.meet.url)}" target="_blank" rel="noopener noreferrer">${soonOrNow(e.d, e.time, e.end) ? "Join" : "Join link"}</a>` : ""}<span class="pill tiny">${E(SLABEL[e.kind] || "Event")}</span>${e.pri ? `<span class="pill tiny ${PRICLS[e.pri]}">${E((SPRI.find((p) => p[0] === e.pri) || [, ""])[1])}</span>` : ""}${e.rem !== undefined && e.rem !== "" ? '<span title="Reminder on" aria-label="Reminder on">🔔</span>' : ""}${e.rep ? `<span class="tiny muted" title="${E(repText(e))}">↻ ${E(repText(e).split(" · ")[0])}</span>` : ""}${calBtn("ev-" + e.id, e.t, { kind: "event", e })}</span></div>`;
  function schedCard() {
    const t = today(), k = iso(t), now = minToT(new Date().getHours() * 60 + new Date().getMinutes());
    const td = [...evOn(k).map((e) => ({ s: e.time || "", h: () => `<div style="${e.time && (e.end || e.time) < now ? "opacity:.6" : ""}">${schedRow(e)}</div>` })), ...gOn(k).map((g) => ({ s: g.allDay || g.d < k ? "" : g.t, h: () => `<div style="${!g.allDay && (g.d2 || g.d) === k && g.t2 < now ? "opacity:.6" : ""}">${gRow(g, k)}</div>` }))].sort((a, b) => a.s.localeCompare(b.s)), up = [];
    for (let i = 1; i <= 7 && up.length < 5; i++) { const kk = iso(addD(t, i)), day = []; evOn(kk).forEach((e) => { if (!["DAILY", "WEEKDAYS", "WEEKENDS"].includes(e.rep)) day.push({ s: e.time || "", h: () => schedRow(Object.assign({}, e, { d: kk }), true) }); }); gOn(kk).forEach((g) => { if (g.d === kk) day.push({ s: g.allDay ? "" : g.t, h: () => gRow(g, kk, true) }); }); day.sort((a, b) => a.s.localeCompare(b.s)).forEach((x) => { if (up.length < 5) up.push(x); }); }
    return `<section class="card stack mt"><div class="between"><span class="lab">Today's schedule</span><button class="btn sm" data-sched>${ic("plus", 16)} Add / schedule</button></div>
      ${td.map((x) => x.h()).join("") || '<span class="small muted">Nothing scheduled today. Tap Add / schedule for a reminder, task, habit, activity or event.</span>'}
      ${up.length ? `<span class="lab mt">Coming up</span>${up.map((x) => x.h()).join("")}` : ""}</section>`;
  }
  /* in-app reminders while the app is open (Calendar handles them when it is closed) */
  const firedKey = "mp-fired";
  setInterval(() => {
    if (mode === "signin") return;
    const BL = P().links && P().links.buddy; if (BL && BL.on && BL.ring) return; /* Buddy rings them on Telegram, email and its command centre */
    const n = new Date(), k = iso(n), nowM = n.getHours() * 60 + n.getMinutes();
    let fired; try { fired = JSON.parse(sessionStorage.getItem(firedKey) || "{}"); } catch (er) { fired = {}; }
    evOn(k).forEach((e) => {
      if (!e.time || e.rem === undefined || e.rem === "" || Number(e.rem) >= 1440) return;
      const at = tMin(e.time) - Number(e.rem), tag = e.id + "@" + k;
      if (nowM >= at && nowM <= at + 10 && !fired[tag]) { fired[tag] = 1; notify((SLABEL[e.kind] || "Reminder") + " · " + fmtT(e.time), e.t); }
    });
    try { sessionStorage.setItem(firedKey, JSON.stringify(fired)); } catch (er) {}
  }, 30000);

  /* ---------- event handling ---------- */
  const CYC = { e: "d", d: "p", p: "m", m: "e" };
  const field = (id) => (document.getElementById(id) || { value: "" }).value.trim();
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button,[data-done],label.btn"); if (!t) return; const d = t.dataset;
    if (d.go) return go(d.go);
    if (d.signin !== undefined) return signIn();
    if (d.demo !== undefined) { mode = "demo"; MP.idbGet("state:demo").then((c) => { MP.S = MP.sanitize(c || MP.blank()); MP.render(); }); return; }
    if (d.resync !== undefined) return reconnect();
    if (d.close !== undefined) return closeModal();
    if (d.signout !== undefined) return signOutDialog();
    if (d.dosignout !== undefined) return doSignOut();
    if (d.wipe !== undefined) return wipeDialog();
    if (d.dowipe !== undefined) return doWipe();
    if (d.menup) { P().menu = Object.assign(d.menup === "simple" ? menuSimple() : { preset: "full", hide: {} }, { chosen: true }); touchP(); if (d.menuclose !== undefined) closeModal(); MP.render(); MP.toast(d.menup === "simple" ? "Simple menu" : "Full menu: every screen shown"); return; }
    if (d.dnav !== undefined) { const step = view.dv === "week" ? (window.innerWidth < 760 ? 3 : 7) : 1; view.dayK = +d.dnav === 0 ? iso(today()) : iso(addD(parseISO(view.dayK || iso(today())), +d.dnav * step)); view.dscr = ""; return MP.render(); }
    if (d.dvw) { view.dv = d.dvw; view.dscr = ""; return MP.render(); }
    if (d.dpick) { view.dayK = d.dpick; if (d.dvday !== undefined) view.dv = "day"; view.dscr = ""; return MP.render(); }
    if (d.scope) return applyScope(d.scope);
    if (d.rtsave) { const [rid, rk] = d.rtsave.split("|"), r = ttFor(parseISO(rk)).find((x) => x.id === rid); if (!r) return; const patch = {}; const st = field("rts"), en = field("rte"), tx = field("rtt").slice(0, 120); if (st && st !== r.start) patch.start = st; if (en !== (r.end || "")) patch.end = en; if (tx && tx !== r.text) patch.text = tx; const ra = field("rta"); if (ra && isAct(r) && ra !== actOf(r)) { if (ra === "Study") { patch.type = "Study"; } else { patch.type = "Activity"; patch.act = ra; } } if (!Object.keys(patch).length) return closeModal(); return scopeAsk({ src: "tt", id: rid, k: rk, title: r.text, patch }); }
    if (d.rtdel) { const [rid, rk] = d.rtdel.split("|"), r = ttFor(parseISO(rk)).find((x) => x.id === rid); return scopeAsk({ src: "tt", id: rid, k: rk, title: r ? r.text : "", del: true }); }
    if (d.setupgo) { closeModal(); view.sAnchor = d.setupgo; return go("prefs"); }
    if (d.setuphide !== undefined) { P().setupSeen = Object.assign({}, P().setupSeen, { hidden: true }); touchP(); return MP.render(); }
    if (d.menukeep !== undefined) { P().menu = Object.assign({ preset: "full", hide: {} }, P().menu || {}, { chosen: true }); touchP(); MP.toast("Menu saved"); return MP.render(); }
    if (d.planopen !== undefined) return planDialog();
    if (d.shutopen !== undefined) return shutDialog();
    if (d.plandone !== undefined || d.planskip !== undefined) { const k = iso(today()), r = dayRec(k); r.plan = { at: Date.now(), skipped: d.planskip !== undefined }; touchDay(k); closeModal(); MP.render(); MP.toast(d.planskip !== undefined ? "Skipped for today" : "Have a good day"); return; }
    if (d.rmove) { const [tid, w] = d.rmove.split("|"), x = MP.S.tasks[tid]; if (!x) return; if (w === "drop") { delRec("tasks", tid); MP.toast("Dropped"); } else { x.inbox = w === "inbox"; if (w !== "inbox") x.d = iso(addD(today(), +w)); x.u = Date.now(); MP.changed(); } const sd = document.getElementById("shutnote"); const wasShut = !!sd; MP.render(); return wasShut ? shutDialog() : planDialog(); }
    if (d.rmoveall !== undefined) { const k1 = iso(addD(today(), 1)), G2 = taskGroups(); [...G2.overdue, ...G2.today.filter((x) => !x.done)].forEach((x) => { const r = MP.S.tasks[x.id]; r.d = k1; r.inbox = false; r.u = Date.now(); }); MP.changed(); MP.render(); MP.toast("Moved to tomorrow"); return shutDialog(); }
    if (d.shutmood) { const k = iso(today()), r = dayRec(k); r.mood = r.mood || {}; r.mood.pm = Object.assign({ s: 3 }, r.mood.pm, { w: d.shutmood }); touchDay(k); return shutDialog(); }
    if (d.shutdone !== undefined) { const k = iso(today()), r = dayRec(k); r.shut = { at: Date.now(), note: field("shutnote").slice(0, 200) }; touchDay(k); closeModal(); MP.render(); MP.toast("Day closed. Rest well."); return; }
    if (d.rvw !== undefined) { const cur = view.rvw ? parseISO(view.rvw) : monday(today()); view.rvw = +d.rvw === 0 ? "" : iso(addD(cur, +d.rvw)); return MP.render(); }
    if (d.qsave !== undefined) return quickSave(false);
    if (d.qfix !== undefined) return quickSave(true);
    if (d.gev) return gcalDialog(d.gev);
    if (d.tzshow !== undefined) { document.querySelectorAll(".sk-tzbox").forEach((x) => (x.hidden = false)); t.hidden = true; return; }
    if (d.gcconnect !== undefined) { G.authorize(true).then(() => { P().gcal = Object.assign({ on: true }, P().gcal || {}); touchP(); MP.render(); gcalRefresh(true); MP.toast(G.hasCal ? "Google Calendar connected" : "Calendar permission wasn't given"); }).catch((er) => MP.toast(er.message)); return; }
    if (d.gcnow !== undefined) { gcalRefresh(true).then(() => MP.toast("Calendar refreshed")); return; }
    if (d.gcpick !== undefined) { (G.hasList ? Promise.resolve() : G.authorize(true, true)).then(() => G.calCalendars()).then((list) => { if (!list) { MP.toast("Google didn't allow listing your calendars"); return; } const cur = (P().gcal || {}).cals || { primary: { on: true } };
        modal(`<h2>Calendars to show</h2>${list.map((c) => { const key = c.primary ? "primary" : c.id; return `<label class="row small"><input type="checkbox" data-gcsel="${E(key)}" data-gcname="${E(c.summary || "")}" data-gccol="${E(c.backgroundColor || "")}" ${(cur[key] || {}).on ? "checked" : ""}> <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${E(c.backgroundColor || "#999")}"></span> ${E(c.summary || key)}${c.primary ? " (main)" : ""}</label>`; }).join("")}<div class="row" style="justify-content:flex-end"><button class="btn" data-gcdone>Done</button></div>`); }).catch((er) => MP.toast(er.message)); return; }
    if (d.gcdone !== undefined) { const cals = {}; document.querySelectorAll("[data-gcsel]").forEach((x) => { cals[x.dataset.gcsel] = { on: x.checked, name: x.dataset.gcname, color: x.dataset.gccol }; }); P().gcal = Object.assign({ on: true }, P().gcal || {}, { cals }); touchP(); closeModal(); MP.render(); gcalRefresh(true); return; }
    if (d.unpin !== undefined) return tryPin();
    if (d.unbio !== undefined) return tryBio();
    if (d.pinforgot !== undefined) return pinForgot();
    if (d.pinreset !== undefined) return pinReset();
    if (d.bioset !== undefined) return setBio();
    if (d.biooff !== undefined) { try { localStorage.removeItem("mp-bio"); } catch (er) {} MP.render(); return; }
    if (d.pinchange !== undefined) { if (lockOn() && !unlocked) return go("journal"); modal(`<h2>${lockOn() ? "Change" : "Set"} your PIN</h2><label class="stack small">New PIN (4 to 6 digits)<input class="f" type="password" inputmode="numeric" maxlength="6" id="pin1"></label><label class="stack small">Type it again<input class="f" type="password" inputmode="numeric" maxlength="6" id="pin2"></label><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-pinsave>Save PIN</button></div>`); return; }
    if (d.pinsave !== undefined) return setPin();
    if (d.pinoff !== undefined) { if (!unlocked) return go("journal"); delete P().lock; try { localStorage.removeItem("mp-bio"); } catch (er) {} touchP(); MP.render(); MP.toast("Journal lock is off"); return; }
    if (d.tnew !== undefined) return taskDialog(null);
    if (d.tedit) return taskDialog(d.tedit);
    if (d.tsave !== undefined) return taskSave(d.tsave);
    if (d.tpin) { const x = MP.S.tasks[d.tpin]; if (x) { x.pin = !x.pin; if (x.pin) x.pinO = Date.now(); x.u = Date.now(); MP.changed(); MP.render(); MP.toast(x.pin ? "Pinned as a post-it (top right of every screen)" : "Removed from post-its"); } return; }
    if (d.tmove !== undefined) { const to = iso(addD(today(), +d.tmove)), G2 = taskGroups(); G2.overdue.forEach((x) => { const r = MP.S.tasks[x.id]; r.d = to; r.inbox = false; r.u = Date.now(); }); MP.changed(); MP.render(); MP.toast(`Moved ${G2.overdue.length} task${G2.overdue.length === 1 ? "" : "s"} to ${+d.tmove ? "tomorrow" : "today"}`); return; }
    if (d.tundo) return markDone(d.tundo, false);
    if (d.pnote) return postitPad(d.pnote);
    if (d.pclose !== undefined) { closeModal(); return MP.render(); }
    if (d.postnav) { let n = 0; try { n = +localStorage.getItem("mp-postidx") || 0; localStorage.setItem("mp-postidx", n + +d.postnav); } catch (er) {} return postitLayer(); }
    if (d.postcol !== undefined) { try { localStorage.setItem("mp-postcol", d.postcol); } catch (er) {} return postitLayer(); }
    if (d.sched !== undefined) { document.getElementById("sheet").classList.remove("on"); return schedDialog(null, d.sched ? { d: d.sched } : null); }
    if (d.sedit) return schedDialog(d.sedit);
    if (d.ssave !== undefined) return schedSave(d.ssave || null);
    if (d.sdel && route === "day" && MP.S.events[d.sdel] && MP.S.events[d.sdel].rep) return scopeAsk({ src: "ev", id: d.sdel, k: view.dayK || iso(today()), title: MP.S.events[d.sdel].t, del: true });
    if (d.sdel) { const ev = MP.S.events[d.sdel], key = "ev-" + d.sdel, s2 = MP.S.sent[key]; if (s2 && !s2.del && mode === "google") { const tell = ev && (ev.guests || []).length ? window.confirm("Tell your guests the meeting is cancelled?") : false; G.calDelete(s2.id, tell ? "sendUpdates=all" : "sendUpdates=none").catch(() => {}); } if (s2 && !s2.del) MP.S.sent[key] = { del: 1, u: Date.now() }; delRec("events", d.sdel); closeModal(); MP.render(); MP.toast(ev && ev.tid ? "Deleted (the To-Do task stays)" : "Deleted"); return; }
    if (d.cal) return calDialog(d.cal);
    if (d.calgo) return calSend(d.calgo);
    if (d.calrm) return calRemove(d.calrm);
    if (d.write) { MP.inputMode = d.write; MP.pref.set("input", d.write); return go("three"); }
    if (d.fbsend !== undefined) return fbSubmit(true);
    if (d.fbsave !== undefined) return fbSubmit(false);
    if (d.fbone) { const f = MP.S.feedback[d.fbone]; if (f) { f.status = "sent"; f.u = Date.now(); MP.changed(); MP.render(); openEmail([f]); } return; }
    if (d.fbemailall !== undefined) { const l = fbList(); l.forEach((f) => { MP.S.feedback[f.id].status = "sent"; MP.S.feedback[f.id].u = Date.now(); }); MP.changed(); MP.render(); return openEmail(l); }
    if (d.fbdel) { delRec("feedback", d.fbdel); MP.render(); syncFeedbackDoc().catch(() => {}); return; }
    if (d.fbbrief !== undefined) return modal(`<div class="between"><h2>Suggestions brief</h2><button class="tool" data-close aria-label="Close">✕</button></div><textarea class="f" rows="14" readonly id="fbb">${E(fbBrief(fbList()))}</textarea><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-fbcopy>Copy</button><button class="btn" data-fbemailall>Email it</button></div>`);
    if (d.fbcopy !== undefined) { const t2 = document.getElementById("fbb"); t2.select(); try { navigator.clipboard.writeText(t2.value).then(() => MP.toast("Brief copied")); } catch (er) { document.execCommand && document.execCommand("copy"); MP.toast("Brief copied"); } return; }
    if (d.fbyes !== undefined) { P().fbShare.on = true; touchP(); closeModal(); MP.render(); syncFeedbackDoc().then(() => MP.toast("Shared suggestions doc created")).catch((er) => MP.toast("Couldn't create the doc yet: " + er.message)); return; }
    if (d.hsec) { view.hq = ""; if (route !== "help") go("help"); else MP.render(); const el = document.getElementById("help-" + d.hsec); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (d.wnseen !== undefined) { P().seenVersion = MP.VERSION; touchP(); return MP.render(); }
    if (d.vhist !== undefined) return modal(historyHTML());
    if (d.snd) { d.snd === "play" ? startSound() : stopSound(); return MP.render(); }
    if (d.sndtype) { SND().type = d.sndtype; touchP(); if (MP.sound && MP.sound.playing()) startSound(); return MP.render(); }
    if (d.inok) return approveInbox(d.inok);
    if (d.inno) { const it = MP.S.inbox[d.inno]; if (it) { it.status = "dismissed"; it.u = Date.now(); MP.changed(); MP.render(); } return; }
    if (d.jshuf !== undefined) { view.jshuf = (view.jshuf || 0) + 1; return MP.render(); }
    if (d.jgo) { view.jd = d.jgo; return MP.render(); }
    if (d.h) { const k = iso(today()), r = dayRec(k), hb = P().habits.find((x) => x.id === d.h); r.h = r.h || {};
      if (hb && hb.freq && hb.freq.k === "count") { r.hn = r.hn || {}; let n = (r.hn[d.h] || 0) + 1; if (n > hb.freq.n) n = 0; r.hn[d.h] = n; r.h[d.h] = n >= hb.freq.n ? "d" : n > 0 ? "p" : ""; if (!r.h[d.h]) delete r.h[d.h]; }
      else r.h[d.h] = CYC[r.h[d.h] || "e"];
      touchDay(k); return MP.render(); }
    if (d.hd) { const r = dayRec(d.hd); r.h = r.h || {}; r.h[d.hi] = CYC[r.h[d.hi] || "e"]; touchDay(d.hd); return MP.render(); }
    if (d.dv) { view.dash = d.dv; return MP.render(); }
    if (d.pv) { view.plan = d.pv; return MP.render(); }
    if (d.ym !== undefined) { view.pm = new Date(view.pm.getFullYear(), +d.ym, 1); view.plan = "month"; return MP.render(); }
    if (d.py) { view.pm = new Date(view.pm.getFullYear() + +d.py, view.pm.getMonth(), 1); return MP.render(); }
    if (d.pm !== undefined) { view.pm = d.pm === "0" ? new Date(today().getFullYear(), today().getMonth(), 1) : new Date(view.pm.getFullYear(), view.pm.getMonth() + +d.pm, 1); return MP.render(); }
    if (d.ttv) { view.tt = d.ttv; return MP.render(); }
    if (d.weon !== undefined) { P().weekend = P().timetable.map((r) => Object.assign({}, r, { id: uid() })); view.tt = "we"; touchP(); return MP.render(); }
    if (d.weoff !== undefined) { P().weekend = null; view.tt = "wd"; touchP(); return MP.render(); }
    if (d.ttadd !== undefined) { const arr = view.tt === "we" && Array.isArray(P().weekend) ? P().weekend : P().timetable; const lastEnd = arr.reduce((m2, r) => Math.max(m2, tMin(r.end || r.start) || 0), 7 * 60); arr.push({ id: uid(), start: minToT(lastEnd), end: minToT(lastEnd + 30), text: "New activity", type: "Free" }); touchP(); return MP.render(); }
    if (d.ttsuggest !== undefined) { P().timetable = D.suggest.routine.map((r) => ({ id: uid(), start: r[0], end: r[1], text: r[2], type: r[3] })); touchP(); return MP.render(); }
    if (d.ttdel) { ["timetable", "weekend"].forEach((k) => { if (Array.isArray(P()[k])) P()[k] = P()[k].filter((r) => r.id !== d.ttdel); }); touchP(); return MP.render(); }
    if (d.hadd !== undefined || d.hsug) { const n = d.hsug || field("newh"); if (n) { P().habits.push({ id: uid(), name: n.slice(0, 60), def: "", active: true }); touchP(); } return MP.render(); }
    if (d.hact) { const h = P().habits.find((x) => x.id === d.hact); if (h) { h.active = h.active === false; touchP(); } return MP.render(); }
    if (d.tstart) { const r = ttFor(today()).find((x) => x.id === d.tstart); if (r) tmStart(rowLen(r) || 25, { row: r.id, label: actOf(r) + " · " + r.text }); return; }
    if (d.tquick) return tmStart(+d.tquick);
    if (d.tcustom !== undefined) { const n = parseInt(field("tcmin"), 10); if (!(n > 0 && n <= 600)) { MP.toast("Type minutes between 1 and 600"); return; } return tmStart(n); }
    if (d.tpomo !== undefined) return tmStart(25, { pomo: true });
    if (d.tpause !== undefined) { if (tm.run) { tm.left = tm.endAt - Date.now(); tm.run = false; stopSound(); wakeOff(); calBackup(false); } else { tm.endAt = Date.now() + tm.left; tm.run = true; wakeOn(); calBackup(true); if (SND().auto && tm.segs[tm.i].k === "f") startSound(); } tmSave(); return MP.render(); }
    if (d.tstop !== undefined) return tmStop();
    if (d.actsel !== undefined) { view.act = d.actsel; return MP.render(); }
    if (d.actgo !== undefined) { view.act = d.actgo; document.getElementById("sheet").classList.remove("on"); return go("study"); }
    if (d.actaddrow) { const n = field("newact").slice(0, 30); if (!n) return; const A = ensureActs(); if (!A.some((a) => a.name.toLowerCase() === n.toLowerCase())) A.push({ name: n }); setTT(d.actaddrow, "type", n === "Study" ? "Study" : "Activity"); if (n !== "Study") setTT(d.actaddrow, "act", n); closeModal(); return MP.render(); }
    if (d.actadd !== undefined) { const n = field("newact").slice(0, 30); if (!n) return; const A = ensureActs(); if (A.some((a) => a.name.toLowerCase() === n.toLowerCase())) { MP.toast("That activity type already exists"); return; } A.push({ name: n }); touchP(); MP.render(); MP.toast("Added " + n); return; }
    if (d.actdel !== undefined) { const A = ensureActs(), a = A[+d.actdel]; if (!a || a.name === "Study") return; A.splice(+d.actdel, 1); ["timetable", "weekend"].forEach((kk) => { if (Array.isArray(P()[kk])) P()[kk].forEach((r) => { if (r.type === "Activity" && r.act === a.name) r.act = "Other"; }); }); touchP(); MP.render(); MP.toast(a.name + " removed; its rows are now Other"); return; }
    if (d.focus) { const k = iso(today()); dayRec(k).focus = +d.focus; touchDay(k); return MP.render(); }
    if (d.phone) { const k = iso(today()); dayRec(k).phone = d.phone; touchDay(k); return MP.render(); }
    if (d.addev !== undefined) { const v = field("evt"); if (v) { putRec("events", uid(), { d: field("evd") || iso(today()), time: field("evtm"), t: v.slice(0, 120) }); MP.render(); } return; }
    if (d.dayadd) { const v = field("ddt"); if (v) { putRec("events", uid(), { d: d.dayadd, time: field("ddtm"), t: v.slice(0, 120) }); closeModal(); MP.render(); MP.toast("Event added"); } return; }
    if (d.evdel) { delRec("events", d.evdel); return MP.render(); }
    if (d.tdel) { const sk = MP.S.sent["task-" + d.tdel]; delRec("tasks", d.tdel); closeModal(); MP.render(); MP.toast("Task deleted"); if (sk && !sk.del) calRemove("task-" + d.tdel); return; }
    if (d.fav) { const f = P().fav, i = f.indexOf(d.fav); i >= 0 ? f.splice(i, 1) : f.push(d.fav); touchP(); return MP.render(); }
    if (d.addmine !== undefined) { const v = field("mine"); if (v) { P().mine.push(v.slice(0, 240)); touchP(); MP.render(); } return; }
    if (d.mdel !== undefined) { P().mine.splice(+d.mdel, 1); touchP(); return MP.render(); }
    if (d.plen) { P().practice.len = +d.plen; touchP(); return MP.render(); }
    if (d.mood) { const [s, w] = d.mood.split(":"), k = iso(today()), r = dayRec(k); r.mood = r.mood || {}; r.mood[s] = Object.assign({ s: 3 }, r.mood[s], { w }); touchDay(k); MP.render(); if (w === "anxious" || w === "low") MP.toast("Today's affirmation has switched to a calming one."); return; }
    if (d.moodq) { const k = iso(today()), r = dayRec(k), slot = new Date().getHours() < 15 ? "am" : "pm"; r.mood = r.mood || {}; r.mood[slot] = Object.assign({ s: 3 }, r.mood[slot], { w: d.moodq }); touchDay(k); MP.render(); if (d.moodq === "anxious" || d.moodq === "low") MP.toast("Today's affirmation has switched to a calming one."); return; }
    if (d.ms) { const [s, n] = d.ms.split(":"), k = iso(today()), r = dayRec(k); r.mood = r.mood || {}; r.mood[s] = Object.assign({ w: "calm" }, r.mood[s], { s: +n }); touchDay(k); return MP.render(); }
    if (d.water) { const k = iso(today()), r = dayRec(k); r.water = r.water === +d.water ? +d.water - 1 : +d.water; touchDay(k); return MP.render(); }
    if (d.energy) { const k = iso(today()); dayRec(k).energy = +d.energy; touchDay(k); return MP.render(); }
    if (d.adddate !== undefined) { const n = field("dn"), dv = field("dd"); if (n && dv) { const did = uid(); putRec("dates", did, { n: n.slice(0, 60), rel: field("dr").slice(0, 40), type: field("dty") || "Birthday", md: dv.slice(5) }); MP.render(); autoDate(did); } else MP.toast("Add a name and a date"); return; }
    if (d.ddel) { const key = "date-" + d.ddel, s2 = MP.S.sent[key]; if (s2 && !s2.del) { if (mode === "google") G.calDelete(s2.id).catch(() => {}); MP.S.sent[key] = { del: 1, u: Date.now() }; } delRec("dates", d.ddel); return MP.render(); }
    if (d.dallcal !== undefined) { const todo = live("dates").filter(([id]) => !(MP.S.sent["date-" + id] && !MP.S.sent["date-" + id].del)); (async () => { for (const [id, x] of todo) await sendKey("date-" + id, { kind: "date", x }, true); MP.toast(todo.length + " added to Google Calendar, repeating every year"); })(); return; }
    if (d.themePick) { P().theme = d.themePick; touchP(); return MP.render(); }
    if (d.wtheme) { wiz.name = field("wname") || wiz.name; wiz.theme = d.wtheme; document.body.dataset.theme = d.wtheme; return MP.render(); }
    if (d.whab) { const i = wiz.habits.indexOf(d.whab); i >= 0 ? wiz.habits.splice(i, 1) : wiz.habits.push(d.whab); return MP.render(); }
    if (d.wnext !== undefined) { if (wiz.step === 1) { wiz.name = field("wname"); if (!wiz.name) { MP.toast("Please add a name"); return; } } if (wiz.step < 4) { wiz.step++; return MP.render(); } return finishSetup(); }
    if (d.wback !== undefined) { wiz.step = Math.max(1, wiz.step - 1); return MP.render(); }
    if (d.print !== undefined) { window.print(); return; }
    if (d.day) { view.dayK = d.day; view.dv = view.dv || "day"; view.dscr = ""; return go("day"); }
    if (d.hgo) { closeModal(); view.hist = d.hgo; return go("history"); }
    if (d.hsearch !== undefined) { view.q = field("hq"); return MP.render(); }
    if (d.backup !== undefined) { download(`my-planner-backup-${iso(today())}.json`, JSON.stringify(MP.S), "application/json"); return MP.toast("Backup downloaded. Keep it somewhere private."); }
    if (d.csv !== undefined) { download(`my-planner-log-${iso(today())}.csv`, csvLog(), "text/csv"); return; }
  });

  document.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    if (d.done) return markDone(d.done, t.checked);
    if (d.hfreq) { const h = P().habits.find((x) => x.id === d.hfreq); if (h) { const k2 = t.value; h.freq = k2 === "daily" ? undefined : k2 === "days" ? { k: "days", days: [1, 2, 3, 4, 5] } : k2 === "week" ? { k: "week", n: 3 } : { k: "count", n: 8, unit: "" }; if (!h.freq) delete h.freq; touchP(); } return MP.render(); }
    if (d.hday) { const [hid, x] = d.hday.split("|"), h = P().habits.find((y) => y.id === hid); if (h && h.freq) { const set = new Set(h.freq.days || []); t.checked ? set.add(+x) : set.delete(+x); h.freq.days = [...set].sort(); touchP(); } return; }
    if (d.sub) { const [tid, sid] = d.sub.split("|"), x = MP.S.tasks[tid]; if (!x) return; const st = (x.sub || []).find((y) => y.id === sid); if (st) st.done = t.checked; x.u = Date.now(); if (x.sub.every((y) => y.done) && !x.done) { MP.toast("All steps done, task ticked"); return markDone(tid, true); } MP.changed(); return MP.render(); }
    if (d.tfp !== undefined) return tfRefresh();
    if (d.menus) { const m = P().menu || (P().menu = { hide: {} }); m.hide = m.hide || {}; if (t.checked) delete m.hide[d.menus]; else m.hide[d.menus] = true; m.preset = "custom"; m.chosen = true; touchP(); MP.render(); return; }
    if (d.blk) { blockDone(iso(today()), d.blk, t.checked); MP.render(); }
    if (d.tbrk !== undefined) { TMR().breaks = t.checked; touchP(); return; }
    if (d.rtop) { const k = iso(today()), r = dayRec(k), cur = (r.top3 || []).filter((x) => x !== d.rtop); if (t.checked) { if (cur.length >= 3) { t.checked = false; MP.toast("Three is the limit. Untick one first."); return; } cur.push(d.rtop); } r.top3 = cur; touchDay(k); return; }
    if (d.ritplan !== undefined) { ritSet({ plan: t.checked }); return; }
    if (d.ritshut !== undefined) { ritSet({ shut: t.checked }); shutCal(t.checked && RIT().cal); return; }
    if (d.ritat !== undefined) { ritSet({ at: t.value || "21:30" }); if (RIT().cal) shutCal(true); return; }
    if (d.ritcal !== undefined) { ritSet({ cal: t.checked }); shutCal(t.checked); return; }
    if (d.gcon !== undefined) { P().gcal = Object.assign({}, P().gcal || {}, { on: t.checked }); touchP(); if (!t.checked) { GC.items = []; MP.idbSet(gcKey(), { items: [] }); } else gcalRefresh(true); return MP.render(); }
    if (d.tzhome !== undefined) { P().tz = t.value; touchP(); GC.at = 0; gcalRefresh(true); MP.toast("Home time zone: " + zoneName(t.value)); return MP.render(); }
    if (d.tz2 !== undefined) { P().tz2 = t.value; touchP(); return; }
    if (d.mlink) { const u = t.value.trim(); if (u && !safeLink(u)) { MP.toast("Links must start with https://"); return; } P().mlinks = Object.assign({}, P().mlinks || {}, { [d.mlink]: u }); touchP(); return; }
    if (d.tkeep !== undefined) { TMR().keep = t.checked; touchP(); return; }
    if (d.tcal !== undefined) { TMR().cal = t.checked; touchP(); return; }
    if (d.tevery !== undefined) { TMR().every = Math.max(10, Math.min(120, +t.value || 50)); touchP(); return; }
    if (d.tblen !== undefined) { TMR().blen = Math.max(2, Math.min(60, +t.value || 10)); touchP(); return; }
    if (d.acthab !== undefined) { const a = ensureActs()[+d.acthab]; if (a) { a.hab = t.value; touchP(); } return; }
    if (d.actname !== undefined) { const A = ensureActs(), a = A[+d.actname], nn = t.value.trim().slice(0, 30); if (!a || !nn || a.name === "Study") return MP.render(); const old = a.name; a.name = nn; ["timetable", "weekend"].forEach((kk) => { if (Array.isArray(P()[kk])) P()[kk].forEach((r) => { if (r.type === "Activity" && r.act === old) r.act = nn; }); }); touchP(); return MP.render(); }
    if (d.ttact) { if (t.value === "__new") { MP.render(); modal(`<h2>New activity type</h2><input class="f" id="newact" maxlength="30" placeholder="e.g. Music practice"><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-actaddrow="${E(d.ttact)}">Add</button></div>`); return; } if (t.value === "Study") { setTT(d.ttact, "type", "Study"); } else { setTT(d.ttact, "type", "Activity"); setTT(d.ttact, "act", t.value); } return MP.render(); }
    if (d.col) { P().collections[d.col] = t.checked; touchP(); MP.render(); }
    if (d.sit) { const k = iso(today()), r = dayRec(k); r.sits = r.sits || {}; r.sits[d.sit] = t.checked; touchDay(k); if (r.sits.m && r.sits.a && r.sits.n) MP.toast("Day complete · dot added"); MP.render(); }
    if (d.hist !== undefined) { view.hist = t.value; MP.render(); }
    if (d.alert) { P().alerts = +t.value; touchP(); }
    if (d.autodates !== undefined) { P().autoDates = t.checked; touchP(); }
    if (d.jtpl !== undefined) { view.jt = t.value; view.jshuf = 0; P().journalTpl = t.value; touchP(); MP.render(); }
    if (d.jdate !== undefined) { view.jd = t.value; MP.render(); }
    if (d.buddy !== undefined) { if (t.checked) { modal(`<h2>Connect Buddy OS?</h2><p class="small">My Planner will write a feed file (<b>buddy-feed.json</b>) in your private My Planner folder with only the categories you tick. Buddy OS, signed in with your Google account, can read it. Buddy can leave items in <b>buddy-inbox.json</b>: what you tell Buddy yourself is added straight away (you can turn this off), and Buddy's own ideas wait on Today for your approval. Mood and journal are off unless you turn them on.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-buddyyes>Connect</button></div>`); t.checked = false; } else { P().links.buddy.on = false; touchP(); MP.render(); MP.toast("Buddy OS disconnected; its feed file will be removed."); } }
    if (d.bcat) { P().links.buddy.cats[d.bcat] = t.checked; touchP(); }
    if (d.binbox !== undefined) { P().links.buddy.inbox = t.checked; touchP(); }
    if (d.bauto !== undefined) { P().links.buddy.auto = t.checked; touchP(); if (t.checked) MP.autoAddFromBuddy(); }
    if (d.bring !== undefined) { P().links.buddy.ring = t.checked; touchP(); }
    if (d.sndauto !== undefined) { SND().auto = t.checked; touchP(); }
    if (d.sndbreak !== undefined) { SND().breakStop = t.checked; touchP(); }
    if (d.snddef !== undefined) { SND().type = t.value; touchP(); }
    if (d.fbshare !== undefined) { if (t.checked) { t.checked = false; modal(`<h2>Share your suggestions?</h2><p class="small">My Planner will keep your suggestions (only the suggestions, never your planner entries) in a Google Doc in your Drive, shared view-only with <b>${E(fbTo())}</b>. It updates each time you add one. Turn it off any time and the doc is deleted.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-fbyes>Yes, share</button></div>`); } else { const fs = P().fbShare; fs.on = false; if (fs.docId && mode === "google") G.deleteFile(fs.docId).catch(() => {}); fs.docId = ""; touchP(); MP.render(); MP.toast("Stopped sharing; the suggestions doc was deleted."); } }
    if (d.skind !== undefined) return schedKind(t.id);
    if (d.tviewsel !== undefined) { P().todayView = t.value; touchP(); MP.render(); }
    if (d.printsel !== undefined) { P().printView = t.value; touchP(); MP.render(); }
    if (d.ttf === "type") { const row = [...P().timetable, ...(Array.isArray(P().weekend) ? P().weekend : [])].find((x) => x.id === d.id); if (t.value === "Activity") { if (!row || !isAct(row)) setTT(d.id, "type", "Study"); } else setTT(d.id, "type", t.value); MP.render(); }
    if (d.ttf === "start" || d.ttf === "end") { setTT(d.id, d.ttf, t.value); if (t.dataset.tpset) { delete t.dataset.tpset; MP.render(); } else if (!t.dataset.tpwait) { t.dataset.tpwait = "1"; t.addEventListener("focusout", () => setTimeout(() => { if (!document.activeElement || !document.activeElement.matches("input[data-ttf]")) MP.render(); }, 0), { once: true }); } }
    if (d.wrt) { wiz.routine = d.wrt === "1"; MP.render(); }
    if (d.wcol) wiz.cols[d.wcol] = t.checked;
    if (d.restore !== undefined && t.files && t.files[0]) {
      const f = t.files[0]; if (f.size > 20e6) { MP.toast("That file is too large to be a My Planner backup."); return; }
      f.text().then((txt) => { let o; try { o = JSON.parse(txt); } catch (er) { MP.toast("That isn't a valid backup file."); return; } if (!o || o.v !== 1) { MP.toast("That isn't a My Planner backup."); return; } MP.S = MP.merge(MP.S, o); MP.changed(); MP.render(); MP.toast("Backup restored and merged."); });
    }
    if (d.shareon !== undefined) {
      const sh = P().share;
      if (t.checked) { if (!sh.emails.length) { t.checked = false; MP.toast("Add at least one parent email first."); return; } modal(`<h2>Share a progress summary?</h2><p class="small">A view-only Google Doc with your weekly habit %, study hours, days studied and winning streak will be shared with: <b>${E(sh.emails.join(", "))}</b>. Nothing else is shared. You can stop sharing any time.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-shareyes>Yes, share it</button></div>`); t.checked = false; }
      else { stopShare(); }
    }
  });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-buddyyes]")) { P().links.buddy.on = true; touchP(); closeModal(); MP.render(); MP.toast("Buddy OS connected"); } });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-shareyes]")) { const sh = P().share; sh.on = true; sh.last = ""; sh.docId = ""; touchP(); closeModal(); MP.render(); syncNow().then(() => MP.toast("Summary shared.")); } });
  async function stopShare() { const sh = P().share; sh.on = false; if (sh.docId && mode === "google") { try { await G.deleteFile(sh.docId); } catch (e) {} } sh.docId = ""; sh.last = ""; touchP(); MP.render(); MP.toast("Sharing stopped and the summary doc was deleted."); }

  function setTT(id, f, v) { ["timetable", "weekend"].forEach((k) => { if (Array.isArray(P()[k])) P()[k].forEach((r) => { if (r.id === id) r[f] = f === "text" ? v.slice(0, 120) : v; }); }); touchP(); }
  document.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    if (d.qin !== undefined) return quickPreview();
    if (t.id === "sguests" || t.id === "stime" || t.id === "sdate") { if (document.getElementById("skind")) schedKind(t.id); }
    if (d.tq !== undefined) { const q = t.value.trim().toLowerCase(); document.querySelectorAll("[data-ctrow]").forEach((r) => (r.hidden = !!q && !r.dataset.ctrow.includes(q))); if (q) document.querySelectorAll(".ctab").forEach((x) => x.closest("details").open = true); return; }
    if (d.ttf === "text") setTT(d.id, "text", t.value);
    if (d.name !== undefined) { P().name = t.value.slice(0, 40); touchP(); }
    if (d.sndvol !== undefined) { SND().vol = +t.value / 100; MP.sound && MP.sound.volume(SND().vol); touchP(); }
    if (d.playlist !== undefined) { SND().playlist = t.value.trim().slice(0, 300); touchP(); }
    if (d.wkf) { const w = MP.S.weeks[d.wk] || (MP.S.weeks[d.wk] = {}); w[d.wkf] = t.value.slice(0, 500); w.u = Date.now(); MP.changed(); }
    if (d.dayf) { const k = iso(today()); dayRec(k)[d.dayf] = t.value.slice(0, 240); touchDay(k); }
    if (d.sleep !== undefined) { const k = iso(today()); const v = parseFloat(t.value); dayRec(k).sleep = isNaN(v) ? undefined : Math.max(0, Math.min(16, v)); touchDay(k); }
    if (d.hname) { const h = P().habits.find((x) => x.id === d.hname); if (h) { h.name = t.value.slice(0, 60); touchP(); } }
    if (d.hn) { const h = P().habits.find((y) => y.id === d.hn); if (h && h.freq) { h.freq.n = Math.max(1, Math.min(h.freq.k === "week" ? 7 : 99, parseInt(t.value, 10) || 1)); touchP(); } return; }
    if (d.hunit) { const h = P().habits.find((y) => y.id === d.hunit); if (h && h.freq) { h.freq.unit = t.value.slice(0, 20); touchP(); } return; }
    if (d.hdef) { const h = P().habits.find((x) => x.id === d.hdef); if (h) { h.def = t.value.slice(0, 80); touchP(); } }
    if (d.prf) { P().practice[d.prf] = d.prf === "text" ? t.value.slice(0, 240) : t.value; touchP(); }
    if (d.shareemails !== undefined) { P().share.emails = t.value.split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)).slice(0, 5); touchP(); }
    if (t.id === "wname") wiz.name = t.value;
    if (t.id === "helpq") { clearTimeout(window._hq); window._hq = setTimeout(() => { view.hq = t.value; MP.render(); const f = document.getElementById("helpq"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 300); }
  });
  document.addEventListener("click", (e) => { if (e.target.closest(".ytl")) stopSound(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); document.getElementById("sheet").classList.remove("on"); } if (e.key === "Enter" && e.target.id === "pinin") tryPin(); if (e.key === "Enter" && e.target.id === "qadd") quickSave(false); if (e.key === "Enter" && e.target.id === "hq") { view.q = e.target.value; MP.render(); } if (e.key === "Enter" && e.target.id === "helpq") { view.hq = e.target.value; MP.render(); const f = document.getElementById("helpq"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } } });
  document.getElementById("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") e.currentTarget.classList.remove("on"); });
  document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

  function notify(title, body) { MP.toast(title + " · " + body); try { if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body, icon: "icons/icon-192.png" }); } catch (e) {} }

  /* post-its: drag the ⋮⋮ handle (finger, mouse or S Pen) to reorder */
  let drag = null;
  document.addEventListener("pointerdown", (e) => { const h = e.target.closest(".phandle"); if (!h) return; const c = h.closest(".postit"), r = c.getBoundingClientRect(); e.preventDefault(); drag = { id: c.dataset.pid, el: c.cloneNode(true), dx: e.clientX - r.left, dy: e.clientY - r.top }; drag.el.classList.add("drag"); drag.el.style.width = r.width + "px"; drag.el.style.left = r.left + "px"; drag.el.style.top = r.top + "px"; document.body.appendChild(drag.el); c.style.opacity = ".35"; });
  document.addEventListener("pointermove", (e) => { if (!drag) return; drag.el.style.left = e.clientX - drag.dx + "px"; drag.el.style.top = e.clientY - drag.dy + "px"; document.querySelectorAll(".postit").forEach((q) => q.classList.remove("hot")); drag.el.hidden = true; const u = document.elementFromPoint(e.clientX, e.clientY); drag.el.hidden = false; const q = u && u.closest(".postits .postit"); if (q && q.dataset.pid !== drag.id) q.classList.add("hot"); });
  document.addEventListener("pointerup", (e) => { if (!drag) return; drag.el.hidden = true; const u = document.elementFromPoint(e.clientX, e.clientY), q = u && u.closest(".postits .postit"); drag.el.remove();
    if (q && q.dataset.pid !== drag.id) { const ids = [...document.querySelectorAll(".postits .postit")].map((x) => x.dataset.pid).filter((x) => x !== drag.id); ids.splice(ids.indexOf(q.dataset.pid), 0, drag.id); ids.forEach((pid, i) => { const r = MP.S.tasks[pid]; if (r) { r.pinO = i + 1; r.u = Date.now(); } }); MP.changed(); }
    drag = null; MP.render(); });
  document.addEventListener("pointercancel", () => { if (drag) { drag.el.remove(); drag = null; MP.render(); } });

  /* ---------- start-up ---------- */
  MP.VERSION = "1.22";
  if (MP.sound) MP.sound.onchange = () => { miniPlayer(); if (route === "study") MP.render(); };
  /* Public, read-only helpers for future modules and connectors. */
  MP.api = { today, iso, dayPct, studyHours, streak, tasks, feed: () => MP.buildFeed(MP.S), version: MP.VERSION, schemaVersion: MP.SCHEMA_VERSION };
  window.addEventListener("online", () => { refreshStatus(); syncNow(); });
  window.addEventListener("offline", refreshStatus);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { MP.render(); syncNow(); } });
  setInterval(() => { if (mode === "google" && document.visibilityState === "visible") syncNow(); }, 60000);
  setInterval(() => { if (document.visibilityState === "visible" && route === "today" && !document.activeElement.matches("input,textarea,canvas")) MP.render(); }, 60000);
  const openAddLink = () => { if (location.hash === "#add" && mode !== "signin" && P().setupDone) { try { history.replaceState(null, "", "#" + route); } catch (er) {} schedDialog(); } };
  window.addEventListener("hashchange", () => { if (location.hash === "#add") return openAddLink(); const h = location.hash.slice(1); if (V[h] && h !== route && h !== "setup") { route = h; MP.render(); } });

  MP.boot = async () => {
    document.body.dataset.theme = MP.pref.get("theme") || "sage";
    const h = location.hash.slice(1); if (V[h] && h !== "setup") route = h;
    const sub = MP.pref.get("sub");
    if (sub && CFG.clientId) {
      /* Returning on this device: open instantly from the device copy; syncing needs one tap (browsers block automatic sign-in pop-ups). */
      const cached = await MP.idbGet("state:" + sub);
      if (cached) { mode = "google"; G.user = { sub, email: MP.pref.get("hint") || "" }; MP.S = MP.sanitize(cached); G.status = "need"; MP.render(); openAddLink(); return; }
    }
    mode = "signin"; MP.render();
  };
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  MP.boot();
})();
