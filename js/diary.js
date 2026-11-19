/* My Planner — Diary (1.19): bookshelf of named diaries → sections → pages.
   Each page: a theme colour/texture, a template drawn underneath, handwriting (S Pen) and typed rich text on top.
   Data: S.diaries[id] (the diary and its sections), S.dpages[id] (pages), S.ink["dp-"+pageId] (handwriting).
   Private like the Journal: covered by the journal lock, never in the Buddy feed, search or print. */
"use strict";
(function () {
  const MP = window.MP;
  const E = (s) => MP.esc(s);
  const uid = () => new Date().toISOString().slice(0, 7) + "-" + Math.random().toString(36).slice(2, 9);
  const now = () => Date.now();

  /* ---------- textures and colours ---------- */
  const KRAFT = "url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Cg fill=%27%23704a1f%27 opacity=%27.18%27%3E%3Ccircle cx=%277%27 cy=%279%27 r=%27.8%27/%3E%3Ccircle cx=%2731%27 cy=%2722%27 r=%27.6%27/%3E%3Ccircle cx=%2750%27 cy=%275%27 r=%27.9%27/%3E%3Ccircle cx=%2718%27 cy=%2744%27 r=%27.7%27/%3E%3Ccircle cx=%2744%27 cy=%2751%27 r=%27.6%27/%3E%3C/g%3E%3C/svg%3E\")";
  const TEX = {
    smooth: ["Smooth", (c) => c],
    linen: ["Linen", (c) => `repeating-linear-gradient(0deg,rgba(0,0,0,.035) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.035) 0 1px,transparent 1px 3px),${c}`],
    kraft: ["Kraft", (c) => `${KRAFT},${c}`],
    water: ["Watercolour", (c) => `radial-gradient(ellipse at 15% 85%,rgba(255,255,255,.0),transparent),radial-gradient(ellipse at 12% 88%,color-mix(in srgb,${c} 70%,#E0569A 30%),transparent 45%),radial-gradient(ellipse at 90% 8%,color-mix(in srgb,${c} 70%,#56A6E0 30%),transparent 42%),${c}`],
    parch: ["Parchment", (c) => `radial-gradient(circle at 30% 20%,rgba(255,255,255,.55),transparent 60%),radial-gradient(circle at 80% 92%,rgba(160,110,50,.2),transparent 55%),${c}`],
    canvas: ["Canvas", (c) => `repeating-linear-gradient(45deg,rgba(0,0,0,.04) 0 2px,transparent 2px 4px),repeating-linear-gradient(-45deg,rgba(0,0,0,.04) 0 2px,transparent 2px 4px),${c}`],
    marble: ["Marble", (c) => `linear-gradient(115deg,transparent 40%,rgba(140,140,165,.22) 42%,transparent 46%),linear-gradient(25deg,transparent 60%,rgba(140,140,165,.16) 62%,transparent 66%),${c}`],
    starry: ["Starry", (c) => `radial-gradient(1.2px 1.2px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 15%,#fff,transparent),radial-gradient(1.6px 1.6px at 40% 70%,#F2C94C,transparent),radial-gradient(1px 1px at 85% 60%,#fff,transparent),radial-gradient(1px 1px at 10% 85%,#fff,transparent),radial-gradient(1px 1px at 55% 45%,#fff,transparent),radial-gradient(1px 1px at 30% 52%,#fff,transparent),${c}`],
    aged: ["Aged", (c) => `radial-gradient(ellipse at center,transparent 50%,rgba(120,80,30,.28) 100%),${c}`],
    hand: ["Handmade", (c) => `radial-gradient(circle at 50% 50%,transparent 68%,rgba(0,0,0,.09) 100%),${KRAFT},${c}`],
    dots: ["Dot grid", (c) => `radial-gradient(circle,rgba(0,0,0,.2) 1px,transparent 1.4px) 0 0/22px 22px,${c}`],
    graph: ["Graph", (c) => `linear-gradient(rgba(0,0,0,.08) 1px,transparent 1px) 0 0/20px 20px,linear-gradient(90deg,rgba(0,0,0,.08) 1px,transparent 1px) 0 0/20px 20px,${c}`]
  };
  const COLS = [["Ivory", "#FFFDF6"], ["Blush", "#FFE3EC"], ["Peach", "#FFE5D2"], ["Butter", "#FFF6C7"], ["Mint", "#DDF5E6"], ["Sky", "#DDF0FB"], ["Lilac", "#ECE4FB"], ["Coral", "#FF8C7A"], ["Mango", "#FFC145"], ["Teal", "#2BB3A6"], ["Berry", "#B8336A"], ["Night", "#1E2347"]];
  const lum = (hex) => { const h = (hex || "#fff").replace("#", ""); if (h.length < 6) return 1; const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]; };
  const isDark = (c) => lum(c) < 0.42;
  const bgOf = (col, tex) => (TEX[tex] || TEX.smooth)[1](col);

  /* ---------- 20 themes: cover, page colour + texture, accent, ink ---------- */
  const TH = {
    cognac: ["Cognac leather", "linear-gradient(135deg,#8B4A24,#5E2E12)", "#F7EBD3", "parch", "#7A3E1A", "#3B2410"],
    kraft: ["Kraft & washi", `${KRAFT},#C49A63`, "#E6D0AE", "kraft", "#7A4E2A", "#3B2410"],
    rose: ["Rose garden", "radial-gradient(circle at 25% 25%,rgba(255,255,255,.35) 0 6px,transparent 7px) 0 0/34px 34px,linear-gradient(140deg,#F06A8F,#C03A6B)", "#FFE6EE", "water", "#C03A6B", "#6E1F3F"],
    botanical: ["Botanical", "radial-gradient(ellipse 8px 4px at 30% 30%,rgba(255,255,255,.2),transparent) 0 0/26px 26px,linear-gradient(140deg,#2F7D4F,#1C5234)", "#ECF5E6", "linen", "#2F7D4F", "#1C3D27"],
    midnight: ["Midnight moon", "radial-gradient(1.5px 1.5px at 20% 20%,#fff,transparent) 0 0/30px 30px,radial-gradient(1px 1px at 60% 70%,#F2C94C,transparent) 0 0/22px 22px,linear-gradient(160deg,#1B1F4B,#0B0E2A)", "#1E2347", "starry", "#F2C94C", "#F5E9C8"],
    ocean: ["Ocean breeze", "repeating-radial-gradient(circle at 0 100%,transparent 0 10px,rgba(255,255,255,.14) 10px 12px),linear-gradient(150deg,#16A3B8,#0B6E8C)", "#E3F6F8", "water", "#0B6E8C", "#073B4C"],
    sunset: ["Sunset glow", "linear-gradient(150deg,#FF9A3C,#F2546E)", "#FFF0E2", "water", "#E8574F", "#6B2416"],
    lavender: ["Lavender fields", "radial-gradient(circle,rgba(255,255,255,.35) 2px,transparent 2.5px) 0 0/16px 16px,linear-gradient(150deg,#9B7BE0,#6A4DB8)", "#F1ECFC", "linen", "#6A4DB8", "#3A2A6B"],
    mango: ["Mango summer", "radial-gradient(circle,rgba(255,255,255,.35) 2px,transparent 2.5px) 0 0/16px 16px,linear-gradient(150deg,#FFD23F,#FF9F1C)", "#FFFAE5", "graph", "#E07A00", "#5A3A00"],
    atlas: ["Vintage atlas", "repeating-linear-gradient(30deg,rgba(80,50,20,.18) 0 1px,transparent 1px 22px),repeating-linear-gradient(-60deg,rgba(80,50,20,.12) 0 1px,transparent 1px 30px),#B88A52", "#F2E3C6", "aged", "#7A5230", "#4A3018"],
    sakura: ["Sakura", "radial-gradient(circle at 30% 30%,rgba(255,255,255,.55) 0 4px,transparent 5px) 0 0/28px 28px,linear-gradient(150deg,#FBC4D4,#F49AB7)", "#FFF5F8", "smooth", "#D9577D", "#6E2140"],
    ivory: ["Ivory minimal", "#F2EFE8", "#FFFFFF", "smooth", "#2B2622", "#2B2622"],
    peacock: ["Royal peacock", "radial-gradient(ellipse 6px 10px at 50% 40%,rgba(255,215,0,.35) 0 40%,rgba(0,0,0,0) 45%) 0 0/26px 30px,linear-gradient(150deg,#0E7C86,#0A4F6B)", "#E8F6F4", "linen", "#0E7C86", "#063B44"],
    marigold: ["Marigold festive", "radial-gradient(circle,rgba(255,220,80,.45) 0 5px,transparent 6px) 0 0/30px 30px,linear-gradient(150deg,#FF8A00,#D9480F)", "#FFF4DC", "parch", "#D9480F", "#5A2A00"],
    monsoon: ["Monsoon", "repeating-linear-gradient(105deg,rgba(255,255,255,.15) 0 1px,transparent 1px 12px),linear-gradient(160deg,#5B7A99,#34506E)", "#EEF3F8", "water", "#34506E", "#1F3247"],
    galaxy: ["Galaxy", "radial-gradient(1.5px 1.5px at 20% 20%,#fff,transparent) 0 0/30px 30px,linear-gradient(140deg,#2B0F54,#7B2CBF 60%,#E056A0)", "#1C1036", "starry", "#E056A0", "#F3E8FF"],
    tropical: ["Tropical", "radial-gradient(ellipse 12px 4px at 30% 30%,rgba(255,255,255,.2),transparent) 0 0/30px 22px,linear-gradient(150deg,#1FA774,#0B7A55)", "#F0FBF4", "linen", "#0B7A55", "#0A3D2A"],
    coffee: ["Coffee house", "radial-gradient(ellipse 4px 6px,rgba(255,255,255,.15) 0 70%,transparent 75%) 0 0/24px 24px,linear-gradient(150deg,#6F4E37,#4A3022)", "#F6EDE3", "kraft", "#6F4E37", "#3B2416"],
    luxe: ["Black & gold luxe", "repeating-linear-gradient(45deg,rgba(212,175,55,.35) 0 1px,transparent 1px 18px),linear-gradient(150deg,#1A1A1A,#000)", "#FBF8F1", "smooth", "#B8902F", "#1A1A1A"],
    rainbow: ["Pastel rainbow", "linear-gradient(120deg,#FFB3C6,#FFD6A5 25%,#FDFFB6 45%,#CAFFBF 65%,#9BF6FF 82%,#BDB2FF)", "#FFFDF7", "dots", "#B565D9", "#4A2A6B"]
  };
  const PLAN2DIARY = { sage: "botanical", lavender: "lavender", beige: "ivory", blush: "rose", midnight: "midnight", ocean: "ocean" };
  const th = (id) => TH[id] || TH.ivory;

  /* ---------- page templates (drawn in a 600 × 846 box under the writing) ---------- */
  const W = 600, H = 846;
  const ln = (y0, gap, n, o, x0 = 44, x1 = 556) => { let s = ""; for (let i = 0; i < n; i++) { const y = y0 + i * gap; if (y > H - 30) break; s += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${o.l}" stroke-width="1"/>`; } return s; };
  const tx = (x, y, s, o, z = 26, f = "Caveat", anc = "start", col) => `<text x="${x}" y="${y}" font-family="${f},cursive" font-size="${z}" fill="${col || o.a}" text-anchor="${anc}" font-weight="700">${s}</text>`;
  const lb = (x, y, s, o, z = 15) => `<text x="${x}" y="${y}" font-family="Manrope,sans-serif" font-size="${z}" fill="${o.t}" font-weight="600" letter-spacing=".5">${s}</text>`;
  const bx = (x, y, w, h, o, r = 8, dash = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${o.l2}" stroke-width="1.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
  let FR = null; /* when set, photo frames are collected (they become movable items on the page) instead of drawn */
  const ph = (x, y, w, h, o, rot = 0) => FR ? (FR.push([x, y, w, h, rot]), "") : `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.d ? "rgba(255,255,255,.08)" : "#fff"}" stroke="${o.l2}"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 36}" fill="none" stroke="${o.l2}" stroke-dasharray="6 5"/><text x="${x + w / 2}" y="${y + (h - 26) / 2 + 10}" font-family="Manrope" font-size="13" fill="${o.t}" text-anchor="middle">photo</text></g>`;
  const dots = (o, gap = 30) => { let s = ""; for (let y = 90; y < H - 20; y += gap) for (let x = 40; x < W - 20; x += gap) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="${o.l2}"/>`; return s; };
  const grid = (o, g = 30) => { let s = ""; for (let y = 90; y < H - 20; y += g) s += `<line x1="30" y1="${y}" x2="${W - 30}" y2="${y}" stroke="${o.l}"/>`; for (let x = 30; x <= W - 30; x += g) s += `<line x1="${x}" y1="90" x2="${x}" y2="${H - 26}" stroke="${o.l}"/>`; return s; };
  const box = (o, n, y0 = 120, gap = 54, x = 44) => { let s = ""; for (let i = 0; i < n; i++) s += `<rect x="${x}" y="${y0 + i * gap - 20}" width="22" height="22" rx="4" fill="none" stroke="${o.a}" stroke-width="2"/><line x1="${x + 36}" y1="${y0 + i * gap + 4}" x2="556" y2="${y0 + i * gap + 4}" stroke="${o.l}"/>`; return s; };
  const TPL = [
    /* professional */
    ["lined", "Lined", "p", (o) => ln(124, 40, 19, o)],
    ["dotted", "Dotted", "p", (o) => dots(o)],
    ["grid", "Grid", "p", (o) => grid(o)],
    ["blank", "Blank", "p", () => ""],
    ["mind", "Mind map", "p", (o) => `<ellipse cx="300" cy="440" rx="90" ry="54" fill="none" stroke="${o.a}" stroke-width="3"/>${[[130, 190], [470, 190], [110, 440], [490, 440], [130, 690], [470, 690]].map(([x, y]) => `<line x1="300" y1="440" x2="${x}" y2="${y}" stroke="${o.l2}" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="78" ry="38" fill="${o.d ? "#1e2347" : "#fff"}" stroke="${o.a}" stroke-width="2"/>`).join("")}${lb(254, 446, "Main idea", o, 15)}`],
    ["cornell", "Cornell notes", "p", (o) => `${lb(44, 104, "TOPIC", o)}<line x1="44" y1="118" x2="556" y2="118" stroke="${o.a}" stroke-width="2"/><line x1="190" y1="118" x2="190" y2="660" stroke="${o.a}" stroke-width="2"/><line x1="44" y1="660" x2="556" y2="660" stroke="${o.a}" stroke-width="2"/>${lb(52, 142, "CUES", o)}${lb(204, 142, "NOTES", o)}${lb(52, 686, "SUMMARY", o)}${ln(180, 40, 12, o, 204)}${ln(724, 40, 3, o)}`],
    ["check", "Checklist", "p", (o) => box(o, 14)],
    ["daily", "Daily diary", "p", (o) => `${lb(44, 108, "MOOD", o)}${[0, 1, 2, 3, 4].map((i) => `<circle cx="${120 + i * 44}" cy="102" r="15" fill="none" stroke="${o.a}" stroke-width="2"/>`).join("")}${lb(360, 108, "WEATHER", o)}${["☀", "⛅", "☂"].map((w, i) => `<text x="${460 + i * 34}" y="110" font-size="22" fill="${o.a}">${w}</text>`).join("")}${lb(44, 160, "HIGHLIGHTS OF THE DAY", o)}${ln(204, 40, 15, o)}`],
    ["meeting", "Meeting notes", "p", (o) => `${lb(44, 108, "MEETING", o)}<line x1="140" y1="110" x2="556" y2="110" stroke="${o.l}"/>${lb(44, 146, "WITH", o)}<line x1="140" y1="148" x2="556" y2="148" stroke="${o.l}"/>${lb(44, 200, "AGENDA", o)}${ln(240, 38, 3, o)}${lb(44, 380, "NOTES", o)}${ln(420, 38, 6, o)}${lb(44, 670, "ACTIONS", o)}${box(o, 3, 712, 46)}`],
    ["pros", "Pros and cons", "p", (o) => `${lb(44, 108, "DECISION", o)}<line x1="150" y1="110" x2="556" y2="110" stroke="${o.l}"/><line x1="300" y1="140" x2="300" y2="816" stroke="${o.a}" stroke-width="2"/><line x1="44" y1="176" x2="556" y2="176" stroke="${o.a}" stroke-width="2"/>${tx(170, 164, "Pros", o, 30, "Caveat", "middle")}${tx(430, 164, "Cons", o, 30, "Caveat", "middle")}${ln(220, 40, 15, o, 44, 286)}${ln(220, 40, 15, o, 314, 556)}`],
    ["weekly", "Weekly spread", "p", (o) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Notes"].map((d, i) => { const x = i % 2 ? 306 : 44, y = 90 + Math.floor(i / 2) * 186; return bx(x, y, 250, 176, o) + lb(x + 12, y + 26, d.toUpperCase(), o, 13); }).join("")],
    ["grat", "Gratitude", "p", (o) => `${tx(44, 118, "I am grateful for…", o, 34)}${[1, 2, 3, 4, 5].map((n, i) => `${tx(44, 214 + i * 120, n + ".", o, 30)}${ln(214 + i * 120, 40, 2, o, 80)}`).join("")}`],
    ["dump", "Brain dump", "p", (o) => `${tx(44, 118, "Brain dump", o, 34)}${[[44, 150, 240, 120], [310, 160, 246, 150], [60, 300, 220, 160], [300, 340, 256, 130], [44, 500, 260, 140], [320, 500, 236, 170], [70, 680, 230, 120], [330, 700, 226, 110]].map(([x, y, w, h], i) => bx(x, y, w, h, o, 22, "7 6")).join("")}`],
    ["book", "Book notes", "p", (o) => `${bx(44, 90, 130, 180, o, 6)}${lb(66, 186, "COVER", o, 12)}${lb(196, 118, "TITLE", o)}<line x1="196" y1="150" x2="556" y2="150" stroke="${o.l}"/>${lb(196, 186, "AUTHOR", o)}<line x1="196" y1="218" x2="556" y2="218" stroke="${o.l}"/>${[0, 1, 2, 3, 4].map((i) => `<text x="${196 + i * 34}" y="258" font-size="26" fill="${o.a}">☆</text>`).join("")}${lb(44, 316, "KEY IDEAS AND QUOTES", o)}${ln(360, 40, 12, o)}`],
    ["revise", "Revision", "p", (o) => `${lb(44, 108, "SUBJECT · CHAPTER", o)}<line x1="44" y1="130" x2="556" y2="130" stroke="${o.l}"/>${lb(44, 176, "KEY TERMS", o)}${ln(216, 38, 4, o)}${lb(44, 390, "QUESTIONS TO REVISE", o)}${ln(430, 38, 8, o)}${lb(44, 772, "CONFIDENCE", o)}${[0, 1, 2, 3, 4].map((i) => `<circle cx="${200 + i * 40}" cy="766" r="13" fill="none" stroke="${o.a}" stroke-width="2"/>`).join("")}`],
    ["travel", "Travel", "p", (o) => `${lb(44, 108, "TRIP", o)}<line x1="110" y1="110" x2="556" y2="110" stroke="${o.l}"/>${bx(44, 140, 512, 260, o, 10, "8 6")}${lb(250, 276, "SKETCH OR TICKET", o, 13)}${ln(450, 40, 9, o)}`],
    /* creative */
    ["garden", "Garden / plant log", "c", (o) => `${tx(44, 120, "My plant: __________", o, 34)}${ph(50, 150, 240, 230, o, -3)}${ph(310, 160, 240, 220, o, 4)}${["💧 Watered", "☀ Sunlight", "📏 Height", "🌼 Flowers", "📝 Notes"].map((t, i) => `<text x="50" y="${460 + i * 62}" font-family="Manrope" font-size="19" fill="${o.t}">${t}:</text><line x1="190" y1="${464 + i * 62}" x2="556" y2="${464 + i * 62}" stroke="${o.l}"/>`).join("")}`],
    ["scrap", "Photo scrapbook", "c", (o) => `${ph(40, 90, 260, 250, o, -6)}${ph(300, 120, 250, 240, o, 6)}${ph(90, 420, 270, 250, o, 3)}${tx(380, 520, "caption…", o, 30)}<rect x="110" y="80" width="90" height="26" fill="#7BC4C4" opacity=".8" transform="rotate(-10 155 93)"/><rect x="370" y="110" width="90" height="26" fill="#F48FB1" opacity=".8" transform="rotate(12 415 123)"/>`],
    ["vision", "Vision board", "c", (o) => `${ph(40, 90, 250, 200, o, -3)}${ph(310, 90, 250, 160, o, 3)}${ph(310, 270, 250, 200, o, -2)}${ph(40, 310, 250, 180, o, 2)}${tx(300, 560, "My year in words", o, 40, "Caveat", "middle")}${ln(620, 44, 5, o)}`],
    ["moodb", "Mood board", "c", (o) => `${["#F48FB1", "#FFD23F", "#7BC4C4", "#9B7BE0", "#FF8C7A", "#5FA463"].map((c, i) => `<rect x="${44 + (i % 3) * 176}" y="${96 + Math.floor(i / 3) * 176}" width="160" height="160" rx="16" fill="${c}" opacity=".85"/>`).join("")}${tx(44, 500, "Ideas, colours, words…", o, 32)}${ln(560, 40, 7, o)}`],
    ["recipe", "Recipe card", "c", (o) => `${tx(44, 120, "Recipe: __________", o, 34)}${ph(330, 140, 226, 190, o, 3)}${lb(44, 170, "SERVES · TIME", o)}<line x1="44" y1="200" x2="300" y2="200" stroke="${o.l}"/>${lb(44, 250, "YOU NEED", o)}${ln(290, 38, 4, o, 44, 300)}${lb(44, 470, "STEPS", o)}${ln(510, 38, 8, o)}`],
    ["travelj", "Travel journal", "c", (o) => `${tx(44, 118, "Trip to __________", o, 34)}<rect x="44" y="140" width="512" height="200" rx="10" fill="${o.d ? "rgba(255,255,255,.06)" : "rgba(184,138,82,.12)"}" stroke="${o.l2}"/><path d="M80 300C200 160 360 330 520 180" stroke="#C0392B" stroke-width="3" stroke-dasharray="10 8" fill="none"/><circle cx="80" cy="300" r="8" fill="#C0392B"/><circle cx="520" cy="180" r="8" fill="#C0392B"/>${ph(50, 380, 230, 210, o, -4)}${bx(310, 400, 246, 110, o, 10, "6 5")}${lb(326, 430, "TICKET · PLACE", o, 13)}${ln(640, 40, 5, o)}`],
    ["pixels", "Year in pixels", "c", (o) => { let s = tx(44, 112, "My year", o, 34); const m = "JFMAMJJASOND"; for (let i = 0; i < 12; i++) s += `<text x="${100 + i * 38}" y="150" font-family="Manrope" font-size="13" fill="${o.t}" text-anchor="middle">${m[i]}</text>`; for (let d = 0; d < 31; d++) { s += `<text x="70" y="${178 + d * 20}" font-family="Manrope" font-size="10" fill="${o.t}" text-anchor="end">${d + 1}</text>`; for (let i = 0; i < 12; i++) s += `<rect x="${86 + i * 38}" y="${165 + d * 20}" width="28" height="16" rx="3" fill="none" stroke="${o.l2}"/>`; } return s; }],
    ["colour", "Colouring page", "c", (o) => { const c = o.d ? "#ddd" : "#444"; return `<g fill="none" stroke="${c}" stroke-width="2.5"><circle cx="300" cy="330" r="48"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="300" cy="215" rx="40" ry="70" transform="rotate(${a} 300 330)"/>`).join("")}<circle cx="300" cy="330" r="150"/><path d="M300 480v300M300 640c-50-40-110-30-130 0 40 22 90 22 130 0zM300 600c50-40 110-30 130 0-40 22-90 22-130 0z"/><path d="M80 800c60-40 120-40 180 0M340 800c60-40 120-40 180 0"/></g>`; }],
    ["letter", "Letter to future me", "c", (o) => `<rect x="90" y="90" width="420" height="230" rx="10" fill="${o.d ? "rgba(255,255,255,.08)" : "#FBC4D4"}"/><path d="M90 96l210 130 210-130" fill="${o.d ? "rgba(255,255,255,.12)" : "#F49AB7"}"/><circle cx="300" cy="226" r="22" fill="#C03A6B"/>${tx(44, 380, "Dear me, one year from now…", o, 32)}${ln(430, 40, 9, o)}${lb(44, 812, "OPEN ON: __________", o)}`],
    ["jar", "Gratitude jar", "c", (o) => `<rect x="230" y="96" width="140" height="40" rx="8" fill="#B88A52"/><path d="M200 146h200c26 40 40 70 40 130v420a50 50 0 0 1-50 50H210a50 50 0 0 1-50-50V276c0-60 14-90 40-130z" fill="${o.d ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.6)"}" stroke="${o.a}" stroke-width="3"/>${tx(300, 830, "happy moments", o, 28, "Caveat", "middle")}`],
    ["habitc", "Habit tracker", "c", (o) => { let s = tx(44, 112, "Habit: __________", o, 34); for (let i = 0; i < 35; i++) { const x = 60 + (i % 7) * 72, y = 170 + Math.floor(i / 7) * 120; s += `<path d="M${x + 14} ${y}h20v14c10 6 12 12 12 22v50a6 6 0 0 1-6 6H${x + 8}a6 6 0 0 1-6-6V${y + 36}c0-10 2-16 12-22z" fill="none" stroke="${o.a}" stroke-width="2"/><text x="${x + 24}" y="${y + 108}" font-family="Manrope" font-size="11" fill="${o.t}" text-anchor="middle">${i + 1}</text>`; } return s; }],
    ["sticker", "Sticker page", "c", (o) => `${tx(300, 120, "Sticker & doodle page", o, 36, "Caveat", "middle")}${bx(40, 150, 520, 660, o, 24, "10 8")}`],
    ["budget", "Budget / expenses", "c", (o) => `${tx(44, 118, "Budget for __________", o, 34)}${lb(44, 170, "INCOME", o)}<line x1="170" y1="172" x2="556" y2="172" stroke="${o.l}"/>${lb(44, 222, "ITEM", o)}${lb(440, 222, "AMOUNT", o)}${ln(268, 40, 11, o)}<line x1="420" y1="232" x2="420" y2="700" stroke="${o.l2}"/>${lb(44, 756, "SAVED THIS MONTH", o)}<rect x="44" y="776" width="512" height="22" rx="11" fill="none" stroke="${o.a}" stroke-width="2"/>`],
    ["medit", "Meditation log", "c", (o) => { let s = tx(44, 118, "Meditation / prayer log", o, 34); for (let i = 0; i < 31; i++) s += `<circle cx="${80 + (i % 7) * 74}" cy="${180 + Math.floor(i / 7) * 74}" r="26" fill="none" stroke="${o.a}" stroke-width="2"/><text x="${80 + (i % 7) * 74}" y="${186 + Math.floor(i / 7) * 74}" font-family="Manrope" font-size="13" fill="${o.t}" text-anchor="middle">${i + 1}</text>`; return s + lb(44, 570, "HOW IT FELT · INSIGHTS", o) + ln(612, 40, 5, o); }],
    ["month", "Monthly calendar", "c", (o) => { let s = tx(44, 118, "Month: __________", o, 34); "MTWTFSS".split("").forEach((d, i) => { s += `<text x="${70 + i * 76}" y="168" font-family="Manrope" font-weight="700" font-size="15" fill="${o.a}" text-anchor="middle">${d}</text>`; }); for (let i = 0; i < 42; i++) s += `<rect x="${34 + (i % 7) * 76}" y="${184 + Math.floor(i / 7) * 104}" width="72" height="98" rx="4" fill="none" stroke="${o.l2}"/>`; return s; }],
    ["fitness", "Fitness log", "c", (o) => `${tx(44, 118, "Workout: __________", o, 34)}${lb(44, 172, "EXERCISE", o)}${lb(340, 172, "SETS × REPS", o)}${ln(218, 42, 9, o)}<line x1="326" y1="182" x2="326" y2="600" stroke="${o.l2}"/>${lb(44, 650, "WATER", o)}${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${160 + i * 46} 630c8 10 14 16 14 24a14 14 0 0 1-28 0c0-8 6-14 14-24z" fill="none" stroke="#3C7BD9" stroke-width="2"/>`).join("")}${lb(44, 730, "STEPS · FEELING", o)}${ln(770, 40, 2, o)}`],
    ["shelf", "Bookshelf", "c", (o) => { let s = tx(44, 118, "Books I read", o, 34); for (let r = 0; r < 3; r++) { const y = 360 + r * 210; s += `<line x1="40" y1="${y}" x2="560" y2="${y}" stroke="${o.a}" stroke-width="6"/>`; for (let i = 0; i < 12; i++) s += `<rect x="${48 + i * 42}" y="${y - 150 + ((i * 17) % 40)}" width="36" height="${150 - ((i * 17) % 40)}" rx="3" fill="none" stroke="${o.l2}" stroke-width="2"/>`; } return s; }],
    ["movies", "Movies & series", "c", (o) => `${tx(44, 118, "Watch list 🎬", o, 34)}${lb(44, 170, "TITLE", o)}${lb(420, 170, "RATING", o)}${[...Array(14)].map((_, i) => `<line x1="44" y1="${214 + i * 44}" x2="556" y2="${214 + i * 44}" stroke="${o.l}"/><text x="420" y="${206 + i * 44}" font-size="20" fill="${o.a}">☆☆☆☆☆</text>`).join("")}`],
    ["bucket", "Bucket list", "c", (o) => `${tx(44, 118, "My bucket list ✈", o, 36)}${box(o, 13, 190, 50)}`],
    ["wheel", "Self-care wheel", "c", (o) => { let s = tx(44, 112, "How am I doing?", o, 34); const n = ["Body", "Mind", "People", "Work", "Rest", "Fun", "Money", "Purpose"]; s += `<g fill="none" stroke="${o.l2}">${[50, 100, 150, 200].map((r) => `<circle cx="300" cy="420" r="${r}"/>`).join("")}</g>`; n.forEach((t, i) => { const a = (i / n.length) * Math.PI * 2 - Math.PI / 2; s += `<line x1="300" y1="420" x2="${300 + 200 * Math.cos(a)}" y2="${420 + 200 * Math.sin(a)}" stroke="${o.l2}"/><text x="${300 + 236 * Math.cos(a + 0.39)}" y="${426 + 236 * Math.sin(a + 0.39)}" font-family="Manrope" font-size="15" font-weight="700" fill="${o.a}" text-anchor="middle">${t}</text>`; }); return s + lb(44, 712, "COLOUR EACH SLICE 1–4 · ONE STEP THIS WEEK", o, 13) + ln(756, 40, 2, o); }]
  ];
  const TP = Object.fromEntries(TPL.map((t) => [t[0], t]));
  MP.diaryFrames = (id) => { FR = []; try { (TP[id] || TP.lined)[3]({ a: "#000", d: false, l: "", l2: "", t: "" }); } catch (e) {} const r = FR; FR = null; return r; };
  const tplSVG = (id, col, acc, live) => { if (live) FR = []; try { return tplSVG0(id, col, acc); } finally { FR = null; } };
  const tplSVG0 = (id, col, acc) => { const d = isDark(col), o = { a: acc, d, l: d ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.13)", l2: d ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)", t: d ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.55)" }; return (TP[id] || TP.lined)[3](o); };

  /* ---------- data ---------- */
  const DS = () => MP.S.diaries, PS = () => MP.S.dpages;
  const alive = (r) => r && !r.del;
  const diaries = () => Object.entries(DS()).filter(([, d]) => alive(d)).sort((a, b) => (a[1].o || 0) - (b[1].o || 0) || (a[1].c || 0) - (b[1].c || 0));
  const pagesOf = (did, sid) => Object.entries(PS()).filter(([, p]) => alive(p) && p.d === did && p.s === sid).sort((a, b) => (a[1].o || 0) - (b[1].o || 0));
  const allPages = (did) => Object.entries(PS()).filter(([, p]) => alive(p) && p.d === did);
  const saveD = (id) => { DS()[id].u = now(); MP.changed(); };
  const saveP = (id) => { PS()[id].u = now(); MP.changed(); };
  const secs = (d) => (d.secs || []).filter((s) => !s.del);

  /* typed text is stored as a small, cleaned subset of HTML (no scripts, links or images can get in) */
  const TAGS = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DIV", "P", "BR", "UL", "OL", "LI", "H1", "H2", "H3", "SPAN", "FONT"]);
  const CSSOK = /^(color|background-color|font-family|font-size|text-align|text-decoration|font-weight|font-style)$/;
  const clean = (html) => {
    const doc = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html"), root = doc.body.firstChild;
    const walk = (el) => {
      [...el.childNodes].forEach((n) => {
        if (n.nodeType === 3) return;
        if (n.nodeType !== 1 || !TAGS.has(n.tagName)) { if (n.nodeType === 1 && !/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|IMG|A|INPUT|TEXTAREA|BUTTON|SELECT)$/.test(n.tagName)) { walk(n); n.replaceWith(...n.childNodes); } else n.remove(); return; }
        [...n.attributes].forEach((a) => {
          const k = a.name.toLowerCase();
          if (k === "style") { const keep = a.value.split(";").map((x) => x.trim()).filter((x) => { const [p, v] = x.split(":"); return p && v && CSSOK.test(p.trim().toLowerCase()) && !/url\(|expression|javascript/i.test(v); }).join(";"); if (keep) n.setAttribute("style", keep); else n.removeAttribute("style"); }
          else if (n.tagName === "FONT" && /^(color|face|size)$/.test(k) && !/[<>"]/.test(a.value)) { /* keep */ }
          else if (k === "class" && n.tagName === "SPAN" && /^dchk( on)?$/.test(a.value)) { /* keep */ }
          else if (k === "contenteditable" && n.tagName === "SPAN" && n.classList.contains("dchk")) n.setAttribute("contenteditable", "false");
          else n.removeAttribute(a.name);
        });
        walk(n);
      });
    };
    walk(root); return root.innerHTML.slice(0, 200000);
  };
  MP.diaryClean = clean;

  /* where you are: kept on this device */
  let ST = {}; try { ST = JSON.parse(localStorage.getItem("mp-dstate") || "{}"); } catch (e) {}
  const keep = () => { try { localStorage.setItem("mp-dstate", JSON.stringify(ST)); } catch (e) {} };
  const cur = () => { const d = ST.did && alive(DS()[ST.did]) ? DS()[ST.did] : null; if (!d) return null; const ss = secs(d); if (!ss.find((s) => s.id === ST.sid)) ST.sid = ss[0] && ss[0].id; const pg = pagesOf(ST.did, ST.sid); ST.idx = Math.max(0, Math.min(ST.idx || 0, pg.length - 1)); return { d, ss, pg }; };
  const wide = () => window.innerWidth >= 900;
  const fmtD = (iso, st) => { const t = new Date(iso + "T12:00:00"), f = (o) => t.toLocaleDateString("en-IN", o);
    if (st === "script") return `${f({ weekday: "long" })}, ${t.getDate()}${[, "st", "nd", "rd"][t.getDate() % 10 > 3 || Math.floor(t.getDate() / 10) === 1 ? 0 : t.getDate() % 10] || "th"} ${f({ month: "long" })}`;
    if (st === "num") return `${String(t.getDate()).padStart(2, "0")} · ${String(t.getMonth() + 1).padStart(2, "0")} · ${t.getFullYear()}`;
    if (st === "week") return "MTWTFSS".split("").map((x, i) => (i === (t.getDay() + 6) % 7 ? `<b>${x}</b>` : x)).join(" ") + ` · ${t.getDate()} ${f({ month: "short" }).toUpperCase()}`;
    return `${t.getDate()} <small>${f({ weekday: "short" }).toUpperCase()} · ${f({ month: "short" }).toUpperCase()} ${t.getFullYear()}</small>`; };
  const todayISO = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; };

  /* create things */
  function newPage(did, sid, look, at, withDate) {
    const d = DS()[did], t = th(d.theme), id = uid(), pg = pagesOf(did, sid);
    const o = at == null ? (pg.length ? (pg[pg.length - 1][1].o || 0) + 1 : 1) : at;
    PS()[id] = { u: now(), c: now(), d: did, s: sid, o, tpl: look.tpl || "lined", col: look.col || t[2], tex: look.tex || t[3], date: withDate === true ? todayISO() : "", ds: d.ds || "chip", ask: withDate === "ask" ? 1 : 0, text: "" };
    MP.changed(); return id;
  }
  function newDiary(name, theme) {
    const id = uid(), sid = "s" + Math.random().toString(36).slice(2, 7), t = th(theme);
    DS()[id] = { u: now(), c: now(), o: diaries().length + 1, name: name || "My diary", theme, secs: [{ id: sid, name: "Notes", col: t[4] }], ds: "chip", dateAsk: "ask", font: "Caveat", def: { tpl: "lined", col: t[2], tex: t[3] } };
    newPage(id, sid, DS()[id].def, null, true);
    ST = { did: id, sid, idx: 0 }; keep(); return id;
  }

  /* ---------- views ---------- */
  const coverHTML = (d, n) => { const t = th(d.theme); return `<button class="dcover" data-dopen="${E(d._id)}" style="background:${t[1]}"><span class="dlabel">${E(d.name)}</span><span class="dcmeta">${E(t[0])} · ${n} page${n === 1 ? "" : "s"}</span></button>`; };
  function shelf() {
    const list = diaries();
    return `<div class="between wrap mb"><div><p class="eyebrow">Your notebooks</p><h1 class="title">Diary</h1></div><button class="btn" data-dnew>+ New diary</button></div>
      ${list.length ? `<div class="dshelf">${list.map(([id, d]) => coverHTML(Object.assign({ _id: id }, d), allPages(id).length)).join("")}</div>`
        : `<section class="card stack center" style="padding:36px"><div class="big">Start your first diary</div><p class="small muted">One for study, one for personal notes, one for creative ideas — name each one and choose its theme. Write with the S Pen, type, or speak.</p><button class="btn" data-dnew>+ New diary</button></section>`}
      <p class="tiny muted mt">Diaries are private like your Journal: covered by the journal lock, never shared with Buddy, and not included in search or printing.</p>`;
  }
  const penBar = () => { const pen = MP.pen; return `${MP.PENS.map((p) => `<button type="button" class="tool ${pen.type === p[0] && !pen.eraser ? "on" : ""}" data-pen="${p[0]}" title="${p[1]}" aria-label="${p[1]}">${MP.penSvg(p[0])}</button>`).join("")}<span class="vsep"></span>
    ${MP.INKS.map((c) => `<button type="button" class="sw ${pen.color === c ? "on" : ""}" data-ink="${c}" style="background:${c}" aria-label="Ink colour"></button>`).join("")}
    <label class="tool" title="Any colour" style="position:relative">+<input type="color" data-inkc value="${pen.color}" aria-label="Any ink colour" class="overlay-input"></label>
    <label class="tiny muted row" style="gap:6px">Size<input type="range" min="1" max="10" value="${pen.size}" data-size style="width:70px"></label>
    <button type="button" class="tool ${pen.eraser ? "on" : ""}" data-eraser aria-label="Eraser">${MP.ic("eraser", 18)}</button>
    <button type="button" class="tool" data-dundo aria-label="Undo">${MP.ic("undo", 18)}</button><button type="button" class="tool" data-dredo aria-label="Redo">${MP.ic("redo", 18)}</button>`; };
  const FONTS = [["Caveat", "Caveat · handwriting"], ["Kalam", "Kalam · handwriting, Hindi too"], ["Patrick Hand", "Patrick Hand · handwriting"], ["Dancing Script", "Dancing Script · flowing"], ["Fraunces", "Fraunces"], ["Cormorant Garamond", "Cormorant"], ["Playfair Display", "Playfair"], ["Libre Baskerville", "Baskerville"], ["Poppins", "Poppins"], ["Quicksand", "Quicksand"], ["Nunito Sans", "Nunito"], ["Inter", "Inter"]];
  const fb = (c, t, l) => `<button type="button" class="tool" data-dfmt="${c}" title="${l}" aria-label="${l}">${t}</button>`;
  const textBar = (d) => `${fb("bold", "<b>B</b>", "Bold")}${fb("italic", "<i>I</i>", "Italic")}${fb("underline", "<u>U</u>", "Underline")}${fb("strikeThrough", "<s>S</s>", "Strikethrough")}<span class="vsep"></span>
    <select class="f sm" data-dfont aria-label="Font">${FONTS.map(([f, n]) => `<option value="${f}" ${d.font === f ? "selected" : ""}>${n}</option>`).join("")}</select>
    <select class="f sm" data-dsize aria-label="Text size"><option value="2">Small</option><option value="3" selected>Normal</option><option value="5">Large</option><option value="6">Huge</option></select>
    <label class="tool" title="Text colour" style="position:relative"><span style="font-weight:800;border-bottom:3px solid ${th(d.theme)[5]}">A</span><input type="color" data-dfore value="${th(d.theme)[5]}" class="overlay-input" aria-label="Text colour"></label>
    <label class="tool" title="Highlighter" style="position:relative"><span style="background:#FFE066;padding:0 3px;font-weight:800">ab</span><input type="color" data-dhili value="#FFE066" class="overlay-input" aria-label="Highlight colour"></label><span class="vsep"></span>
    ${fb("h", "H", "Heading")}${fb("insertUnorderedList", "•", "Bullet list")}${fb("insertOrderedList", "1.", "Numbered list")}${fb("check", "☐", "Checkbox")}${fb("justifyLeft", "⟸", "Align left")}${fb("justifyCenter", "≡", "Centre")}${fb("justifyRight", "⟹", "Align right")}`;

  function pageHTML(id, p, d, n) {
    const t = th(d.theme), dark = isDark(p.col), ink = dark ? (isDark(t[5]) ? "#F5EFE6" : t[5]) : (isDark(t[5]) ? t[5] : "#2B2622");
    const chip = p.date ? `<button class="ddate ds-${E(p.ds || "chip")}" data-ddate="${E(id)}" style="--acc:${t[4]};--on:${isDark(t[4]) ? "#fff" : "#1B1F4B"}" title="Tap to change or remove the date">${fmtD(p.date, p.ds)}</button>` : "";
    const ask = p.ask && !p.date ? `<div class="dask noprint"><span>Add today's date to this page?</span><button class="btn sm" data-dask="yes|${E(id)}">Add date</button><button class="btn ghost sm" data-dask="no|${E(id)}">No</button><button class="link tiny" data-dask="always|${E(id)}">Always</button><button class="link tiny" data-dask="never|${E(id)}">Never ask</button></div>` : "";
    return `<div class="dpg ${MP.dSel ? "selecting" : MP.inputMode === "type" ? "typing" : "inking"}" data-dpg="${E(id)}" style="background:${bgOf(p.col, p.tex)};--ink:${ink};--acc:${t[4]}">
      <svg class="dtpl" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${tplSVG(p.tpl, p.col, t[4], id !== "preview")}</svg>${chip}${ask}
      <div class="dtxt" data-dtxt="${E(id)}" ${MP.inputMode === "type" ? 'contenteditable="true"' : ""} spellcheck="true" style="font-family:'${E(d.font || "Caveat")}',cursive" aria-label="Typed text on page ${n}">${p.text || ""}</div>
      <div class="dobjs" data-dobjs="${E(id)}"></div><canvas class="dink" data-dink="${E(id)}" aria-label="Handwriting on page ${n}"></canvas><span class="dnum">${n}</span></div>`;
  }
  function openView() {
    const c = cur(); if (!c) { ST = {}; keep(); return shelf(); }
    const { d, ss, pg } = c, t = th(d.theme), book = (d.view === "book") && wide(), i = ST.idx;
    const pair = book ? [i - (i % 2), i - (i % 2) + 1].filter((k) => k < pg.length) : [i];
    const last = Math.max(...pair) >= pg.length - 1;
    return `<div class="dtop"><button class="btn ghost sm" data-dshelf>‹ All diaries</button><div class="dname" style="--acc:${t[4]}">${E(d.name)}</div>
        <span class="seg" role="group" aria-label="View"><button class="tool ${!book ? "on" : ""}" data-dview="page" title="One page">▯ Page</button><button class="tool ${book ? "on" : ""}" data-dview="book" title="Two pages side by side${wide() ? "" : " (needs a wider screen)"}">▯▯ Book</button></span>
        <button class="btn ghost sm" data-dmenu>⋯ Diary</button></div>
      <div class="dsecs" role="tablist">${ss.map((s) => `<button class="dsec ${s.id === ST.sid ? "on" : ""}" role="tab" data-dsec="${E(s.id)}" style="--sc:${E(s.col || t[4])}">${E(s.name)} <span class="tiny">${pagesOf(d._id || ST.did, s.id).length}</span>${s.id === ST.sid ? `<span class="dsecedit" data-dsecedit="${E(s.id)}" title="Rename, colour or delete this section">✎</span>` : ""}</button>`).join("")}<button class="dsec add" data-dsecadd>+ Section</button></div>
      <div class="dtools padbar"><span class="seg" role="group" aria-label="Input"><button type="button" class="tool ${!MP.dSel && MP.inputMode !== "type" ? "on" : ""}" data-dmode="pen" title="Write with S Pen or finger">${MP.ic("penm", 18)}</button><button type="button" class="tool ${!MP.dSel && MP.inputMode === "type" ? "on" : ""}" data-dmode="type" title="Type">${MP.ic("kbd", 18)}</button><button type="button" class="tool ${MP.dSel ? "on" : ""}" data-dmode="select" title="Photos, stickers, shapes: add, move, resize, rotate">✥</button>${MP.voiceOK ? `<button type="button" class="tool" data-dmic title="Speak instead of typing">🎤</button>` : ""}</span><span class="vsep"></span>
        ${MP.dSel && MP.dobjTools ? MP.dobjTools() : MP.inputMode === "type" ? textBar(d) : penBar()}<span style="margin-left:auto"></span><button class="btn ghost sm" data-dpset title="Template, colour, texture, date, move, delete">⋯ Page</button></div>
      ${pg.length ? `<div class="dstage ${book ? "book" : "single"}"><button class="darrow l" data-dnav="-1" aria-label="Previous page" ${i === 0 ? "disabled" : ""}>‹</button>
        <div class="dspread">${pair.map((k) => pageHTML(pg[k][0], pg[k][1], d, k + 1)).join(book ? '<div class="dgutter"></div>' : "")}</div>
        <button class="darrow r" data-dnav="1" aria-label="Next page" ${last ? "disabled" : ""}>›</button></div>
      <div class="dafter">${last ? `<button class="btn" data-dsame>+ New page (same layout) ›</button>` : `<button class="btn" data-dnav="${book ? 2 : 1}">Continue on next page ›</button>`}<button class="btn ghost" data-daddpg>+ Add page…</button></div>
      <div class="dstrip" aria-label="Pages">${pg.map(([pid, p], k) => `<button class="dthumb ${pair.includes(k) ? "on" : ""}" data-dgo="${k}" style="background:${bgOf(p.col, p.tex)}" title="Page ${k + 1}"><span>${k + 1}</span></button>`).join("")}<button class="dthumb add" data-dsame title="New page, same layout">+</button></div>`
        : `<section class="card stack center"><p class="small">This section has no pages yet.</p><button class="btn" data-daddpg>+ Add page</button></section>`}`;
  }
  MP.diaryView = () => (ST.did && DS()[ST.did] && alive(DS()[ST.did]) ? openView() : shelf());

  /* ---------- dialogs ---------- */
  let nd = null; /* new-diary draft */
  function newDiaryDlg() {
    if (!nd) nd = { name: "", theme: PLAN2DIARY[MP.S.profile.theme] || "botanical" };
    MP.modal(`<div class="between"><h2>New diary</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">Name<input class="f" id="dname" maxlength="60" placeholder="e.g. M.Phil notes, Personal, Creative thoughts" value="${E(nd.name)}"></label>
      <div class="small mt">Theme <span class="tiny muted">· cover, paper and ink. Each page can still change its colour and texture.</span></div>
      <div class="dthemes">${Object.entries(TH).map(([k, t]) => `<button class="dth ${nd.theme === k ? "on" : ""}" data-dth="${k}" title="${E(t[0])}"><span class="dthc" style="background:${t[1]}"></span><span class="dthp" style="background:${bgOf(t[2], t[3])}"><i style="background:${t[4]}"></i></span><span class="tiny">${E(t[0])}</span></button>`).join("")}</div>
      <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-dcreate>Create diary</button></div>`);
  }
  let pk = null; /* add-page / page-settings draft */
  const recent = () => { try { return JSON.parse(localStorage.getItem("mp-drecent") || "[]"); } catch (e) { return []; } };
  function pickerDlg() {
    const c = cur(); if (!c) return; const { d } = c, t = th(d.theme), edit = pk.edit, col = pk.col, rc = recent();
    const tiles = TPL.filter((x) => x[2] === pk.cat).map(([id, name]) => `<button class="dtile ${pk.tpl === id ? "on" : ""}" data-pktpl="${id}" title="${E(name)}"><svg viewBox="0 0 ${W} ${H}" style="background:${col}">${tplSVG(id, col, t[4])}</svg><span>${E(name)}</span></button>`).join("");
    const prev = pageHTML("preview", { col, tex: pk.tex, tpl: pk.tpl, date: pk.date ? (edit ? (PS()[edit].date || todayISO()) : todayISO()) : "", ds: pk.ds || d.ds, text: "" }, d, "");
    MP.modal(`<div class="between"><h2>${edit ? "This page" : "Add a page"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="dpick"><div class="stack" style="gap:10px;min-width:0">
        <div class="small"><b>① Template</b> <span class="seg sm" style="margin-left:6px"><button class="tool ${pk.cat === "p" ? "on" : ""}" data-pkcat="p">Professional</button><button class="tool ${pk.cat === "c" ? "on" : ""}" data-pkcat="c">Creative</button></span></div>
        <div class="dtiles">${tiles}</div>
        <div class="small"><b>② Page colour</b></div>
        <div class="row wrap" style="gap:6px">${COLS.map(([n, c2]) => `<button class="dsw ${col === c2 ? "on" : ""}" data-pkcol="${c2}" style="background:${c2}" title="${n}" aria-label="${n}"></button>`).join("")}${rc.filter((c2) => !COLS.some((x) => x[1] === c2)).map((c2) => `<button class="dsw ${col === c2 ? "on" : ""}" data-pkcol="${c2}" style="background:${c2}" title="Recent colour"></button>`).join("")}<label class="dsw any" title="Any colour">+<input type="color" data-pkany value="${col}" class="overlay-input" aria-label="Choose any colour"></label><button class="link tiny" data-pkcol="${t[2]}">Theme colour</button></div>
        <div class="small"><b>③ Texture</b></div>
        <div class="row wrap" style="gap:8px">${Object.entries(TEX).map(([k, x]) => `<button class="dtex ${pk.tex === k ? "on" : ""}" data-pktex="${k}" title="${x[0]}"><i style="background:${x[1](col)}"></i><span>${x[0]}</span></button>`).join("")}</div>
        <label class="row small"><input type="checkbox" data-pkdate ${pk.date ? "checked" : ""}> Show ${edit ? "a" : "today's"} date at the top</label>
        ${pk.date ? `<div class="row wrap small" style="gap:6px">Style ${[["chip", "Chip"], ["script", "Handwritten"], ["num", "Numbers"], ["week", "Week strip"]].map(([k, n]) => `<button class="tool ${(pk.ds || d.ds) === k ? "on" : ""}" data-pkds="${k}">${n}</button>`).join("")}${edit ? `<input class="f sm" type="date" data-pkdd value="${E(PS()[edit].date || todayISO())}" data-novoice>` : ""}</div>` : ""}
        ${edit ? "" : `<label class="row small"><input type="checkbox" data-pkdef ${pk.def ? "checked" : ""}> Make this the default for new pages in this diary</label>`}
      </div><div class="dprev"><div class="tiny muted">PREVIEW</div>${prev}</div></div>
      <div class="row wrap" style="justify-content:space-between;gap:8px;margin-top:12px">${edit ? `<span class="row wrap" style="gap:6px"><button class="btn ghost sm" data-pkdup>Duplicate page</button><select class="f sm" data-pkmove aria-label="Move to section"><option value="">Move to section…</option>${secs(d).filter((s) => s.id !== PS()[edit].s).map((s) => `<option value="${E(s.id)}">${E(s.name)}</option>`).join("")}</select><button class="btn ghost sm" data-pkdel style="color:#C0392B">Delete page</button></span>` : "<span></span>"}
        <span class="row" style="gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-pkok>${edit ? "Save" : "Add page"}</button></span></div>`);
    const pv = document.querySelector("#modal .dprev .dpg"); if (pv) { pv.querySelector("canvas").remove(); const tx2 = pv.querySelector(".dtxt"); tx2.removeAttribute("contenteditable"); tx2.textContent = ""; }
  }
  const openPicker = (editId) => {
    const c = cur(); if (!c) return; const { d, pg } = c;
    if (editId) { const p = PS()[editId]; pk = { edit: editId, tpl: p.tpl, col: p.col, tex: p.tex, date: !!p.date, ds: p.ds, cat: (TP[p.tpl] || TP.lined)[2] }; }
    else { const last = pg.length ? pg[Math.min(ST.idx, pg.length - 1)][1] : d.def; pk = { tpl: last.tpl || d.def.tpl, col: last.col || d.def.col, tex: last.tex || d.def.tex, date: d.dateAsk !== "never", cat: (TP[last.tpl || "lined"] || TP.lined)[2], def: false }; }
    pickerDlg();
  };
  function secDlg(sid) {
    const c = cur(); if (!c) return; const s = sid ? secs(c.d).find((x) => x.id === sid) : null, n = s ? pagesOf(ST.did, s.id).length : 0;
    const SC = ["#C03A6B", "#E07A00", "#2F7D4F", "#0B6E8C", "#6A4DB8", "#B8902F", "#E8574F", "#34506E"];
    MP.modal(`<div class="between"><h2>${s ? "Section" : "New section"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">Name<input class="f" id="dsecname" maxlength="40" value="${E(s ? s.name : "")}" placeholder="e.g. Chapter 1, Ideas, Garden"></label>
      <div class="row wrap mt" style="gap:6px">${SC.map((c2) => `<button class="dsw ${(s ? s.col : SC[0]) === c2 ? "on" : ""}" data-dsecc="${c2}" style="background:${c2}" aria-label="Section colour"></button>`).join("")}</div>
      <div class="row wrap" style="justify-content:space-between;gap:8px;margin-top:14px">${s && secs(c.d).length > 1 ? `<button class="btn ghost sm" data-dsecdel="${E(s.id)}" style="color:#C0392B">Delete section${n ? ` and its ${n} page${n === 1 ? "" : "s"}` : ""}</button>` : "<span></span>"}
      <span class="row" style="gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-dsecok="${E(s ? s.id : "")}">Save</button></span></div>`);
    MP._secCol = s ? s.col : SC[0];
  }
  function menuDlg() {
    const c = cur(); if (!c) return; const { d } = c;
    MP.modal(`<div class="between"><h2>${E(d.name)}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">Name<input class="f" id="drename" maxlength="60" value="${E(d.name)}"></label>
      <label class="stack small mt">Theme <select class="f" id="dtheme">${Object.entries(TH).map(([k, t]) => `<option value="${k}" ${d.theme === k ? "selected" : ""}>${E(t[0])}</option>`).join("")}</select><span class="tiny muted">Changes the cover and the default for new pages; existing pages keep their colours.</span></label>
      <label class="stack small mt">Date on new pages <select class="f" id="ddateask">${[["ask", "Ask me each time"], ["always", "Always add today's date"], ["never", "Never"]].map(([k, n]) => `<option value="${k}" ${d.dateAsk === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <label class="stack small mt">Default typing font <select class="f" id="dfontdef">${FONTS.map(([f, n]) => `<option value="${f}" ${d.font === f ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <div class="row wrap" style="justify-content:space-between;gap:8px;margin-top:14px"><button class="btn ghost sm" data-ddel style="color:#C0392B">Delete this diary</button><span class="row" style="gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-dmenuok>Save</button></span></div>`);
  }
  function confirmDlg(msg, act) { MP.modal(`<h2>Are you sure?</h2><p class="small">${msg}</p><div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" data-close>Keep it</button><button class="btn" style="background:#C0392B" data-dyes="${act}">Delete</button></div>`); }
  function dateDlg(id) {
    const p = PS()[id]; MP.modal(`<h2>Date on this page</h2><label class="stack small">Date<input class="f" type="date" id="dpdate" value="${E(p.date || todayISO())}" data-novoice></label>
      <div class="row wrap mt" style="gap:6px">${[["chip", "Chip"], ["script", "Handwritten"], ["num", "Numbers"], ["week", "Week strip"]].map(([k, n]) => `<button class="tool ${(p.ds || "chip") === k ? "on" : ""}" data-ddstyle="${k}|${E(id)}">${n}</button>`).join("")}</div>
      <div class="row" style="justify-content:space-between;gap:8px;margin-top:14px"><button class="btn ghost sm" data-ddrm="${E(id)}">Remove date</button><span class="row" style="gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-ddok="${E(id)}">Save</button></span></div>`);
  }

  /* ---------- handwriting on pages (coordinates stored relative to the page width, so pages look the same on phone and tablet) ---------- */
  const redo = {};
  const penSeen = () => { try { return localStorage.getItem("mp-penseen") === "1"; } catch (e) { return false; } };
  const strokes = (key) => { const S = MP.S; if (!S.ink[key]) S.ink[key] = { u: 0, s: [] }; return S.ink[key].s; };
  const touchInk = (key) => { MP.S.ink[key].u = now(); MP.changed(); };
  let activeKey = null;
  function setupInk(cv) {
    const id = cv.dataset.dink, key = "dp-" + id, ctx = cv.getContext("2d");
    const size = () => { const r = cv.parentElement.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr; cv.style.width = r.width + "px"; cv.style.height = r.height + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); };
    const draw = () => { const w = cv.clientWidth; ctx.clearRect(0, 0, w, cv.clientHeight); strokes(key).forEach((s) => MP.strokeOn(ctx, s, w, w, w / W)); };
    cv._draw = draw; cv._size = size;
    let cur = null, lastPen = 0;
    const P = (e) => { const r = cv.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) / r.width) * 10000) / 10000, Math.round(((e.clientY - r.top) / r.width) * 10000) / 10000, Math.round((e.pressure || 0.5) * 100) / 100]; };
    const erase = (pt) => { const arr = strokes(key), n = arr.length, keep2 = arr.filter((s) => !s.p.some((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < 0.025)); if (keep2.length !== n) { MP.S.ink[key].s = keep2; touchInk(key); draw(); } };
    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") { lastPen = now(); try { localStorage.setItem("mp-penseen", "1"); } catch (er) {} }
      if (e.pointerType === "touch" && (penSeen() || now() - lastPen < 3000)) return; /* with an S Pen, fingers turn pages and the palm is ignored */
      activeKey = key; cv.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
      if (MP.pen.eraser) { cur = { erase: true }; erase(P(e)); return; }
      cur = { t: MP.pen.type, c: MP.pen.color, z: MP.pen.size, p: [P(e)] }; redo[key] = [];
    });
    cv.addEventListener("pointermove", (e) => { if (!cur) return; (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach((ev) => { const pt = P(ev); if (cur.erase) erase(pt); else cur.p.push(pt); }); if (!cur.erase) { draw(); MP.strokeOn(ctx, cur, cv.clientWidth, cv.clientWidth, cv.clientWidth / W); } });
    const end = () => { if (cur && !cur.erase && cur.p.length) { strokes(key).push(cur); touchInk(key); draw(); if (Math.max(...cur.p.map((q) => q[1])) > (H / W) * 0.86) { const b = document.querySelector(".dafter .btn"); if (b) { b.classList.remove("dpulse"); void b.offsetWidth; b.classList.add("dpulse"); } } } cur = null; };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    size();
  }

  /* typing: remember the selection so toolbar buttons and menus act on it */
  let range = null, saveT = null;
  document.addEventListener("selectionchange", () => { const s = window.getSelection(); if (s.rangeCount && s.anchorNode && s.anchorNode.parentElement && s.anchorNode.parentElement.closest && s.anchorNode.parentElement.closest(".dtxt[contenteditable]")) range = s.getRangeAt(0).cloneRange(); });
  const restore = () => { if (!range) return false; const s = window.getSelection(); s.removeAllRanges(); s.addRange(range); const ed = range.startContainer.parentElement && range.startContainer.parentElement.closest(".dtxt"); if (ed) ed.focus(); return true; };
  const saveText = (el) => { const id = el.dataset.dtxt, p = PS()[id]; if (!p) return; const h = clean(el.innerHTML); if (h !== p.text) { p.text = h; saveP(id); } };
  document.addEventListener("input", (e) => { const el = e.target.closest && e.target.closest("[data-dtxt]"); if (!el) return; clearTimeout(saveT); saveT = setTimeout(() => saveText(el), 500); });
  document.addEventListener("focusout", (e) => { const el = e.target.closest && e.target.closest("[data-dtxt]"); if (el) { clearTimeout(saveT); saveText(el); } });
  const exec = (cmd, val) => { restore(); document.execCommand("styleWithCSS", false, false); document.execCommand(cmd, false, val); const ed = document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-dtxt]"); if (ed) saveText(ed); };
  document.addEventListener("pointerdown", (e) => { if (e.target.closest(".dtools [data-dfmt]")) e.preventDefault(); });

  /* ---------- actions ---------- */
  const rerender = () => { MP.render(); };
  const go2 = (k) => { const c = cur(); if (!c) return; ST.idx = Math.max(0, Math.min(c.pg.length - 1, k)); keep(); rerender(); };
  const addSame = () => {
    const c = cur(); if (!c) return; const { d, pg } = c, src = pg.length ? pg[pg.length - 1][1] : d.def;
    const w = d.dateAsk === "always" ? true : d.dateAsk === "never" ? false : "ask";
    newPage(ST.did, ST.sid, { tpl: src.tpl, col: src.col, tex: src.tex }, null, w); ST.idx = pagesOf(ST.did, ST.sid).length - 1; keep(); rerender();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button,[data-dsecedit],.dchk,label.dsw"); if (!b) return; const a = b.dataset || {};
    if (b.classList.contains("dchk")) { const on = b.classList.toggle("on"); b.textContent = on ? "☑" : "☐"; const ed = b.closest("[data-dtxt]"); if (ed) saveText(ed); return; }
    if (a.dnew !== undefined) { nd = null; return newDiaryDlg(); }
    if (a.dth) { nd.name = (document.getElementById("dname") || {}).value || nd.name; nd.theme = a.dth; return newDiaryDlg(); }
    if (a.dcreate !== undefined) { const nm = ((document.getElementById("dname") || {}).value || "").trim(); newDiary(nm || "My diary", nd.theme); nd = null; MP.closeModal(); return rerender(); }
    if (a.dopen) { const d = DS()[a.dopen]; ST = { did: a.dopen, sid: (d.last && d.last.sid) || (secs(d)[0] || {}).id, idx: (d.last && d.last.idx) || 0 }; keep(); return rerender(); }
    if (a.dshelf !== undefined) { const d = DS()[ST.did]; if (d) { d.last = { sid: ST.sid, idx: ST.idx }; } ST = {}; keep(); return rerender(); }
    if (a.dview) { const d = DS()[ST.did]; if (a.dview === "book" && !wide()) MP.toast("Book view needs a tablet or laptop screen"); d.view = a.dview; saveD(ST.did); return rerender(); }
    if (a.dsecedit) return secDlg(a.dsecedit);
    if (a.dsec) { ST.sid = a.dsec; ST.idx = 0; keep(); return rerender(); }
    if (a.dsecadd !== undefined) return secDlg(null);
    if (a.dsecc) { MP._secCol = a.dsecc; document.querySelectorAll("#modal [data-dsecc]").forEach((x) => x.classList.toggle("on", x === b)); return; }
    if (a.dsecok !== undefined) {
      const d = DS()[ST.did], nm = ((document.getElementById("dsecname") || {}).value || "").trim() || "Section";
      if (a.dsecok) { const s = d.secs.find((x) => x.id === a.dsecok); s.name = nm; s.col = MP._secCol; }
      else { const sid = "s" + Math.random().toString(36).slice(2, 7); d.secs.push({ id: sid, name: nm, col: MP._secCol }); ST.sid = sid; ST.idx = 0; keep(); newPage(ST.did, sid, d.def, null, d.dateAsk === "never" ? false : true); }
      saveD(ST.did); MP.closeModal(); return rerender();
    }
    if (a.dsecdel) { const n = pagesOf(ST.did, a.dsecdel).length; return confirmDlg(`This deletes the section${n ? ` and its ${n} page${n === 1 ? "" : "s"}, including handwriting` : ""}. This can't be undone.`, "sec|" + a.dsecdel); }
    if (a.dmenu !== undefined) return menuDlg();
    if (a.dmenuok !== undefined) { const d = DS()[ST.did], nm = document.getElementById("drename").value.trim(); if (nm) d.name = nm; const th2 = document.getElementById("dtheme").value; if (th2 !== d.theme) { d.theme = th2; d.def = Object.assign({}, d.def, { col: th(th2)[2], tex: th(th2)[3] }); } d.dateAsk = document.getElementById("ddateask").value; d.font = document.getElementById("dfontdef").value; saveD(ST.did); MP.closeModal(); return rerender(); }
    if (a.ddel !== undefined) { const n = allPages(ST.did).length; return confirmDlg(`This deletes “${E(DS()[ST.did].name)}” and all ${n} page${n === 1 ? "" : "s"} in it, including handwriting. This can't be undone.`, "diary|" + ST.did); }
    if (a.dyes) {
      const [k, id] = a.dyes.split("|");
      if (k === "diary") { allPages(id).forEach(([pid]) => { PS()[pid] = { u: now(), del: 1, d: id }; if (MP.S.ink["dp-" + pid]) MP.S.ink["dp-" + pid] = { u: now(), s: [] }; }); DS()[id] = { u: now(), del: 1 }; ST = {}; keep(); }
      if (k === "sec") { const d = DS()[ST.did]; pagesOf(ST.did, id).forEach(([pid]) => { PS()[pid] = { u: now(), del: 1, d: ST.did }; if (MP.S.ink["dp-" + pid]) MP.S.ink["dp-" + pid] = { u: now(), s: [] }; }); d.secs = d.secs.filter((s) => s.id !== id); saveD(ST.did); ST.sid = (secs(d)[0] || {}).id; ST.idx = 0; keep(); }
      if (k === "page") { PS()[id] = { u: now(), del: 1, d: ST.did }; if (MP.S.ink["dp-" + id]) MP.S.ink["dp-" + id] = { u: now(), s: [] }; ST.idx = Math.max(0, ST.idx - 1); keep(); }
      MP.changed(); MP.closeModal(); return rerender();
    }
    if (a.dnav) { const c = cur(); if (!c) return; const book = DS()[ST.did].view === "book" && wide(); let k = ST.idx + (+a.dnav) * (book && Math.abs(+a.dnav) === 1 ? 2 : 1); if (book) k -= k % 2; return go2(k); }
    if (a.dgo !== undefined) return go2(+a.dgo);
    if (a.dsame !== undefined) return addSame();
    if (a.daddpg !== undefined) return openPicker(null);
    if (a.dpset !== undefined) { const c = cur(); if (!c || !c.pg.length) return; return openPicker(c.pg[ST.idx][0]); }
    if (a.dmode) { if (a.dmode === "select") MP.dSel = true; else { MP.dSel = false; MP.inputMode = a.dmode; MP.pref.set("input", a.dmode); } MP.dobjClear && MP.dobjClear(); return rerender(); }
    if (a.dmic !== undefined) { MP.dSel = false; MP.inputMode = "type"; MP.pref.set("input", "type"); rerender(); setTimeout(() => { const ed = document.querySelector(".dtxt[contenteditable]"); if (ed) { ed.focus(); const s = window.getSelection(); s.selectAllChildren(ed); s.collapseToEnd(); setTimeout(() => { const m = document.querySelector(".vmic"); if (m && !m.hidden) m.click(); }, 80); } }, 60); return; }
    if (a.dfmt) { if (a.dfmt === "h") return exec("formatBlock", "<h2>"); if (a.dfmt === "check") return exec("insertHTML", '<span class="dchk" contenteditable="false">☐</span>&nbsp;'); return exec(a.dfmt); }
    if (a.dundo !== undefined || a.dredo !== undefined) { const c = cur(); if (!c || !c.pg.length) return; const key = activeKey || "dp-" + c.pg[ST.idx][0]; if (a.dundo !== undefined) { const s = strokes(key).pop(); if (s) (redo[key] = redo[key] || []).push(s); } else { const s = (redo[key] || []).pop(); if (s) strokes(key).push(s); } touchInk(key); document.querySelectorAll("canvas.dink").forEach((cv) => cv._draw && cv._draw()); return; }
    if (b.closest(".dtools") && (a.pen || a.ink !== undefined || a.eraser !== undefined)) { setTimeout(() => { const bar = document.querySelector(".dtools"); if (bar) bar.querySelectorAll("[data-pen],[data-ink],[data-eraser]").forEach((x) => x.classList.toggle("on", x.dataset.pen ? x.dataset.pen === MP.pen.type && !MP.pen.eraser : x.dataset.ink ? x.dataset.ink === MP.pen.color && !MP.pen.eraser : MP.pen.eraser)); }, 0); return; }
    /* page picker */
    if (a.pkcat) { pk.cat = a.pkcat; return pickerDlg(); }
    if (a.pktpl) { pk.tpl = a.pktpl; return pickerDlg(); }
    if (a.pkcol) { pk.col = a.pkcol; return pickerDlg(); }
    if (a.pktex) { pk.tex = a.pktex; return pickerDlg(); }
    if (a.pkds) { pk.ds = a.pkds; return pickerDlg(); }
    if (a.pkok !== undefined) {
      const c = cur(); if (!c) return; const d = c.d;
      if (pk.col && !COLS.some((x) => x[1] === pk.col)) { const r = [pk.col, ...recent().filter((x) => x !== pk.col)].slice(0, 8); try { localStorage.setItem("mp-drecent", JSON.stringify(r)); } catch (er) {} }
      if (pk.edit) { const p = PS()[pk.edit], dd = document.querySelector("[data-pkdd]"); if (p.tpl !== pk.tpl) { p.obj = (p.obj || []).filter((x) => x.k !== "frame"); p.fr = 0; } Object.assign(p, { tpl: pk.tpl, col: pk.col, tex: pk.tex, ds: pk.ds || p.ds, date: pk.date ? (dd && dd.value) || p.date || todayISO() : "", ask: 0 }); saveP(pk.edit); }
      else { const at = c.pg.length ? (c.pg[ST.idx][1].o || 0) + 0.5 : null; const id = newPage(ST.did, ST.sid, pk, at, !!pk.date); if (pk.ds) PS()[id].ds = pk.ds; if (pk.def) { d.def = { tpl: pk.tpl, col: pk.col, tex: pk.tex }; saveD(ST.did); } ST.idx = pagesOf(ST.did, ST.sid).findIndex((x) => x[0] === id); keep(); }
      MP.closeModal(); return rerender();
    }
    if (a.pkdup !== undefined) { const p = PS()[pk.edit], id = newPage(ST.did, p.s, p, (p.o || 0) + 0.5, false); Object.assign(PS()[id], { text: p.text, date: p.date, ds: p.ds, obj: JSON.parse(JSON.stringify(p.obj || [])).map((x) => Object.assign(x, { id: "o" + Math.random().toString(36).slice(2, 9) })), fr: 1, bgim: p.bgim }); const ink = MP.S.ink["dp-" + pk.edit]; if (ink && ink.s.length) MP.S.ink["dp-" + id] = { u: now(), s: JSON.parse(JSON.stringify(ink.s)) }; ST.idx += 1; keep(); MP.changed(); MP.closeModal(); MP.toast("Page duplicated"); return rerender(); }
    if (a.pkdel !== undefined) return confirmDlg("This deletes the page, including its handwriting and text. This can't be undone.", "page|" + pk.edit);
    /* dates */
    if (a.ddate) return dateDlg(a.ddate);
    if (a.ddstyle) { const [st, id] = a.ddstyle.split("|"); PS()[id].ds = st; saveP(id); document.querySelectorAll("#modal [data-ddstyle]").forEach((x) => x.classList.toggle("on", x === b)); return; }
    if (a.ddok) { PS()[a.ddok].date = document.getElementById("dpdate").value || todayISO(); saveP(a.ddok); MP.closeModal(); return rerender(); }
    if (a.ddrm) { PS()[a.ddrm].date = ""; saveP(a.ddrm); MP.closeModal(); return rerender(); }
    if (a.dask) { const [k, id] = a.dask.split("|"), p = PS()[id], d = DS()[ST.did]; p.ask = 0; if (k !== "no" && k !== "never") p.date = todayISO(); if (k === "always" || k === "never") { d.dateAsk = k; saveD(ST.did); } saveP(id); return rerender(); }
  });
  document.addEventListener("change", (e) => {
    const t = e.target, a = t.dataset || {};
    if (a.pkany !== undefined) { pk.col = t.value; return pickerDlg(); }
    if (a.pkdate !== undefined) { pk.date = t.checked; return pickerDlg(); }
    if (a.pkdef !== undefined) { pk.def = t.checked; return; }
    if (a.pkmove !== undefined && t.value) { const p = PS()[pk.edit], to = pagesOf(ST.did, t.value); p.s = t.value; p.o = to.length ? (to[to.length - 1][1].o || 0) + 1 : 1; saveP(pk.edit); ST.sid = t.value; ST.idx = to.length; keep(); MP.closeModal(); MP.toast("Page moved"); return rerender(); }
    if (a.dfont !== undefined) return exec("fontName", t.value);
    if (a.dsize !== undefined) return exec("fontSize", t.value);
    if (a.dfore !== undefined) return exec("foreColor", t.value);
    if (a.dhili !== undefined) return exec("hiliteColor", t.value);
  });
  document.addEventListener("input", (e) => { if (e.target.dataset && e.target.dataset.pkany !== undefined) { pk.col = e.target.value; const pv = document.querySelector("#modal .dprev .dpg"); if (pv) pv.style.background = bgOf(pk.col, pk.tex); } });

  /* swipe with a finger, or ← → keys */
  let sw = null;
  document.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch" && e.target.closest(".dstage") && !e.target.closest("button")) sw = [e.clientX, e.clientY, now()]; else sw = null; });
  document.addEventListener("pointerup", (e) => { if (!sw) return; const dx = e.clientX - sw[0], dy = e.clientY - sw[1]; if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy) && now() - sw[2] < 800) { const btn = document.querySelector(`.dstage [data-dnav="${dx < 0 ? 1 : -1}"]`); if (btn && !btn.disabled) btn.click(); } sw = null; });
  document.addEventListener("keydown", (e) => { if (!document.querySelector(".dstage") || document.getElementById("modal").classList.contains("on")) return; const t = e.target; if (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return; if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const btn = document.querySelector(`.dstage [data-dnav="${e.key === "ArrowRight" ? 1 : -1}"]`); if (btn && !btn.disabled) btn.click(); } });

  MP.diaryAfter = () => { document.querySelectorAll("canvas.dink").forEach(setupInk); if (MP.dobjAfter) MP.dobjAfter(); };
  MP.diaryCur = () => { const c = cur(); return c && c.pg.length ? c.pg[ST.idx][0] : null; };
  MP.diaryTheme = () => { const c = cur(); return c ? c.d.theme : null; };
  window.addEventListener("resize", () => { clearTimeout(window._mpDr); window._mpDr = setTimeout(() => document.querySelectorAll("canvas.dink").forEach((cv) => cv._size && cv._size()), 200); });
  MP.diaryThemes = TH; MP.diaryTemplates = TPL;
})();
