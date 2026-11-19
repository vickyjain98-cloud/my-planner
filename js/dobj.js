/* My Planner — things you place on diary pages (1.20): photos (camera, gallery, crop), photo frames,
   stickers, text boxes, Word-style shapes and connectors. Every item can be moved, resized and rotated.
   Positions are stored as fractions of the page width, so pages look the same on every screen. */
"use strict";
(function () {
  const MP = window.MP;
  const E = (s) => MP.esc(s), now = () => Date.now();
  const PW = 600, PH = 846; let RATIO = PH / PW; /* 1.24: set per page from its paper size */
  const ratioFor = (pid) => (MP.diaryRatio ? MP.diaryRatio(pid) : PH / PW);
  const oid = () => "o" + Math.random().toString(36).slice(2, 9);
  const PS = () => MP.S.dpages;

  /* ---------- shapes (100 × 100 boxes, stretched to fit) ---------- */
  const poly = (n, rot = -90) => "M" + [...Array(n)].map((_, i) => { const a = ((rot + (360 / n) * i) * Math.PI) / 180; return `${(50 + 50 * Math.cos(a)).toFixed(1)} ${(50 + 50 * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
  const star = (n, ri = 0.45) => "M" + [...Array(n * 2)].map((_, i) => { const r = i % 2 ? 50 * ri : 50, a = ((-90 + (180 / n) * i) * Math.PI) / 180; return `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
  const OV = "M0 50A50 50 0 1 0 100 50A50 50 0 1 0 0 50Z";
  const CLOUD = "M25 85C5 85 0 60 18 52C10 30 35 18 48 30C55 10 85 12 85 35C100 40 100 70 82 78C80 92 60 92 55 85Z";
  /* [id, name, fill path, extra lines (outline only)] */
  const SHAPES = {
    "Lines": [["line", "Line"], ["arrow", "Arrow"], ["dblarrow", "Double arrow"], ["elbow", "Elbow connector"], ["elbowa", "Elbow arrow"], ["elbowd", "Elbow double arrow"], ["curve", "Curved connector"], ["curvea", "Curved arrow"], ["curved", "Curved double arrow"]],
    "Basic shapes": [["rect", "Rectangle", "M0 0H100V100H0Z"], ["round", "Rounded rectangle", "M12 0H88Q100 0 100 12V88Q100 100 88 100H12Q0 100 0 88V12Q0 0 12 0Z"], ["snip", "Snipped corner", "M0 0H82L100 18V100H0Z"], ["snip2", "Snipped corners", "M18 0H100V82L82 100H0V18Z"], ["oval", "Oval", OV], ["tri", "Triangle", "M50 0L100 100H0Z"], ["rtri", "Right triangle", "M0 0L100 100H0Z"], ["para", "Parallelogram", "M25 0H100L75 100H0Z"], ["trap", "Trapezoid", "M20 0H80L100 100H0Z"], ["diamond", "Diamond", "M50 0L100 50L50 100L0 50Z"],
      ["pent", "Pentagon", poly(5)], ["hex", "Hexagon", poly(6, 0)], ["hept", "Heptagon", poly(7)], ["oct", "Octagon", poly(8, -67.5)], ["dec", "Decagon", poly(10)], ["dodec", "Dodecagon", poly(12, -75)], ["plus", "Cross", "M33 0H67V33H100V67H67V100H33V67H0V33H33Z"], ["frame", "Frame", "M0 0H100V100H0ZM14 14V86H86V14Z"], ["halfframe", "Half frame", "M0 0H100L86 14H14V86L0 100Z"], ["lshape", "L-shape", "M0 0H40V60H100V100H0Z"],
      ["can", "Cylinder", "M0 12C0-4 100-4 100 12V88C100 104 0 104 0 88Z", "M0 12C0 28 100 28 100 12"], ["cube", "Cube", "M0 20L20 0H100V80L80 100H0Z", "M0 20H80V100M80 20L100 0"], ["bevel", "Bevel", "M0 0H100V100H0Z", "M14 14H86V86H14ZM0 0L14 14M100 0L86 14M100 100L86 86M0 100L14 86"], ["donut", "Donut", "M0 50A50 50 0 1 0 100 50A50 50 0 1 0 0 50ZM25 50A25 25 0 1 1 75 50A25 25 0 1 1 25 50Z"], ["nosym", "No symbol", "M0 50A50 50 0 1 0 100 50A50 50 0 1 0 0 50ZM20 50A30 30 0 1 1 80 50A30 30 0 1 1 20 50Z", "M29 29L71 71"], ["blockarc", "Block arc", "M0 50A50 50 0 0 1 100 50H75A25 25 0 0 0 25 50Z"], ["folded", "Folded corner", "M0 0H100V80L80 100H0Z", "M80 100V80H100"], ["smiley", "Smiley face", OV, "M30 38h6M64 38h6M28 62Q50 84 72 62"], ["heart", "Heart", "M50 92C-20 50 10 0 50 28C90 0 120 50 50 92Z"], ["bolt", "Lightning bolt", "M38 0L66 34L56 40L84 70L72 76L100 100L40 82L52 76L22 52L34 46L0 18Z"],
      ["sun", "Sun", "M28 50A22 22 0 1 0 72 50A22 22 0 1 0 28 50Z", "M50 0V16M50 84V100M0 50H16M84 50H100M15 15L26 26M74 74L85 85M85 15L74 26M26 74L15 85"], ["moon", "Moon", "M70 2A50 50 0 1 0 70 98A40 40 0 1 1 70 2Z"], ["cloud", "Cloud", CLOUD], ["arc", "Arc", "", "M0 50A50 50 0 0 1 100 50"], ["brackets", "Double bracket", "", "M15 0Q0 0 0 15V85Q0 100 15 100M85 0Q100 0 100 15V85Q100 100 85 100"], ["braces", "Double brace", "", "M20 0Q8 0 8 12V40Q8 50 0 50Q8 50 8 60V88Q8 100 20 100M80 0Q92 0 92 12V40Q92 50 100 50Q92 50 92 60V88Q92 100 80 100"], ["lbracket", "Left bracket", "", "M100 0Q0 0 0 20V80Q0 100 100 100"], ["rbracket", "Right bracket", "", "M0 0Q100 0 100 20V80Q100 100 0 100"], ["lbrace", "Left brace", "", "M100 0Q50 0 50 20V40Q50 50 0 50Q50 50 50 60V80Q50 100 100 100"], ["rbrace", "Right brace", "", "M0 0Q50 0 50 20V40Q50 50 100 50Q50 50 50 60V80Q50 100 0 100"], ["tear", "Teardrop", "M100 0V50A50 50 0 1 1 50 0Z"], ["pie", "Pie", "M50 50L100 50A50 50 0 1 1 50 0Z"], ["chord", "Chord", "M85 15A50 50 0 1 1 15 15Z"], ["plaque", "Plaque", "M15 0H85A15 15 0 0 0 100 15V85A15 15 0 0 0 85 100H15A15 15 0 0 0 0 85V15A15 15 0 0 0 15 0Z"]],
    "Block arrows": [["aright", "Right arrow", "M0 30H60V0L100 50L60 100V70H0Z"], ["aleft", "Left arrow", "M100 30H40V0L0 50L40 100V70H100Z"], ["aup", "Up arrow", "M30 100V40H0L50 0L100 40H70V100Z"], ["adown", "Down arrow", "M30 0V60H0L50 100L100 60H70V0Z"], ["alr", "Left-right arrow", "M0 50L25 15V35H75V15L100 50L75 85V65H25V85Z"], ["aud", "Up-down arrow", "M50 0L85 25H65V75H85L50 100L15 75H35V25H15Z"], ["aquad", "Quad arrow", "M50 0L65 15H57V43H85V35L100 50L85 65V57H57V85H65L50 100L35 85H43V57H15V65L0 50L15 35V43H43V15H35Z"], ["abent", "Bent arrow", "M0 100V45Q0 25 20 25H70V5L100 35L70 65V45H25V100Z"], ["auturn", "U-turn arrow", "M0 100V40A40 40 0 0 1 80 40V55H95L72 85L48 55H62V40A22 22 0 0 0 18 40V100Z"], ["aleftup", "Left-up arrow", "M0 70L25 45V60H60V25H45L70 0L95 25H80V80H25V95Z"], ["astripe", "Striped right arrow", "M24 30H60V0L100 50L60 100V70H24ZM0 30H6V70H0ZM12 30H18V70H12Z"], ["anotch", "Notched right arrow", "M0 30H60V0L100 50L60 100V70H0L15 50Z"], ["ahome", "Pentagon arrow", "M0 0H75L100 50L75 100H0Z"], ["achev", "Chevron", "M0 0H75L100 50L75 100H0L25 50Z"], ["acallr", "Right arrow callout", "M0 0H55V30H75V15L100 50L75 85V70H55V100H0Z"], ["acalld", "Down arrow callout", "M0 0H100V55H70V75H85L50 100L15 75H30V55H0Z"], ["acirc", "Circular arrow", "M10 70A40 40 0 0 1 82 35L92 27L96 62L62 55L72 47A26 26 0 0 0 24 70Z"], ["acurve", "Curved right arrow", "M0 100C0 40 40 20 70 20V0L100 35L70 70V45C45 45 20 60 20 100Z"]],
    "Flowchart": [["fprocess", "Process", "M0 0H100V100H0Z"], ["falt", "Alternate process", "M12 0H88Q100 0 100 12V88Q100 100 88 100H12Q0 100 0 88V12Q0 0 12 0Z"], ["fdecision", "Decision", "M50 0L100 50L50 100L0 50Z"], ["fdata", "Data", "M25 0H100L75 100H0Z"], ["fpre", "Predefined process", "M0 0H100V100H0Z", "M12 0V100M88 0V100"], ["fstore", "Internal storage", "M0 0H100V100H0Z", "M15 0V100M0 15H100"], ["fdoc", "Document", "M0 0H100V82C70 70 30 100 0 88Z"], ["fmdoc", "Multidocument", "M0 12H88V90C62 80 26 104 0 94Z", "M6 6H94V84M12 0H100V78"], ["fterm", "Terminator", "M25 0H75A25 50 0 0 1 75 100H25A25 50 0 0 1 25 0Z"], ["fprep", "Preparation", "M20 0H80L100 50L80 100H20L0 50Z"], ["finput", "Manual input", "M0 25L100 0V100H0Z"], ["fmanual", "Manual operation", "M0 0H100L80 100H20Z"], ["fconn", "Connector", OV], ["foff", "Off-page connector", "M0 0H100V70L50 100L0 70Z"], ["fcard", "Card", "M20 0H100V100H0V20Z"], ["ftape", "Punched tape", "M0 10C25 30 75 -10 100 10V90C75 70 25 110 0 90Z"], ["fsum", "Summing junction", OV, "M15 15L85 85M85 15L15 85"], ["for", "Or", OV, "M50 0V100M0 50H100"], ["fcollate", "Collate", "M0 0H100L0 100H100Z"], ["fsort", "Sort", "M50 0L100 50L50 100L0 50Z", "M0 50H100"], ["fextract", "Extract", "M50 0L100 100H0Z"], ["fmerge", "Merge", "M0 0H100L50 100Z"], ["fstored", "Stored data", "M20 0H100Q80 50 100 100H20Q0 50 20 0Z"], ["fdelay", "Delay", "M0 0H50A50 50 0 0 1 50 100H0Z"], ["fseq", "Sequential access storage", OV, "M50 100H100V84"], ["fdisk", "Magnetic disk", "M0 12C0-4 100-4 100 12V88C100 104 0 104 0 88Z", "M0 12C0 28 100 28 100 12"], ["fdirect", "Direct access storage", "M12 0H88C104 0 104 100 88 100H12C-4 100 -4 0 12 0Z", "M88 0C72 0 72 100 88 100"], ["fdisplay", "Display", "M20 0H80Q100 0 100 50Q100 100 80 100H20L0 50Z"]],
    "Callouts": [["crect", "Rectangle callout", "M0 0H100V70H40L20 100L28 70H0Z"], ["cround", "Rounded callout", "M10 0H90Q100 0 100 10V60Q100 70 90 70H40L20 100L28 70H10Q0 70 0 60V10Q0 0 10 0Z"], ["coval", "Oval callout", "M45 71.5A50 36 0 1 0 30 69L15 100Z"], ["ccloud", "Thought bubble", "M25 70C5 70 0 50 18 44C10 25 35 15 48 25C55 8 85 10 85 30C100 34 100 60 82 66C80 78 60 78 55 72Z", "M24 84A5 5 0 1 0 24.1 84M12 95A3 3 0 1 0 12.1 95"], ["cline1", "Line callout", "M30 0H100V60H30Z", "M30 30L0 100"], ["cline2", "Bent line callout", "M30 0H100V60H30Z", "M30 30H15L0 100"], ["cline3", "Accent bar callout", "M30 0H100V60H30Z", "M24 0V60M24 30L0 100"]],
    "Stars and banners": [["s4", "4-point star", star(4, 0.3)], ["s5", "5-point star", star(5, 0.42)], ["s6", "6-point star", star(6, 0.55)], ["s7", "7-point star", star(7, 0.55)], ["s8", "8-point star", star(8, 0.6)], ["s10", "10-point star", star(10, 0.65)], ["s12", "12-point star", star(12, 0.7)], ["s16", "16-point star", star(16, 0.75)], ["s24", "24-point star", star(24, 0.8)], ["boom1", "Explosion", "M38 0L50 26L72 6L68 34L100 30L76 52L96 74L66 68L64 100L46 76L26 96L28 68L0 70L22 50L4 28L32 32Z"], ["boom2", "Explosion 2", "M30 0L44 22L62 2L64 26L90 14L78 40L100 50L76 58L92 84L64 74L58 100L44 78L24 96L26 70L0 74L18 52L2 34L28 34Z"], ["banner", "Ribbon", "M0 20H15V0H85V20H100L90 45L100 70H85V90H15V70H0L10 45Z", "M15 70V20M85 70V20"], ["wave", "Wave", "M0 15C25 -5 50 35 100 15V85C75 105 50 65 0 85Z"], ["dwave", "Double wave", "M0 15C17 0 33 30 50 15C67 0 83 30 100 15V85C83 100 67 70 50 85C33 100 17 70 0 85Z"], ["vscroll", "Vertical scroll", "M15 10Q15 0 25 0H95Q100 0 100 5Q100 10 95 10H85V95Q85 100 80 100H5Q0 100 0 95Q0 90 5 90H15Z"], ["hscroll", "Horizontal scroll", "M0 15Q0 10 5 10H90V5Q90 0 95 0Q100 0 100 5V85Q100 90 95 90H10V95Q10 100 5 100Q0 100 0 95Z"]]
  };
  const SH = {}; Object.entries(SHAPES).forEach(([cat, l]) => l.forEach((s) => { SH[s[0]] = { cat, name: s[1], d: s[2] || "", x: s[3] || "" }; }));
  MP.diaryShapes = SHAPES;
  const LINEK = { line: ["s", 0, 0], arrow: ["s", 0, 1], dblarrow: ["s", 1, 1], elbow: ["e", 0, 0], elbowa: ["e", 0, 1], elbowd: ["e", 1, 1], curve: ["c", 0, 0], curvea: ["c", 0, 1], curved: ["c", 1, 1] };
  const shapeThumb = (id) => { const s = SH[id]; if (LINEK[id]) { const [t, a1, a2] = LINEK[id]; const d = t === "s" ? "M10 90L90 10" : t === "e" ? "M10 90H50V10H90" : "M10 90C10 30 90 70 90 10"; return `<svg viewBox="0 0 100 100"><path d="${d}" fill="none" stroke="currentColor" stroke-width="6" ${a2 ? 'marker-end="url(#dah)"' : ""} ${a1 ? 'marker-start="url(#dah)"' : ""}/></svg>`; } return `<svg viewBox="-4 -4 108 108"><path d="${s.d}" fill="none" stroke="currentColor" stroke-width="5" fill-rule="evenodd"/>${s.x ? `<path d="${s.x}" fill="none" stroke="currentColor" stroke-width="5"/>` : ""}</svg>`; };

  /* ---------- stickers (original artwork) ---------- */
  const ST = {
    flower: '<g fill="#F48FB1"><circle cx="20" cy="10" r="7"/><circle cx="30" cy="18" r="7"/><circle cx="26" cy="30" r="7"/><circle cx="14" cy="30" r="7"/><circle cx="10" cy="18" r="7"/></g><circle cx="20" cy="21" r="5" fill="#FFD23F"/>',
    leaf: '<path d="M8 34C8 16 20 6 34 6 34 22 24 34 8 34z" fill="#5FA463"/><path d="M8 34L28 12" stroke="#2F6B35" stroke-width="1.5"/>',
    sun: '<g stroke="#FF9F1C" stroke-width="3" stroke-linecap="round"><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8"/></g><circle cx="20" cy="20" r="8" fill="#FFD23F"/>',
    moon: '<path d="M26 6a14 14 0 1 0 8 24A12 12 0 0 1 26 6z" fill="#F2C94C"/><circle cx="10" cy="9" r="1.6" fill="#fff"/><circle cx="34" cy="10" r="1.2" fill="#fff"/>',
    shell: '<path d="M20 34L6 14a16 12 0 0 1 28 0z" fill="#FFB4A2"/><g stroke="#C9705E" stroke-width="1.3"><path d="M20 34L12 9M20 34V7M20 34l8-25"/></g>',
    compass: '<circle cx="20" cy="20" r="15" fill="#F2E3C6" stroke="#7A5230" stroke-width="2"/><path d="M20 8l4 12-4 12-4-12z" fill="#C0392B"/>',
    heart: '<path d="M20 35S5 25 5 15a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 10-15 20-15 20z" fill="#F2546E"/>',
    star: '<path d="M20 3l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" fill="#FFD23F" stroke="#E0A800"/>',
    coffee: '<path d="M10 14h18v14a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7z" fill="#B88A52"/><path d="M28 17h3a4 4 0 0 1 0 8h-3" stroke="#B88A52" stroke-width="3" fill="none"/><path d="M15 4c-2 3 2 4 0 7M21 4c-2 3 2 4 0 7" stroke="#aaa" stroke-width="1.5" fill="none"/>',
    plant: '<path d="M10 24h20l-3 13H13z" fill="#D9734E"/><path d="M20 24c0-8-6-12-10-12 0 6 4 12 10 12zM20 24c0-10 6-14 11-14 0 8-5 14-11 14z" fill="#5FA463"/>',
    books: '<rect x="6" y="8" width="13" height="26" rx="1" fill="#3C7BD9"/><rect x="21" y="8" width="13" height="26" rx="1" fill="#F2546E"/>',
    tick: '<circle cx="20" cy="20" r="15" fill="#5FA463"/><path d="M12 20l6 6 10-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>',
    drop: '<path d="M20 5c5 6 12 8 12 17a12 12 0 0 1-24 0c0-9 7-11 12-17z" fill="#7BC4C4"/>',
    rain: '<path d="M8 28a8 8 0 0 1 2-15 10 10 0 0 1 19 2 7 7 0 0 1 3 13z" fill="#fff" stroke="#3C7BD9" stroke-width="1.5"/><path d="M14 31l-2 5M21 31l-2 5M28 31l-2 5" stroke="#3C7BD9" stroke-width="2"/>',
    feather: '<path d="M20 38C14 26 12 12 20 3c8 9 6 23 0 35z" fill="#0E7C86"/><ellipse cx="20" cy="14" rx="5" ry="6" fill="#1B4F9C"/><circle cx="20" cy="14" r="2.5" fill="#F2C94C"/>',
    diya: '<path d="M5 26c4 8 26 8 30 0z" fill="#C2410C"/><path d="M20 8c4 5 3 10 0 14-3-4-4-9 0-14z" fill="#FFB703"/>',
    palm: '<path d="M20 38c1-10 1-18-1-24" stroke="#8B5A2B" stroke-width="3" fill="none"/><path d="M19 14C12 6 4 9 3 14c6-3 11-2 16 0zM19 14c6-8 14-6 16-1-6-2-11-1-16 1zM19 14c-2-7 2-12 7-12-1 5-3 9-7 12z" fill="#1FA774"/>',
    rainbow: '<g fill="none" stroke-width="4"><path d="M4 32a16 16 0 0 1 32 0" stroke="#F48FB1"/><path d="M9 32a11 11 0 0 1 22 0" stroke="#FFD23F"/><path d="M14 32a6 6 0 0 1 12 0" stroke="#7BC4C4"/></g>',
    gold: '<path d="M20 4l4 12h12l-10 7 4 12-10-7-10 7 4-12-10-7h12z" fill="#D4AF37"/>',
    pin: '<circle cx="20" cy="13" r="9" fill="#E8574F"/><path d="M20 22v15" stroke="#555" stroke-width="2"/>',
    today: '<path d="M1 12h38l-5 8 5 8H1l5-8z" fill="#9B7BE0"/><text x="20" y="23" font-size="8" text-anchor="middle" fill="#fff" font-family="Manrope" font-weight="700">TODAY</text>',
    important: '<rect x="1" y="12" width="38" height="16" rx="8" fill="#FFD23F"/><text x="20" y="23" font-size="6.5" text-anchor="middle" fill="#5A3A00" font-family="Manrope" font-weight="700">IMPORTANT</text>',
    tape1: '<rect x="0" y="13" width="40" height="14" fill="#7BC4C4" opacity=".85"/>',
    tape2: '<rect x="0" y="13" width="40" height="14" fill="#F48FB1" opacity=".85"/><g fill="#fff" opacity=".7"><circle cx="7" cy="20" r="2"/><circle cx="17" cy="20" r="2"/><circle cx="27" cy="20" r="2"/><circle cx="37" cy="20" r="2"/></g>',
    tape3: '<rect x="0" y="13" width="40" height="14" fill="#FFD23F" opacity=".9"/><path d="M0 20h40" stroke="#E07A00" stroke-dasharray="4 3"/>',
    arrowc: '<path d="M3 30C12 8 28 8 36 18" stroke="#F2546E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 12l7 6-8 3" stroke="#F2546E" stroke-width="3" fill="none" stroke-linecap="round"/>'
  };
  const stickerSVG = (k) => `<svg viewBox="0 0 40 40" preserveAspectRatio="none" width="100%" height="100%">${ST[k] || ""}</svg>`;

  /* ---------- pictures: shrunk on the device, kept in IndexedDB, copied to your Drive folder ---------- */
  const IMG = {}; /* id → data URL cache */
  const IMS = () => MP.S.dimgs;
  const toDataURL = (blob) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(blob); });
  const dataToBlob = async (d) => { const [h, b64] = d.split(","), mime = h.slice(5, h.indexOf(";")), bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return new Blob([u8], { type: mime }); }; /* no fetch(): the page's security policy blocks data: requests */
  async function shrink(file) {
    if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type || "") && !/\.(jpe?g|png|webp|gif|heic)$/i.test(file.name || "")) throw new Error("Choose a photo or picture (JPG, PNG or WebP).");
    if (file.size > 30e6) throw new Error("That picture is very large (over 30 MB). Choose a smaller one.");
    const bmp = await createImageBitmap(file).catch(() => null); if (!bmp) throw new Error("This picture couldn't be opened here. Try a JPG or PNG.");
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
    const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const png = /png|gif|webp/i.test(file.type); const mime = png ? "image/png" : "image/jpeg";
    let url = c.toDataURL(mime, 0.82); if (png && url.length > 1.4e6) url = c.toDataURL("image/jpeg", 0.85);
    return { url, mime: url.slice(5, url.indexOf(";")), ar: h / w };
  }
  async function storeData(r, name, lib) {
    const id = "i" + new Date().toISOString().slice(0, 7) + Math.random().toString(36).slice(2, 8);
    IMG[id] = r.url; await MP.idbSet("dimg:" + id, r.url);
    IMS()[id] = { u: now(), t: r.mime, ar: r.ar, lib: lib ? 1 : 0, n: String(name || "picture").slice(0, 60) }; MP.changed(); return { id, ar: r.ar };
  }
  async function storeImg(file, lib) { const r = await shrink(file), o = await storeData(r, file.name, lib); pump(); return o; }

  /* ---------- PDFs: each page becomes a diary page you can write on (pdf.js from Mozilla, kept inside the app) ---------- */
  async function addPdf() {
    const f = await pickFile("application/pdf,.pdf"); if (!f) return;
    if (!/pdf$/i.test(f.type || "") && !/\.pdf$/i.test(f.name || "")) return MP.toast("Choose a PDF file");
    if (f.size > 20e6) return MP.toast("That PDF is over 20 MB. Split it or choose a smaller one.");
    if (!MP.diaryCur || !MP.diaryCur()) return MP.toast("Open a diary first");
    let lib; try { lib = await import("../vendor/pdfjs/pdf.min.js"); lib.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.js"; } catch (e) { return MP.toast("The PDF reader couldn't load. Check your internet connection once, then try again."); }
    let doc; try { doc = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()), isEvalSupported: false, disableFontFace: false }).promise; } catch (e) { return MP.toast(/password/i.test(String(e && e.name)) ? "This PDF is password-protected. Open it elsewhere and save a copy without the password." : "This PDF couldn't be opened."); }
    const total = doc.numPages, n = Math.min(total, 50);
    if (total > 50) MP.toast(`This PDF has ${total} pages; adding the first 50.`);
    const pages = [];
    for (let i = 1; i <= n; i++) {
      MP.toast(`Adding PDF page ${i} of ${n}…`);
      const pg = await doc.getPage(i), vp0 = pg.getViewport({ scale: 1 }), sc = Math.min(2.5, 1240 / vp0.width), vp = pg.getViewport({ scale: sc });
      const c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height); const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: cx, viewport: vp }).promise;
      const r = await storeData({ url: c.toDataURL("image/jpeg", 0.82), mime: "image/jpeg", ar: c.height / c.width }, `${f.name} p${i}`, false);
      pages.push({ bgim: r.id, bgfit: "contain", pdf: String(f.name || "PDF").slice(0, 60) + " · page " + i });
    }
    MP.diaryAddPages(pages); MP.dSel = false; MP.inputMode = "pen"; MP.render(); MP.toast(`Added ${n} page${n === 1 ? "" : "s"}. Write on them with the pen.`); pump();
  }
  let pumping = false;
  async function pump() {
    const G = MP.G; if (pumping || !G || !G.valid || !G.valid() || !G.uploadBin) return; pumping = true;
    try { for (const [id, m] of Object.entries(IMS())) { if (m.f || m.del) continue; const d = IMG[id] || (await MP.idbGet("dimg:" + id)); if (!d) continue; m.f = await G.uploadBin(`img-${id}.${m.t === "image/png" ? "png" : "jpg"}`, await dataToBlob(d), m.t); m.u = now(); MP.changed(); } } catch (e) { console.warn("photo upload", e); } pumping = false;
  }
  const waiting = {};
  async function getImg(id) {
    if (IMG[id]) return IMG[id];
    const d = await MP.idbGet("dimg:" + id); if (d) return (IMG[id] = d);
    const m = IMS()[id], G = MP.G; if (!m || !m.f || !G || !G.valid || !G.valid()) return null;
    if (waiting[id]) return waiting[id];
    return (waiting[id] = G.downloadBin(m.f).then(toDataURL).then(async (u) => { IMG[id] = u; await MP.idbSet("dimg:" + id, u); return u; }).catch(() => null));
  }
  const fillImgs = (root) => root.querySelectorAll("img[data-im]").forEach(async (el) => { const u = await getImg(el.dataset.im); if (u) el.src = u; else el.alt = "Photo not on this device yet (it appears once you're signed in and online)"; });
  const fillBg = async (el, id) => { const u = await getImg(id); if (u) el.style.backgroundImage = `url("${u}")`; };

  /* ---------- geometry ---------- */
  const rad = (d) => (d * Math.PI) / 180;
  const rot = (p, r) => { const c = Math.cos(rad(r)), s = Math.sin(rad(r)); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; };
  const ctr = (o) => ({ x: o.x + o.w / 2, y: o.y + o.h / 2 });
  const SIDE = { t: [0, -0.5], r: [0.5, 0], b: [0, 0.5], l: [-0.5, 0] };
  const anchor = (objs, e) => { if (!e) return { x: 0.5, y: 0.5 }; if (e.o) { const o = objs.find((x) => x.id === e.o); if (o) { const c = ctr(o), v = rot({ x: SIDE[e.s][0] * o.w, y: SIDE[e.s][1] * o.h }, o.r || 0); return { x: c.x + v.x, y: c.y + v.y, s: e.s }; } } return { x: e.x, y: e.y }; };
  const ldir = { t: [0, -1], b: [0, 1], l: [-1, 0], r: [1, 0] };
  function linePath(o, objs) {
    const a = anchor(objs, o.p1), b = anchor(objs, o.p2), S = (p) => `${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`;
    if (o.t === "e") { const horiz = a.s ? a.s === "l" || a.s === "r" : Math.abs(b.x - a.x) >= Math.abs(b.y - a.y); if (horiz) { const m = (a.x + b.x) / 2; return `M${S(a)}L${S({ x: m, y: a.y })}L${S({ x: m, y: b.y })}L${S(b)}`; } const m = (a.y + b.y) / 2; return `M${S(a)}L${S({ x: a.x, y: m })}L${S({ x: b.x, y: m })}L${S(b)}`; }
    if (o.t === "c") { const L = Math.hypot(b.x - a.x, b.y - a.y) * 0.5, da = a.s ? ldir[a.s] : [b.x > a.x ? 1 : -1, 0], db = b.s ? ldir[b.s] : [a.x > b.x ? 1 : -1, 0]; return `M${S(a)}C${S({ x: a.x + da[0] * L, y: a.y + da[1] * L })} ${S({ x: b.x + db[0] * L, y: b.y + db[1] * L })} ${S(b)}`; }
    return `M${S(a)}L${S(b)}`;
  }

  /* ---------- drawing the items ---------- */
  const rgba = (h, a) => { const x = (h || "#ffffff").replace("#", ""); if (x.length < 6) return h; const n = [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); return `rgba(${n[0]},${n[1]},${n[2]},${a ?? 1})`; };
  const cssFill = (c, g, a) => !c ? "transparent" : g ? (g.d === "r" ? `radial-gradient(circle,${rgba(c, a)},${rgba(g.c, a)})` : `linear-gradient(${g.d === "v" ? "180deg" : g.d === "h" ? "90deg" : "135deg"},${rgba(c, a)},${rgba(g.c, a)})`) : rgba(c, a);
  const box = (o) => `left:${o.x * 100}cqw;top:${o.y * 100}cqw;width:${o.w * 100}cqw;height:${o.h * 100}cqw;transform:rotate(${o.r || 0}deg);z-index:${(o.z || 1) + 1}`;
  function objHTML(o) {
    if (o.k === "photo") { const c = o.cr || { x: 0, y: 0, w: 1, h: 1 }; return `<div class="dob photo ${o.pf ? "polar" : ""}" data-ob="${o.id}" style="${box(o)}"><div class="clip"><img data-im="${E(o.im)}" alt="" draggable="false" style="width:${100 / c.w}%;height:${100 / c.h}%;left:${(-c.x / c.w) * 100}%;top:${(-c.y / c.h) * 100}%"></div></div>`; }
    if (o.k === "frame") return `<div class="dob frame" data-ob="${o.id}" style="${box(o)}"><span>📷 Add photo</span></div>`;
    if (o.k === "sticker") return `<div class="dob sticker" data-ob="${o.id}" style="${box(o)}">${o.im ? `<img data-im="${E(o.im)}" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain">` : stickerSVG(o.s)}</div>`;
    if (o.k === "text") return `<div class="dob textb" data-ob="${o.id}" style="${box(o)};background:${cssFill(o.bg, o.g, o.fo)};${o.bc ? `border:${o.bw || 2}px ${o.sd === "dash" ? "dashed" : o.sd === "dot" ? "dotted" : "solid"} ${o.bc};` : ""}"><div class="otx" style="font-family:'${E(o.font || "Caveat")}',cursive;font-size:${(o.sz || 4.4)}cqw;color:${o.tc || "var(--ink)"}">${o.html || ""}</div></div>`;
    if (o.k === "diagram") return diagHTML(o);
    if (o.k === "shape") { const s = SH[o.sh] || SH.rect, gid = "g" + o.id, da = o.sd === "dash" ? 'stroke-dasharray="8 6"' : o.sd === "dot" ? 'stroke-dasharray="1.5 5" stroke-linecap="round"' : "", st = `stroke="${o.sw === 0 ? "none" : o.sc || "#333"}" stroke-width="${o.sw ?? 3}" vector-effect="non-scaling-stroke" ${da}`;
      const grad = o.f && o.g ? (o.g.d === "r" ? `<radialGradient id="${gid}"><stop offset="0" stop-color="${o.f}"/><stop offset="1" stop-color="${o.g.c}"/></radialGradient>` : `<linearGradient id="${gid}" x1="0" y1="0" x2="${o.g.d === "v" ? 0 : 1}" y2="${o.g.d === "h" ? 0 : 1}"><stop offset="0" stop-color="${o.f}"/><stop offset="1" stop-color="${o.g.c}"/></linearGradient>`) : "";
      return `<div class="dob shape" data-ob="${o.id}" style="${box(o)}"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${grad ? `<defs>${grad}</defs>` : ""}<path d="${s.d}" fill="${o.f ? (grad ? `url(#${gid})` : o.f) : "none"}" fill-opacity="${o.fo ?? 1}" ${st} fill-rule="evenodd"/>${s.x ? `<path d="${s.x}" fill="none" ${st}/>` : ""}</svg><div class="otx" style="color:${o.tc || "#222"};font-family:'${E(o.font || "Manrope")}',sans-serif">${o.html || ""}</div></div>`; }
    return "";
  }
  const linesSVG = (objs, sel) => `<svg class="dlines" viewBox="0 0 100 ${RATIO * 100}" preserveAspectRatio="none"><defs><marker id="dah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker></defs>${objs.filter((o) => o.k === "line").map((o) => { const d = linePath(o, objs), sw = (o.sw ?? 3) / 6; return `<path d="${d}" fill="none" stroke="${o.sc || "#333"}" stroke-width="${sw}" ${o.a1 ? 'marker-start="url(#dah)"' : ""} ${o.a2 ? 'marker-end="url(#dah)"' : ""} stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" class="lhit" data-ob="${o.id}" fill="none" stroke="transparent" stroke-width="${Math.max(3, sw * 3)}"/>`; }).join("")}</svg>`;
  function selHTML(o, objs) {
    if (o.k === "line") { const a = anchor(objs, o.p1), b = anchor(objs, o.p2); return `<div class="dhd end" data-h="p1" style="left:${a.x * 100}cqw;top:${a.y * 100}cqw"></div><div class="dhd end" data-h="p2" style="left:${b.x * 100}cqw;top:${b.y * 100}cqw"></div>`; }
    return `<div class="dselb" style="${box(o)};z-index:999">${["nw", "ne", "se", "sw"].map((h) => `<div class="dhd c ${h}" data-h="${h}"></div>`).join("")}${o.k === "shape" || o.k === "text" || o.k === "frame" || o.k === "diagram" ? ["n", "e", "s", "w"].map((h) => `<div class="dhd m ${h}" data-h="${h}"></div>`).join("") : ""}<div class="dhd rot" data-h="rot" title="Drag to rotate">⟳</div></div>`;
  }
  let SEL = null; /* {pid, id} */
  const objsOf = (pid) => { const p = PS()[pid]; if (!p) return []; if (!Array.isArray(p.obj)) p.obj = []; return p.obj; };
  function renderLayer(pid) {
    const L = document.querySelector(`[data-dobjs="${CSS.escape(pid)}"]`); if (!L) return; RATIO = ratioFor(pid); const p = PS()[pid], objs = objsOf(pid);
    const s = SEL && SEL.pid === pid ? objs.find((o) => o.id === SEL.id) : null;
    const BG = document.querySelector(`[data-dbgim="${CSS.escape(pid)}"]`); if (BG) { BG.innerHTML = p.bgim ? `<div class="obg" style="opacity:${p.bgo ?? 1};${p.bgfit === "contain" ? "background-size:contain;background-color:#fff" : ""}"></div>` : ""; const bg = BG.firstChild; if (bg) fillBg(bg, p.bgim); }
    L.innerHTML = objs.filter((o) => o.k !== "line").sort((a, b) => (a.z || 0) - (b.z || 0)).map(objHTML).join("") + linesSVG(objs) + (s ? selHTML(s, objs) : "");
    fillImgs(L);
  }


  /* ---------- ready-made diagrams (like Word's SmartArt): tap a box to pick it, double-tap to type, + to add ---------- */
  const PAL = [["#5B8DEF", "#EAF1FF", "#1F3B73"], ["#2F9E6E", "#E6F6EE", "#14513A"], ["#E8574F", "#FDECEA", "#6B2416"], ["#9B7BE0", "#F1ECFC", "#3A2A6B"], ["#E0A100", "#FFF6DA", "#5A3A00"], ["#2B2622", "#F2EFE8", "#2B2622"]];
  const DG = {
    flow: ["Flowchart", () => [["Start"], ["Step 1"], ["Ready?", "", 1], ["Step 2"], ["End"]], [0.42, 0.9]],
    process: ["Process flow", () => [["Plan"], ["Do"], ["Check"], ["Act"]], [0.84, 0.16]],
    mind: ["Mind map", () => [["Main idea"], ["Idea 1", 0], ["Idea 2", 0], ["Idea 3", 0], ["Idea 4", 0]], [0.84, 0.6]],
    cycle: ["Cycle", () => [["Step 1"], ["Step 2"], ["Step 3"], ["Step 4"]], [0.62, 0.62]],
    tree: ["Hierarchy", () => [["Top"], ["Team A", 0], ["Team B", 0], ["Team C", 0], ["A1", 1], ["A2", 1]], [0.84, 0.5]],
    time: ["Timeline", () => [["Jan"], ["Mar"], ["Jun"], ["Sep"], ["Dec"]], [0.84, 0.26]],
    venn: ["Venn", () => [["A"], ["B"], ["Both"]], [0.7, 0.44]],
    pyr: ["Pyramid", () => [["Top"], ["Middle"], ["Base"]], [0.6, 0.5]]
  };
  MP.diaryDiagrams = DG;
  const newDiagram = (dt) => { const ids = []; const n = DG[dt][1]().map((r, i) => { const id = "n" + Math.random().toString(36).slice(2, 7); ids.push(id); return { id, t: r[0], p: r[1] != null && r[1] !== "" ? null : null, pi: r[1], d: r[2] ? 1 : 0 }; }); n.forEach((x) => { x.p = typeof x.pi === "number" ? ids[x.pi] : null; delete x.pi; }); return n; };
  /* layouts return boxes {id,x,y,w,h,shape} and lines in a 100×100 box */
  const kids = (n, id) => n.filter((x) => x.p === id);
  function layout(o) {
    const n = o.n || [], B = [], L = [], A = o.w / o.h; /* A: box width/height, to keep circles round */
    if (o.dt === "flow") { const k = n.length, gap = 100 / k; n.forEach((x, i) => { const h = gap * 0.62, w = x.d ? 46 : 70; B.push({ id: x.id, x: 50 - w / 2, y: i * gap + (gap - h) / 2, w, h, s: x.d ? "dia" : i === 0 || i === k - 1 ? "pill" : "rect" }); if (i) L.push([50, i * gap - (gap - h) / 2 + 0.5, 50, i * gap + (gap - h) / 2 - 0.5, 1]); }); }
    if (o.dt === "process") { const k = n.length, w = 100 / k; n.forEach((x, i) => B.push({ id: x.id, x: i * w, y: 8, w: w + 2, h: 84, s: i === 0 ? "home" : "chev" })); }
    if (o.dt === "cycle") { const k = n.length, R = 36, bw = Math.min(34, 90 / Math.max(3, k) * 1.4), bh = bw * A * 0.5; n.forEach((x, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / k; B.push({ id: x.id, x: 50 + R * Math.cos(a) - bw / 2, y: 50 + R * Math.sin(a) * 1 - bh / 2, w: bw, h: bh, s: "pill" }); const a1 = a + 0.42, a2 = a + (2 * Math.PI) / k - 0.42; L.push([50 + R * Math.cos(a1), 50 + R * Math.sin(a1), 50 + R * Math.cos(a2), 50 + R * Math.sin(a2), 1, "arc", R]); }); }
    if (o.dt === "mind") { const root = n.find((x) => !x.p) || n[0], ch = kids(n, root.id), rw = 26, rh = 22; B.push({ id: root.id, x: 50 - rw / 2, y: 50 - rh / 2, w: rw, h: rh, s: "oval", main: 1 });
      ch.forEach((c, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, ch.length), cx = 50 + 31 * Math.cos(a), cy = 50 + 34 * Math.sin(a), bw = 20, bh = 13; B.push({ id: c.id, x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh, s: "pill" }); L.push([50, 50, cx, cy, 0]);
        kids(n, c.id).forEach((g, j, arr) => { const b = a + (j - (arr.length - 1) / 2) * 0.42, gx = 50 + 46 * Math.cos(b), gy = 50 + 45 * Math.sin(b), gw = 15, gh = 9; B.push({ id: g.id, x: gx - gw / 2, y: gy - gh / 2, w: gw, h: gh, s: "line" }); L.push([cx, cy, gx, gy, 0]); }); }); }
    if (o.dt === "tree") { const root = n.find((x) => !x.p) || n[0], lv = []; const leaves = (id) => { const k = kids(n, id); return k.length ? k.reduce((s, c) => s + leaves(c.id), 0) : 1; }; const total = leaves(root.id), depth = (id, d = 0) => Math.max(d, ...kids(n, id).map((c) => depth(c.id, d + 1))); const D = depth(root.id) + 1, rowH = 100 / D;
      const place = (id, d, x0) => { const span = leaves(id) / total * 100, cx = x0 + span / 2, bw = Math.min(26, 100 / total * 0.86 * Math.max(1, leaves(id) > 1 ? 1.4 : 1)), bh = rowH * 0.55; B.push({ id, x: cx - bw / 2, y: d * rowH + (rowH - bh) / 2, w: bw, h: bh, s: "rect", main: d === 0 }); let x = x0; kids(n, id).forEach((c) => { const cs = leaves(c.id) / total * 100, ccx = x + cs / 2, y1 = d * rowH + (rowH + bh) / 2, y2 = (d + 1) * rowH + (rowH - bh) / 2, ym = (y1 + y2) / 2; L.push([cx, y1, cx, ym, 0], [cx, ym, ccx, ym, 0], [ccx, ym, ccx, y2, 0]); place(c.id, d + 1, x); x += cs; }); };
      place(root.id, 0, 0); }
    if (o.dt === "time") { const k = n.length; L.push([2, 50, 98, 50, 1]); n.forEach((x, i) => { const cx = 8 + (i * 84) / Math.max(1, k - 1), up = i % 2 === 0; B.push({ id: x.id, x: cx - 9, y: up ? 6 : 60, w: 18, h: 34, s: "rect" }); B.push({ dot: 1, x: cx - 2, y: 50 - 2 * A / 1, w: 4, h: 4 * A, s: "oval" }); L.push([cx, up ? 40 : 60, cx, 50, 0]); }); }
    if (o.dt === "venn") { const k = Math.min(3, Math.max(2, n.length - 1)), r = 30 / Math.max(1, A) * 1.0; const cs = k === 2 ? [[34, 50], [66, 50]] : [[38, 38], [62, 38], [50, 62]]; n.slice(0, k).forEach((x, i) => { const [cx, cy] = cs[i], rw = k === 2 ? Math.min(30, 46 / A) : Math.min(24, 34 / A), rh = rw * A; B.push({ id: x.id, x: cx - rw, y: cy - rh, w: rw * 2, h: rh * 2, s: "circ", lab: k === 2 ? [i ? 78 : 22, 50] : null }); }); const c = n[k]; if (c) B.push({ id: c.id, x: 40, y: (k === 2 ? 50 : 46) - 6, w: 20, h: 12, s: "none" }); }
    if (o.dt === "pyr") { const k = n.length; n.forEach((x, i) => { const y0 = (i * 100) / k, y1 = ((i + 1) * 100) / k; B.push({ id: x.id, x: 0, y: y0, w: 100, h: y1 - y0, s: "slice", a: [50 - (y0 / 100) * 50, 50 + (y0 / 100) * 50, 50 + (y1 / 100) * 50, 50 - (y1 / 100) * 50] }); }); }
    return { B, L };
  }
  function diagHTML(o) {
    const { B, L } = layout(o), pal = PAL[o.pal || 0], dsn = DSN && DSN.oid === o.id ? DSN.nid : null, n = o.n || [], fz = Math.max(1.6, Math.min(4.2, o.w * 100 * 0.045));
    const shp = (b, i) => { const sel = b.id === dsn ? ` stroke="#3C7BD9" stroke-width="3"` : ` stroke="${pal[0]}" stroke-width="1.6"`, fill = b.main ? pal[0] : pal[1], ve = ' vector-effect="non-scaling-stroke"';
      if (b.s === "rect") return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="1.5" fill="${fill}"${sel}${ve}/>`;
      if (b.s === "pill") return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${Math.min(b.w, b.h) / 2}" ry="${b.h / 2}" fill="${fill}"${sel}${ve}/>`;
      if (b.s === "dia") return `<path d="M${b.x + b.w / 2} ${b.y}L${b.x + b.w} ${b.y + b.h / 2}L${b.x + b.w / 2} ${b.y + b.h}L${b.x} ${b.y + b.h / 2}Z" fill="${pal[1]}"${sel}${ve}/>`;
      if (b.s === "oval") return `<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${b.dot ? pal[0] : fill}"${b.dot ? "" : sel}${ve}/>`;
      if (b.s === "circ") return `<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${PAL[(+(o.pal || 0) + i) % PAL.length][0]}" fill-opacity=".35"${sel}${ve}/>`;
      if (b.s === "chev" || b.s === "home") { const t = Math.min(b.w * 0.28, 8), p = b.s === "home" ? `M${b.x} ${b.y}` : `M${b.x} ${b.y}L${b.x + t} ${b.y + b.h / 2}`; return `<path d="${b.s === "home" ? `M${b.x} ${b.y}H${b.x + b.w - t}L${b.x + b.w} ${b.y + b.h / 2}L${b.x + b.w - t} ${b.y + b.h}H${b.x}Z` : `M${b.x} ${b.y}H${b.x + b.w - t}L${b.x + b.w} ${b.y + b.h / 2}L${b.x + b.w - t} ${b.y + b.h}H${b.x}L${b.x + t} ${b.y + b.h / 2}Z`}" fill="${PAL[(+(o.pal || 0) + i) % PAL.length][0]}"${sel}${ve}/>`; }
      if (b.s === "slice") { const [a, c, d, e] = b.a; return `<path d="M${a} ${b.y}H${c}L${d} ${b.y + b.h}H${e}Z" fill="${PAL[(+(o.pal || 0) + i) % PAL.length][0]}" stroke="#fff" stroke-width="2"${ve}/>`; }
      if (b.s === "line") return `<line x1="${b.x}" y1="${b.y + b.h}" x2="${b.x + b.w}" y2="${b.y + b.h}" stroke="${b.id === dsn ? "#3C7BD9" : pal[0]}" stroke-width="2"${ve}/>`;
      return ""; };
    const lines = L.map(([x1, y1, x2, y2, ar, kind, R]) => kind === "arc" ? `<path d="M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}" fill="none" stroke="${pal[0]}" stroke-width="2" vector-effect="non-scaling-stroke" marker-end="url(#dgah)"/>` : `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${pal[0]}" stroke-width="2" vector-effect="non-scaling-stroke" ${ar ? 'marker-end="url(#dgah)"' : ""}/>`).join("");
    const light = (b) => b.main || b.s === "chev" || b.s === "home" || b.s === "slice";
    const txt = B.filter((b) => b.id).map((b) => { const x = n.find((y) => y.id === b.id); if (!x) return ""; const lb = b.lab, bx = lb ? { x: lb[0] - 14, y: lb[1] - 8, w: 28, h: 16 } : b.s === "line" ? { x: b.x, y: b.y - 2, w: b.w, h: b.h } : b.s === "dia" ? { x: b.x + b.w * 0.18, y: b.y + b.h * 0.2, w: b.w * 0.64, h: b.h * 0.6 } : b.s === "chev" ? { x: b.x + 6, y: b.y, w: b.w - 10, h: b.h } : b; return `<div class="dn" data-dn="${E(x.id)}" style="left:${bx.x}%;top:${bx.y}%;width:${bx.w}%;height:${bx.h}%;color:${light(b) ? "#fff" : pal[2]};font-size:${fz * (b.main ? 1.15 : b.s === "line" ? 0.85 : 1)}cqw"><div class="dnt">${E(x.t)}</div></div>`; }).join("");
    return `<div class="dob diag" data-ob="${o.id}" style="${box(o)}"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="dgah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${pal[0]}"/></marker></defs>${lines}${B.map(shp).join("")}</svg>${txt}</div>`;
  }
  let DSN = null; /* the box picked inside a diagram: {oid, nid} */

  /* ---------- moving, resizing, rotating ---------- */
  const hist = {};
  const snap = (pid) => { (hist[pid] = hist[pid] || []).push(JSON.stringify({ obj: objsOf(pid), bgim: PS()[pid].bgim || "" })); if (hist[pid].length > 30) hist[pid].shift(); };
  const save = (pid) => { PS()[pid].u = now(); MP.changed(); };
  const pageOf = (el) => el.closest(".dpg");
  const pt = (e, pg) => { const r = pg.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.width }; };
  let drag = null;
  document.addEventListener("pointerdown", (e) => {
    const L = e.target.closest && e.target.closest(".selecting .dobjs"); if (!L) return;
    const pg = pageOf(L), pid = L.dataset.dobjs, objs = objsOf(pid), p0 = pt(e, pg), h = e.target.closest("[data-h]");
    MP._dActive = pid;
    if (h && SEL && SEL.pid === pid) { const o = objs.find((x) => x.id === SEL.id); if (!o) return; snap(pid); drag = { pid, o, mode: h.dataset.h, p0, o0: JSON.parse(JSON.stringify(o)), pg, moved: false }; e.preventDefault(); L.setPointerCapture(e.pointerId); return; }
    const hit = e.target.closest("[data-ob]");
    if (!hit) { if (SEL) { SEL = null; renderLayer(pid); tools(); } return; }
    const o = objs.find((x) => x.id === hit.dataset.ob); if (!o) return;
    if ((o.k === "text" || o.k === "shape") && hit.querySelector(".otx[contenteditable]") && e.target.closest(".otx")) return; /* editing text: let the cursor work */
    if (e.target.closest(".dnt[contenteditable]")) return;
    const was = SEL && SEL.id === o.id; SEL = { pid, id: o.id }; snap(pid);
    const dn = e.target.closest("[data-dn]"); if (o.k === "diagram" && !(was && DSN && DSN.oid === o.id && dn && DSN.nid === dn.dataset.dn)) { const nid = dn ? dn.dataset.dn : null; if (!DSN || DSN.oid !== o.id || DSN.nid !== nid) { DSN = { oid: o.id, nid }; drag = { pid, o, mode: "move", p0, o0: JSON.parse(JSON.stringify(o)), pg, moved: false, was: true }; e.preventDefault(); L.setPointerCapture(e.pointerId); renderLayer(pid); tools(); return; } }
    drag = { pid, o, mode: "move", p0, o0: JSON.parse(JSON.stringify(o)), pg, moved: false, was, dn: dn && dn.dataset.dn }; e.preventDefault(); L.setPointerCapture(e.pointerId);
    if (!was) { renderLayer(pid); tools(); }
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return; const { o, o0, p0, pg, mode } = drag, p = pt(e, pg), dx = p.x - p0.x, dy = p.y - p0.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.004) drag.moved = true; if (!drag.moved) return;
    const objs = objsOf(drag.pid);
    if (mode === "move") {
      if (o.k === "line") { ["p1", "p2"].forEach((k) => { if (!o0[k].o) o[k] = { x: o0[k].x + dx, y: o0[k].y + dy }; }); }
      else { o.x = o0.x + dx; o.y = o0.y + dy; }
    } else if (mode === "rot") {
      const c = ctr(o0); let a = (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI + 90; a = ((a % 360) + 360) % 360; const n = Math.round(a / 45) * 45; if (Math.abs(a - n) < 5) a = n % 360; o.r = Math.round(a);
    } else if (mode === "p1" || mode === "p2") {
      let best = null; objs.forEach((t) => { if (t.k === "line" || t.id === o.id) return; Object.keys(SIDE).forEach((s) => { const a = anchor(objs, { o: t.id, s }), d = Math.hypot(a.x - p.x, a.y - p.y); if (d < 0.035 && (!best || d < best.d)) best = { d, o: t.id, s }; }); });
      o[mode] = best ? { o: best.o, s: best.s } : { x: p.x, y: p.y };
    } else {
      const sx = /e/.test(mode) ? 1 : /w/.test(mode) ? -1 : 0, sy = /s/.test(mode) ? 1 : /n/.test(mode) ? -1 : 0, r = o0.r || 0, c0 = ctr(o0);
      const opp = rot({ x: -sx * o0.w / 2, y: -sy * o0.h / 2 }, r), oppW = { x: c0.x + opp.x, y: c0.y + opp.y };
      const loc = rot({ x: p.x - oppW.x, y: p.y - oppW.y }, -r);
      let w = sx ? Math.max(0.03, loc.x * sx) : o0.w, h = sy ? Math.max(0.03, loc.y * sy) : o0.h;
      if ((o.k === "photo" || o.k === "sticker") && sx && sy) { const k = Math.max(w / o0.w, h / o0.h); w = o0.w * k; h = o0.h * k; }
      const half = rot({ x: (sx || 0) * w / 2, y: (sy || 0) * h / 2 }, r), base = sx && sy ? oppW : { x: c0.x + (sx ? opp.x : 0), y: c0.y + (sy ? opp.y : 0) };
      const nc = sx && sy ? { x: oppW.x + half.x, y: oppW.y + half.y } : { x: base.x + half.x, y: base.y + half.y };
      o.w = w; o.h = h; o.x = nc.x - w / 2; o.y = nc.y - h / 2;
    }
    renderLayer(drag.pid);
  });
  document.addEventListener("pointerup", () => {
    if (!drag) return; const d = drag; drag = null;
    if (d.moved) save(d.pid); else { hist[d.pid] && hist[d.pid].pop(); if (d.o.k === "frame" && d.mode === "move") fillFrame(d.pid, d.o.id);
      else if (d.mode === "move" && d.was && (d.o.k === "text" || d.o.k === "shape")) { const el = document.querySelector(`[data-ob="${d.o.id}"]`); if (el) editText(d.pid, d.o, el); }
      else if (d.mode === "move" && d.was && d.o.k === "diagram" && d.dn) { const el = document.querySelector(`[data-ob="${d.o.id}"] [data-dn="${d.dn}"]`); if (el) editNode(d.pid, d.o, el); } }
  });
  document.addEventListener("dblclick", (e) => {
    const hit = e.target.closest && e.target.closest(".selecting .dobjs [data-ob]"); if (!hit) return; const pid = hit.closest("[data-dobjs]").dataset.dobjs, o = objsOf(pid).find((x) => x.id === hit.dataset.ob); if (!o) return;
    if (o.k === "text" || o.k === "shape") editText(pid, o, hit);
    if (o.k === "diagram") { const dn = e.target.closest("[data-dn]"); if (dn) editNode(pid, o, dn); }
    if (o.k === "photo") cropDlg(pid, o.id);
  });
  function editNode(pid, o, el) {
    const t = el.querySelector(".dnt"), x = (o.n || []).find((y) => y.id === el.dataset.dn); if (!t || !x) return; t.setAttribute("contenteditable", "true"); t.focus(); const s = window.getSelection(); s.selectAllChildren(t);
    t.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); t.blur(); } });
    t.addEventListener("blur", () => { x.t = (t.textContent || "").trim().slice(0, 120) || "…"; save(pid); renderLayer(pid); }, { once: true });
  }
  function editText(pid, o, el) {
    const t = el.querySelector(".otx"); if (!t || t.isContentEditable) return; t.setAttribute("contenteditable", "true"); el.classList.add("editing"); t.focus(); const s = window.getSelection(); s.selectAllChildren(t); s.collapseToEnd();
    const grow = () => { if (o.k !== "text") return; const pg = el.closest(".dpg"); if (!pg) return; const need = (t.scrollHeight + 12) / pg.getBoundingClientRect().width; if (need > o.h) { o.h = need; el.style.height = o.h * 100 + "cqw"; } };
    t.addEventListener("input", grow);
    t.addEventListener("blur", () => { o.html = MP.diaryClean(t.innerHTML); t.removeAttribute("contenteditable"); el.classList.remove("editing"); t.removeEventListener("input", grow); save(pid); renderLayer(pid); }, { once: true });
  }
  /* in Type mode, tap a text box or shape to type in it */
  document.addEventListener("click", (e) => { const el = e.target.closest && e.target.closest(".dpg.typing .dob.textb, .dpg.typing .dob.shape"); if (!el) return; const pid = el.closest("[data-dobjs]").dataset.dobjs, o = objsOf(pid).find((x) => x.id === el.dataset.ob); if (o) editText(pid, o, el); });

  /* ---------- adding things ---------- */
  const target = () => { const id = MP._dActive && document.querySelector(`[data-dobjs="${CSS.escape(MP._dActive)}"]`) ? MP._dActive : MP.diaryCur && MP.diaryCur(); return id; };
  const topZ = (pid) => Math.max(0, ...objsOf(pid).map((o) => o.z || 0)) + 1;
  function add(o) { const pid = target(); if (!pid) { MP.toast("Add a page first"); return null; } snap(pid); o.id = oid(); o.z = topZ(pid); o.r = o.r || 0; objsOf(pid).push(o); save(pid); SEL = { pid, id: o.id }; if (!MP.dSel) { MP.dSel = true; MP.render(); } else { renderLayer(pid); tools(); } return o; }
  const centred = (w, h) => (RATIO = ratioFor(target()), { x: 0.5 - w / 2, y: Math.min(RATIO - h - 0.04, Math.max(0.12, RATIO / 2 - h / 2)), w, h });
  const pickFile = (accept, capture) => new Promise((ok) => { const i = document.createElement("input"); i.type = "file"; i.accept = accept; if (capture) i.setAttribute("capture", "environment"); i.onchange = () => ok(i.files && i.files[0]); i.click(); });
  async function addPhoto(capture, into) {
    const f = await pickFile("image/*", capture); if (!f) return;
    try { MP.toast("Adding photo…"); const { id, ar } = await storeImg(f, false);
      if (into) { const o = objsOf(into.pid).find((x) => x.id === into.id); snap(into.pid); Object.assign(o, { k: "photo", im: id, ar, cr: fitCrop(ar, o.h / o.w), pf: 1 }); save(into.pid); SEL = { pid: into.pid, id: o.id }; renderLayer(into.pid); tools(); return; }
      const w = ar > 1.3 ? 0.42 : 0.6; add(Object.assign({ k: "photo", im: id, ar, cr: { x: 0, y: 0, w: 1, h: 1 } }, centred(w, w * ar)));
    } catch (e) { MP.toast(e.message || "Couldn't add that picture"); }
  }
  /* fill a frame: crop the photo to the frame's shape */
  const fitCrop = (ar, boxAr) => { if (ar > boxAr) { const h = boxAr / ar; return { x: 0, y: (1 - h) / 2, w: 1, h }; } const w = ar / boxAr; return { x: (1 - w) / 2, y: 0, w, h: 1 }; };
  const fillFrame = (pid, id) => addPhoto(false, { pid, id });

  /* ---------- toolbar in Select mode ---------- */
  const selObj = () => (SEL ? objsOf(SEL.pid).find((o) => o.id === SEL.id) : null);
  const cbtn = (a, t, l, extra = "", s) => `<button type="button" class="tool" data-ob-${a} title="${l}" aria-label="${l}" ${extra}>${s ? MP.dlb(t, s) : t}</button>`;
  const colIn = (a, v, l, sw) => `<label class="tool" title="${l}" style="position:relative">${sw}<input type="color" data-ob-${a} value="${v && v.startsWith("#") ? v : "#333333"}" class="overlay-input" aria-label="${l}"></label>`;
  function toolsHTML() {
    const o = selObj();
    let h = `<span class="dins">${cbtn("photo", "🖼", "Photo from gallery", "", "Photo")}${cbtn("camera", "📷", "Take a photo", "", "Camera")}${cbtn("stk", "★", "Stickers", "", "Sticker")}${cbtn("shp", "◇", "Shapes, lines, arrows and diagrams", "", "Shapes")}${cbtn("txt", "T", "Text box", "", "Text box")}${cbtn("imp", "⇪", "Import a picture or design", "", "Import")}${cbtn("web", "🔎", "Find designs online", "", "Designs")}${cbtn("pdf", "📄", "Add a PDF as pages to write on", "", "PDF")}${cbtn("undo", MP.ic("undo", 22), "Undo", "", "Undo")}</span>`;
    if (!o) return h + `<span class="tiny muted" style="margin-left:6px">Tap an item to move, resize or rotate it</span>`;
    h += `<span class="vsep"></span>`;
    if (o.k === "photo") h += cbtn("crop", "✂ Crop", "Crop") + cbtn("replace", "Replace", "Replace photo") + cbtn("polar", o.pf ? "▢ Border on" : "▢ Border", "White photo border");
    if (o.k === "frame") h += cbtn("fill", "📷 Add photo", "Put a photo in this frame");
    if (o.k === "shape") h += cbtn("fillpanel", `<span class="cdot" style="background:${cssFill(o.f, o.g, o.fo)}"></span>`, "Fill, transparency, gradient and outline", "", "Fill & line") + cbtn("nofill", "▢", "No fill: outline only, the page shows through", "", "Outline only") + colIn("tc", o.tc, "Text colour", MP.dlb("A", "Text colour")) + cbtn("edit", "✎", "Type in the shape", "", "Type text");
    if (o.k === "text") h += `<select class="f sm" data-ob-font aria-label="Font">${["Caveat", "Kalam", "Patrick Hand", "Dancing Script", "Fraunces", "Playfair Display", "Poppins", "Inter"].map((f) => `<option ${o.font === f ? "selected" : ""}>${f}</option>`).join("")}</select>` + cbtn("smaller", "A−", "Smaller") + cbtn("bigger", "A+", "Bigger") + colIn("tc", o.tc, "Text colour", MP.dlb("A", "Text colour")) + cbtn("fillpanel", `<span class="cdot" style="background:${cssFill(o.bg, o.g, o.fo)}"></span>`, "Box colour, transparency, gradient and border", "", "Box & border") + cbtn("edit", "✎", "Type in the box", "", "Type text");
    if (o.k === "diagram") { const tr = o.dt === "mind" || o.dt === "tree"; h += cbtn("dadd", tr ? "+ Branch" : "+ Add", tr ? "Add a branch under the picked box" : "Add a box after the picked one") + (tr ? cbtn("dsib", "+ Same level", "Add a box next to the picked one") : "") + cbtn("drm", "− Remove", "Remove the picked box") + (o.dt === "flow" ? cbtn("ddec", "◇ Decision", "Make the picked box a decision") : "") + cbtn("dedit", "✎ Text", "Type in the picked box") + cbtn("dpal", "🎨 Colours", "Change colours") + `<span class="tiny muted">${DSN && DSN.oid === o.id && DSN.nid ? "Box picked" : "Tap a box to pick it"}</span>`; }
    if (o.k === "line") h += colIn("stroke", o.sc, "Line colour", `<span class="cdot ring" style="border-color:${o.sc || "#333"}"></span>`) + `<select class="f sm" data-ob-sw aria-label="Line width">${[1, 2, 3, 5, 8].map((n) => `<option value="${n}" ${(o.sw ?? 3) == n ? "selected" : ""}>${n} pt</option>`).join("")}</select>` + `<select class="f sm" data-ob-lt aria-label="Line type">${[["s", "Straight"], ["e", "Elbow"], ["c", "Curved"]].map(([k, n]) => `<option value="${k}" ${o.t === k ? "selected" : ""}>${n}</option>`).join("")}</select>` + cbtn("a1", "◀", "Arrow at start", o.a1 ? 'style="background:var(--soft)"' : "") + cbtn("a2", "▶", "Arrow at end", o.a2 ? 'style="background:var(--soft)"' : "");
    if (o.k !== "line") h += cbtn("rot0", "⟲", "Straighten to 0°", "", `${Math.round(o.r || 0)}° · Straighten`);
    return h + cbtn("fwd", "⬆", "Bring forward", "", "Forward") + cbtn("back", "⬇", "Send backward", "", "Back") + cbtn("dup", "⧉", "Duplicate", "", "Copy") + cbtn("del", "🗑", "Delete", "", "Delete");
  }
  const tools = () => { const t = document.querySelector(".dtools .dctx"); if (t) t.innerHTML = toolsHTML(); };
  MP.dobjTools = () => `<span class="dctx row wrap" style="gap:4px;align-items:center">${toolsHTML()}</span>`;

  document.addEventListener("click", async (e) => {
    const b = e.target.closest && e.target.closest("[class~=tool],button,label"); if (!b) return;
    const a = Object.keys(b.dataset || {}).find((k) => k.startsWith("ob") && k !== "ob"); if (!a) return;
    const act = a.slice(2).replace(/^[A-Z]/, (c) => c.toLowerCase()), o = selObj(), pid = SEL && SEL.pid;
    const done = () => { save(pid); renderLayer(pid); tools(); };
    switch (act) {
      case "photo": return addPhoto(false);
      case "camera": return addPhoto(true);
      case "stk": return stickerDlg();
      case "shp": return shapeDlg();
      case "txt": { const o2 = add(Object.assign({ k: "text", html: "", font: "Caveat", sz: 4.4 }, centred(0.5, 0.11))); if (o2) setTimeout(() => { const el = document.querySelector(`[data-ob="${o2.id}"]`); if (el) editText(SEL.pid, o2, el); }, 50); return; }
      case "imp": return importDlg();
      case "web": return webDlg();
      case "pdf": return addPdf();
      case "undo": { const p2 = target(), h = hist[p2]; if (!h || !h.length) return MP.toast("Nothing to undo"); const s = JSON.parse(h.pop()); PS()[p2].obj = s.obj; PS()[p2].bgim = s.bgim; SEL = null; save(p2); renderLayer(p2); return tools(); }
    }
    if (!o) return;
    if (b.tagName === "LABEL" || b.tagName === "SELECT") return; /* colour pickers act on change */
    snap(pid);
    switch (act) {
      case "crop": return cropDlg(pid, o.id);
      case "replace": hist[pid].pop(); return fillFrame(pid, o.id);
      case "fill": hist[pid].pop(); return fillFrame(pid, o.id);
      case "polar": o.pf = o.pf ? 0 : 1; return done();
      case "nofill": o.f = ""; o.g = null; return done();
      case "fillpanel": hist[pid].pop(); return fillDlg(pid, o.id);
      case "nobg": o.bg = ""; return done();
      case "border": o.bc = o.bc ? "" : "#555555"; return done();
      case "smaller": o.sz = Math.max(2, (o.sz || 4.4) - 0.6); return done();
      case "bigger": o.sz = Math.min(14, (o.sz || 4.4) + 0.6); return done();
      case "edit": { hist[pid].pop(); const el = document.querySelector(`[data-ob="${o.id}"]`); if (el) editText(pid, o, el); return; }
      case "dadd": case "dsib": {
        const n = o.n, cur2 = DSN && DSN.oid === o.id && n.find((x) => x.id === DSN.nid), id = "n" + Math.random().toString(36).slice(2, 7), tr = o.dt === "mind" || o.dt === "tree";
        if (o.dt === "venn" && n.length >= 4) { hist[pid].pop(); return MP.toast("A Venn diagram has up to three circles"); }
        if (tr) { const root = n.find((x) => !x.p); const par = act === "dsib" ? (cur2 && cur2.p) || root.id : cur2 ? cur2.id : root.id; n.push({ id, t: "New", p: par }); }
        else if (o.dt === "venn") n.splice(n.length - 1, 0, { id, t: "C", p: null });
        else { const at = cur2 ? n.indexOf(cur2) + 1 : n.length - (o.dt === "flow" ? 1 : 0); n.splice(at, 0, { id, t: o.dt === "time" ? "Date" : "Step", p: null }); if (o.dt === "flow" || o.dt === "pyr") o.h = Math.min(RATIO - o.y - 0.02, o.h + (o.dt === "flow" ? 0.1 : 0.06)); }
        DSN = { oid: o.id, nid: id }; done(); setTimeout(() => { const el = document.querySelector(`[data-ob="${o.id}"] [data-dn="${id}"]`); if (el) editNode(pid, o, el); }, 30); return;
      }
      case "drm": { const n = o.n, cur2 = DSN && DSN.oid === o.id && n.find((x) => x.id === DSN.nid); if (!cur2) { hist[pid].pop(); return MP.toast("Tap a box first"); } if (!cur2.p && (o.dt === "mind" || o.dt === "tree")) { hist[pid].pop(); return MP.toast("The main box stays. Delete the whole diagram with 🗑"); } if (n.length <= 2) { hist[pid].pop(); return MP.toast("A diagram needs at least two boxes"); } const gone = new Set([cur2.id]); let grew = true; while (grew) { grew = false; n.forEach((x) => { if (x.p && gone.has(x.p) && !gone.has(x.id)) { gone.add(x.id); grew = true; } }); } o.n = n.filter((x) => !gone.has(x.id)); DSN = null; return done(); }
      case "ddec": { const cur2 = DSN && DSN.oid === o.id && o.n.find((x) => x.id === DSN.nid); if (!cur2) { hist[pid].pop(); return MP.toast("Tap a box first"); } cur2.d = cur2.d ? 0 : 1; return done(); }
      case "dedit": { hist[pid].pop(); const el = DSN && document.querySelector(`[data-ob="${o.id}"] [data-dn="${DSN.nid}"]`); if (!el) return MP.toast("Tap a box first"); return editNode(pid, o, el); }
      case "dpal": o.pal = ((o.pal || 0) + 1) % PAL.length; return done();
      case "a1": o.a1 = o.a1 ? 0 : 1; return done();
      case "a2": o.a2 = o.a2 ? 0 : 1; return done();
      case "rot0": o.r = 0; return done();
      case "fwd": o.z = topZ(pid); return done();
      case "back": { const mn = Math.min(...objsOf(pid).map((x) => x.z || 0)); o.z = mn - 1; return done(); }
      case "dup": { const c = JSON.parse(JSON.stringify(o)); c.id = oid(); c.z = topZ(pid); if (c.k === "line") { ["p1", "p2"].forEach((k) => { const p = anchor(objsOf(pid), c[k]); c[k] = { x: p.x + 0.03, y: p.y + 0.03 }; }); } else { c.x += 0.03; c.y += 0.03; } objsOf(pid).push(c); SEL = { pid, id: c.id }; return done(); }
      case "del": { PS()[pid].obj = objsOf(pid).filter((x) => x.id !== o.id).map((x) => { if (x.k === "line") ["p1", "p2"].forEach((k) => { if (x[k].o === o.id) { const p = anchor(objsOf(pid), x[k]); x[k] = { x: p.x, y: p.y }; } }); return x; }); SEL = null; MP.toast("Deleted · tap ↶ to undo"); return done(); }
    }
    hist[pid].pop();
  });
  document.addEventListener("input", (e) => {
    const t = e.target, a = Object.keys(t.dataset || {}).find((k) => /^ob(Fill|Stroke|Tc|Bg)$/.test(k)); if (!a) return; const o = selObj(); if (!o) return;
    const k = { obFill: "f", obStroke: "sc", obTc: "tc", obBg: "bg" }[a]; o[k] = t.value; renderLayer(SEL.pid);
  });
  document.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset || {}, o = selObj(); if (!o) return; const pid = SEL.pid;
    if (d.obFill !== undefined || d.obStroke !== undefined || d.obTc !== undefined || d.obBg !== undefined) { snap(pid); save(pid); return tools(); }
    if (d.obSw !== undefined) { snap(pid); o.sw = +t.value; save(pid); renderLayer(pid); return; }
    if (d.obLt !== undefined) { snap(pid); o.t = t.value; save(pid); renderLayer(pid); return; }
    if (d.obFont !== undefined) { snap(pid); o.font = t.value; save(pid); renderLayer(pid); }
  });
  document.addEventListener("keydown", (e) => { if (!SEL || !document.querySelector(".selecting") || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return; if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); const b = document.querySelector("[data-ob-del]"); if (b) b.click(); } });

  /* ---------- fill and outline (shapes and text boxes) ---------- */
  const FILLS = ["#FFFFFF", "#FFFDF6", "#F2EFE8", "#FFE3EC", "#FFE5D2", "#FFF6C7", "#DDF5E6", "#DDF0FB", "#ECE4FB", "#FF8C7A", "#E5484D", "#FF9F43", "#FFC145", "#FFE45C", "#B8E05C", "#2ECC71", "#2BB3A6", "#22C3E6", "#4FA3F7", "#4161E0", "#8E5CE6", "#E056A0", "#B8336A", "#C8734F", "#8B6B53", "#6B7A8F", "#2B2B2E", "#000000"];
  let fp = null;
  function fillDlg(pid, id) {
    const o = objsOf(pid).find((x) => x.id === id); if (!o) return; fp = { pid, id }; snap(pid);
    const shape = o.k === "shape", fc = shape ? o.f : o.bg, lc = shape ? o.sc || "#333333" : o.bc || "", lw = shape ? o.sw ?? 3 : o.bc ? o.bw || 2 : 0, g = o.g;
    const sw = (attr, c, on) => `<button class="dsw ${on ? "on" : ""}" ${attr}="${c}" style="background:${c}" aria-label="${c}"></button>`;
    MP.modal(`<div class="between"><h2>${shape ? "Fill and outline" : "Box colour and border"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="dpsec"><b>Fill</b></div>
      <div class="row wrap" style="gap:6px;align-items:center"><button class="dsw none ${!fc ? "on" : ""}" data-fpf="" title="No fill: only the outline, the page shows through">∅</button>${FILLS.map((c) => sw("data-fpf", c, fc && fc.toLowerCase() === c.toLowerCase())).join("")}<label class="dsw any" title="Any colour">+<input type="color" data-fpfany value="${fc || "#ffffff"}" class="overlay-input" aria-label="Any fill colour"></label></div>
      ${fc ? `<label class="row small mt" style="gap:10px">See-through <input type="range" min="0" max="90" step="5" value="${Math.round((1 - (o.fo ?? 1)) * 100)}" data-fpo style="flex:1"> <span class="tiny" data-fpov>${Math.round((1 - (o.fo ?? 1)) * 100)}%</span></label>
      <div class="dpsec"><b>Gradient</b> <span class="tiny muted">· blend into a second colour</span></div>
      <div class="row wrap" style="gap:6px;align-items:center"><button class="tool ${!g ? "on" : ""}" data-fpgd="">None</button>${[["h", "→ Across"], ["v", "↓ Down"], ["d", "↘ Corner"], ["r", "◎ Round"]].map(([k, n]) => `<button class="tool ${g && g.d === k ? "on" : ""}" data-fpgd="${k}">${n}</button>`).join("")}</div>
      ${g ? `<div class="row wrap mt" style="gap:6px;align-items:center"><span class="tiny muted">Second colour</span>${FILLS.map((c) => sw("data-fpg2", c, g.c && g.c.toLowerCase() === c.toLowerCase())).join("")}<label class="dsw any" title="Any colour">+<input type="color" data-fpg2any value="${g.c || "#ffffff"}" class="overlay-input" aria-label="Any second colour"></label></div>` : ""}` : ""}
      <div class="dpsec"><b>${shape ? "Outline" : "Border"}</b></div>
      <div class="row wrap" style="gap:6px;align-items:center"><button class="dsw none ${!lw ? "on" : ""}" data-fplw="0" title="No ${shape ? "outline" : "border"}">∅</button>${FILLS.filter((c, i) => i > 8).map((c) => sw("data-fpl", c, lw && lc.toLowerCase() === c.toLowerCase())).join("")}<label class="dsw any" title="Any colour">+<input type="color" data-fplany value="${lc || "#333333"}" class="overlay-input" aria-label="Any outline colour"></label></div>
      <div class="row wrap mt" style="gap:6px;align-items:center"><span class="tiny muted">Thickness</span>${[1, 2, 3, 5, 8].map((n) => `<button class="tool ${lw === n ? "on" : ""}" data-fplw="${n}">${n}</button>`).join("")}<span class="tiny muted" style="margin-left:10px">Style</span>${[["", "━ Solid"], ["dash", "╍ Dashed"], ["dot", "┈ Dotted"]].map(([k, n]) => `<button class="tool ${(o.sd || "") === k ? "on" : ""}" data-fpsd="${k}">${n}</button>`).join("")}</div>
      <div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn ghost" data-fpcancel>Undo changes</button><button class="btn" data-close>Done</button></div>`);
  }
  const fpApply = (fn, redraw = true) => { if (!fp) return; const o = objsOf(fp.pid).find((x) => x.id === fp.id); if (!o) return; fn(o, o.k === "shape"); save(fp.pid); renderLayer(fp.pid); tools(); if (redraw) { const a = document.querySelector("#modal .in"), t = a ? a.scrollTop : 0; fillDlg(fp.pid, fp.id); hist[fp.pid].pop(); const b = document.querySelector("#modal .in"); if (b) b.scrollTop = t; } };
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button"); if (!b || !fp) return; const d = b.dataset;
    if (d.fpf !== undefined) return fpApply((o, sh) => { if (sh) o.f = d.fpf; else o.bg = d.fpf; if (!d.fpf) o.g = null; });
    if (d.fpgd !== undefined) return fpApply((o, sh) => { o.g = d.fpgd ? { d: d.fpgd, c: (o.g && o.g.c) || "#FFFFFF" } : null; });
    if (d.fpg2 !== undefined) return fpApply((o) => { if (o.g) o.g.c = d.fpg2; });
    if (d.fpl !== undefined) return fpApply((o, sh) => { if (sh) { o.sc = d.fpl; if (!o.sw) o.sw = 3; } else { o.bc = d.fpl; if (!o.bw) o.bw = 2; } });
    if (d.fplw !== undefined) return fpApply((o, sh) => { const n = +d.fplw; if (sh) o.sw = n; else { o.bw = n; if (!n) o.bc = ""; else if (!o.bc) o.bc = "#555555"; } });
    if (d.fpsd !== undefined) return fpApply((o) => { o.sd = d.fpsd; });
    if (d.fpcancel !== undefined) { const h = hist[fp.pid]; if (h && h.length) { const s = JSON.parse(h.pop()); PS()[fp.pid].obj = s.obj; save(fp.pid); renderLayer(fp.pid); } fp = null; MP.closeModal(); tools(); return; }
  });
  document.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset || {}; if (!fp) return;
    if (d.fpo !== undefined) { const v = +t.value; const lab = document.querySelector("[data-fpov]"); if (lab) lab.textContent = v + "%"; return fpApply((o) => { o.fo = 1 - v / 100; }, false); }
    if (d.fpfany !== undefined) return fpApply((o, sh) => { if (sh) o.f = t.value; else o.bg = t.value; }, false);
    if (d.fpg2any !== undefined) return fpApply((o) => { if (o.g) o.g.c = t.value; }, false);
    if (d.fplany !== undefined) return fpApply((o, sh) => { if (sh) { o.sc = t.value; if (!o.sw) o.sw = 3; } else { o.bc = t.value; if (!o.bw) o.bw = 2; } }, false);
  });
  document.addEventListener("change", (e) => { const d = e.target.dataset || {}; if (fp && (d.fpfany !== undefined || d.fpg2any !== undefined || d.fplany !== undefined)) fpApply(() => {}); });

  /* ---------- dialogs ---------- */
  const dgThumb = (k) => { const [w, h] = DG[k][2]; return `<div style="position:relative;container-type:inline-size;height:66px;max-width:100%;aspect-ratio:${w}/${h}">${diagHTML({ id: "t", dt: k, n: newDiagram(k), pal: 0, x: 0, y: 0, w: 1, h: h / w, r: 0, z: 0 }).replace('class="dob diag"', 'class="dob diag thumb"')}</div>`; };
  function stickerDlg() {
    const mine = Object.entries(IMS()).filter(([, m]) => m.lib && !m.del);
    MP.modal(`<div class="between"><h2>Stickers</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="dstk">${Object.keys(ST).map((k) => `<button class="dstkb" data-stk="${k}" title="Add sticker">${stickerSVG(k)}</button>`).join("")}</div>
      ${mine.length ? `<div class="small mt"><b>My imports</b></div><div class="dstk">${mine.map(([id]) => `<button class="dstkb" data-stkim="${E(id)}"><img data-im="${E(id)}" alt="" style="width:100%;height:100%;object-fit:contain"></button>`).join("")}</div>` : ""}
      <p class="tiny muted mt">Tap a sticker to place it, then drag to move, pull a corner to resize, and use ⟳ to rotate. Import your own with ⇪.</p>`);
    fillImgs(document.getElementById("modal"));
  }
  function shapeDlg() {
    MP.modal(`<div class="between"><h2>Shapes</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <svg width="0" height="0" style="position:absolute"><defs><marker id="dah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs></svg>
      <div class="dshp"><div class="small"><b>Diagrams</b> <span class="tiny muted">· tap a box to pick it, double-tap to type, + to add</span></div><div class="ddgg">${Object.entries(DG).map(([k, d]) => `<button class="ddgb" data-dgm="${k}" title="${E(d[0])}"><span class="ddgt">${dgThumb(k)}</span><span class="tiny">${E(d[0])}</span></button>`).join("")}</div>${Object.entries(SHAPES).map(([cat, l]) => `<div class="small mt"><b>${cat}</b></div><div class="dshpg">${l.map((s) => `<button class="dshpb" data-shp="${s[0]}" title="${E(s[1])}" aria-label="${E(s[1])}">${shapeThumb(s[0])}</button>`).join("")}</div>`).join("")}</div>
      <p class="tiny muted mt">Double-tap a shape to type in it. Drag a line's end onto a shape and it stays attached when you move the shape.</p>`);
  }
  const TQ = { cognac: "vintage leather", kraft: "kraft paper", rose: "pink floral", botanical: "green botanical leaves", midnight: "night sky stars", ocean: "ocean watercolor", sunset: "sunset orange pink", lavender: "lavender purple", mango: "yellow summer", atlas: "vintage map", sakura: "cherry blossom", ivory: "minimal white", peacock: "peacock teal gold", marigold: "marigold diwali", monsoon: "rain blue", galaxy: "galaxy nebula", tropical: "tropical palm", coffee: "coffee brown cozy", luxe: "black and gold", rainbow: "pastel rainbow" };
  function webDlg() {
    const th = (MP.diaryTheme && MP.diaryTheme()) || "ivory", q = TQ[th] || "pastel", u = encodeURIComponent;
    const L = [["Unsplash", `https://unsplash.com/s/photos/${u(q + " background")}`, "Free photos and paper textures (Unsplash licence: free to use)."],
      ["Free paper textures", "https://allsvgicons.com/free-textures/", "Seamless paper, linen, watercolour textures, free for personal and commercial use."],
      ["Lovely Planner", "https://lovelyplanner.com/?p=8736", "17 free printable planner pages."],
      ["Free sticker packs on Gumroad", `https://gumroad.com/discover?query=${u("free digital stickers " + q)}`, "PNG stickers with clear backgrounds; most are free for personal use only."],
      ["Pinterest ideas", `https://www.pinterest.com/search/pins/?q=${u(q + " digital planner page")}`, "Ideas and links. Many pins lead to paid shops or personal-use-only files."]];
    MP.modal(`<div class="between"><h2>Find designs online</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <p class="small">Searches are set to match this diary's theme (<b>${E(q)}</b>). Download a picture you like, then come back and tap ⇪ Import to use it as a photo, sticker or page background.</p>
      <div class="stack" style="gap:8px">${L.map(([n, url, d]) => `<a class="card" style="padding:10px 14px;text-decoration:none;color:inherit" href="${E(url)}" target="_blank" rel="noopener noreferrer"><b>${E(n)} ↗</b><br><span class="tiny muted">${E(d)}</span></a>`).join("")}</div>
      <p class="tiny muted mt">Please check each design's licence: many are free for personal use only, and some can't be shared or sold.</p>`);
  }
  let impId = null;
  function importDlg(step) {
    const mine = Object.entries(IMS()).filter(([, m]) => m.lib && !m.del);
    if (step === "use") return MP.modal(`<div class="between"><h2>Use this picture as…</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="row wrap" style="gap:8px"><button class="btn" data-impuse="photo">Photo on the page</button><button class="btn ghost" data-impuse="sticker">Sticker</button><button class="btn ghost" data-impuse="bg">Page background</button><button class="btn ghost" data-impuse="lib">Just save to My imports</button></div>
      <p class="tiny muted mt">Saved in My imports either way, so you can reuse it on any page.</p>`);
    MP.modal(`<div class="between"><h2>Import</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <p class="small">Bring in a picture, a sticker (PNG with a clear background works best) or a page design you downloaded. It's shrunk to save space and kept in your Drive.</p>
      <div class="row wrap" style="gap:8px"><button class="btn" data-impgo>Choose a picture…</button><button class="btn ghost" data-ob-web>🔎 Find designs online</button>${PS()[target()] && PS()[target()].bgim ? `<button class="btn ghost" data-impbgrm>Remove page background</button>` : ""}</div>
      ${mine.length ? `<div class="small mt"><b>My imports</b> · tap to use again</div><div class="dstk">${mine.map(([id]) => `<button class="dstkb" data-implib="${E(id)}"><img data-im="${E(id)}" alt="" style="width:100%;height:100%;object-fit:contain"></button>`).join("")}</div>` : ""}`);
    fillImgs(document.getElementById("modal"));
  }
  document.addEventListener("click", async (e) => {
    const b = e.target.closest && e.target.closest("button"); if (!b) return; const d = b.dataset;
    if (d.dgm) { MP.closeModal(); const [w, h] = DG[d.dgm][2]; add(Object.assign({ k: "diagram", dt: d.dgm, n: newDiagram(d.dgm), pal: 0 }, centred(w, h))); return; }
    if (d.stk) { MP.closeModal(); add(Object.assign({ k: "sticker", s: d.stk }, centred(0.16, /^tape/.test(d.stk) ? 0.06 : 0.16))); return; }
    if (d.stkim) { MP.closeModal(); const ar = (IMS()[d.stkim] || {}).ar || 1; add(Object.assign({ k: "sticker", im: d.stkim }, centred(0.2, 0.2 * ar))); return; }
    if (d.shp) { MP.closeModal(); const L2 = LINEK[d.shp]; if (L2) { add({ k: "line", t: L2[0], a1: L2[1], a2: L2[2], p1: { x: 0.3, y: RATIO / 2 }, p2: { x: 0.7, y: RATIO / 2 - (L2[0] === "s" ? 0 : 0.12) }, sc: "#333333", sw: 3, x: 0, y: 0, w: 0, h: 0 }); return; } const sq = /oval|circle|^s\d|boom|sun|smiley|donut|nosym|pie|chord|fconn|fsum|for|fseq|heart|moon|plus|oct|hex|pent|hept|dec|dodec|cube|bolt|tear|aquad|acirc/.test(d.shp); add(Object.assign({ k: "shape", sh: d.shp, f: "#FFFFFF", sc: "#333333", sw: 3, html: "" }, centred(sq ? 0.26 : 0.34, sq ? 0.26 : 0.2))); return; }
    if (d.impgo !== undefined) { const f = await pickFile("image/*"); if (!f) return; try { MP.toast("Importing…"); const r = await storeImg(f, true); impId = r.id; importDlg("use"); } catch (er) { MP.toast(er.message || "Couldn't import that"); } return; }
    if (d.implib) { impId = d.implib; return importDlg("use"); }
    if (d.impbgrm !== undefined) { const pid = target(); snap(pid); delete PS()[pid].bgim; save(pid); MP.closeModal(); renderLayer(pid); return; }
    if (d.impuse) {
      MP.closeModal(); const m = IMS()[impId], ar = (m && m.ar) || 1;
      if (d.impuse === "photo") add(Object.assign({ k: "photo", im: impId, ar, cr: { x: 0, y: 0, w: 1, h: 1 } }, centred(0.5, 0.5 * ar)));
      if (d.impuse === "sticker") add(Object.assign({ k: "sticker", im: impId }, centred(0.22, 0.22 * ar)));
      if (d.impuse === "bg") { const pid = target(); if (!pid) return; snap(pid); PS()[pid].bgim = impId; save(pid); renderLayer(pid); MP.toast("Page background set · ⇪ Import can remove it"); }
      if (d.impuse === "lib") MP.toast("Saved to My imports");
      return;
    }
  });

  /* ---------- crop ---------- */
  let cs = null;
  async function cropDlg(pid, id) {
    const o = objsOf(pid).find((x) => x.id === id); if (!o || o.k !== "photo") return; const url = await getImg(o.im); if (!url) return MP.toast("This photo isn't on this device yet");
    cs = { pid, id, cr: Object.assign({ x: 0, y: 0, w: 1, h: 1 }, o.cr), ar: o.ar || 1, lock: 0 };
    MP.modal(`<div class="between"><h2>Crop photo</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <div class="row wrap small" style="gap:6px;margin-bottom:8px">Shape ${[["0", "Free"], ["orig", "Original"], ["1", "Square"], ["0.75", "4:3"], ["1.333", "3:4"], ["0.5625", "16:9"]].map(([k, n]) => `<button class="tool" data-crar="${k}">${n}</button>`).join("")}<button class="link tiny" data-crreset>Reset</button></div>
      <div class="crwrap"><div class="crimg" style="aspect-ratio:1/${cs.ar}"><img src="${url}" alt="" draggable="false"><div class="crbox"><div class="crh nw" data-crh="nw"></div><div class="crh ne" data-crh="ne"></div><div class="crh sw" data-crh="sw"></div><div class="crh se" data-crh="se"></div></div></div></div>
      <p class="tiny muted">Drag the box to move it, the corners to resize. The full photo is kept, so you can crop again later.</p>
      <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-crok>Apply crop</button></div>`);
    drawCrop();
  }
  const drawCrop = () => { const b = document.querySelector(".crbox"); if (!b || !cs) return; const c = cs.cr; Object.assign(b.style, { left: c.x * 100 + "%", top: c.y * 100 + "%", width: c.w * 100 + "%", height: c.h * 100 + "%" }); };
  let cd = null;
  document.addEventListener("pointerdown", (e) => { const box2 = e.target.closest && e.target.closest(".crbox"); if (!box2 || !cs) return; const im = box2.parentElement.getBoundingClientRect(); cd = { h: (e.target.closest("[data-crh]") || {}).dataset ? e.target.closest("[data-crh]").dataset.crh : "", c0: Object.assign({}, cs.cr), x0: e.clientX, y0: e.clientY, W: im.width, H: im.height }; if (!e.target.closest("[data-crh]")) cd.h = "move"; e.preventDefault(); box2.setPointerCapture(e.pointerId); });
  document.addEventListener("pointermove", (e) => {
    if (!cd) return; const dx = (e.clientX - cd.x0) / cd.W, dy = (e.clientY - cd.y0) / cd.H, c = Object.assign({}, cd.c0), m = 0.05;
    if (cd.h === "move") { c.x = Math.min(1 - c.w, Math.max(0, c.x + dx)); c.y = Math.min(1 - c.h, Math.max(0, c.y + dy)); }
    else {
      if (/w/.test(cd.h)) { const nx = Math.min(c.x + c.w - m, Math.max(0, c.x + dx)); c.w += c.x - nx; c.x = nx; } else c.w = Math.min(1 - c.x, Math.max(m, c.w + dx));
      if (/n/.test(cd.h)) { const ny = Math.min(c.y + c.h - m, Math.max(0, c.y + dy)); c.h += c.y - ny; c.y = ny; } else c.h = Math.min(1 - c.y, Math.max(m, c.h + dy));
      if (cs.lock) { const want = cs.lock / cs.ar; /* crop h/w in fractions so that the picture's shape is `lock` */ c.h = Math.min(1 - c.y, c.w * want); c.w = c.h / want; }
    }
    cs.cr = c; drawCrop();
  });
  document.addEventListener("pointerup", () => { cd = null; });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button"); if (!b || !cs) return; const d = b.dataset;
    if (d.crar !== undefined) { cs.lock = d.crar === "0" ? 0 : d.crar === "orig" ? cs.ar : +d.crar; if (cs.lock) { const want = cs.lock / cs.ar; let w = 1, h = want; if (h > 1) { h = 1; w = 1 / want; } cs.cr = { x: (1 - w) / 2, y: (1 - h) / 2, w, h }; } document.querySelectorAll("[data-crar]").forEach((x) => x.classList.toggle("on", x === b)); return drawCrop(); }
    if (d.crreset !== undefined) { cs.cr = { x: 0, y: 0, w: 1, h: 1 }; cs.lock = 0; return drawCrop(); }
    if (d.crok !== undefined) { const o = objsOf(cs.pid).find((x) => x.id === cs.id); snap(cs.pid); const c = ctr(o); o.cr = cs.cr; o.h = o.w * (cs.cr.h * cs.ar) / cs.cr.w; o.x = c.x - o.w / 2; o.y = c.y - o.h / 2; save(cs.pid); MP.closeModal(); renderLayer(cs.pid); cs = null; }
  });

  /* ---------- hooks used by the diary ---------- */
  MP.dobjAfter = () => {
    document.querySelectorAll("[data-dobjs]").forEach((L) => {
      const pid = L.dataset.dobjs, p = PS()[pid]; if (!p) return;
      if (!p.fr && MP.diaryFrames) { const fr = MP.diaryFrames(p.tpl); if (fr.length) { objsOf(pid).push(...fr.map(([x, y, w, h, r], i) => ({ id: oid(), k: "frame", x: x / PW, y: y / PW, w: w / PW, h: h / PW, r, z: i + 1 }))); } p.fr = 1; save(pid); }
      renderLayer(pid);
    });
    tools(); pump();
  };
  MP.dobjClear = () => { SEL = null; };
  /* 1.24 printing: the page's items as plain HTML (no handles), plus a background holder */
  MP.dobjStatic = (pid) => { RATIO = ratioFor(pid); const p = PS()[pid], objs = objsOf(pid); return { bg: p && p.bgim ? `<div class="obg" data-bgsrc="${E(p.bgim)}" style="opacity:${p.bgo ?? 1};${p.bgfit === "contain" ? "background-size:contain;background-color:#fff" : ""}"></div>` : "", objs: objs.filter((o) => o.k !== "line").sort((a, b) => (a.z || 0) - (b.z || 0)).map(objHTML).join("") + linesSVG(objs) }; };
  MP.dobjFillAll = async (root) => {
    const jobs = [...root.querySelectorAll("img[data-im]")].map(async (el) => { const u = await getImg(el.dataset.im); if (u) { el.src = u; if (!el.complete) await new Promise((ok) => { el.onload = el.onerror = ok; setTimeout(ok, 8000); }); } });
    root.querySelectorAll("[data-bgsrc]").forEach((el) => jobs.push(getImg(el.dataset.bgsrc).then((u) => new Promise((ok) => { if (!u) return ok(); el.style.backgroundImage = `url("${u}")`; const im = new Image(); im.onload = im.onerror = ok; im.src = u; setTimeout(ok, 8000); }))));
    await Promise.all(jobs);
  };
  MP.dobjPump = pump;
})();
