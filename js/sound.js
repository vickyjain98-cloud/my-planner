/* My Planner — focus sounds, generated in the browser (Web Audio). No files, no network, no tracking. */
"use strict";
(function () {
  const MP = window.MP;
  const SOUNDS = [
    ["brown", "Brown noise", "Deep and soft, like a distant waterfall"],
    ["rain", "Gentle rain", "Steady rain on a window"],
    ["ocean", "Ocean waves", "Slow waves rolling in and out"],
    ["pink", "Pink noise", "Balanced, like steady wind"],
    ["drone", "Calm ambient", "A slow, warm musical pad"],
    ["white", "White noise", "Bright; masks chatter best"]
  ];
  MP.SOUNDS = SOUNDS;
  let ctx = null, master = null, nodes = [], current = "", timers = [];

  const ensure = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  };
  function noiseBuffer(kind) {
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") d[i] = w * 0.25;
        else if (kind === "pink") { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.06; b6 = w * 0.115926; }
        else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      }
    }
    return buf;
  }
  const src = (kind) => { const s = ctx.createBufferSource(); s.buffer = noiseBuffer(kind); s.loop = true; nodes.push(s); return s; };
  const lfo = (freq, depth, target) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); nodes.push(o); return o; };

  function build(type) {
    const out = ctx.createGain(); out.connect(master); nodes.push(out);
    if (type === "white" || type === "pink" || type === "brown") { const s = src(type); s.connect(out); s.start(); out.gain.value = type === "brown" ? 0.9 : 0.8; }
    else if (type === "rain") {
      const s = src("pink"), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 600; lp.type = "lowpass"; lp.frequency.value = 7000;
      s.connect(hp); hp.connect(lp); lp.connect(out); out.gain.value = 0.9; s.start(); lfo(0.35, 0.08, out.gain); nodes.push(hp, lp);
    } else if (type === "ocean") {
      const s = src("brown"), lp = ctx.createBiquadFilter(), g = ctx.createGain(); lp.type = "lowpass"; lp.frequency.value = 900; g.gain.value = 0.55;
      s.connect(lp); lp.connect(g); g.connect(out); s.start(); lfo(0.09, 0.45, g.gain); lfo(0.09, 500, lp.frequency); nodes.push(lp, g); out.gain.value = 1;
    } else if (type === "drone") {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.connect(out); out.gain.value = 0.35; nodes.push(lp);
      [[110, 0], [164.81, 4], [220, -3], [277.18, 2]].forEach(([f, det], i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i % 2 ? "triangle" : "sine"; o.frequency.value = f; o.detune.value = det; g.gain.value = 0.18; o.connect(g); g.connect(lp); o.start(); nodes.push(o, g); lfo(0.05 + i * 0.013, 0.08, g.gain); });
      lfo(0.03, 250, lp.frequency);
    }
  }
  const ramp = (to, secs) => { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(to, t + secs); };
  const teardown = () => { nodes.forEach((n) => { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); nodes = []; };

  MP.sound = {
    playing: () => current,
    play(type, vol) {
      if (!ensure()) { MP.toast && MP.toast("Sound isn't supported in this browser."); return; }
      timers.forEach(clearTimeout); timers = [];
      if (current) teardown();
      current = type || "brown"; build(current); ramp(Math.max(0, Math.min(1, vol ?? 0.5)), 2);
      MP.sound.onchange && MP.sound.onchange();
    },
    stop(fade = 1.5) {
      if (!ctx || !current) return;
      ramp(0, fade); current = "";
      timers.push(setTimeout(teardown, fade * 1000 + 100));
      MP.sound.onchange && MP.sound.onchange();
    },
    volume(v) { if (ctx && current) ramp(Math.max(0, Math.min(1, v)), 0.2); }
  };
})();
