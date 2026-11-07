import { glyphSvg } from '/shared/glyphs.js';

export default {
  render(v) {
    return `<div class="gl-grid">${v.glyphs
      .map(
        (g, i) =>
          `<button class="gl-btn ${v.pressed.includes(i) ? 'done' : ''}" data-act='{"press":${i}}'><span class="gl-led"></span>${glyphSvg(g)}</button>`
      )
      .join('')}</div>`;
  },
};
