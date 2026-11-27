import { walkPath, digitDir, PATH_SIZE } from '/shared/modules/numpath.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const ARROW = { R: '→', D: '↓', L: '←', U: '↑' };
const NAME = {
  tr: { R: 'sağa', D: 'aşağı', L: 'sola', U: 'yukarı' },
  en: { R: 'right', D: 'down', L: 'left', U: 'up' },
};

// Örnek: sabit tablo, portu az bir bomba. Yol oyunun kendi kuralıyla hesaplanır.
const EX_GRID = [6, 0, 9, 0, 1, 9, 5, 3, 7, 9, 3, 8, 3, 7, 6, 9];
const EX_START = { x: 1, y: 1 };
const EX_STEPS = 5;
const NO_PORTS = { serial: 'BC12D7', batteryHolders: [], indicators: [], portPlates: [] };

export default (L) => {
  const tr = L === 'tr';
  const rows = [
    ['0 · 1 · 2', 'R'],
    ['3 · 4 · 5', 'D'],
    ['6 · 7', 'L'],
    ['8 · 9', 'U'],
  ]
    .map(([d, k]) => `<tr><td class="mono center">${d}</td><td>${ARROW[k]} ${NAME[L][k]}</td></tr>`)
    .join('');
  const { trail, end } = walkPath(EX_GRID, EX_START, EX_STEPS, NO_PORTS);
  const cell = (p) => EX_GRID[p.y * PATH_SIZE + p.x];
  let at = EX_START;
  const walk = trail
    .map((t) => {
      const s = `${cell(at)} ${ARROW[digitDir(cell(at), NO_PORTS)]}`;
      at = t;
      return s;
    })
    .join(' · ');
  const table = `<table class="rules compact np-ex">${Array.from({ length: PATH_SIZE }, (_, y) =>
    `<tr>${Array.from({ length: PATH_SIZE }, (_, x) => {
      const cls = x === EX_START.x && y === EX_START.y ? 'start' : x === end.x && y === end.y ? 'end' : '';
      return `<td class="center mono ${cls}">${EX_GRID[y * PATH_SIZE + x]}</td>`;
    }).join('')}</tr>`
  ).join('')}</table>`;
  return `
    ${ident(
      L,
      tr ? '4×4 rakamlı düğme tablosu; birinin çevresinde yeşil halka, üstte <b>ADIM</b> sayısı ve 2 aşama ışığı.' : 'A 4×4 grid of digit buttons, one ringed in green, a <b>STEPS</b> number on top and 2 stage lights.'
    )}
    ${needs(L, 'numpath')}
    ${steps(
      tr
        ? [
            `${mark('Yeşil halkalı hücreden')} başlayın. Bulunduğunuz hücrenin rakamı hangi yöne ${mark('bir kare')} gideceğinizi söyler (tablo).`,
            `Bombada ${mark('3 veya daha fazla port')} varsa yukarı ile aşağı yer değiştirir.`,
            `Kenardan çıkarsanız ${mark('karşı kenardan')} girin (sağdan çıkan soldan girer).`,
            `ADIM sayısı kadar ilerleyin; ${mark('vardığınız hücreye')} bastırın. Başlangıç hücresi adım sayılmaz.`,
            '2. aşamada tablo ve adım sayısı değişir; başlangıç, 1. aşamada basılan hücredir (yine yeşil halkalı).',
          ]
        : [
            `Start ${mark('at the green-ringed cell')}. Its digit tells you which way to move ${mark('one square')} (table).`,
            `If the bomb has ${mark('3 or more ports')}, up and down swap.`,
            `Leaving an edge, ${mark('wrap around')} to the opposite edge.`,
            `Move STEPS times and have the ${mark('cell you land on')} pressed. The start cell doesn’t count as a step.`,
            'In stage 2 the grid and the step count change; you start from the cell pressed in stage 1 (ringed again).',
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Rakam' : 'Digit'}</th><th>${tr ? 'Yön' : 'Move'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      `<div class="mini-pair">${table}<div>${
        tr
          ? `Halka <b>${cell(EX_START)}</b>’da, <b>${EX_STEPS} adım</b>, port az. Yol: ${walk} → vardığınız hücre <b>${cell(end)}</b> (yeşil zeminli). 3. adımda yukarı giderken üst kenardan çıkıp alttan girdiğinize dikkat.`
          : `Ring on <b>${cell(EX_START)}</b>, <b>${EX_STEPS} steps</b>, few ports. Path: ${walk} → you land on <b>${cell(end)}</b> (green cell). Note step 3: going up off the top edge brings you in at the bottom.`
      }</div></div>`
    )}
    ${warn(
      L,
      tr
        ? ['Her adımda imhacı yeni hücrenin rakamını söylesin; parmağını tabloda gezdirsin.', 'Yanlış hücre hata yazdırır; tablo ve başlangıç değişmez, baştan sayın.']
        : ['At every step the defuser reads the new cell’s digit, tracing with a finger.', 'A wrong cell causes a strike; the grid and start stay, count again.']
    )}`;
};
