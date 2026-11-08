// DOĞRULAMA (sürekli ilgi ister): Devreye girince iki haneli bir sayı ve renkli bir lamba gösterir.
// Uzman lambanın rengine göre sayıyı dönüştürür; imhacı sonucun yazdığı düğmeye basar.
// Kırmızı: rakamların yerini değiştir · Mavi: seri no. son rakamını ekle · Yeşil: 99'dan çıkar ·
// Sarı: iki katını al. Sonuç her zaman iki hanedir (100 ve üstünde yalnızca son iki hane).

import { serialLastDigit } from '../edgework.js';

export const VERIFY_LAMPS = ['red', 'blue', 'green', 'yellow'];

export function verifyAnswer(n, lamp, e) {
  switch (lamp) {
    case 'red':
      return (n % 10) * 10 + Math.floor(n / 10);
    case 'blue':
      return (n + serialLastDigit(e)) % 100;
    case 'green':
      return 99 - n;
    default:
      return (n * 2) % 100;
  }
}

export const pad2 = (n) => String(n).padStart(2, '0');

export default {
  type: 'verify',
  needy: true,
  activeFor: 35000,
  generate() {
    return { active: false, number: null, lamp: null, options: [], answer: null };
  },
  activate(s, rng, e) {
    const number = rng.int(10, 99);
    const lamp = rng.pick(VERIFY_LAMPS);
    const answer = pad2(verifyAnswer(number, lamp, e));
    // Yanıltıcılar: aynı sayıya diğer renklerin kuralı uygulanmış hâlleri
    const decoys = [];
    for (const other of rng.shuffle(VERIFY_LAMPS.filter((l) => l !== lamp))) {
      const d = pad2(verifyAnswer(number, other, e));
      if (d !== answer && !decoys.includes(d)) decoys.push(d);
    }
    while (decoys.length < 2) {
      const d = pad2(rng.int(0, 99));
      if (d !== answer && !decoys.includes(d)) decoys.push(d);
    }
    Object.assign(s, { active: true, number, lamp, answer, options: rng.shuffle([answer, ...decoys.slice(0, 2)]) });
  },
  view(s) {
    return s.active ? { active: true, number: pad2(s.number), lamp: s.lamp, options: s.options.slice() } : { active: false };
  },
  action(s, a) {
    const i = a && a.press;
    if (!s.active || !Number.isInteger(i) || i < 0 || i >= s.options.length) return {};
    return s.options[i] === s.answer ? { deactivate: true } : { strike: true, deactivate: true };
  },
};
