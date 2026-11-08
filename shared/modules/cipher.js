// ŞİFRE ÇÖZÜCÜ: Ekranda harfleri kaydırılmış 5 harfli bir kod var. Uzman kaydırma miktarını
// kasadan hesaplar, kodu çözer; imhacı çözülen kelimenin yazdığı düğmeye basar.
// Kaydırma = pil sayısı + 2 (seri numarasında sesli harf varsa +1). Harfler İLERİ kaydırılmıştır.

import { batteryCount, serialHasVowel } from '../edgework.js';
import { CIPHER_WORDS } from '../words.js';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const cipherShift = (e) => batteryCount(e) + 2 + (serialHasVowel(e) ? 1 : 0);

// Olası kaydırmalar: pil 0–4, +2, sesli harf varsa +1 → 2..7 (kılavuz tablosu bunları kapsar)
export const MAX_BATTERIES = 4;
export const CIPHER_SHIFTS = [2, 3, 4, 5, 6, 7];

const shiftLetter = (c, k) => ALPHABET[(((ALPHABET.indexOf(c) + k) % 26) + 26) % 26];

/** Gerçek harfi k kadar İLERİ kaydırır (bombada görünen kod) */
export const encode = (word, k) =>
  word
    .split('')
    .map((c) => shiftLetter(c, k))
    .join('');

/** Kod harfini k kadar GERİ kaydırır (kılavuzdaki çözme tablosu bunu kullanır) */
export const decodeLetter = (c, k) => shiftLetter(c, -k);
export const decode = (code, k) =>
  code
    .split('')
    .map((c) => decodeLetter(c, k))
    .join('');

export default {
  type: 'cipher',
  needy: false,
  generate(rng, e, lang) {
    const list = CIPHER_WORDS[lang] || CIPHER_WORDS.tr;
    const word = rng.pick(list);
    const options = rng.shuffle([word, ...rng.sample(list.filter((w) => w !== word), 3)]);
    return { word, code: encode(word, cipherShift(e)), options };
  },
  view(s) {
    return { code: s.code, options: s.options.slice() };
  },
  action(s, a) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i > 3) return {};
    return s.options[i] === s.word ? { solved: true } : { strike: true };
  },
};
