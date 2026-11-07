import { COLOR_HEX } from '/shared/colors.js';

export default {
  render(v) {
    return `<div class="tl-grid">${v.tiles
      .map(
        (c, i) =>
          `<button class="tl ${v.pressed.includes(i) ? 'off' : ''}" style="--c:${COLOR_HEX[c]}" data-act='{"press":${i}}' aria-label="${c}"></button>`
      )
      .join('')}</div>`;
  },
};
