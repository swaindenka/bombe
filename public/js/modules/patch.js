import { COLOR_HEX } from '/shared/colors.js';
import { bombText } from '../i18n.js';
import { cb } from './cb.js';

const ROWS = [34, 70, 106, 142];
const SHAPES = {
  circle: '<circle cx="12" cy="12" r="8"/>',
  square: '<rect x="4.5" y="4.5" width="15" height="15"/>',
  triangle: '<path d="M12 3.5 L21 20 H3 Z"/>',
  star: '<path d="M12 2.5 l2.8 6.2 6.7.6-5.1 4.4 1.6 6.6L12 16.8l-6 3.5 1.6-6.6L2.5 9.3l6.7-.6z"/>',
};

export default {
  render(v, ctx) {
    const cables = v.links
      .map((k, p) => {
        if (k === null) return '';
        const y1 = ROWS[p] + 14;
        const y2 = ROWS[k] + 14;
        return `<path d="M46 ${y1} C 100 ${y1 + 18}, 100 ${y2 + 18}, 154 ${y2}" stroke="${COLOR_HEX[v.plugs[p]]}" class="pt-cable"/>`;
      })
      .join('');
    const plugs = v.plugs
      .map(
        (c, p) =>
          `<button class="pt-plug ${v.links[p] !== null ? 'linked' : ''}" style="top:${ROWS[p]}px;--c:${COLOR_HEX[c]}" data-local="plug:${p}" aria-label="${c}"><i></i>${cb(c)}</button>`
      )
      .join('');
    const sockets = v.sockets
      .map(
        (s, k) =>
          `<button class="pt-sock" style="top:${ROWS[k]}px" data-local="sock:${k}" aria-label="${s}"><svg viewBox="0 0 24 24">${SHAPES[s]}</svg></button>`
      )
      .join('');
    return `
      <svg class="pt-wires" viewBox="0 0 200 200">${cables}</svg>
      ${plugs}${sockets}
      <button class="plate-btn pt-test" data-act='{"test":true}'>${bombText(ctx.lang, 'test')}</button>`;
  },
  mount(el) {
    el._sel = null;
    return () => {};
  },
  /** Fiş seçimi yerel tutulur; prize tıklanınca bağlantı sunucuya gider */
  local(el, key, send) {
    const [kind, n] = key.split(':');
    const i = Number(n);
    const mark = () => el.querySelectorAll('.pt-plug').forEach((b, k) => b.classList.toggle('sel', k === el._sel));
    if (kind === 'plug') {
      if (el._sel === i) {
        el._sel = null;
        if (el.querySelectorAll('.pt-plug')[i]?.classList.contains('linked')) send({ unplug: i });
      } else el._sel = i;
      mark();
      return 'select';
    }
    if (kind === 'sock' && el._sel !== null) {
      send({ connect: [el._sel, i] });
      el._sel = null;
      mark();
      return 'plug';
    }
    return null;
  },
};
