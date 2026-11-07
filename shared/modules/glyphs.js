// GLİFLER: 4 sembollü tuş. Her sembolün kılavuzda bir değeri var. Tuşlara küçükten büyüğe basılır;
// seri numarasında sesli harf (A, E, I, U) varsa büyükten küçüğe.

import { serialHasVowel } from '../edgework.js';
import { GLYPH_VALUES, GLYPH_COUNT } from '../glyphs.js';

export function glyphOrder(glyphs, e) {
  const idx = [0, 1, 2, 3].sort((a, b) => GLYPH_VALUES[glyphs[a]] - GLYPH_VALUES[glyphs[b]]);
  return serialHasVowel(e) ? idx.reverse() : idx;
}

export default {
  type: 'glyphs',
  needy: false,
  generate(rng, e) {
    const glyphs = rng.sample(
      Array.from({ length: GLYPH_COUNT }, (_, i) => i),
      4
    );
    return { glyphs, order: glyphOrder(glyphs, e), pressed: [] };
  },
  view(s) {
    return { glyphs: s.glyphs.slice(), pressed: s.pressed.slice() };
  },
  action(s, a) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 3 || s.pressed.includes(i)) return {};
    if (s.order[s.pressed.length] === i) {
      s.pressed.push(i);
      return { changed: true, solved: s.pressed.length === 4 };
    }
    return { strike: true };
  },
};
