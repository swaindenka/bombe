// İKİZ LABİRENT (uzman kademesi): Yan yana iki 4×4 labirent, her birinde beyaz bir nokta ve kırmızı bir hedef.
// Duvarlar görünmez; her ızgaranın üstündeki Roma rakamı kılavuzdaki labirenti gösterir. Dört ok düğmesi İKİ
// noktayı BİRDEN hareket ettirir. Bombada yanan gösterge varsa sağdaki nokta sağ–sol ters hareket eder.
// Duvara ya da kenara doğru giden nokta yerinde kalır (hata yazmaz). İki nokta aynı anda hedefindeyken modül
// çözülür. Hamle sınırı aşılırsa hata yazılır ve noktalar başa döner.

import { createRng } from '../rng.js';
import { litIndicatorCount } from '../edgework.js';

export const TWIN_SIZE = 4;
export const TWIN_IDS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const WALL = { N: 1, E: 2, S: 4, W: 8 };
export const TWIN_DIRS = {
  N: { dx: 0, dy: -1, opp: 'S' },
  E: { dx: 1, dy: 0, opp: 'W' },
  S: { dx: 0, dy: 1, opp: 'N' },
  W: { dx: -1, dy: 0, opp: 'E' },
};
export const TWIN_WALL = WALL;
const SEEDS = [7121, 8233, 9349, 10457, 11593, 12619];
export const TWIN_SLACK = 4; // en kısa çözümün üstüne tanınan fazladan hamle

function build(seed) {
  const n = TWIN_SIZE;
  const rng = createRng(seed);
  const cells = Array(n * n).fill(15);
  const seen = Array(n * n).fill(false);
  const open = (x, y, d) => {
    const { dx, dy, opp } = TWIN_DIRS[d];
    cells[y * n + x] &= ~WALL[d];
    cells[(y + dy) * n + x + dx] &= ~WALL[opp];
  };
  const stack = [[0, 0]];
  seen[0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = Object.keys(TWIN_DIRS).filter((d) => {
      const nx = x + TWIN_DIRS[d].dx;
      const ny = y + TWIN_DIRS[d].dy;
      return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx];
    });
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const d = rng.pick(opts);
    open(x, y, d);
    const nx = x + TWIN_DIRS[d].dx;
    const ny = y + TWIN_DIRS[d].dy;
    seen[ny * n + nx] = true;
    stack.push([nx, ny]);
  }
  // Birkaç ek geçit: tek yol yerine seçenek olsun
  for (let extra = 2; extra > 0; ) {
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

export const TWIN_MAZES = SEEDS.map(build);

const MIRROR = { N: 'N', S: 'S', E: 'W', W: 'E' };

/** Sağdaki noktanın gideceği yön (yanan gösterge varsa sağ–sol ters) */
export const rightDir = (d, e) => (litIndicatorCount(e) > 0 ? MIRROR[d] : d);

/** Bir noktayı bir yöne oynatır; duvar ya da kenar varsa yerinde kalır */
export function stepDot(maze, p, d) {
  const { dx, dy } = TWIN_DIRS[d];
  const nx = p.x + dx;
  const ny = p.y + dy;
  if (nx < 0 || ny < 0 || nx >= TWIN_SIZE || ny >= TWIN_SIZE) return p;
  if (TWIN_MAZES[maze][p.y * TWIN_SIZE + p.x] & WALL[d]) return p;
  return { x: nx, y: ny };
}

export function stepBoth(s, d, e) {
  return [stepDot(s.mazes[0], s.pos[0], d), stepDot(s.mazes[1], s.pos[1], rightDir(d, e))];
}

const key = (pos) => pos.map((p) => p.y * TWIN_SIZE + p.x).join(',');
const atGoal = (pos, goal) => pos.every((p, i) => p.x === goal[i].x && p.y === goal[i].y);

/** Bulunduğu yerden iki noktayı birlikte hedefe götüren en kısa hamle dizisi (yoksa null) */
export function twinPath(s, e, from = s.pos) {
  const prev = new Map([[key(from), null]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (atGoal(cur, s.goal)) {
      const path = [];
      let k = key(cur);
      while (prev.get(k)) {
        path.unshift(prev.get(k).d);
        k = prev.get(k).from;
      }
      return path;
    }
    for (const d of Object.keys(TWIN_DIRS)) {
      const next = stepBoth({ ...s, pos: cur }, d, e);
      const k = key(next);
      if (prev.has(k)) continue;
      prev.set(k, { from: key(cur), d });
      queue.push(next);
    }
  }
  return null;
}

/** Tek başına bir noktanın en kısa yolu (diğer noktayı umursamadan) */
function soloLen(maze, from, to) {
  const seen = new Set([from.y * TWIN_SIZE + from.x]);
  let frontier = [from];
  for (let dist = 0; frontier.length; dist++) {
    const next = [];
    for (const p of frontier) {
      if (p.x === to.x && p.y === to.y) return dist;
      for (const d of Object.keys(TWIN_DIRS)) {
        const q = stepDot(maze, p, d);
        const k = q.y * TWIN_SIZE + q.x;
        if (!seen.has(k)) {
          seen.add(k);
          next.push(q);
        }
      }
    }
    frontier = next;
  }
  return Infinity;
}

const cell = (rng) => ({ x: rng.int(0, TWIN_SIZE - 1), y: rng.int(0, TWIN_SIZE - 1) });

export default {
  type: 'twinmaze',
  needy: false,
  generate(rng, e) {
    for (;;) {
      const mazes = rng.sample([0, 1, 2, 3, 4, 5], 2);
      const start = [cell(rng), cell(rng)];
      const goal = [cell(rng), cell(rng)];
      const s = { mazes, start, pos: start.map((p) => ({ ...p })), goal, moves: 0 };
      const path = twinPath(s, e);
      if (!path || path.length < 6 || path.length > 12) continue;
      // İki noktayı ayrı ayrı götürmek yetmesin: birlikte hareket gerçekten zorlasın
      const apart = Math.max(soloLen(mazes[0], start[0], goal[0]), soloLen(mazes[1], start[1], goal[1]));
      if (path.length < apart + 2) continue;
      return { ...s, limit: path.length + TWIN_SLACK };
    }
  },
  view(s) {
    return {
      ids: s.mazes.map((m) => TWIN_IDS[m]),
      pos: s.pos.map((p) => ({ ...p })),
      goal: s.goal.map((p) => ({ ...p })),
      moves: s.moves,
      limit: s.limit,
    };
  },
  action(s, a, ctx) {
    const d = a && a.move;
    if (!TWIN_DIRS[d]) return {};
    s.pos = stepBoth(s, d, ctx.edgework);
    s.moves++;
    if (atGoal(s.pos, s.goal)) return { solved: true, changed: true };
    if (s.moves >= s.limit) {
      s.pos = s.start.map((p) => ({ ...p }));
      s.moves = 0;
      return { strike: true, changed: true };
    }
    return { changed: true };
  },
};
