// SAYI YOLU: 4×4 rakam tablosu, halkalı bir başlangıç hücresi ve ekranda bir ADIM sayısı. Başlangıçtan
// itibaren, her adımda bulunduğun hücrenin rakamına göre bir kare ilerlenir:
//   0–2 sağa · 3–5 aşağı · 6–7 sola · 8–9 yukarı
// Bombada 3 veya daha fazla port varsa yukarı ile aşağı yer değiştirir. Kenardan çıkan karşı kenardan girer.
// ADIM kadar ilerleyince varılan hücreye basılır. İki aşamalıdır: 2. aşamada tablo değişir, başlangıç
// 1. aşamada basılan hücredir. Yanlış hücre hata yazdırır; tablo aynı kalır.

import { portCount } from '../edgework.js';

export const PATH_SIZE = 4;
export const PATH_STAGES = 2;

const MOVES = { R: [1, 0], D: [0, 1], L: [-1, 0], U: [0, -1] };

/** Rakamın yönü (kılavuzdaki tablo) */
export function digitDir(d, e) {
  const dir = d <= 2 ? 'R' : d <= 5 ? 'D' : d <= 7 ? 'L' : 'U';
  if (portCount(e) >= 3 && (dir === 'U' || dir === 'D')) return dir === 'U' ? 'D' : 'U';
  return dir;
}

/** Başlangıçtan n adım sonra varılan hücre ve izlenen yol */
export function walkPath(grid, start, steps, e) {
  let { x, y } = start;
  const trail = [];
  for (let i = 0; i < steps; i++) {
    const d = digitDir(grid[y * PATH_SIZE + x], e);
    x = (x + MOVES[d][0] + PATH_SIZE) % PATH_SIZE;
    y = (y + MOVES[d][1] + PATH_SIZE) % PATH_SIZE;
    trail.push({ x, y, d });
  }
  return { end: { x, y }, trail };
}

function newStage(s, rng, e, start) {
  for (;;) {
    const grid = Array.from({ length: PATH_SIZE * PATH_SIZE }, () => rng.int(0, 9));
    const steps = rng.int(4, 6);
    const { end, trail } = walkPath(grid, start, steps, e);
    // Varış başlangıçtan farklı olsun ve yol hep aynı satırda/sütunda kalmasın
    if (end.x === start.x && end.y === start.y) continue;
    if (new Set(trail.map((t) => t.d)).size < 2) continue;
    Object.assign(s, { grid, steps, start: { ...start }, end });
    return;
  }
}

export default {
  type: 'numpath',
  needy: false,
  generate(rng, e) {
    const s = { stage: 1 };
    newStage(s, rng, e, { x: rng.int(0, PATH_SIZE - 1), y: rng.int(0, PATH_SIZE - 1) });
    return s;
  },
  view(s) {
    return { stage: s.stage, grid: s.grid.slice(), start: { ...s.start }, steps: s.steps };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i >= PATH_SIZE * PATH_SIZE) return {};
    const p = { x: i % PATH_SIZE, y: Math.floor(i / PATH_SIZE) };
    if (p.x !== s.end.x || p.y !== s.end.y) return { strike: true };
    if (s.stage === PATH_STAGES) return { solved: true, changed: true };
    s.stage++;
    newStage(s, ctx.rng, ctx.edgework, p);
    return { changed: true };
  },
};
