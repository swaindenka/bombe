import { coolantAnswer } from '/shared/modules/coolant.js';
import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const samples = ['121', '352', '124', '700', '369'];
  const rows = samples
    .map((c) => {
      const d = c.split('').map(Number);
      const rep = new Set(d).size < 3;
      const sum = d.reduce((a, b) => a + b, 0);
      const why = rep ? (tr ? 'tekrar eden rakam var' : 'a digit repeats') : `${tr ? 'toplam' : 'sum'} ${sum} (${sum % 2 ? (tr ? 'tek' : 'odd') : tr ? 'çift' : 'even'})`;
      return `<tr><td class="mono">${c}</td><td>${why}</td><td class="center"><b>${coolantAnswer(c)}</b></td></tr>`;
    })
    .join('');
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Üstünde küçük bir geri sayım, ortasında üç haneli kod ekranı ve A, B, C düğmeleri olan modül.'
        : '<b>Needy.</b> A module with a small countdown on top, a three-digit code display and the buttons A, B, C.'
    )}
    ${needs(L, 'coolant')}
    <p>${tr ? 'Devreye girince ekranda 3 haneli bir kod belirir.' : 'When it switches on, a three-digit code appears.'}</p>
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li>Kodda <b>aynı rakam iki ya da üç kez</b> geçiyorsa → ${mark('B')}</li>
             <li>Değilse, üç rakamın toplamı <b>çiftse</b> → ${mark('A')}</li>
             <li>Değilse (toplam tek) → ${mark('C')}</li>`
          : `<li>If <b>any digit appears twice or more</b> → ${mark('B')}</li>
             <li>Otherwise, if the digit sum is <b>even</b> → ${mark('A')}</li>
             <li>Otherwise (sum odd) → ${mark('C')}</li>`
      }
    </ol>
    ${example(L, `<table class="rules compact"><thead><tr><th>${tr ? 'Kod' : 'Code'}</th><th>${tr ? 'Neden' : 'Why'}</th><th class="center">${tr ? 'Bas' : 'Press'}</th></tr></thead><tbody>${rows}</tbody></table>`, tr ? 'Örnekler' : 'Examples')}
    ${warn(
      L,
      tr
        ? ['Süre bitmeden basılmazsa ya da yanlış düğmeye basılırsa hata yazılır.', 'Her iki durumda da modül bir süre kapanır, sonra yeniden devreye girer.']
        : ['Running out of time or pressing a wrong button causes a strike.', 'Either way the module switches off for a while and comes back later.']
    )}`;
};
