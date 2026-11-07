import { PASSPHRASES } from '/shared/words.js';
import { ident, note } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = PASSPHRASES[CL] || PASSPHRASES.tr;
  const rows = list.map(([q, a]) => `<tr><td>${q}</td><td><b>${a}</b></td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Üstünde küçük bir geri sayım, ekranında tek bir kelime ve altında üç kelimeli düğme olan modül.'
        : '<b>Needy.</b> A module with a small countdown on top, a single word on its screen and three word buttons below.'
    )}
    <p>${
      tr
        ? 'Modül devreye girince ekranda bir <b>soru kelimesi</b> çıkar. Tabloda o kelimeyi bulun ve karşısındaki <b>cevap kelimesinin</b> yazdığı düğmeye bastırın.'
        : 'When the module switches on, a <b>challenge word</b> appears. Find it in the table and have the button showing the matching <b>response word</b> pressed.'
    }</p>
    <table class="rules narrow"><thead><tr><th>${tr ? 'Soru' : 'Challenge'}</th><th>${tr ? 'Cevap' : 'Response'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Süre biterse ya da yanlış cevaba basılırsa hata yazılır.' : 'Running out of time or pressing a wrong response causes a strike.')}`;
};
