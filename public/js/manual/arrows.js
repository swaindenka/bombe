import { COMPASS, ARROW_COLORS, arrowAnswer } from '/shared/modules/arrows.js';
import { swatch, ident, needs, steps, example, warn, mark, DIR_LABEL } from './common.js';

// Hazır cevap tabloları: uzman oku kafasında döndürmek zorunda kalmasın.
const ODD = { serial: 'AA11A1', batteryHolders: [], indicators: [], portPlates: [] };

export default (L) => {
  const tr = L === 'tr';
  const D = DIR_LABEL[L];
  const table = (stage, e) =>
    `<table class="rules"><thead><tr><th>${tr ? 'Ok rengi ↓ / Okun yönü →' : 'Arrow colour ↓ / Arrow points →'}</th>${COMPASS.map((d) => `<th class="center">${D[d]}</th>`).join('')}</tr></thead><tbody>${ARROW_COLORS.map(
      (c) => `<tr><td class="nowrap">${swatch(c, L)}</td>${COMPASS.map((d) => `<td class="center"><b>${D[arrowAnswer(stage, d, c, e)]}</b></td>`).join('')}</tr>`
    ).join('')}</tbody></table>`;
  return `
    ${ident(L, tr ? 'Ortasında renkli büyük bir ok, dört yanında yön düğmeleri ve sol üstte 4 aşama ışığı olan modül.' : 'A module with a large coloured arrow, direction buttons on all four sides and 4 stage lights.')}
    ${needs(L, 'arrows')}
    ${steps(
      tr
        ? [
            'Modül <b>4 aşamalıdır</b>. Her aşamada imhacıdan okun <b>rengini</b> ve <b>gösterdiği yönü</b> öğrenin.',
            `${mark('1. ve 2. aşamada')} her zaman <b>A</b> tablosunu kullanın.`,
            `${mark('3. ve 4. aşamada')}: seri no. son rakamı <b>çiftse</b> yine <b>A</b>, ${mark('tekse B')} tablosunu kullanın.`,
            'Tablodaki yöndeki düğmeye bastırın.',
          ]
        : [
            'The module has <b>4 stages</b>. At each stage get the arrow’s <b>colour</b> and the <b>direction it points</b>.',
            `${mark('In stages 1 and 2')} always use table <b>A</b>.`,
            `${mark('In stages 3 and 4')}: if the serial’s last digit is <b>even</b> use <b>A</b>, if ${mark('odd use B')}.`,
            'Press the button in the direction shown in the table.',
          ]
    )}
    <h3>A · ${tr ? 'Aşama 1–2 (ya da seri çift)' : 'Stage 1–2 (or serial even)'}</h3>
    ${table(1, ODD)}
    <h3>B · ${tr ? 'Aşama 3–4 ve seri no. son rakamı TEK' : 'Stage 3–4 and serial last digit ODD'}</h3>
    ${table(3, ODD)}
    ${example(
      L,
      tr
        ? '3. aşama, seri no. <b>…5</b> (tek), ok <b>mavi</b> ve <b>yukarıyı</b> gösteriyor → <b>B</b> tablosu → <b>↓ Aşağı</b>.'
        : 'Stage 3, serial ends in <b>5</b> (odd), arrow <b>blue</b> pointing <b>up</b> → table <b>B</b> → <b>↓ Down</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Kaçıncı aşamada olduğunuzu imhacı sol üstteki yanan ışıklardan söyleyebilir (yanan ışık sayısı + 1).', 'Yanlış düğme hata yazdırır ve yeni bir ok gelir; aşama ilerlemez.']
        : ['The defuser can tell the stage from the lit lights in the top-left (lit lights + 1).', 'A wrong button causes a strike and a new arrow appears; the stage does not advance.']
    )}`;
};
