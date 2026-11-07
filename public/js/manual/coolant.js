import { ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Üstünde küçük bir geri sayım, ortasında üç haneli kod ekranı ve A, B, C düğmeleri olan modül.'
        : '<b>Needy.</b> A module with a small countdown on top, a three-digit code display and the buttons A, B, C.'
    )}
    <p>${tr ? 'Modül devreye girdiğinde ekranda bir kod belirir. Doğru düğme:' : 'When the module switches on, a code appears on the screen. The correct button is:'}</p>
    <ol>
      ${
        tr
          ? `<li>Kodda <b>aynı rakam birden fazla</b> geçiyorsa → <b>B</b>.</li>
             <li>Değilse rakamların toplamı <b>çiftse</b> → <b>A</b>.</li>
             <li>Değilse → <b>C</b>.</li>`
          : `<li>If any digit appears <b>more than once</b> in the code → <b>B</b>.</li>
             <li>Otherwise, if the sum of the digits is <b>even</b> → <b>A</b>.</li>
             <li>Otherwise → <b>C</b>.</li>`
      }
    </ol>
    ${note(
      tr
        ? 'Geri sayım bitmeden doğru düğmeye basılmazsa ya da yanlış düğmeye basılırsa hata yazılır. Her iki durumda da modül bir süre kapanır ve sonra yeniden devreye girer.'
        : 'If the right button isn’t pressed before the countdown ends, or a wrong button is pressed, a strike is recorded. Either way the module switches off for a while and comes back later.'
    )}
    <p class="small">${tr ? 'Örnek: 121 → B · 352 → A (toplam 10) · 124 → C (toplam 7)' : 'Examples: 121 → B · 352 → A (sum 10) · 124 → C (sum 7)'}</p>`;
};
