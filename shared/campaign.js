// KAMPANYA: Seviye listesinden bağımsız, kendi bölüm sistemi.
// Her kampanya rastgele bir tohumla başlar; 12 bölümün her biri bu tohumdan üretilir. Zorluk
// eğrisi sabittir (bölüm ilerledikçe modül sayısı artar, süre azalır, zor modüller ve koşullar
// açılır) ama modüller, süre, mekân ve koşullar her kampanyada farklıdır. Patlayan bölüm,
// aynı zorlukta ama farklı bir bombayla yeniden denenir.

import { createRng } from './rng.js';
import { TIERS, NEEDY_TIERS, REGULAR_TYPES } from './modules/index.js';

export const CAMPAIGN_STAGES = 12;
export const CAMPAIGN_LIVES = 3;

// Kampanya zorluğu: kampanya başlarken seçilir ve o kampanya boyunca değişmez.
// timeMul: süre çarpanı · strikesDelta: hata hakkı farkı · extraMods: bölüm başına ek koşul · lives: can
export const DIFFICULTIES = {
  normal: { icon: '🟢', timeMul: 1, strikesDelta: 0, extraMods: 0, lives: 3, name: { tr: 'Normal', en: 'Normal' }, desc: { tr: '3 can, standart süre.', en: '3 lives, standard time.' } },
  hard: { icon: '🟠', timeMul: 0.85, strikesDelta: 0, extraMods: 1, lives: 3, name: { tr: 'Zor', en: 'Hard' }, desc: { tr: 'Süre %15 kısa, 3. bölümden itibaren her bölümde bir koşul fazla.', en: '15% less time, one extra condition per stage from stage 3.' } },
  expert: { icon: '🔴', timeMul: 0.75, strikesDelta: -1, extraMods: 1, lives: 2, name: { tr: 'Uzman', en: 'Expert' }, desc: { tr: 'Süre %25 kısa, bir hata hakkı eksik, fazladan koşul ve sadece 2 can.', en: '25% less time, one strike fewer, an extra condition and only 2 lives.' } },
};
export const DIFFICULTY_IDS = Object.keys(DIFFICULTIES);
export const difficultyOf = (id) => DIFFICULTIES[id] || DIFFICULTIES.normal;

// Bölümü değiştiren koşullar. minStage: en erken hangi bölümde çıkabilir.
export const MODIFIERS = {
  darkness: { icon: '🌑', minStage: 3, events: ['blackout'], eventRate: 2, name: { tr: 'Karanlık oda', en: 'Dark room' }, desc: { tr: 'Işıklar sık sık söner.', en: 'The lights keep going out.' } },
  quake: { icon: '🌋', minStage: 3, events: ['shake', 'alarm'], eventRate: 2, name: { tr: 'Sarsıntılı bölge', en: 'Unstable ground' }, desc: { tr: 'Sarsıntılar ve alarmlar sık.', en: 'Frequent tremors and alarms.' } },
  static: { icon: '📡', minStage: 4, events: ['glitch'], eventRate: 2, name: { tr: 'Hatlarda parazit', en: 'Line interference' }, desc: { tr: 'Uzmanların kılavuzuna sık parazit girer.', en: 'The experts’ manuals glitch often.' } },
  overclock: { icon: '⏩', minStage: 4, timerRate: 1.15, name: { tr: 'Hızlı sayaç', en: 'Overclocked timer' }, desc: { tr: 'Sayaç baştan %15 hızlı akar.', en: 'The timer runs 15% fast from the start.' } },
  fragile: { icon: '🥚', minStage: 6, strikesDelta: -1, name: { tr: 'Kırılgan', en: 'Fragile' }, desc: { tr: 'Bir hata hakkı eksik.', en: 'One strike fewer.' } },
  crowded: { icon: '👥', minStage: 5, needyAdd: 1, name: { tr: 'Kalabalık', en: 'Crowded' }, desc: { tr: 'Bir sürekli ilgi modülü fazla.', en: 'One extra needy module.' } },
  bonusTime: { icon: '⏳', minStage: 2, timeAdd: 60, name: { tr: 'Ek süre', en: 'Extra time' }, desc: { tr: 'Sayaca 1 dakika eklenir.', en: 'One extra minute on the clock.' } },
  bounty: { icon: '💰', minStage: 3, solveBonusMs: 20000, timeMul: 0.85, name: { tr: 'Ödül süresi', en: 'Time bounty' }, desc: { tr: 'Süre kısa başlar ama çözülen her modül sayaca 20 sn ekler.', en: 'Less time to start, but every solved module adds 20 s.' } },
  sensitive: { icon: '⚡', minStage: 5, strikeSpeedup: 0.5, name: { tr: 'Hassas devre', en: 'Sensitive circuit' }, desc: { tr: 'Her hata sayacı %25 yerine %50 hızlandırır.', en: 'Each strike speeds the timer up by 50% instead of 25%.' } },
  surge: { icon: '🔌', minStage: 4, events: ['surge'], eventRate: 2, name: { tr: 'Dalgalı akım', en: 'Power surges' }, desc: { tr: 'Modül ekranları sık sık karıncalanır.', en: 'Module screens keep flickering with static.' } },
  scrambled: { icon: '🗂', minStage: 5, scrambledManual: true, name: { tr: 'Dağınık kılavuz', en: 'Shuffled manual' }, desc: { tr: 'Kılavuzun sayfaları karışık; içindekiler ve arama yok.', en: 'Manual pages are shuffled; no contents or search.' } },
};
const MOD_IDS = Object.keys(MODIFIERS);

