import { TILE_TABLE, TILE_COLORS } from '/shared/modules/tiles.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const rows = TILE_COLORS.map(
    (c) => `<tr><td class="nowrap">${swatch(c, L)}</td>${TILE_TABLE[c].map((x) => `<td class="nowrap">${swatch(x, L)}</td>`).join('')}</tr>`
  ).join('');
  return `
    ${ident(L, tr ? '3×3 dizili dokuz renkli karo.' : 'Nine coloured tiles in a 3×3 grid.')}
    ${needs(L, 'tiles')}
    ${steps(
      tr
        ? [
            `En çok karosu olan renk ${mark('baskın renktir')}. Eşitlikte öncelik: kırmızı, mavi, yeşil, sarı.`,
            'Tabloda baskın rengin satırı ile pil sütununun kesiştiği renk <b>basılacak renktir</b>.',
            `O renkteki ${mark('bütün karolara')} bastırın (sıra önemsiz). Modülde o renk ${mark('hiç yoksa')} baskın rengin bütün karolarına bastırın.`,
          ]
        : [
            `The colour with the most tiles is ${mark('dominant')}. On a tie: red, then blue, green, yellow.`,
            'Where the dominant colour’s row meets the battery column is the <b>colour to press</b>.',
            `Press ${mark('every tile')} of that colour (any order). If the module has ${mark('none')} of it, press every tile of the dominant colour instead.`,
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Baskın renk' : 'Dominant'}</th><th>${tr ? '0–1 pil' : '0–1 batteries'}</th><th>${tr ? '2–3 pil' : '2–3 batteries'}</th><th>${tr ? '4+ pil' : '4+ batteries'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? '3 kırmızı, 3 mavi, 2 yeşil, 1 sarı; <b>2 pil</b>. Kırmızı ile mavi eşit → baskın <b>kırmızı</b> → 2–3 pil sütunu → <b>sarı</b>. Tek sarı karoya basılır.'
        : '3 red, 3 blue, 2 green, 1 yellow; <b>2 batteries</b>. Red ties with blue → dominant is <b>red</b> → 2–3 column → <b>yellow</b>. Press the single yellow tile.'
    )}
    ${warn(L, tr ? ['Yanlış renkteki karoya basmak hata yazdırır.'] : ['Pressing a tile of the wrong colour causes a strike.'])}`;
};
