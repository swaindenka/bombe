import { BAND_COLORS, BAND_HEX, bandsOf, circuitCurrent, totalResistance } from '/shared/modules/circuit.js';
import { circuitSvg } from '../modules/circuit.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const NAMES = {
  tr: { black: 'siyah', brown: 'kahverengi', red: 'kırmızı', orange: 'turuncu', yellow: 'sarı', green: 'yeşil', blue: 'mavi', violet: 'mor', grey: 'gri', white: 'beyaz' },
  en: { black: 'black', brown: 'brown', red: 'red', orange: 'orange', yellow: 'yellow', green: 'green', blue: 'blue', violet: 'violet', grey: 'grey', white: 'white' },
};
const res = (v) => `<span class="res-ex">${bandsOf(v).map((c) => `<i style="background:${BAND_HEX[c]}"></i>`).join('')}</span>`;
const NO_LIT = { serial: 'BC12D7', batteryHolders: [], indicators: [], portPlates: [] };
const NEUTRAL = ['grey', 'grey', 'black'];

export default (L) => {
  const tr = L === 'tr';
  const code = BAND_COLORS.map(
    (c, d) => `<tr><td><span class="band-chip" style="background:${BAND_HEX[c]}"></span>${NAMES[L][c]}</td><td class="center"><b>${d}</b></td><td class="center">${d === 0 ? '×1' : d === 1 ? '×10' : '–'}</td></tr>`
  ).join('');
  // Örnekler oyunun kendi hesabıyla
  const ex1 = { topo: 'sp', values: [40, 80, 80], volts: 6 };
  const ex2 = { topo: 'ps', values: [30, 60, 90], volts: 9 };
  const mA1 = circuitCurrent(ex1, NO_LIT);
  const mA2 = circuitCurrent(ex2, NO_LIT);
  const fig = (topo, label) => `<figure class="ci-fig">${circuitSvg({ topo, volts: '', bands: [NEUTRAL, NEUTRAL, NEUTRAL] })}<figcaption>${label}</figcaption></figure>`;
  return `
    ${ident(
      L,
      tr
        ? 'Solda gerilimi yazan bir pil, üç renk bantlı direnç (R1, R2, R3), altta <b>mA</b> yazan dört düğme.'
        : 'A battery with its voltage on the left, three colour-banded resistors (R1, R2, R3) and four <b>mA</b> buttons.'
    )}
    ${needs(L, 'circuit')}
    <p>${
      tr
        ? `Görev: devrenin ${mark('ana kolundan geçen akımı')} (miliamper) bulmak. Uzun bir hesap; adım adım ve kâğıtla gidin.`
        : `Goal: find the ${mark('current through the main line')} (milliamps). It is a long calculation; go step by step, on paper.`
    }</p>
    ${steps(
      tr
        ? [
            `<b>Değerleri okuyun.</b> Bantlar direncin ${mark('sol ucunda')} toplanmıştır ve soldan okunur: 1. bant onlar, 2. bant birler basamağı, 3. bant çarpan (siyah ×1, kahverengi ×10).`,
            `<b>Düzeni bulun.</b> İki düzen vardır (şemalar): ${mark('A')} R1 tek başına, R2 ile R3 yan yana; ${mark('B')} R1 ile R2 arka arkaya, R3 bu ikisinin altında yan yol.`,
            `<b>Toplam direnç.</b> Arka arkaya (seri): ${mark('Ra + Rb')}. Yan yana (paralel): ${mark('Ra × Rb ÷ (Ra + Rb)')}. A: R1 + (R2 ∥ R3). B: (R1 + R2) ∥ R3.`,
            `<b>Gerilim.</b> Pilin yanında yazar. Bombada ${mark('yanan gösterge varsa iki katı')} sayılır.`,
            `<b>Akım.</b> ${mark('mA = gerilim × 1000 ÷ toplam direnç')}. O sayıyı yazan düğmeye bastırın.`,
          ]
        : [
            `<b>Read the values.</b> The bands sit at the ${mark('left end')} and read from the left: band 1 tens, band 2 units, band 3 multiplier (black ×1, brown ×10).`,
            `<b>Find the layout.</b> There are two (diagrams): ${mark('A')} R1 alone, R2 and R3 side by side; ${mark('B')} R1 and R2 in a row, R3 a bypass below them.`,
            `<b>Total resistance.</b> In a row (series): ${mark('Ra + Rb')}. Side by side (parallel): ${mark('Ra × Rb ÷ (Ra + Rb)')}. A: R1 + (R2 ∥ R3). B: (R1 + R2) ∥ R3.`,
            `<b>Voltage.</b> Written by the battery. If the bomb has ${mark('a lit indicator, double it')}.`,
            `<b>Current.</b> ${mark('mA = voltage × 1000 ÷ total resistance')}. Press the button with that number.`,
          ]
    )}
    <div class="rule-split">
      <table class="rules compact"><thead><tr><th>${tr ? 'Bant rengi' : 'Band colour'}</th><th class="center">${tr ? 'Rakam' : 'Digit'}</th><th class="center">${tr ? '3. bant' : 'Band 3'}</th></tr></thead><tbody>${code}</tbody></table>
      <div class="ci-figs">${fig('sp', tr ? 'A: R1 + (R2 ∥ R3)' : 'A: R1 + (R2 ∥ R3)')}${fig('ps', tr ? 'B: (R1 + R2) ∥ R3' : 'B: (R1 + R2) ∥ R3')}</div>
    </div>
    ${example(
      L,
      tr
        ? `<b>Düzen A</b>, pil 6 V, yanan gösterge yok. R1 ${res(40)} = 40, R2 ${res(80)} = 80, R3 ${res(80)} = 80.<br>
           R2 ∥ R3 = 80 × 80 ÷ 160 = 40 → toplam 40 + 40 = <b>${totalResistance('sp', ex1.values)}</b> → 6 × 1000 ÷ 80 = <b>${mA1} mA</b>.<br>
           <b>Düzen B</b>, pil 9 V: R1 30, R2 60, R3 90 → R1 + R2 = 90 → 90 ∥ 90 = <b>${totalResistance('ps', ex2.values)}</b> → 9000 ÷ 45 = <b>${mA2} mA</b>.`
        : `<b>Layout A</b>, 6 V battery, no lit indicator. R1 ${res(40)} = 40, R2 ${res(80)} = 80, R3 ${res(80)} = 80.<br>
           R2 ∥ R3 = 80 × 80 ÷ 160 = 40 → total 40 + 40 = <b>${totalResistance('sp', ex1.values)}</b> → 6 × 1000 ÷ 80 = <b>${mA1} mA</b>.<br>
           <b>Layout B</b>, 9 V: R1 30, R2 60, R3 90 → R1 + R2 = 90 → 90 ∥ 90 = <b>${totalResistance('ps', ex2.values)}</b> → 9000 ÷ 45 = <b>${mA2} mA</b>.`
    )}
    ${warn(
      L,
      tr
        ? [
            'Bu modülde her ara sonuç <b>tam sayı</b> çıkar. Kesirli bir sayı bulduysanız bir bandı ya da düzeni yanlış okumuşsunuzdur.',
            'Kahverengi ile kırmızıyı, turuncu ile sarıyı, gri ile beyazı karıştırmayın; imhacı emin değilse tekrar baksın.',
            'Yanlış düğmeler sık yapılan hatalardan gelir: hepsini seri saymak, düzeni ters kurmak, gerilimi katlamayı unutmak.',
          ]
        : [
            'Every intermediate result here is a <b>whole number</b>. If you get a fraction, a band or the layout was misread.',
            'Don’t confuse brown and red, orange and yellow, grey and white; have the defuser look again if unsure.',
            'The wrong buttons come from common mistakes: treating everything as series, swapping the layout, forgetting to double the voltage.',
          ]
    )}`;
};
