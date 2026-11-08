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
      tr
        ? 'Sol üstünde 3×3 küçük ışık, ortasında 6×6 nokta ızgarası, dört yanında ok düğmeleri olan modül.'
        : 'A module with a 3×3 cluster of small lights in the top-left, a 6×6 grid of dots and arrow buttons on all sides.'
    )}
    ${needs(L, 'maze')}
    ${steps(
      tr
        ? [
            `İmhacıdan sol üstteki ${mark('3×3 ışık desenini')} isteyin (hangi ışıklar yanıyor). Aşağıda aynı desenli labirenti bulun.`,
            `${mark('Beyaz nokta')} imhacının konumu, ${mark('kırmızı üçgen')} hedeftir. Konumları sütun + satır olarak sorun: sütunlar ${mark('A–F soldan sağa')}, satırlar ${mark('1–6 yukarıdan aşağıya')}.`,
            'Haritada duvarlara çarpmayan bir yol çizin ve imhacıya adım adım söyleyin: "yukarı, yukarı, sağ…".',
            'Beyaz nokta hedefe varınca modül çözülür.',
          ]
        : [
            `Ask for the ${mark('3×3 light pattern')} in the top-left (which lights are on). Find the maze with the same pattern below.`,
            `The ${mark('white dot')} is the defuser, the ${mark('red triangle')} is the goal. Ask for positions as column + row: columns ${mark('A–F left to right')}, rows ${mark('1–6 top to bottom')}.`,
            'Plan a path that avoids the walls and call it out step by step: "up, up, right…".',
            'The module is solved when the white dot reaches the goal.',
          ]
    )}
    <div class="mz-list">${mazes}</div>
    ${example(
      L,
      tr
        ? 'Işık deseni çapraz (sol üst, orta, sağ alt) → ilk labirent. Beyaz nokta <b>B5</b>, hedef <b>E2</b>: haritada B5’ten E2’ye duvarsız yolu bulup tarif edin.'
        : 'Light pattern diagonal (top-left, centre, bottom-right) → the first maze. White dot at <b>B5</b>, goal at <b>E2</b>: find a wall-free path from B5 to E2 and call it out.'
    )}
    ${warn(
      L,
      tr
        ? ['Duvarlar imhacıya <b>görünmez</b>. Duvara ya da dış kenara doğru hareket hata yazdırır ve nokta yerinde kalır.', 'Her harekette imhacıya yeni konumunu teyit ettirin; tek adım şaşması yolu bozar.']
        : ['Walls are <b>invisible</b> to the defuser. Moving into a wall or the outer edge causes a strike and the dot stays put.', 'Have the defuser confirm the position after each move; one wrong step breaks the path.']
    )}`;
};