const ADJ = {
  tr: ['Gece', 'Paslı', 'Sessiz', 'Kızıl', 'Soğuk', 'Kör', 'Demir', 'Gri', 'Yarım', 'Son', 'Kayıp', 'Derin'],
  en: ['Night', 'Rusty', 'Silent', 'Crimson', 'Cold', 'Blind', 'Iron', 'Grey', 'Broken', 'Last', 'Lost', 'Deep'],
};
const NOUN = {
  tr: ['Baykuş', 'Çapa', 'Fener', 'Tilki', 'Kule', 'Saat', 'Kartal', 'Liman', 'Pusula', 'Gölge', 'Kum', 'Yıldız'],
  en: ['Owl', 'Anchor', 'Lantern', 'Fox', 'Tower', 'Clock', 'Eagle', 'Harbor', 'Compass', 'Shadow', 'Sand', 'Star'],
};
const PLACES = {
  tr: ['Liman Deposu', 'Metro Hattı', 'Eski Rasathane', 'Terk Edilmiş Fabrika', 'Otel Bodrumu', 'Radyo Kulesi', 'Müze Arşivi', 'Baraj Kontrol Odası', 'Tren Garı', 'Kazan Dairesi', 'Kütüphane Mahzeni', 'Stadyum Tüneli', 'Gemi Ambarı', 'Maden Asansörü', 'Çatı Laboratuvarı', 'Sunucu Odası'],
  en: ['Harbor Warehouse', 'Subway Line', 'Old Observatory', 'Abandoned Factory', 'Hotel Basement', 'Radio Tower', 'Museum Archive', 'Dam Control Room', 'Train Station', 'Boiler Room', 'Library Vault', 'Stadium Tunnel', 'Ship Hold', 'Mine Elevator', 'Rooftop Lab', 'Server Room'],
};

/** Kampanyanın kod adı (ör. "Paslı Fener") */
export function codename(seed, lang = 'tr') {
  const r = createRng(seed ^ 0x5bd1e995);
  const a = r.int(0, ADJ.tr.length - 1);
  const n = r.int(0, NOUN.tr.length - 1);
  return `${(ADJ[lang] || ADJ.tr)[a]} ${(NOUN[lang] || NOUN.tr)[n]}`;
}

export const placeName = (index, lang = 'tr') => (PLACES[lang] || PLACES.tr)[index] || '';

const round15 = (s) => Math.round(s / 15) * 15;

const unlockedAt = (s) => [...TIERS[1], ...(s >= 3 ? TIERS[2] : []), ...(s >= 6 ? TIERS[3] : [])];

/**
 * Bölümün öne çıkan modülü. Kampanya boyunca aynı modül tekrar öne çıkmaz (hepsi bitene kadar);
 * yeni kademe açılan bölümde (3 ve 6) o kademeden bir modül seçilir.
 */
function featuredFor(seed, stage) {
  const order = createRng(seed).shuffle(REGULAR_TYPES);
  const used = new Set();
  let pick = null;
  for (let s = 1; s <= stage; s++) {
    const fresh = s === 3 ? TIERS[2] : s === 6 ? TIERS[3] : unlockedAt(s);
    let options = order.filter((t) => fresh.includes(t) && !used.has(t));
    if (!options.length) options = order.filter((t) => unlockedAt(s).includes(t) && !used.has(t));
    if (!options.length) {
      used.clear();
      options = order.filter((t) => unlockedAt(s).includes(t));
    }
    pick = options[0];
    used.add(pick);
  }
  return pick;
}

