import { COLOR_HEX } from '/shared/colors.js';
import { esc } from '../dom.js';
import { cb } from './cb.js';

export default {
  render(v) {
    const opts = v.active
      ? v.options.map((o, i) => `<button class="plate-btn vf-opt" data-act='{"press":${i}}'>${esc(o)}</button>`).join('')
      : [0, 1, 2].map(() => '<button class="plate-btn vf-opt" disabled>&nbsp;</button>').join('');
    return `
      <div class="lcd vf-screen ${v.active ? '' : 'dim'}">
        <span class="vf-lamp" style="--c:${v.active ? COLOR_HEX[v.lamp] : '#1d2a22'}"></span>${v.active ? cb(v.lamp) : ''}
        <span class="vf-num">${v.active ? esc(v.number) : '--'}</span>
      </div>
      <div class="vf-opts">${opts}</div>`;
  },
};
