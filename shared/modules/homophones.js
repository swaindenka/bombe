// SESTEŞ: Ekranda bir kelime, altında dört kelimeli düğme. Kelimeler birbirine çok benzer;
// asıl zorluk doğru kelimeyi sesli olarak tarif etmek. Kılavuzdaki tabloda ekrandaki kelimenin
// karşılığı olan kelimeye basılır. Üç aşama.

import { HOMOPHONES } from '../words.js';

export const HOMOPHONE_STAGES = 3;

function newStage(rng, lang) {
  const list = HOMOPHONES[lang] || HOMOPHONES.tr;
  const [display, target] = rng.pick(list);
  const others = rng.sample(
    list.map((p) => p[0]).filter((w) => w !== target),
    3
  );
  return { display, target, buttons: rng.shuffle([target, ...others]) };
}

export default {
  type: 'homophones',
  needy: false,
  generate(rng, e, lang) {
    return { stage: 1, current: newStage(rng, lang) };
  },
  view(s) {
    return { stage: s.stage, display: s.current.display, buttons: s.current.buttons.slice() };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 3) return {};
    const ok = s.current.buttons[i] === s.current.target;
    if (ok && s.stage === HOMOPHONE_STAGES) return { solved: true, changed: true };
    if (ok) s.stage++;
    s.current = newStage(ctx.rng, ctx.lang);
    return ok ? { changed: true } : { strike: true, changed: true };
  },
};
