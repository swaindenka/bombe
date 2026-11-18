import { PANEL_PATH } from '/shared/icons.js';
import { bombText } from '../i18n.js';

export default {
  render(v, ctx) {
    const cells = v.cells
      .map((on, i) => `<button class="lp-cell ${on ? 'on' : ''}" data-act='{"press":${i}}' aria-label="${i + 1}" aria-pressed="${!!on}"></button>`)
      .join('');
    return `
      <div class="lp-symbol"><svg viewBox="0 0 24 24" aria-hidden="true">${PANEL_PATH[v.symbol]}</svg></div>
      <div class="lp-grid">${cells}</div>
      <button class="plate-btn lp-submit" data-act='{"submit":true}'>${bombText(ctx.lang, 'submit')}</button>`;
  },
  /** Lambalar yerinde güncellenir: her basışta modül baştan çizilmesin */
  update(el, v) {
    const cells = el.querySelectorAll('.lp-cell');
    if (cells.length !== 9) return false;
    cells.forEach((c, i) => {
      c.classList.toggle('on', !!v.cells[i]);
      c.setAttribute('aria-pressed', String(!!v.cells[i]));
    });
    return true;
  },
};
