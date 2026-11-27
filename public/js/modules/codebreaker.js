import { COLOR_HEX } from '/shared/colors.js';
import { CODE_TRIES } from '/shared/modules/codebreaker.js';
import { bombText } from '../i18n.js';
import { cb, cbText } from './cb.js';

const dot = (c) => `<i class="ck-dot" style="background:${COLOR_HEX[c]}"><b class="cb">${cbText(c)}</b></i>`;

export default {
  render(v, ctx) {
    const rows = Array.from({ length: CODE_TRIES }, (_, r) => {
      const h = v.history[r];
      if (!h) return `<div class="ck-row empty">${'<i class="ck-dot"></i>'.repeat(4)}<span class="ck-fb"></span></div>`;
      return `<div class="ck-row">${h.guess.map(dot).join('')}<span class="ck-fb">${'<i class="tri">▲</i>'.repeat(h.tri)}${'<i class="dt">●</i>'.repeat(h.dot)}</span></div>`;
    }).join('');
    const slots = v.guess
      .map(
        (c, i) =>
          `<button class="ck-slot ${c ? '' : 'none'}" style="${c ? `--c:${COLOR_HEX[c]}` : ''}" data-act='{"cycle":${i}}' aria-label="${i + 1}">${c ? cb(c, 'cb-center') : ''}</button>`
      )
      .join('');
    return `
      <div class="ck-screen frame-${v.frame}">${rows}</div>
      <div class="ck-slots">${slots}</div>
      <button class="plate-btn ck-try" data-act='{"try":true}' ${v.guess.includes(null) ? 'disabled' : ''}>${bombText(ctx.lang, 'try')}</button>`;
  },
};
