import { HOMOPHONES } from '/shared/words.js';
import { ident, note } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = HOMOPHONES[CL] || HOMOPHONES.tr;
  const rows = list.map(([a, b]) => `<tr><td class="mono">${a}</td><td class="mono"><b>${b}</b></td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? 'Kâğıt şerit gibi görünen bir ekranda tek kelime, altında dört kelimeli düğme ve üstte 3 aşama ışığı olan modül.'
        : 'A module with a single word on a paper-tape display, four word buttons and 3 stage lights.'
    )}
    <p>${
      tr
        ? 'Modül <b>3 aşamadan</b> oluşur. Ekrandaki kelimeyi tabloda bulun ve karşısındaki kelimenin yazdığı düğmeye bastırın.'
        : 'The module has <b>3 stages</b>. Find the word on the screen in the table and have the button with the matching word pressed.'
    }</p>
    ${note(
      tr
        ? 'Kelimeler bilerek birbirine çok benzer. Harf harf kontrol edin: noktalı <b>İ</b> ile noktasız <b>I</b>, şapkalı <b>Â</b> ile <b>A</b> farklı harflerdir.'
        : 'The words are meant to sound alike. Check them letter by letter and ask the defuser to spell everything.'
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Ekranda' : 'Display'}</th><th>${tr ? 'Bas' : 'Press'}</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="small">${tr ? 'Yanlış düğme hata yazdırır ve yeni bir kelime gelir; aşama ilerlemez.' : 'A wrong button causes a strike and a new word appears; the stage does not advance.'}</p>`;
};
