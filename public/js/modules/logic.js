import { GATE_PATH } from '/shared/icons.js';
import { bombText } from '../i18n.js';
import { cbText } from './cb.js';

// Kapıların ve bağlantıların yerleri sabittir; kılavuzdaki şema da aynı düzeni gösterir.
const POS = [
  [80, 46],
  [80, 86],
  [140, 66],
];
const WIRES = 'M24 26H52V40H68M24 66H44V52H68M44 66V80H68M24 106H52V92H68M92 46H112V60H128M92 86H112V72H128M152 66H166';

export default {
  render(v, ctx) {
    const gates = v.gates
      .map((g, i) => {
        const [x, y] = POS[i];
        return `<g class="lg-gate ${g.inverted ? 'inv' : ''}" transform="translate(${x - 12} ${y - 12})">${GATE_PATH[g.shape]}</g>${
          g.inverted ? `<text x="${x}" y="${y + 23}" class="cb-svg lg-cb">${cbText('amber')}</text>` : ''
        }`;
      })
      .join('');
    const inputs = ['A', 'B', 'C'].map((l, i) => `<text x="12" y="${30 + i * 40}" class="lg-in">${l}</text>`).join('');
    const sw = v.inputs
      .map(
        (on, i) =>
          `<div class="lg-swbox"><span>${'ABC'[i]}</span><button class="sw lg-sw ${on ? 'up' : 'down'}" data-act='{"toggle":${i}}' aria-label="${'ABC'[i]}"><span class="sw-knob"></span></button></div>`
      )
      .join('');
    return `
      <svg class="lg-svg" viewBox="0 0 200 124">
        <path d="${WIRES}" class="lg-wire"/>
        ${inputs}
        ${gates}
        <circle cx="179" cy="66" r="11" class="lg-lamp ${v.lamp}"/>
        <text x="179" y="92" class="cb-svg lg-cb">${cbText(v.lamp)}</text>
      </svg>
      <div class="lg-switches">${sw}</div>
      <button class="plate-btn lg-test" data-act='{"test":true}'>${bombText(ctx.lang, 'test')}</button>`;
  },
};