/**
 * Bir bölümün bomba yapılandırması. Aynı (seed, stage, attempt) her zaman aynı sonucu verir.
 * @param {number} seed     kampanya tohumu
 * @param {number} stage    1..CAMPAIGN_STAGES
 * @param {number} attempt  0 = ilk deneme; patlayınca artar ve bölüm farklı bir bombayla gelir
 */
export function campaignStage(seed, stage, attempt = 0, difficulty = 'normal') {
  const s = Math.max(1, Math.min(CAMPAIGN_STAGES, stage));
  const diff = difficultyOf(difficulty);
  const rng = createRng((seed + s * 7919 + attempt * 104729) >>> 0);

  // Kademeler bölüm ilerledikçe açılır
  const unlocked = unlockedAt(s);
  const needyUnlocked = [...(s >= 3 ? NEEDY_TIERS[1] : []), ...(s >= 7 ? NEEDY_TIERS[2] : [])];

  const featured = featuredFor(seed, s);

  // Koşullar
  const modCount = (s <= 2 ? 0 : s <= 5 ? rng.int(0, 1) : s < CAMPAIGN_STAGES ? rng.int(1, 2) : 2) + (s >= 3 ? diff.extraMods : 0);
  const candidates = MOD_IDS.filter((id) => MODIFIERS[id].minStage <= s && (id !== 'crowded' || needyUnlocked.length));
  // Ek süre zorlukla çelişmesin: zor kampanyalarda ek süre yerine başka koşullar gelir
  const modifiers = rng.sample(diff.extraMods ? candidates.filter((id) => id !== 'bonusTime') : candidates, modCount);
  const mod = (key) => modifiers.map((id) => MODIFIERS[id][key]).filter((v) => v !== undefined);

  // Taban modül sayısı bölümle artar; ±1 oynar ama bölüme göre bir alt sınırın altına düşmez
  const base = 3 + Math.floor((s - 1) * 0.6);
  let regular = Math.max(3 + Math.floor((s - 1) / 3), Math.min(10, base + rng.pick([-1, 0, 0, 1])));
  let needy = needyUnlocked.length ? (s <= 7 ? 1 : 2) : 0;
  needy = Math.min(3, needy + mod('needyAdd').reduce((a, b) => a + b, 0));
  if (regular + needy > 11) regular = 11 - needy;

  const perModule = 72 - s * 2;
  const timeMul = diff.timeMul * mod('timeMul').reduce((a, b) => a * b, 1);
  let time = round15((regular * perModule + needy * 20 + rng.int(-20, 20)) * timeMul);
  time = Math.max(120, time + mod('timeAdd').reduce((a, b) => a + b, 0));

  let strikes = s <= 6 ? 3 : 2;
  strikes = Math.max(1, strikes + diff.strikesDelta + mod('strikesDelta').reduce((a, b) => a + b, 0));

  const eventTypes = [...new Set(mod('events').flat())];
  const events = s >= 4 || eventTypes.length > 0;
  const pool = [...new Set([featured, ...rng.sample(unlocked, Math.min(unlocked.length, regular + 2))])];

  return {
    levelId: null,
    stage: s,
    attempt,
    regular,
    needy,
    time,
    strikes,
    pool,
    needyPool: needyUnlocked,
    introduces: [featured],
    events,
    eventTypes: eventTypes.length ? eventTypes : null,
    eventRate: eventTypes.length ? 2 : 1,
    timerRate: mod('timerRate')[0] || 1,
    strikeSpeedup: mod('strikeSpeedup')[0],
    solveBonusMs: mod('solveBonusMs')[0] || 0,
    scrambledManual: mod('scrambledManual').length > 0,
    difficulty: DIFFICULTIES[difficulty] ? difficulty : 'normal',
    modifiers,
    featured,
    place: rng.int(0, PLACES.tr.length - 1),
  };
}

/** Sonuç ekranı ve lobide gösterilecek kısa bölüm özeti */
export function stageBrief(cfg) {
  return {
    stage: cfg.stage,
    regular: cfg.regular,
    needy: cfg.needy,
    time: cfg.time,
    strikes: cfg.strikes,
    modifiers: cfg.modifiers,
    featured: cfg.featured,
    place: cfg.place,
  };
}
