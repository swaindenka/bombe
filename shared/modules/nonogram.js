// RESİM BULMACASI: 5×5 ızgara; satırların solunda ve sütunların üstünde ipucu sayıları var. Her sayı,
// o satırda/sütunda arka arkaya dolu kare grubunun uzunluğudur (gruplar sırasıyla, aralarında en az bir boşluk).
// Resim ipuçlarından mantıkla bulunur; ama ızgaraya, sol üstteki lambanın rengine göre DÖNÜŞTÜRÜLMÜŞ hâli girilir:
//   MAVİ: sağ–sol aynalanmış · TURUNCU: tersi (dolu ↔ boş) · BEYAZ: baş aşağı (üst–alt aynalanmış)
// Karelere basmak serbesttir; yanlış ONAY hata yazdırır. Her resim yalnızca mantıkla (tahminsiz) çözülebilir.

export const NONO = 5;
export const NONO_LAMPS = ['blue', 'amber', 'white'];

/** Bir satırın ipucu: arka arkaya dolu grupların uzunlukları ([] = boş satır) */
export function lineClue(line) {
  const out = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run) {
      out.push(run);
      run = 0;
    }
  }
  if (run) out.push(run);
  return out;
}

const rowOf = (g, y) => g.slice(y * NONO, y * NONO + NONO);
const colOf = (g, x) => Array.from({ length: NONO }, (_, y) => g[y * NONO + x]);

export function nonoClues(grid) {
  return {
    rows: Array.from({ length: NONO }, (_, y) => lineClue(rowOf(grid, y))),
    cols: Array.from({ length: NONO }, (_, x) => lineClue(colOf(grid, x))),
  };
}

// Uzunluğu NONO olan bütün satırlar ve ipuçları (32 tane)
const ALL_LINES = Array.from({ length: 1 << NONO }, (_, m) => Array.from({ length: NONO }, (_, i) => ((m >> i) & 1 ? 1 : 0)));
const sameClue = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Satır satır mantık çözücü: her satırda ipucuna ve bilinen karelere uyan bütün dizilimleri dener, hepsinde
 * aynı olan kareleri kesinleştirir. Tahmin yapmaz. Çözebilirse ızgarayı, çözemezse null döndürür.
 */
export function solveNonogram(clues) {
  const g = Array(NONO * NONO).fill(-1);
  for (let changed = true; changed; ) {
    changed = false;
    for (const [isRow, list] of [
      [true, clues.rows],
      [false, clues.cols],
    ]) {
      list.forEach((clue, k) => {
        const idx = Array.from({ length: NONO }, (_, i) => (isRow ? k * NONO + i : i * NONO + k));
        const fits = ALL_LINES.filter((l) => sameClue(lineClue(l), clue) && idx.every((p, i) => g[p] === -1 || g[p] === l[i]));
        if (!fits.length) return;
        idx.forEach((p, i) => {
          if (g[p] !== -1) return;
          const v = fits[0][i];
          if (fits.every((l) => l[i] === v)) {
            g[p] = v;
            changed = true;
          }
        });
      });
    }
  }
  return g.includes(-1) ? null : g;
}

/** Lamba rengine göre ızgaraya girilecek desen */
export function nonoTransform(grid, lamp) {
  if (lamp === 'amber') return grid.map((v) => 1 - v);
  return Array.from({ length: NONO * NONO }, (_, p) => {
    const x = p % NONO;
    const y = Math.floor(p / NONO);
    return lamp === 'blue' ? grid[y * NONO + (NONO - 1 - x)] : grid[(NONO - 1 - y) * NONO + x];
  });
}

export default {
  type: 'nonogram',
  needy: false,
  generate(rng) {
    for (;;) {
      const picture = Array.from({ length: NONO * NONO }, () => (rng.chance(0.56) ? 1 : 0));
      const filled = picture.reduce((a, b) => a + b, 0);
      if (filled < 11 || filled > 17) continue;
      const clues = nonoClues(picture);
      const solved = solveNonogram(clues);
      // Mantıkla tek çözüm; dönüşüm resmi gerçekten değiştirsin (simetrik resimde aynalama boşa gider)
      if (!solved || !solved.every((v, i) => v === picture[i])) continue;
      const lamp = rng.pick(NONO_LAMPS);
      const target = nonoTransform(picture, lamp);
      if (target.every((v, i) => v === picture[i])) continue;
      return { clues, lamp, target, cells: Array(NONO * NONO).fill(0) };
    }
  },
  view(s) {
    return { clues: { rows: s.clues.rows.map((r) => r.slice()), cols: s.clues.cols.map((c) => c.slice()) }, lamp: s.lamp, cells: s.cells.slice() };
  },
  action(s, a) {
    if (!a) return {};
    if (Number.isInteger(a.toggle) && a.toggle >= 0 && a.toggle < NONO * NONO) {
      s.cells[a.toggle] = s.cells[a.toggle] ? 0 : 1;
      return { changed: true };
    }
    if (a.submit) return s.cells.every((v, i) => v === s.target[i]) ? { solved: true, changed: true } : { strike: true };
    return {};
  },
};
