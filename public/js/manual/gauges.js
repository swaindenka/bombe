import { gaugeAnswer } from '/shared/modules/gauges.js';
import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

const VOWEL = { serial: 'AB12C7', batteryHolders: [], indicators: [], portPlates: [] };
const NO_VOWEL = { serial: 'BC12D7', batteryHolders: [], indicators: [], portPlates: [] };
const VALVE = ['I', 'II', 'III'];

export default (L) => {
  const tr = L === 'tr';
  // Örnek tablo doğrudan oyun mantığından hesaplanır
  const cases = [
    [[8, 2, 2], null, tr ? '1: iki tane 2 var, farklı olan 8' : '1: two 2s, the odd one out is 8'],
    [[2, 8, 2], null, tr ? '1: farklı olan 8 ortada' : '1: the odd one out (8) is in the middle'],
    [[5, 5, 5], null, tr ? '1: üçü de aynı → II' : '1: all three equal → II'],
    [[9, 3, 6], null, tr ? '2: toplam 18 > 15 → en yüksek (9)' : '2: sum 18 > 15 → highest (9)'],
    [[1, 4, 2], true, tr ? '3: sesli harf var → en düşük (1)' : '3: vowel → lowest (1)'],
    [[1, 4, 2], false, tr ? '4: ortanca DEĞER 2 (konum değil!)' : '4: middle VALUE is 2 (not position!)'],
  ];
  const rows = cases
    .map(([v, vowel, why]) => {
      const ans = VALVE[gaugeAnswer(v, vowel === false ? NO_VOWEL : VOWEL)];
      const cond = vowel === null ? (tr ? 'fark etmez' : 'any') : vowel ? (tr ? 'sesli harf var' : 'vowel') : tr ? 'sesli harf yok' : 'no vowel';
      return `<tr><td class="mono">${v.join(' – ')}</td><td>${cond}</td><td>${why}</td><td class="center"><b>${ans}</b></td></tr>`;
    })
    .join('');
  return `
    ${ident(
      L,
      tr
        ? 'Alt alta üç ibreli gösterge (0–9) ve her birinin sağında I, II, III yazan kırmızı bir vana olan modül.'
        : 'A module with three needle gauges (0–9) stacked vertically, each with a red valve labelled I, II or III.'
    )}
    ${needs(L, 'gauges')}
    <p>${
      tr
        ? `Modül <b>2 aşamadır</b>. Göstergeler ve vanalar ${mark('yukarıdan aşağıya I, II, III')} diye numaralanır. İmhacıdan üç değeri sırayla isteyin (ör. "8, 2, 2").`
        : `The module has <b>2 stages</b>. Gauges and valves are numbered ${mark('I, II, III from top to bottom')}. Ask for the three readings in order (e.g. "8, 2, 2").`
    }</p>
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li><b>İki gösterge aynı değeri</b> gösteriyorsa → ${mark('farklı olan')} göstergenin vanası. <b>Üçü de aynıysa</b> → <b>II</b>.</li>
             <li>Değilse, üç değerin <b>toplamı 15’ten büyükse</b> → ${mark('en yüksek')} değerli göstergenin vanası.</li>
             <li>Değilse, seri numarasında <b>sesli harf varsa</b> → ${mark('en düşük')} değerli göstergenin vanası.</li>
             <li>Değilse → değeri ${mark('ortanca olan')} göstergenin vanası: ne en büyük ne en küçük olan <b>değer</b>. Bu, II numaralı (ortadaki) vana demek <b>değildir</b>.</li>`
          : `<li>If <b>two gauges show the same value</b> → the valve of the ${mark('odd one out')}. If <b>all three match</b> → <b>II</b>.</li>
             <li>Otherwise, if the values <b>add up to more than 15</b> → the valve of the ${mark('highest')} gauge.</li>
             <li>Otherwise, if the serial has a <b>vowel</b> → the valve of the ${mark('lowest')} gauge.</li>
             <li>Otherwise → the gauge with the ${mark('middle value')}: neither the largest nor the smallest <b>value</b>. This does <b>not</b> mean valve II.</li>`
      }
    </ol>
    ${example(
      L,
      `<table class="rules compact"><thead><tr><th>${tr ? 'Göstergeler I–II–III' : 'Gauges I–II–III'}</th><th>${tr ? 'Seri no.' : 'Serial'}</th><th>${tr ? 'Uyan kural' : 'Rule that applies'}</th><th class="center">${tr ? 'Vana' : 'Valve'}</th></tr></thead><tbody>${rows}</tbody></table>`,
      tr ? 'Örnekler' : 'Examples'
    )}
    ${warn(
      L,
      tr
        ? ['İki gösterge aynıysa toplamaya ve sesli harfe <b>hiç bakmayın</b>.', 'Yanlış vana hata yazdırır ve göstergeler yeni değerler alır.']
        : ['If two gauges match, <b>don’t</b> look at the sum or the vowel at all.', 'A wrong valve causes a strike and the gauges show new values.']
    )}`;
};
