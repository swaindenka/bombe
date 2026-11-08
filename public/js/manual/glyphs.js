import { glyphSvg, GLYPH_VALUES, GLYPH_COUNT } from '/shared/glyphs.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const cells = Array.from({ length: GLYPH_COUNT }, (_, i) => `<div class="gly-cell">${glyphSvg(i)}<span>${GLYPH_VALUES[i]}</span></div>`).join('');
  return `
    ${ident(L, tr ? 'Üzerinde tuhaf semboller olan dört tuşlu modül. Her tuşun üstünde küçük bir ışık var.' : 'A module with four keys showing strange symbols. Each key has a small light.')}
    ${needs(L, 'glyphs')}
    ${steps(
      tr
        ? [
            'İmhacı dört sembolü tarif eder; her birini aşağıdaki tabloda bulup <b>değerini</b> not edin.',
            `Seri numarasında ${mark('sesli harf YOKSA')}: değerleri ${mark('küçükten büyüğe')} sıralayın.`,
            `Seri numarasında ${mark('sesli harf VARSA')} (A, E, I, U): ${mark('büyükten küçüğe')} sıralayın.`,
            'Tuşlara bu sırayla bastırın.',
          ]
        : [
            'The defuser describes the four symbols; find each one below and note its <b>value</b>.',
            `If the serial has ${mark('NO vowel')}: order the values ${mark('lowest to highest')}.`,
            `If the serial ${mark('HAS a vowel')} (A, E, I, U): order them ${mark('highest to lowest')}.`,
            'Have the keys pressed in that order.',
          ]
    )}
    <div class="gly-grid">${cells}</div>
    ${example(
      L,
      tr
        ? 'Değerler <b>17, 3, 22, 9</b>. Seri no. <b>KR47T5</b> → sesli harf yok → sıra: <b>3 → 9 → 17 → 22</b>.'
        : 'Values <b>17, 3, 22, 9</b>. Serial <b>KR47T5</b> → no vowel → order: <b>3 → 9 → 17 → 22</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Doğru basılan tuşun ışığı yeşil yanar; ona tekrar basmayın.', 'Yanlış tuş hata yazdırır ama doğru basılmış tuşlar geçerli kalır, baştan başlamazsınız.']
        : ['A correctly pressed key lights green; don’t press it again.', 'A wrong key causes a strike, but keys already pressed correctly stay accepted.']
    )}`;
};
