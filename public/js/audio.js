// Tüm sesler Web Audio ile kodda üretilir; dışarıdan ses dosyası yok.
//
// Yapı:  kaynaklar → sfx / müzik / ambiyans kanalları → ana kanal → hoparlör
// Oyun müziği katmanlıdır: drone + kalp atışı her zaman, arpej süre azalınca,
// yüksek gerilim tonu son saniyelerde devreye girer. Hata aldıkça tempo artar.

import { storage } from './dom.js';

const DEFAULTS = { master: 0.8, music: 0.55, sfx: 0.9, muted: false, musicOn: true };
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

class SoundEngine {
  constructor() {
    const saved = storage.get('bombe.audio', {});
    this.cfg = { ...DEFAULTS, ...saved };
    // Eski sürümden kalan ayarlar
    if (storage.get('bombe.muted', null) !== null && saved.muted === undefined) this.cfg.muted = storage.get('bombe.muted');
    if (storage.get('bombe.music', null) !== null && saved.musicOn === undefined) this.cfg.musicOn = storage.get('bombe.music');
    this.ctx = null;
    this.music = null;
    this.ambient = null;
    this.alarmTimer = null;
    this.intensity = 0;
    this.strikes = 0;
  }

  get muted() {
    return this.cfg.muted;
  }
  get musicOn() {
    return this.cfg.musicOn;
  }

