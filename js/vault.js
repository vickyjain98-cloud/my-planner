/* My Planner — Logins page (1.21): simple reminders of website logins, opened with its own PIN.
   Honest by design: entries are NOT encrypted (they sit in your planner file in your Google Drive);
   the PIN only stops someone using your device from opening the page. Never in the Buddy feed, search, print or CSV. */
"use strict";
(function () {
  const MP = window.MP, E = (s) => MP.esc(s), now = () => Date.now();
  const V = () => MP.S.vault, P = () => MP.S.profile;
  let open = false, last = 0, q = "", shown = {}, edit = null;
  const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const hash = async (pin, salt) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + "|vault|" + pin)));
  const live = () => Object.entries(V()).filter(([, x]) => x && !x.del).sort((a, b) => String(a[1].app || "").localeCompare(String(b[1].app || "")));
  const touch = () => { last = now(); };
  setInterval(() => { if (open && now() - last > 120e3) { open = false; shown = {}; if (MP.route && MP.route() === "vault") MP.render(); } }, 15e3);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { open = false; shown = {}; } });
  const WARN = `<div class="vwarn">⚠ <b>For simple reminders only.</b> This page is protected by a PIN but is not strongly encrypted: the details are saved as ordinary text in your planner file in your Google Drive and in backups. Anyone who gets into your Google account or a backup file could read them. Please don't store bank, UPI, card or email passwords here.</div>`;
  const fav = (u) => { try { return new URL(/^https?:/i.test(u) ? u : "https://" + u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  function view() {
    const L = P().vlock;
    const top = `<div class="between wrap mb"><div><p class="eyebrow">Private</p><h1 class="title">🔐 Logins</h1></div><button class="btn ghost sm" data-go="diary">‹ Diary</button></div>`;
    if (!L) return top + WARN + `<section class="card stack" style="max-width:440px"><b>Set a PIN for this page</b><span class="small muted">4 to 6 digits. Use a different PIN from your journal lock.</span>
      <input class="f" type="password" inputmode="numeric" maxlength="6" id="vp1" placeholder="New PIN" data-novoice><input class="f" type="password" inputmode="numeric" maxlength="6" id="vp2" placeholder="Type it again" data-novoice><button class="btn" data-vset>Set PIN and open</button></section>`;
    if (!open) return top + `<section class="card stack center" style="max-width:420px;margin:0 auto">🔐<p class="small">Enter your Logins PIN.</p><div class="row" style="justify-content:center"><input class="f" type="password" inputmode="numeric" maxlength="6" id="vpin" placeholder="PIN" style="width:130px;text-align:center;letter-spacing:.3em" data-novoice aria-label="PIN"><button class="btn" data-vopen>Open</button></div><button class="link tiny" data-vforgot>Forgot your PIN?</button></section>`;
    touch();
    const nz = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097f]/g, ""), list = live().filter(([, x]) => !q || nz([x.app, x.url, x.user, x.note].join(" ")).includes(nz(q)));
    return top + WARN + `<div class="row wrap mb" style="gap:8px"><input class="f" id="vq" placeholder="Search apps and websites" value="${E(q)}" style="flex:1;min-width:180px" data-novoice><button class="btn" data-vnew>+ Add login</button><button class="btn ghost sm" data-vlock>Lock now</button><button class="btn ghost sm" data-vchg>Change PIN</button></div>
      ${list.length ? `<div class="vlist">${list.map(([id, x]) => `<section class="card vrow"><div class="vhead"><span class="vico">${E((x.app || fav(x.url) || "?").charAt(0).toUpperCase())}</span><div style="min-width:0"><b>${E(x.app || fav(x.url) || "Untitled")}</b>${x.url ? `<br><a class="tiny" href="${E(/^https?:/i.test(x.url) ? x.url : "https://" + x.url)}" target="_blank" rel="noopener noreferrer">${E(fav(x.url) || x.url)} ↗</a>` : ""}</div><span style="margin-left:auto" class="row"><button class="tool" data-vedit="${E(id)}" title="Edit">✎</button></span></div>
        <div class="vfield"><span class="tiny muted">Username</span><span class="vval">${E(x.user || "—")}</span>${x.user ? `<button class="tool" data-vcopy="u|${E(id)}" title="Copy username">⧉</button>` : ""}</div>
        <div class="vfield"><span class="tiny muted">Password</span><span class="vval mono">${shown[id] ? E(x.pw || "") : x.pw ? "••••••••" : "—"}</span>${x.pw ? `<button class="tool" data-vshow="${E(id)}" title="${shown[id] ? "Hide" : "Show"}">${shown[id] ? "🙈" : "👁"}</button><button class="tool" data-vcopy="p|${E(id)}" title="Copy password">⧉</button>` : ""}</div>
        ${x.note ? `<div class="tiny muted" style="margin-top:4px">${E(x.note)}</div>` : ""}</section>`).join("")}</div>` : `<section class="card stack center"><p class="small">${q ? "Nothing matches your search." : "No logins saved yet."}</p></section>`}
      <p class="tiny muted mt">Locks again after 2 minutes without use or when you leave the app. Not included in search, printing, the CSV download or anything shared with Buddy. Copied text stays in your phone's clipboard until you copy something else.</p>`;
  }
  MP.vaultView = view;
  function form(id) {
    edit = id || null; const x = (id && V()[id]) || {};
    MP.modal(`<div class="between"><h2>${id ? "Edit login" : "Add login"}</h2><button class="tool" data-close aria-label="Close">✕</button></div>
      <label class="stack small">App or website name<input class="f" id="va" maxlength="60" value="${E(x.app || "")}" placeholder="e.g. Netflix, Wi-Fi at home" data-novoice></label>
      <label class="stack small mt">Website address (URL)<input class="f" id="vu" maxlength="200" value="${E(x.url || "")}" placeholder="e.g. netflix.com" data-novoice inputmode="url"></label>
      <label class="stack small mt">Username or email<input class="f" id="vn" maxlength="120" value="${E(x.user || "")}" autocomplete="off" data-novoice></label>
      <label class="stack small mt">Password<span class="row" style="gap:6px"><input class="f" id="vw" type="password" maxlength="200" value="${E(x.pw || "")}" autocomplete="new-password" style="flex:1" data-novoice><button class="tool" type="button" data-vpeek title="Show">👁</button></span></label>
      <label class="stack small mt">Notes (optional)<input class="f" id="vo" maxlength="200" value="${E(x.note || "")}" placeholder="e.g. security question hint" data-novoice></label>
      <div class="row wrap" style="justify-content:space-between;gap:8px;margin-top:14px">${id ? `<button class="btn ghost sm" data-vdel style="color:#C0392B">Delete</button>` : "<span></span>"}<span class="row" style="gap:8px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-vsave>Save</button></span></div>`);
  }
  const val = (id) => (document.getElementById(id) || {}).value || "";
  document.addEventListener("click", async (e) => {
    const b = e.target.closest && e.target.closest("button"); if (!b) return; const d = b.dataset; if (!Object.keys(d).some((k) => k[0] === "v" && k.length > 1 && /^v[a-z]/.test(k))) return; touch();
    if (d.vset !== undefined) { const a = val("vp1"), c = val("vp2"); if (!/^\d{4,6}$/.test(a)) return MP.toast("Use 4 to 6 digits"); if (a !== c) return MP.toast("The two PINs don't match"); const s = hex(crypto.getRandomValues(new Uint8Array(16))); P().vlock = { s, h: await hash(a, s) }; P().u = now(); MP.changed(); open = true; MP.closeModal(); return MP.render(); }
    if (d.vopen !== undefined) { const L = P().vlock; if (L && (await hash(val("vpin"), L.s)) === L.h) { open = true; return MP.render(); } MP.toast("That PIN isn't right"); const f = document.getElementById("vpin"); if (f) { f.value = ""; f.focus(); } return; }
    if (d.vlock !== undefined) { open = false; shown = {}; return MP.render(); }
    if (d.vchg !== undefined) { return MP.modal(`<h2>Change Logins PIN</h2><input class="f" type="password" inputmode="numeric" maxlength="6" id="vp1" placeholder="New PIN" data-novoice><input class="f mt" type="password" inputmode="numeric" maxlength="6" id="vp2" placeholder="Type it again" data-novoice><div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn ghost" data-close>Cancel</button><button class="btn" data-vset>Save PIN</button></div>`); }
    if (d.vforgot !== undefined) {
      const google = MP.G && MP.G.user;
      return MP.modal(`<h2>Forgot your Logins PIN?</h2><p class="small">${google ? "Sign in with your Google account again to prove it's you. Your saved logins are kept, and you then set a new PIN." : "In demo mode there's no account to prove it's you, so the PIN can't be reset. You can delete all saved logins on this device and start again."}</p>
        <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" data-close>Cancel</button>${google ? `<button class="btn" data-vreset>Sign in and reset</button>` : `<button class="btn" style="background:#C0392B" data-vwipe>Delete all logins</button>`}</div>`);
    }
    if (d.vreset !== undefined) { try { await MP.G.authorize(true); delete P().vlock; P().u = now(); MP.changed(); MP.closeModal(); MP.toast("Now set a new PIN"); return MP.render(); } catch (er) { return MP.toast("Sign-in didn't finish, so the PIN wasn't reset."); } }
    if (d.vwipe !== undefined) { live().forEach(([id]) => { V()[id] = { u: now(), del: 1 }; }); delete P().vlock; P().u = now(); MP.changed(); MP.closeModal(); return MP.render(); }
    if (d.vnew !== undefined) return form(null);
    if (d.vedit) return form(d.vedit);
    if (d.vpeek !== undefined) { const f = document.getElementById("vw"); f.type = f.type === "password" ? "text" : "password"; return; }
    if (d.vsave !== undefined) { const r = { app: val("va").trim(), url: val("vu").trim(), user: val("vn").trim(), pw: val("vw"), note: val("vo").trim() }; if (!r.app && !r.url) return MP.toast("Add an app name or a website"); const id = edit || "v" + Math.random().toString(36).slice(2, 10); V()[id] = Object.assign({ u: now() }, r); MP.changed(); MP.closeModal(); return MP.render(); }
    if (d.vdel !== undefined) { if (edit) V()[edit] = { u: now(), del: 1 }; MP.changed(); MP.closeModal(); MP.toast("Login deleted"); return MP.render(); }
    if (d.vshow) { shown[d.vshow] = !shown[d.vshow]; return MP.render(); }
    if (d.vcopy) { const [k, id] = d.vcopy.split("|"), x = V()[id]; try { await navigator.clipboard.writeText(k === "p" ? x.pw : x.user); MP.toast(k === "p" ? "Password copied" : "Username copied"); } catch (er) { MP.toast("Couldn't copy here"); } return; }
  });
  document.addEventListener("input", (e) => { if (e.target.id === "vq") { q = e.target.value; touch(); clearTimeout(MP._vq); MP._vq = setTimeout(() => { const pos = e.target.selectionStart; MP.render(); const f = document.getElementById("vq"); if (f) { f.focus(); f.setSelectionRange(pos, pos); } }, 250); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "vpin") document.querySelector("[data-vopen]").click(); });
})();
