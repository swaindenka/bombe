import { esc } from '../dom.js';

export default {
  render(v) {
    const letters = v.code
      .split('')
      .map((c) => `<span>${esc(c)}</span>`)
      .join('');
    return `
      <div class="lcd cp-code">${letters}</div>
      <div class="cp-grid">${v.options.map((w, i) => `<button class="plate-btn" data-act='{"press":${i}}'>${esc(w)}</button>`).join('')}</div>`;
  },
};
