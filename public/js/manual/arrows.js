import { swatch, ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const rows = [
    ['red', tr ? 'Okun <b>tersi</b> yöndeki düğme' : 'The button <b>opposite</b> to the arrow'],
    ['blue', tr ? 'Okun <b>saat yönünde</b> 90° çevrilmiş hâli' : 'The arrow turned 90° <b>clockwise</b>'],
    ['green', tr ? 'Okun <b>gösterdiği</b> yöndeki düğme' : 'The button the arrow <b>points to</b>'],
    ['yellow', tr ? 'Okun <b>saat yönünün tersine</b> 90° çevrilmiş hâli' : 'The arrow turned 90° <b>counter-clockwise</b>'],
  ]
    .map(([c, t]) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${t}</td></tr>`)
    .join('');
  return `
    ${ident(
      L,
      tr
        ? 'Ortasında renkli büyük bir ok, dört yanında yön düğmeleri ve sol üstte 4 aşama ışığı olan modül.'
        : 'A module with a large coloured arrow in the middle, direction buttons on all four sides and 4 stage lights in the top-left.'
    )}
    <p>${tr ? 'Modül <b>4 aşamadan</b> oluşur. Her aşamada okun rengine göre basılacak yönü bulun:' : 'The module has <b>4 stages</b>. At each stage find the direction to press from the arrow’s colour:'}</p>
    <table class="rules"><thead><tr><th>${tr ? 'Ok rengi' : 'Arrow colour'}</th><th>${tr ? 'Basılacak düğme' : 'Button to press'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(
      tr
        ? '<b>3. ve 4. aşamada</b> seri numarasının son rakamı <b>tekse</b>, bulduğunuz yönü bir kez daha saat yönünde 90° çevirin.'
        : 'In <b>stages 3 and 4</b>, if the serial’s last digit is <b>odd</b>, turn the result another 90° clockwise.'
    )}
    <p class="small">${
      tr
        ? 'Saat yönü: yukarı → sağ → aşağı → sol → yukarı. Yanlış düğme hata yazdırır ve yeni bir ok gelir; aşama ilerlemez.'
        : 'Clockwise: up → right → down → left → up. A wrong button causes a strike and a new arrow appears; the stage does not advance.'
    }</p>`;
};
