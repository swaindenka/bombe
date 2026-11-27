import { COLOR_HEX } from '/shared/colors.js';
import { NONO } from '/shared/modules/nonogram.js';
import { bombText } from '../i18n.js';
import { cb } from './cb.js';

const clue = (c) => (c.length ? c : [0]);

export default {
  render(v, ctx) {
    const cols = v.clues.cols.map((c) => `<div class="nn-col">${clue(c).map((n) => `<span>${n}</span>`).join('')}</div>`).join('');
    const rows = v.clues.rows.map((r) => `<div class="nn-rowclue">${clue(r).join(' ')}</div>`).join('');
    const cells = v.cells.map((on, i) => `<button class="nn-cell ${on ? 'on' : ''}" data-act='{"toggle":${i}}' aria-label="${i + 1}"></button>`).join('');
    return `
      <div class="nn-lamp" style="--c:${COLOR_HEX[v.lamp]}">${cb(v.lamp, 'cb-center')}</div>
      <div class="nn-cols" style="--n:${NONO}">${cols}</div>
      <div class="nn-rows">${rows}</div>
      <div class="nn-grid" style="--n:${NONO}">${cells}</div>
      <button class="plate-btn nn-submit" data-act='{"submit":true}'>${bombText(ctx.lang, 'submit')}</button>`;
  },
  /** Kareler yerinde güncellenir */
  update(el, v) {
    const cells = el.querySelectorAll('.nn-cell');
    if (cells.length !== v.cells.length) return false;
    cells.forEach((c, i) => c.classList.toggle('on', !!v.cells[i]));
    return true;
  },
};
