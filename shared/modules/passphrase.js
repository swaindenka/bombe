// PAROLA (sürekli ilgi ister): Devreye girince bir soru kelimesi ve üç cevap düğmesi gösterir.
// Kılavuzdaki parola tablosunda soru kelimesinin karşılığı olan cevaba basılmalıdır.

import { PASSPHRASES } from '../words.js';

export default {
  type: 'passphrase',
  needy: true,
  generate() {
    return { active: false, challenge: null, options: [], answer: null };
  },
  activate(s, rng, e, lang) {
    const list = PASSPHRASES[lang] || PASSPHRASES.tr;
    const pick = rng.int(0, list.length - 1);
    const decoys = rng.sample(
      list.filter((_, i) => i !== pick).map((p) => p[1]),
      2
    );
    s.active = true;
    s.challenge = list[pick][0];
    s.answer = list[pick][1];
    s.options = rng.shuffle([s.answer, ...decoys]);
  },
  view(s) {
    return s.active ? { active: true, challenge: s.challenge, options: s.options.slice() } : { active: false };
  },
  action(s, a) {
    const i = a && a.press;
    if (!s.active || !Number.isInteger(i) || i < 0 || i >= s.options.length) return {};
    return s.options[i] === s.answer ? { deactivate: true } : { strike: true, deactivate: true };
  },
};
