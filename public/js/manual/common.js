import { COLOR_HEX, colorName } from '/shared/colors.js';

export const swatch = (c, L) =>
  `<span class="swatch"><i style="background:${COLOR_HEX[c]}"></i>${colorName(L, c)}</span>`;

export const cap = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

export const ident = (L, text) =>
  `<p class="ident"><b>${L === 'tr' ? 'Tanıma' : 'How to recognize'}:</b> ${text}</p>`;

export const note = (html) => `<div class="note">${html}</div>`;
