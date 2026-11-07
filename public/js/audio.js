// Tüm sesler Web Audio ile kodda üretilir; dışarıdan ses dosyası yok.

import { storage } from './dom.js';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = storage.get('bombe.muted', false);
    this.musicOn = storage.get('bombe.music', true);
    this.music = null;
    this.alarmTimer = null;
    this.intensity = 0;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.8;
      this.master.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain();
      this.sfx.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicOn ? 0.5 : 0;
      this.musicBus.connect(this.master);
      const len = this.ctx.sampleRate * 2;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  get ready() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  setMuted(m) {
    this.muted = m;
    storage.set('bombe.muted', m);
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.02);
  }

  setMusic(on) {
    this.musicOn = on;
    storage.set('bombe.music', on);
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.1);
  }

  tone({ freq = 440, type = 'sine', dur = 0.1, vol = 0.3, attack = 0.004, slideTo = null, when = 0, dest = null }) {
    if (!this.ready) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(dest || this.sfx);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise({ dur = 0.3, vol = 0.3, freq = 2000, freqTo = null, when = 0, type = 'lowpass' }) {
    if (!this.ready) return;
    const t0 = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  click() {
    this.tone({ freq: 1400, type: 'square', dur: 0.025, vol: 0.05 });
  }

  tick(urgent = false) {
    this.tone({ freq: urgent ? 2300 : 1700, type: 'square', dur: 0.03, vol: urgent ? 0.09 : 0.05 });
    this.noise({ dur: 0.03, vol: 0.05, freq: 4000, type: 'highpass' });
  }

  strike() {
    this.tone({ freq: 140, type: 'sawtooth', dur: 0.5, vol: 0.28 });
    this.tone({ freq: 147, type: 'square', dur: 0.5, vol: 0.18 });
    this.noise({ dur: 0.25, vol: 0.2, freq: 1200 });
  }

  solve() {
    this.tone({ freq: 660, type: 'triangle', dur: 0.14, vol: 0.25 });
    this.tone({ freq: 990, type: 'triangle', dur: 0.22, vol: 0.25, when: 0.11 });
  }

  needy() {
    this.tone({ freq: 880, type: 'square', dur: 0.08, vol: 0.12 });
    this.tone({ freq: 880, type: 'square', dur: 0.08, vol: 0.12, when: 0.16 });
  }

  explode() {
    this.noise({ dur: 2.8, vol: 0.9, freq: 4000, freqTo: 60 });
    this.tone({ freq: 90, type: 'sine', dur: 1.6, vol: 0.9, slideTo: 25 });
    this.noise({ dur: 0.5, vol: 0.6, freq: 8000, type: 'highpass' });
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.35, vol: 0.22, when: i * 0.12 }));
    this.tone({ freq: 1568, type: 'sine', dur: 0.8, vol: 0.12, when: 0.5 });
  }

  countdown(final = false) {
    this.tone({ freq: final ? 1320 : 660, type: 'sine', dur: final ? 0.4 : 0.15, vol: 0.2 });
  }

  alarm(ms) {
    this.stopAlarm();
    if (!this.ready) return;
    let on = false;
    const beep = () => {
      on = !on;
      this.tone({ freq: on ? 980 : 760, type: 'square', dur: 0.18, vol: 0.13 });
    };
    beep();
    this.alarmTimer = setInterval(beep, 220);
    this.alarmStopAt = setTimeout(() => this.stopAlarm(), ms);
  }

  stopAlarm() {
    clearInterval(this.alarmTimer);
    clearTimeout(this.alarmStopAt);
    this.alarmTimer = null;
  }

  // Gerilim müziği: alçak bir drone ve hızlanan kalp atışı
  startMusic() {
    if (!this.ready || this.music) return;
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
    out.connect(this.musicBus);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 6;
    filter.connect(out);
    const oscs = [55, 55.6, 82.4].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.05 : 0.08;
      o.connect(g).connect(filter);
      o.start();
      return o;
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const beat = () => {
      if (!this.music) return;
      const t = ctx.currentTime;
      const g = ctx.createGain();
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(72, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.3);
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.frequency.setValueAtTime(64, t + 0.18);
      o2.frequency.exponentialRampToValueAtTime(36, t + 0.36);
      g2.gain.setValueAtTime(0.0001, t + 0.18);
      g2.gain.exponentialRampToValueAtTime(0.3, t + 0.19);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o2.connect(g2).connect(out);
      o2.start(t + 0.18);
      o2.stop(t + 0.42);
      const interval = 1100 - this.intensity * 600;
      filter.frequency.setTargetAtTime(280 + this.intensity * 500, t, 0.5);
      this.music.timer = setTimeout(beat, interval);
    };
    this.music = { out, oscs, lfo, filter, timer: null };
    beat();
  }

  setIntensity(x) {
    this.intensity = Math.max(0, Math.min(1, x));
  }

  stopMusic() {
    const m = this.music;
    if (!m) return;
    this.music = null;
    clearTimeout(m.timer);
    const t = this.ctx.currentTime;
    m.out.gain.setTargetAtTime(0, t, 0.3);
    setTimeout(() => {
      m.oscs.forEach((o) => o.stop());
      m.lfo.stop();
      m.out.disconnect();
    }, 1500);
  }
}

export const sound = new SoundEngine();
