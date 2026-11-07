// LABİRENT: Duvarlar görünmez. İmhacı 3x3 ışık desenini tarif eder, uzman doğru labirenti bulur
// ve beyaz noktayı kırmızı bayrağa yönlendirir. Duvara çarpmak hata yazdırır.

import { MAZES, MAZE_LEDS, MAZE_SIZE, DIRS, canMove, shortestPath } from '../mazes.js';

export default {
  type: 'maze',
  needy: false,
  generate(rng) {
    const maze = rng.int(0, MAZES.length - 1);
    const cell = () => ({ x: rng.int(0, MAZE_SIZE - 1), y: rng.int(0, MAZE_SIZE - 1) });
    let pos;
    let goal;
    do {
      pos = cell();
      goal = cell();
    } while (shortestPath(maze, pos, goal).length < 5);
    return { maze, pos, goal };
  },
  view(s) {
    return { leds: MAZE_LEDS[s.maze].slice(), pos: { ...s.pos }, goal: { ...s.goal } };
  },
  action(s, a) {
    const d = a && a.move;
    if (!DIRS[d]) return {};
    if (!canMove(s.maze, s.pos.x, s.pos.y, d)) return { strike: true };
    s.pos = { x: s.pos.x + DIRS[d].dx, y: s.pos.y + DIRS[d].dy };
    const solved = s.pos.x === s.goal.x && s.pos.y === s.goal.y;
    return { changed: true, solved };
  },
};
