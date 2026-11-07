import { ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? 'Alt alta üç ibreli gösterge (0–9) ve her birinin sağında I, II, III yazan bir vana olan modül.'
        : 'A module with three needle gauges (0–9) stacked vertically, each with a valve labelled I, II or III.'
    )}
    <p>${tr ? 'Modül <b>2 aşamadan</b> oluşur. Her aşamada üç göstergenin değerini öğrenin ve kuralları sırayla deneyin; ilk uyan kural geçerlidir:' : 'The module has <b>2 stages</b>. At each stage get the three gauge readings and check the rules in order; the first one that applies wins:'}</p>
    <ol>
      ${
        tr
          ? `<li>Göstergelerden <b>ikisi aynı</b> değeri gösteriyorsa, <b>farklı olanın</b> vanasını açın. Üçü de aynıysa <b>II</b> numaralı vanayı açın.</li>
             <li>Değilse üç değerin toplamı <b>15’ten büyükse</b>, en <b>yüksek</b> değerli göstergenin vanasını açın.</li>
             <li>Değilse seri numarasında <b>sesli harf</b> varsa, en <b>düşük</b> değerli göstergenin vanasını açın.</li>
             <li>Değilse değeri <b>ortada</b> olan (ne en yüksek ne en düşük) göstergenin vanasını açın.</li>`
          : `<li>If <b>two gauges</b> show the same value, open the valve of the <b>odd one out</b>. If all three match, open valve <b>II</b>.</li>
             <li>Otherwise, if the three values add up to <b>more than 15</b>, open the valve of the <b>highest</b> gauge.</li>
             <li>Otherwise, if the serial number contains a <b>vowel</b>, open the valve of the <b>lowest</b> gauge.</li>
             <li>Otherwise open the valve of the gauge with the <b>middle</b> value.</li>`
      }
    </ol>
    ${note(
      tr
        ? 'Vanalar yukarıdan aşağıya I, II, III diye numaralanır. Yanlış vana hata yazdırır ve göstergeler yeni değerler alır.'
        : 'Valves are numbered I, II, III from top to bottom. A wrong valve causes a strike and the gauges show new values.'
    )}`;
};
