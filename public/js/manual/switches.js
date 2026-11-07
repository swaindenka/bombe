import { SWITCH_PATTERNS, SWITCH_LAMPS } from '/shared/modules/switches.js';
import { swatch, ident, note } from './common.js';

const arrows = (p) => `<span class="arrows">${p.split('').map((c) => (c === 'U' ? '↑' : '↓')).join(' ')}</span>`;

export default (L) => {
  const tr = L === 'tr';
  const rows = SWITCH_LAMPS.map(
    (c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${arrows(SWITCH_PATTERNS[c].even)}</td><td>${arrows(SWITCH_PATTERNS[c].odd)}</td></tr>`
  ).join('');
  return `
    ${ident(L, tr ? 'Üstünde renkli bir lamba, ortasında 5 şalter, altında bir ONAY düğmesi olan modül.' : 'A module with a coloured lamp on top, 5 toggle switches and a SUBMIT button.')}
    <ol>
      ${
        tr
          ? `<li>Lambanın rengini ve seri numarasının son rakamının <b>tek mi çift mi</b> olduğunu öğrenin.</li>
             <li>Tablodan hedef dizilimi bulun. ↑ = yukarı, ↓ = aşağı; <b>soldan sağa</b> okunur.</li>
             <li>Bombada <b>en az bir yanan gösterge</b> varsa dizilimi ters çevirin (sağdan sola okuyun).</li>
             <li>İmhacı şalterleri bu dizilime getirip ONAY’a basar. Şalter çevirmek hata yazdırmaz; yanlış dizilimle ONAY’a basmak yazdırır.</li>`
          : `<li>Find out the lamp colour and whether the serial’s last digit is <b>odd or even</b>.</li>
             <li>Look up the target pattern. ↑ = up, ↓ = down; read <b>left to right</b>.</li>
             <li>If the bomb has <b>at least one lit indicator</b>, reverse the pattern (read it right to left).</li>
             <li>The defuser sets the switches to the pattern and presses SUBMIT. Flipping switches is safe; submitting a wrong pattern causes a strike.</li>`
      }
    </ol>
    <table class="rules"><thead><tr><th>${tr ? 'Lamba' : 'Lamp'}</th><th>${tr ? 'Son rakam çift' : 'Last digit even'}</th><th>${tr ? 'Son rakam tek' : 'Last digit odd'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Örnek: ↑ ↓ ↑ ↑ ↓ ters çevrilince ↓ ↑ ↑ ↓ ↑ olur.' : 'Example: ↑ ↓ ↑ ↑ ↓ reversed becomes ↓ ↑ ↑ ↓ ↑.')}`;
};
