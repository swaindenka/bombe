import { cb } from './cb.js';

const ROWS = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
];

export default {
  render(v) {
    const call = (f) => v.calls.find((c) => c.floor === f && !c.served);
    const buttons = ROWS.flat()
      .map((f) => {
        const c = call(f);
        const lamp = c ? (c.red ? 'red' : 'white') : '';
        return `<button class="plate-btn el-btn ${f === v.floor ? 'here' : ''}" data-act='{"press":${f}}'><i class="el-lamp ${lamp}"></i>${c?.red ? cb('red', 'el-cb') : ''}${f}</button>`;
      })
      .join('');
    return `
      <div class="lcd amber el-display"><span class="el-floor">${v.floor}</span><span class="el-dir">${v.dir === 'up' ? '▲' : '▼'}</span></div>
      <div class="el-grid">${buttons}</div>`;
  },
};
