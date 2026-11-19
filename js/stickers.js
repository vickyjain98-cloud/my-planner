/* My Planner 1.25 — sticker packs and decorations (original artwork, drawn in code).
   40×40 artboard. Keys starting with "x-" are decorations that stretch freely (washi tape, sticky notes, bubbles). */
(function () {
  "use strict";
  const MP = (window.MP = window.MP || {});
  const W = '<g stroke="#fff" stroke-width="2.2" stroke-linejoin="round" paint-order="stroke">', G = "</g>"; /* white die-cut edge */
  const word = (t, bg, fg = "#fff", fs = 9) => `<rect x="1.5" y="11" width="37" height="18" rx="9" fill="${bg}" stroke="#fff" stroke-width="2"/><text x="20" y="${23.2 - (9 - fs) * 0.35}" text-anchor="middle" font-family="Fredoka,Quicksand,sans-serif" font-weight="600" font-size="${fs}" fill="${fg}" letter-spacing=".3">${t}</text>`;
  const tape = (bg, pat) => `<path d="M0 8l2-1.5L0 5V35l2-1.5-2-1.5h40l-2-1.5 2-1.5V7l-2-1.5L40 4z" fill="${bg}" opacity=".88"/>${pat || ""}`;
  const dotsP = (c) => [...Array(8)].map((_, i) => `<circle cx="${3 + i * 5}" cy="${i % 2 ? 14 : 26}" r="1.8" fill="${c}"/>`).join("");
  const PACKS = [
    ["Flowers", {
      tulip: `${W}<path d="M20 22v15" stroke="#4E8B4A" stroke-width="2"/><path d="M20 30c-6-1-9-6-9-6 5 0 8 3 9 6z" fill="#6BAF5D"/><path d="M12 8c0 9 3 14 8 14s8-5 8-14l-4 4-4-6-4 6z" fill="#F06C8B"/>${G}`,
      daisy: `${W}${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="20" cy="9" rx="4" ry="8" fill="#fff" stroke="#EADFD6" stroke-width=".8" transform="rotate(${a} 20 20)"/>`).join("")}<circle cx="20" cy="20" r="5.5" fill="#F7C548"/>${G}`,
      rose: `${W}<circle cx="20" cy="17" r="11" fill="#E8546B"/><path d="M20 10c4 0 6 3 6 6s-3 5-6 5-5-2-5-4 2-3 4-3" fill="none" stroke="#B83250" stroke-width="1.6"/><path d="M13 27c-3 3-4 7-4 9 4-1 7-3 9-7z" fill="#5FA463"/><path d="M27 27c3 3 4 7 4 9-4-1-7-3-9-7z" fill="#5FA463"/>${G}`,
      sunflower: `${W}${[...Array(12)].map((_, i) => `<ellipse cx="20" cy="7" rx="3.4" ry="7" fill="#FFC93C" transform="rotate(${i * 30} 20 20)"/>`).join("")}<circle cx="20" cy="20" r="7.5" fill="#7A4A26"/><circle cx="18" cy="18" r="1" fill="#A66A3A"/><circle cx="22" cy="21" r="1" fill="#A66A3A"/>${G}`,
      blossom: `${W}${[0, 72, 144, 216, 288].map((a) => `<path d="M20 20c-4-6-4-12 0-14 4 2 4 8 0 14z" fill="#F9C6D3" transform="rotate(${a} 20 20)"/>`).join("")}<circle cx="20" cy="20" r="3" fill="#F06C8B"/>${G}`,
      bouquet: `${W}<path d="M14 22l6 16 6-16z" fill="#F4A7B9"/><path d="M17 26h6" stroke="#fff" stroke-width="1.6"/><circle cx="13" cy="15" r="5" fill="#F06C8B"/><circle cx="21" cy="11" r="5.5" fill="#FFC93C"/><circle cx="28" cy="16" r="5" fill="#B49CE6"/><circle cx="20" cy="19" r="4" fill="#F9C6D3"/>${G}`,
      lavender: `${W}<path d="M20 38V8" stroke="#6BAF5D" stroke-width="1.8"/>${[8, 12, 16, 20, 24].map((y, i) => `<ellipse cx="${i % 2 ? 23 : 17}" cy="${y}" rx="3" ry="2.3" fill="#9D85D8"/>`).join("")}<ellipse cx="20" cy="6" rx="2.4" ry="3" fill="#B49CE6"/>${G}`,
      hibiscus: `${W}${[0, 72, 144, 216, 288].map((a) => `<path d="M20 20C12 14 13 5 20 4c7 1 8 10 0 16z" fill="#FF6F61" transform="rotate(${a} 20 20)"/>`).join("")}<path d="M20 20l7-9" stroke="#FFD23F" stroke-width="1.6"/><circle cx="27" cy="11" r="1.6" fill="#FFD23F"/>${G}`
    }],
    ["Plants", {
      cactus: `${W}<path d="M12 28h16l-2 10H14z" fill="#F4A7B9"/><rect x="16" y="8" width="8" height="21" rx="4" fill="#6BAF5D"/><path d="M16 18h-3a3 3 0 0 1-3-3v-3" stroke="#6BAF5D" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M24 15h3a3 3 0 0 0 3-3v-2" stroke="#6BAF5D" stroke-width="4" fill="none" stroke-linecap="round"/>${G}<circle cx="20" cy="7" r="1.8" fill="#F06C8B"/>`,
      monstera: `${W}<path d="M20 36C6 30 4 14 14 6c8-4 18 0 20 10 2 12-6 18-14 20z" fill="#3E8E5A"/>${G}<path d="M20 36l2-26M21 24l-9-6M21 18l10-5M20 30l-8-2M21 28l11-3" stroke="#2A6B42" stroke-width="1.3"/>`,
      potplant: `${W}<path d="M11 26h18l-3 12H14z" fill="#D98E5F"/><path d="M20 26c0-8-9-12-11-18 6 0 10 5 11 10 1-6 5-12 11-12-2 7-9 11-11 20z" fill="#5FA463"/>${G}`,
      succulent: `${W}<path d="M10 28h20l-2 9H12z" fill="#A9C6E8"/>${[-50, -25, 0, 25, 50].map((a) => `<ellipse cx="20" cy="18" rx="3.6" ry="10" fill="#8CC7A1" transform="rotate(${a} 20 28)"/>`).join("")}${G}`,
      fern: `${W}<path d="M20 38C20 24 22 12 30 4" stroke="#4E8B4A" stroke-width="1.8" fill="none"/>${[10, 15, 20, 25, 30].map((y, i) => `<ellipse cx="${20 + (38 - y) * 0.12 - 5}" cy="${y}" rx="5" ry="2" fill="#6BAF5D" transform="rotate(-25 20 ${y})"/><ellipse cx="${20 + (38 - y) * 0.12 + 5}" cy="${y - 2}" rx="5" ry="2" fill="#6BAF5D" transform="rotate(25 24 ${y})"/>`).join("")}${G}`,
      sprout: `${W}<path d="M8 32h24v6H8z" fill="#8B5E3C"/><path d="M20 32V18" stroke="#5FA463" stroke-width="2"/><path d="M20 20c-2-7-9-8-12-6 2 6 8 8 12 6zM20 18c2-7 9-9 12-6-2 6-8 8-12 6z" fill="#7BC46A"/>${G}`
    }],
    ["Cute", {
      catface: `${W}<path d="M8 12l3-8 6 6h6l6-6 3 8c3 4 3 14-2 19-6 5-14 5-20 0-5-5-5-15-2-19z" fill="#F7B267"/>${G}<circle cx="15" cy="20" r="1.8" fill="#333"/><circle cx="25" cy="20" r="1.8" fill="#333"/><path d="M18.5 24h3l-1.5 1.6z" fill="#E8546B"/><circle cx="12" cy="25" r="2" fill="#F4A7B9" opacity=".7"/><circle cx="28" cy="25" r="2" fill="#F4A7B9" opacity=".7"/>`,
      bunny: `${W}<ellipse cx="14" cy="10" rx="3.6" ry="9" fill="#fff" stroke="#E5D6DE" stroke-width=".8"/><ellipse cx="26" cy="10" rx="3.6" ry="9" fill="#fff" stroke="#E5D6DE" stroke-width=".8"/><circle cx="20" cy="26" r="11" fill="#fff" stroke="#E5D6DE" stroke-width=".8"/>${G}<ellipse cx="14" cy="10" rx="1.6" ry="6" fill="#F9C6D3"/><ellipse cx="26" cy="10" rx="1.6" ry="6" fill="#F9C6D3"/><circle cx="16" cy="25" r="1.5" fill="#333"/><circle cx="24" cy="25" r="1.5" fill="#333"/><path d="M19 28h2l-1 1.2z" fill="#E8546B"/>`,
      bear: `${W}<circle cx="10" cy="11" r="5" fill="#A0714F"/><circle cx="30" cy="11" r="5" fill="#A0714F"/><circle cx="20" cy="22" r="14" fill="#B5835A"/>${G}<ellipse cx="20" cy="27" rx="6" ry="4.5" fill="#E8CBA8"/><circle cx="15" cy="20" r="1.7" fill="#2B2B2B"/><circle cx="25" cy="20" r="1.7" fill="#2B2B2B"/><ellipse cx="20" cy="25" rx="2" ry="1.4" fill="#2B2B2B"/>`,
      penguin: `${W}<ellipse cx="20" cy="22" rx="12" ry="15" fill="#2D3142"/>${G}<ellipse cx="20" cy="25" rx="8" ry="11" fill="#fff"/><circle cx="16" cy="16" r="1.6" fill="#2D3142"/><circle cx="24" cy="16" r="1.6" fill="#2D3142"/><path d="M18 19h4l-2 2.4z" fill="#FFB347"/><path d="M14 37h5M21 37h5" stroke="#FFB347" stroke-width="2.4" stroke-linecap="round"/>`,
      cherry: `${W}<path d="M14 22c2-8 6-14 14-16M26 24c-1-8 0-13 2-18" stroke="#5A7D3A" stroke-width="1.6" fill="none"/><circle cx="13" cy="27" r="8" fill="#E5383B"/><circle cx="27" cy="28" r="7.5" fill="#E5383B"/><path d="M28 6c4-2 8 0 9 2-4 2-7 1-9-2z" fill="#6BAF5D"/>${G}<circle cx="11" cy="26" r="1" fill="#333"/><circle cx="15" cy="26" r="1" fill="#333"/><path d="M11.6 29q1.4 1.4 2.8 0" stroke="#333" fill="none"/>`,
      strawberry: `${W}<path d="M8 14c0-3 5-4 12-4s12 1 12 4c0 10-6 20-12 22C14 34 8 24 8 14z" fill="#F25F5C"/><path d="M12 11l-2-5 6 3 4-5 4 5 6-3-2 5z" fill="#5FA463"/>${G}${[[14, 18], [20, 17], [26, 18], [17, 24], [23, 24], [20, 30]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".9" ry="1.3" fill="#FFE07A"/>`).join("")}`,
      cloudface: `${W}<path d="M9 30a7 7 0 0 1 1-14 9 9 0 0 1 17-3 7 7 0 0 1 4 17z" fill="#fff" stroke="#D6E4F0" stroke-width=".8"/>${G}<circle cx="16" cy="22" r="1.4" fill="#333"/><circle cx="24" cy="22" r="1.4" fill="#333"/><path d="M18 25q2 2 4 0" stroke="#333" fill="none"/><circle cx="13" cy="25" r="1.8" fill="#F9C6D3"/><circle cx="27" cy="25" r="1.8" fill="#F9C6D3"/>`,
      starface: `${W}<path d="M20 3l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" fill="#FFD23F"/>${G}<circle cx="16.5" cy="19" r="1.3" fill="#333"/><circle cx="23.5" cy="19" r="1.3" fill="#333"/><path d="M18 22.5q2 2 4 0" stroke="#333" fill="none"/>`
    }],
    ["Study", {
      book: `${W}<path d="M4 10c6-2 11-1 16 2v24c-5-3-10-4-16-2z" fill="#7C9CC9"/><path d="M36 10c-6-2-11-1-16 2v24c5-3 10-4 16-2z" fill="#A9C6E8"/>${G}<path d="M8 15c3-1 6 0 9 1M8 19c3-1 6 0 9 1M23 16c3-1 6-2 9-1M23 20c3-1 6-2 9-1" stroke="#fff" stroke-width="1"/>`,
      pencil: `${W}<path d="M6 34l3-9L27 7l6 6-18 18z" fill="#FFC93C"/><path d="M27 7l3-3 6 6-3 3z" fill="#F4A7B9"/>${G}<path d="M6 34l3-9 6 6z" fill="#F2D3A6"/><path d="M6 34l1.2-3.6 2.4 2.4z" fill="#333"/>`,
      laptop: `${W}<rect x="7" y="9" width="26" height="17" rx="2" fill="#5B6C8F"/><path d="M3 29h34l-3 4H6z" fill="#8E9BB5"/>${G}<rect x="9.5" y="11.5" width="21" height="12" rx="1" fill="#CFE3F7"/>`,
      coffee: `${W}<path d="M8 14h20l-2 20a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#fff" stroke="#E3D5C8" stroke-width=".8"/><path d="M28 18h3a4 4 0 0 1 0 8h-3" stroke="#E3D5C8" stroke-width="2.4" fill="none"/>${G}<rect x="9" y="20" width="18" height="7" fill="#C89F7B"/><path d="M14 9q2-3 0-6M20 9q2-3 0-6" stroke="#BBB" stroke-width="1.4" fill="none"/>`,
      gradcap: `${W}<path d="M20 8l17 7-17 7-17-7z" fill="#2D3142"/><path d="M11 19v7c4 4 14 4 18 0v-7l-9 4z" fill="#3C4257"/>${G}<path d="M34 16v10" stroke="#FFD23F" stroke-width="1.4"/><circle cx="34" cy="27" r="1.8" fill="#FFD23F"/>`,
      notebook: `${W}<rect x="9" y="5" width="23" height="31" rx="2" fill="#F28C8C"/>${G}${[9, 14, 19, 24, 29].map((y) => `<circle cx="9" cy="${y}" r="1.4" fill="#fff" stroke="#999" stroke-width=".6"/>`).join("")}<rect x="14" y="11" width="13" height="6" rx="1" fill="#fff"/>`,
      bulb: `${W}<path d="M20 4a11 11 0 0 1 7 19c-2 2-2 4-2 6H15c0-2 0-4-2-6A11 11 0 0 1 20 4z" fill="#FFE07A"/><rect x="15" y="29" width="10" height="6" rx="1.5" fill="#B8B8C4"/>${G}<path d="M17 20l3 3 3-3M20 23v6" stroke="#E2A400" stroke-width="1.2" fill="none"/>`,
      clock: `${W}<circle cx="20" cy="20" r="15" fill="#fff" stroke="#7C9CC9" stroke-width="3"/>${G}<path d="M20 11v9l6 4" stroke="#2D3142" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="20" cy="20" r="1.4" fill="#E8546B"/>`,
      highlighter: `${W}<path d="M9 33l2-6 17-17 6 6-17 17z" fill="#B6F09C"/><path d="M28 10l4-4 6 6-4 4z" fill="#5FA463"/>${G}<path d="M9 33l2-6 6 6z" fill="#7BD34A"/>`,
      brain: `${W}<path d="M20 7c-4-3-10-1-10 4-4 1-5 6-2 9-2 4 1 9 6 8 2 4 6 4 6 1V7zM20 7c4-3 10-1 10 4 4 1 5 6 2 9 2 4-1 9-6 8-2 4-6 4-6 1" fill="#F7A8C4"/>${G}<path d="M14 14q3 1 2 5M26 14q-3 1-2 5M13 23q4 0 5 3M27 23q-4 0-5 3" stroke="#D96A94" stroke-width="1.2" fill="none"/>`
    }],
    ["Food", {
      carrot: `${W}<path d="M24 12L8 34c-1 1 0 2 1 1l22-16c2-4-3-9-7-7z" fill="#FF8C42"/><path d="M26 11c-1-4 0-7 3-8-1 3 0 5 1 6 1-3 4-4 7-3-2 2-3 4-5 5 3 0 5 2 5 4-3 0-6-1-8-2z" fill="#5FA463"/>${G}<path d="M14 26l3 1M18 21l3 1" stroke="#E06E1F" stroke-width="1.2"/>`,
      avocado: `${W}<path d="M20 4c6 0 9 8 11 16 2 9-4 15-11 15S7 29 9 20c2-8 5-16 11-16z" fill="#4E8B4A"/>${G}<path d="M20 8c4 0 7 7 8 13 1 7-3 11-8 11s-9-4-8-11c1-6 4-13 8-13z" fill="#D7EFA8"/><circle cx="20" cy="24" r="5" fill="#9A6A3F"/>`,
      apple: `${W}<path d="M20 12c-6-4-15 0-14 10 1 9 7 15 11 14 2-1 4-1 6 0 4 1 10-5 11-14 1-10-8-14-14-10z" fill="#E5383B"/><path d="M20 12c0-4 1-6 3-8M21 9c3-4 8-4 9-2-3 3-6 3-9 2z" stroke="#5A7D3A" fill="#6BAF5D" stroke-width="1.4"/>${G}<ellipse cx="13" cy="19" rx="2" ry="3" fill="#fff" opacity=".45"/>`,
      broccoli: `${W}<path d="M16 24h8l2 13h-12z" fill="#A6D86F"/><circle cx="13" cy="17" r="7" fill="#4E9F3D"/><circle cx="27" cy="17" r="7" fill="#4E9F3D"/><circle cx="20" cy="11" r="8" fill="#5FB548"/>${G}`,
      corn: `${W}<ellipse cx="20" cy="17" rx="7" ry="13" fill="#FFD23F"/><path d="M13 22c-4 4-6 10-5 15 5-2 9-6 11-12zM27 22c4 4 6 10 5 15-5-2-9-6-11-12z" fill="#6BAF5D"/>${G}${[8, 12, 16, 20].map((y) => `<path d="M14 ${y}h12" stroke="#E8B10A" stroke-width=".9"/>`).join("")}<path d="M20 5v20" stroke="#E8B10A" stroke-width=".9"/>`,
      mango: `${W}<path d="M30 9c-12-6-26 6-22 18 3 9 17 11 23 2 5-7 4-16-1-20z" fill="#FFB400"/><path d="M30 9c2-3 5-4 7-3-1 3-4 4-7 3z" fill="#5FA463"/>${G}<path d="M10 22c5 4 13 5 20-2" stroke="#F28C28" stroke-width="2" fill="none" opacity=".6"/>`,
      melon: `${W}<path d="M4 14h32A16 16 0 0 1 4 14z" fill="#5FA463"/><path d="M6.5 14h27A13.5 13.5 0 0 1 6.5 14z" fill="#FF6B6B"/>${G}${[[12, 19], [20, 22], [28, 19], [16, 25], [24, 25]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx=".9" ry="1.5" fill="#2B2B2B"/>`).join("")}`,
      chai: `${W}<path d="M9 16h20l-2 16a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="#E9C9A8"/><path d="M29 19h3a4 4 0 0 1 0 8h-4" stroke="#E9C9A8" stroke-width="2.4" fill="none"/>${G}<path d="M9.5 18h19" stroke="#B07B4F" stroke-width="2.4"/><path d="M15 12q2-3 0-6M21 12q2-3 0-6" stroke="#BBB" stroke-width="1.4" fill="none"/>`
    }],
    ["Occasion", {
      cake: `${W}<rect x="7" y="20" width="26" height="15" rx="2" fill="#F9C6D3"/><path d="M7 24c3 3 6-3 9 0s6-3 9 0 6-3 8 0v-4H7z" fill="#fff"/><rect x="19" y="11" width="2.4" height="9" fill="#7C9CC9"/>${G}<path d="M20.2 6c2 2 2 4 0 5-2-1-2-3 0-5z" fill="#FFB400"/><path d="M7 30h26" stroke="#F06C8B" stroke-width="2"/>`,
      balloons: `${W}<ellipse cx="14" cy="13" rx="7" ry="9" fill="#F06C8B"/><ellipse cx="26" cy="15" rx="7" ry="9" fill="#7C9CC9"/>${G}<path d="M14 22q2 6-2 16M26 24q-2 6 1 14" stroke="#999" stroke-width=".8" fill="none"/><ellipse cx="12" cy="10" rx="1.6" ry="2.4" fill="#fff" opacity=".6"/>`,
      gift: `${W}<rect x="7" y="16" width="26" height="20" rx="2" fill="#7BC4C4"/><rect x="5" y="12" width="30" height="6" rx="1.5" fill="#5AAFAF"/>${G}<path d="M20 12v24" stroke="#F06C8B" stroke-width="3"/><path d="M20 12c-4-7-11-5-8-1 2 2 8 1 8 1zm0 0c4-7 11-5 8-1-2 2-8 1-8 1z" fill="#F06C8B"/>`,
      partyhat: `${W}<path d="M20 4l10 30H10z" fill="#B49CE6"/>${G}<path d="M15 19l10 3M12 27l16 4" stroke="#FFD23F" stroke-width="2.4"/><circle cx="20" cy="4" r="2.4" fill="#F06C8B"/>`,
      heart: `${W}<path d="M20 35C8 26 3 19 6 12c3-6 11-6 14 0 3-6 11-6 14 0 3 7-2 14-14 23z" fill="#F25F5C"/>${G}<ellipse cx="12" cy="14" rx="2" ry="3" fill="#fff" opacity=".5" transform="rotate(-30 12 14)"/>`,
      bow: `${W}<path d="M20 20L6 11c-3 2-3 16 0 18zM20 20l14-9c3 2 3 16 0 18z" fill="#F06C8B"/><path d="M18 21l-5 15 4-2 3 3zM22 21l5 15-4-2-3 3z" fill="#E04A6F"/>${G}<circle cx="20" cy="20" r="3.6" fill="#E04A6F"/>`,
      diya: `${W}<path d="M5 24h30c-2 8-8 11-15 11S7 32 5 24z" fill="#E07A2B"/>${G}<path d="M20 22c-4-3-4-9 0-15 4 6 4 12 0 15z" fill="#FFC93C"/><path d="M20 20c-2-2-2-5 0-8 2 3 2 6 0 8z" fill="#FF7A00"/><path d="M9 28h22" stroke="#FFD23F" stroke-width="1.4" stroke-dasharray="2 2"/>`,
      sparkle: `${[[20, 20, 14, "#FFD23F"], [8, 9, 6, "#F06C8B"], [32, 31, 6, "#7C9CC9"]].map(([x, y, r, c]) => `<path d="M${x} ${y - r}q${r * 0.15} ${r * 0.85} ${r} ${r}q${-r * 0.85} ${r * 0.15} ${-r} ${r}q${-r * 0.15} ${-r * 0.85} ${-r} ${-r}q${r * 0.85} ${-r * 0.15} ${r} ${-r}z" fill="${c}" stroke="#fff" stroke-width="1.6" paint-order="stroke"/>`).join("")}`
    }],
    ["Nature", {
      rainbow: `${W}${["#F25F5C", "#FFB400", "#FFE07A", "#7BC46A", "#7C9CC9"].map((c, i) => `<path d="M${4 + i * 3} 30a${16 - i * 3} ${16 - i * 3} 0 0 1 ${32 - i * 6} 0" stroke="${c}" stroke-width="3" fill="none"/>`).join("")}<circle cx="7" cy="31" r="5" fill="#fff"/><circle cx="33" cy="31" r="5" fill="#fff"/>${G}`,
      rain: `${W}<path d="M9 22a6 6 0 0 1 1-12 8 8 0 0 1 15-2 6 6 0 0 1 5 14z" fill="#CFE3F7"/>${G}<path d="M12 27l-2 6M20 27l-2 6M28 27l-2 6" stroke="#7C9CC9" stroke-width="2" stroke-linecap="round"/>`,
      snow: `<g stroke="#7FB8E6" stroke-width="2.4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M20 4v32M16 8l4 4 4-4M16 32l4-4 4 4" transform="rotate(${a} 20 20)"/>`).join("")}</g>`,
      mountain: `${W}<path d="M2 34l12-20 8 12 5-7 11 15z" fill="#8FB6A3"/>${G}<path d="M10.5 20l3.5-6 3.5 6-2-1-1.5 2-1.5-2z" fill="#fff"/><circle cx="31" cy="9" r="4" fill="#FFD23F"/>`,
      wave: `${W}<path d="M2 26c6-12 16-14 22-8-5-1-8 3-6 7 3 5 11 3 12-3 2 6-2 13-12 14H2z" fill="#4FA3F7"/>${G}<path d="M2 32c6 2 12 2 20 0" stroke="#fff" stroke-width="1.4" fill="none"/>`,
      palm: `${W}<path d="M21 14c0 8-2 16-6 24h5c3-8 4-16 3-24z" fill="#B07B4F"/><path d="M22 14c-4-5-12-6-16-2 6-1 11 1 16 2zM22 14c3-6 11-8 15-4-6 0-11 2-15 4zM22 14c-1-5 1-10 6-12-1 5-4 9-6 12zM22 14c-5 0-10 4-11 9 4-4 7-7 11-9z" fill="#5FA463"/>${G}`
    }],
    ["Words", {
      "w-today": word("TODAY", "#F06C8B"), "w-todo": word("TO DO", "#7C9CC9"), "w-notes": word("NOTES", "#8FB6A3"), "w-goals": word("GOALS", "#B49CE6"),
      "w-imp": word("IMPORTANT", "#E5383B", "#fff", 6.2), "w-exam": word("EXAM", "#2D3142"), "w-yay": word("YAY!", "#FFC93C", "#5C3B00"), "w-done": word("DONE", "#5FA463"),
      "w-due": word("DUE", "#FF8C42"), "w-selfcare": word("SELF-CARE", "#F9C6D3", "#8A3B57", 6.4), "w-revise": word("REVISE", "#4FA3F7"), "w-week": word("THIS WEEK", "#E9C9A8", "#5C3B00", 6.2)
    }],
    ["Decor", {
      "x-tape-pink": tape("#F9C6D3", dotsP("#fff")),
      "x-tape-mint": tape("#BFE3D0", [...Array(9)].map((_, i) => `<path d="M${i * 5} 5v30" stroke="#fff" stroke-width="1.6" opacity=".8"/>`).join("")),
      "x-tape-grid": tape("#D6E4F0", [...Array(9)].map((_, i) => `<path d="M${i * 5} 5v30" stroke="#9BB8D6" stroke-width=".6"/>`).join("") + [12, 20, 28].map((y) => `<path d="M0 ${y}h40" stroke="#9BB8D6" stroke-width=".6"/>`).join("")),
      "x-tape-hearts": tape("#FDE2B8", [5, 15, 25, 35].map((x, i) => `<path d="M${x} ${i % 2 ? 24 : 16}c-2-2-4-1-3 1l3 3 3-3c1-2-1-3-3-1z" fill="#F06C8B"/>`).join("")),
      "x-tape-kraft": tape("#D9B48A", [...Array(10)].map((_, i) => `<path d="M${i * 4.4} 5l4 30" stroke="#C49A6C" stroke-width=".8"/>`).join("")),
      "x-tape-lilac": tape("#E2DBF3", dotsP("#B49CE6")),
      "x-note-yellow": `<path d="M2 2h36v29l-7 7H2z" fill="#FFF3A6"/><path d="M38 31h-7v7z" fill="#E6D46E"/>`,
      "x-note-pink": `<path d="M2 3h36v32l-3-1.5-3 1.5-3-1.5-3 1.5-3-1.5-3 1.5-3-1.5-3 1.5-3-1.5-3 1.5-3-1.5-3 1.5z" fill="#FBD3DE"/>`,
      "x-note-grid": `<rect x="2" y="2" width="36" height="36" fill="#fff" stroke="#E3E3E3"/>${[...Array(8)].map((_, i) => `<path d="M${2 + (i + 1) * 4} 2v36M2 ${2 + (i + 1) * 4}h36" stroke="#E7EEF7" stroke-width=".6"/>`).join("")}`,
      "x-cloud": `<path d="M8 34C2 34 1 27 5 24 1 20 4 13 10 14 11 7 19 5 23 10 27 5 36 7 35 15 40 17 40 26 35 28 37 33 31 37 27 33 23 38 15 38 13 33 11 35 9 35 8 34z" fill="#FFF6D5"/>`,
      "x-bubble": `<path d="M4 4h32a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H16l-7 6v-6H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="#E2DBF3"/>`,
      "x-banner": `<path d="M0 10h6v20H0l3-10zM40 10h-6v20h6l-3-10z" fill="#E07A8A"/><rect x="4" y="8" width="32" height="24" fill="#F4A7B9"/>`,
      "x-label": `<path d="M2 10h30l6 10-6 10H2z" fill="#D2ECE3"/><circle cx="31" cy="20" r="1.8" fill="#fff"/>`,
      "x-frame": `<rect x="2" y="2" width="36" height="36" rx="3" fill="none" stroke="#B49CE6" stroke-width="2" stroke-dasharray="4 3"/>`,
      "x-torn": `<path d="M2 4l4 1 3-1 4 1 4-1 3 1 4-1 3 1 4-1 3 1 4-1v32l-3-1-4 1-3-1-4 1-4-1-3 1-4-1-3 1-4-1-4 1z" fill="#FBF7EF" stroke="#E6DCC9" stroke-width=".6"/>`
    }]
  ];
  const ALL = {}; PACKS.forEach(([, s]) => Object.assign(ALL, s));
  MP.STICKER_PACKS = PACKS;
  MP.STK = ALL;
  /* starting size on the page (fraction of page width) */
  MP.stkSize = (k) => /^x-tape/.test(k) ? [0.34, 0.08] : /^x-(note|torn|frame)/.test(k) ? [0.3, 0.3] : /^x-(cloud|bubble)/.test(k) ? [0.38, 0.26] : /^x-(banner|label)/.test(k) ? [0.4, 0.12] : /^w-/.test(k) ? [0.22, 0.22] : [0.16, 0.16];
})();
