// RİTİM: Lamba 4 vuruşluk bir desenle (kısa/uzun) yanıp söner ve tekrarlar. Desen bir rakam verir.
// Lamba TURUNCUYSA rakama pil sayısı eklenir (mod 10). Düğmeye, sayaçtaki saniyenin son hanesi
// bu rakamken basılmalıdır.

import { batteryCount } from '../edgework.js';

// S = kısa, L = uzun. Dizi sırası = rakam.
export const RHYTHM_PATTERNS = ['SLLS', 'LSSL', 'SSLS', 'LLSL', 'SLSS', 'LSLL', 'SSSL', 'LLLS', 'SLSL', 'LSLS'];
export const RHYTHM_LAMPS = ['white', 'amber'];

export const RHYTHM_TIMING = { short: 220, long: 700, gap: 320, pause: 1700 };

export function rhythmDigit(digit, lamp, e) {
  return lamp === 'amber' ? (digit + batteryCount(e)) % 10 : digit;
}

/** Sayaçta gösterilen saniyenin son hanesi (istemci ile aynı formül) */
export const timerLastDigit = (remainingMs) => Math.floor(Math.max(0, remainingMs) / 1000) % 10;

export default {
  type: 'rhythm',
  needy: false,
  generate(rng, e) {
    const digit = rng.int(0, 9);
    const lamp = rng.pick(RHYTHM_LAMPS);
    return { digit, lamp, answer: rhythmDigit(digit, lamp, e) };
  },
  view(s) {
    return { pattern: RHYTHM_PATTERNS[s.digit], lamp: s.lamp };
  },
  action(s, a, ctx) {
    if (!a || !a.press) return {};
    return timerLastDigit(ctx.displayedRemainingMs) === s.answer ? { solved: true } : { strike: true };
  },
};
