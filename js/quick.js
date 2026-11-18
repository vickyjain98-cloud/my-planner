/* My Planner — quick add (1.13): "Call bank tomorrow 6 pm", "Gym every Mon Wed Fri 7 am", "kal subah 9 baje doctor".
   Understands plain English plus common Hinglish words. Runs on the device only; nothing is sent anywhere. */
"use strict";
(function (root) {
  const MP = (root.MP = root.MP || {});
  const pad = (n) => String(n).padStart(2, "0");
  const isoD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addD = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  const WDAY = { sun: 0, sunday: 0, ravivar: 0, mon: 1, monday: 1, somvar: 1, tue: 2, tues: 2, tuesday: 2, mangalvar: 2, wed: 3, weds: 3, wednesday: 3, budhvar: 3, thu: 4, thur: 4, thurs: 4, thursday: 4, guruvar: 4, fri: 5, friday: 5, shukravar: 5, sat: 6, saturday: 6, shanivar: 6 };
  const WDC = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const MON = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 };
  const WDRE = "(?:sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|ravivar|somvar|mangalvar|budhvar|guruvar|shukravar|shanivar)";
  const MONRE = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
  const PART = { morning: 9, subah: 9, savere: 9, afternoon: 14, dopahar: 14, evening: 18, shaam: 18, sham: 18, night: 21, raat: 21, tonight: 21 };

  MP.quickParse = (raw, now = new Date()) => {
    const out = { t: "", kind: "", d: "", time: "", end: "", rep: "", repDays: [], urg: false, imp: false, due: "", heard: [] };
    let s = " " + String(raw || "").replace(/\s+/g, " ").trim() + " ";
    const take = (re, fn) => { const m = s.match(re); if (!m) return false; s = s.slice(0, m.index) + " " + s.slice(m.index + m[0].length); if (fn) fn(m); return true; };
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateFrom = (day, mon) => { let y = base.getFullYear(), d = new Date(y, mon, day); if (d.getMonth() !== mon) return ""; if (d < base) d = new Date(y + 1, mon, day); return isoD(d); };
    const nextWd = (w, strict) => { let n = (w - base.getDay() + 7) % 7; if (n === 0 && strict) n = 7; return isoD(addD(base, n)); };
    let part = 0;

    /* priority */
    take(/\s!!\s/, () => { out.urg = out.imp = true; });
    take(/\s(?:urgent|asap|turant|jaldi)\s/i, () => { out.urg = true; });
    take(/\s(?:important|imp|zaroori|zaruri)\s/i, () => { out.imp = true; });
    /* kind hints */
    take(/\s(?:remind me to|remind me|reminder to|reminder:?|yaad dila(?:na|o)?(?: ki)?)\s/i, () => { out.kind = "reminder"; });
    /* repeats */
    take(/\s(?:every ?day|daily|roz(?:ana)?|har din|everyday)\s/i, () => { out.rep = "DAILY"; });
    take(/\s(?:every |on )?weekdays\s/i, () => { out.rep = "WEEKDAYS"; });
    take(/\s(?:every |on )?weekends\s/i, () => { out.rep = "WEEKENDS"; });
    take(/\s(?:every month|monthly|har mahine)\s/i, () => { out.rep = "MONTHLY"; });
    take(/\s(?:every year|yearly|annually|har saal)\s/i, () => { out.rep = "YEARLY"; });
    take(new RegExp(`\\s(?:every|har)\\s((?:${WDRE}\\b[\\s,]*(?:and\\s|&\\s)?)+)`, "i"), (m) => {
      const ds = [...new Set(m[1].toLowerCase().split(/[\s,&]+|and/).map((x) => WDAY[x]).filter((x) => x !== undefined))];
      if (ds.length) { out.rep = "WEEKLY"; out.repDays = ds.sort().map((x) => WDC[x]); if (!out.d) out.d = nextWd(ds.includes(base.getDay()) ? base.getDay() : Math.min(...ds.map((x) => (x - base.getDay() + 7) % 7 === 0 ? 7 : x)), false); }
    });
    if (out.rep === "WEEKLY") { const ds = out.repDays.map((c) => WDC.indexOf(c)); let best = 8, bd = ""; ds.forEach((w) => { const n = (w - base.getDay() + 7) % 7; if (n < best) { best = n; bd = isoD(addD(base, n)); } }); out.d = bd; }
    /* deadline: "by 25 nov" / "by friday" */
    take(new RegExp(`\\s(?:by|before|tak)\\s(?:(\\d{1,2})(?:st|nd|rd|th)?\\s(${MONRE})|(${MONRE})\\s(\\d{1,2})(?:st|nd|rd|th)?|(${WDRE})|(tomorrow|kal))\\b`, "i"), (m) => {
      if (m[1]) out.due = dateFrom(+m[1], MON[m[2].toLowerCase()]); else if (m[3]) out.due = dateFrom(+m[4], MON[m[3].toLowerCase()]); else if (m[5]) out.due = nextWd(WDAY[m[5].toLowerCase()], false); else out.due = isoD(addD(base, 1));
    });
    /* dates */
    take(/\s(?:day after tomorrow|parson|parso)\s/i, () => { out.d = isoD(addD(base, 2)); });
    take(/\s(?:tomorrow|tmrw|tmr|kal)\s/i, () => { out.d = isoD(addD(base, 1)); });
    take(/\s(?:today|aaj|tonight)\s/i, (m) => { out.d = isoD(base); if (/tonight/i.test(m[0])) part = 21; });
    take(/\s(?:next week|agle hafte)\s/i, () => { out.d = isoD(addD(base, 7)); });
    take(/\sin (\d{1,3}) days?\s/i, (m) => { out.d = isoD(addD(base, +m[1])); });
    take(new RegExp(`\\s(?:on\\s)?(\\d{1,2})(?:st|nd|rd|th)?\\s(?:of\\s)?(${MONRE})\\b`, "i"), (m) => { out.d = dateFrom(+m[1], MON[m[2].toLowerCase()]); });
    take(new RegExp(`\\s(?:on\\s)?(${MONRE})\\s(\\d{1,2})(?:st|nd|rd|th)?\\b`, "i"), (m) => { out.d = dateFrom(+m[2], MON[m[1].toLowerCase()]); });
    take(/\s(?:on\s)?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?\s/, (m) => { out.d = dateFrom(+m[1], +m[2] - 1); });
    take(new RegExp(`\\s(?:on\\s|this\\s|next\\s|agle\\s)?(${WDRE})\\b`, "i"), (m) => { out.d = nextWd(WDAY[m[1].toLowerCase()], /next|agle/i.test(m[0])); });
    /* part of the day */
    take(/\s(?:in the |is )?(morning|subah|savere|afternoon|dopahar|evening|shaam|sham|night|raat)(?:\s(?:ko|mein|me))?\s/i, (m) => { part = PART[m[1].toLowerCase()]; });
    /* times: ranges first, then single */
    const hhmm = (h, mi, ap) => { h = +h; mi = +(mi || 0); if (h > 23 || mi > 59) return ""; ap = (ap || "").toLowerCase().replace(/\./g, "");
      if (ap === "pm" && h < 12) h += 12; else if (ap === "am" && h === 12) h = 0;
      else if (!ap && h <= 12) { if (part >= 12 && h < 12) h += 12; else if (!part && h >= 1 && h <= 6) h += 12; } /* no am/pm: 1-6 means evening, 7-11 morning */
      return pad(h) + ":" + pad(mi); };
    take(/\s(?:from\s|at\s)?(\d{1,2})(?:[:.](\d{2}))?\s?(am|pm|a\.m\.|p\.m\.)?\s?(?:-|–|to)\s?(\d{1,2})(?:[:.](\d{2}))?\s?(am|pm|a\.m\.|p\.m\.)?\s/i, (m) => {
      const ap2 = m[6] || m[3]; out.time = hhmm(m[1], m[2], m[3] || ap2); out.end = hhmm(m[4], m[5], ap2);
    }) ||
    take(/\s(?:at\s|@\s?)?(\d{1,2})[:.](\d{2})\s?(am|pm|a\.m\.|p\.m\.)?(?:\sbaje)?\s/i, (m) => { out.time = hhmm(m[1], m[2], m[3]); }) ||
    take(/\s(?:at\s|@\s?)?(\d{1,2})\s?(am|pm|a\.m\.|p\.m\.)\s/i, (m) => { out.time = hhmm(m[1], 0, m[2]); }) ||
    take(/\s(\d{1,2})\s?baje\s/i, (m) => { out.time = hhmm(m[1], 0, ""); }) ||
    take(/\s(?:at|@)\s?(\d{1,2})\s/i, (m) => { out.time = hhmm(m[1], 0, ""); }) ||
    take(/\s(?:at\s)?(noon|midday)\s/i, () => { out.time = "12:00"; });
    if (!out.time && part) out.time = pad(part) + ":00";
    /* kind */
    if (!out.kind) {
      if (/\b(meeting|meet|call with|appointment|interview|zoom|teams|lunch with|dinner with|session with)\b/i.test(s) && out.time) out.kind = "event";
      else if (out.time) out.kind = "reminder";
      else out.kind = "task";
    }
    if (out.rep && out.kind === "task") out.kind = "reminder"; /* repeating things live in the schedule, not the To-Do list */
    if (!out.d && (out.time || out.rep)) out.d = isoD(base);
    if (out.kind === "task" && !out.d) out.d = isoD(base);
    /* title: what's left */
    let t = s.replace(/\s(?:at|on|by|from|to|ko|ki|ka|mein|me)\s*$/i, " ").replace(/^\s*(?:to|ki|ke)\s/i, " ").replace(/\s{2,}/g, " ").trim().replace(/[,;:\-–]+$/, "").trim();
    out.t = t ? t.charAt(0).toUpperCase() + t.slice(1) : String(raw || "").trim();
    return out;
  };
})(typeof window !== "undefined" ? window : globalThis);
