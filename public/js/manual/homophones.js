import { HOMOPHONES } from '/shared/words.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

// Harf harf okunuş: Türkçede karışan harfleri açıkça adlandır
const SPECIAL_TR = { İ: 'noktalı İ', I: 'noktasız I', Â: 'şapkalı Â', Ş: 'Ş' };
function spell(word, L) {
  return word
    .split('')
    .map((c) => (L === 'tr' && SPECIAL_TR[c] && c !== 'Ş' ? `<mark>${SPECIAL_TR[c]}</mark>` : c))
    .join(' · ');
}

export default (L, CL) => {
  const tr = L === 'tr';
  const list = (HOMOPHONES[CL] || HOMOPHONES.tr).slice().sort((a, b) => a[0].localeCompare(b[0], CL === 'en' ? 'en' : 'tr'));
  const rows = list.map(([a, b]) => `<tr><td class="mono">${a}</td><td class="small">${spell(a, CL)}</td><td class="mono"><b>${b}</b></td></tr>`).join('');
  return `
    ${ident(
      L,
      tr ? 'Kâğıt şerit görünümlü ekranda tek kelime, altında dört kelimeli düğme, sol üstte 3 aşama ışığı.' : 'A single word on a paper-tape display, four word buttons and 3 stage lights.'
    )}
    ${needs(L, 'homophones')}
    ${steps(
      tr
        ? [
            `İmhacı ekrandaki kelimeyi ${mark('harf harf')} hecelesin; İ / I / Â gibi işaretleri ayrıca söylesin.`,
            `Kelimeyi tabloda bulun ve karşısındaki ${mark('Bas')} kelimesini aynı şekilde harf harf söyleyin.`,
            'Modül <b>3 aşamadır</b>; her aşamada yeni bir kelime gelir.',
          ]
        : [
            `Have the defuser spell the word on the screen ${mark('letter by letter')}.`,
            `Find it in the table and spell the matching ${mark('Press')} word back the same way.`,
            'The module has <b>3 stages</b>; each stage shows a new word.',
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Ekranda' : 'Display'}</th><th>${tr ? 'Harf harf' : 'Spelling'}</th><th>${tr ? 'Bas' : 'Press'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      CL === 'en'
        ? (tr ? 'Ekranda <b>RIGHT</b> → <b>FORE</b> yazan düğme (FOR ya da FOUR değil).' : 'Display <b>RIGHT</b> → press <b>FORE</b> (not FOR or FOUR).')
        : tr
          ? 'Ekranda <b>BİN</b> (noktalı İ) → <b>KÂR</b> (şapkalı Â) yazan düğme. Ekranda <b>BIN</b> (noktasız I) olsaydı → <b>HAL</b>.'
          : 'Display <b>BİN</b> (dotted İ) → press <b>KÂR</b> (with Â). If it were <b>BIN</b> (dotless I) → <b>HAL</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Ekrandaki kelime düğmelerden birinde de yazabilir; ona basmak çoğu zaman yanlıştır.', 'Yanlış düğme hata yazdırır ve yeni kelime gelir; aşama ilerlemez.']
        : ['The display word may also be on a button; pressing it is usually wrong.', 'A wrong button causes a strike and a new word appears; the stage does not advance.']
    )}`;
};
