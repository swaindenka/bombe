// MANOMETRELER: Üç ibreli gösterge (0–9) ve her birinin altında bir vana. İki aşama.
// 1) İki gösterge aynıysa farklı olanın vanası (üçü aynıysa ortadaki).
// 2) Değilse toplam 15'ten büyükse en yüksek değerli.
// 3) Değilse seri numarasında sesli harf varsa en düşük değerli.
// 4) Değilse değeri ortada olan.

import { serialHasVowel } from '../edgework.js';

export const GAUGE_STAGES = 2;

export function gaugeAnswer(values, e) {
  const [a, b, c] = values;
  if (a === b && b === c) return 1;
  if (a === b) return 2;
  if (a === c) return 1;
  if (b === c) return 0;
  const order = [0, 1, 2].sort((x, y) => values[x] - values[y]);
  if (a + b + c > 15) return order[2];
  if (serialHasVowel(e)) return order[0];
  return order[1];
}

const roll = (rng) => [rng.int(0, 9), rng.int(0, 9), rng.int(0, 9)];

export default {
  type: 'gauges',
  needy: false,
  generate(rng) {
    return { stage: 1, values: roll(rng) };
  },
  view(s) {
    return { stage: s.stage, values: s.values.slice() };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 2) return {};
    const ok = gaugeAnswer(s.values, ctx.edgework) === i;
    if (ok && s.stage === GAUGE_STAGES) return { solved: true, changed: true };
    if (ok) s.stage++;
    s.values = roll(ctx.rng);
    return ok ? { changed: true } : { strike: true, changed: true };
  },
};
