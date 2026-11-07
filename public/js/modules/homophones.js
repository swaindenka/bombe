import { esc } from '../dom.js';

export default {
  render(v) {
    const stage = [1, 2, 3].map((i) => `<span class="${i < v.stage ? 'on' : ''}"></span>`).join('');
    return `
      <div class="leds-row hp-stage">${stage}</div>
      <div class="hp-display">${esc(v.display)}</div>
      <div class="hp-grid">${v.buttons.map((w, i) => `<button class="plate-btn" data-act='{"press":${i}}'>${esc(w)}</button>`).join('')}</div>`;
  },
};
