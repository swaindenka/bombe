import { PLUG_COLORS, patchTarget } from '/shared/modules/patch.js';
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

// Dört durumun hepsi hazır: uzman şekil değiştirme kuralını kafasında uygulamak zorunda değil
const E = (odd, batteries) => ({ serial: odd ? 'AA11A1' : 'AA11A2', batteryHolders: batteries ? [2, 1] : [], indicators: [], portPlates: [] });

export default (L) => {
  const tr = L === 'tr';
  const rows = PLUG_COLORS.map(
    (c) =>
      `<tr><td class="nowrap">${swatch(c, L)}</td><td>${shape(patchTarget(c, E(false, false)), L)}</td><td>${shape(patchTarget(c, E(true, false)), L)}</td><td>${shape(patchTarget(c, E(false, true)), L)}</td><td>${shape(patchTarget(c, E(true, true)), L)}</td></tr>`
  ).join('');
  return `
    ${ident(
      L,
      tr ? 'Solda dört renkli fiş, sağda şekilli dört priz ve altta bir TEST düğmesi olan modül.' : 'A module with four coloured plugs on the left, four sockets marked with shapes on the right and a TEST button.'
    )}
    ${needs(L, 'patch')}
    ${steps(
      tr
        ? [
            `Pil sayısına göre tablonun ${mark('sol yarısını (0–2 pil)')} ya da ${mark('sağ yarısını (3+ pil)')} kullanın.`,
            'Seri no. son rakamı çift mi tek mi, ona göre sütunu seçin.',
            'Her fiş rengi için bağlanacağı <b>prizin şeklini</b> okuyun.',
            `İmhacı ${mark('önce fişe, sonra prize')} tıklayarak kabloyu takar. Dördü de takılınca <b>TEST</b>’e basar.`,
          ]
        : [
            `Use the ${mark('left half (0–2 batteries)')} or the ${mark('right half (3+ batteries)')} of the table.`,
            'Pick the column by whether the serial’s last digit is even or odd.',
            'Read the <b>socket shape</b> for each plug colour.',
            `The defuser clicks ${mark('the plug, then the socket')} to connect. When all four are in, press <b>TEST</b>.`,
          ]
    )}
    <table class="rules">
      <thead>
        <tr><th rowspan="2">${tr ? 'Fiş' : 'Plug'}</th><th colspan="2" class="center">${tr ? '0–2 pil' : '0–2 batteries'}</th><th colspan="2" class="center">${tr ? '3 veya daha fazla pil' : '3+ batteries'}</th></tr>
        <tr><th>${tr ? 'Son rakam çift' : 'Even'}</th><th>${tr ? 'Son rakam tek' : 'Odd'}</th><th>${tr ? 'Son rakam çift' : 'Even'}</th><th>${tr ? 'Son rakam tek' : 'Odd'}</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${example(
      L,
      tr
        ? `3 pil, seri no. <b>…5</b> (tek) → tablonun sağ yarısı, "tek" sütunu: kırmızı → ${shape(patchTarget('red', E(true, true)), L)}, mavi → ${shape(patchTarget('blue', E(true, true)), L)}, yeşil → ${shape(patchTarget('green', E(true, true)), L)}, sarı → ${shape(patchTarget('yellow', E(true, true)), L)}.`
        : `3 batteries, serial ends in <b>5</b> (odd) → right half, "odd" column: red → ${shape(patchTarget('red', E(true, true)), L)}, blue → ${shape(patchTarget('blue', E(true, true)), L)}, green → ${shape(patchTarget('green', E(true, true)), L)}, yellow → ${shape(patchTarget('yellow', E(true, true)), L)}.`
    )}
    ${warn(
      L,
      tr
        ? ['Fişlerin ve prizlerin sırası her bombada değişir; önemli olan <b>renk</b> ve <b>şekil</b>.', 'Seçili fişe tekrar tıklamak kabloyu çıkarır.', 'Yanlış TEST hata yazdırır ve bütün kablolar çıkar; baştan takın.']
        : ['Plug and socket order changes every bomb; only <b>colour</b> and <b>shape</b> matter.', 'Clicking the selected plug again unplugs it.', 'A wrong TEST causes a strike and all cables pop out; plug them again.']
    )}`;
};
