import { TWIN_MAZES, TWIN_IDS, TWIN_SIZE, TWIN_WALL } from '/shared/modules/twinmaze.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const CELL = 24;
const PAD = 16;

function mazeSvg(index) {
  const n = TWIN_SIZE;
  const w = n * CELL + PAD + 4;
  let lines = '';
  const cells = TWIN_MAZES[index];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const c = cells[y * n + x];
      const x0 = PAD + x * CELL;
      const y0 = PAD + y * CELL;
      if (c & TWIN_WALL.N) lines += `M${x0} ${y0}h${CELL}`;
      if (c & TWIN_WALL.W) lines += `M${x0} ${y0}v${CELL}`;
      if (c & TWIN_WALL.E) lines += `M${x0 + CELL} ${y0}v${CELL}`;
      if (c & TWIN_WALL.S) lines += `M${x0} ${y0 + CELL}h${CELL}`;
    }
  }
  let labels = '';
  let dots = '';
  for (let i = 0; i < n; i++) {
    labels += `<text x="${PAD + i * CELL + CELL / 2}" y="11" class="mz-lbl">${'ABCD'[i]}</text><text x="7" y="${PAD + i * CELL + CELL / 2 + 4}" class="mz-lbl">${i + 1}</text>`;
    for (let j = 0; j < n; j++) dots += `<circle cx="${PAD + j * CELL + CELL / 2}" cy="${PAD + i * CELL + CELL / 2}" r="2"/>`;
  }
  return `<svg class="mz-svg tw-svg" viewBox="0 0 ${w} ${w}" width="${w}" height="${w}">${labels}<g class="mz-dots">${dots}</g><path d="${lines}" class="mz-walls"/></svg>`;
}

export default (L) => {
  const tr = L === 'tr';
  const maps = TWIN_MAZES.map((_, i) => `<figure class="tw-fig"><b>${TWIN_IDS[i]}</b>${mazeSvg(i)}</figure>`).join('');
  return `
    ${ident(
      L,
      tr
        ? 'Yan yana iki küçük 4×4 ızgara (üstlerinde turuncu Roma rakamı), her birinde beyaz nokta ve kırmızı üçgen; altta <b>HAMLE</b> sayacı ve dört ok.'
        : 'Two small 4×4 grids side by side (amber Roman numerals on top), each with a white dot and a red triangle; a <b>MOVES</b> counter and four arrows below.'
    )}
    ${needs(L, 'twinmaze')}
    ${steps(
      tr
        ? [
            `Her ızgaranın üstündeki ${mark('Roma rakamı')} aşağıdaki haritayı gösterir. Duvarlar imhacıya görünmez. Konumları sütun ${mark('A–D')} (soldan) ve satır ${mark('1–4')} (yukarıdan) olarak sorun.`,
            `Bir ok ${mark('iki noktayı birden')} oynatır. Bombada ${mark('yanan gösterge varsa sağdaki nokta sağ–sol ters')} gider (◀ basılınca sağa).`,
            `Duvara ya da kenara doğru giden nokta ${mark('yerinde kalır')}; bu hata değildir, diğer nokta yine de hareket eder.`,
            `İki nokta ${mark('aynı anda')} hedefindeyken modül çözülür. HAMLE sayacı sınıra ulaşırsa hata yazılır ve iki nokta da başa döner.`,
          ]
        : [
            `The ${mark('Roman numeral')} above each grid names the map below. Walls are invisible to the defuser. Ask positions as column ${mark('A–D')} (from the left) and row ${mark('1–4')} (from the top).`,
            `One arrow moves ${mark('both dots at once')}. If the bomb has ${mark('a lit indicator, the right dot moves mirrored left–right')} (◀ sends it right).`,
            `A dot moving into a wall or the edge ${mark('stays put')}; that is not a strike, and the other dot still moves.`,
            `The module is solved when both dots are on their targets ${mark('at the same time')}. If MOVES reaches the limit, a strike is recorded and both dots return to the start.`,
          ]
    )}
    <div class="tw-list">${maps}</div>
    <h3>${tr ? 'Nasıl düşünmeli?' : 'How to think'}</h3>
    <ul>
      ${
        tr
          ? `<li><b>Duvar bir frendir.</b> Bir noktayı duvara ya da kenara dayayın: o nokta beklerken öteki ilerler. Asıl çözüm budur.</li>
             <li>Önce hedefine <b>uzak</b> olan noktanın yolunu çizin; yakın olanı o sırada bir duvarda bekletin.</li>
             <li>Hamle sınırı en kısa çözümden 4 fazladır: plansız deneme sığmaz, ama birkaç düzeltmeye yer vardır.</li>`
          : `<li><b>A wall is a brake.</b> Park one dot against a wall or the edge: it waits while the other advances. That is the core trick.</li>
             <li>Plan the path of the dot <b>farther</b> from its target first; park the nearer one against a wall meanwhile.</li>
             <li>The move limit is the shortest solution plus 4: random tries won’t fit, but a few corrections will.</li>`
      }
    </ul>
    ${example(
      L,
      tr
        ? 'Soldaki nokta hedefinin iki kare sağında, sağdaki ise hedefinin hemen altında; sağdaki noktanın sağında duvar var. ▶ ▶ basınca soldaki iki kare ilerler, sağdaki duvara dayandığı için kımıldamaz. Sonra ▲ ile sağdakini hedefe çıkarın; soldaki yukarı gidemiyorsa (duvar varsa) yerinde kalır ve ikisi aynı anda hedeftedir.'
        : 'The left dot is two squares left of its target, the right dot just below its own, with a wall on its right. Press ▶ ▶: the left dot advances twice, the right one stays against the wall. Then ▲ lifts the right dot onto its target; if the left dot has a wall above, it stays put and both are home together.'
    )}
    ${warn(
      L,
      tr
        ? ['Her hamleden sonra iki konumu da teyit ettirin; bir noktanın beklediğini fark etmemek bütün planı kaydırır.', 'Yanan gösterge varsa sağdaki ızgarada ◀ ile ▶ yer değiştirir; ▲ ve ▼ değişmez.']
        : ['Confirm both positions after every move; missing that a dot stayed put shifts the whole plan.', 'With a lit indicator ◀ and ▶ swap on the right grid; ▲ and ▼ do not.']
    )}`;
};
