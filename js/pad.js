/* My Planner — writing pads: S Pen / finger handwriting or keyboard typing. */
"use strict";
(function () {
  const MP = window.MP;
  const PENS = [["ball", "Ballpoint"], ["fountain", "Fountain pen"], ["pencil", "Pencil"], ["marker", "Marker"], ["hl", "Highlighter"], ["calli", "Calligraphy"]];
  const INKS = ["#26302A", "#1F3B73", "#5B765F", "#A35468", "#73639F", "#B98E68", "#C0392B", "#E2C27D"];
  const pen = (MP.pen = { type: "fountain", color: "#1F3B73", size: 3, paper: "lined", eraser: false });
  MP.inputMode = MP.pref.get("input") || (navigator.maxTouchPoints > 0 ? "pen" : "type");

  const PI = {
    ball: '<path d="M4 20l3-1 12-12-2-2L5 17z"/>', fountain: '<path d="M12 2l4 7-4 13-4-13z"/><path d="M12 9v5"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>', marker: '<path d="M5 19l2-6 8-8 4 4-8 8z"/><path d="M5 19h6"/>',
    hl: '<path d="M6 14l7-7 4 4-7 7H6z"/><path d="M4 21h10" stroke-width="4" opacity=".4"/>', calli: '<path d="M4 20c4-1 7-4 9-8l3-6 2 2-6 3c-4 2-7 5-8 9z"/>'
  };
  const svg = (p, s = 18) => `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const modeBtns = () => `<span class="seg" role="group" aria-label="Input"><button type="button" class="tool ${MP.inputMode === "pen" ? "on" : ""}" data-mode="pen" title="Write with S Pen or finger" aria-label="Write with pen">${MP.ic("penm", 18)}</button><button type="button" class="tool ${MP.inputMode === "type" ? "on" : ""}" data-mode="type" title="Type with keyboard" aria-label="Type with keyboard">${MP.ic("kbd", 18)}</button></span><span class="vsep"></span>`;

  MP.padHTML = (key, lines = 6, lineH = 46) => {
    const E = MP.esc, S = MP.S;
    if (MP.inputMode === "type") {
      const tv = (S.typed[key] && S.typed[key].l) || [];
      const hasInk = S.ink[key] && S.ink[key].s && S.ink[key].s.length;
      return `<div class="pad" data-tpad="${E(key)}"><div class="padbar noprint">${modeBtns()}<span class="tiny muted">Typing${hasInk ? " · your handwriting is kept; switch to the pen to see it" : ""}</span></div><div class="typedbox">${[...Array(lines)].map((_, i) => `<div class="tline"><span class="tiny muted">${lines > 1 ? i + 1 : ""}</span><input class="typed" data-tk="${E(key)}" data-ti="${i}" value="${E(tv[i] || "")}" maxlength="300" aria-label="Line ${i + 1}" style="min-height:${lineH - 6}px"></div>`).join("")}</div></div>`;
    }
    return `<div class="pad" data-pad="${E(key)}"><div class="padbar noprint">${modeBtns()}
      ${PENS.map((p) => `<button type="button" class="tool ${pen.type === p[0] && !pen.eraser ? "on" : ""}" data-pen="${p[0]}" title="${p[1]}" aria-label="${p[1]}">${svg(PI[p[0]])}</button>`).join("")}
      <span class="vsep"></span>
      ${INKS.map((c) => `<button type="button" class="sw ${pen.color === c ? "on" : ""}" data-ink="${c}" style="background:${c}" aria-label="Ink colour"></button>`).join("")}
      <label class="tool" title="Custom colour" style="position:relative">+<input type="color" data-inkc value="${pen.color}" aria-label="Custom colour" class="overlay-input"></label>
      <label class="tiny muted row" style="gap:6px">Size<input type="range" min="1" max="10" value="${pen.size}" data-size style="width:80px"></label>
      <button type="button" class="tool ${pen.eraser ? "on" : ""}" data-eraser aria-label="Eraser">${MP.ic("eraser", 18)}</button>
      <button type="button" class="tool" data-undo aria-label="Undo">${MP.ic("undo", 18)}</button><button type="button" class="tool" data-redo aria-label="Redo">${MP.ic("redo", 18)}</button>
      <button type="button" class="tool" data-clear aria-label="Clear page">${MP.ic("trash", 18)}</button>
      <select class="f sm" data-paper aria-label="Paper">${["lined", "dotted", "plain"].map((p) => `<option ${pen.paper === p ? "selected" : ""}>${p}</option>`).join("")}</select>
      </div><canvas class="ink" data-lines="${lines}" data-lh="${lineH}" aria-label="Writing area"></canvas></div>`;
  };

  const redo = {};
  const strokesOf = (key) => { const S = MP.S; if (!S.ink[key]) S.ink[key] = { u: 0, s: [] }; return S.ink[key].s; };
  const touchInk = (key) => { MP.S.ink[key].u = Date.now(); MP.changed(); };

  MP.setupPads = () => {
    document.querySelectorAll("[data-pad]").forEach((el) => {
      const key = el.dataset.pad, cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
      const lh = +cv.dataset.lh, lines = +cv.dataset.lines;
      const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();
      function size() { const w = cv.clientWidth || 600, dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = lines * lh * dpr; cv.style.height = lines * lh + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
      function paper() {
        const w = cv.clientWidth; ctx.fillStyle = css("--surf"); ctx.fillRect(0, 0, w, lines * lh); const lc = css("--line");
        if (pen.paper === "lined") { ctx.strokeStyle = lc; ctx.lineWidth = 1; for (let i = 1; i <= lines; i++) { ctx.beginPath(); ctx.moveTo(14, i * lh - 8); ctx.lineTo(w - 14, i * lh - 8); ctx.stroke(); } }
        if (pen.paper === "dotted") { ctx.fillStyle = lc; for (let y = lh / 2; y < lines * lh; y += 22) for (let x = 14; x < w; x += 22) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 7); ctx.fill(); } }
      }
      function stroke(s) {
        const w = cv.clientWidth, pts = s.p; if (!pts || !pts.length) return;
        ctx.save(); ctx.lineCap = s.t === "hl" ? "square" : "round"; ctx.lineJoin = "round"; ctx.strokeStyle = s.c;
        ctx.globalAlpha = s.t === "hl" ? 0.3 : s.t === "pencil" ? 0.6 : s.t === "marker" ? 0.88 : 1; if (s.t === "hl") ctx.globalCompositeOperation = "multiply";
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i]; let lw = s.z;
          if (s.t === "fountain") lw = s.z * (0.35 + (b[2] ?? 0.5) * 1.3); else if (s.t === "pencil") lw = s.z * 0.8; else if (s.t === "marker") lw = s.z * 2.4; else if (s.t === "hl") lw = s.z * 5;
          else if (s.t === "calli") { const ang = Math.atan2(b[1] - a[1], (b[0] - a[0]) * w); lw = s.z * (0.25 + 1.6 * Math.abs(Math.sin(ang - Math.PI / 4))); }
          ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a[0] * w, a[1]); ctx.lineTo(b[0] * w, b[1]); ctx.stroke();
        }
        if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0] * w, pts[0][1], s.z / 2, 0, 7); ctx.fillStyle = s.c; ctx.fill(); }
        ctx.restore();
      }
      function draw() { paper(); strokesOf(key).forEach(stroke); }
      el._draw = draw; el._size = size;
      let cur = null, lastPen = 0;
      const P = (e) => { const r = cv.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000, Math.round(e.clientY - r.top), Math.round((e.pressure || 0.5) * 100) / 100]; };
      cv.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "pen") lastPen = Date.now();
        if (e.pointerType === "touch" && Date.now() - lastPen < 3000) return; /* palm rejection while the S Pen is in use */
        cv.setPointerCapture(e.pointerId); e.preventDefault();
        if (pen.eraser) { cur = { erase: true }; erase(P(e)); return; }
        cur = { t: pen.type, c: pen.color, z: pen.size, p: [P(e)] }; redo[key] = [];
      });
      cv.addEventListener("pointermove", (e) => {
        if (!cur) return;
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        evs.forEach((ev) => { const pt = P(ev); if (cur.erase) erase(pt); else cur.p.push(pt); });
        if (!cur.erase) { draw(); stroke(cur); }
      });
      const end = () => { if (cur && !cur.erase && cur.p.length) { strokesOf(key).push(cur); touchInk(key); draw(); } cur = null; };
      cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
      function erase(pt) { const w = cv.clientWidth, arr = strokesOf(key), n = arr.length; const keep = arr.filter((s) => !s.p.some((q) => Math.hypot((q[0] - pt[0]) * w, q[1] - pt[1]) < 14)); if (keep.length !== n) { MP.S.ink[key].s = keep; touchInk(key); draw(); } }
      size();
    });
  };

  const refreshBars = () => document.querySelectorAll("[data-pad]").forEach((el) => {
    el.querySelectorAll("[data-pen]").forEach((x) => x.classList.toggle("on", x.dataset.pen === pen.type && !pen.eraser));
    el.querySelectorAll("[data-ink]").forEach((x) => x.classList.toggle("on", x.dataset.ink === pen.color));
    const er = el.querySelector("[data-eraser]"); if (er) er.classList.toggle("on", pen.eraser);
    const ps = el.querySelector("[data-paper]"); if (ps) ps.value = pen.paper;
    if (el._draw) el._draw();
  });

  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]");
    if (m) { MP.inputMode = m.dataset.mode; MP.pref.set("input", MP.inputMode); MP.render(); return; }
    const b = e.target.closest("[data-pen],[data-ink],[data-eraser],[data-undo],[data-redo],[data-clear]");
    if (!b) return;
    const pad = b.closest("[data-pad]"), key = pad && pad.dataset.pad;
    if (b.dataset.pen) { pen.type = b.dataset.pen; pen.eraser = false; }
    else if (b.dataset.ink) { pen.color = b.dataset.ink; pen.eraser = false; }
    else if (b.hasAttribute("data-eraser")) pen.eraser = !pen.eraser;
    else if (key && b.hasAttribute("data-undo")) { const s = strokesOf(key).pop(); if (s) { (redo[key] = redo[key] || []).push(s); touchInk(key); } }
    else if (key && b.hasAttribute("data-redo")) { const s = (redo[key] || []).pop(); if (s) { strokesOf(key).push(s); touchInk(key); } }
    else if (key && b.hasAttribute("data-clear")) { const arr = strokesOf(key); if (arr.length) { redo[key] = arr.slice(); MP.S.ink[key].s = []; touchInk(key); MP.toast("Page cleared · tap Redo to bring it back"); } }
    refreshBars();
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("[data-tk]")) { const k = t.dataset.tk; const S = MP.S; if (!S.typed[k]) S.typed[k] = { u: 0, l: [] }; S.typed[k].l[+t.dataset.ti] = t.value; S.typed[k].u = Date.now(); MP.changed(); }
    if (t.matches("[data-size]")) pen.size = +t.value;
    if (t.matches("[data-inkc]")) { pen.color = t.value; pen.eraser = false; refreshBars(); }
  });
  document.addEventListener("change", (e) => { if (e.target.matches("[data-paper]")) { pen.paper = e.target.value; refreshBars(); } });
  window.addEventListener("resize", () => { clearTimeout(window._mpRz); window._mpRz = setTimeout(() => document.querySelectorAll("[data-pad]").forEach((el) => el._size && el._size()), 200); });
})();
