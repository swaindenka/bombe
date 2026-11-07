// Testler için: sunucudaki gizli modül durumundan bir sonraki doğru hamleyi üretir.

import { shortestPath } from '../shared/mazes.js';
import { stroopAnswer } from '../shared/modules/stroop.js';
import { coolantAnswer } from '../shared/modules/coolant.js';

export function nextAction(type, s, e) {
  switch (type) {
    case 'wires':
      return { cut: s.solution };
    case 'switches': {
      const i = s.positions.findIndex((p, k) => p !== s.target[k]);
      return i >= 0 ? { toggle: i } : { submit: true };
    }
    case 'glyphs':
      return { press: s.order[s.pressed.length] };
    case 'maze':
      return { move: shortestPath(s.maze, s.pos, s.goal)[0] };
    case 'safe': {
      const target = s.combo[s.entered.length];
      return s.dial === target ? { enter: true } : { rotate: 1 };
    }
    case 'stroop':
      return { press: stroopAnswer(s.stage, s.current, e) };
    case 'tiles':
      return { press: s.tiles.findIndex((t, k) => t === s.target && !s.pressed.includes(k)) };
    case 'rhythm':
      return { press: true };
    case 'coolant':
      return { press: coolantAnswer(s.code) };
    case 'passphrase':
      return { press: s.options.indexOf(s.answer) };
    default:
      throw new Error('solver yok: ' + type);
  }
}
