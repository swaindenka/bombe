import { PATCH_TABLE, PLUG_COLORS } from '/shared/modules/patch.js';
import { swatch, ident, note } from './common.js';

const ICON = {
  circle: '<circle cx="12" cy="12" r="8"/>',
  square: '<rect x="4.5" y="4.5" width="15" height="15"/>',
  triangle: '<path d="M12 3.5 L21 20 H3 Z"/>',
  star: '<path d="M12 2.5 l2.8 6.2 6.7.6-5.1 4.4 1.6 6.6L12 16.8l-6 3.5 1.6-6.6L2.5 9.3l6.7-.6z"/>',
};
const NAMES = {
  tr: { circle: 'daire', square: 'kare', triangle: 'üçgen', star: 'yıldız' },
  en: { circle: 'circle', square: 'square', triangle: 'triangle', star: 'star' },
};
const shape = (s, L) => `<span class="shape"><svg viewBox="0 0 24 24">${ICON[s]}</svg>${NAMES[L][s]}</span>`;

export default (L) => {
  const tr = L === 'tr';
  const rows = PLUG_COLORS.map(
    (c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${shape(PATCH_TABLE.even[c], L)}</td><td>${shape(PATCH_TABLE.odd[c], L)}</td></tr>`
  ).join('');
  return `
    ${ident(
      L,
      tr
        ? 'Solda dört renkli fiş, sağda şekilli dört priz ve altta bir TEST düğmesi olan modül.'
        : 'A module with four coloured plugs on the left, four sockets marked with shapes on the right and a TEST button.'
    )}
    <ol>
      ${
        tr
          ? `<li>Her fişin rengi için tablodan bağlanacağı <b>prizin şeklini</b> bulun (seri numarasının son rakamına göre).</li>
             <li>Bombada <b>3 veya daha fazla pil</b> varsa, tablodan çıkan <b>üçgen</b> ile <b>kare</b> yer değiştirir.</li>
             <li>İmhacı fişe tıklayıp sonra prize tıklayarak kabloyu takar. Seçili fişe tekrar tıklamak kabloyu çıkarır.</li>
             <li>Dört kablo da doğru takılınca <b>TEST</b>’e basılır. Yanlışsa hata yazılır ve bütün kablolar çıkar.</li>`
          : `<li>For each plug colour, find the <b>socket shape</b> it goes into (depends on the serial’s last digit).</li>
             <li>If the bomb has <b>3 or more batteries</b>, swap <b>triangle</b> and <b>square</b> in the result.</li>
             <li>The defuser clicks a plug, then a socket, to connect a cable. Clicking the selected plug again unplugs it.</li>
             <li>When all four cables are in, press <b>TEST</b>. If anything is wrong, a strike is recorded and all cables pop out.</li>`
      }
    </ol>
    <table class="rules"><thead><tr><th>${tr ? 'Fiş' : 'Plug'}</th><th>${tr ? 'Son rakam çift' : 'Last digit even'}</th><th>${tr ? 'Son rakam tek' : 'Last digit odd'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Fişlerin ve prizlerin sırası her bombada farklıdır; önemli olan renk ve şekildir.' : 'Plug and socket order changes on every bomb; only colours and shapes matter.')}`;
};
