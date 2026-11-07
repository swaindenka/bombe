// ŞALTERLER: 5 şalter ve bir lamba. Lamba rengi + seri numarasının son rakamı (tek/çift)
// hedef dizilimi verir. Bombada en az bir YANAN gösterge varsa dizilim sağdan sola okunur.

import { serialIsOdd, litIndicatorCount } from '../edgework.js';

export const SWITCH_LAMPS = ['red', 'green', 'blue', 'yellow'];

// 'U' = yukarı, 'D' = aşağı; soldan sağa
export const SWITCH_PATTERNS = {
  red: { even: 'UDUUD', odd: 'DDUDU' },
  green: { even: 'UUDDU', odd: 'DUDUU' },
  blue: { even: 'DUUDD', odd: 'UDDUD' },
  yellow: { even: 'UDDDU', odd: 'DUUUD' },
};

export function switchTarget(lamp, e) {
  let p = SWITCH_PATTERNS[lamp][serialIsOdd(e) ? 'odd' : 'even'];
  if (litIndicatorCount(e) > 0) p = p.split('').reverse().join('');
  return p.split('').map((c) => c === 'U');
}

export default {
  type: 'switches',
  needy: false,
  generate(rng, e) {
    const lamp = rng.pick(SWITCH_LAMPS);
    const target = switchTarget(lamp, e);
    let positions;
    do {
      positions = Array.from({ length: 5 }, () => rng.chance(0.5));
    } while (positions.every((p, i) => p === target[i]));
    return { lamp, target, positions };
  },
  view(s) {
    return { lamp: s.lamp, positions: s.positions.slice() };
  },
  action(s, a) {
    if (!a) return {};
    if (Number.isInteger(a.toggle) && a.toggle >= 0 && a.toggle < 5) {
      s.positions[a.toggle] = !s.positions[a.toggle];
      return { changed: true };
    }
    if (a.submit) {
      const ok = s.positions.every((p, i) => p === s.target[i]);
      return ok ? { solved: true, changed: true } : { strike: true };
    }
    return {};
  },
};
