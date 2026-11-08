// TERAZİ: Sol kefede 2–3 nesne var. Uzman kılavuzdaki ağırlıklardan sol kefenin toplamını hesaplar:
// BAKIR renkli nesne iki kat ağırdır ve her pil sol kefeye 1 ekler. İmhacı sağ kefeye 1, 2, 4, 8, 16'lık
// ağırlıklardan uygun olanları koyup TART'a basar. Terazi kilitli olduğu için ancak tartınca eğilir:
// yanlış tartı hata yazdırır ve hangi kefenin ağır geldiğini gösterir.

import { batteryCount } from '../edgework.js';

export const SCALE_ITEMS = { anchor: 7, bell: 5, key: 3, crown: 9, gear: 6, hourglass: 4 };
export const SCALE_KINDS = Object.keys(SCALE_ITEMS);
export const SCALE_WEIGHTS = [1, 2, 4, 8, 16];
export const SCALE_MAX = SCALE_WEIGHTS.reduce((a, b) => a + b, 0);

export const itemWeight = (it) => SCALE_ITEMS[it.kind] * (it.copper ? 2 : 1);

/** Sol kefenin toplamı (kılavuzdaki tanım) */
export const scaleTotal = (items, e) => items.reduce((a, it) => a + itemWeight(it), 0) + batteryCount(e);

/** Sağ kefeye konacak ağırlıklar: toplamın ikilik yazımı (tek bir doğru seçim vardır) */
export const scalePicks = (total) => SCALE_WEIGHTS.map((w) => (total & w) !== 0);

export default {
  type: 'scale',
  needy: false,
  generate(rng, e) {
    for (;;) {
      const n = rng.pick([2, 3, 3]);
      const items = Array.from({ length: n }, () => ({ kind: rng.pick(SCALE_KINDS), copper: rng.chance(0.3) }));
      const total = scaleTotal(items, e);
      if (total >= 6 && total <= SCALE_MAX) return { items, total, picked: SCALE_WEIGHTS.map(() => false), tilt: 0 };
    }
  },
  view(s) {
    return { items: s.items.map((it) => ({ ...it })), picked: s.picked.slice(), tilt: s.tilt };
  },
  action(s, a) {
    if (!a) return {};
    if (Number.isInteger(a.toggle) && a.toggle >= 0 && a.toggle < SCALE_WEIGHTS.length) {
      s.picked[a.toggle] = !s.picked[a.toggle];
      s.tilt = 0;
      return { changed: true };
    }
    if (a.weigh) {
      const right = SCALE_WEIGHTS.reduce((acc, w, i) => acc + (s.picked[i] ? w : 0), 0);
      if (right === s.total) return { solved: true, changed: true };
      // 1: sol kefe ağır, -1: sağ kefe ağır
      s.tilt = s.total > right ? 1 : -1;
      return { strike: true, changed: true };
    }
    return {};
  },
};