  save() {
    storage.set('bombe.audio', this.cfg);
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master.connect(comp).connect(this.ctx.destination);
      this.sfx = this.ctx.createGain();
      this.sfx.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.applyVolumes(true);
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

  applyVolumes(instant = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const set = (param, v) => (instant ? (param.value = v) : param.setTargetAtTime(v, t, 0.05));
    set(this.master.gain, this.cfg.muted ? 0 : this.cfg.master);
    set(this.sfx.gain, this.cfg.sfx);
    set(this.musicBus.gain, this.cfg.musicOn ? this.cfg.music : 0);
  }

  setMuted(m) {
    this.cfg.muted = m;
    this.save();
    this.applyVolumes();
  }

  setMusic(on) {
    this.cfg.musicOn = on;
    this.save();
    this.applyVolumes();
  }

  setVolume(kind, v) {
    this.cfg[kind] = Math.max(0, Math.min(1, v));
    this.save();
    this.applyVolumes();
  }

  // --- Temel yapı taşları ---

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

  noise({ dur = 0.3, vol = 0.3, freq = 2000, freqTo = null, when = 0, type = 'lowpass', q = 1, dest = null }) {
    if (!this.ready) return;
    const t0 = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    src.loopStart = Math.random();
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(dest || this.sfx);
    src.start(t0, Math.random());
    src.stop(t0 + dur + 0.05);
  }

  // --- Arayüz ve modül etkileşimleri ---

  click() {
    this.tone({ freq: 1400, type: 'square', dur: 0.025, vol: 0.04 });
  }

  /** Modül hareketlerinin anlık geri bildirimi (sonuç sunucudan gelir) */
  act(kind) {
    switch (kind) {
      case 'snip':
        this.noise({ dur: 0.05, vol: 0.5, freq: 3500, type: 'highpass' });
        this.tone({ freq: 2600, type: 'square', dur: 0.02, vol: 0.12 });
        this.tone({ freq: 900, type: 'triangle', dur: 0.16, vol: 0.12, slideTo: 260, when: 0.02 });
        break;
      case 'toggle':
        this.noise({ dur: 0.018, vol: 0.4, freq: 2200, type: 'bandpass', q: 3 });
        this.noise({ dur: 0.02, vol: 0.35, freq: 1500, type: 'bandpass', q: 3, when: 0.035 });
        this.tone({ freq: 190, dur: 0.06, vol: 0.18, slideTo: 120 });
        break;
      case 'dial':
        for (let i = 0; i < 3; i++) this.noise({ dur: 0.012, vol: 0.3, freq: 4200, type: 'highpass', when: i * 0.028 });
        break;
      case 'step':
        this.tone({ freq: 620, type: 'sine', dur: 0.06, vol: 0.12, slideTo: 760 });
        break;
      case 'plug':
        this.tone({ freq: 150, dur: 0.09, vol: 0.3, slideTo: 90 });
        this.tone({ freq: 1250, type: 'triangle', dur: 0.12, vol: 0.06, when: 0.02 });
        break;
      case 'select':
        this.tone({ freq: 1000, type: 'triangle', dur: 0.04, vol: 0.08 });
        break;
      case 'heavy':
        this.tone({ freq: 120, dur: 0.16, vol: 0.32, slideTo: 70 });
        this.noise({ dur: 0.04, vol: 0.25, freq: 1800, type: 'bandpass', q: 2 });
        break;
      default:
        this.tone({ freq: 230, dur: 0.07, vol: 0.22, slideTo: 130 });
        this.noise({ dur: 0.02, vol: 0.2, freq: 3000, type: 'bandpass', q: 2 });
    }
  }

  tick(phase, urgent = false) {
    const f = phase ? (urgent ? 2500 : 1900) : urgent ? 2100 : 1500;
    this.tone({ freq: f, type: 'square', dur: 0.025, vol: urgent ? 0.08 : 0.045 });
    this.noise({ dur: 0.025, vol: 0.04, freq: 5000, type: 'highpass' });
  }

  finalBeep() {
    this.tone({ freq: 1760, type: 'sine', dur: 0.09, vol: 0.16 });
  }

  strike() {
    this.tone({ freq: 140, type: 'sawtooth', dur: 0.5, vol: 0.26 });
    this.tone({ freq: 147, type: 'square', dur: 0.5, vol: 0.16 });
    this.tone({ freq: 900, type: 'sawtooth', dur: 0.12, vol: 0.1, slideTo: 80 });
    this.noise({ dur: 0.25, vol: 0.2, freq: 1200 });
    // Müziğe uyumsuz bir vurgu
    if (this.music) [NOTE(46), NOTE(47), NOTE(53)].forEach((f) => this.tone({ freq: f, type: 'sawtooth', dur: 0.6, vol: 0.05, dest: this.music.out }));
  }

  solve() {
    this.tone({ freq: 660, type: 'triangle', dur: 0.14, vol: 0.22 });
    this.tone({ freq: 990, type: 'triangle', dur: 0.24, vol: 0.22, when: 0.1 });
    this.tone({ freq: 1320, type: 'sine', dur: 0.3, vol: 0.08, when: 0.2 });
  }

  stage() {
    this.tone({ freq: 880, type: 'triangle', dur: 0.1, vol: 0.14, slideTo: 1320 });
  }

  needy() {
    this.tone({ freq: 880, type: 'square', dur: 0.08, vol: 0.12 });
    this.tone({ freq: 660, type: 'square', dur: 0.08, vol: 0.12, when: 0.14 });
    this.tone({ freq: 880, type: 'square', dur: 0.08, vol: 0.12, when: 0.28 });
  }

  needyWarn() {
    this.tone({ freq: 520, type: 'square', dur: 0.06, vol: 0.07 });
  }

  explode() {
    this.noise({ dur: 3, vol: 0.95, freq: 4000, freqTo: 50 });
    this.tone({ freq: 90, type: 'sine', dur: 1.8, vol: 0.95, slideTo: 22 });
    this.noise({ dur: 0.5, vol: 0.6, freq: 8000, type: 'highpass' });
    this.noise({ dur: 2.2, vol: 0.25, freq: 600, type: 'bandpass', when: 0.4, q: 0.7 });
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.35, vol: 0.2, when: i * 0.12 }));
    [NOTE(72), NOTE(76), NOTE(79)].forEach((f) => this.tone({ freq: f, type: 'sine', dur: 1.4, vol: 0.08, when: 0.5, attack: 0.05 }));
  }

  countdown(final = false) {
    this.tone({ freq: final ? 1320 : 660, type: 'sine', dur: final ? 0.4 : 0.15, vol: 0.2 });
  }

  pause(on) {
    this.tone({ freq: on ? 660 : 440, type: 'triangle', dur: 0.18, vol: 0.15, slideTo: on ? 330 : 880 });
  }

  // --- Olaylar ---

  blackout() {
    this.tone({ freq: 320, type: 'sawtooth', dur: 0.9, vol: 0.18, slideTo: 28 });
    this.noise({ dur: 0.9, vol: 0.25, freq: 1500, freqTo: 80 });
  }

  rumble(ms) {
    this.noise({ dur: ms / 1000, vol: 0.7, freq: 110, type: 'lowpass', q: 2 });
    this.tone({ freq: 48, type: 'sine', dur: ms / 1000, vol: 0.4, attack: 0.2 });
  }

  glitch(ms) {
    const n = Math.max(3, Math.floor(ms / 450));
    for (let i = 0; i < n; i++) {
      const when = (i * ms) / n / 1000 + Math.random() * 0.2;
      this.noise({ dur: 0.08 + Math.random() * 0.12, vol: 0.18, freq: 800 + Math.random() * 3000, type: 'bandpass', q: 8, when });
      this.tone({ freq: 200 + Math.random() * 1800, type: 'square', dur: 0.05, vol: 0.04, when });
    }
  }

  alarm(ms) {
    this.stopAlarm();
    if (!this.ready) return;
    let on = false;
    const beep = () => {
      on = !on;
      this.tone({ freq: on ? 980 : 760, type: 'square', dur: 0.18, vol: 0.12 });
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

  // --- Oyun müziği ---

  startMusic() {
    if (!this.ready || this.music) return;
    this.stopAmbient();
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
    out.connect(this.musicBus);

    // Katman 1: drone
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
      g.gain.value = i === 2 ? 0.05 : 0.07;
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

    // Katman 2: arpej (süre azalınca)
    const arpGain = ctx.createGain();
    arpGain.gain.value = 0;
    const arpFilter = ctx.createBiquadFilter();
    arpFilter.type = 'lowpass';
    arpFilter.frequency.value = 1100;
    arpGain.connect(arpFilter).connect(out);

    // Katman 3: yüksek gerilim tonu (son saniyeler)
    const highGain = ctx.createGain();
    highGain.gain.value = 0;
    highGain.connect(out);
    const trem = ctx.createGain();
    trem.gain.value = 0.5;
    trem.connect(highGain);
    const highs = [NOTE(81), NOTE(81) * 1.006].map((f) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.03;
      o.connect(g).connect(trem);
      o.start();
      return o;
    });
    const tremLfo = ctx.createOscillator();
    const tremDepth = ctx.createGain();
    tremLfo.frequency.value = 7;
    tremDepth.gain.value = 0.5;
    tremLfo.connect(tremDepth).connect(trem.gain);
    tremLfo.start();

    const ARP = [57, 60, 64, 60, 57, 63, 60, 63].map(NOTE); // La minör, arada gerilim notası
    let step = 0;
    const beat = () => {
      if (!this.music) return;
      const t = ctx.currentTime;
      const thump = (when, f0, f1, v) => {
        const g = ctx.createGain();
        const o = ctx.createOscillator();
        o.frequency.setValueAtTime(f0, t + when);
        o.frequency.exponentialRampToValueAtTime(f1, t + when + 0.22);
        g.gain.setValueAtTime(0.0001, t + when);
        g.gain.exponentialRampToValueAtTime(v, t + when + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + when + 0.25);
        o.connect(g).connect(out);
        o.start(t + when);
        o.stop(t + when + 0.3);
      };
      thump(0, 72, 38, 0.5);
      thump(0.18, 64, 36, 0.3);
      const interval = (1100 - this.intensity * 600) / (1 + this.strikes * 0.12);
      // Arpej: her atışta iki nota
      if (this.intensity > 0.4) {
        for (let k = 0; k < 2; k++) {
          const f = ARP[step++ % ARP.length];
          const when = (k * interval) / 2000;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t + when);
          g.gain.exponentialRampToValueAtTime(0.06, t + when + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + when + 0.18);
          o.connect(g).connect(arpGain);
          o.start(t + when);
          o.stop(t + when + 0.2);
        }
      }
      filter.frequency.setTargetAtTime(280 + this.intensity * 500, t, 0.5);
      arpGain.gain.setTargetAtTime(this.intensity > 0.4 ? Math.min(1, (this.intensity - 0.4) * 2.5) : 0, t, 0.8);
      highGain.gain.setTargetAtTime(this.intensity > 0.8 ? (this.intensity - 0.8) * 5 : 0, t, 0.6);
      this.music.timer = setTimeout(beat, interval);
    };
    this.music = { out, oscs: [...oscs, ...highs, lfo, tremLfo], timer: null };
    beat();
  }

  setIntensity(x) {
    this.intensity = Math.max(0, Math.min(1, x));
  }

  setStrikes(n) {
    this.strikes = n;
  }

  stopMusic(abrupt = false) {
    const m = this.music;
    if (!m) return;
    this.music = null;
    clearTimeout(m.timer);
    const t = this.ctx.currentTime;
    m.out.gain.cancelScheduledValues(t);
    m.out.gain.setTargetAtTime(0, t, abrupt ? 0.02 : 0.3);
    setTimeout(() => {
      m.oscs.forEach((o) => o.stop());
      m.out.disconnect();
    }, 1500);
    this.strikes = 0;
    this.intensity = 0;
  }

  // --- Lobi ambiyansı: yavaş değişen yumuşak akorlar ---

  startAmbient() {
    if (!this.ready || this.ambient || this.music) return;
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.setTargetAtTime(0.35, ctx.currentTime, 2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.connect(out).connect(this.musicBus);
    const voices = [0, 1, 2].map(() => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      const g = ctx.createGain();
      g.gain.value = 0.05;
      o.connect(g).connect(lp);
      o.start();
      return o;
    });
    const CHORDS = [
      [57, 60, 64],
      [53, 57, 60],
      [48, 55, 64],
      [55, 59, 62],
    ];
    let i = 0;
    const next = () => {
      if (!this.ambient) return;
      const t = ctx.currentTime;
      CHORDS[i++ % CHORDS.length].forEach((n, k) => voices[k].frequency.setTargetAtTime(NOTE(n), t, 0.8));
      this.ambient.timer = setTimeout(next, 6500);
    };
    this.ambient = { out, voices, timer: null };
    next();
  }

  stopAmbient() {
    const a = this.ambient;
    if (!a) return;
    this.ambient = null;
    clearTimeout(a.timer);
    a.out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    setTimeout(() => {
      a.voices.forEach((o) => o.stop());
      a.out.disconnect();
    }, 2000);
  }
}

export const sound = new SoundEngine();
