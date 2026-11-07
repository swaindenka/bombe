// PUSULA: Ekranda renkli bir ok, etrafında dört yön düğmesi. Dört aşama.
// Kırmızı: tersi · Mavi: saat yönünde 90° · Yeşil: aynısı · Sarı: saat yönünün tersine 90°.
// 3. ve 4. aşamada seri numarasının son rakamı tekse sonucu bir kez daha saat yönünde çevir.

import { serialIsOdd } from '../edgework.js';

export const COMPASS = ['N', 'E', 'S', 'W'];
export const ARROW_COLORS = ['red', 'blue', 'green', 'yellow'];
export const ARROW_TURN = { red: 2, blue: 1, green: 0, yellow: 3 };
export const ARROW_STAGES = 4;

export function arrowAnswer(stage, dir, color, e) {
  let turn = ARROW_TURN[color];
  if (stage >= 3 && serialIsOdd(e)) turn += 1;
  return COMPASS[(COMPASS.indexOf(dir) + turn) % 4];
}

const roll = (rng) => ({ dir: rng.pick(COMPASS), color: rng.pick(ARROW_COLORS) });

export default {
  type: 'arrows',
  needy: false,
  generate(rng) {
    return { stage: 1, ...roll(rng) };
  },
  view(s) {
    return { stage: s.stage, dir: s.dir, color: s.color };
  },
  action(s, a, ctx) {
    const d = a && a.press;
    if (!COMPASS.includes(d)) return {};
    const ok = arrowAnswer(s.stage, s.dir, s.color, ctx.edgework) === d;
    if (ok && s.stage === ARROW_STAGES) return { solved: true, changed: true };
    if (ok) s.stage++;
    Object.assign(s, roll(ctx.rng));
    return ok ? { changed: true } : { strike: true, changed: true };
  },
};
