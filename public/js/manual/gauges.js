import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr ? 'Alt alta üç ibreli gösterge (0–9); her birinin yanında I, II, III yazan kırmızı vana.' : 'Three needle gauges (0–9) stacked vertically, each with a red valve labelled I, II, III.'
    )}
    ${needs(L, 'gauges')}
    <p>${
      tr
        ? `Modül <b>2 aşamadır</b>. Göstergeler ${mark('yukarıdan aşağıya I, II, III')}. Üç değeri sırayla isteyin; doğru vanayı açtırın.`
        : `The module has <b>2 stages</b>. Gauges are ${mark('I, II, III from top to bottom')}. Ask for the three readings in order and have the right valve opened.`
    }</p>
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li>İki gösterge aynıysa → ${mark('farklı olanın')} vanası. Üçü de aynıysa → <b>II</b>.</li>
             <li>Toplam ${mark('15’ten büyükse')} → en yüksek değerli göstergenin vanası.</li>
             <li>Seri numarasında ${mark('sesli harf varsa')} → en düşük değerli göstergenin vanası.</li>
             <li>Hiçbiri değilse → değeri ${mark('ortanca')} olan göstergenin vanası (ortadaki vana değil, ortanca <b>değer</b>).</li>`
          : `<li>Two gauges equal → the valve of the ${mark('odd one out')}. All three equal → <b>II</b>.</li>
             <li>Sum ${mark('greater than 15')} → the valve of the highest gauge.</li>
             <li>Serial ${mark('has a vowel')} → the valve of the lowest gauge.</li>
             <li>None of these → the gauge with the ${mark('middle value')} (not the middle valve — the middle <b>value</b>).</li>`
      }
    </ol>
    ${example(
      L,
      tr
        ? '<b>8 – 2 – 2</b> → iki tane 2 var, farklı olan 8 → <b>I</b>.<br><b>1 – 4 – 2</b>, sesli harf yok → toplam 7, kural 4: ortanca değer 2 → <b>III</b>.'
        : '<b>8 – 2 – 2</b> → two 2s, the odd one out is 8 → <b>I</b>.<br><b>1 – 4 – 2</b>, no vowel → sum 7, rule 4: middle value is 2 → <b>III</b>.'
    )}
    ${warn(L, tr ? ['Yanlış vana hata yazdırır ve göstergeler yeni değerler alır.'] : ['A wrong valve causes a strike and the gauges show new values.'])}`;
};
