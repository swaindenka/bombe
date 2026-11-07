// GLİFLER modülünde kullanılan 24 özgün sembol (SVG, 100x100) ve her birinin kılavuzdaki değeri.

const G = [
  // 0 halka ve nokta
  '<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="6" class="f"/>',
  // 1 üç dişli çatal
  '<path d="M50 88V18M28 22v18q0 16 22 16q22 0 22-16V22"/>',
  // 2 kum saati
  '<path d="M28 16h44L28 84h44Z"/>',
  // 3 göz
  '<path d="M10 50Q50 12 90 50Q50 88 10 50Z"/><circle cx="50" cy="50" r="11"/>',
  // 4 anahtar
  '<circle cx="28" cy="50" r="14"/><path d="M42 50h46M74 50v16M86 50v11"/>',
  // 5 sarmal
  '<path d="M45 50a5 5 0 0 1 10 0a10 10 0 0 1-20 0a15 15 0 0 1 30 0a20 20 0 0 1-40 0a25 25 0 0 1 50 0"/>',
  // 6 şimşek
  '<path d="M60 10L30 54h20l-8 36l30-46H52z"/>',
  // 7 hilal ve nokta
  '<path d="M60 14a36 36 0 1 0 0 72a28 28 0 1 1 0-72z"/><circle cx="76" cy="50" r="6" class="f"/>',
  // 8 testere
  '<path d="M10 70L28 30L46 70L64 30L82 70L92 50"/>',
  // 9 nişangah
  '<circle cx="50" cy="50" r="27"/><path d="M50 10v80M10 50h80"/>',
  // 10 merdiven
  '<path d="M34 10v80M66 10v80M34 28h32M34 50h32M34 72h32"/>',
  // 11 çengelli ok
  '<path d="M70 88V42a20 20 0 0 0-40 0v12M18 44l12 14l12-14"/>',
  // 12 çizgili üçgen
  '<path d="M50 14L88 82H12Z"/><path d="M6 60h88"/>',
  // 13 çift dalga
  '<path d="M8 36q10-16 21 0t21 0t21 0t21 0M8 66q10-16 21 0t21 0t21 0t21 0"/>',
  // 14 çapa
  '<circle cx="50" cy="17" r="7"/><path d="M50 24v62M34 36h32M18 62q0 24 32 24q32 0 32-24"/>',
  // 15 kare ızgara
  '<path d="M40 12L32 88M68 12L60 88M14 36h76M10 64h76"/>',
  // 16 kıvrım
  '<path d="M18 82V18h64v64H34V34h32v32H50"/>',
  // 17 balık
  '<path d="M14 50Q40 20 68 50Q40 80 14 50ZM68 50l20-16v32z"/><circle cx="32" cy="46" r="4" class="f"/>',
  // 18 güneş
  '<circle cx="50" cy="50" r="15"/><path d="M50 10v15M50 75v15M10 50h15M75 50h15M22 22l10 10M68 68l10 10M78 22L68 32M32 68L22 78"/>',
  // 19 çarpılı elmas
  '<path d="M50 10L88 50L50 90L12 50Z"/><path d="M31 31l38 38M69 31L31 69"/>',
  // 20 sonsuzluk
  '<path d="M50 50C40 32 12 30 12 50S40 68 50 50S78 30 88 50S60 68 50 50"/>',
  // 21 tarak
  '<path d="M12 28h76M20 28v44M35 28v32M50 28v44M65 28v32M80 28v44"/>',
  // 22 alev
  '<path d="M50 10C66 34 76 48 76 62a26 26 0 0 1-52 0C24 48 34 34 50 10Z"/><path d="M50 52c6 8 9 13 9 18a9 9 0 0 1-18 0c0-5 3-10 9-18z"/>',
  // 23 kapı ve nokta
  '<path d="M22 88V32h56v56M22 32l-9-14M78 32l9-14"/><circle cx="50" cy="62" r="7" class="f"/>',
];

export const GLYPH_VALUES = [17, 4, 22, 9, 13, 1, 20, 6, 15, 11, 3, 24, 8, 19, 2, 14, 21, 7, 12, 23, 5, 18, 10, 16];

export const GLYPH_COUNT = G.length;

export function glyphSvg(id, extraClass = '') {
  return `<svg class="glyph ${extraClass}" viewBox="0 0 100 100" aria-hidden="true"><g>${G[id]}</g></svg>`;
}
