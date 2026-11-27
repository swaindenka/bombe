import { BAND_HEX } from '/shared/modules/circuit.js';
import { esc } from '../dom.js';
import { getLang } from '../i18n.js';

// Renk körü kısaltmaları (yalnızca renk körü modunda görünür)
const CB = {
  tr: { black: 'SI', brown: 'KA', red: 'KI', orange: 'TU', yellow: 'SA', green: 'YE', blue: 'MA', violet: 'MO', grey: 'GR', white: 'BE' },
  en: { black: 'BK', brown: 'BR', red: 'RD', orange: 'OR', yellow: 'YE', green: 'GN', blue: 'BL', violet: 'VI', grey: 'GY', white: 'WH' },
};

/** Yatay direnç: sol uçta toplanmış üç bant, üstünde adı */
function resistor(x, y, bands, label) {
  const cb = CB[getLang()] || CB.tr;
  const b = bands.map((c, i) => `<rect x="${x + 7 + i * 8}" y="${y - 8}" width="5" height="16" fill="${BAND_HEX[c]}" class="ci-band"/>`).join('');
  return `<path d="M${x - 8} ${y}H${x}M${x + 46} ${y}H${x + 54}" class="ci-wire"/>
    <rect x="${x}" y="${y - 8}" width="46" height="16" rx="7" class="ci-body"/>${b}
    <text x="${x + 23}" y="${y - 11}" class="ci-label">${label}</text>
    <text x="${x + 23}" y="${y + 17}" class="cb-svg ci-cb">${bands.map((c) => cb[c]).join('·')}</text>`;
}

/** Devre çizimi (bomba ve kılavuz aynı çizimi kullanır) */
export function circuitSvg(v) {
    const [b1, b2, b3] = v.bands;
    const battery = `<path d="M14 44H30M18 50H26M14 56H30M18 62H26" class="ci-cell"/><text x="22" y="38" class="ci-plus">+</text><text x="22" y="80" class="ci-volt">${v.volts}V</text>`;
    let body;
    if (v.topo === 'sp') {
      // R1 seri; R2 ile R3 paralel
      body = `<path d="M22 44V24H34M88 24H104M104 24V60H112M104 24H112M166 24H178V96H22V62M166 60H178" class="ci-wire"/>
        ${resistor(42, 24, b1, 'R1')}${resistor(112, 24, b2, 'R2')}${resistor(112, 60, b3, 'R3')}`;
    } else {
      // R1 ile R2 seri; bu ikisine R3 paralel
      body = `<path d="M22 44V24H34M88 24H96M150 24H178V96H22V62M34 24V60H70M124 60H178" class="ci-wire"/>
        ${resistor(42, 24, b1, 'R1')}${resistor(104, 24, b2, 'R2')}${resistor(78, 60, b3, 'R3')}`;
    }
    return `<svg class="ci-svg" viewBox="0 0 192 104">${body}${battery}</svg>`;
}

export default {
  render(v) {
    const buttons = v.options.map((o, i) => `<button class="plate-btn ci-opt" data-act='{"press":${i}}'>${esc(String(o))}<small>mA</small></button>`).join('');
    return `${circuitSvg(v)}<div class="ci-grid">${buttons}</div>`;
  },
};
