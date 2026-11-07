import { COLOR_HEX } from '/shared/colors.js';
import { STROOP_WORDS } from '/shared/words.js';
import { cb } from './cb.js';

const INK = { ...COLOR_HEX, yellow: '#d9b100' };

export default {
  render(v, ctx) {
    const words = STROOP_WORDS[ctx.lang] || STROOP_WORDS.tr;
    const stage = [1, 2, 3].map((i) => `<span class="${i < v.stage ? 'on' : ''}"></span>`).join('');
    const buttons = v.fills
      .map(
        (fill, i) =>
          `<button class="st-btn st-${fill}" style="background:${COLOR_HEX[fill]}" data-act='{"press":${i}}'>${words[v.labels[i]]}${cb(fill, 'cb-corner')}</button>`
      )
      .join('');
    return `
      <div class="st-stage">${stage}</div>
      <div class="st-display ${v.background}"><span style="color:${INK[v.ink]}">${words[v.word]}</span>${cb(v.ink, 'cb-corner')}</div>
      <div class="st-grid">${buttons}</div>`;
  },
};
