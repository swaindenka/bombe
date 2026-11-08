import { PASSPHRASES } from '/shared/words.js';
import { ident, needs, steps, warn, mark } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = (PASSPHRASES[CL] || PASSPHRASES.tr).slice().sort((a, b) => a[0].localeCompare(b[0], CL === 'en' ? 'en' : 'tr'));
  const rows = list.map(([q, a]) => `<tr><td class="mono">${q}</td><td class="mono"><b>${a}</b></td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Üstünde küçük bir geri sayım, ekranında tek bir kelime ve altında üç kelimeli düğme olan modül.'
        : '<b>Needy.</b> A module with a small countdown on top, a single word on its screen and three word buttons below.'
    )}
    ${needs(L, 'passphrase')}
    ${steps(
      tr
        ? ['Devreye girince ekranda bir <b>soru kelimesi</b> çıkar.', `Tabloda (alfabetik) bulun ve karşısındaki ${mark('cevap kelimesini')} söyleyin.`, 'İmhacı o kelimenin yazdığı düğmeye basar.']
        : ['When it switches on, a <b>challenge word</b> appears.', `Find it in the table (alphabetical) and say the ${mark('response word')}.`, 'The defuser presses the button showing that word.']
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Soru' : 'Challenge'}</th><th>${tr ? 'Cevap' : 'Response'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${warn(L, tr ? ['Süre biterse ya da yanlış cevaba basılırsa hata yazılır.'] : ['Running out of time or pressing a wrong response causes a strike.'])}`;
};
