(function (global) {
  "use strict";

  let ctx = null;
  let masterGain = null;
  let playing = false;
  let intervalId = null;
  const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

  function ensureContext() {
    if (ctx) return ctx;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function playNote(freq, when, duration) {
    if (!ctx || !masterGain) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(0.35, when + 0.08);
    env.gain.exponentialRampToValueAtTime(0.001, when + duration);
    osc.connect(env);
    env.connect(masterGain);
    osc.start(when);
    osc.stop(when + duration + 0.05);
  }

  function tick() {
    if (!ctx || !playing) return;
    const now = ctx.currentTime;
    const idx = Math.floor(Math.random() * pentatonic.length);
    playNote(pentatonic[idx], now, 1.8 + Math.random() * 0.6);
  }

  const UniversoAudio = {
    isSupported() {
      return !!(global.AudioContext || global.webkitAudioContext);
    },

    async start() {
      const c = ensureContext();
      if (!c) return false;
      if (c.state === "suspended") {
        await c.resume();
      }
      if (playing) return true;
      playing = true;
      tick();
      intervalId = setInterval(tick, 2400);
      return true;
    },

    stop() {
      playing = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },

    toggle() {
      if (playing) {
        this.stop();
        return false;
      }
      return this.start();
    },

    isPlaying() {
      return playing;
    },
  };

  global.UniversoAudio = UniversoAudio;
})(window);
