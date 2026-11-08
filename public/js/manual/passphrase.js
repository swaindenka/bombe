import { PASSPHRASES } from '/shared/words.js';
import { ident, needs, warn, mark } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = (PASSPHRASES[CL] || PASSPHRASES.tr).slice().sort((a, b) => a[0].localeCompare(b[0], CL === 'en' ? 'en' : 'tr'));
  const rows = list.map(([q, a]) => `<tr><td class="mono">${q}</td><td class="mono"><b>${a}</b></td></tr>`).join('');
  return `
    ${ident(
      L,
      tr ? '<b>Sürekli ilgi ister.</b> Ekranında tek bir kelime, altında üç kelimeli düğme.' : '<b>Needy.</b> A single word on the screen and three word buttons.'
    )}
    ${needs(L, 'passphrase')}
    <p>${tr ? `Devreye girince bir <b>soru kelimesi</b> çıkar. Tabloda bulun ve karşısındaki ${mark('cevabı')} söyleyin.` : `When it switches on, a <b>challenge</b> appears. Find it in the table and say the ${mark('response')}.`}</p>
    <table class="rules narrow"><thead><tr><th>${tr ? 'Soru' : 'Challenge'}</th><th>${tr ? 'Cevap' : 'Response'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${warn(L, tr ? ['Süre biterse ya da yanlış cevaba basılırsa hata yazılır.'] : ['Running out of time or a wrong response causes a strike.'])}`;
};
