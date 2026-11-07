import { esc } from '../dom.js';

export default {
  render(v) {
    const opts = v.active
      ? v.options.map((o, i) => `<button class="plate-btn pp-opt" data-act='{"press":${i}}'>${esc(o)}</button>`).join('')
      : [0, 1, 2].map(() => '<button class="plate-btn pp-opt" disabled>&nbsp;</button>').join('');
    return `
      <div class="lcd pp-word ${v.active ? '' : 'dim'}">${v.active ? esc(v.challenge) : '· · ·'}</div>
      <div class="pp-opts">${opts}</div>`;
  },
};
