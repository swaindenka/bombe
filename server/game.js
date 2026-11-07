// Tek bir bomba turunu yönetir: modülleri üretir, sayaç, hatalar, sürekli ilgi isteyen modüller,
// rastgele olaylar. Tüm çözümler burada kalır; imhacıya sadece görünen durum gönderilir.

import { MODULES, NEEDY_TIMING } from '../shared/modules/index.js';
import { createRng, randomSeed } from '../shared/rng.js';
import { generateEdgework } from '../shared/edgework.js';
import { scoreFor } from '../shared/levels.js';

export const EVENT_TYPES = ['blackout', 'shake', 'alarm', 'glitch'];
export const EVENT_DURATION = { blackout: 9000, shake: 2600, alarm: 9000, glitch: 7000 };
export const START_DELAY_MS = 3000;
const TICK_MS = 200;
const TIMER_SYNC_MS = 1000;
const STRIKE_SPEEDUP = 0.25;
const DISPLAY_TOLERANCE_MS = 2500;
const TIMER_SLOT = 1; // ön yüz, üst orta
export const SLOT_COUNT = 12;
// Ön yüz: 0 1 2 / 3 4 5 (1 = sayaç). Sayaca bitişik yuvalar önce.
const FRONT_NEAR_TIMER = [0, 2, 4];
const FRONT_OTHER = [3, 5];
export const FRONT_ONLY = ['rhythm'];

export class Game {
  /**
   * @param {object} opts
   * @param {object} opts.config  bombConfig() çıktısı
   * @param {string} opts.lang    bomba dili (kelime modülleri)
   * @param {object} opts.hooks   { toDefuser(ev, data), toAll(ev, data), onEnd(result) }
   */
  constructor({ config, lang = 'tr', seed = randomSeed(), hooks = {}, startDelayMs = START_DELAY_MS }) {
    this.config = config;
    this.lang = lang;
    this.seed = seed;
    this.hooks = hooks;
    this.startDelayMs = startDelayMs;
    this.rng = createRng(seed);
    this.edgework = generateEdgework(this.rng);
    this.modules = this.buildModules();
    this.totalMs = config.time * 1000;
    this.maxStrikes = config.strikes;
    this.strikes = 0;
    this.baseRate = config.timerRate || 1; // kampanya koşulu: hızlı sayaç
    this.rate = this.baseRate;
    this.eventTypes = config.eventTypes?.length ? config.eventTypes : EVENT_TYPES;
    this.eventGap = (ms) => Math.round(ms / (config.eventRate || 1));
    this.elapsed = 0;
    this.lastTick = null;
    this.started = false;
    this.ended = false;
    this.result = null;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.lastSync = 0;
    this.nextEventAt = Infinity;
    this.interval = null;
    this.startTimeout = null;
    this.paused = false;
    this.pausedAt = 0;
  }

  buildModules() {
    const { rng, config } = this;
    const fill = (pool, n) => {
      const out = [];
      while (out.length < n && pool.length) out.push(...rng.shuffle(pool));
      return out.slice(0, n);
    };
    // Seviyenin yeni tanıttığı modüller bombada mutlaka bulunsun
    const pick = (pool, n) => {
      const intro = rng.shuffle((config.introduces || []).filter((t) => pool.includes(t))).slice(0, n);
      return [...intro, ...fill(pool, n - intro.length)];
    };
    const types = [
      ...pick(config.pool, config.regular).map((t) => ({ type: t, needy: false })),
      ...pick(config.needyPool || [], config.needy).map((t) => ({ type: t, needy: true })),
    ];
    // Ritim sayaca bakarak çözülür: sayacın olduğu ön yüze, mümkünse hemen yanına/altına koy
    const free = rng.shuffle([...Array(SLOT_COUNT).keys()].filter((s) => s !== TIMER_SLOT));
    const nearTimer = [...rng.shuffle(FRONT_NEAR_TIMER), ...rng.shuffle(FRONT_OTHER)];
    const slotOf = types.map((t) => {
      if (!FRONT_ONLY.includes(t.type)) return null;
      const s = nearTimer.find((x) => free.includes(x));
      if (s === undefined) return null;
      free.splice(free.indexOf(s), 1);
      return s;
    });
    const slots = slotOf.map((s) => (s === null ? free.shift() : s));
    return types.map((t, i) => ({
      id: 'm' + i,
      type: t.type,
      needy: t.needy,
      slot: slots[i],
      state: MODULES[t.type].generate(rng, this.edgework, this.lang),
      solved: false,
      solvedAt: null,
      strikes: 0,
      nextAt: 0,
      activeUntil: 0,
    }));
  }

