import { glyphSvg, GLYPH_VALUES, GLYPH_COUNT } from '/shared/glyphs.js';
import { ident } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const cells = Array.from(
    { length: GLYPH_COUNT },
    (_, i) => `<div class="gly-cell">${glyphSvg(i)}<span>${GLYPH_VALUES[i]}</span></div>`
  ).join('');
  return `
    ${ident(L, tr ? 'Üzerinde tuhaf semboller olan dört tuşlu modül. Her tuşun üstünde küçük bir ışık var.' : 'A module with four keys showing strange symbols. Each key has a small light.')}
    <ol>
      ${
        tr
          ? `<li>İmhacıdan dört sembolü tarif etmesini isteyin ve aşağıdaki tabloda bulun.</li>
             <li>Tuşlara sembollerin değerine göre <b>küçükten büyüğe</b> sırayla bastırın.</li>
             <li>Seri numarasında <b>sesli harf</b> (A, E, I, U) varsa sıra tersine döner: <b>büyükten küçüğe</b>.</li>
             <li>Yanlış tuş hata yazdırır, ama doğru basılmış tuşlar (ışığı yanan) geçerli kalır.</li>`
          : `<li>Ask the defuser to describe the four symbols and find them in the table below.</li>
             <li>Have the keys pressed in order of their values, <b>lowest to highest</b>.</li>
             <li>If the serial number contains a <b>vowel</b> (A, E, I, U), reverse the order: <b>highest to lowest</b>.</li>
             <li>A wrong key causes a strike, but keys already pressed correctly (lit) stay accepted.</li>`
      }
    </ol>
    <div class="gly-grid">${cells}</div>`;
};
