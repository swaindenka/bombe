import { ALPHABET, CIPHER_SHIFTS, MAX_BATTERIES, decodeLetter, decode, encode } from '/shared/modules/cipher.js';
import { CIPHER_WORDS } from '/shared/words.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = CIPHER_WORDS[CL] || CIPHER_WORDS.tr;

  // 1) Kaydırmayı hesaplamak yerine tablodan oku
  const batteries = Array.from({ length: MAX_BATTERIES + 1 }, (_, b) => b);
  const shiftTable = `
    <table class="rules compact shift-table">
      <thead><tr><th>${tr ? 'Pil sayısı →' : 'Batteries →'}</th>${batteries.map((b) => `<th class="center">${b}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><th>${tr ? 'Seri no.’da sesli harf YOK' : 'NO vowel in serial'}</th>${batteries.map((b) => `<td class="center"><b>${b + 2}</b></td>`).join('')}</tr>
        <tr><th>${tr ? 'Seri no.’da sesli harf VAR' : 'Vowel in serial'}</th>${batteries.map((b) => `<td class="center"><b>${b + 3}</b></td>`).join('')}</tr>
      </tbody>
    </table>`;

  // 2) Çözme tablosu: oyunun kendi çözme fonksiyonundan üretilir
  const head = `<tr><th>${tr ? 'Kod harfi →' : 'Code letter →'}</th>${ALPHABET.split('').map((c) => `<th class="center">${c}</th>`).join('')}</tr>`;
  const body = CIPHER_SHIFTS.map(
    (k) => `<tr data-shift="${k}"><th>${tr ? `Kaydırma ${k}` : `Shift ${k}`}</th>${ALPHABET.split('').map((c) => `<td class="center" data-code="${c}">${decodeLetter(c, k)}</td>`).join('')}</tr>`
  ).join('');

  // Örnek: listedeki ilk kelime, kaydırma 6
  const exWord = list[0];
  const exCode = encode(exWord, 6);
  const exSteps = exCode
    .split('')
    .map((c) => `${c}→<b>${decodeLetter(c, 6)}</b>`)
    .join(', ');

  return `
    ${ident(
      L,
      tr ? 'Ekranında anlamsız görünen 5 harfli bir kod ve altında kelime yazan dört düğme olan modül.' : 'A module showing a meaningless five-letter code, with four word buttons below it.'
    )}
    ${needs(L, 'cipher')}
    ${steps(
      tr
        ? [
            `${mark('Kaydırmayı')} aşağıdaki küçük tablodan okuyun (pil sayısı + sesli harf var mı).`,
            `İmhacıdan koddaki 5 harfi ${mark('tek tek')} isteyin ve not edin.`,
            `Büyük tabloda kendi kaydırmanızın ${mark('satırına')} gidin. Her kod harfinin sütununda, o satırdaki harf ${mark('gerçek harftir')}.`,
            `Çıkan kelime aşağıdaki ${mark('olası kelimeler')} listesinde mi? <b>Evet</b> → imhacı o kelimenin yazdığı düğmeye basar. <b>Hayır</b> → basmayın, önce kaydırmayı ve harfleri kontrol edin.`,
          ]
        : [
            `Read the ${mark('shift')} from the small table below (battery count + vowel or not).`,
            `Have the defuser read the 5 code letters ${mark('one by one')} and write them down.`,
            `In the big table go to your shift’s ${mark('row')}. In each code letter’s column, the letter in that row is the ${mark('real letter')}.`,
            `Is the result in the ${mark('possible words')} list below? <b>Yes</b> → the defuser presses that word’s button. <b>No</b> → don’t press; recheck the shift and the letters.`,
          ]
    )}
    <h3>1 · ${tr ? 'Kaydırma' : 'Shift'}</h3>
    ${shiftTable}
    <h3>2 · ${tr ? 'Çözme tablosu' : 'Decoding table'}</h3>
    <div class="table-scroll"><table class="rules cipher-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>
    <h3>3 · ${tr ? 'Olası kelimeler' : 'Possible words'}</h3>
    <div class="word-list">${list.map((w) => `<span>${w}</span>`).join('')}</div>
    ${example(
      L,
      tr
        ? `3 pil, seri no.’da sesli harf var → kaydırma tablosundan <b>6</b>. Kod <b>${exCode}</b> → "Kaydırma 6" satırında: ${exSteps} → <b>${decode(exCode, 6)}</b>. Listede var → <b>${exWord}</b> düğmesine bas.`
        : `3 batteries, vowel in the serial → shift <b>6</b> from the small table. Code <b>${exCode}</b> → in the "Shift 6" row: ${exSteps} → <b>${decode(exCode, 6)}</b>. It is in the list → press <b>${exWord}</b>.`
    )}
    ${warn(
      L,
      tr
        ? [
            `Kod 26 harfli <b>Latin alfabesiyle</b> yazılır. Ekrandaki <b>I</b> noktasız Latin I’dır (İ değil). Türkçede olmayan harfler: ${mark('Q = "ku"')}, ${mark('W = "çift ve"')}, ${mark('X = "iks"')}.`,
            'Çoğu zaman ilk 2–3 harf düğmeyi bulmaya yeter; ama emin değilseniz kelimenin tamamını çözün.',
            'Kod hiçbir zaman değişmez; yanlış düğme hata yazdırır, kod aynı kalır.',
          ]
        : [
            'The code uses the 26-letter <b>Latin alphabet</b>.',
            'The first 2–3 decoded letters are usually enough to pick the button; decode the whole word if unsure.',
            'The code never changes; a wrong button causes a strike and the code stays the same.',
          ]
    )}`;
};
