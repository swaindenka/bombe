// IŞIK PANELİ: 3×3 lambalı düğme ve köşede bir sembol. Sembol kılavuzdaki HEDEF deseni verir; bombada
// yanan gösterge varsa hedef desenin tersi (yanan ↔ sönük) geçerlidir. Bir düğmeye basmak o lambayı ve
// üst/alt/sol/sağ komşularını değiştirir. Lambalar hedefle aynı olunca ONAY'a basılır.
// Basmak serbesttir; yalnızca yanlış ONAY hata yazdırır. 3×3 "artı" düzeninde her desene ulaşılabilir.

import { litIndicatorCount } from '../edgework.js';

export const PANEL_SYMBOLS = ['sun', 'moon', 'cloud', 'drop', 'leaf', 'bolt'];

// Satır satır, 1 = yanan
export const PANEL_TARGETS = {
  sun: [0, 1, 0, 1, 1, 1, 0, 1, 0],
  moon: [1, 1, 0, 1, 0, 0, 1, 1, 0],
  cloud: [0, 0, 0, 1, 1, 1, 1, 0, 1],
  drop: [0, 1, 0, 0, 1, 0, 1, 1, 1],
  leaf: [1, 0, 0, 1, 1, 0, 0, 1, 1],
  bolt: [0, 1, 1, 0, 1, 0, 1, 1, 0],
};

/** Basılan düğmeyle değişen lambalar: kendisi ve dört komşusu */
export function pressMask(i) {
  const x = i % 3;
  const y = Math.floor(i / 3);
  const out = [i];
  if (y > 0) out.push(i - 3);
  if (y < 2) out.push(i + 3);
  if (x > 0) out.push(i - 1);
  if (x < 2) out.push(i + 1);
  return out;
}

export function press(cells, i) {
  const out = cells.slice();
  for (const k of pressMask(i)) out[k] = out[k] ? 0 : 1;
  return out;
}

export function panelTarget(symbol, e) {
  const t = PANEL_TARGETS[symbol];
  return litIndicatorCount(e) > 0 ? t.map((v) => 1 - v) : t.slice();
}

/** cells → target için basılacak düğmeler (her düğme en fazla bir kez; çözüm tektir) */
export function panelSolution(cells, target) {
  for (let m = 0; m < 512; m++) {
    let c = cells;
    for (let i = 0; i < 9; i++) if (m & (1 << i)) c = press(c, i);
    if (c.every((v, k) => v === target[k])) return [...Array(9).keys()].filter((i) => m & (1 << i));
  }
  return null;
}

/**
 * Kılavuzdaki "ışık kovalama" yönteminin son adımı: üst iki satır düzeltildikten sonra alt satırda
 * kalan yanlışların deseni → üst satırda basılacak düğmeler. Oyunun kendi kuralından hesaplanır.
 */
export function chaseTable() {
  const chase = (diff) => {
    let d = diff;
    for (const row of [0, 1]) for (let x = 0; x < 3; x++) if (d[row * 3 + x]) d = press(d, (row + 1) * 3 + x);
    return d;
  };
  const table = {};
  for (let s = 1; s < 8; s++) {
    let d = Array(9).fill(0);
    const top = [0, 1, 2].filter((x) => s & (1 << x));
    for (const x of top) d = press(d, x);
    const bottom = chase(d).slice(6).join('');
    table[bottom] = top;
  }
  return table;
}

export default {
  type: 'lights',
  needy: false,
  generate(rng, e) {
    const symbol = rng.pick(PANEL_SYMBOLS);
    const target = panelTarget(symbol, e);
    // Başlangıç: hedefe en az 4 basış uzakta, kolayca tahmin edilemesin
    for (;;) {
      const cells = Array.from({ length: 9 }, () => (rng.chance(0.5) ? 1 : 0));
      const sol = panelSolution(cells, target);
      if (sol.length >= 4) return { symbol, target, cells };
    }
  },
  view(s) {
    return { symbol: s.symbol, cells: s.cells.slice() };
  },
  action(s, a) {
    if (!a) return {};
    if (Number.isInteger(a.press) && a.press >= 0 && a.press < 9) {
      s.cells = press(s.cells, a.press);
      return { changed: true };
    }
    if (a.submit) return s.cells.every((v, k) => v === s.target[k]) ? { solved: true, changed: true } : { strike: true };
    return {};
  },
};
