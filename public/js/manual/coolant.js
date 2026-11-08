import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr ? '<b>Sürekli ilgi ister.</b> Üç haneli kod ekranı ve A, B, C düğmeleri.' : '<b>Needy.</b> A three-digit code display and the buttons A, B, C.'
    )}
    ${needs(L, 'coolant')}
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li>Kodda bir rakam ${mark('tekrar ediyorsa')} → <b>B</b></li>
             <li>Değilse üç rakamın toplamı ${mark('çiftse')} → <b>A</b></li>
             <li>Değilse → <b>C</b></li>`
          : `<li>A digit ${mark('repeats')} → <b>B</b></li>
             <li>Otherwise, if the digit sum is ${mark('even')} → <b>A</b></li>
             <li>Otherwise → <b>C</b></li>`
      }
    </ol>
    ${example(L, tr ? '<b>352</b> → tekrar yok, toplam 10 (çift) → <b>A</b>. <b>700</b> → 0 tekrar ediyor → <b>B</b>.' : '<b>352</b> → no repeat, sum 10 (even) → <b>A</b>. <b>700</b> → 0 repeats → <b>B</b>.')}
    ${warn(L, tr ? ['Süre biterse ya da yanlış düğmeye basılırsa hata yazılır; modül bir süre kapanıp yeniden gelir.'] : ['Running out of time or a wrong button causes a strike; the module switches off for a while, then returns.'])}`;
};
