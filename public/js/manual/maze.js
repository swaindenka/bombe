import { MAZES, MAZE_LEDS, MAZE_SIZE, WALL } from '/shared/mazes.js';
import { ident } from './common.js';

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
      tr
        ? 'Sol üstünde 3×3 küçük ışık, ortasında 6×6 nokta ızgarası, dört yanında ok düğmeleri olan modül.'
        : 'A module with a 3×3 cluster of small lights in the top-left, a 6×6 grid of dots and arrow buttons on all four sides.'
    )}
    <ol>
      ${
        tr
          ? `<li>İmhacıdan sol üstteki <b>3×3 ışık desenini</b> öğrenin ve aşağıda aynı desene sahip labirenti bulun.</li>
             <li>Izgaradaki <b>beyaz nokta</b> imhacının konumu, <b>kırmızı üçgen</b> hedeftir. Konumları sütun (A–F, soldan sağa) ve satır (1–6, yukarıdan aşağıya) olarak sorun.</li>
             <li>Beyaz noktayı ok tuşlarıyla adım adım hedefe götürün.</li>
             <li>Duvarlar imhacıya <b>görünmez</b>. Duvara (ya da dış kenara) doğru hareket etmek hata yazdırır ve nokta yerinde kalır.</li>`
          : `<li>Ask the defuser for the <b>3×3 light pattern</b> in the top-left and find the maze with the same pattern below.</li>
             <li>The <b>white dot</b> is the defuser’s position and the <b>red triangle</b> is the goal. Ask for positions as column (A–F, left to right) and row (1–6, top to bottom).</li>
             <li>Guide the white dot to the goal one step at a time with the arrow buttons.</li>
             <li>Walls are <b>invisible</b> to the defuser. Moving into a wall (or the outer edge) causes a strike and the dot stays put.</li>`
      }
    </ol>
    <div class="mz-list">${mazes}</div>`;
};
