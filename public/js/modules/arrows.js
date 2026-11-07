import { COLOR_HEX } from '/shared/colors.js';
import { cb } from './cb.js';

const ROT = { N: 0, E: 90, S: 180, W: 270 };

export default {
  render(v) {
    const stage = [1, 2, 3, 4].map((i) => `<span class="${i < v.stage ? 'on' : ''}"></span>`).join('');
    const btn = (d, cls, ch) => `<button class="plate-btn ar-btn ${cls}" data-act='{"press":"${d}"}' aria-label="${d}">${ch}</button>`;
    return `
      <div class="leds-row ar-stage">${stage}</div>
      <div class="ar-display">
        <svg viewBox="0 0 100 100" style="transform: rotate(${ROT[v.dir]}deg)"><path d="M50 10 L84 50 H63 V90 H37 V50 H16 Z" fill="${COLOR_HEX[v.color]}" stroke="#0c0c0c" stroke-width="4" stroke-linejoin="round"/></svg>
        ${cb(v.color, 'cb-center')}
      </div>
      ${btn('N', 'n', '▲')}${btn('E', 'e', '▶')}${btn('S', 's', '▼')}${btn('W', 'w', '◀')}`;
  },
};
