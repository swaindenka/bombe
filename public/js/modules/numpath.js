import { PATH_SIZE } from '/shared/modules/numpath.js';
import { bombText } from '../i18n.js';

export default {
  render(v, ctx) {
    const stage = [1, 2].map((i) => `<span class="${i < v.stage ? 'on' : ''}"></span>`).join('');
    const cells = v.grid
      .map((d, i) => {
        const start = v.start.x === i % PATH_SIZE && v.start.y === Math.floor(i / PATH_SIZE);
        return `<button class="plate-btn np-cell ${start ? 'start' : ''}" data-act='{"press":${i}}'>${d}</button>`;
      })
      .join('');
    return `
      <div class="leds-row np-stage">${stage}</div>
      <div class="lcd np-steps"><small>${bombText(ctx.lang, 'steps')}</small>${v.steps}</div>
      <div class="np-grid">${cells}</div>`;
  },
};
