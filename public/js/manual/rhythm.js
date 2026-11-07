import { RHYTHM_PATTERNS } from '/shared/modules/rhythm.js';
import { swatch, ident, note } from './common.js';

const beats = (p) =>
  `<span class="beats">${p
    .split('')
    .map((b) => (b === 'S' ? '<i class="s"></i>' : '<i class="l"></i>'))
    .join('')}</span>`;

export default (L) => {
  const tr = L === 'tr';
  const rows = RHYTHM_PATTERNS.map((p, d) => `<tr><td>${beats(p)}</td><td class="digit">${d}</td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? 'Büyük bir lamba ve BAS düğmesi olan modül. Lamba bir desenle yanıp söner ve tekrar eder.'
        : 'A module with a large lamp and a PRESS button. The lamp blinks in a repeating pattern.'
    )}
    <ol>
      ${
        tr
          ? `<li>Lamba her turda <b>4 kez</b> yanar. Her yanış <b>kısa</b> ya da <b>uzun</b> olur. Uzun bir duraklamadan sonra desen baştan başlar.</li>
             <li>Desene karşılık gelen rakamı tablodan bulun.</li>
             <li>Lamba ${swatch('amber', L)} renkteyse rakama <b>pil sayısını</b> ekleyin (son rakamı alın). Lamba ${swatch('white', L)} ise rakam aynen kalır.</li>
             <li>İmhacı BAS düğmesine, sayaçtaki <b>saniyenin son rakamı</b> bu rakamken basmalıdır. Yanlış anda basmak hata yazdırır.</li>`
          : `<li>Each cycle the lamp lights up <b>4 times</b>. Each flash is either <b>short</b> or <b>long</b>. After a long pause the pattern repeats.</li>
             <li>Find the digit for the pattern in the table.</li>
             <li>If the lamp is ${swatch('amber', L)}, add the <b>battery count</b> to the digit (keep the last digit). If the lamp is ${swatch('white', L)}, the digit stays the same.</li>
             <li>The defuser must press PRESS when the <b>last digit of the seconds</b> on the timer equals that digit. Pressing at the wrong moment causes a strike.</li>`
      }
    </ol>
    <table class="rules narrow"><thead><tr><th>${tr ? 'Desen (kısa / uzun)' : 'Pattern (short / long)'}</th><th>${tr ? 'Rakam' : 'Digit'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Örnek: rakam 4 ise sayaç 02:14 ya da 02:04 gösterirken basılır.' : 'Example: if the digit is 4, press while the timer shows 02:14 or 02:04.')}`;
};
