import { PANEL_SYMBOLS, PANEL_TARGETS, chaseTable } from '/shared/modules/lights.js';
import { panelIcon } from '/shared/icons.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const NAMES = {
  tr: { sun: 'Güneş', moon: 'Ay', cloud: 'Bulut', drop: 'Damla', leaf: 'Yaprak', bolt: 'Şimşek' },
  en: { sun: 'Sun', moon: 'Moon', cloud: 'Cloud', drop: 'Drop', leaf: 'Leaf', bolt: 'Bolt' },
};
const mini = (cells, cls = '', mark1 = 'on') => `<div class="mini3 ${cls}">${cells.map((v) => `<i class="${v ? mark1 : ''}"></i>`).join('')}</div>`;

export default (L) => {
  const tr = L === 'tr';
  const targets = PANEL_SYMBOLS.map((s) => `<div class="lp-target">${panelIcon(s)}<span>${NAMES[L][s]}</span>${mini(PANEL_TARGETS[s])}</div>`).join('');
  const table = Object.entries(chaseTable())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bottom, top]) => {
      const row = (on) => [0, 1, 2].map((x) => (on(x) ? 1 : 0));
      return `<tr><td class="center">${mini(row((x) => bottom[x] === '1'), 'small row1', 'x')}</td><td class="center">${mini(row((x) => top.includes(x)), 'small row1')}</td></tr>`;
    })
    .join('');
  return `
    ${ident(L, tr ? '3×3 lambalı düğme, sol üstte küçük bir sembol, altta ONAY.' : 'A 3×3 grid of lamp buttons, a small symbol top-left and SUBMIT.')}
    ${needs(L, 'lights')}
    ${steps(
      tr
        ? [
            `Sembolü sorun ve aşağıda ${mark('hedef deseni')} bulun. Bombada ${mark('yanan gösterge varsa')} hedefin ${mark('tersi')} geçerlidir (yanan ↔ sönük).`,
            `Bir düğmeye basmak ${mark('o lambayı ve üst, alt, sol, sağ komşularını')} değiştirir. Çaprazlar değişmez.`,
            'Bütün lambalar hedefle aynı olunca <b>ONAY</b>. Basmak serbesttir; yalnızca yanlış ONAY hata yazdırır.',
          ]
        : [
            `Ask for the symbol and find its ${mark('target pattern')} below. If the bomb has ${mark('a lit indicator')}, use the ${mark('inverse')} (lit ↔ unlit).`,
            `Pressing a button flips ${mark('that lamp and its up, down, left and right neighbours')}. Diagonals don’t change.`,
            'When every lamp matches the target, press <b>SUBMIT</b>. Pressing is free; only a wrong SUBMIT causes a strike.',
          ]
    )}
    <div class="lp-targets">${targets}</div>
    <h3>${tr ? 'Çözüm yolu: ışık kovalama' : 'How to solve: chasing the lights'}</h3>
    <p class="small">${
      tr
        ? 'Deneme yanılma uzun sürer. Hedefle uyuşmayan lambalara <b>yanlış</b> deyin ve şu sırayla gidin:'
        : 'Trial and error is slow. Call every lamp that differs from the target <b>wrong</b> and go in this order:'
    }</p>
    ${steps(
      tr
        ? [
            `Üst satırdaki her yanlış lambanın ${mark('hemen altındaki')} düğmeye basın. Üst satır düzelir.`,
            `Orta satırdaki her yanlış lambanın ${mark('hemen altındaki')} düğmeye basın. Orta satır düzelir.`,
            'Artık yalnızca alt satırda yanlış kalabilir. Desenini tabloda bulun, gösterilen <b>üst satır</b> düğmelerine basın ve 1–2. adımları bir kez daha yapın.',
          ]
        : [
            `For every wrong lamp in the top row, press the button ${mark('directly below it')}. The top row is fixed.`,
            `For every wrong lamp in the middle row, press the button ${mark('directly below it')}. The middle row is fixed.`,
            'Only the bottom row can still be wrong. Find its pattern in the table, press the shown <b>top-row</b> buttons and repeat steps 1–2 once more.',
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Alt satırda yanlış' : 'Wrong in bottom row'}</th><th>${tr ? 'Üst satırda bas' : 'Press in top row'}</th></tr></thead><tbody>${table}</tbody></table>
    ${example(
      L,
      tr
        ? 'Sembol güneş, yanan gösterge yok → hedef artı deseni. Üst satır ● ○ ○ yanıyor, hedef ○ ● ○ → sol üst ve üst orta yanlış → <b>orta satırın sol ve orta</b> düğmelerine basın. Sonra orta satıra bakın.'
        : 'Symbol sun, no lit indicator → the plus pattern. Top row is ● ○ ○, target ○ ● ○ → top-left and top-middle are wrong → press the <b>middle row’s left and middle</b> buttons. Then look at the middle row.'
    )}
    ${warn(
      L,
      tr
        ? ['İmhacı her adımdan sonra satırı yeniden okusun: bir basış komşu lambaları da değiştirir.', 'Satırları "yanıyor / sönük" diye soldan sağa okuyun.']
        : ['Have the defuser re-read the row after every step: one press also flips the neighbours.', 'Read rows left to right as "on / off".']
    )}`;
};
