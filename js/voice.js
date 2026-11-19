/* My Planner — voice input (1.18). Tap the 🎤 that appears beside any text box, speak, and the words are typed in.
   Uses the browser's own speech service (Google in Chrome / Samsung Internet, Apple in Safari). My Planner keeps no audio. */
"use strict";
(function () {
  const MP = window.MP;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  MP.voiceOK = !!SR;
  if (!SR) return;
  const VP = () => Object.assign({ on: true, lang: "en-IN" }, (MP.S && MP.S.profile && MP.S.profile.voice) || {});
  MP.voiceLangs = [["en-IN", "English (India) · also Hinglish in English letters"], ["hi-IN", "हिन्दी (Hindi)"], ["en-GB", "English (UK)"], ["en-US", "English (US)"]];
  const ELIG = 'textarea, input:not([type]), input[type="text"], input[type="search"], [contenteditable="true"]';
  const ok = (el) => el && el.matches && el.matches(ELIG) && !el.disabled && !el.readOnly && !el.closest("[data-novoice]") && VP().on;

  /* the floating mic */
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "vmic"; btn.setAttribute("aria-label", "Speak instead of typing"); btn.title = "Speak instead of typing";
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const bub = document.createElement("div"); bub.className = "vbub"; bub.setAttribute("aria-live", "polite");
  let field = null, rec = null, live = false, hideT = null;
  const place = () => {
    if (!field || !document.contains(field)) return hide();
    const r = field.getBoundingClientRect(); if (!r.width) return hide();
    btn.style.top = Math.max(4, r.top + Math.min(r.height, 44) / 2 - 15) + "px"; btn.style.left = Math.min(window.innerWidth - 36, r.right - 34) + "px";
    bub.style.top = Math.min(window.innerHeight - 50, r.bottom + 6) + "px"; bub.style.left = Math.max(8, Math.min(window.innerWidth - 300, r.left)) + "px";
  };
  const show = (el) => { clearTimeout(hideT); if (field && field !== el) field.classList.remove("vfocus"); field = el; el.classList.add("vfocus"); if (!btn.isConnected) document.body.append(btn, bub); btn.hidden = false; place(); };
  const hide = () => { if (live) return; if (field) field.classList.remove("vfocus"); btn.hidden = true; bub.classList.remove("on"); field = null; };
  document.addEventListener("focusin", (e) => { if (ok(e.target)) show(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target === field) hideT = setTimeout(hide, 250); });
  window.addEventListener("scroll", () => field && place(), true); window.addEventListener("resize", () => field && place());

  /* words that become punctuation */
  const PUN = [[/\s*\b(full stop|period)\b/gi, "."], [/\s*\bcomma\b/gi, ","], [/\s*\bquestion mark\b/gi, "?"], [/\s*\bexclamation (mark|point)\b/gi, "!"], [/\s*\b(colon)\b/gi, ":"], [/\s*\bnew line\b\s*/gi, "\n"], [/\s*\bपूर्ण विराम\b/g, "।"]];
  const tidy = (t) => { PUN.forEach(([re, s]) => { t = t.replace(re, s); }); return t.replace(/\s+([.,?!:])/g, "$1"); };
  const insert = (el, text) => {
    if (!text) return;
    if (el.isContentEditable) { el.focus(); document.execCommand("insertText", false, text); return; }
    const v = el.value, a = el.selectionStart ?? v.length, b = el.selectionEnd ?? v.length, before = v.slice(0, a);
    const sp = before && !/[\s\n]$/.test(before) ? " " : "";
    let t = sp + text; if (!before || /[.?!\n]\s*$/.test(before)) t = sp + t.trim().charAt(0).toUpperCase() + t.trim().slice(1);
    if (el.tagName === "INPUT") t = t.replace(/\n/g, " ");
    const max = el.maxLength > 0 ? el.maxLength : 1e6; t = t.slice(0, Math.max(0, max - (v.length - (b - a))));
    el.value = before + t + v.slice(b); const c = a + t.length; try { el.setSelectionRange(c, c); } catch (e) {}
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const stop = () => { if (rec) try { rec.stop(); } catch (e) {} };
  function start(el) {
    if (live) return stop();
    rec = new SR(); rec.lang = VP().lang; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
    let shown = "";
    rec.onstart = () => { live = true; btn.classList.add("live"); bub.textContent = "Listening… tap the mic again to stop"; bub.classList.add("on"); };
    rec.onresult = (ev) => {
      let fin = "", mid = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) fin += r[0].transcript; else mid += r[0].transcript; }
      if (fin) insert(el, tidy(fin.trim()));
      shown = mid; bub.textContent = mid ? "… " + mid : "Listening… tap the mic again to stop";
    };
    rec.onerror = (ev) => {
      const m = { "not-allowed": "The microphone is blocked. Allow it for this site in your browser settings.", "service-not-allowed": "Voice typing isn't available in this browser.", "no-speech": "Didn't hear anything. Tap the mic and try again.", network: "Voice typing needs the internet.", "audio-capture": "No microphone found." }[ev.error];
      if (m) MP.toast(m);
    };
    rec.onend = () => { live = false; rec = null; btn.classList.remove("live"); bub.classList.remove("on"); if (field && document.activeElement !== field) hide(); };
    try { rec.start(); } catch (e) { MP.toast("Couldn't start voice typing. Try again."); }
  }
  btn.addEventListener("pointerdown", (e) => e.preventDefault()); /* keep the text box focused */
  btn.addEventListener("click", () => {
    const el = field; if (!el) return;
    if (live) return stop();
    let seen = false; try { seen = localStorage.getItem("mp-voicenote") === "1"; } catch (e) {}
    if (!seen && MP.modal) {
      MP.voiceGo = () => { try { localStorage.setItem("mp-voicenote", "1"); } catch (e) {} MP.closeModal(); el.focus(); show(el); start(el); };
      return MP.modal(`<h2>Speak instead of typing</h2><p class="small">Your browser turns your voice into text using its own speech service (Google on Android and in Chrome, Apple on iPhone), so the words you speak pass through that service. My Planner doesn't record or keep any audio. Typing and the pen never leave your device.</p>
        <p class="small">Say <b>comma</b>, <b>full stop</b>, <b>question mark</b> or <b>new line</b> for punctuation. Change the language in Settings → Voice input.</p>
        <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" data-close>Not now</button><button class="btn" data-voicego>Start speaking</button></div>`);
    }
    start(el);
  });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-voicego]") && MP.voiceGo) MP.voiceGo(); });

  /* the pen pads: 🎤 switches the pad to typing and listens */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-padmic]"); if (!b) return;
    const key = b.dataset.padmic; MP.inputMode = "type"; MP.pref.set("input", "type"); MP.render();
    setTimeout(() => { const all = [...document.querySelectorAll(`textarea[data-tk="${CSS.escape(key)}"]`)], t = all.find((x) => !x.value) || all[all.length - 1]; if (t) { t.focus(); show(t); btn.click(); } }, 60);
  });

  /* Settings */
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t.matches("[data-vset]")) return;
    const p = MP.S.profile, v = VP(); if (t.dataset.vset === "on") v.on = t.checked; else v.lang = t.value;
    p.voice = v; p.u = Date.now(); MP.changed(); if (!v.on) { stop(); hide(); }
  });
  MP.voiceCard = () => { const v = VP(); return `<section class="card stack mb" id="set-voice"><span class="lab">Voice input 🎤</span>
    <label class="row small"><input type="checkbox" data-vset="on" ${v.on ? "checked" : ""}> Show the mic beside text boxes so I can speak instead of typing</label>
    <label class="small">Language <select class="f sm" data-vset="lang">${MP.voiceLangs.map(([c, n]) => `<option value="${c}" ${v.lang === c ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <span class="tiny muted">Your browser's speech service (Google or Apple) turns speech into text; My Planner keeps no audio. Say "comma", "full stop" or "new line" for punctuation. Needs the internet; not available in Firefox.</span></section>`; };
})();
