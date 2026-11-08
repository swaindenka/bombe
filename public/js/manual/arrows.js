import { ARROW_COLORS, ARROW_TURN } from '/shared/modules/arrows.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

// Pusula gülü: saat yönü ↑ → → → ↓ → ←
const rose = (L) => {
  const tr = L === 'tr';
  return `<svg class="rose" viewBox="0 0 120 120" aria-hidden="true">
    <defs><marker id="roseArr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" class="rose-head"/></marker></defs>
    <circle cx="60" cy="60" r="38" class="rose-ring"/>
    <path d="M66 22.5 A38 38 0 0 1 97.5 54" class="rose-cw" marker-end="url(#roseArr)"/><path d="M97.5 66 A38 38 0 0 1 66 97.5" class="rose-cw" marker-end="url(#roseArr)"/><path d="M54 97.5 A38 38 0 0 1 22.5 66" class="rose-cw" marker-end="url(#roseArr)"/><path d="M22.5 54 A38 38 0 0 1 54 22.5" class="rose-cw" marker-end="url(#roseArr)"/>
    <text x="60" y="14">${tr ? '↑ Yukarı' : '↑ Up'}</text><text x="60" y="116">${tr ? '↓ Aşağı' : '↓ Down'}</text>
    <text x="110" y="64" class="r">→</text><text x="10" y="64" class="l">←</text>
    <text x="60" y="64" class="mid">${tr ? 'saat yönü ↻' : 'clockwise ↻'}</text>
  </svg>`;
};

export default (L) => {
  const tr = L === 'tr';
  const TURN = {
    tr: ['Aynı yön', 'Saat yönünde ¼ tur', 'Ters yön (½ tur)', 'Saat yönünün tersine ¼ tur'],
    en: ['Same direction', '¼ turn clockwise', 'Opposite (½ turn)', '¼ turn anticlockwise'],
  }[L];
  const rows = ARROW_COLORS.map((c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${TURN[ARROW_TURN[c]]}</td></tr>`).join('');
  return `
    ${ident(L, tr ? 'Ortada renkli büyük bir ok, dört yanında yön düğmeleri, sol üstte 4 aşama ışığı.' : 'A big coloured arrow, direction buttons on four sides and 4 stage lights.')}
    ${needs(L, 'arrows')}
    ${steps(
      tr
        ? [
            'Modül <b>4 aşamadır</b>. Her aşamada okun <b>rengini</b> ve <b>gösterdiği yönü</b> sorun.',
            'Okun yönünden başlayıp rengin söylediği kadar dönün; vardığınız yöndeki düğmeye bastırın.',
            `${mark('3. ve 4. aşamada')}, seri no. son rakamı ${mark('tekse')} sonuca bir ${mark('¼ tur saat yönünde')} daha ekleyin.`,
          ]
        : [
            'The module has <b>4 stages</b>. At each stage ask for the arrow’s <b>colour</b> and the <b>direction it points</b>.',
            'Start from the arrow’s direction and turn as its colour says; press the button you end up at.',
            `${mark('In stages 3 and 4')}, if the serial’s last digit is ${mark('odd')}, turn ${mark('another ¼ clockwise')}.`,
          ]
    )}
    <div class="rule-split">
      <table class="rules"><thead><tr><th>${tr ? 'Ok rengi' : 'Arrow colour'}</th><th>${tr ? 'Dönüş' : 'Turn'}</th></tr></thead><tbody>${rows}</tbody></table>
      ${rose(L)}
    </div>
    ${example(
      L,
      tr
        ? '3. aşama, seri no. <b>…5</b> (tek). Ok <b>mavi</b>, <b>yukarıyı</b> gösteriyor. Mavi: ¼ tur saat yönünde → sağ. Aşama 3 ve tek: ¼ tur daha → <b>aşağı</b>.'
        : 'Stage 3, serial ends in <b>5</b> (odd). Arrow <b>blue</b>, pointing <b>up</b>. Blue: ¼ clockwise → right. Stage 3 and odd: another ¼ → <b>down</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Aşamayı imhacı sol üstteki yanan ışıklardan söyler: yanan ışık sayısı + 1.', 'Yanlış düğme hata yazdırır ve yeni bir ok gelir; aşama ilerlemez.']
        : ['The stage is the number of lit lights in the top-left + 1.', 'A wrong button causes a strike and a new arrow appears; the stage does not advance.']
    )}`;
};
