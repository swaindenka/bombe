// LABİRENT modülünün 8 sabit labirenti. Sabit tohumlarla üretilir, böylece sunucu ve kılavuz
// her zaman aynı duvarları görür. Duvar bitleri: K(N)=1, D(E)=2, G(S)=4, B(W)=8.

import { createRng } from './rng.js';

export const MAZE_SIZE = 6;
export const WALL = { N: 1, E: 2, S: 4, W: 8 };
export const DIRS = {
  N: { dx: 0, dy: -1, opp: 'S' },
  E: { dx: 1, dy: 0, opp: 'W' },
  S: { dx: 0, dy: 1, opp: 'N' },
  W: { dx: -1, dy: 0, opp: 'E' },
};

// Her labirentin tanıtıcı 3x3 ışık deseni (satır satır)
export const MAZE_LEDS = [
  [1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 0, 1, 0, 1, 0, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 1, 0, 1, 0, 1, 0],
];

const SEEDS = [1103, 2207, 3301, 4409, 5503, 6607, 7703, 8807];

function buildMaze(seed) {
  const n = MAZE_SIZE;
  const rng = createRng(seed);
  const cells = Array.from({ length: n * n }, () => 15);
  const visited = new Array(n * n).fill(false);
  const stack = [[rng.int(0, n - 1), rng.int(0, n - 1)]];
  visited[stack[0][1] * n + stack[0][0]] = true;
  const open = (x, y, d) => {
    const { dx, dy, opp } = DIRS[d];
    cells[y * n + x] &= ~WALL[d];
    cells[(y + dy) * n + (x + dx)] &= ~WALL[opp];
  };
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const options = Object.keys(DIRS).filter((d) => {
      const nx = x + DIRS[d].dx;
      const ny = y + DIRS[d].dy;
      return nx >= 0 && ny >= 0 && nx < n && ny < n && !visited[ny * n + nx];
    });
    if (!options.length) {
      stack.pop();
      continue;
    }
    const d = rng.pick(options);
    open(x, y, d);
    const nx = x + DIRS[d].dx;
    const ny = y + DIRS[d].dy;
    visited[ny * n + nx] = true;
    stack.push([nx, ny]);
  }
  // Birkaç ek geçit aç: tek yol yerine alternatif yollar olsun
  let extra = 3;
  while (extra > 0) {
    const x = rng.int(0, n - 2);
    const y = rng.int(0, n - 2);
    const d = rng.pick(['E', 'S']);
    if (cells[y * n + x] & WALL[d]) {
      open(x, y, d);
      extra--;
    }
  }
  return cells;
}

export const MAZES = SEEDS.map(buildMaze);

export function canMove(mazeIndex, x, y, d) {
  const n = MAZE_SIZE;
  const nx = x + DIRS[d].dx;
  const ny = y + DIRS[d].dy;
  if (nx < 0 || ny < 0 || nx >= n || ny >= n) return false;
  return (MAZES[mazeIndex][y * n + x] & WALL[d]) === 0;
}

/** İki hücre arası en kısa yol (yön harfleri dizisi) */
export function shortestPath(mazeIndex, from, to) {
  const n = MAZE_SIZE;
  const key = (x, y) => y * n + x;
  const prev = new Map([[key(from.x, from.y), null]]);
  const queue = [from];
  while (queue.length) {
    const c = queue.shift();
    if (c.x === to.x && c.y === to.y) break;
    for (const d of Object.keys(DIRS)) {
      if (!canMove(mazeIndex, c.x, c.y, d)) continue;
      const nx = c.x + DIRS[d].dx;
      const ny = c.y + DIRS[d].dy;
      if (prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), { x: c.x, y: c.y, d });
      queue.push({ x: nx, y: ny });
    }
  }
  const path = [];
  let k = key(to.x, to.y);
  while (prev.get(k)) {
    const p = prev.get(k);
    path.unshift(p.d);
    k = key(p.x, p.y);
  }
  return path;
}
