// RENK KARMAŞASI: Ekranda bir renk adı başka bir renkle yazılmış. Dört düğmenin hem dolgu rengi
// hem de üzerinde başka bir renk adı var. Üç aşama; her aşamada doğru düğmeye basılmalı.
//
// 1) Kelime ile mürekkep rengi AYNIYSA: aşama numarası kadarıncı düğmeye bas (soldan).
// 2) Değilse arka plan AÇIKSA hedef = kelimenin söylediği renk; KOYUYSA hedef = mürekkep rengi.
// 3) Seri numarasının son rakamı TEKSE üzerinde hedef rengin ADI yazan düğmeye,
//    ÇİFTSE dolgu rengi hedef renk olan düğmeye bas.

import { serialIsOdd } from '../edgework.js';

export const STROOP_COLORS = ['red', 'blue', 'green', 'yellow'];

export function stroopAnswer(stage, st, e) {
  if (st.word === st.ink) return stage - 1;
  const target = st.background === 'light' ? st.word : st.ink;
  if (serialIsOdd(e)) return st.labels.indexOf(target);
  return st.fills.indexOf(target);
}

function newStage(rng) {
  const word = rng.pick(STROOP_COLORS);
  const ink = rng.chance(0.2) ? word : rng.pick(STROOP_COLORS.filter((c) => c !== word));
  return {
    word,
    ink,
    background: rng.chance(0.5) ? 'light' : 'dark',
    fills: rng.shuffle(STROOP_COLORS),
    labels: rng.shuffle(STROOP_COLORS),
  };
}

export default {
  type: 'stroop',
  needy: false,
  generate(rng) {
    return { stage: 1, current: newStage(rng) };
  },
  view(s) {
    const c = s.current;
    return { stage: s.stage, word: c.word, ink: c.ink, background: c.background, fills: c.fills, labels: c.labels };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 3) return {};
    const ok = stroopAnswer(s.stage, s.current, ctx.edgework) === i;
    if (ok && s.stage === 3) return { solved: true, changed: true };
    if (ok) s.stage++;
    s.current = newStage(ctx.rng);
    return ok ? { changed: true } : { strike: true, changed: true };
  },
};
