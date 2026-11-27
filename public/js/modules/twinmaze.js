import { TWIN_SIZE } from '/shared/modules/twinmaze.js';
import { bombText } from '../i18n.js';
import { esc } from '../dom.js';

function grid(id, pos, goal, side) {
  let cells = '';
  for (let y = 0; y < TWIN_SIZE; y++) {
    for (let x = 0; x < TWIN_SIZE; x++) {
      const me = pos.x === x && pos.y === y;
      const g = goal.x === x && goal.y === y;
      cells += `<span class="mz-cell">${g ? '<i class="mz-goal"></i>' : ''}${me ? '<i class="mz-me"></i>' : ''}</span>`;
    }
  }
  return `<div class="tw-id ${side} lcd amber">${esc(id)}</div><div class="tw-grid ${side}">${cells}</div>`;
}

export default {
  render(v, ctx) {
    const arrow = (d, ch) => `<button class="plate-btn tw-arrow" data-act='{"move":"${d}"}' aria-label="${d}">${ch}</button>`;
    return `
      ${grid(v.ids[0], v.pos[0], v.goal[0], 'l')}${grid(v.ids[1], v.pos[1], v.goal[1], 'r')}
      <div class="lcd tw-moves ${v.limit - v.moves <= 2 ? 'warn' : ''}"><small>${bombText(ctx.lang, 'moves')}</small>${v.moves}/${v.limit}</div>
      <div class="tw-arrows">${arrow('W', '◀')}${arrow('N', '▲')}${arrow('S', '▼')}${arrow('E', '▶')}</div>`;
  },
};
