import { bombText } from '../i18n.js';
import { esc } from '../dom.js';

export default {
  render(v, ctx) {
    const dis = v.active ? '' : 'disabled';
    return `
      <div class="lcd amber rd-call ${v.active ? '' : 'dim'}">${v.active ? esc(v.callsign) : '--'}</div>
      <div class="lcd amber rd-ch"><small>${bombText(ctx.lang, 'channel')}</small>${v.channel}</div>
      <button class="plate-btn rd-tune l" data-act='{"tune":-1}' ${dis}>◀</button>
      <div class="rd-grille"></div>
      <button class="plate-btn rd-tune r" data-act='{"tune":1}' ${dis}>▶</button>
      <button class="plate-btn rd-send" data-act='{"send":true}' ${dis}>📡 ${bombText(ctx.lang, 'send')}</button>`;
  },
};
