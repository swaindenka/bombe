import { COLOR_HEX } from '/shared/colors.js';
import { esc } from '../dom.js';
import { cbText } from './cb.js';
import { gearRadius as rad, GEAR_BELT_GAP } from '/shared/modules/gears.js';

function gearPath(cx, cy, teeth) {
  const r = rad(teeth);
  const step = (Math.PI * 2) / teeth;
  const pts = [];
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    for (const [f, rr] of [
      [0, r - 3],
      [0.18, r],
      [0.45, r],
      [0.63, r - 3],
    ])
      pts.push(`${(cx + Math.cos(a + step * f) * rr).toFixed(1)} ${(cy + Math.sin(a + step * f) * rr).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Dişlilerin yerleşimi: hepsi aynı hizada; değenler iç içe geçer, kayışlıların arasında boşluk kalır */
export function gearLayout(teeth, links) {
  const out = [];
  teeth.forEach((t, i) => {
    const r = rad(t);
    if (!i) return out.push({ x: 0, y: 0, r, t });
    const p = out[i - 1];
    out.push({ x: p.x + (links[i - 1] === 'mesh' ? p.r + r - 2.5 : p.r + r + GEAR_BELT_GAP), y: 0, r, t });
  });
  return out;
}

function belt(a, b, crossed) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const s = crossed ? -1 : 1;
  const p = (c, k, r) => `${(c.x + nx * r * k).toFixed(1)} ${(c.y + ny * r * k).toFixed(1)}`;
  return `<path d="M${p(a, 1, a.r - 1)}L${p(b, s, b.r - 1)}M${p(a, -1, a.r - 1)}L${p(b, -s, b.r - 1)}" class="gr-belt"/>`;
}

export default {
  render(v) {
    const g = gearLayout(v.teeth, v.links);
    const m = { x: g[0].x - g[0].r - 15, y: g[0].y };
    const minX = m.x - 14;
    const maxX = Math.max(...g.map((c) => c.x + c.r)) + 4;
    const minY = Math.min(...g.map((c) => c.y - c.r), m.y - 14) - 4;
    const maxY = Math.max(...g.map((c) => c.y + c.r), m.y + 14) + 4;
    const belts = v.links.map((l, i) => (l === 'mesh' ? '' : belt(g[i], g[i + 1], l === 'cross'))).join('');
    const gears = g
      .map(
        (c, i) =>
          `<path d="${gearPath(c.x, c.y, c.t)}" class="gr-gear ${i === 0 ? 'first' : ''}"/><circle cx="${c.x}" cy="${c.y}" r="${Math.max(7.5, (c.r - 3) * 0.72)}" class="gr-hub"/><text x="${c.x}" y="${c.y + 3.8}" class="gr-num">${c.t}</text>`
      )
      .join('');
    const motor = `<path d="M${m.x + 12} ${m.y}H${g[0].x}" class="gr-shaft"/><rect x="${m.x - 12}" y="${m.y - 12}" width="24" height="24" rx="4" class="gr-motor"/><circle cx="${m.x}" cy="${m.y}" r="7" fill="${COLOR_HEX[v.motor]}" class="gr-lamp"/><text x="${m.x}" y="${m.y + 2.5}" class="cb-svg gr-cb">${cbText(v.motor)}</text>`;
    const buttons = v.options
      .map((o, i) => `<button class="plate-btn gr-opt" data-act='{"press":${i}}'><span>${o.dir === 'cw' ? '↻' : '↺'}</span>${esc(String(o.rpm))}</button>`)
      .join('');
    return `
      <svg class="gr-svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}" preserveAspectRatio="xMidYMid meet">${belts}${motor}${gears}</svg>
      <div class="gr-grid">${buttons}</div>`;
  },
};
