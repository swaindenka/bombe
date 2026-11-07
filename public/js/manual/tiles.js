import { TILE_TABLE, TILE_COLORS } from '/shared/modules/tiles.js';
import { swatch, ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const rows = TILE_COLORS.map(
    (c) => `<tr><td class="nowrap">${swatch(c, L)}</td>${TILE_TABLE[c].map((x) => `<td class="nowrap">${swatch(x, L)}</td>`).join('')}</tr>`
  ).join('');
  return `
    ${ident(L, tr ? '3×3 düzende dokuz renkli karodan oluşan modül.' : 'A module made of nine coloured tiles in a 3×3 grid.')}
    <ol>
      ${
        tr
          ? `<li>En çok karoda bulunan rengi (<b>baskın renk</b>) bulun. Eşitlik varsa öncelik sırası: kırmızı &gt; mavi &gt; yeşil &gt; sarı.</li>
             <li>Baskın renk ve pil sayısıyla tablodan <b>basılacak rengi</b> bulun.</li>
             <li>O renkteki karoların <b>hepsine</b> bastırın; sıra önemli değil.</li>
             <li>Modülde o renkte hiç karo yoksa bunun yerine baskın renkteki karoların hepsine bastırın.</li>
             <li>Yanlış renkteki karoya basmak hata yazdırır.</li>`
          : `<li>Find the colour that appears on the most tiles (the <b>dominant colour</b>). On a tie, priority is red &gt; blue &gt; green &gt; yellow.</li>
             <li>Use the dominant colour and the battery count to find the <b>colour to press</b>.</li>
             <li>Press <b>every</b> tile of that colour, in any order.</li>
             <li>If there is no tile of that colour, press every tile of the dominant colour instead.</li>
             <li>Pressing a tile of the wrong colour causes a strike.</li>`
      }
    </ol>
    <table class="rules"><thead><tr><th>${tr ? 'Baskın renk' : 'Dominant'}</th><th>${tr ? '0–1 pil' : '0–1 batt.'}</th><th>${tr ? '2–3 pil' : '2–3 batt.'}</th><th>${tr ? '4+ pil' : '4+ batt.'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Basılan karolar söner.' : 'Pressed tiles go dark.')}`;
};
