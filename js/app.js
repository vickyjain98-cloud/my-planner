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

  const SCREENS = [["today", "Today"], ["timetable", "Timetable"], ["habits", "Habits"], ["dash", "Habit Dashboard"], ["study", "Study"], ["planner", "Planner"], ["todo", "To-Do"], ["affirm", "Affirmations"], ["journal", "Journal"], ["three", "3-6-9"], ["mood", "Mood & Wellness"], ["dates", "Special Dates"], ["history", "History & Search"], ["print", "Print"], ["prefs", "Settings"], ["ideas", "Suggestions"], ["help", "Help & Guide"]];
  const THEMES = [["sage", "Sage Botanical"], ["lavender", "Lavender Dream"], ["beige", "Beige Minimal"], ["blush", "Blush Floral"], ["midnight", "Midnight Moon"], ["ocean", "Ocean Calm"]];
  const TYPES = ["Study", "Fixed", "Break", "Rest", "Planning", "Morning", "Free"];
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

  const ttFor = (d) => { const we = d.getDay() === 0 || d.getDay() === 6; const rows = we && Array.isArray(P().weekend) ? P().weekend : P().timetable; return rows.slice().sort((a, b) => (a.start || "").localeCompare(b.start || "")); };
  const studyRows = (d) => ttFor(d).filter((r) => r.type === "Study");
  const rowLen = (r) => { const a = tMin(r.start), b = tMin(r.end); return a == null || b == null ? 0 : (b - a + 1440) % 1440; };
  const studyHours = (d) => { const rec = MP.S.days[iso(d)]; if (!rec || !rec.study) return 0; return studyRows(d).reduce((s, r) => s + (rec.study[r.id] ? rowLen(r) : 0), 0) / 60; };
  const activeHabits = () => P().habits.filter((h) => h.active !== false);
  const dayPct = (d) => { const rec = MP.S.days[iso(d)], hs = activeHabits(); if (!rec || !rec.h || !hs.length) return null; const vals = hs.map((h) => rec.h[h.id]).filter(Boolean); if (!vals.length) return null; return hs.reduce((s, h) => s + (rec.h[h.id] === "d" ? 1 : rec.h[h.id] === "p" ? 0.5 : 0), 0) / hs.length; };
  const streak = () => { let n = 0; const t = today(); for (let i = 0; i < 800; i++) { const p = dayPct(addD(t, -i)); if (i === 0 && (p === null || p < 0.7)) continue; if (p !== null && p >= 0.7) n++; else break; } return n; };
  const bestStreak = () => { const keys = Object.keys(MP.S.days).sort(); let best = 0, cur = 0, prev = null; keys.forEach((k) => { const d = parseISO(k); const p = dayPct(d); const cont = prev && (d - prev) / 864e5 === 1; if (p !== null && p >= 0.7) { cur = cont ? cur + 1 : 1; best = Math.max(best, cur); } else cur = 0; prev = d; }); return best; };
  const moonOf = (d) => D.moons[iso(d)] || "";
  const moonName = (k) => (k === "P" ? "Purnima" : k === "A" ? "Amavasya" : "");
  const portalOf = (d) => D.portals[d.getMonth() + 1 + "-" + d.getDate()] || "";
  const nextMoon = () => { const t = today(); for (let i = 0; i < 40; i++) { const d = addD(t, i); const m = moonOf(d); if (m) return { d, m: moonName(m), i }; } return null; };
  const moodOf = (d) => { const r = MP.S.days[iso(d)]; const m = r && r.mood; return m ? (m.pm || m.am || {}).w || "" : ""; };
  const tasks = () => live("tasks").map(([id, t]) => Object.assign({ id }, t));

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
  const timedEv = (summary, date, start, end, rec) => Object.assign({ summary, start: { dateTime: `${date}T${start}:00`, timeZone: TZ }, end: { dateTime: `${date}T${end}:00`, timeZone: TZ }, reminders: remind(P().alerts || 10), source: { title: "My Planner", url: location.origin + location.pathname } }, rec ? { recurrence: [rec] } : {});
  const allDayEv = (summary, date, rec) => Object.assign({ summary, start: { date }, end: { date: iso(addD(parseISO(date), 1)) }, reminders: remind(900) }, rec ? { recurrence: [rec] } : {});

  /* ---------- screens ---------- */
  const V = {};

  function todoCard() {
    const tv = view.tdv;
    const tabs = `<div class="tabs" role="tablist" aria-label="To-do view">${[["135", "1-3-5"], ["matrix", "Matrix"], ["due", "Due soon"]].map((x) => `<button class="${tv === x[0] ? "on" : ""}" data-tdv="${x[0]}">${x[1]}</button>`).join("")}</div>`;
    const T = tasks();
    const row = (t) => `<label class="row" style="gap:10px;font-size:13.5px"><input type="checkbox" data-done="${E(t.id)}" ${t.done ? "checked" : ""} class="cb"><span style="flex:1">${E(t.t)}</span>${t.b ? `<span class="pill tiny">${t.b === "big" ? "1 BIG" : t.b === "med" ? "3 MED" : "5 SMALL"}</span>` : ""}</label>`;
    let body = "";
    if (tv === "135") { const o = ["big", "med", "small"]; body = T.filter((t) => !t.done && t.b).sort((x, y) => o.indexOf(x.b) - o.indexOf(y.b)).slice(0, 9).map(row).join("") || '<span class="small muted">Pick today\'s 1 big, 3 medium and 5 small tasks on the To-Do page.</span>'; }
    else if (tv === "matrix") { body = `<div class="grid g2" style="gap:8px">${QUADS.map((q) => { const ts = T.filter((t) => !!t.urg === q[2] && !!t.imp === q[3] && !t.done); return `<div class="quad ${q[0]}" style="min-height:96px;padding:10px;gap:6px"><div class="between"><b class="small">${q[1]}</b><span class="tiny muted">${ts.length}</span></div>${ts.slice(0, 3).map((t) => `<label class="row" style="gap:6px;font-size:12px"><input type="checkbox" data-done="${E(t.id)}" class="cb sm"><span style="flex:1">${E(t.t)}</span></label>`).join("")}${ts.length > 3 ? `<span class="tiny muted">+${ts.length - 3} more</span>` : ""}</div>`; }).join("")}</div>`; }
    else { body = T.filter((t) => t.due && !t.done).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6).map((t) => `<div class="between small"><span>${E(t.t)}</span><span class="${t.due < iso(today()) ? "over" : "muted"}">${fmt(parseISO(t.due), { day: "numeric", month: "short" })}</span></div>`).join("") || '<span class="small muted">Nothing due.</span>'; }
    return `<section class="card stack"><div class="between wrap"><span class="lab">Today's to-dos</span>${tabs}</div>${body}<button class="link" data-go="todo" style="align-self:flex-start">Open To-Do →</button></section>`;
  }
  const writeBtns = () => `<span class="row" style="gap:4px"><button class="link" data-write="pen">${ic("penm", 16)} Write</button><span class="muted">·</span><button class="link" data-write="type">${ic("kbd", 16)} Type</button></span>`;

  function daySheet() {
    const t = today(), k = iso(t), rec = dayRec(k), a = dailyAff(t), now = nowMin();
    const sec = { m: "Morning", a: "Afternoon", e: "Evening" }; let last = "";
    const rowsArr = ttFor(t);
    const rows = rowsArr.map((r, i) => {
      let h = ""; const s = secOf(r.start); if (s !== last) { h += `<div class="sechead">${sec[s]}</div>`; last = s; }
      const st = tMin(r.start), en = r.end ? tMin(r.end) : (rowsArr[i + 1] ? tMin(rowsArr[i + 1].start) : 1440);
      const isNow = now >= st && now < (en > st ? en : 1440), past = en > st && en <= now, isS = r.type === "Study";
      h += `<div class="trow ${isNow ? "now" : ""} ${isS ? "study" : ""} ${past && !isNow ? "past" : ""}"><span class="ttime">${fmtT(r.start)}${r.end ? " – " + fmtT(r.end) : ""}</span><span style="flex:1">${E(r.text)}${isNow ? ' <span class="tiny">· now</span>' : ""}</span>${isS ? `<input type="checkbox" class="cb" data-blk="${E(r.id)}" ${rec.study && rec.study[r.id] ? "checked" : ""} aria-label="Block done">` : '<span style="width:20px"></span>'}</div>`;
      return h;
    }).join("") || `<p class="small muted">No timetable yet. <button class="link" data-go="timetable">Set it up →</button></p>`;
    const top = tasks().filter((x) => !x.done && x.b).slice(0, 3);
    const sr = studyRows(t), done = sr.filter((r) => rec.study && rec.study[r.id]).length;
    return `<div class="grid sheetgrid"><section class="card" style="padding:12px 14px"><div class="between"><span class="lab">${E(P().name || "My")}'s day</span><span class="tiny muted">Now · ${fmtT(minToT(now))}</span></div>${rows}<div class="between small" style="margin-top:10px"><span class="muted">Study blocks done</span><b>${done} of ${sr.length}</b></div></section>
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
      ${ttFor(t).map((r) => `<div class="row small jrow ${r.type === "Study" ? "b" : ""}"><span style="width:62px" class="muted">${fmtT(r.start)}</span><span style="flex:1">${E(r.text)}</span></div>`).join("") || '<span class="small muted">No timetable yet.</span>'}</div>
      <div class="stack page"><p class="quote" style="font-size:18px;text-align:center">“${E(a.text)}”</p><span class="lab">Dear diary</span>${MP.padHTML("journal-" + k, 9, 40)}<span class="lab">Grateful for</span>${MP.padHTML("grateful-" + k, 2, 40)}</div></div>`;
  }

  V.today = () => {
    const t = today(), k = iso(t), rec = dayRec(k), a = dailyAff(t), nm = nextMoon(), p = portalOf(t), tv = P().todayView || "overview";
    const sr = studyRows(t), doneB = sr.filter((r) => rec.study && rec.study[r.id]).length, nb = sr.find((r) => !(rec.study && rec.study[r.id]));
    const pr = P().practice, pday = pr.start ? Math.floor((t - parseISO(pr.start)) / 864e5) + 1 : 0;
    const hour = new Date().getHours(), greet = hour < 4 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 22 ? "Good evening" : "Good night";
    const headr = `<div class="between hdr" style="align-items:flex-start"><div><div class="lab">${fmt(t, { weekday: "long", day: "numeric", month: "long" })}</div><h1 class="title">${greet},<br><em>${E(P().name || "friend")}</em></h1></div>
      <div class="stack" style="align-items:flex-end;gap:10px"><div class="row" style="gap:8px"><button class="btn sm" data-sched>${ic("plus", 16)} Add / schedule</button><label class="row small" style="gap:8px"><span class="lab">View</span>${sel("data-tviewsel", [["overview", "Summary"], ["sheet", "Detailed day sheet"], ["clock", "Day clock"], ["journal", "Journal spread"]], tv, 'aria-label="Day view" style="width:auto;font-weight:700"')}</label></div>
      <div class="row">${nm ? `<span class="pill ${nm.m === "Purnima" ? "c-moon" : "c-ama"}">${nm.m === "Purnima" ? "○" : "●"} ${nm.m} ${nm.i === 0 ? "today" : "in " + nm.i + " day" + (nm.i > 1 ? "s" : "")} · ${fmt(nm.d, { weekday: "short", day: "numeric", month: "short" })}</span>` : ""}${p ? `<span class="pill c-portal">✦ ${E(p)}</span>` : ""}${pr.text && pday >= 1 && pday <= pr.len ? `<span class="pill out">3-6-9 · Day ${pday} of ${pr.len}</span>` : ""}</div></div></div>`;
    if (tv === "sheet") return headr + whatsNewCard() + schedCard() + daySheet();
    if (tv === "clock") return headr + dayClock();
    if (tv === "journal") return headr + journalSpread();
    const hs = activeHabits(), pct = dayPct(t) || 0, tm = moodOf(t);
    return headr + whatsNewCard() + `<div class="grid g2">
      <section class="card stack"><div class="between"><span class="lab">Today's affirmation</span>${writeBtns()}</div><p class="quote">“${E(a.text)}”</p><span class="tiny muted">${E(a.src)}</span></section>
      <section class="card hero stack">${sr.length ? (nb ? `<div class="between"><span class="lab inherit">Up next · ${fmtT(nb.start)}</span><span class="tiny" style="opacity:.85">${rowLen(nb)} min</span></div><h2 class="inherit">${E(nb.text)}</h2>` : `<h2 class="inherit">All study blocks done today</h2>`) : `<h2 class="inherit">No study blocks yet</h2><span class="small">Add Study rows in your timetable.</span>`}
      <div class="bar"><i style="width:${sr.length ? (doneB / sr.length) * 100 : 0}%"></i></div><div class="between wrap"><span class="small" style="opacity:.9">${doneB} of ${sr.length} blocks · ${studyHours(t).toFixed(1)} h studied</span><button class="btn inv" data-go="study">Focus timer</button></div></section></div>
      <section class="card stack mt"><div class="between"><span class="lab">Habits today</span><span class="small accb">${hs.filter((h) => (rec.h || {})[h.id] === "d").length} of ${hs.length} · ${Math.round(pct * 100)}%</span></div>
      ${hs.length ? `<div class="row habrow">${hs.map((h) => `<button class="hb" data-h="${E(h.id)}" aria-label="${E(h.name)}: tap to change">${dots((rec.h || {})[h.id] || "e", (rec.h || {})[h.id])}<span>${E(h.name.split(" ")[0])}</span></button>`).join("")}</div><span class="tiny muted">Tap a circle: empty → Done (100%) → Partial (50%) → Missed</span>` : `<span class="small muted">No habits yet. <button class="link" data-go="habits">Add habits →</button></span>`}</section>
      ${schedCard()}${inboxCard()}<div class="grid g2 mt">${todoCard()}
      <section class="card stack"><div class="between"><span class="lab">Mood check-in</span><button class="link" data-go="mood">Open →</button></div>
      <div class="row">${Object.keys(MOODCOL).map((w) => `<button class="moodbtn" data-moodq="${w}" style="${tm === w ? `background:${MOODCOL[w]};color:#1d1d1d` : ""}">${w}</button>`).join("")}</div>
      <div class="between"><div><div class="lab">Winning streak</div><div class="big">${streak()} days</div></div><div class="row" style="gap:6px">${[...Array(7)].map((_, i) => { const d = addD(monday(t), i), q = dayPct(d), on = q !== null && q >= 0.7; return `<span class="wd"><span class="wdot ${on ? "on" : ""}"></span>${"MTWTFSS"[i]}</span>`; }).join("")}</div></div></section></div>`;
  };

  V.timetable = () => {
    const we = view.tt === "we" && Array.isArray(P().weekend), rows = (we ? P().weekend : P().timetable).slice().sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const tabs = `<div class="row"><div class="tabs"><button class="${!we ? "on" : ""}" data-ttv="wd">${Array.isArray(P().weekend) ? "Weekdays" : "Every day"}</button>${Array.isArray(P().weekend) ? `<button class="${we ? "on" : ""}" data-ttv="we">Weekend</button>` : ""}</div>${Array.isArray(P().weekend) ? `<button class="btn ghost sm" data-weoff>Use one timetable</button>` : `<button class="btn ghost sm" data-weon>Different weekend timetable</button>`}</div>`;
    const mins = rows.filter((r) => r.type === "Study").reduce((s, r) => s + rowLen(r), 0);
    return `${head("Your routine", "Timetable", tabs)}<section class="card"><div class="tablewrap"><table class="t"><thead><tr><th>Start</th><th>End</th><th>Activity</th><th>Type</th><th class="noprint"></th></tr></thead><tbody>
      ${rows.map((r) => `<tr class="${r.type === "Study" ? "srow" : ""}"><td><input class="f sm" type="time" value="${E(r.start)}" data-ttf="start" data-id="${E(r.id)}" aria-label="Start"></td><td><input class="f sm" type="time" value="${E(r.end || "")}" data-ttf="end" data-id="${E(r.id)}" aria-label="End"></td><td><input class="f" value="${E(r.text)}" maxlength="120" data-ttf="text" data-id="${E(r.id)}" aria-label="Activity"></td><td>${sel(`data-ttf="type" data-id="${E(r.id)}"`, TYPES, r.type, 'aria-label="Type"')}</td><td class="noprint"><span class="row" style="gap:4px;flex-wrap:nowrap">${r.type === "Study" && r.start && r.end ? calBtn("tt-" + r.id, r.text, { kind: "block", row: r }) : ""}<button class="tool" data-ttdel="${E(r.id)}" aria-label="Delete row">${ic("trash", 16)}</button></span></td></tr>`).join("") || `<tr><td colspan="5" class="small muted">No rows yet.</td></tr>`}
      </tbody></table></div><div class="row mt"><button class="btn" data-ttadd>${ic("plus", 16)} Add a row</button>${!rows.length ? `<button class="btn ghost" data-ttsuggest>Use a suggested routine</button>` : ""}</div>
      <p class="tiny muted">Planned study: ${(mins / 60).toFixed(1)} h across ${rows.filter((r) => r.type === "Study").length} blocks. Rows of type <b>Study</b> are your study blocks. Times save as you type.</p></section>`;
  };

  V.habits = () => {
    const t = today(), days = [...Array(7)].map((_, i) => addD(t, i - 6)), hs = P().habits;
    return `${head("Done 100% · Partial 50% · Missed", "Habits", `<button class="btn ghost" data-go="dash">${ic("dash", 16)} Dashboard</button>`)}
      <section class="card tablewrap"><table class="t"><thead><tr><th>Habit</th>${days.map((d) => `<th class="c">${fmt(d, { weekday: "short" })}<br>${d.getDate()}</th>`).join("")}</tr></thead><tbody>
      ${activeHabits().map((h) => `<tr><td><b>${E(h.name)}</b>${h.def ? `<div class="tiny muted">100% = ${E(h.def)}</div>` : ""}</td>${days.map((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id] || "e"; return `<td class="c"><button class="hb inline" data-hd="${iso(d)}" data-hi="${E(h.id)}" aria-label="${E(h.name)} on ${fmt(d, { weekday: "long" })}">${dots(v + " smd", v)}</button></td>`; }).join("")}</tr>`).join("") || `<tr><td colspan="8" class="small muted">Add your first habit below.</td></tr>`}</tbody></table></section>
      <section class="card stack mt"><span class="lab">Manage habits</span>${hs.map((h) => `<div class="row" style="gap:8px"><input class="f" style="flex:2;min-width:140px" value="${E(h.name)}" maxlength="60" data-hname="${E(h.id)}" aria-label="Habit name"><input class="f" style="flex:2;min-width:140px" value="${E(h.def || "")}" maxlength="80" placeholder="What counts as 100%?" data-hdef="${E(h.id)}" aria-label="What counts as 100%"><button class="btn ghost sm" data-hact="${E(h.id)}">${h.active === false ? "Resume" : "Pause"}</button></div>`).join("")}
      <div class="row"><input class="f" id="newh" placeholder="New habit, e.g. Drink 8 glasses of water" maxlength="60" style="flex:1"><button class="btn" data-hadd>${ic("plus", 16)} Add</button></div>
      <div class="row">${D.suggest.habits.filter((x) => !hs.some((h) => h.name === x)).slice(0, 8).map((x) => `<button class="pill out" data-hsug="${E(x)}">+ ${E(x)}</button>`).join("")}</div><span class="tiny muted">Paused habits keep their history and don't count towards your score.</span></section>`;
  };

  V.dash = () => {
    const w = view.dash === "week", t = today(), span = w ? 7 : 30, days = [...Array(span)].map((_, i) => addD(t, i - span + 1));
    const hs = activeHabits();
    const per = hs.map((h) => { let s = 0, f = 0; days.forEach((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; if (v === "d") { s += 1; f++; } else if (v === "p") { s += 0.5; f++; } }); return { h: h.name, c: s / span, f }; });
    const eff = per.length ? per.reduce((a, b) => a + b.c, 0) / per.length : 0;
    const prevDays = days.map((d) => addD(d, -span)); const prevEff = (() => { if (!hs.length) return 0; let tot = 0; hs.forEach((h) => { prevDays.forEach((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; tot += v === "d" ? 1 : v === "p" ? 0.5 : 0; }); }); return tot / (hs.length * span); })();
    const delta = Math.round((eff - prevEff) * 100);
    const daily = days.map(dayPct), win = daily.filter((x) => x !== null && x >= 0.7).length, full = daily.filter((x) => x === 1).length;
    const wk = iso(monday(t)), wrec = MP.S.weeks[wk] || {};
    const heat = w ? "" : `<section class="card stack mt tablewrap"><span class="lab">Last 30 days · heatmap</span><div class="heat" style="grid-template-columns:130px repeat(30,minmax(14px,1fr))">${hs.map((h) => `<span class="tiny b">${E(h.name)}</span>` + days.map((d) => { const v = ((MP.S.days[iso(d)] || {}).h || {})[h.id]; return `<i class="hc ${v || ""}" title="${iso(d)}"></i>`; }).join("")).join("")}</div><span class="tiny muted">Green = done · gold = partial · rose = missed</span></section>`;
    return `${head(w ? "This week" : "Last 30 days", "Habit Dashboard", `<div class="tabs"><button class="${w ? "on" : ""}" data-dv="week">Week</button><button class="${!w ? "on" : ""}" data-dv="month">Month</button></div>`)}
      <div class="grid g3"><section class="card row" style="gap:16px;flex-wrap:nowrap">${ring(eff, 120, 12, "EFFICIENCY")}<div class="small muted">Everything you did ÷ ${span} days, across all habits (Partial counts 50%).</div></section>
      <section class="card stack"><span class="lab">Winning streak</span><div class="big xl">${streak()} days</div><span class="small muted">Days in a row with 70%+ of habits done · best ${bestStreak()}</span></section>
      <section class="card stack"><span class="lab">${w ? "This week" : "Last 30 days"}</span><div class="between"><span>Winning days</span><b>${win} / ${span}</b></div><div class="between"><span>100% days</span><b>${full}</b></div><div class="between"><span>vs previous ${w ? "week" : "30 days"}</span><b class="accb">${delta >= 0 ? "+" : ""}${delta}%</b></div></section></div>
      <div class="grid g2 mt"><section class="card stack"><span class="lab">Daily completion</span>${w ? bars(daily, days.map((d) => fmt(d, { weekday: "short" }))) : lineChart([daily], days.map((d) => d.getDate()))}</section>
      <section class="card stack"><span class="lab">Consistency by habit</span>${per.map((p) => `<div class="stack" style="gap:4px"><div class="between small"><span>${E(p.h)}</span><b>${Math.round(p.c * 100)}%</b></div><div class="bar"><i style="width:${p.c * 100}%"></i></div></div>`).join("") || '<span class="small muted">No habits yet.</span>'}</section></div>${heat}
      <section class="card stack mt"><span class="lab">This week's reflection · saved to this week only</span><div class="grid g2"><label class="stack small">What worked<textarea class="f" rows="2" maxlength="500" data-wkf="worked" data-wk="${wk}">${E(wrec.worked || "")}</textarea></label><label class="stack small">One thing to change<textarea class="f" rows="2" maxlength="500" data-wkf="change" data-wk="${wk}">${E(wrec.change || "")}</textarea></label></div></section>`;
  };

  let timer = { left: 1500, run: false, h: null, phase: "focus" };
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
    const t = today(), k = iso(t), rec = dayRec(k), sr = studyRows(t);
    const mm = String(Math.floor(timer.left / 60)).padStart(2, "0"), ss = String(timer.left % 60).padStart(2, "0");
    const days = [...Array(7)].map((_, i) => addD(t, i - 6)), hrs = days.map(studyHours), mx = Math.max(4, ...hrs);
    return `${head(`${sr.length} block${sr.length === 1 ? "" : "s"} today · edit them in Timetable`, "Study")}
      <div class="grid g2"><section class="card hero stack center"><span class="lab inherit">${timer.phase === "focus" ? "Focus" : "Break"} · 25 + 5</span><div class="timer" id="timerv">${mm}:${ss}</div><div class="row"><button class="btn inv" data-timer="toggle">${timer.run ? "Pause" : "Start"}</button><button class="btn outline" data-timer="reset">Reset</button></div><span class="small" style="opacity:.85">When a focus round ends, the next block is ticked for you.</span></section>
      <section class="card stack"><span class="lab">Today's blocks</span>${sr.map((r) => `<div class="between wrap"><label class="row" style="gap:10px"><input type="checkbox" class="cb" data-blk="${E(r.id)}" ${rec.study && rec.study[r.id] ? "checked" : ""}><span><b>${fmtT(r.start)} – ${fmtT(r.end)}</b><br><span class="small muted">${E(r.text)} · ${rowLen(r)} min</span></span></label>${calBtn("tt-" + r.id, r.text, { kind: "block", row: r })}</div>`).join("") || `<span class="small muted">No study blocks. <button class="link" data-go="timetable">Add Study rows →</button></span>`}
      <div class="between small"><span>Focus today</span><span class="row" style="gap:4px">${[1, 2, 3, 4, 5].map((n) => `<button class="pill num ${rec.focus === n ? "sel" : ""}" data-focus="${n}">${n}</button>`).join("")}</span></div>
      <div class="between small"><span>Phone away?</span><span class="row" style="gap:4px">${["Yes", "No"].map((x) => `<button class="pill num ${rec.phone === x ? "sel" : ""}" data-phone="${x}">${x}</button>`).join("")}</span></div>
      <label class="stack small">What got in the way?<input class="f" maxlength="200" value="${E(rec.block || "")}" data-dayf="block"></label></section></div>
      ${soundCard()}
      <section class="card stack mt"><span class="lab">Hours studied · last 7 days</span>${bars(hrs.map((h) => h / mx), days.map((d) => fmt(d, { weekday: "short" })), 140, (v) => (v * mx).toFixed(1) + "h")}</section>`;
  };

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
        EV.forEach((x) => { if (occurs(x, iso(d))) ch.push(`<span class="chip c-ev">${x.time ? fmtT(x.time) + " " : ""}${E(x.t)}</span>`); });
        const h = d <= t ? studyHours(d) : 0; if (h) ch.push(`<span class="c-study">${h.toFixed(1)} h study</span>`);
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

  const QUADS = [["q1", "Do now", true, true], ["q2", "Schedule", false, true], ["q3", "Delegate or pass", true, false], ["q4", "Drop", false, false]];
  const learnHTML = () => `<div class="between"><h2 id="mt">How the matrix works</h2><button class="tool" data-close aria-label="Close">✕</button></div><span class="small muted">Ask two questions about each task: is it urgent? Is it important?</span>
    <div class="learn"><span></span><b class="small c">Urgent<br><span class="tiny muted">deadline soon / someone waiting</span></b><b class="small c">Not urgent<br><span class="tiny muted">no pressing deadline</span></b>
    <b class="small">Important<br><span class="tiny muted">moves my goals forward</span></b><div class="quad q1 s"><b>1 · Do now</b><span class="small">Urgent <u>and</u> important.</span><span class="tiny muted">e.g. a form due tomorrow</span></div><div class="quad q2 s"><b>2 · Schedule</b><span class="small">Important <u>but not</u> urgent.</span><span class="tiny muted">Give it a time or a study block.</span></div>
    <b class="small">Not important<br><span class="tiny muted">doesn't serve my goals</span></b><div class="quad q3 s"><b>3 · Delegate or pass</b><span class="small">Urgent <u>but not</u> important.</span><span class="tiny muted">Hand it off, or do it in 5 minutes.</span></div><div class="quad q4 s"><b>4 · Drop</b><span class="small">Not important <u>and</u> not urgent.</span><span class="tiny muted">Let it go, or save it for free time.</span></div></div>
    <span class="tiny muted">Pick today's 1-3-5 mostly from boxes 1 and 2. You can drag any card to another box later.</span><button class="btn" data-close style="align-self:flex-end">Got it</button>`;
  V.todo = () => {
    const T = tasks(), big = T.filter((t) => t.b === "big" && !t.done), med = T.filter((t) => t.b === "med" && !t.done), sm = T.filter((t) => t.b === "small" && !t.done);
    const card = (t) => `<div class="task ${t.done ? "done" : ""}" data-task="${E(t.id)}"><input type="checkbox" class="cb sm" ${t.done ? "checked" : ""} data-done="${E(t.id)}" aria-label="Done"><span style="flex:1"><span class="tt">${E(t.t)}</span>${t.due ? `<br><span class="tiny ${t.due < iso(today()) && !t.done ? "over" : "muted"}">due ${fmt(parseISO(t.due), { day: "numeric", month: "short" })}</span>` : ""}</span>${sel(`data-size135="${E(t.id)}"`, [["", "–"], ["big", "1 big"], ["med", "3 med"], ["small", "5 small"]], t.b || "", 'class="f xs" aria-label="1-3-5 size"').replace('class="f" data-size135', 'class="f xs" data-size135')}<button class="tool" data-tdel="${E(t.id)}" aria-label="Delete task">${ic("trash", 14)}</button></div>`;
    return `${head("Eisenhower matrix + daily 1-3-5", "To-Do", `<div class="tabs"><button class="${view.todo === "matrix" ? "on" : ""}" data-tv="matrix">Matrix</button><button class="${view.todo === "135" ? "on" : ""}" data-tv="135">Today's 1-3-5</button><button class="${view.todo === "list" ? "on" : ""}" data-tv="list">All & reminders</button></div>`)}
      <section class="card stack mb"><span class="lab">New task</span><div class="row"><input class="f" id="nt" maxlength="160" placeholder="What needs doing?" style="flex:1;min-width:180px" aria-label="Task"><input class="f" id="ndue" type="date" style="width:auto" aria-label="Due date"><label class="pill row"><input type="checkbox" id="nu" data-dest> Urgent</label><label class="pill row"><input type="checkbox" id="ni" checked data-dest> Important</label><button class="btn" data-addtask>${ic("plus", 16)} Add</button></div>
      <span class="small accb" id="dest">→ This task will go to: Schedule</span><span class="small muted">Not sure? <b>Urgent</b> = deadline soon or someone is waiting. <b>Important</b> = moves your goals forward. <button class="learnlink" data-learn>Learn how</button></span></section>
      ${view.todo === "matrix" ? `<div class="matrix">${QUADS.map((q) => `<div class="quad ${q[0]}" data-quad="${q[0]}"><h3>${q[1]}</h3>${T.filter((t) => !!t.urg === q[2] && !!t.imp === q[3]).map(card).join("") || '<span class="tiny muted">Drop tasks here</span>'}</div>`).join("")}</div>`
      : view.todo === "135" ? `<div class="grid g3">${[["1 big thing", big, 1], ["3 medium", med, 3], ["5 small", sm, 5]].map((g) => `<section class="card stack"><div class="between"><span class="lab">${g[0]}</span><span class="tiny muted">${g[1].length}/${g[2]}</span></div>${g[1].map(card).join("")}${[...Array(Math.max(0, g[2] - g[1].length))].map(() => `<div class="slot tiny muted">Pick a task in the matrix and set its size</div>`).join("")}</section>`).join("")}</div>`
      : `<section class="card stack">${T.sort((a, b) => (a.done - b.done) || (a.due || "9").localeCompare(b.due || "9")).map((t) => `<div class="between wrap">${card(t)}${t.due && !t.done ? calBtn("task-" + t.id, t.t, { kind: "task", t }) : ""}</div>`).join("") || '<span class="small muted">No tasks yet.</span>'}</section>`}`;
  };

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
      <section class="card stack"><span class="lab">Study</span>${studyRows(d).map((r) => `<div class="between small"><span>${fmtT(r.start)} · ${E(r.text)}</span><b>${rec.study && rec.study[r.id] ? "✓" : "–"}</b></div>`).join("") || '<span class="small muted">No blocks</span>'}${rec.focus ? `<div class="between small"><span>Focus</span><b>${rec.focus}/5</b></div>` : ""}</section>
      <section class="card stack"><span class="lab">Mood</span>${["am", "pm"].map((x) => (m[x] && m[x].w ? `<div class="between small"><span>${x === "am" ? "Morning" : "Evening"}</span><span class="pill" style="background:${MOODCOL[m[x].w]};color:#1d1d1d">${m[x].w}${m[x].s ? " · " + m[x].s : ""}</span></div>` : "")).join("") || '<span class="small muted">No entries</span>'}${rec.sleep ? `<div class="between small"><span>Slept</span><b>${rec.sleep} h</b></div>` : ""}</section></div>
      <section class="card stack mt"><span class="lab">Habits that day</span><div class="row">${P().habits.map((h) => { const v = (rec.h || {})[h.id] || "e"; return `<span class="row small" style="gap:6px">${dots(v + " smd", v)}${E(h.name)}</span>`; }).join("") || '<span class="small muted">No habits</span>'}</div></section>`;
  };

  /* ---------- print ---------- */
  const pHead = (sub) => { const t = today(); return `<div class="between"><div><div class="lab">${sub}</div><div class="phead">${E(P().name || "My")}’s Day</div></div><div style="text-align:right"><div class="lab">${fmt(t, { weekday: "long" })}</div><div style="font-family:var(--disp);font-size:17px">${fmt(t, { day: "numeric", month: "long", year: "numeric" })}</div><div class="tiny" style="color:#5B4B9A;font-weight:700">${E([portalOf(t), moonName(moonOf(t))].filter(Boolean).join(" · "))}</div></div></div>`; };
  const typedOf = (key) => ((MP.S.typed[key] && MP.S.typed[key].l) || []).filter(Boolean);
  const PV = {
    summary: () => { const t = today(), a = dailyAff(t); return `${pHead("Summary")}<div class="pquote">“${E(a.text)}”</div><div class="grid g2"><div class="stack" style="gap:6px"><div class="lab">Study blocks</div>${studyRows(t).map((r) => `<div class="small">○ <b>${fmtT(r.start)}</b> ${E(r.text)}</div>`).join("")}</div><div class="stack" style="gap:6px"><div class="lab">Top 3</div>${tasks().filter((x) => !x.done && x.b).slice(0, 3).map((x) => `<div class="small">○ ${E(x.t)}</div>`).join("")}<div class="lab" style="margin-top:6px">Habits</div><div class="small">${activeHabits().map((h) => "○ " + E(h.name.split(" ")[0])).join("  ")}</div></div></div><div class="tiny muted c cut">✂ half page · two days fit on one A4 sheet</div>`; },
    detailed: () => { const t = today(), a = dailyAff(t); let last = ""; const sec = { m: "Morning", a: "Afternoon", e: "Evening" }; return `${pHead("My daily rhythm")}<div class="pgrid"><div class="stack" style="gap:2px">${ttFor(t).map((r) => { let h = ""; const s = secOf(r.start); if (s !== last) { h = `<div class="psec">${sec[s]}</div>`; last = s; } return h + `<div class="prow ${r.type === "Study" ? "study" : ""}"><span>${fmtT(r.start)}${r.end ? "–" + fmtT(r.end) : ""}</span>${E(r.text)}</div>`; }).join("")}</div><div class="stack" style="gap:8px"><div class="pquote sm">“${E(a.text)}”</div><div class="lab">Top 3 to-dos</div>${tasks().filter((x) => !x.done && x.b).slice(0, 3).map((x) => `<div class="tiny">○ ${E(x.t)}</div>`).join("")}<div class="lab">Wellness</div><div class="tiny">Water ○○○○○○○○</div><div class="tiny">Mood 1 2 3 4 5 · Energy 1 2 3 4 5</div><div class="tiny">Slept ____ hrs</div><div class="lab">Grateful for</div><div class="pline hand">${E(typedOf("grateful-" + iso(t)).join(" "))}</div><div class="lab">Today's win</div><div class="pline hand">${E(typedOf("win-" + iso(t)).join(" "))}</div><div class="tiny" style="color:#5B4B9A;margin-top:auto">pause at 11:11 & 08:08 · breathe</div></div></div>`; },
    hourly: () => { const t = today(); let rows = ""; for (let h = 6; h <= 23; h++) { const ev = ttFor(t).filter((r) => Math.floor(tMin(r.start) / 60) === h); rows += `<div class="hrow"><span class="tiny muted b">${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}</span><div class="hev">${ev.map((r) => `<span class="tiny" style="border-left:3px solid ${TCOL[r.type]};${r.type === "Study" ? "background:var(--soft);font-weight:700" : ""}">${fmtT(r.start)} ${E(r.text)}</span>`).join("")}</div><span class="hnote"></span></div>`; } return `${pHead("Hourly time-blocks")}<div style="flex:1">${rows}</div>`; },
    journal: () => { const t = today(), a = dailyAff(t), typed = typedOf("journal-" + iso(t)), inks = ((MP.S.ink["journal-" + iso(t)] || {}).s || []).length; return `${pHead("Journal spread")}<div class="pgrid eq"><div class="stack" style="gap:3px">${ttFor(t).map((r) => `<div class="tiny jrow ${r.type === "Study" ? "b" : ""}"><span class="muted">${fmtT(r.start)}</span> ${E(r.text)}</div>`).join("")}</div><div class="stack" style="gap:6px"><div class="pquote sm">“${E(a.text)}”</div><div class="lab">Dear diary</div>${typed.map((x) => `<div class="pline hand">${E(x)}</div>`).join("")}${inks ? `<canvas class="printink" data-printink="journal-${iso(t)}" height="300"></canvas>` : ""}${[...Array(Math.max(4, 14 - typed.length - (inks ? 6 : 0)))].map(() => `<div class="pline"></div>`).join("")}</div></div>`; }
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
      <section class="card row mb"><span class="muted">${ic("search", 18)}</span><input class="f" id="helpq" value="${E(view.hq || "")}" placeholder="Search the guide, e.g. sync, S Pen, matrix" style="flex:1" aria-label="Search the guide"></section>
      <section class="card stack mb"><span class="lab">Contents</span><div class="row">${H.map((s, i) => `<button class="pill out" data-hsec="${s.id}">${i + 1}. ${E(s.title)}</button>`).join("")}</div></section>
      <div class="stack" style="gap:14px">${shown.map((s) => `<section class="card stack" id="help-${s.id}"><div class="between wrap"><h2>${H.indexOf(s) + 1}. ${E(s.title)}</h2>${s.route ? `<button class="btn ghost sm" data-go="${s.route}">Open this screen →</button>` : ""}</div>${s.body.map(blockHTML).join("")}</section>`).join("") || '<p class="small muted">Nothing matches. Try another word.</p>'}</div>
      <p class="tiny muted c mt">Still stuck? Ask the person who set up My Planner for your family.</p>`;
  };

  /* ---------- settings ---------- */
  V.prefs = () => {
    const sh = P().share, acc = mode === "google" && G.user ? E(G.user.email) : "Demo mode · this device only";
    return `${head("Make it yours", "Settings")}
      <section class="stack mb"><span class="lab">Theme</span><div class="grid g3">${THEMES.map((t) => `<button class="themecard ${P().theme === t[0] ? "on" : ""}" data-theme-pick="${t[0]}" data-theme="${t[0]}"><div class="tc"><div class="tcn">${t[1]}</div><div class="row" style="gap:6px">${["--acc", "--acc2", "--soft", "--surf"].map((v) => `<i class="swi" style="background:var(${v})"></i>`).join("")}</div><div class="tch">Up next · Study block</div></div></button>`).join("")}</div></section>
      <div class="grid g2"><section class="card stack"><span class="lab">Profile</span><label class="stack small">Name on Today<input class="f" maxlength="40" value="${E(P().name)}" data-name></label><div class="small">Signed in as <b>${acc}</b></div><div class="row"><button class="btn ghost sm" data-signout>Sign out</button></div></section>
      <section class="card stack"><span class="lab">Study blocks</span><div class="between small"><span>Blocks per day (weekdays)</span><span class="row" style="gap:4px"><button class="pill num" data-blk-n="-1" aria-label="One fewer block">−</button><b style="min-width:24px;text-align:center">${P().timetable.filter((r) => r.type === "Study").length}</b><button class="pill num" data-blk-n="1" aria-label="One more block">+</button></span></div>
      ${P().timetable.filter((r) => r.type === "Study").sort((a, b) => a.start.localeCompare(b.start)).map((r) => `<div class="row small" style="gap:8px"><b style="width:70px">${fmtT(r.start)}</b><span style="flex:1">${E(r.text)}</span>${sel(`data-blen="${E(r.id)}"`, [25, 30, 40, 45, 50, 60, 90].map((n) => [n, n + " min"]), rowLen(r), 'style="width:auto" aria-label="Length"')}</div>`).join("")}<span class="tiny muted">Rename or move blocks in Timetable.</span></section>
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
    return { name: P().name || "", from: m, to: addD(m, 6), habits: pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0, hrs, studied, n: days.length, streak: streak() };
  };
  V.family = () => { const s = weekSummary(); return `${head("Exactly what a parent sees", "Family summary preview", `<button class="btn ghost" data-go="prefs">Back</button>`)}
    <div class="grid g3"><section class="card stack center">${ring(s.habits, 120, 12, "HABITS")}<b>${E(s.name)}</b></section><section class="card stack"><span class="lab">Study this week</span><div class="big xl">${s.hrs.toFixed(1)} h</div><span class="small muted">${s.studied} of ${s.n} days</span></section><section class="card stack"><span class="lab">Winning streak</span><div class="big xl">${s.streak} days</div></section></div>
    <p class="small muted mt">${ic("lock", 14)} Not shared: entries, journal, notes, to-dos, affirmations, handwriting, mood and Year in Pixels.</p>`; };
  const summaryHTML = () => { const s = weekSummary(); return `<html><body style="font-family:Arial"><h1>${E(s.name)} · My Planner progress</h1><p>Week of ${fmt(s.from, { day: "numeric", month: "long" })} – ${fmt(s.to, { day: "numeric", month: "long", year: "numeric" })} · updated ${fmt(today(), { day: "numeric", month: "short" })}</p><table border="1" cellpadding="6" style="border-collapse:collapse"><tr><td>Habits completed</td><td><b>${Math.round(s.habits * 100)}%</b></td></tr><tr><td>Study this week</td><td><b>${s.hrs.toFixed(1)} hours</b> on ${s.studied} of ${s.n} days</td></tr><tr><td>Winning streak</td><td><b>${s.streak} days</b></td></tr></table><p style="color:#777">Shared by ${E(s.name)} from My Planner. Entries, notes and mood are private and never included.</p></body></html>`; };

  /* ---------- Buddy OS feed: only the categories the person allows ---------- */
  MP.buildFeed = (S) => {
    const cats = (S.profile.links.buddy || {}).cats || {}, t = today(), past = [...Array(30)].map((_, i) => addD(t, -i)), data = { name: S.profile.name || "" };
    if (cats.habits) data.habits = { list: S.profile.habits.filter((h) => h.active !== false).map((h) => ({ id: h.id, name: h.name })), days: past.map((d) => ({ date: iso(d), pct: dayPct(d), marks: ((S.days[iso(d)] || {}).h) || {} })).filter((x) => x.pct !== null), streak: streak() };
    if (cats.study) {
      data.study = past.map((d) => ({ date: iso(d), hours: +studyHours(d).toFixed(2), focus: (S.days[iso(d)] || {}).focus || null, blocksDone: Object.values((S.days[iso(d)] || {}).study || {}).filter(Boolean).length })).filter((x) => x.hours || x.focus);
      const blk = (rows) => (Array.isArray(rows) ? rows : []).filter((r) => r.type === "Study").map((r) => ({ id: r.id, start: r.start, end: r.end || null, text: r.text }));
      data.studyPlan = { weekday: blk(S.profile.timetable), weekend: Array.isArray(S.profile.weekend) ? blk(S.profile.weekend) : null };
    }
    if (cats.tasks) data.tasks = Object.entries(S.tasks).filter(([, v]) => v && !v.del).map(([id, v]) => ({ id, title: v.t, due: v.due || null, urgent: !!v.urg, important: !!v.imp, size: v.b || null, done: !!v.done }));
    if (cats.events) {
      const evx = ([id, v]) => ({ id, title: v.t, kind: v.kind || "event", date: v.d, time: v.time || null, end: v.end || null, priority: v.pri || null, reminderMin: v.rem === undefined || v.rem === "" ? null : +v.rem, repeat: v.rep ? { rule: v.rep, days: v.repDays || [], ends: v.repEnd || "never", until: v.repUntil || null, count: v.repCount ? +v.repCount : null, text: repText(v) } : null });
      data.events = Object.entries(S.events).filter(([, v]) => v && !v.del && (v.d >= iso(t) || v.rep)).map(evx);
      data.upcoming = [...Array(14)].flatMap((_, i) => { const k = iso(addD(t, i)); return Object.entries(S.events).filter(([, v]) => v && !v.del && occurs(v, k)).map(([id, v]) => ({ id, date: k, time: v.time || null, end: v.end || null, title: v.t, kind: v.kind || "event", priority: v.pri || null })); }); data.specialDates = Object.entries(S.dates).filter(([, v]) => v && !v.del).map(([id, v]) => ({ id, name: v.n, relation: v.rel, type: v.type, monthDay: v.md })); }
    if (cats.mood) data.mood = past.map((d) => { const r = S.days[iso(d)] || {}; return { date: iso(d), am: (r.mood || {}).am || null, pm: (r.mood || {}).pm || null, sleep: r.sleep ?? null }; }).filter((x) => x.am || x.pm || x.sleep);
    if (cats.journal) data.journal = Object.entries(S.typed).filter(([k, v]) => /^(jr-|journal-)/.test(k) && v && v.l && v.l.some(Boolean)).map(([k, v]) => ({ key: k, date: (k.match(/\d{4}-\d{2}-\d{2}/) || [""])[0], text: v.l.filter(Boolean).join("\n") }));
    if ((S.profile.links.buddy || {}).auto !== false) data.autoAddFromBuddy = true;
    data.inboxDecisions = Object.entries(S.inbox).filter(([, v]) => v && v.status !== "pending").map(([id, v]) => ({ id, status: v.status }));
    return { schema: "my-planner-feed", schemaVersion: MP.SCHEMA_VERSION, appVersion: MP.VERSION, timeZone: TZ, generatedAt: new Date().toISOString(), categories: Object.keys(cats).filter((k) => cats[k]), data };
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
    if (it.kind === "task") putRec("tasks", rid, { t: it.title, due: it.date, done: false, b: "", urg: pri === "high" || pri === "urgent", imp: pri !== "low" });
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
    p.seenVersion = MP.VERSION; p.setupDone = true; touchP(); go("today");
  }

  /* ---------- shell ---------- */
  const signinHTML = (msg) => `<div class="signin"><div class="card stack center" style="max-width:440px;padding:28px"><div class="brand big2">My <span>Planner</span></div><p class="small muted">Your private planner. Everything you write is saved in your own Google Drive, and only you can see it.</p>
    ${msg ? `<p class="small over" role="alert">${E(msg)}</p>` : ""}${CFG.clientId ? `<button class="btn gbtn" data-signin><svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg> Sign in with Google</button>` : `<p class="small over">This copy isn't connected to Google yet. Follow the setup guide to add your client ID.</p>`}
    <button class="link" data-demo>Try it without signing in (saved on this device only)</button><p class="tiny muted">${ic("lock", 12)} No ads, no tracking. My Planner only sees the files it creates in your Drive.</p><p class="tiny muted"><a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a> · <a href="terms.html" target="_blank" rel="noopener">Terms of use</a></p></div></div>`;

  function shell() {
    const inApp = mode !== "signin" && P().setupDone;
    document.getElementById("side").innerHTML = inApp ? `<div class="brand">My <span>Planner</span></div>${statusPill()}<button class="navbtn navadd" data-sched>${ic("plus")}Add / schedule</button>` + SCREENS.map((s) => `<button class="navbtn ${route === s[0] ? "on" : ""}" data-go="${s[0]}">${ic(s[0])}${s[1]}</button>`).join("") : "";
    const quick = [["today", "Today"], ["planner", "Planner"], ["habits", "Habits"], ["todo", "To-Do"], ["more", "More"]];
    document.getElementById("bottom").innerHTML = inApp ? quick.map((q) => `<button class="${route === q[0] || (q[0] === "more" && !quick.some((x) => x[0] === route)) ? "on" : ""}" data-go="${q[0]}">${ic(q[0], 22)}${q[1]}</button>`).join("") : "";
    document.getElementById("sheetin").innerHTML = `<button class="navbtn navadd" data-sched>${ic("plus", 22)}Add / schedule</button>` + SCREENS.map((s) => `<button class="navbtn ${route === s[0] ? "on" : ""}" data-go="${s[0]}">${ic(s[0], 22)}${s[1]}</button>`).join("");
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
  MP.render = () => {
    document.body.dataset.theme = P().theme || MP.pref.get("theme") || "sage";
    MP.pref.set("theme", document.body.dataset.theme);
    shell();
    const main = document.getElementById("main");
    if (mode === "signin") { main.innerHTML = signinHTML(MP._msg); return; }
    if (!P().setupDone) { main.innerHTML = V.setup(); return; }
    const top = mode === "google" ? `<div class="mobstatus">${statusPill()}</div>` : `<div class="mobstatus">${statusPill()}</div>`;
    main.innerHTML = top + (V[route] || V.today)();
    MP.setupPads();
    document.querySelectorAll("[data-printink]").forEach(drawPrintInk);
    miniPlayer();
  };
  function drawPrintInk(cv) {
    const strokes = ((MP.S.ink[cv.dataset.printink] || {}).s || []), w = cv.clientWidth || 300, ctx = cv.getContext("2d");
    cv.width = w; const maxY = Math.max(40, ...strokes.flatMap((s) => s.p.map((q) => q[1]))); const sc = Math.min(1, 300 / maxY); cv.height = maxY * sc + 10;
    strokes.forEach((s) => { ctx.strokeStyle = s.c; ctx.lineWidth = Math.max(1, s.z * sc); ctx.lineCap = "round"; ctx.beginPath(); s.p.forEach((q, i) => (i ? ctx.lineTo(q[0] * w, q[1] * sc) : ctx.moveTo(q[0] * w, q[1] * sc))); ctx.stroke(); });
  }
  function go(r) {
    if (r === "more") { document.getElementById("sheet").classList.add("on"); return; }
    document.getElementById("sheet").classList.remove("on");
    route = r; try { history.replaceState(null, "", "#" + r); } catch (e) {}
    MP.render(); window.scrollTo(0, 0);
  }
  MP.go = go;

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
    const hs = P().habits, rows = [["date", "habits_pct", ...hs.map((h) => h.name), "study_hours", "focus", "mood_am", "mood_pm", "sleep", "water", "energy"]];
    Object.keys(MP.S.days).sort().forEach((k) => { const r = MP.S.days[k], d = parseISO(k), p = dayPct(d); rows.push([k, p == null ? "" : Math.round(p * 100), ...hs.map((h) => ({ d: "Done", p: "Partial", m: "Missed" }[(r.h || {})[h.id]] || "")), studyHours(d).toFixed(1), r.focus || "", ((r.mood || {}).am || {}).w || "", ((r.mood || {}).pm || {}).w || "", r.sleep ?? "", r.water ?? "", r.energy ?? ""]); });
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
      if (s.kind === "block") ev = timedEv("Study · " + s.row.text, iso(today()), s.row.start, s.row.end, choice === "daily" ? "RRULE:FREQ=DAILY" : null);
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
      ${studyHours(d) ? `<div class="small accb">${studyHours(d).toFixed(1)} h studied</div>` : ""}
      <div class="row"><input class="f" type="time" id="ddtm" style="width:auto" aria-label="Time"><input class="f" id="ddt" maxlength="120" placeholder="Add an event on this day" style="flex:1"><button class="btn sm" data-dayadd="${k}">Add</button></div>
      <div class="between wrap"><button class="link" data-hgo="${k}">Open this day in History →</button><button class="btn sm" data-sched="${k}">${ic("plus", 16)} Add / schedule</button></div>`);
  }

  /* ---------- Add / schedule (one form for reminders, tasks, habits, study, events, dates) ---------- */
  const SKINDS = [["reminder", "⏰ Reminder"], ["task", "✓ New task (To-Do)"], ["habit", "◎ Habit"], ["study", "📖 Study session"], ["event", "📅 Event / appointment"], ["wellbeing", "❀ Journal · affirmation · mood"], ["date", "✿ Birthday / anniversary"]];
  const SLABEL = { reminder: "Reminder", task: "Task", habit: "Habit", study: "Study", event: "Event", wellbeing: "Wellbeing", date: "Special date" };
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
    if (!e || !e.d || k < e.d) return false; if (e.d === k) return true;
    if (!e.rep || !repMatch(e, k)) return false;
    if (e.repEnd === "until" && e.repUntil && k > e.repUntil) return false;
    if (e.repEnd === "count" && +e.repCount > 0) { let c = 0; for (let dt = parseISO(e.d), i = 0; i < 4000; i++, dt = addD(dt, 1)) { const dk = iso(dt); if (dk === e.d || repMatch(e, dk)) c++; if (dk === k) return c <= +e.repCount; } return false; }
    return true;
  };
  const evOn = (k) => live("events").filter(([, e]) => occurs(e, k)).map(([id, e]) => Object.assign({ id }, e)).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
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
    return ev;
  }
  function schedDialog(id, preset) {
    const e = id ? Object.assign({}, MP.S.events[id]) : Object.assign({ kind: "reminder", d: iso(today()), time: "", end: "", pri: "med", rem: "10", rep: "" }, preset || {});
    const signed = mode === "google", inCal = id && MP.S.sent["ev-" + id] && !MP.S.sent["ev-" + id].del;
    const habOpts = [["", "— choose a habit —"], ...P().habits.filter((h) => h.active !== false).map((h) => [h.id, h.name]), ["__new", "+ New habit (uses the title)"]];
    modal(`<div class="between"><h2>${id ? "Edit" : "Add / schedule"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">What is it?${sel('id="skind" data-skind', SKINDS, e.kind)}</label>
      <label class="stack small"><span id="stlab">${e.kind === "date" ? "Name" : "Title"}</span><input class="f" id="stitle" maxlength="120" value="${E(e.t || "")}" placeholder="e.g. Call Dr. Mehta · Revise Unit 3 · Drink water"></label>
      <div class="sk-habit stack small" ${e.kind === "habit" ? "" : "hidden"}><label class="stack small">Which habit?${sel('id="shab"', habOpts, e.hab || "")}</label></div>
      <div class="sk-date grid g2" ${e.kind === "date" ? "" : "hidden"}><label class="stack small">Type${sel('id="sdtype"', ["Birthday", "Anniversary"], "Birthday")}</label><label class="stack small">Relation<input class="f" id="srel" maxlength="40" placeholder="e.g. Cousin"></label></div>
      <div class="grid g3"><label class="stack small">Date<input class="f" type="date" id="sdate" data-skind value="${E(e.d)}"></label><label class="stack small sk-time">Start time<input class="f" type="time" id="stime" value="${E(e.time || "")}"></label><label class="stack small sk-time">End time (optional)<input class="f" type="time" id="send" value="${E(e.end || "")}"></label></div>
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
    q(".sk-habit").forEach((x) => (x.hidden = k !== "habit")); q(".sk-date").forEach((x) => (x.hidden = k !== "date"));
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
    const toCal = (document.getElementById("scal") || {}).checked;
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
    if (rec.rep && rec.repEnd === "until" && (!rec.repUntil || rec.repUntil < d)) { MP.toast("Pick an end date after the start date"); return; }
    if (rec.rep && !repMatch(rec, rec.d)) { for (let i = 1; i < 400; i++) { const dk = iso(addD(parseISO(rec.d), i)); if (repMatch(rec, dk)) { rec.d = dk; break; } } } /* start on the first day that fits */
    if (kind === "habit") { let hid = field("shab"); if (hid === "__new" || (!hid && title)) { hid = uid(); P().habits.push({ id: hid, name: title.slice(0, 60), def: "", active: true }); touchP(); } rec.hab = hid; }
    if (kind === "task") {
      const tid = old.tid && MP.S.tasks[old.tid] && !MP.S.tasks[old.tid].del ? old.tid : uid(), prev = MP.S.tasks[tid] || {};
      putRec("tasks", tid, Object.assign({ b: "", done: false }, prev, { t: title.slice(0, 160), due: d, urg: pri === "urgent" || pri === "high", imp: pri !== "low" }));
      rec.tid = tid;
    }
    putRec("events", eid, rec); closeModal(); MP.render();
    MP.toast(id ? "Saved" : kind === "task" ? "Added to Today and your To-Do list" : "Added to your schedule");
    if (rem !== "" && time && "Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch (er) {} }
    const key = "ev-" + eid, sent = MP.S.sent[key], wasIn = sent && !sent.del;
    if (mode !== "google") return;
    try {
      if (wasIn && (!toCal || id)) { try { await G.calDelete(sent.id); } catch (er) {} MP.S.sent[key] = { del: 1, u: Date.now() }; MP.changed(); }
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
      const cid = await G.calInsert(ev); MP.S.sent[key] = { id: cid, u: Date.now() }; MP.changed(); MP.render();
      MP.toast(quiet ? "Saved and added to Google Calendar" : "Added to your Google Calendar");
    } catch (er) { MP.toast(er.reauth ? "Saved. Tap sync to reconnect, then use Send to Calendar." : "Saved, but Calendar said: " + er.message); }
  }
  /* birthdays & anniversaries go to Google Calendar as yearly events automatically (Settings can turn this off) */
  const autoDate = (did) => { if (mode === "google" && P().autoDates !== false && MP.S.dates[did]) sendKey("date-" + did, { kind: "date", x: MP.S.dates[did] }, true); };
  /* Today card: what's scheduled today, and the next few days */
  const schedRow = (e, showDate) => `<div class="between wrap sched ${PRICLS[e.pri] || ""}"><button class="link left" data-sedit="${E(e.id)}" style="text-align:left"><b>${showDate ? fmt(parseISO(e.d), { weekday: "short", day: "numeric" }) + " · " : ""}${e.time ? fmtT(e.time) + (e.end ? "–" + fmtT(e.end) : "") : "All day"}</b> · ${E(e.t)}</button><span class="row" style="gap:6px"><span class="pill tiny">${E(SLABEL[e.kind] || "Event")}</span>${e.pri ? `<span class="pill tiny ${PRICLS[e.pri]}">${E((SPRI.find((p) => p[0] === e.pri) || [, ""])[1])}</span>` : ""}${e.rem !== undefined && e.rem !== "" ? '<span title="Reminder on" aria-label="Reminder on">🔔</span>' : ""}${e.rep ? `<span class="tiny muted" title="${E(repText(e))}">↻ ${E(repText(e).split(" · ")[0])}</span>` : ""}${calBtn("ev-" + e.id, e.t, { kind: "event", e })}</span></div>`;
  function schedCard() {
    const t = today(), k = iso(t), now = minToT(new Date().getHours() * 60 + new Date().getMinutes());
    const td = evOn(k), up = [];
    for (let i = 1; i <= 7 && up.length < 4; i++) { const kk = iso(addD(t, i)); evOn(kk).forEach((e) => { if (up.length < 4 && !["DAILY", "WEEKDAYS", "WEEKENDS"].includes(e.rep)) up.push(Object.assign({}, e, { d: kk })); }); }
    return `<section class="card stack mt"><div class="between"><span class="lab">Today's schedule</span><button class="btn sm" data-sched>${ic("plus", 16)} Add / schedule</button></div>
      ${td.map((e) => `<div style="${e.time && (e.end || e.time) < now ? "opacity:.6" : ""}">${schedRow(e)}</div>`).join("") || '<span class="small muted">Nothing scheduled today. Tap Add / schedule for a reminder, task, habit, study session or event.</span>'}
      ${up.length ? `<span class="lab mt">Coming up</span>${up.map((e) => schedRow(e, true)).join("")}` : ""}</section>`;
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
    if (d.learn !== undefined) return modal(learnHTML());
    if (d.sched !== undefined) { document.getElementById("sheet").classList.remove("on"); return schedDialog(null, d.sched ? { d: d.sched } : null); }
    if (d.sedit) return schedDialog(d.sedit);
    if (d.ssave !== undefined) return schedSave(d.ssave || null);
    if (d.sdel) { const ev = MP.S.events[d.sdel], key = "ev-" + d.sdel, s2 = MP.S.sent[key]; if (s2 && !s2.del && mode === "google") G.calDelete(s2.id).catch(() => {}); if (s2 && !s2.del) MP.S.sent[key] = { del: 1, u: Date.now() }; delRec("events", d.sdel); closeModal(); MP.render(); MP.toast(ev && ev.tid ? "Deleted (the To-Do task stays)" : "Deleted"); return; }
    if (d.cal) return calDialog(d.cal);
    if (d.calgo) return calSend(d.calgo);
    if (d.calrm) return calRemove(d.calrm);
    if (d.write) { MP.inputMode = d.write; MP.pref.set("input", d.write); return go("three"); }
    if (d.tdv) { view.tdv = d.tdv; return MP.render(); }
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
    if (d.h) { const k = iso(today()), r = dayRec(k); r.h = r.h || {}; r.h[d.h] = CYC[r.h[d.h] || "e"]; touchDay(k); return MP.render(); }
    if (d.hd) { const r = dayRec(d.hd); r.h = r.h || {}; r.h[d.hi] = CYC[r.h[d.hi] || "e"]; touchDay(d.hd); return MP.render(); }
    if (d.dv) { view.dash = d.dv; return MP.render(); }
    if (d.pv) { view.plan = d.pv; return MP.render(); }
    if (d.ym !== undefined) { view.pm = new Date(view.pm.getFullYear(), +d.ym, 1); view.plan = "month"; return MP.render(); }
    if (d.py) { view.pm = new Date(view.pm.getFullYear() + +d.py, view.pm.getMonth(), 1); return MP.render(); }
    if (d.pm !== undefined) { view.pm = d.pm === "0" ? new Date(today().getFullYear(), today().getMonth(), 1) : new Date(view.pm.getFullYear(), view.pm.getMonth() + +d.pm, 1); return MP.render(); }
    if (d.tv) { view.todo = d.tv; return MP.render(); }
    if (d.ttv) { view.tt = d.ttv; return MP.render(); }
    if (d.weon !== undefined) { P().weekend = P().timetable.map((r) => Object.assign({}, r, { id: uid() })); view.tt = "we"; touchP(); return MP.render(); }
    if (d.weoff !== undefined) { P().weekend = null; view.tt = "wd"; touchP(); return MP.render(); }
    if (d.ttadd !== undefined) { const arr = view.tt === "we" && Array.isArray(P().weekend) ? P().weekend : P().timetable; const lastEnd = arr.reduce((m2, r) => Math.max(m2, tMin(r.end || r.start) || 0), 7 * 60); arr.push({ id: uid(), start: minToT(lastEnd), end: minToT(lastEnd + 30), text: "New activity", type: "Free" }); touchP(); return MP.render(); }
    if (d.ttsuggest !== undefined) { P().timetable = D.suggest.routine.map((r) => ({ id: uid(), start: r[0], end: r[1], text: r[2], type: r[3] })); touchP(); return MP.render(); }
    if (d.ttdel) { ["timetable", "weekend"].forEach((k) => { if (Array.isArray(P()[k])) P()[k] = P()[k].filter((r) => r.id !== d.ttdel); }); touchP(); return MP.render(); }
    if (d.blkN) { const tt = P().timetable, st = tt.filter((r) => r.type === "Study").sort((a, b) => a.start.localeCompare(b.start)); if (+d.blkN > 0) { const lastEnd = st.length ? tMin(st[st.length - 1].end) : 9 * 60; tt.push({ id: uid(), start: minToT(lastEnd + 10), end: minToT(lastEnd + 60), text: "Study block " + (st.length + 1), type: "Study" }); } else if (st.length) { const rm = st[st.length - 1].id; P().timetable = tt.filter((r) => r.id !== rm); } touchP(); return MP.render(); }
    if (d.hadd !== undefined || d.hsug) { const n = d.hsug || field("newh"); if (n) { P().habits.push({ id: uid(), name: n.slice(0, 60), def: "", active: true }); touchP(); } return MP.render(); }
    if (d.hact) { const h = P().habits.find((x) => x.id === d.hact); if (h) { h.active = h.active === false; touchP(); } return MP.render(); }
    if (d.timer) {
      if (d.timer === "reset") { clearInterval(timer.h); timer = { left: 1500, run: false, h: null, phase: "focus" }; stopSound(); }
      else { timer.run = !timer.run; if (timer.run) { if ("Notification" in window && Notification.permission === "default") { try { Notification.requestPermission(); } catch (er) {} } timer.h = setInterval(tick, 1000); if (timer.phase === "focus" && SND().auto) startSound(); } else { clearInterval(timer.h); if (SND().auto) stopSound(); } }
      return MP.render();
    }
    if (d.focus) { const k = iso(today()); dayRec(k).focus = +d.focus; touchDay(k); return MP.render(); }
    if (d.phone) { const k = iso(today()); dayRec(k).phone = d.phone; touchDay(k); return MP.render(); }
    if (d.addev !== undefined) { const v = field("evt"); if (v) { putRec("events", uid(), { d: field("evd") || iso(today()), time: field("evtm"), t: v.slice(0, 120) }); MP.render(); } return; }
    if (d.dayadd) { const v = field("ddt"); if (v) { putRec("events", uid(), { d: d.dayadd, time: field("ddtm"), t: v.slice(0, 120) }); closeModal(); MP.render(); MP.toast("Event added"); } return; }
    if (d.evdel) { delRec("events", d.evdel); return MP.render(); }
    if (d.addtask !== undefined) { const v = field("nt"); if (!v) return; putRec("tasks", uid(), { t: v.slice(0, 160), due: field("ndue"), done: false, b: "", urg: document.getElementById("nu").checked, imp: document.getElementById("ni").checked }); return MP.render(); }
    if (d.tdel) { delRec("tasks", d.tdel); return MP.render(); }
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
    if (d.day) return dayDialog(d.day);
    if (d.hgo) { closeModal(); view.hist = d.hgo; return go("history"); }
    if (d.hsearch !== undefined) { view.q = field("hq"); return MP.render(); }
    if (d.backup !== undefined) { download(`my-planner-backup-${iso(today())}.json`, JSON.stringify(MP.S), "application/json"); return MP.toast("Backup downloaded. Keep it somewhere private."); }
    if (d.csv !== undefined) { download(`my-planner-log-${iso(today())}.csv`, csvLog(), "text/csv"); return; }
  });

  document.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    if (d.done) { const x = MP.S.tasks[d.done]; if (x) { x.done = t.checked; x.u = Date.now(); MP.changed(); MP.render(); } }
    if (d.blk) { const k = iso(today()), r = dayRec(k); r.study = r.study || {}; r.study[d.blk] = t.checked; touchDay(k); MP.render(); }
    if (d.col) { P().collections[d.col] = t.checked; touchP(); MP.render(); }
    if (d.size135) { const x = MP.S.tasks[d.size135]; x.b = t.value; x.u = Date.now(); MP.changed(); MP.render(); }
    if (d.sit) { const k = iso(today()), r = dayRec(k); r.sits = r.sits || {}; r.sits[d.sit] = t.checked; touchDay(k); if (r.sits.m && r.sits.a && r.sits.n) MP.toast("Day complete · dot added"); MP.render(); }
    if (d.hist !== undefined) { view.hist = t.value; MP.render(); }
    if (d.alert) { P().alerts = +t.value; touchP(); }
    if (d.autodates !== undefined) { P().autoDates = t.checked; touchP(); }
    if (d.blen) { const r = P().timetable.find((x) => x.id === d.blen); if (r) { r.end = minToT(tMin(r.start) + +t.value); touchP(); MP.render(); } }
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
    if (d.ttf === "type" || d.ttf === "start" || d.ttf === "end") { setTT(d.id, d.ttf, t.value); MP.render(); }
    if (d.dest !== undefined) { const u = document.getElementById("nu").checked, i = document.getElementById("ni").checked; document.getElementById("dest").textContent = "→ This task will go to: " + (u && i ? "Do now" : i ? "Schedule" : u ? "Delegate or pass" : "Drop"); }
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
    if (d.ttf === "text") setTT(d.id, "text", t.value);
    if (d.name !== undefined) { P().name = t.value.slice(0, 40); touchP(); }
    if (d.sndvol !== undefined) { SND().vol = +t.value / 100; MP.sound && MP.sound.volume(SND().vol); touchP(); }
    if (d.playlist !== undefined) { SND().playlist = t.value.trim().slice(0, 300); touchP(); }
    if (d.wkf) { const w = MP.S.weeks[d.wk] || (MP.S.weeks[d.wk] = {}); w[d.wkf] = t.value.slice(0, 500); w.u = Date.now(); MP.changed(); }
    if (d.dayf) { const k = iso(today()); dayRec(k)[d.dayf] = t.value.slice(0, 240); touchDay(k); }
    if (d.sleep !== undefined) { const k = iso(today()); const v = parseFloat(t.value); dayRec(k).sleep = isNaN(v) ? undefined : Math.max(0, Math.min(16, v)); touchDay(k); }
    if (d.hname) { const h = P().habits.find((x) => x.id === d.hname); if (h) { h.name = t.value.slice(0, 60); touchP(); } }
    if (d.hdef) { const h = P().habits.find((x) => x.id === d.hdef); if (h) { h.def = t.value.slice(0, 80); touchP(); } }
    if (d.prf) { P().practice[d.prf] = d.prf === "text" ? t.value.slice(0, 240) : t.value; touchP(); }
    if (d.shareemails !== undefined) { P().share.emails = t.value.split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)).slice(0, 5); touchP(); }
    if (t.id === "wname") wiz.name = t.value;
    if (t.id === "helpq") { clearTimeout(window._hq); window._hq = setTimeout(() => { view.hq = t.value; MP.render(); const f = document.getElementById("helpq"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 300); }
  });
  document.addEventListener("click", (e) => { if (e.target.closest(".ytl")) stopSound(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); document.getElementById("sheet").classList.remove("on"); } if (e.key === "Enter" && e.target.id === "hq") { view.q = e.target.value; MP.render(); } if (e.key === "Enter" && e.target.id === "helpq") { view.hq = e.target.value; MP.render(); const f = document.getElementById("helpq"); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } } });
  document.getElementById("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") e.currentTarget.classList.remove("on"); });
  document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

  function tick() {
    timer.left--;
    if (timer.left <= 0) {
      if (timer.phase === "focus") {
        const k = iso(today()), r = dayRec(k), nb = studyRows(today()).find((x) => !(r.study && r.study[x.id]));
        if (nb) { r.study = r.study || {}; r.study[nb.id] = true; touchDay(k); }
        notify("Focus round done", nb ? `"${nb.text}" ticked. Take a 5-minute break.` : "Take a 5-minute break.");
        timer.phase = "break"; timer.left = 300; if (SND().breakStop) stopSound();
      } else { notify("Break over", "Ready for the next focus round?"); timer.phase = "focus"; timer.left = 1500; clearInterval(timer.h); timer.run = false; stopSound(); }
      if (route === "study") MP.render();
    }
    const el = document.getElementById("timerv"); if (el) el.textContent = `${String(Math.floor(timer.left / 60)).padStart(2, "0")}:${String(timer.left % 60).padStart(2, "0")}`;
  }
  function notify(title, body) { MP.toast(title + " · " + body); try { if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body, icon: "icons/icon-192.png" }); } catch (e) {} }

  /* drag tasks between matrix boxes (finger, mouse or S Pen) */
  let drag = null;
  document.addEventListener("pointerdown", (e) => { const c = e.target.closest(".task"); if (!c || e.target.closest("input,select,button") || route !== "todo" || view.todo !== "matrix") return; const r = c.getBoundingClientRect(); drag = { id: c.dataset.task, el: c.cloneNode(true), dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false }; drag.el.classList.add("drag"); drag.el.style.width = r.width + "px"; });
  document.addEventListener("pointermove", (e) => { if (!drag) return; if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return; if (!drag.moved) { drag.moved = true; document.body.appendChild(drag.el); } drag.el.style.left = e.clientX - drag.dx + "px"; drag.el.style.top = e.clientY - drag.dy + "px"; document.querySelectorAll(".quad").forEach((q) => q.classList.remove("hot")); const u = document.elementFromPoint(e.clientX, e.clientY), q = u && u.closest(".quad"); if (q) q.classList.add("hot"); });
  document.addEventListener("pointerup", (e) => { if (!drag) return; if (drag.moved) { drag.el.remove(); const u = document.elementFromPoint(e.clientX, e.clientY), q = u && u.closest("[data-quad]"); if (q) { const x = MP.S.tasks[drag.id], m = { q1: [true, true], q2: [false, true], q3: [true, false], q4: [false, false] }[q.dataset.quad]; x.urg = m[0]; x.imp = m[1]; x.u = Date.now(); MP.changed(); MP.toast("Moved to " + q.querySelector("h3").textContent); } } drag = null; MP.render(); });

  /* ---------- start-up ---------- */
  MP.VERSION = "1.10";
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
