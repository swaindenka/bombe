import { glyphSvg, GLYPH_VALUES, GLYPH_COUNT } from '/shared/glyphs.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const cells = Array.from({ length: GLYPH_COUNT }, (_, i) => `<div class="gly-cell">${glyphSvg(i)}<span>${GLYPH_VALUES[i]}</span></div>`).join('');
  return `
    ${ident(L, tr ? 'Üzerinde tuhaf semboller olan dört tuş; her tuşun üstünde küçük bir ışık.' : 'Four keys with strange symbols, each with a small light.')}
    ${needs(L, 'glyphs')}
    ${steps(
      tr
        ? [
            'İmhacı dört sembolü tarif eder; her birinin <b>değerini</b> aşağıdan bulun.',
            `Tuşlara değerlerine göre ${mark('küçükten büyüğe')} bastırın. Seri numarasında ${mark('sesli harf varsa')} sıra tersine döner: ${mark('büyükten küçüğe')}.`,
          ]
        : [
            'The defuser describes the four symbols; find each one’s <b>value</b> below.',
            `Press the keys from ${mark('lowest to highest')} value. If the serial ${mark('has a vowel')}, reverse it: ${mark('highest to lowest')}.`,
          ]
    )}
    <div class="gly-grid">${cells}</div>
    ${example(
      L,
      tr
        ? 'Değerler <b>17, 3, 22, 9</b>; seri no. <b>KE47T5</b>. E sesli harf → büyükten küçüğe: <b>22 → 17 → 9 → 3</b>.'
        : 'Values <b>17, 3, 22, 9</b>; serial <b>KE47T5</b>. E is a vowel → highest first: <b>22 → 17 → 9 → 3</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Sembolleri şekliyle tarif ettirin ("içinde nokta olan halka"). Benzer semboller var.', 'Yanlış tuş hata yazdırır ama doğru basılanlar (yeşil ışık) geçerli kalır.']
        : ['Have the symbols described by shape ("a ring with a dot inside"). Some look alike.', 'A wrong key causes a strike, but correctly pressed keys (green light) stay accepted.']
    )}`;
};