  get regularModules() {
    return this.modules.filter((m) => !m.needy);
  }

  get solvedCount() {
    return this.regularModules.filter((m) => m.solved).length;
  }

  // --- Zaman ---

  advance() {
    const t = Date.now();
    if (this.started && !this.ended && !this.paused && this.lastTick !== null) this.elapsed += (t - this.lastTick) * this.rate;
    this.lastTick = t;
  }

  remainingMs() {
    this.advance();
    return Math.max(0, this.totalMs - this.elapsed);
  }

  timerPayload() {
    return {
      remainingMs: this.remainingMs(),
      rate: this.started && !this.ended && !this.paused ? this.rate : 0,
      paused: this.paused,
      strikes: this.strikes,
      maxStrikes: this.maxStrikes,
      solved: this.solvedCount,
      total: this.regularModules.length,
    };
  }

  syncTimer() {
    this.lastSync = Date.now();
    this.hooks.toAll?.('game:timer', this.timerPayload());
  }

  // --- Yaşam döngüsü ---

  start() {
    this.startTimeout = setTimeout(() => this.begin(), this.startDelayMs);
  }

  begin() {
    if (this.ended) return;
    const now = Date.now();
    this.started = true;
    this.startedAt = now;
    this.lastTick = now;
    for (const m of this.modules) {
      if (m.needy) m.nextAt = now + this.rng.int(...NEEDY_TIMING.firstDelay);
    }
    if (this.config.events) this.nextEventAt = now + this.eventGap(this.rng.int(30000, 55000));
    this.syncTimer();
    this.interval = setInterval(() => this.tick(), TICK_MS);
  }

  activeFor(m) {
    return MODULES[m.type].activeFor || NEEDY_TIMING.activeFor;
  }

  /** Oda sahibi duraklatır: sayaç, sürekli ilgi modülleri ve olaylar donar */
  setPaused(paused) {
    if (!this.started || this.ended || this.paused === paused) return;
    this.advance();
    if (paused) {
      this.paused = true;
      this.pausedAt = Date.now();
    } else {
      const d = Date.now() - this.pausedAt;
      for (const m of this.modules) {
        m.nextAt += d;
        m.activeUntil += d;
      }
      this.nextEventAt += d;
      this.paused = false;
      this.lastTick = Date.now();
      for (const m of this.modules) if (m.needy && m.state.active) this.emitModule(m);
    }
    this.hooks.toAll?.('game:paused', { paused: this.paused });
    this.syncTimer();
  }

  tick() {
    if (this.ended || !this.started || this.paused) return;
    const now = Date.now();
    if (this.remainingMs() <= 0) {
      this.end('exploded', 'time');
      return;
    }
    for (const m of this.modules) {
      if (!m.needy) continue;
      if (!m.state.active && now >= m.nextAt) {
        MODULES[m.type].activate(m.state, this.rng, this.edgework, this.lang);
        m.activeUntil = now + this.activeFor(m);
        this.emitModule(m);
        // Uzmanlar da bilsin: hangi sürekli ilgi modülü devreye girdi
        this.hooks.toAll?.('game:needy', { moduleId: m.id, type: m.type, activeMs: this.activeFor(m) });
      } else if (m.state.active && now >= m.activeUntil) {
        this.deactivateNeedy(m);
        this.emitModule(m);
        this.strike(m);
        if (this.ended) return;
      }
    }
    if (now >= this.nextEventAt) {
      this.fireEvent(this.rng.pick(this.eventTypes));
      this.nextEventAt = now + this.eventGap(this.rng.int(35000, 70000));
    }
    if (now - this.lastSync >= TIMER_SYNC_MS) this.syncTimer();
  }

  fireEvent(type) {
    this.hooks.toAll?.('game:event', { type, duration: EVENT_DURATION[type] });
  }

  deactivateNeedy(m) {
    m.state.active = false;
    m.nextAt = Date.now() + this.rng.int(...NEEDY_TIMING.delay);
  }

