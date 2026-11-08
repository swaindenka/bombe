import { PLUG_COLORS, PATCH_TABLE } from '/shared/modules/patch.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

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
  const rows = PLUG_COLORS.map((c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${shape(PATCH_TABLE.even[c], L)}</td><td>${shape(PATCH_TABLE.odd[c], L)}</td></tr>`).join('');
  return `
    ${ident(L, tr ? 'Solda dört renkli fiş, sağda şekilli dört priz, altta TEST düğmesi.' : 'Four coloured plugs on the left, four shaped sockets on the right and a TEST button.')}
    ${needs(L, 'patch')}
    ${steps(
      tr
        ? [
            'Her fiş rengi için prizin şeklini tablodan okuyun (seri no. son rakamına göre sütun).',
            `Bombada ${mark('3 veya daha fazla pil')} varsa ${mark('üçgen ile kare yer değiştirir')}: tabloda üçgen çıkan fiş kareye, kare çıkan fiş üçgene takılır.`,
            `İmhacı ${mark('önce fişe, sonra prize')} tıklayarak takar. Dördü de takılınca <b>TEST</b>’e basar.`,
          ]
        : [
            'For each plug colour read the socket shape from the table (column by the serial’s last digit).',
            `If the bomb has ${mark('3 or more batteries')}, ${mark('triangle and square swap')}: a plug that should go to a triangle goes to the square and vice versa.`,
            `The defuser clicks ${mark('the plug, then the socket')}. With all four in, press <b>TEST</b>.`,
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Fiş' : 'Plug'}</th><th>${tr ? 'Son rakam çift' : 'Last digit even'}</th><th>${tr ? 'Son rakam tek' : 'Last digit odd'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? `Seri no. <b>…4</b> (çift), <b>3 pil</b>. Kırmızı → tabloda ${shape(PATCH_TABLE.even.red, L)}, ama 3 pil var → ${shape('square', L)}. Sarı → ${shape(PATCH_TABLE.even.yellow, L)} → ${shape('triangle', L)}. Mavi ve yeşil değişmez.`
        : `Serial ends in <b>4</b> (even), <b>3 batteries</b>. Red → table says ${shape(PATCH_TABLE.even.red, L)}, but with 3 batteries → ${shape('square', L)}. Yellow → ${shape(PATCH_TABLE.even.yellow, L)} → ${shape('triangle', L)}. Blue and green stay.`
    )}
    ${warn(
      L,
      tr
        ? ['Fişlerin ve prizlerin sırası her bombada değişir; önemli olan <b>renk</b> ve <b>şekil</b>.', 'Yanlış TEST hata yazdırır ve bütün kablolar çıkar. Seçili fişe tekrar tıklamak kabloyu çıkarır.']
        : ['The order of plugs and sockets changes every bomb; only <b>colour</b> and <b>shape</b> matter.', 'A wrong TEST causes a strike and all cables pop out. Clicking a selected plug again unplugs it.']
    )}`;
};
