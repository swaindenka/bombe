// KABLOLAR: 3–6 kablo. Hangi kablonun kesileceği, kablo sayısı ve EN ÜSTTEKİ kablonun rengiyle
// kılavuzdaki tablodan bulunur. Tablo hücreleri yapısal kurallardır; kılavuz metni de buradan üretilir.

import { batteryCount, serialIsOdd, serialHasVowel } from '../edgework.js';

export const WIRE_COLORS = ['red', 'blue', 'yellow', 'white', 'black'];
export const WIRE_COUNTS = [3, 4, 5, 6];

const nth = (n) => ({ t: 'nth', n });
const last = { t: 'last' };

// Satır: en üstteki kablonun rengi, sütun: kablo sayısı
export const WIRE_TABLE = {
  red: {
    3: { t: 'lastOf', c: 'blue', else: nth(2) },
    4: { t: 'odd', then: nth(3), else: nth(1) },
    5: { t: 'firstOf', c: 'black', else: last },
    6: { t: 'bat', min: 2, then: nth(4), else: nth(6) },
  },
  blue: {
    3: nth(3),
    4: { t: 'atLeast', c: 'red', n: 2, then: nth(2), else: nth(4) },
    5: { t: 'vowel', then: nth(1), else: nth(4) },
    6: { t: 'lastOf', c: 'yellow', else: nth(3) },
  },
  yellow: {
    3: { t: 'bat', min: 1, then: nth(1), else: last },
    4: { t: 'firstOf', c: 'white', else: nth(2) },
    5: { t: 'odd', then: nth(5), else: nth(2) },
    6: { t: 'atLeast', c: 'black', n: 2, then: nth(5), else: nth(1) },
  },
  white: {
    3: { t: 'vowel', then: nth(3), else: nth(2) },
    4: last,
    5: { t: 'lastOf', c: 'red', else: nth(3) },
    6: { t: 'odd', then: nth(2), else: { t: 'firstOf', c: 'blue', else: nth(6) } },
  },
  black: {
    3: { t: 'firstOf', c: 'yellow', else: nth(1) },
    4: { t: 'bat', min: 3, then: last, else: nth(2) },
    5: { t: 'atLeast', c: 'white', n: 1, then: nth(4), else: last },
    6: { t: 'vowel', then: nth(6), else: nth(3) },
  },
};

/** Kuralı uygular, kesilecek kablonun 0 tabanlı sırasını döndürür. */
export function evalWireRule(rule, wires, e) {
  const colors = wires.map((w) => w.color);
  switch (rule.t) {
    case 'nth':
      return rule.n - 1;
    case 'last':
      return wires.length - 1;
    case 'firstOf': {
      const i = colors.indexOf(rule.c);
      return i >= 0 ? i : evalWireRule(rule.else, wires, e);
    }
    case 'lastOf': {
      const i = colors.lastIndexOf(rule.c);
      return i >= 0 ? i : evalWireRule(rule.else, wires, e);
    }
    case 'atLeast': {
      const n = colors.filter((c) => c === rule.c).length;
      return evalWireRule(n >= rule.n ? rule.then : rule.else, wires, e);
    }
    case 'bat':
      return evalWireRule(batteryCount(e) >= rule.min ? rule.then : rule.else, wires, e);
    case 'odd':
      return evalWireRule(serialIsOdd(e) ? rule.then : rule.else, wires, e);
    case 'vowel':
      return evalWireRule(serialHasVowel(e) ? rule.then : rule.else, wires, e);
    default:
      throw new Error('Bilinmeyen kablo kuralı: ' + rule.t);
  }
}

export function wireSolution(wires, e) {
  return evalWireRule(WIRE_TABLE[wires[0].color][wires.length], wires, e);
}

export default {
  type: 'wires',
  needy: false,
  generate(rng, e) {
    const count = rng.int(3, 6);
    const wires = Array.from({ length: count }, () => ({ color: rng.pick(WIRE_COLORS), cut: false }));
    return { wires, solution: wireSolution(wires, e) };
  },
  view(s) {
    return { wires: s.wires.map((w) => ({ color: w.color, cut: w.cut })) };
  },
  action(s, a) {
    const i = a && a.cut;
    if (!Number.isInteger(i)) return {};
    const w = s.wires[i];
    if (!w || w.cut) return {};
    w.cut = true;
    return i === s.solution ? { solved: true, changed: true } : { strike: true, changed: true };
  },
};
