/* My Planner 1.25 — template library: "looks" + ~90 layouts shared by the Diary and the Planner's print sheets.
   Our own designs. Common page layouts (Cornell, Eisenhower, habit grids…) drawn from scratch in four looks. */
(function () {
  "use strict";
  const MP = (window.MP = window.MP || {});
  const W = 600;
  const LOOKS = { pastel: "Pastel script", minimal: "Minimal caps", serif: "Serif on cream", midnight: "Midnight" };
  const PAST = ["#F8D5D9", "#D2ECE3", "#E2DBF3", "#F6EDCB", "#D3E7F7", "#E8E3DC"];
  const SER = ["#E9E1D3", "#D9E3D3", "#EFD9D6", "#D8E1EB", "#E4DAEA", "#ECE7CF"];
  const NIGHT = ["rgba(255,255,255,.09)", "rgba(130,165,255,.18)", "rgba(255,150,190,.16)", "rgba(120,220,180,.15)", "rgba(255,210,130,.16)", "rgba(190,160,255,.18)"];
  const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* kit: everything a layout needs, coloured for the chosen look and page */
  function kit(look, o) {
    look = LOOKS[look] ? look : "pastel";
    const dark = look === "midnight" || !!o.d, mn = look === "minimal", se = look === "serif";
    const ink = dark ? "#EEF1F8" : "#2A2A2E", sub = dark ? "rgba(238,241,248,.72)" : "rgba(30,30,35,.62)";
    const ln = dark ? "rgba(255,255,255,.2)" : mn ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.15)";
    const ln2 = dark ? "rgba(255,255,255,.42)" : mn ? "rgba(0,0,0,.78)" : "rgba(0,0,0,.3)";
    const GREY = ["#F1F1F1", "#EAEAEA", "#F4F4F2", "#ECECEC", "#F0F0EE", "#E8E8E8"];
    const fill = (i) => (dark ? NIGHT : se ? SER : mn ? GREY : PAST)[((i % 6) + 6) % 6];
    const H = o.H || 846, dt = o.dt instanceof Date ? o.dt : new Date(), F = o.fill || null;
    const k = { look, dark, ink, sub, ln, ln2, fill, H, dt, F, W, mn, se };
    const T = (x, y, s, sz = 10, an = "start", col = sub, font = "Manrope", wt = 600, ls = 1.1) => `<text x="${x}" y="${y}" font-family="${font},sans-serif" font-size="${sz}" font-weight="${wt}" letter-spacing="${ls}" fill="${col}" text-anchor="${an}">${esc(s)}</text>`;
    k.T = T;
    k.L = (x1, y1, x2, y2, c = ln, w = 1, da = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${da ? ` stroke-dasharray="${da}"` : ""}/>`;
    k.R = (x, y, w, h, f = "none", s = "none", sw = 1, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
    /* page title */
    k.title = (a, b = "", y = 98) => {
      if (look === "pastel") return `<text x="40" y="${y}" font-family="Great Vibes,cursive" font-size="50" fill="${ink}">${esc(a)}${b ? `<tspan font-family="Manrope,sans-serif" font-size="15" font-weight="500" letter-spacing="3" dx="10">${esc(b.toUpperCase())}</tspan>` : ""}</text>`;
      if (se) return `<text x="40" y="${y - 4}" font-family="Fraunces,serif" font-size="30" fill="${ink}">${esc(a)}${b ? `<tspan font-style="italic" dx="8">${esc(b)}</tspan>` : ""}</text>`;
      return `<text x="40" y="${y - 8}" font-family="Manrope,sans-serif" font-size="19" letter-spacing="3.6" fill="${ink}"><tspan font-weight="800">${esc(a.toUpperCase())}</tspan>${b ? `<tspan font-weight="400" dx="8">${esc(b.toUpperCase())}</tspan>` : ""}</text>${mn ? k.L(40, y + 4, 560, y + 4, ink, 1.4) : ""}`;
    };
    /* label bar */
    k.bar = (x, y, w, s, i = 0, an = "middle", h = 17) => {
      const tx = an === "middle" ? x + w / 2 : x + 6;
      if (mn) return `${k.L(x, y, x + w, y, ln2, 1.3)}${k.L(x, y + h, x + w, y + h, ln, 1)}${T(tx, y + h - 5, s.toUpperCase(), 8.6, an, ink, "Manrope", 700, 1.3)}`;
      return `${k.R(x, y, w, h, fill(i), "none", 0, se ? 0 : 2)}${T(tx, y + h - 5, s.toUpperCase(), 8.6, an, dark ? ink : "rgba(30,30,35,.66)", "Manrope", 700, 1.3)}`;
    };
    /* label + line to fill in */
    k.field = (x, y, w, s) => `${T(x, y, s.toUpperCase() + ":", 8.6, "start", sub, "Manrope", 700, 1.2)}${k.L(x + s.length * 6.6 + 12, y + 2, x + w, y + 2, ln2, 0.9)}`;
    k.lab = (x, y, s, an = "start") => T(x, y, s.toUpperCase(), 8.6, an, sub, "Manrope", 700, 1.2);
    k.lines = (x, y, w, n, gap = 26, c = ln) => { let s = ""; for (let i = 0; i < n; i++) s += k.L(x, y + i * gap, x + w, y + i * gap, c); return s; };
    k.dlines = (x, y, w, n, gap = 26) => { let s = ""; for (let i = 0; i < n; i++) s += k.L(x, y + i * gap, x + w, y + i * gap, ln2, 0.8, "1.5 3.5"); return s; };
    k.panel = (x, y, w, h, i = 0, r = 0) => mn ? k.R(x, y, w, h, "none", ln2, 1, r) : k.R(x, y, w, h, fill(i), "none", 0, se ? 0 : r || 3);
    k.frame = (x, y, w, h, r = 0) => k.R(x, y, w, h, "none", mn ? ln2 : ln2, 1, r);
    k.circ = (cx, cy, r = 5, f = "none") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" stroke="${ln2}" stroke-width="1"/>`;
    k.sq = (x, y, s = 10) => k.R(x, y, s, s, "none", ln2, 1, 1.5);
    k.checks = (x, y, w, n, gap = 26, shape = "o") => { let s = ""; for (let i = 0; i < n; i++) { const yy = y + i * gap; s += (shape === "o" ? k.circ(x + 5, yy - 6, 4.5) : k.sq(x, yy - 11, 10)) + k.L(x + 16, yy, x + w, yy); } return s; };
    k.nums = (x, y, w, n, gap = 26) => { let s = ""; for (let i = 0; i < n; i++) s += T(x, y + i * gap - 4, String(i + 1), 9, "start", sub, "Manrope", 700, 0) + k.L(x + 14, y + i * gap, x + w, y + i * gap); return s; };
    k.dots = (x, y, w, h, g = 18) => { let s = ""; for (let yy = y; yy <= y + h; yy += g) for (let xx = x; xx <= x + w; xx += g) s += `<circle cx="${xx}" cy="${yy}" r="1.1" fill="${ln2}"/>`; return s; };
    k.grid = (x, y, w, h, g = 18, c = ln) => { let s = ""; for (let yy = y; yy <= y + h + 0.1; yy += g) s += k.L(x, yy, x + w, yy, c, 0.7); for (let xx = x; xx <= x + w + 0.1; xx += g) s += k.L(xx, y, xx, y + h, c, 0.7); return s; };
    /* table: header + rows + column dividers. cols = [[label, fraction], …] */
    k.table = (x, y, w, cols, n, rh = 24, i = 0, opt = {}) => {
      let s = k.bar(x, y, w, "", i), cx = x; const tot = cols.reduce((a, c) => a + c[1], 0);
      cols.forEach(([lab, f], j) => { const cw = (w * f) / tot; s += T(cx + cw / 2, y + 12, lab.toUpperCase(), 8, "middle", dark ? ink : "rgba(30,30,35,.66)", "Manrope", 700, 1.1); if (j) s += k.L(cx, y + 17, cx, y + 17 + n * rh, ln); cx += cw; });
      for (let r = 1; r <= n; r++) { const yy = y + 17 + r * rh; if (opt.zebra && r % 2) s += k.R(x, yy - rh + 3, w, rh - 6, fill(i), "none", 0, 2); s += k.L(x, yy, x + w, yy, ln); }
      if (opt.box) s += k.frame(x, y, w, 17 + n * rh);
      return s;
    };
    /* the start x of each column of a table, for filling in */
    k.colX = (x, w, cols) => { const tot = cols.reduce((a, c) => a + c[1], 0); let cx = x; return cols.map(([, f]) => { const v = cx; cx += (w * f) / tot; return v; }); };
    /* handwriting-style text that print sheets fill in from planner data */
    k.put = (x, y, s, sz = 13, w = 0, an = "start") => { if (s == null || s === "") return ""; let t = String(s); if (w) { const max = Math.max(3, Math.floor(w / (sz * 0.5))); if (t.length > max) t = t.slice(0, max - 1) + "…"; } return `<text x="${x}" y="${y}" font-family="Patrick Hand,Caveat,cursive" font-size="${sz}" fill="${ink}" text-anchor="${an}">${esc(t)}</text>`; };
    /* month calendar grid (Monday first). y0 = top of weekday header */
    k.cal = (x, y, w, h, yr, mo, i = 0, opt = {}) => {
      const cw = w / 7; let s = "";
      WD.forEach((d, j) => { s += opt.bars ? k.bar(x + j * cw + 1, y, cw - 2, d, j) : T(x + j * cw + cw / 2, y + 12, d[0], 8.6, "middle", sub, "Manrope", 700, 0.5); });
      const first = yr == null ? 0 : (new Date(yr, mo, 1).getDay() + 6) % 7, days = yr == null ? 0 : new Date(yr, mo + 1, 0).getDate();
      const rows = opt.rows || (yr == null ? 5 : Math.ceil((first + days) / 7)), top = y + 21, rh = (h - 21) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) {
        const n = r * 7 + c - first + 1, bx = x + c * cw, by = top + r * rh;
        s += opt.open ? "" : k.R(bx + 1.5, by + 1.5, cw - 3, rh - 3, "none", ln, 0.9, 2);
        if (yr != null && n >= 1 && n <= days) s += T(bx + 6, by + 13, String(n), 9, "start", sub, "Manrope", 700, 0);
      }
      return s;
    };
    /* compact month (numbers only), for year pages */
    k.mini = (x, y, w, yr, mo, i = 0) => {
      const cw = w / 7; let s = k.bar(x, y, w, MON[mo], i);
      "MTWTFSS".split("").forEach((d, j) => (s += T(x + j * cw + cw / 2, y + 30, d, 7.5, "middle", sub, "Manrope", 700, 0)));
      const first = (new Date(yr, mo, 1).getDay() + 6) % 7, days = new Date(yr, mo + 1, 0).getDate();
      for (let n = 1; n <= days; n++) { const p = n - 1 + first, r = Math.floor(p / 7), c = p % 7; s += T(x + c * cw + cw / 2, y + 45 + r * 14, String(n), 8, "middle", ink, "Manrope", 500, 0); }
      return s;
    };
    k.MON = MON; k.WD = WD;
    const yr = dt.getFullYear(), mo = dt.getMonth();
    k.yr = yr; k.mo = mo;
    k.monday = (() => { const d = new Date(dt); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
    return k;
  }

  /* ---------- reusable blocks ---------- */
  const two = (k, y, h, a, b, ia = 0, ib = 1, body) => `${k.bar(40, y, 250, a, ia)}${k.bar(310, y, 250, b, ib)}${body ? body(40, y + 17, 250, h) + body(310, y + 17, 250, h) : ""}`;
  const linesIn = (k) => (x, y, w, h) => k.lines(x, y + 26, w, Math.floor((h - 8) / 26));
  const cornell = (bg) => (k) => {
    let s = k.title("Cornell", "notes") + k.field(40, 132, 330, "Topic") + k.field(390, 132, 170, "Date");
    s += k.bar(40, 150, 150, "Key points", 0) + k.bar(198, 150, 362, "Notes", 1) + k.panel(40, 170, 150, 450, 0) ;
    const area = (x, y, w, h) => bg === "r" ? k.lines(x, y + 24, w, Math.floor(h / 24)) : bg === "c" ? k.grid(x, y, w, h, 18) : bg === "d" ? k.dots(x + 6, y + 9, w - 12, h - 12, 18) : "";
    s += area(198, 170, 362, 450) + (k.mn ? k.frame(198, 170, 362, 450) : "");
    s += k.bar(40, 636, 520, "Summary", 2) + area(40, 656, 520, 164) + k.frame(40, 656, 520, 164);
    return s;
  };
  const dayRow = (k, x, y, w, n, gap) => { let s = ""; "MTWTFSS".split("").forEach((d, j) => { const cx = x + j * gap; s += k.T(cx, y + 3, d, 8, "middle", k.sub, "Manrope", 700, 0) + k.circ(cx + 9, y, 4); }); return s; };
  const block = (k, x, y, w, h, label, i, kind = "lines", n) => {
    let s = k.bar(x, y, w, label, i);
    if (kind === "lines") s += k.lines(x, y + 17 + 26, w, n || Math.floor((h - 17) / 26));
    if (kind === "checks") s += k.checks(x, y + 17 + 26, w, n || Math.floor((h - 17) / 26));
    if (kind === "panel") s += k.panel(x, y + 20, w, h - 20, i);
    if (kind === "frame") s += k.frame(x, y + 20, w, h - 20);
    if (kind === "dots") s += k.frame(x, y + 20, w, h - 20) + k.dots(x + 9, y + 32, w - 18, h - 42, 18);
    return s;
  };
  const DAYS7 = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const fmtD = (d) => `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`;
  const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const F = (k, key, def) => (k.F && k.F[key] != null ? k.F[key] : def);

  /* ---------- layouts: [id, name, group, fn, adaptive?] ---------- */
  const L = [];
  const add = (id, name, g, fn, ad) => L.push([id, name, g, fn, ad]);

  /* Study */
  add("cornell-r", "Cornell · ruled", "study", cornell("r"));
  add("cornell-c", "Cornell · checked", "study", cornell("c"));
  add("cornell-d", "Cornell · dotted", "study", cornell("d"));
  add("cornell-p", "Cornell · plain", "study", cornell("p"));
  add("study-sess", "Study session", "study", (k) => {
    let s = k.title("Study", "session") + k.field(40, 132, 250, "Date") + dayRow(k, 330, 129, 230, 7, 32);
    s += k.lab(40, 158, "Productivity") + [0, 1, 2, 3, 4, 5, 6].map((i) => k.circ(150 + i * 18, 155, 5)).join("") + k.lab(320, 158, "Break time") + [0, 1, 2, 3, 4, 5].map((i) => k.circ(410 + i * 18, 155, 5)).join("");
    const cols = [["Topic", 0.55], ["Start", 0.15], ["Finish", 0.15], ["Total", 0.15]];
    s += k.table(40, 172, 520, cols, 15, 25, 4); for (let r = 0; r < 15; r++) s += k.circ(50, 172 + 17 + r * 25 + 13, 4);
    return s + block(k, 40, 570, 520, 250, "Notes", 4, "dots");
  });
  add("read-list", "Reading list", "study", (k) => k.title("Reading", "list") + k.table(40, 124, 520, [["Title", 0.4], ["Author", 0.24], ["Date started", 0.18], ["Date finished", 0.18]], 26, 26, 2));
  add("read-sum", "Reading summary", "study", (k) => k.title("Reading", "summary") + k.bar(40, 124, 520, "Title:", 2, "start") + k.field(40, 162, 520, "Author") + k.lab(40, 188, "Key points / thoughts") + k.lines(40, 214, 520, 13) + k.bar(40, 560, 520, "Summary", 2) + k.dots(46, 592, 508, 222, 18));
  add("key-terms", "Key terms & definitions", "study", (k) => k.title("Key terms", "& definitions") + k.table(40, 124, 520, [["Key terms", 0.33], ["Definitions", 0.67]], 26, 26, 1));
  add("vocab1", "Vocabulary cards", "study", (k) => { let s = k.title("Vocabulary"); for (let i = 0; i < 6; i++) { const y = 124 + i * 116; s += k.bar(40, y, 520, "Word:", 4, "start") + k.lab(40, y + 44, "Definition:") + k.L(40, y + 50, 560, y + 50, k.ln) + k.L(40, y + 74, 560, y + 74, k.ln) + k.lab(40, y + 98, "Sentence:") + k.L(110, y + 100, 560, y + 100, k.ln); } return s; });
  add("vocab2", "Vocabulary list", "study", (k) => { const cols = [["Word", 0.28], ["Definition", 0.5], ["Repetition", 0.22]]; let s = k.title("Vocabulary") + k.table(40, 124, 520, cols, 26, 26, 2); const x0 = k.colX(40, 520, cols)[2]; for (let r = 0; r < 26; r++) for (let c = 0; c < 4; c++) s += k.circ(x0 + 18 + c * 24, 124 + 17 + r * 26 + 13, 5); return s; });
  add("essay1", "Essay planner", "study", (k) => k.title("Essay", "planner") + k.bar(40, 124, 520, "Essay title:", 0, "start") + k.field(40, 164, 160, "Semester") + k.field(215, 164, 170, "Subject") + k.field(400, 164, 160, "Due date") + k.field(40, 190, 520, "Question") + k.L(40, 216, 560, 216, k.ln) + k.bar(40, 236, 260, "Topics", 0) + k.bar(300, 236, 260, "Resource list", 0) + k.L(300, 253, 300, 640, k.ln2) + k.lines(40, 279, 250, 14) + k.lines(310, 279, 250, 14) + k.bar(40, 650, 520, "Notes", 0) + k.dots(46, 680, 508, 140, 18));
  add("essay2", "Essay planner · ideas", "study", (k) => k.title("Essay", "planner") + k.bar(40, 124, 520, "Topic:", 1, "start") + k.field(40, 164, 250, "Due date") + k.field(310, 164, 250, "Semester") + k.field(40, 190, 520, "Title") + k.L(40, 214, 560, 214, k.ln2) + k.lab(40, 238, "Reference & citations") + k.lines(40, 264, 520, 9) + k.bar(40, 500, 520, "Ideas & key points", 1) + k.L(150, 517, 150, 820, k.ln2) + [0, 1, 2, 3].map((i) => k.L(40, 517 + (i + 1) * 75, 560, 517 + (i + 1) * 75, k.ln2) + k.lines(160, 517 + i * 75 + 25, 400, 2, 25)).join(""));
  add("essay-out", "Essay outline", "study", (k) => k.title("Essay", "outline") + k.bar(40, 124, 520, "Title:", 4, "start") + k.field(40, 164, 300, "Subject") + k.field(360, 164, 200, "Due date") + k.lab(40, 192, "Introduction") + k.lines(40, 218, 520, 3) + [0, 1, 2].map((i) => k.bar(40 + i * 175, 290, 170, "Key point " + (i + 1), 4) + k.lines(46 + i * 175, 334, 158, 13)).join("") + k.L(212, 307, 212, 660, k.ln2) + k.L(387, 307, 387, 660, k.ln2) + k.bar(40, 672, 520, "Resources", 4) + k.lines(40, 714, 520, 4));
  add("formula1", "Formula list", "study", (k) => { let s = k.title("Formula", "list"); for (let i = 0; i < 3; i++) { const y = 124 + i * 232; s += k.bar(40, y, 300, "Formula:", 5, "start") + k.bar(345, y, 215, "Notes:", 5, "start") + k.L(342, y, 342, y + 222, k.ln2) + k.lab(352, y + 120, "Variable:") + k.L(345, y + 106, 560, y + 106, k.ln) + k.L(40, y + 222, 560, y + 222, k.ln); } return s; });
  add("formula2", "Formula list · grid", "study", (k) => { let s = k.title("Formula", "list"); for (let i = 0; i < 3; i++) { const y = 124 + i * 232; s += k.panel(40, y, 520, 98, 0) + k.grid(40, y, 520, 98, 14, k.dark ? k.ln : "rgba(255,255,255,.7)") + k.lab(46, y + 14, "Formula:") + k.lab(40, y + 124, "Notes:") + k.lines(40, y + 150, 520, 3, 24); } return s; });

  /* Academic */
  add("class-sched", "Class schedule", "academic", (k) => { const cols = [["Time", 0.16], ["Mon", 0.14], ["Tue", 0.14], ["Wed", 0.14], ["Thu", 0.14], ["Fri", 0.14], ["Sat", 0.14]]; let s = k.title("Class", "schedule") + k.bar(40, 124, 520, "Semester:", 4, "start") + k.table(40, 160, 520, cols, 24, 27, 4); for (let r = 0; r < 24; r++) s += k.R(42, 160 + 17 + r * 27 + 3, 79, 21, k.fill(4), "none", 0, 2); return s; });
  add("semester", "Semester planner", "academic", (k) => { let s = k.title("Semester", "planner") + k.bar(40, 124, 520, "Semester:", 3, "start") + k.field(40, 164, 250, "Start date") + k.field(310, 164, 250, "End date") + k.lab(40, 196, "Class schedule"); ["Time", "Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d, j) => (s += k.bar(40 + j * 87, 206, 82, d, 3))); for (let r = 1; r <= 9; r++) for (let j = 0; j < 6; j++) s += k.L(40 + j * 87, 206 + 17 + r * 25, 122 + j * 87, 206 + 17 + r * 25, k.ln); s += k.lab(40, 488, "Class details"); ["Subject", "Grades", "Teacher", "Location"].forEach((d, j) => (s += k.bar(40 + j * 131, 498, 126, d, 3))); for (let r = 1; r <= 12; r++) for (let j = 0; j < 4; j++) s += k.L(40 + j * 131, 515 + r * 25, 166 + j * 131, 515 + r * 25, k.ln); return s; });
  add("course", "Course overview", "academic", (k) => k.title("Course", "overview") + k.bar(40, 124, 520, "Course name:", 5, "start") + k.field(40, 164, 300, "Class location") + k.lab(360, 164, "Days") + dayRow(k, 400, 161, 160, 7, 23) + k.field(40, 190, 300, "Instructor") + k.field(360, 190, 200, "Contact") + k.table(40, 214, 520, [["Assignment", 0.75], ["Due date", 0.25]], 13, 25, 5) + k.table(40, 568, 520, [["Exam", 0.6], ["Date", 0.2], ["Grade", 0.2]], 9, 25, 5));
  const tracker = (t1, t2, head, cols, rows) => (k) => { let s = k.title(t1, t2) + k.bar(40, 124, 520, head + ":", 1, "start") + k.field(40, 164, 250, cols[0]) + k.field(310, 164, 250, cols[1]) + k.table(40, 184, 520, rows, 16, 26, 1); for (let r = 0; r < 16; r++) s += k.circ(50, 184 + 17 + r * 26 + 13, 4); return s + block(k, 40, 628, 520, 192, "Notes", 1, "dots"); };
  add("assign", "Assignment tracker", "academic", tracker("Assignment", "tracker", "Subject", ["Semester", "Year"], [["Assignment", 0.62], ["Due date", 0.2], ["Grade", 0.18]]));
  add("grades", "Grade tracker", "academic", tracker("Grade", "tracker", "Class", ["Goal grade", "Final grade"], [["Date", 0.2], ["Assignment", 0.62], ["Grade", 0.18]]));
  add("exam-tt", "Exam timetable", "academic", tracker("Exam", "timetable", "Semester", ["Exam period", "Year"], [["Exam", 0.56], ["Date", 0.22], ["Time", 0.22]]));
  add("group-proj", "Group project", "academic", (k) => k.title("Group", "project") + k.bar(40, 124, 520, "Project:", 0, "start") + k.field(40, 164, 300, "Subject") + k.field(360, 164, 200, "Due date") + k.lab(40, 192, "Project description") + k.dots(46, 206, 508, 70, 18) + k.bar(40, 292, 255, "Group members", 0, "start") + k.bar(305, 292, 255, "Role", 0, "start") + k.panel(40, 312, 255, 150, 0) + k.panel(305, 312, 255, 150, 0) + k.table(40, 478, 520, [["My tasks", 0.75], ["Due date", 0.25]], 6, 24, 5) + k.table(40, 650, 520, [["Group tasks", 0.5], ["Assigned to", 0.3], ["Due date", 0.2]], 6, 26, 5));
  add("lesson", "Lesson planner", "academic", (k) => k.title("Lesson", "planner") + k.bar(40, 124, 520, "Subject:", 4, "start") + k.field(40, 164, 520, "Learning goal") + k.bar(40, 186, 255, "Activities", 4, "start") + k.bar(305, 186, 255, "Resources", 4, "start") + k.panel(40, 206, 255, 150, 4) + k.panel(305, 206, 255, 150, 4) + k.lab(40, 384, "Lesson plan outline") + k.checks(40, 416, 520, 11) + block(k, 40, 700, 520, 120, "Notes", 4, "dots"));

  /* Daily */
  add("daily-pl", "Daily planner", "daily", (k) => {
    let s = k.title("Daily", "planner") + k.bar(40, 124, 240, "Top priorities", 0) + k.nums(40, 168, 240, 3) + k.lab(40, 240, "To do") + k.checks(40, 266, 240, 6) + k.lab(40, 434, "Notes") + k.frame(40, 442, 240, 140, 2);
    ["B", "L", "D", "S"].forEach((m, i) => (s += k.R(40, 598 + i * 26, 240, 20, k.fill(i), "none", 0, 2) + k.T(48, 612 + i * 26, m, 9, "start", k.sub, "Manrope", 800, 0)));
    s += k.lab(40, 720, "Water") + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => k.sq(96 + i * 22, 710, 12)).join("");
    s += k.bar(300, 124, 260, "Schedule", 0);
    for (let h = 0; h < 17; h++) { const y = 174 + h * 38; s += k.T(300, y - 4, String(6 + h).padStart(2, "0") + ":00", 7.5, "start", k.sub, "Manrope", 600, 0) + k.L(300, y, 560, y, k.ln) + k.L(332, y + 19, 560, y + 19, k.ln, 0.7, "2 3"); }
    /* filled from the planner when printed */
    const f = k.F; if (f) { (f.pri || []).slice(0, 3).forEach((t, i) => (s += k.put(58, 164 + i * 26, t, 13, 220))); (f.todo || []).slice(0, 6).forEach((t, i) => (s += k.put(58, 262 + i * 26, t, 13, 220))); const used = {}; (f.sched || []).forEach(([hr, t]) => { const h = Math.min(22, Math.max(6, hr)) - 6, n = used[h] = (used[h] || 0) + 1; if (n <= 2) s += k.put(336, 170 + h * 38 + (n - 1) * 19 - 0, t, 12, 222); }); if (f.notes) s += k.put(48, 466, f.notes, 12, 228); }
    return s;
  });
  add("daily-basic", "Daily planner · basic", "daily", (k) => {
    let s = k.title("Daily", "planner") + k.bar(40, 124, 255, "Top priorities", 5) + k.bar(305, 124, 255, "Schedule", 5) + k.L(300, 141, 300, 820, k.ln2) + k.lines(40, 170, 250, 4) + k.lab(40, 290, "To do") + k.checks(40, 316, 250, 8) + k.lab(40, 540, "Notes") + k.lines(40, 566, 250, 10) + k.lines(310, 170, 250, 25);
    const f = k.F; if (f) { (f.pri || []).slice(0, 4).forEach((t, i) => (s += k.put(44, 166 + i * 26, t, 13, 240))); (f.todo || []).slice(0, 8).forEach((t, i) => (s += k.put(58, 312 + i * 26, t, 13, 230))); (f.sched || []).slice(0, 25).forEach((r, i) => (s += k.put(312, 166 + i * 26, r, 12.5, 245))); }
    return s;
  });
  add("daily-full", "Daily planner · detailed", "daily", (k) => {
    let s = k.title("Daily", "planner") + k.field(40, 132, 280, "Date") + dayRow(k, 340, 129, 220, 7, 31);
    s += k.bar(40, 150, 160, "Quote", 3) + k.panel(40, 170, 160, 70, 3) + k.bar(215, 150, 175, "Reminder to", 1) + k.panel(215, 170, 175, 70, 1);
    s += k.bar(405, 150, 155, "Mood", 2) + [0, 1, 2, 3, 4].map((i) => k.circ(422 + i * 30, 188, 10)).join("") + [0, 1, 2, 3, 4].map((i) => `<path d="M${416 + i * 30} ${191}q6 ${[5, 3, 0, -3, -5][i]} 12 0" stroke="${k.ln2}" fill="none"/>`).join("");
    s += k.bar(405, 210, 155, "Exercise", 2) + k.field(405, 246, 155, "Steps") + k.field(405, 272, 155, "Minutes");
    s += k.bar(405, 292, 155, "Water", 4) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => k.sq(408 + i * 19, 318, 12)).join("");
    s += k.bar(405, 348, 155, "Meal tracker", 4) + ["B", "L", "D", "S"].map((m, i) => k.frame(405, 368 + i * 26, 155, 26) + k.T(412, 385 + i * 26, m, 9, "start", k.sub, "Manrope", 800, 0)).join("");
    s += k.bar(405, 486, 155, "For tomorrow", 5) + k.panel(405, 506, 155, 196, 5);
    s += k.bar(40, 256, 160, "Top priorities", 0) + k.nums(40, 300, 160, 5) + k.bar(40, 420, 160, "Appointments", 0) + k.grid(40, 440, 160, 260, 26) + k.L(80, 440, 80, 700, k.ln2);
    s += k.lab(215, 270, "Things to do") + k.checks(215, 300, 175, 12, 26, "s") + k.bar(215, 616, 175, "Expense tracker", 1) + k.lines(215, 660, 175, 2);
    s += k.panel(40, 716, 350, 104, 5) + k.lab(48, 734, "Notes:");
    return s;
  });
  add("day-night", "Day & night journal", "daily", (k) => {
    let s = k.title("Day", "& night") + k.field(40, 132, 260, "Date") + `<text x="300" y="172" font-family="Fraunces,serif" font-style="italic" font-size="13" fill="${k.sub}" text-anchor="middle">a quote, a verse or a line I want to remember</text>` + k.L(120, 188, 480, 188, k.ln, 0.8, "2 3");
    [["My affirmations for the day", 0], ["Today I will accomplish", 1], ["I am thankful for", 2]].forEach(([t, i], j) => (s += k.lab(40, 226 + j * 112, t) + k.dlines(40, 256 + j * 112, 520, 3, 26)));
    s += k.panel(0, 560, 600, 286, 4) + k.T(560, 584, "☾", 16, "end", k.sub, "Manrope", 400, 0);
    [["Three things that made me happy today", 4], ["Today I learnt", 4]].forEach(([t], j) => (s += k.lab(40, 598 + j * 112, t) + k.dlines(40, 628 + j * 112, 520, 3, 26)));
    return s;
  });
  add("daily-routine", "Daily routine", "daily", (k) => k.title("Daily", "routine") + block(k, 40, 124, 255, 230, "Morning", 0, "lines") + block(k, 305, 124, 255, 230, "Top priorities", 3, "checks") + block(k, 40, 374, 255, 230, "Afternoon", 3, "lines") + block(k, 305, 374, 255, 230, "Evening", 2, "lines") + block(k, 40, 624, 520, 196, "Notes", 5, "lines"));
  add("routine-check", "Routine checklist", "daily", (k) => { let s = k.title("Routine", "checklist") + k.bar(40, 124, 330, "Daily routine", 0) + k.bar(372, 124, 188, "M  T  W  T  F  S  S", 0); for (let r = 0; r < 16; r++) { const y = 141 + (r + 1) * 26; s += k.L(40, y, 560, y, k.ln); for (let c = 0; c < 7; c++) s += k.circ(384 + c * 26.5, y - 13, 6); } s += k.L(370, 141, 370, 557, k.ln2) + k.bar(40, 578, 330, "Weekly routine", 5) + k.checks(40, 622, 330, 8) + k.bar(380, 578, 180, "Notes", 2) + k.panel(380, 598, 180, 222, 2); return s; });
  add("gratitude2", "Daily gratitude", "daily", (k) => k.title("Daily", "gratitude") + k.field(40, 132, 250, "Date") + k.field(310, 132, 250, "Month") + k.lab(40, 162, "My affirmations") + k.panel(40, 172, 520, 70, 0) + k.lab(40, 270, "Today I will accomplish") + k.lines(40, 296, 520, 3) + k.lab(40, 390, "I am thankful for") + k.panel(40, 400, 520, 90, 2) + k.lab(40, 518, "Three things that made me happy today") + k.lines(40, 544, 520, 3) + k.lab(40, 638, "Today I learnt") + k.panel(40, 648, 520, 172, 4));
  add("daily-time", "Daily plan · time grid", "daily", (k) => { let s = k.title("Daily", "plan") + k.bar(40, 124, 520, "", 0) + k.lab(40, 160, "Schedule") + k.lab(230, 160, "Priorities") + k.lab(410, 160, "Shopping list"); for (let i = 0; i < 28; i++) { const y = 186 + i * 22.6; s += k.T(44, y - 6, `${String(7 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`, 7.5, "start", k.sub, "Manrope", 600, 0) + k.L(40, y, 210, y, k.ln); } s += k.L(78, 168, 78, 820, k.ln2) + k.checks(230, 190, 160, 5, 22) + k.lab(230, 320, "To do") + k.checks(230, 346, 160, 14, 22) + k.lab(230, 680, "Unfinished") + k.lines(230, 706, 160, 5, 23) + k.lines(410, 186, 150, 5, 22) + k.lab(410, 320, "Daily budget") + k.lines(410, 346, 150, 14, 22) + k.lab(410, 680, "Today") + k.lines(410, 706, 150, 5, 23); return s; });

  /* Weekly */
  add("week-pl", "Weekly planner", "weekly", (k) => {
    const m = k.monday; let s = k.title("Weekly", "planner") + k.lab(40, 136, "Week of") + k.frame(40, 142, 230, 34) + k.put(52, 166, `${fmtD(m)} – ${fmtD(addD(m, 6))} ${addD(m, 6).getFullYear()}`, 15) + k.lab(40, 206, "Top priorities") + k.checks(40, 232, 230, 3) + k.lab(40, 326, "To do") + k.checks(40, 352, 230, 9) + k.lab(40, 600, "Notes") + k.frame(40, 610, 230, 210);
    DAYS7.forEach((d, i) => { const y = 124 + i * 100; s += k.panel(290, y, 270, 90, i) + k.lab(298, y + 15, d.slice(0, 3)) + k.T(552, y + 15, String(addD(m, i).getDate()), 9, "end", k.sub, "Manrope", 700, 0); });
    const f = k.F; if (f) { (f.pri || []).slice(0, 3).forEach((t, i) => (s += k.put(58, 228 + i * 26, t, 13, 205))); (f.todo || []).slice(0, 9).forEach((t, i) => (s += k.put(58, 348 + i * 26, t, 13, 205))); (f.days || []).forEach((items, i) => (items || []).slice(0, 3).forEach((t, j) => (s += k.put(300, 124 + i * 100 + 38 + j * 19, t, 12, 250)))); }
    return s;
  });
  add("week-over", "Week overview", "weekly", (k) => {
    const m = k.monday; let s = k.title("Week", "overview") + k.field(40, 132, 250, "Year") + k.field(310, 132, 250, "Month");
    const cell = (d, i, x, y, w) => k.bar(x, y, w, `${d}  ${addD(m, i).getDate()}`, i) + k.lines(x, y + 43, w, 7);
    for (let i = 0; i < 3; i++) s += cell(DAYS7[i], i, 40 + i * 176, 150, 168);
    for (let i = 3; i < 6; i++) s += cell(DAYS7[i], i, 40 + (i - 3) * 176, 380, 168);
    s += cell("Sunday", 6, 40, 610, 168) + k.frame(216, 610, 344, 210) + k.lab(224, 626, "Notes");
    const f = k.F; if (f) (f.days || []).forEach((items, i) => (items || []).slice(0, 7).forEach((t, j) => { const col = i === 6 ? 0 : i % 3, row = i === 6 ? 2 : Math.floor(i / 3); s += k.put(44 + col * 176, 150 + row * 230 + 39 + j * 26, t, 12, 160); }));
    return s;
  });
  add("week-sched1", "Weekly schedule · hours", "weekly", (k) => k.title("Weekly", "schedule") + k.field(40, 132, 520, "Week") + k.table(40, 150, 520, [["Time", 0.16], ["Mon", 0.12], ["Tue", 0.12], ["Wed", 0.12], ["Thu", 0.12], ["Fri", 0.12], ["Sat", 0.12], ["Sun", 0.12]], 25, 26, 0, { box: true }));
  add("week-sched2", "Weekly schedule · parts of day", "weekly", (k) => { let s = k.title("Weekly", "schedule") + k.field(40, 132, 250, "Month") + k.field(310, 132, 250, "Year") + k.table(40, 150, 520, [["", 0.1], ["Morning", 0.3], ["Afternoon", 0.3], ["Evening", 0.3]], 7, 95, 0, { box: true }); DAYS7.forEach((d, i) => (s += k.R(41, 168 + i * 95, 50, 94, k.fill(i), "none", 0, 0) + k.T(66, 218 + i * 95, d.slice(0, 3).toUpperCase(), 8, "middle", k.sub, "Manrope", 700, 1))); return s; });
  add("week-1page", "Week on one page", "weekly", (k) => {
    const m = k.monday; let s = `<text x="40" y="96" font-family="Fraunces,serif" font-size="20" fill="${k.ink}">${esc(MON[m.getMonth()])}<tspan font-size="11" dx="8" fill="${k.sub}">• week of ${esc(fmtD(m))}</tspan></text>${k.T(560, 96, String(m.getFullYear()), 14, "end", k.ink, "Fraunces", 500, 0)}`;
    const cell = (i, x, y, w, h) => k.frame(x, y, w, h) + k.T(x + 8, y + 16, DAYS7[i], 10, "start", k.ink, "Fraunces", 500, 0) + k.T(x + 8, y + h - 7, String(addD(m, i).getDate()), 8, "start", k.sub, "Manrope", 600, 0);
    for (let i = 0; i < 5; i++) s += cell(i, 40, 116 + i * 116, 340, 116);
    s += cell(5, 40, 696, 170, 120) + cell(6, 210, 696, 170, 120) + k.frame(380, 116, 180, 700) + k.lines(380, 142, 180, 26);
    const f = k.F; if (f) (f.days || []).forEach((items, i) => (items || []).slice(0, i < 5 ? 4 : 4).forEach((t, j) => { const x = i < 5 ? 50 : i === 5 ? 50 : 220, y = (i < 5 ? 116 + i * 116 : 696) + 36 + j * 19; s += k.put(x, y, t, 12, i < 5 ? 320 : 150); }));
    return s;
  });

  /* Monthly */
  add("month-pl", "Monthly planner", "monthly", (k) => {
    let s = k.title(MON[k.mo], String(k.yr)) + k.cal(40, 124, 520, 470, k.yr, k.mo, 0, { bars: true });
    s += k.bar(40, 612, 250, "Priorities", 2) + k.lines(40, 656, 250, 5) + k.bar(310, 612, 250, "To do", 3) + k.checks(310, 656, 250, 5) + k.bar(40, 790, 250, "Notes", 4) + k.L(40, 814, 560, 814, k.ln);
    const f = k.F; if (f && f.days) { const first = (new Date(k.yr, k.mo, 1).getDay() + 6) % 7, rows = Math.ceil((first + new Date(k.yr, k.mo + 1, 0).getDate()) / 7), rh = (470 - 21) / rows, cw = 520 / 7; Object.entries(f.days).forEach(([d, items]) => { const p = +d - 1 + first, r = Math.floor(p / 7), c = p % 7; (items || []).slice(0, Math.max(1, Math.floor((rh - 18) / 13))).forEach((t, j) => (s += k.put(40 + c * cw + 5, 145 + r * rh + 30 + j * 13, t, 10.5, cw - 8))); }); }
    return s;
  });
  add("month-over", "Month overview", "monthly", (k) => k.title("Month", "overview") + k.field(40, 132, 250, "Month") + k.field(310, 132, 250, "Year") + k.bar(40, 150, 330, "Calendar", 0) + k.cal(40, 174, 330, 210, k.yr, k.mo, 0) + k.bar(390, 150, 170, "Important dates", 1) + k.lines(390, 194, 170, 8) + k.bar(40, 404, 330, "To do", 2) + k.checks(40, 448, 330, 14) + k.bar(390, 404, 170, "Notes", 3) + k.lines(390, 448, 170, 14));
  add("month-rev", "Monthly review", "monthly", (k) => k.title("Monthly", "review") + k.field(40, 132, 250, "Month") + k.field(310, 132, 250, "Year") + k.bar(40, 150, 250, "How was my month?", 0) + k.panel(40, 170, 250, 90, 0) + k.bar(310, 150, 250, "Lessons learned", 2) + k.frame(310, 170, 250, 90) + k.nums(318, 196, 234, 3, 26) + block(k, 40, 280, 250, 160, "Accomplishments", 2, "lines") + block(k, 310, 280, 250, 160, "I'm grateful for", 2, "lines") + block(k, 40, 460, 250, 160, "What did I do well?", 2, "lines") + block(k, 310, 460, 250, 160, "What can I improve?", 2, "lines") + k.lab(40, 650, "Goals for next month") + k.checks(40, 676, 250, 6, 26, "s") + k.lab(310, 650, "Notes:") + k.panel(310, 660, 250, 160, 4));

  /* Yearly */
  add("year-over1", "Year overview · blocks", "yearly", (k) => { let s = k.title("Year", "overview") + k.field(40, 132, 200, "Year"); MON.forEach((m, i) => { const x = 40 + (i % 3) * 176, y = 150 + Math.floor(i / 3) * 168; s += k.panel(x, y, 168, 160, i) + k.lab(x + 8, y + 16, m); }); return s; });
  add("year-over2", "Year overview · lined", "yearly", (k) => { let s = k.title("Year", "overview") + k.field(40, 132, 200, "Year"); MON.forEach((m, i) => { const x = 40 + (i % 3) * 176, y = 150 + Math.floor(i / 3) * 168; s += k.bar(x, y, 168, m, i) + k.lines(x, y + 43, 168, 5); }); return s; });
  add("yearly-pl", "Yearly planner", "yearly", (k) => { let s = k.title("Yearly", "planner"); MON.slice(0, 12).forEach((m, i) => { const x = 40 + (i % 3) * 176, y = 124 + Math.floor(i / 3) * 176; s += k.bar(x, y, 168, m, i); }); return s; });
  add("quarterly", "Quarterly planner", "yearly", (k) => { let s = k.title("Quarterly", "planner"); [0, 1].forEach((q) => { const y = 124 + q * 350, qq = Math.floor(k.mo / 3) + q; s += k.bar(40, y, 520, `Quarter ${(qq % 4) + 1}`, q * 2 + 1, "start"); for (let j = 0; j < 3; j++) { const mi = ((qq % 4) * 3 + j) % 12; s += k.panel(40 + j * 176, y + 26, 168, 150, q * 2) + k.lab(48 + j * 176, y + 42, MON[mi]); } s += k.checks(40, y + 214, 520, 4, 26, "s"); }); return s; });
  add("year-cal", "Year calendar", "yearly", (k) => { let s = `<text x="40" y="96" font-family="Manrope,sans-serif" font-size="22" letter-spacing="4" font-weight="700" fill="${k.ink}">${k.yr}</text>`; for (let i = 0; i < 12; i++) s += k.mini(40 + (i % 3) * 176, 120 + Math.floor(i / 3) * 176, 166, k.yr, i, i); return s; });
  add("imp-dates", "Important dates", "yearly", (k) => { let s = k.title("Important", "dates"); [0, 1].forEach((h) => { const y = 124 + h * 350; for (let j = 0; j < 6; j++) { const x = 40 + j * 86.6; s += k.bar(x + 1, y, 84.6, MON[h * 6 + j].slice(0, 3), j); if (j) s += k.L(x, y + 17, x, y + 340, k.ln); } }); return s; });
  add("birthdays", "Birthdays", "yearly", (k) => { let s = k.title("Birthdays"); MON.forEach((m, i) => { const x = 40 + (i % 3) * 176, y = 124 + Math.floor(i / 3) * 176; s += k.bar(x, y, 168, m, i, "start") + k.lines(x, y + 43, 168, 5); if (i % 3) s += k.L(x - 4, y, x - 4, y + 166, k.ln); }); return s; });
  add("year-check", "Yearly checklist", "yearly", (k) => { let s = k.title("Yearly", "checklist"); MON.forEach((m, i) => { const x = 40 + (i % 3) * 176, y = 124 + Math.floor(i / 3) * 176; s += k.bar(x, y, 168, m, i) + k.checks(x, y + 43, 168, 5); }); return s; });

  /* Goals */
  add("goal1", "Goal planner · 3 goals", "goals", (k) => { let s = k.title("Goal", "planner"); for (let i = 0; i < 3; i++) { const y = 124 + i * 232; s += k.bar(40, y, 230, "Goal", i * 2) + k.bar(290, y, 270, "Action steps", i * 2) + k.frame(40, y + 20, 230, 150) + k.checks(290, y + 50, 270, 5) + k.bar(40, y + 186, 520, "Deadline:", i * 2, "start"); } return s; });
  add("goal2", "Goal planner · one goal", "goals", (k) => k.title("Goal", "planner") + k.field(40, 132, 520, "Date") + k.lab(40, 160, "My goal") + k.panel(40, 168, 255, 140, 2) + k.lab(305, 160, "Why") + k.panel(305, 168, 255, 140, 3) + k.table(40, 330, 520, [["Action steps", 0.75], ["Deadline", 0.25]], 12, 26, 0) + k.R(40, 680, 520, 140, k.fill(1), "none", 0, 3) + k.lab(48, 698, "Notes:"));
  add("goal3", "Goals · life areas", "goals", (k) => { let s = k.title("Goal", "planner"); [["Career", "Education"], ["Financial", "Personal"], ["Family", "Others"]].forEach((p, r) => p.forEach((t, c) => (s += block(k, 40 + c * 270, 124 + r * 232, 250, 210, t, r * 2 + c, "checks", 6)))); return s; });
  add("goal4", "Vision · 1 to 5 years", "goals", (k) => { let s = k.title("Goal", "planner") + k.table(40, 124, 520, [["Year", 0.2], ["Vision", 0.4], ["Action steps", 0.4]], 5, 136, 0); for (let i = 0; i < 5; i++) { const y = 141 + i * 136; s = (i % 2 ? "" : k.R(40, y, 520, 136, k.fill(i), "none", 0, 0)) + s + k.T(52, y + 70, `${i + 1} YEAR${i ? "S" : ""}`, 8.6, "start", k.sub, "Manrope", 700, 1); } return s; });
  add("biz-goals", "Business goals", "goals", (k) => { let s = k.title("Business", "goals") + k.field(40, 132, 520, "Year"); ["3 month plan", "6 month plan", "9 month plan", "12 month plan"].forEach((t, i) => { const y = 150 + i * 130; s += k.lab(40, y + 30, t) + k.L(40, y + 130, 560, y + 130, k.ln2); }); return s + k.L(150, 150, 150, 670, k.ln2) + k.bar(40, 690, 520, "Notes", 0) + k.dots(46, 720, 508, 100, 18); });
  add("fin-goals", "Finance goals", "goals", (k) => { let s = k.title("Finance", "goals") + k.table(40, 124, 520, [["Goal", 0.28], ["Strategy", 0.36], ["Date of accomplishment", 0.36]], 26, 26, 1); for (let i = 1; i < 4; i++) s += k.L(40, 141 + i * 26 * 6.5, 186, 141 + i * 26 * 6.5, k.ln2); return s; });
  add("future-goals", "Future goals", "goals", (k) => { let s = k.title("Future", "goals") + k.table(40, 124, 520, [["Time", 0.2], ["Goals", 0.4], ["Actions", 0.4]], 5, 136, 1); ["3 months", "6 months", "9 months", "1 year", "2 years"].forEach((t, i) => (s += k.T(92, 141 + i * 136 + 70, t.toUpperCase(), 8.6, "middle", k.sub, "Manrope", 700, 1))); return s; });

  /* Wellness */
  add("habit1", "Habit tracker · 3 habits", "wellness", (k) => { let s = k.title("Habit", "tracker") + k.field(40, 132, 520, "Month"); for (let i = 0; i < 3; i++) { const y = 150 + i * 226; s += k.panel(40, y, 250, 170, i * 2) + k.lab(48, y + 16, "Habit:") + k.bar(40, y + 178, 250, "Goal:", i * 2, "start"); for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) s += k.sq(312 + c * 35, y + 4 + r * 38, 20); } return s; });
  add("habit2", "Habit tracker · 6 habits", "wellness", (k) => { let s = k.title("Habit", "tracker"); for (let i = 0; i < 6; i++) { const x = 40 + (i % 2) * 270, y = 124 + Math.floor(i / 2) * 232; s += k.bar(x, y, 250, "Habit:", i, "start"); "MTWTFSS".split("").forEach((d, c) => { s += k.T(x + 18 + c * 35, y + 38, d, 8, "middle", k.sub, "Manrope", 700, 0); for (let r = 0; r < 6; r++) s += k.circ(x + 18 + c * 35, y + 54 + r * 28, 8); }); }
    const f = k.F; if (f && f.habits) f.habits.forEach((h, i) => { const x = 40 + (i % 2) * 270, y = 124 + Math.floor(i / 2) * 232; s += k.put(x + 52, y + 13, h.name, 12, 190); h.marks.forEach(([r, c, v]) => { if (r < 6) s += `<circle cx="${x + 18 + c * 35}" cy="${y + 54 + r * 28}" r="${v === "d" ? 6.5 : 3.5}" fill="${k.dark ? "#9FD3B6" : "#5FA27F"}"/>`; }); });
    return s; });
  add("water", "Water tracker", "wellness", (k) => { let s = k.title("Water", "tracker") + k.bar(40, 124, 330, "Month:", 4, "start") + k.bar(390, 124, 170, "Notes", 1) + k.lines(390, 168, 170, 25); for (let d = 0; d < 31; d++) { const y = 152 + d * 21.4; s += k.T(52, y + 14, String(d + 1), 8, "middle", k.sub, "Manrope", 700, 0); for (let c = 0; c < 8; c++) s += k.R(70 + c * 37.5, y + 2, 34, 17, c < F(k, "water", {})[d + 1] ? (k.dark ? "rgba(120,180,255,.5)" : "#BFDDF5") : "none", k.ln, 0.9, 2); } return s; });
  add("sleep", "Sleep tracker", "wellness", (k) => { let s = k.title("Sleep", "tracker") + k.field(40, 132, 330, "Month") + k.bar(40, 150, 40, "Day", 0) + k.bar(82, 150, 288, "Hours", 1) + k.bar(390, 150, 170, "Notes", 2) + k.lines(390, 194, 170, 24); for (let h = 0; h < 12; h++) s += k.T(94 + h * 24, 182, String(h + 1), 7.5, "middle", k.sub, "Manrope", 700, 0); for (let d = 0; d < 31; d++) { const y = 188 + d * 20.2; const hrs = Math.min(12, Math.round(F(k, "sleep", {})[d + 1] || 0)); s += k.T(60, y + 14, String(d + 1), 8, "middle", k.sub, "Manrope", 700, 0) + (hrs ? k.R(82, y + 2, hrs * 24, 17, k.dark ? "rgba(190,160,255,.45)" : "#DCD3F4", "none", 0, 0) : "") + k.grid(82, y + 2, 288, 17, 24); } return s; });
  add("mood-month", "Mood tracker · month", "wellness", (k) => { let s = k.title("Mood", "tracker") + k.bar(40, 124, 520, `Month: ${MON[k.mo]} ${k.yr}`, 0, "start"); const mood = F(k, "mood", null); if (mood) { const first = (new Date(k.yr, k.mo, 1).getDay() + 6) % 7, rows = Math.ceil((first + new Date(k.yr, k.mo + 1, 0).getDate()) / 7), rh = (430 - 21) / rows, cw = 520 / 7; Object.entries(mood).forEach(([d, c]) => { const p = +d - 1 + first; s += k.R(40 + (p % 7) * cw + 1.5, 171 + Math.floor(p / 7) * rh + 1.5, cw - 3, rh - 3, c, "none", 0, 2); }); } s += k.cal(40, 150, 520, 430, k.yr, k.mo, 0); const key = F(k, "key", null); s += k.bar(40, 600, 240, "Colour key", 3) + (key ? key.slice(0, 8).map(([t, c], i) => k.R(48, 628 + i * 24, 30, 18, c, k.ln2, 1, 4) + k.T(90, 641 + i * 24, t[0].toUpperCase() + t.slice(1), 10, "start", k.ink, "Manrope", 500, 0)).join("") : ["Great", "Good", "Okay", "Low", "Rough"].map((t, i) => k.R(48, 634 + i * 34, 30, 22, k.fill(i + 1), k.ln2, 1, 4) + k.T(90, 650 + i * 34, t, 10, "start", k.ink, "Manrope", 500, 0)).join("")); return s + k.bar(300, 600, 260, "Notes", 4) + k.lines(300, 644, 260, 7); });
  add("mood-year", "Mood tracker · year", "wellness", (k) => { let s = k.title("Mood", "tracker") + k.field(40, 132, 330, "Year") + k.bar(40, 150, 30, "Day", 0) + k.bar(72, 150, 288, "Months", 1); "JFMAMJJASOND".split("").forEach((m, i) => (s += k.T(84 + i * 24, 182, m, 7.5, "middle", k.sub, "Manrope", 700, 0))); for (let d = 0; d < 31; d++) { const y = 188 + d * 20.2; s += k.T(56, y + 14, String(d + 1), 8, "middle", k.sub, "Manrope", 700, 0) + k.grid(72, y + 2, 288, 17, 24); } return s + k.bar(380, 150, 180, "Colour key", 3) + ["Great", "Good", "Okay", "Low", "Rough"].map((t, i) => k.R(388, 182 + i * 32, 26, 20, k.fill(i + 1), k.ln2, 1, 4) + k.T(424, 196 + i * 32, t, 10, "start", k.ink, "Manrope", 500, 0)).join("") + k.bar(380, 380, 180, "Notes", 4) + k.lines(380, 424, 180, 15); });
  add("one-line", "One line a day", "wellness", (k) => { let s = k.title("One line", "a day") + k.bar(40, 124, 520, `Month: ${MON[k.mo]}`, 5, "start"); const days = new Date(k.yr, k.mo + 1, 0).getDate(); for (let d = 0; d < days; d++) { const y = 150 + d * 21.6; if (d % 4 === 3) s += k.R(40, y + 2, 520, 19, k.fill(d), "none", 0, 2); s += k.T(46, y + 15, String(d + 1), 8, "start", k.sub, "Manrope", 700, 0) + k.L(40, y + 21, 560, y + 21, k.ln); } return s; });
  add("meal1", "Meal plan · week", "wellness", (k) => { let s = k.title("Meal", "plan") + k.field(40, 132, 260, "Week of") + k.bar(80, 150, 480, "", 0); ["Breakfast", "Lunch", "Dinner"].forEach((t, i) => (s += k.T(80 + 80 + i * 160, 162, t.toUpperCase(), 8, "middle", k.sub, "Manrope", 700, 1))); DAYS7.forEach((d, i) => { const y = 172 + i * 92; s += k.R(40, y, 32, 86, k.fill(i), "none", 0, 3) + `<text x="56" y="${y + 43}" font-family="Manrope" font-size="8" font-weight="700" letter-spacing="1" fill="${k.sub}" text-anchor="middle" transform="rotate(-90 56 ${y + 43})">${d.slice(0, 3).toUpperCase()}</text>`; for (let c = 0; c < 3; c++) s += k.frame(82 + c * 160, y, 154, 86, 3); }); return s; });
  add("meal2", "Meal plan + grocery", "wellness", (k) => { let s = k.title("Meal", "plan") + k.bar(40, 124, 520, "Week of:", 5, "start"); DAYS7.forEach((d, i) => (s += k.panel(40, 152 + i * 96, 250, 88, i) + k.lab(48, 168 + i * 96, d.slice(0, 3)))); [["Produce", "Dry goods"], ["Dairy", "Meat"], ["Frozen", "Misc."]].forEach((p, r) => p.forEach((t, c) => (s += k.bar(306 + c * 130, 152 + r * 224, 124, t, 5) + k.lines(306 + c * 130, 196 + r * 224, 124, 7)))); return s; });
  add("food-log", "Food log", "wellness", (k) => { let s = k.title("Food", "log") + k.bar(40, 124, 520, "Week of:", 0, "start") + k.table(78, 150, 482, [["Breakfast", 1], ["Lunch", 1], ["Dinner", 1], ["Snacks", 1]], 7, 95, 0, { box: true }); DAYS7.forEach((d, i) => (s += k.R(40, 168 + i * 95, 34, 93, k.fill(i), "none", 0, 2) + `<text x="57" y="${214 + i * 95}" font-family="Manrope" font-size="8" font-weight="700" letter-spacing="1" fill="${k.sub}" text-anchor="middle" transform="rotate(-90 57 ${214 + i * 95})">${d.slice(0, 3).toUpperCase()}</text>`)); return s; });

  /* Health (private) */
  const log = (t1, t2, cols, i) => (k) => k.title(t1, t2) + k.table(40, 124, 520, cols, 26, 26, i, { box: true });
  add("sugar", "Sugar log", "health", log("Sugar", "log", [["Date / time", 0.24], ["Reading", 0.2], ["Activity", 0.26], ["Notes", 0.3]], 2));
  add("bp", "Blood pressure log", "health", log("Blood pressure", "log", [["Date", 0.18], ["Time", 0.14], ["BP", 0.16], ["Pulse", 0.14], ["Activity / notes", 0.38]], 1));
  add("doctor", "Visits to the doctor", "health", log("Doctor", "visits", [["Date", 0.16], ["Reason", 0.26], ["Doctor", 0.2], ["Result", 0.2], ["Follow up", 0.18]], 0));

  /* Money */
  add("income", "Income tracker", "money", (k) => k.title("Income", "tracker") + k.field(40, 132, 520, "Month") + k.table(40, 150, 520, [["Date", 0.16], ["Source", 0.26], ["Description", 0.38], ["Total", 0.2]], 25, 26, 4, { box: true }));
  add("savings", "Savings tracker", "money", (k) => k.title("Savings", "tracker") + k.field(40, 132, 250, "Saving for") + k.field(310, 132, 250, "Goal amount") + k.table(40, 150, 520, [["Date", 0.2], ["Amount", 0.45], ["Total balance", 0.35]], 25, 26, 4, { box: true }));
  add("expense1", "Expense tracker", "money", (k) => k.title("Expense", "tracker") + k.field(40, 132, 520, "Month") + k.table(40, 150, 520, [["Date", 0.15], ["Description", 0.45], ["Income", 0.2], ["Expense", 0.2]], 24, 26, 4, { box: true }) + k.bar(40, 800, 520, "Total income:            Total expense:            Balance:", 4, "start"));
  add("expense2", "Expenses by category", "money", (k) => { let s = k.title("Expense", "tracker") + k.field(40, 132, 520, "Month"); for (let i = 0; i < 3; i++) { const y = 150 + i * 226; s += k.field(40, y + 12, 260, "Category") + k.table(40, y + 20, 520, [["Date", 0.15], ["Description", 0.5], ["Card / cash", 0.17], ["Amount", 0.18]], 6, 24, 4) + k.bar(40, y + 186, 520, "Total:", 4, "start"); } return s; });
  add("trip-exp", "Trip expenses", "money", (k) => k.title("Trip", "expenses") + k.field(40, 132, 300, "Destination") + k.field(360, 132, 200, "Budget") + k.field(40, 158, 520, "Dates") + k.table(40, 176, 520, [["Date", 0.14], ["Item", 0.22], ["Description", 0.34], ["Amount", 0.15], ["Balance", 0.15]], 24, 26, 1, { zebra: true }));

  /* Home */
  add("grocery1", "Grocery list · blocks", "home", (k) => { let s = k.title("Grocery", "list"); ["Fresh produce", "Dairy", "Meat & deli", "Toiletries", "Frozen", "Miscellaneous"].forEach((t, i) => { const x = 40 + (i % 3) * 176, y = 124 + Math.floor(i / 3) * 350; s += k.panel(x, y, 168, 340, 1) + k.lab(x + 84, y + 16, t, "middle") + k.lines(x + 8, y + 50, 152, 11); }); return s; });
  add("grocery2", "Grocery list · checklist", "home", (k) => { let s = k.title("Grocery", "list"); ["Fresh produce", "Dairy", "Meat & deli", "Toiletries", "Frozen", "Miscellaneous"].forEach((t, i) => { const x = 40 + (i % 3) * 176, y = 124 + Math.floor(i / 3) * 350; s += k.bar(x, y, 168, t, i) + k.checks(x, y + 46, 168, 11); }); return s; });
  add("cleaning", "Cleaning checklist", "home", (k) => { let s = k.title("Cleaning", "checklist") + k.field(40, 132, 160, "Date") + k.field(215, 132, 170, "Room") + k.field(400, 132, 160, "Time") + k.bar(40, 150, 330, "Task", 0) + k.bar(372, 150, 188, "M  T  W  T  F  S  S", 0); for (let r = 0; r < 25; r++) { const y = 167 + (r + 1) * 26; s += k.L(40, y, 370, y, k.ln); for (let c = 0; c < 7; c++) s += k.circ(384 + c * 26.5, y - 12, 4.5); } return s; });
  add("todo-check", "Recurring to-do", "home", (k) => k.title("To do", "checklist") + k.table(40, 124, 520, [["List", 0.5], ["Last done", 0.25], ["Next due", 0.25]], 26, 26, 0, { zebra: true }));
  add("event", "Event planner", "home", (k) => { let s = k.title("Event", "planner") + k.field(40, 132, 250, "Date") + k.field(310, 132, 250, "Occasion") + k.bar(40, 150, 250, "Guests", 0) + k.T(286, 162, "Y / N", 8, "end", k.sub, "Manrope", 700, 0); for (let r = 0; r < 12; r++) { const y = 194 + r * 26; s += k.L(40, y, 250, y, k.ln) + k.circ(262, y - 6, 4) + k.circ(280, y - 6, 4); } return s + k.bar(310, 150, 250, "Menu", 1) + k.panel(310, 170, 250, 330, 1) + k.bar(40, 520, 250, "Notes", 2) + k.panel(40, 540, 250, 280, 2) + k.bar(310, 520, 250, "To do", 3) + k.checks(310, 564, 250, 10); });
  add("shopping", "Online shopping", "home", (k) => k.title("Online", "shopping") + k.table(40, 124, 520, [["Date", 0.14], ["Site", 0.18], ["Product", 0.3], ["Cost", 0.12], ["Shipped", 0.13], ["Received", 0.13]], 26, 26, 2, { zebra: true }));

  /* Travel */
  add("travel-plan", "Travel plan", "travel", (k) => k.title("Travel", "plan") + k.field(40, 132, 300, "Destination") + k.field(360, 132, 200, "Transport") + k.field(40, 158, 200, "From") + k.field(250, 158, 140, "To") + k.field(400, 158, 160, "Dates") + k.lab(40, 190, "Travel details") + k.panel(40, 198, 520, 180, 5) + block(k, 40, 396, 250, 210, "Packing checklist", 5, "checks") + block(k, 310, 396, 250, 210, "To check before leaving", 5, "checks") + block(k, 40, 620, 250, 200, "Travel activities", 5, "checks") + k.lab(310, 636, "Notes") + k.panel(310, 644, 250, 176, 5));
  add("travel-todo", "Travel to-do list", "travel", (k) => k.title("Travel", "to do") + k.field(40, 132, 520, "Date") + block(k, 40, 150, 250, 330, "Places to see", 1, "checks") + block(k, 310, 150, 250, 330, "Where to eat", 2, "checks") + block(k, 40, 500, 250, 320, "Things to buy", 3, "checks") + k.lab(310, 516, "Notes") + k.panel(310, 524, 250, 296, 4));
  add("itin-day", "Daily itinerary", "travel", (k) => { let s = k.title("Daily", "itinerary") + k.bar(40, 124, 520, "Day:                    Date:                    Start city:", 5, "start") + k.panel(40, 152, 250, 210, 5) + k.lab(165, 170, "Accommodation", "middle") + k.field(48, 208, 234, "Name") + k.field(48, 236, 234, "Address") + k.field(48, 290, 234, "Phone") + k.field(48, 318, 110, "Check in") + k.field(166, 318, 116, "Check out") + k.lab(40, 386, "Things to see") + k.checks(40, 412, 250, 6); ["Breakfast", "Lunch", "Dinner", "Snacks"].forEach((t, i) => (s += k.lab(40, 584 + i * 62, t) + k.L(40, 610 + i * 62, 290, 610 + i * 62, k.ln) + k.L(40, 634 + i * 62, 290, 634 + i * 62, k.ln))); s += k.lab(310, 170, "Weather") + ["☀", "⛅", "☁", "☂", "❄"].map((w, i) => k.T(330 + i * 48, 200, w, 18, "middle", k.sub, "Manrope", 400, 0)).join("") + k.lab(310, 236, "Schedule"); for (let h = 0; h < 22; h++) s += k.T(310, 262 + h * 26 - 4, `${(6 + h) % 24}:00`, 7.5, "start", k.sub, "Manrope", 600, 0) + k.L(340, 262 + h * 26, 560, 262 + h * 26, k.ln); return s; });
  add("itin-week", "Weekly itinerary", "travel", (k) => { let s = k.title("Weekly", "itinerary") + k.field(40, 132, 520, "Week") + k.lab(40, 160, "Activities") + k.panel(40, 168, 520, 120, 1); ["Monday", "Tuesday", "Wednesday", "Thursday"].forEach((d, i) => (s += k.lab(40 + i * 132, 316, d) + k.L(40 + i * 132, 322, 164 + i * 132, 322, k.ln2) + k.lines(40 + i * 132, 348, 124, 9))); ["Friday", "Saturday", "Sunday", "Notes"].forEach((d, i) => (s += k.lab(40 + i * 132, 576, d) + k.L(40 + i * 132, 582, 164 + i * 132, 582, k.ln2) + k.lines(40 + i * 132, 608, 124, 8))); return s; });

  /* Work & essentials */
  add("eisen", "Eisenhower matrix", "work", (k) => {
    let s = k.title("Eisenhower", "matrix") + k.field(380, 132, 180, "Date");
    const Q = [["Urgent – important", 40, 150], ["Not urgent – important", 310, 150], ["Urgent – not important", 40, 450], ["Not urgent – not important", 310, 450]];
    Q.forEach(([t, x, y], i) => (s += k.bar(x, y, 250, t, i) + k.frame(x, y + 17, 250, 266) + k.lines(x + 6, y + 43, 238, 9)));
    s += k.bar(40, 742, 520, "Notes", 4, "start") + k.lines(40, 784, 520, 2);
    const f = k.F; if (f && f.q) f.q.forEach((items, i) => (items || []).slice(0, 10).forEach((t, j) => (s += k.put(Q[i][1] + 10, Q[i][2] + 39 + j * 26, t, 12.5, 230))));
    return s;
  });
  add("mindmap2", "Mind map · boxes", "notes", (k) => { let s = k.title("Mind", "map") + k.field(40, 132, 520, "Project"); const B = [[40, 300], [214, 300], [388, 300], [40, 396], [388, 396], [40, 600], [214, 600], [388, 600]]; s += k.panel(214, 380, 172, 200, 0); B.forEach(([x, y], i) => { s += k.frame(x, y, 172, 70, 3); s += k.L(x + 86, y + (y < 380 ? 70 : 0), 300, y < 380 ? 380 : y > 580 ? 580 : 480, k.ln2); }); [[40, 170], [214, 170], [388, 170], [40, 690], [214, 690], [388, 690]].forEach(([x, y]) => (s += k.checks(x, y, 172, 4, 26, "s"))); return s; });
  add("minutes", "Meeting minutes", "work", (k) => { let s = k.title("Meeting", "minutes") + k.field(40, 132, 300, "Topic") + k.field(360, 132, 200, "Date / time") + k.bar(40, 150, 160, "Attendees", 0) + k.bar(205, 150, 355, "Agenda", 0) + k.L(202, 167, 202, 340, k.ln2) + k.lines(40, 193, 160, 6) + k.checks(205, 193, 355, 6) + k.bar(40, 350, 520, "Meeting notes", 1, "start") + k.lines(40, 394, 520, 11) + k.table(40, 680, 520, [["Action", 0.55], ["Responsible", 0.25], ["Due date", 0.2]], 5, 26, 2); for (let r = 0; r < 5; r++) s += k.circ(50, 697 + r * 26 + 13, 4); return s; });
  add("task-tracker", "Task tracker", "work", (k) => { let s = k.title("Task", "tracker") + k.field(40, 132, 520, "Month"); for (let i = 0; i < 3; i++) { const y = 150 + i * 224; s += k.L(40, y, 560, y, k.ln2, 1.2) + k.lab(40, y + 18, "Task:") + k.lab(40, y + 110, "Goal:") + k.L(286, y, 286, y + 216, k.ln2); for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) s += k.sq(300 + c * 37, y + 16 + r * 40, 22); } return s + k.L(40, 822, 560, 822, k.ln2, 1.2); });
  add("task-list", "Task list", "work", (k) => { let s = k.title("Task", "list") + k.field(40, 132, 520, "Date") + k.L(40, 146, 560, 146, k.ln2, 1.2); for (let r = 0; r < 26; r++) { const y = 172 + r * 25.5; s += k.sq(44, y - 13, 10) + k.L(40, y, 560, y, k.ln); } return s + k.L(440, 146, 440, 835, k.ln) + k.L(500, 146, 500, 835, k.ln); });
  add("ideas", "Ideas", "notes", (k) => k.title("Ideas") + k.lines(40, 140, 520, 27));
  add("notes-r", "Notes · ruled", "notes", (k) => k.title("Notes") + k.lines(40, 140, 520, 27));
  add("notes-d", "Notes · dashed", "notes", (k) => k.title("Notes") + k.dlines(40, 140, 520, 27));
  add("braindump2", "Brain dump · dots", "notes", (k) => k.title("Brain", "dump") + k.dots(40, 136, 520, 684, 22));
  add("swot2", "SWOT analysis · classic", "work", (k) => k.title("SWOT", "analysis") + k.field(40, 132, 520, "Project") + k.lab(40, 160, "Strengths") + k.lab(560, 160, "Weaknesses", "end") + k.lab(40, 470, "Opportunities") + k.lab(560, 470, "Threats", "end") + k.L(300, 150, 300, 720, k.ln2) + k.L(40, 450, 560, 450, k.ln2) + `<circle cx="300" cy="450" r="26" fill="${k.dark ? "#1F2536" : "#fff"}" stroke="${k.ln2}"/>` + k.T(300, 446, "S  W", 9, "middle", k.ink, "Manrope", 800, 1) + k.T(300, 462, "O  T", 9, "middle", k.ink, "Manrope", 800, 1) + k.bar(40, 734, 520, "Notes", 0) + k.dots(46, 764, 508, 56, 18));
  add("inventory", "Inventory list", "work", (k) => k.title("Inventory", "list") + k.field(40, 132, 520, "Date") + k.field(40, 158, 520, "Location") + k.table(40, 176, 520, [["Item", 0.14], ["Product name", 0.4], ["Quantity", 0.18], ["Purchase price", 0.28]], 24, 26, 0, { box: true }));

  /* Lists */
  add("check-o", "Checklist · circles", "lists", (k) => k.checks(40, 110, 520, 28, 26));
  add("check-2", "Checklist · 2 columns", "lists", (k) => k.checks(40, 110, 250, 28, 26, "s") + k.checks(310, 110, 250, 28, 26, "s"));
  add("check-2g", "Checklist · 2 columns, grouped", "lists", (k) => k.checks(40, 110, 250, 12, 26, "s") + k.checks(310, 110, 250, 12, 26, "s") + k.checks(40, 460, 250, 14, 26, "s") + k.checks(310, 460, 250, 14, 26, "s"));

  /* Graphs & music (these stretch to any page size) */
  add("g-fine", "Graph paper · fine", "graphs", (k) => k.grid(30, 30, 540, Math.floor((k.H - 60) / 6) * 6, 6, k.dark ? "rgba(140,220,170,.25)" : "rgba(60,150,90,.25)"), true);
  add("g-eng1", "Engineering · 5 squares", "graphs", (k) => { const h = Math.floor((k.H - 60) / 12) * 12; return k.grid(30, 30, 540, h, 12, k.ln) + k.grid(30, 30, 540, h, 60, k.ln2); }, true);
  add("g-eng2", "Engineering · 10 squares", "graphs", (k) => { const h = Math.floor((k.H - 60) / 9) * 9; return k.grid(30, 30, 540, h, 9, k.ln) + k.grid(30, 30, 540, h, 90, k.ln2); }, true);
  add("g-polar", "Polar graph", "graphs", (k) => { const cx = 300, cy = k.H / 2, R = Math.min(270, k.H / 2 - 30); let s = ""; for (let r = 1; r <= 10; r++) s += `<circle cx="${cx}" cy="${cy}" r="${(R * r) / 10}" fill="none" stroke="${r % 5 ? k.ln : k.ln2}"/>`; for (let a = 0; a < 360; a += 10) { const t = (a * Math.PI) / 180; s += k.L(cx, cy, cx + R * Math.cos(t), cy + R * Math.sin(t), a % 30 ? k.ln : k.ln2, 0.8); } return s; }, true);
  add("g-golden", "Golden ratio", "graphs", (k) => { const PHI = 1.6180339; let h = Math.min(k.H - 80, 520 * PHI), w = h / PHI, x = 300 - w / 2, y = (k.H - h) / 2, s = k.frame(x, y, w, h), arc = ""; for (let i = 0; i < 10 && w > 3 && h > 3; i++) { const d = i % 4; if (d === 0) { s += k.L(x, y + w, x + w, y + w, k.ln2); arc += `M${x} ${y + w}A${w} ${w} 0 0 1 ${x + w} ${y}`; y += w; h -= w; } else if (d === 1) { s += k.L(x + w - h, y, x + w - h, y + h, k.ln2); arc += `M${x + w} ${y}A${h} ${h} 0 0 1 ${x + w - h} ${y + h}`; w -= h; } else if (d === 2) { s += k.L(x, y + h - w, x + w, y + h - w, k.ln2); arc += `M${x + w} ${y + h}A${w} ${w} 0 0 1 ${x} ${y + h - w}`; h -= w; } else { s += k.L(x + h, y, x + h, y + h, k.ln2); arc += `M${x} ${y + h}A${h} ${h} 0 0 1 ${x + h} ${y}`; x += h; w -= h; } } return s + `<path d="${arc}" fill="none" stroke="${k.ln2}" stroke-width="1"/>`; }, true);
  add("guitar", "Guitar tab", "music", (k) => { let s = ""; const n = Math.floor((k.H - 60) / 96); for (let i = 0; i < n; i++) { const y = 50 + i * 96; for (let j = 0; j < 6; j++) s += k.L(40, y + j * 10, 560, y + j * 10, k.ln2, 0.8); s += k.T(46, y + 30, "TAB", 9, "start", k.sub, "Manrope", 800, 1); } return s; }, true);
  add("grand", "Grand staff", "music", (k) => { let s = ""; const n = Math.floor((k.H - 60) / 150); for (let i = 0; i < n; i++) { const y = 50 + i * 150; for (let j = 0; j < 5; j++) s += k.L(50, y + j * 9, 560, y + j * 9, k.ln2, 0.8) + k.L(50, y + 70 + j * 9, 560, y + 70 + j * 9, k.ln2, 0.8); s += k.L(50, y, 50, y + 106, k.ln2, 1.2) + `<path d="M46 ${y}q-14 26 0 53q-14 27 0 53" fill="none" stroke="${k.ln2}" stroke-width="2"/>`; } return s; }, true);
  add("music12", "Music · 12 staves", "music", (k) => { let s = ""; const n = Math.floor((k.H - 60) / 64); for (let i = 0; i < n; i++) for (let j = 0; j < 5; j++) s += k.L(40, 50 + i * 64 + j * 7, 560, 50 + i * 64 + j * 7, k.ln2, 0.7); return s; }, true);

  MP.tplKit = kit;
  MP.TPL_LOOKS = LOOKS;
  MP.TPL_NEW = L;
  MP.TPL_GROUPS = [["all", "All"], ["basic", "Basics"], ["notes", "Notes"], ["study", "Study"], ["academic", "Academic"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"], ["goals", "Goals"], ["wellness", "Wellness"], ["health", "Health"], ["money", "Money"], ["home", "Home"], ["travel", "Travel"], ["work", "Work"], ["lists", "Lists"], ["graphs", "Graphs"], ["music", "Music"], ["creative", "Creative"]];
})();
