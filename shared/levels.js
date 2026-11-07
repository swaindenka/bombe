// Hazır seviyeler ve serbest mod sınırları.

import { REGULAR_TYPES, NEEDY_TYPES } from './modules/index.js';

const EASY = ['wires', 'switches', 'tiles', 'glyphs'];
const MEDIUM = [...EASY, 'maze', 'stroop', 'safe'];
const ALL = REGULAR_TYPES;

export const MAX_SLOTS = 11; // 12 yuvadan biri sayaç

export const LEVELS = [
  { id: 'l1', name: { tr: 'Acemi Eğitimi', en: 'Rookie Training' }, regular: 3, needy: 0, time: 300, strikes: 3, pool: EASY, events: false },
  { id: 'l2', name: { tr: 'Isınma Turu', en: 'Warm-up' }, regular: 4, needy: 0, time: 300, strikes: 3, pool: [...EASY, 'maze'], events: false },
  { id: 'l3', name: { tr: 'Sıcak Masa', en: 'Hot Desk' }, regular: 5, needy: 1, time: 300, strikes: 3, pool: MEDIUM, events: false },
  { id: 'l4', name: { tr: 'Gece Vardiyası', en: 'Night Shift' }, regular: 5, needy: 1, time: 330, strikes: 3, pool: ALL, events: true },
  { id: 'l5', name: { tr: 'Kalabalık Panel', en: 'Crowded Panel' }, regular: 6, needy: 1, time: 360, strikes: 3, pool: ALL, events: true },
  { id: 'l6', name: { tr: 'Çift Taraflı', en: 'Double Sided' }, regular: 7, needy: 2, time: 420, strikes: 3, pool: ALL, events: true },
  { id: 'l7', name: { tr: 'Kırmızı Alarm', en: 'Red Alert' }, regular: 8, needy: 2, time: 450, strikes: 2, pool: ALL, events: true },
  { id: 'l8', name: { tr: 'Son Durak', en: 'Last Stop' }, regular: 9, needy: 2, time: 480, strikes: 2, pool: ALL, events: true },
];

export const FREE_LIMITS = {
  time: [60, 1200],
  regular: [1, 10],
  needy: [0, 3],
  strikes: [1, 5],
};

export const DEFAULT_FREE = {
  time: 300,
  regular: 5,
  needy: 1,
  strikes: 3,
  events: true,
  pool: REGULAR_TYPES.slice(),
  needyPool: NEEDY_TYPES.slice(),
};

const clamp = (v, [a, b], d) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : d;
};

/** İstemciden gelen serbest mod ayarlarını doğrular */
export function sanitizeFree(f = {}) {
  const out = {
    time: clamp(f.time, FREE_LIMITS.time, DEFAULT_FREE.time),
    regular: clamp(f.regular, FREE_LIMITS.regular, DEFAULT_FREE.regular),
    needy: clamp(f.needy, FREE_LIMITS.needy, DEFAULT_FREE.needy),
    strikes: clamp(f.strikes, FREE_LIMITS.strikes, DEFAULT_FREE.strikes),
    events: f.events === undefined ? DEFAULT_FREE.events : !!f.events,
    pool: Array.isArray(f.pool) ? f.pool.filter((t) => REGULAR_TYPES.includes(t)) : DEFAULT_FREE.pool.slice(),
    needyPool: Array.isArray(f.needyPool)
      ? f.needyPool.filter((t) => NEEDY_TYPES.includes(t))
      : DEFAULT_FREE.needyPool.slice(),
  };
  out.pool = [...new Set(out.pool)];
  out.needyPool = [...new Set(out.needyPool)];
  if (!out.pool.length) out.pool = DEFAULT_FREE.pool.slice();
  if (!out.needyPool.length) out.needy = 0;
  if (out.regular + out.needy > MAX_SLOTS) out.needy = MAX_SLOTS - out.regular;
  return out;
}

/** Oda ayarlarından bu turun bomba yapılandırmasını çıkarır */
export function bombConfig(settings) {
  if (settings.mode === 'level') {
    const lv = LEVELS.find((l) => l.id === settings.levelId) || LEVELS[0];
    return { levelId: lv.id, regular: lv.regular, needy: lv.needy, time: lv.time, strikes: lv.strikes, pool: lv.pool, needyPool: NEEDY_TYPES, events: lv.events };
  }
  const f = sanitizeFree(settings.free);
  return { levelId: null, ...f };
}
