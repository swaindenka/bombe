import { COLOR_HEX } from '/shared/colors.js';
import { bombText } from '../i18n.js';

export default {
  render(v, ctx) {
    const sw = v.positions
      .map(
        (up, i) =>
          `<button class="sw ${up ? 'up' : 'down'}" data-act='{"toggle":${i}}' aria-label="switch ${i + 1}"><span class="sw-knob"></span></button>`
      )
      .join('');
    return `
      <div class="sw-lamp" style="--c:${COLOR_HEX[v.lamp]}"></div>
      <div class="sw-row">${sw}</div>
      <button class="plate-btn sw-submit" data-act='{"submit":true}'>${bombText(ctx.lang, 'submit')}</button>`;
  },
};
