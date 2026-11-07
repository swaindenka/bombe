import { COLOR_HEX } from '/shared/colors.js';
import { cbText } from './cb.js';

const OUTLINE = { black: '#8a8f96', white: '#3a3d42' };

export default {
  render(v, ctx) {
    const n = v.wires.length;
    const top = 40;
    const bottom = 170;
    const step = n > 1 ? (bottom - top) / (n - 1) : 0;
    const seed = [...ctx.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    let terminals = '';
    let wires = '';
    v.wires.forEach((w, i) => {
      const y = Math.round(top + i * step);
      const d1 = ((seed * 31 + i * 17) % 23) - 11;
      const d2 = ((seed * 13 + i * 29) % 23) - 11;
      const d = `M34 ${y} C 82 ${y + d1}, 118 ${y + d2}, 166 ${y}`;
      terminals += `<rect x="16" y="${y - 7}" width="20" height="14" rx="3" class="term"/><rect x="164" y="${y - 7}" width="20" height="14" rx="3" class="term"/><text x="26" y="${y + 3}" class="cb-svg">${cbText(w.color)}</text>`;
      const dash = w.cut ? ' pathLength="100" stroke-dasharray="41 18 41"' : '';
      wires += `<g class="wire-g ${w.cut ? 'is-cut' : ''}">`;
      wires += `<path d="${d}" class="wire-outline" stroke="${OUTLINE[w.color] || '#0d0e10'}"${dash}/>`;
      wires += `<path d="${d}" class="wire" stroke="${COLOR_HEX[w.color]}"${dash}/>`;
      if (!w.cut) wires += `<path d="${d}" class="wire-hit" data-act='{"cut":${i}}'/>`;
      wires += '</g>';
    });
    return `<svg viewBox="0 0 200 200" class="wires-svg">${terminals}${wires}</svg>`;
  },
};
