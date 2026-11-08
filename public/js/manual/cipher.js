import { ALPHABET, encode, decode, decodeLetter } from '/shared/modules/cipher.js';
import { CIPHER_WORDS } from '/shared/words.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const list = CIPHER_WORDS[CL] || CIPHER_WORDS.tr;

  // Numaralı alfabe şeridi: uzman harfleri kendisi geri sayar
  const strip = `<div class="alpha-strip">${ALPHABET.split('')
    .map((c, i) => `<span><b>${c}</b><small>${i + 1}</small></span>`)
    .join('')}</div>`;

  // Örnek: listedeki ilk kelime, kaydırma 6
  const exWord = list[0];
  const exCode = encode(exWord, 6);
  const c0 = exCode[0];
  const n0 = ALPHABET.indexOf(c0) + 1;
  const d0 = decodeLetter(c0, 6);
  const back = n0 - 6 > 0 ? `${n0 - 6}` : `${n0 - 6} + 26 = ${n0 + 20}`;

  return `
    ${ident(L, tr ? 'Ekranında anlamsız 5 harfli bir kod, altında kelime yazan dört düğme.' : 'A meaningless five-letter code and four word buttons.')}
    ${needs(L, 'cipher')}
    ${steps(
      tr
        ? [
            `${mark('Kaydırma')} = pil sayısı + 2; seri numarasında sesli harf varsa ${mark('+1 daha')}.`,
            `Koddaki her harf, gerçek harfin alfabede kaydırma kadar ${mark('ilerisidir')}. Çözmek için her harften o kadar ${mark('geri sayın')}. A’dan geri sayarken Z’ye dönün.`,
            'Çıkan kelime aşağıdaki listede olmalıdır; imhacı o kelimenin yazdığı düğmeye basar.',
          ]
        : [
            `${mark('Shift')} = battery count + 2; if the serial has a vowel, ${mark('+1 more')}.`,
            `Each code letter is the real letter moved ${mark('forward')} by the shift. To decode, ${mark('count back')} that many letters. Counting back past A wraps to Z.`,
            'The result must be one of the words below; the defuser presses that word’s button.',
          ]
    )}
    ${strip}
    <h3>${tr ? 'Olası kelimeler' : 'Possible words'}</h3>
    <div class="word-list">${list.map((w) => `<span>${w}</span>`).join('')}</div>
    ${example(
      L,
      tr
        ? `3 pil, sesli harf var → kaydırma 3 + 2 + 1 = <b>6</b>. Kod <b>${exCode}</b>: ${c0} (${n0}) − 6 = ${back} → <b>${d0}</b>, sonra diğer harfler… → <b>${decode(exCode, 6)}</b>.`
        : `3 batteries and a vowel → shift 3 + 2 + 1 = <b>6</b>. Code <b>${exCode}</b>: ${c0} (${n0}) − 6 = ${back} → <b>${d0}</b>, then the rest… → <b>${decode(exCode, 6)}</b>.`
    )}
    ${warn(
      L,
      tr
        ? [
            `Kod 26 harfli Latin alfabesindedir: Q, W, X vardır; Ç, Ğ, İ, Ö, Ş, Ü yoktur. Ekrandaki I noktasızdır.`,
            'Dört düğmeden birini seçmek için çoğu zaman ilk 2 harf yeter. Kod hiç değişmez; yanlış düğme hata yazdırır.',
          ]
        : ['The code uses the 26-letter Latin alphabet.', 'The first 2 letters usually single out one button. The code never changes; a wrong button causes a strike.']
    )}`;
};
