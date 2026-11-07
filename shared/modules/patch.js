// BAĞLANTI PANOSU: Solda 4 renkli fiş, sağda 4 şekilli priz. Her fiş kılavuzdaki tabloya göre
// doğru şekle bağlanır, sonra TEST'e basılır. Bombada 3 veya daha fazla pil varsa tabloda çıkan
// üçgen ile kare yer değiştirir.

import { serialIsOdd, batteryCount } from '../edgework.js';

export const PLUG_COLORS = ['red', 'blue', 'green', 'yellow'];
export const SOCKET_SHAPES = ['circle', 'square', 'triangle', 'star'];
export const PATCH_TABLE = {
  even: { red: 'triangle', blue: 'circle', green: 'star', yellow: 'square' },
  odd: { red: 'square', blue: 'star', green: 'circle', yellow: 'triangle' },
};

export function patchTarget(color, e) {
  const shape = PATCH_TABLE[serialIsOdd(e) ? 'odd' : 'even'][color];
  if (batteryCount(e) >= 3 && (shape === 'triangle' || shape === 'square')) return shape === 'triangle' ? 'square' : 'triangle';
  return shape;
}

export default {
  type: 'patch',
  needy: false,
  generate(rng) {
    return { plugs: rng.shuffle(PLUG_COLORS), sockets: rng.shuffle(SOCKET_SHAPES), links: [null, null, null, null] };
  },
  view(s) {
    return { plugs: s.plugs.slice(), sockets: s.sockets.slice(), links: s.links.slice() };
  },
  action(s, a, ctx) {
    if (!a) return {};
    if (Array.isArray(a.connect)) {
      const [p, k] = a.connect;
      if (![p, k].every((x) => Number.isInteger(x) && x >= 0 && x < 4)) return {};
      s.links = s.links.map((v) => (v === k ? null : v));
      s.links[p] = k;
      return { changed: true };
    }
    if (Number.isInteger(a.unplug) && a.unplug >= 0 && a.unplug < 4) {
      s.links[a.unplug] = null;
      return { changed: true };
    }
    if (a.test) {
      const ok = s.plugs.every((c, p) => s.links[p] !== null && s.sockets[s.links[p]] === patchTarget(c, ctx.edgework));
      if (ok) return { solved: true, changed: true };
      s.links = [null, null, null, null];
      return { strike: true, changed: true };
    }
    return {};
  },
};
