import { MAZES, MAZE_LEDS, MAZE_SIZE, WALL } from '/shared/mazes.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const CELL = 26;
const PAD = 18;

function mazeSvg(index) {
  const n = MAZE_SIZE;
  const size = n * CELL;
  const w = size + PAD + 4;
  let lines = '';
  const cells = MAZES[index];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const c = cells[y * n + x];
      const x0 = PAD + x * CELL;
      const y0 = PAD + y * CELL;
      if (c & WALL.N) lines += `M${x0} ${y0}h${CELL}`;
      if (c & WALL.W) lines += `M${x0} ${y0}v${CELL}`;
      if (x === n - 1 && c & WALL.E) lines += `M${x0 + CELL} ${y0}v${CELL}`;
      if (y === n - 1 && c & WALL.S) lines += `M${x0} ${y0 + CELL}h${CELL}`;
      if (x < n - 1 && c & WALL.E) lines += `M${x0 + CELL} ${y0}v${CELL}`;
      if (y < n - 1 && c & WALL.S) lines += `M${x0} ${y0 + CELL}h${CELL}`;
    }
  }
  let dots = '';
  let labels = '';
  for (let i = 0; i < n; i++) {
    labels += `<text x="${PAD + i * CELL + CELL / 2}" y="12" class="mz-lbl">${'ABCDEF'[i]}</text>`;
    labels += `<text x="8" y="${PAD + i * CELL + CELL / 2 + 4}" class="mz-lbl">${i + 1}</text>`;
    for (let j = 0; j < n; j++) dots += `<circle cx="${PAD + j * CELL + CELL / 2}" cy="${PAD + i * CELL + CELL / 2}" r="2"/>`;
  }
  return `<svg class="mz-svg" viewBox="0 0 ${w} ${w}" width="${w}" height="${w}">${labels}<g class="mz-dots">${dots}</g><path d="${lines}" class="mz-walls"/></svg>`;
}

function ledsHtml(index) {
  return `<div class="mz-key">${MAZE_LEDS[index].map((on) => `<i class="${on ? 'on' : ''}"></i>`).join('')}</div>`;
}

export default (L) => {
  const tr = L === 'tr';
  const mazes = MAZES.map(
    (_, i) => `<figure class="mz-fig"><div class="mz-cap">${ledsHtml(i)}<span>${tr ? 'Işık deseni' : 'Light pattern'}</span></div>${mazeSvg(i)}</figure>`
  ).join('');
  return `
    ${ident(
      L,
      tr ? 'Sol üstte 3×3 küçük ışık, ortada 6×6 nokta ızgarası, dört yanda ok düğmeleri.' : 'A 3×3 cluster of small lights top-left, a 6×6 dot grid and arrow buttons on four sides.'
    )}
    ${needs(L, 'maze')}
    ${steps(
      tr
        ? [
            `${mark('3×3 ışık desenini')} sorun ve aynı desenli labirenti bulun.`,
            `${mark('Beyaz nokta')} imhacıdır, ${mark('kırmızı üçgen')} hedef. Konumları sütun harfi (A–F, soldan) ve satır numarasıyla (1–6, yukarıdan) sorun.`,
            'Duvarlara çarpmayan bir yol bulun ve adım adım söyleyin.',
          ]
        : [
            `Ask for the ${mark('3×3 light pattern')} and find the maze with the same pattern.`,
            `The ${mark('white dot')} is the defuser, the ${mark('red triangle')} the goal. Ask positions as column letter (A–F, from the left) and row number (1–6, from the top).`,
            'Find a path that avoids the walls and call it out step by step.',
          ]
    )}
    <div class="mz-list">${mazes}</div>
    ${example(
      L,
      tr
        ? 'Işıklar çapraz (sol üst, orta, sağ alt) → ilk labirent. Nokta <b>B5</b>, hedef <b>E2</b>: haritada B5’ten E2’ye duvarsız yolu çizip "yukarı, sağ, sağ…" diye tarif edin.'
        : 'Lights in a diagonal (top-left, centre, bottom-right) → the first maze. Dot at <b>B5</b>, goal <b>E2</b>: trace a wall-free path and call it out: "up, right, right…".'
    )}
    ${warn(
      L,
      tr
        ? ['Duvarlar imhacıya <b>görünmez</b>; duvara ya da dış kenara gitmek hata yazdırır ve nokta yerinde kalır.', 'Birkaç adımda bir konumu teyit ettirin.']
        : ['Walls are <b>invisible</b> to the defuser; moving into a wall or the edge causes a strike and the dot stays put.', 'Confirm the position every few steps.']
    )}`;
};
