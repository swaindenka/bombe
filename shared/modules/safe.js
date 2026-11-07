// KASA: Ekranda iki basamaklı bir sayı ve renkli bir lamba var. Uzman üç haneli şifreyi
// kasanın bilgilerinden hesaplar; imhacı kadranı çevirip her haneyi GİR ile kaydeder.

import { batteryCount, serialLastDigit, portCount, litIndicatorCount } from '../edgework.js';

export const SAFE_LAMPS = ['red', 'blue', 'green', 'yellow'];

export function safeCombination(number, lamp, e) {
  const tens = Math.floor(number / 10);
  const units = number % 10;
  const a = (tens + batteryCount(e)) % 10;
  const b = (units + serialLastDigit(e)) % 10;
  let c;
  switch (lamp) {
    case 'red':
      c = (a + b) % 10;
      break;
    case 'blue':
      c = Math.abs(a - b);
      break;
    case 'green':
      c = portCount(e) % 10;
      break;
    default:
      c = (litIndicatorCount(e) * 3) % 10;
  }
  return [a, b, c];
}

export default {
  type: 'safe',
  needy: false,
  generate(rng, e) {
    const number = rng.int(10, 99);
    const lamp = rng.pick(SAFE_LAMPS);
    return { number, lamp, combo: safeCombination(number, lamp, e), dial: rng.int(0, 9), entered: [] };
  },
  view(s) {
    return { number: s.number, lamp: s.lamp, dial: s.dial, entered: s.entered.length };
  },
  action(s, a) {
    if (!a) return {};
    if (a.rotate === 1 || a.rotate === -1) {
      s.dial = (s.dial + a.rotate + 10) % 10;
      return { changed: true };
    }
    if (a.enter) {
      s.entered.push(s.dial);
      if (s.entered.length < 3) return { changed: true };
      const ok = s.entered.every((d, i) => d === s.combo[i]);
      s.entered = [];
      return ok ? { solved: true, changed: true } : { strike: true, changed: true };
    }
    return {};
  },
};
