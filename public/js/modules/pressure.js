import { bombText } from '../i18n.js';

export default {
  render(v, ctx) {
    const zone = v.zone ? `<i class="pr-zone" style="bottom:${v.zone[0]}%;height:${v.zone[1] - v.zone[0]}%"></i>` : '';
    return `
      <div class="pr-tube">${zone}<i class="pr-fill"></i><span class="pr-marks"></span></div>
      <div class="lcd pr-read">0</div>
      <button class="pr-vent" data-act='{"vent":true}' ${v.active ? '' : 'disabled'}><span>${bombText(ctx.lang, 'vent')}</span></button>`;
  },
  /** Her karede basınç seviyesini çizer (sunucu süresiyle aynı formül) */
  frame(el, v, remainingMs) {
    const fill = el.querySelector('.pr-fill');
    const read = el.querySelector('.pr-read');
    if (!fill) return;
    const p = v.active && remainingMs !== null ? Math.min(100, Math.max(0, (1 - remainingMs / v.durationMs) * 100)) : 0;
    fill.style.height = p + '%';
    const inZone = v.zone && p >= v.zone[0] && p <= v.zone[1];
    fill.classList.toggle('ok', !!inZone);
    if (read) read.textContent = Math.floor(p);
  },
};
