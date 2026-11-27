import { lineClue, nonoTransform, NONO } from '/shared/modules/nonogram.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

const mini = (g) => `<span class="mini5">${g.map((v) => `<i class="${v ? 'on' : ''}"></i>`).join('')}</span>`;
const miniLine = (l) => `<span class="mini5 line">${l.map((v) => `<i class="${v ? 'on' : ''}"></i>`).join('')}</span>`;

// 5'lik bir satırda ipucuna uyan bütün dizilimlerde ortak olan dolu kareler (kesin dolu)
function forced(clue) {
  const lines = Array.from({ length: 1 << NONO }, (_, m) => Array.from({ length: NONO }, (_, i) => ((m >> i) & 1 ? 1 : 0))).filter(
    (l) => lineClue(l).join() === clue.join()
  );
  return Array.from({ length: NONO }, (_, i) => (lines.every((l) => l[i]) ? 1 : 0));
}

// Örnek resim: asimetrik, böylece her dönüşüm farkı görünür
const EX = [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0];

export default (L) => {
  const tr = L === 'tr';
  const lamps = [
    ['blue', tr ? '<b>Sağ–sol aynalayın</b>: en soldaki sütun en sağa gider.' : '<b>Mirror left–right</b>: the leftmost column goes to the right.'],
    ['amber', tr ? '<b>Tersini girin</b>: dolu kareler boş, boşlar dolu.' : '<b>Enter the inverse</b>: filled squares empty, empty ones filled.'],
    ['white', tr ? '<b>Baş aşağı çevirin</b>: en üst satır en alta gider.' : '<b>Flip upside down</b>: the top row goes to the bottom.'],
  ];
  const lampRows = lamps.map(([c, t]) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${t}</td><td class="center">${mini(nonoTransform(EX, c))}</td></tr>`).join('');
  const hints = [[5], [4], [3], [2, 2], [1, 3], [1, 1, 1], [2, 1]]
    .map((c) => `<tr><td class="mono center">${c.join(' ')}</td><td class="center">${miniLine(forced(c))}</td></tr>`)
    .join('');
  return `
    ${ident(
      L,
      tr
        ? 'Sol üstte renkli bir lamba, satırların solunda ve sütunların üstünde sayılar olan 5×5 kare ızgara ve ONAY.'
        : 'A coloured lamp top-left, a 5×5 grid with numbers left of each row and above each column, and SUBMIT.'
    )}
    ${needs(L, 'nonogram')}
    ${steps(
      tr
        ? [
            `Her sayı, o satırda ya da sütunda ${mark('arka arkaya dolu karelerden oluşan bir grubun')} uzunluğudur. Gruplar soldan sağa / yukarıdan aşağıya sırayla gelir, aralarında ${mark('en az bir boş')} kare vardır. 0 = tamamen boş.`,
            'İmhacıdan ipuçlarını alın ve resmi kâğıtta (ya da ortak notlarda) çözün. Tahmin gerekmez; her resim mantıkla çözülür.',
            `Izgaraya resmin kendisi değil, ${mark('lambanın rengine göre dönüştürülmüş')} hâli girilir (tablo). Sonra <b>ONAY</b>.`,
          ]
        : [
            `Each number is the length of a ${mark('run of consecutive filled squares')} in that row or column. Runs come in order (left to right / top to bottom) with ${mark('at least one empty')} square between them. 0 = all empty.`,
            'Get the clues from the defuser and solve the picture on paper (or in the shared notes). No guessing needed; every picture solves by logic.',
            `Enter not the picture itself but its ${mark('transformed version, by lamp colour')} (table). Then <b>SUBMIT</b>.`,
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Lamba' : 'Lamp'}</th><th>${tr ? 'Girilecek' : 'Enter'}</th><th class="center">${tr ? 'Örnek resim' : 'Example'} ${mini(EX)} →</th></tr></thead><tbody>${lampRows}</tbody></table>
    <h3>${tr ? 'Nereden başlamalı?' : 'Where to start?'}</h3>
    <p class="small">${
      tr
        ? 'Büyük sayılar kendini ele verir: bir grup nereye kayarsa kaysın bazı kareleri hep kaplar. 5 kareli bir satırda kesin dolu olanlar:'
        : 'Big numbers give themselves away: wherever a run slides, it always covers some squares. Certain squares in a 5-wide line:'
    }</p>
    <table class="rules narrow"><thead><tr><th class="center">${tr ? 'İpucu' : 'Clue'}</th><th class="center">${tr ? 'Kesin dolu' : 'Certain'}</th></tr></thead><tbody>${hints}</tbody></table>
    ${example(
      L,
      tr
        ? `Örnek resmin ipuçları: satırlar ${EX_ROWS(EX).join(' · ')}; sütunlar ${EX_COLS(EX).join(' · ')}. İlk sütun "5" → tamamen dolu; ilk satır "4" → ortadaki üç kare kesin dolu, ilk kare de sütundan dolu… Resim çıkınca lambaya bakın: <b>mavi</b> ise sağdaki gibi aynalayıp girin.`
        : `The example picture’s clues: rows ${EX_ROWS(EX).join(' · ')}; columns ${EX_COLS(EX).join(' · ')}. First column "5" → all filled; first row "4" → the middle three are certain, the first one comes from the column… Once solved, check the lamp: if <b>blue</b>, enter it mirrored as shown.`
    )}
    ${warn(
      L,
      tr
        ? ['Önce resmi tam çözün, dönüştürmeyi en sonda yapın; ikisini aynı anda yapmak karıştırır.', 'Karelere basmak serbesttir; yalnızca yanlış ONAY hata yazdırır.']
        : ['Solve the whole picture first and transform it last; doing both at once gets confusing.', 'Pressing squares is free; only a wrong SUBMIT causes a strike.']
    )}`;
};

const EX_ROWS = (g) => Array.from({ length: NONO }, (_, y) => (lineClue(g.slice(y * NONO, y * NONO + NONO)).join(' ') || '0'));
const EX_COLS = (g) => Array.from({ length: NONO }, (_, x) => (lineClue(Array.from({ length: NONO }, (_, y) => g[y * NONO + x])).join(' ') || '0'));
