import { ITEM_PATH } from '/shared/icons.js';
import { SCALE_WEIGHTS } from '/shared/modules/scale.js';
import { bombText } from '../i18n.js';
import { cbText } from './cb.js';

const CX = 100;
const BEAM_Y = 34;
const ARM = 64;

export default {
  render(v, ctx) {
    // Terazi kilitli: sadece yanlış bir tartıdan sonra ağır gelen tarafa eğilir
    const ang = (v.tilt || 0) * -9;
    const dy = Math.sin((ang * Math.PI) / 180) * ARM;
    const n = v.items.length;
    const items = v.items
      .map((it, i) => {
        const x = CX - ARM - (n * 22) / 2 + i * 22 + 11;
        return `<g class="sc-item ${it.copper ? 'copper' : ''}" transform="translate(${x - 10} 52) scale(.84)">${ITEM_PATH[it.kind]}</g>${
          it.copper ? `<text x="${x}" y="86" class="cb-svg sc-cb">${cbText('amber')}</text>` : ''
        }`;
      })
      .join('');
    const picked = SCALE_WEIGHTS.filter((_, i) => v.picked[i]);
    const blocks = picked
      .map((w, i) => {
        const bw = 12 + String(w).length * 5;
        const x = CX + ARM - (picked.length * 19) / 2 + i * 19 + 9.5 - bw / 2;
        return `<rect x="${x}" y="58" width="${bw}" height="16" rx="2" class="sc-block"/><text x="${x + bw / 2}" y="70" class="sc-btxt">${w}</text>`;
      })
      .join('');
    const pan = (x, d, content) =>
      `<g transform="translate(0 ${d.toFixed(1)})"><path d="M${x - 28} 76 Q${x} 92 ${x + 28} 76 Z" class="sc-pan"/><path d="M${x} ${BEAM_Y}L${x - 26} 76M${x} ${BEAM_Y}L${x + 26} 76" class="sc-string"/>${content}</g>`;
    const weights = SCALE_WEIGHTS.map(
      (w, i) => `<button class="sc-w ${v.picked[i] ? 'on' : ''}" data-act='{"toggle":${i}}' aria-pressed="${v.picked[i]}">${w}</button>`
    ).join('');
    return `
      <svg class="sc-svg" viewBox="0 0 200 112">
        <path d="M${CX} ${BEAM_Y} L${CX - 16} 104 H${CX + 16} Z" class="sc-post"/>
        ${pan(CX - ARM, -dy, items)}
        ${pan(CX + ARM, dy, blocks)}
        <g transform="rotate(${ang} ${CX} ${BEAM_Y})"><rect x="${CX - ARM - 6}" y="${BEAM_Y - 3}" width="${ARM * 2 + 12}" height="6" rx="3" class="sc-beam"/></g>
        <circle cx="${CX}" cy="${BEAM_Y}" r="5" class="sc-pin ${v.tilt ? 'bad' : ''}"/>
      </svg>
      <div class="sc-weights">${weights}</div>
      <button class="plate-btn sc-weigh" data-act='{"weigh":true}'>${bombText(ctx.lang, 'weigh')}</button>`;
  },
};
