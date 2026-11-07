// RENK IZGARASI: 3x3 renkli karo. En çok bulunan renk (eşitlikte kırmızı > mavi > yeşil > sarı)
// ve pil sayısı, hangi renkteki karoların hepsine basılacağını verir.

import { batteryCount } from '../edgework.js';

export const TILE_COLORS = ['red', 'blue', 'green', 'yellow'];

// Satır: baskın renk; sütunlar: 0–1 pil, 2–3 pil, 4+ pil
export const TILE_TABLE = {
  red: ['blue', 'yellow', 'red'],
  blue: ['green', 'red', 'yellow'],
  green: ['yellow', 'blue', 'green'],
  yellow: ['red', 'green', 'blue'],
};

export function dominantColor(tiles) {
  let best = null;
  let bestCount = -1;
  for (const c of TILE_COLORS) {
    const n = tiles.filter((t) => t === c).length;
    if (n > bestCount) {
      best = c;
      bestCount = n;
    }
  }
  return best;
}

export function tilesTarget(tiles, e) {
  const dom = dominantColor(tiles);
  const b = batteryCount(e);
  const col = b <= 1 ? 0 : b <= 3 ? 1 : 2;
  const target = TILE_TABLE[dom][col];
  return tiles.includes(target) ? target : dom;
}

export default {
  type: 'tiles',
  needy: false,
  generate(rng, e) {
    let tiles;
    do {
      tiles = Array.from({ length: 9 }, () => rng.pick(TILE_COLORS));
    } while (new Set(tiles).size < 3);
    return { tiles, target: tilesTarget(tiles, e), pressed: [] };
  },
  view(s) {
    return { tiles: s.tiles.slice(), pressed: s.pressed.slice() };
  },
  action(s, a) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 8 || s.pressed.includes(i)) return {};
    if (s.tiles[i] !== s.target) return { strike: true };
    s.pressed.push(i);
    const remaining = s.tiles.some((t, k) => t === s.target && !s.pressed.includes(k));
    return { changed: true, solved: !remaining };
  },
};