  strike(m) {
    this.advance();
    this.strikes++;
    if (m) m.strikes++;
    this.rate = this.baseRate * (1 + STRIKE_SPEEDUP * this.strikes);
    this.hooks.toAll?.('game:strike', { moduleId: m ? m.id : null, type: m ? m.type : null, strikes: this.strikes, maxStrikes: this.maxStrikes });
    if (this.strikes >= this.maxStrikes) {
      this.end('exploded', 'strikes');
      return;
    }
    this.syncTimer();
  }

  /** İmhacının bir modüle yaptığı hareket */
  handleAction(moduleId, action, displayedRemainingMs) {
    if (this.ended || !this.started || this.paused) return;
    const m = this.modules.find((x) => x.id === moduleId);
    if (!m || m.solved || !action || typeof action !== 'object') return;
    const def = MODULES[m.type];
    const serverRem = this.remainingMs();
    let shown = Number(displayedRemainingMs);
    if (!Number.isFinite(shown) || Math.abs(shown - serverRem) > DISPLAY_TOLERANCE_MS) shown = serverRem;
    const res =
      def.action(m.state, action, {
        edgework: this.edgework,
        rng: this.rng,
        lang: this.lang,
        displayedRemainingMs: shown,
        needyProgress: m.needy && m.state.active ? 1 - Math.max(0, m.activeUntil - Date.now()) / this.activeFor(m) : 0,
      }) || {};

    if (m.needy) {
      if (res.deactivate) this.deactivateNeedy(m);
      if (res.deactivate || res.changed) this.emitModule(m);
      if (res.strike) this.strike(m);
      return;
    }
    if (res.solved) {
      m.solved = true;
      m.solvedAt = Date.now() - this.startedAt;
    }
    if (res.changed || res.solved) this.emitModule(m);
    if (res.strike) {
      this.strike(m);
      if (this.ended) return;
    }
    if (res.solved) {
      this.hooks.toAll?.('game:solved', { moduleId: m.id, type: m.type, solved: this.solvedCount, total: this.regularModules.length });
      if (this.regularModules.every((x) => x.solved)) this.end('defused', 'solved');
    }
  }

  end(outcome, reason) {
    if (this.ended) return;
    const remaining = this.remainingMs();
    this.ended = true;
    clearInterval(this.interval);
    clearTimeout(this.startTimeout);
    this.result = {
      outcome, // 'defused' | 'exploded' | 'aborted'
      reason, // 'solved' | 'time' | 'strikes' | 'aborted'
      remainingMs: remaining,
      timeUsedMs: this.startedAt ? Date.now() - this.startedAt : 0,
      strikes: this.strikes,
      maxStrikes: this.maxStrikes,
      solved: this.solvedCount,
      total: this.regularModules.length,
      levelId: this.config.levelId,
      modules: this.modules.map((m) => ({ type: m.type, needy: m.needy, solvedAtMs: m.solvedAt, strikes: m.strikes })),
    };
    this.result.score = scoreFor(this.result);
    this.hooks.toAll?.('game:timer', this.timerPayload());
    this.hooks.onEnd?.(this.result);
  }

  destroy() {
    clearInterval(this.interval);
    clearTimeout(this.startTimeout);
    this.ended = true;
  }

  // --- Görünümler ---

  moduleView(m) {
    const now = this.paused ? this.pausedAt : Date.now();
    return {
      id: m.id,
      type: m.type,
      needy: m.needy,
      slot: m.slot,
      solved: m.solved,
      view: MODULES[m.type].view(m.state, this.edgework),
      needyRemainingMs: m.needy && m.state.active ? Math.max(0, m.activeUntil - now) : null,
    };
  }

  emitModule(m) {
    this.hooks.toDefuser?.('game:module', this.moduleView(m));
  }

  /** Oyuna giren / yeniden bağlanan oyuncuya gönderilen başlangıç paketi */
  initPayload(role, extra = {}) {
    const base = {
      role,
      lang: this.lang,
      timer: this.timerPayload(),
      startsInMs: this.started ? 0 : Math.max(0, this.createdAt + this.startDelayMs - Date.now()),
      ended: this.ended,
      ...extra,
    };
    if (role !== 'defuser') return base;
    const e = this.edgework;
    return {
      ...base,
      timerSlot: TIMER_SLOT,
      edgework: {
        serial: e.serial,
        batteryHolders: e.batteryHolders,
        indicators: e.indicators,
        portPlates: e.portPlates,
        layout: e.layout,
      },
      modules: this.modules.map((m) => this.moduleView(m)),
    };
  }
}
