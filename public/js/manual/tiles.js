import { TILE_TABLE, TILE_COLORS } from '/shared/modules/tiles.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const rows = TILE_COLORS.map(
    (c) => `<tr><td class="nowrap">${swatch(c, L)}</td>${TILE_TABLE[c].map((x) => `<td class="nowrap">${swatch(x, L)}</td>`).join('')}</tr>`
  ).join('');
  return `
    ${ident(L, tr ? '3×3 düzende dokuz renkli karodan oluşan modül.' : 'A module made of nine coloured tiles in a 3×3 grid.')}
    ${needs(L, 'tiles')}
    ${steps(
      tr
        ? [
            'İmhacıdan her renkten kaç karo olduğunu sayın.',
            `En çok karosu olan renk ${mark('baskın renktir')}. Eşitlik varsa öncelik: ${mark('kırmızı > mavi > yeşil > sarı')}.`,
            'Tablodan baskın renk satırını ve pil sayısı sütununu bulun: bu, <b>basılacak renktir</b>.',
            `O renkteki ${mark('bütün karolara')} bastırın (sıra önemsiz).`,
            `Modülde o renkte ${mark('hiç karo yoksa')}, bunun yerine baskın rengin bütün karolarına bastırın.`,
          ]
        : [
            'Have the defuser count how many tiles there are of each colour.',
            `The colour with the most tiles is the ${mark('dominant colour')}. On a tie, priority is ${mark('red > blue > green > yellow')}.`,
            'Find the dominant colour’s row and the battery column: that is the <b>colour to press</b>.',
            `Press ${mark('every tile')} of that colour (any order).`,
            `If there is ${mark('no tile')} of that colour, press every tile of the dominant colour instead.`,
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Baskın renk' : 'Dominant'}</th><th>${tr ? '0–1 pil' : '0–1 batteries'}</th><th>${tr ? '2–3 pil' : '2–3 batteries'}</th><th>${tr ? '4 veya daha fazla pil' : '4+ batteries'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? '4 kırmızı, 3 mavi, 2 yeşil karo; <b>3 pil</b>. Baskın renk kırmızı → 2–3 pil sütunu → <b>sarı</b>. Modülde sarı karo yok → bunun yerine <b>4 kırmızı karonun hepsine</b> bas.'
        : '4 red, 3 blue, 2 green tiles; <b>3 batteries</b>. Dominant is red → 2–3 column → <b>yellow</b>. There is no yellow tile → press <b>all 4 red tiles</b> instead.'
    )}
    ${warn(L, tr ? ['Basılan karo söner; tekrar basmayın.', 'Yanlış renkteki karoya basmak hata yazdırır.'] : ['A pressed tile goes dark; don’t press it again.', 'Pressing a tile of the wrong colour causes a strike.'])}`;
};
