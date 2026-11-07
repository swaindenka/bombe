const SIZE = 6;

export default {
  render(v) {
    const leds = v.leds.map((on) => `<span class="${on ? 'on' : ''}"></span>`).join('');
    let cells = '';
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const me = v.pos.x === x && v.pos.y === y;
        const goal = v.goal.x === x && v.goal.y === y;
        cells += `<span class="mz-cell">${goal ? '<i class="mz-goal"></i>' : ''}${me ? '<i class="mz-me"></i>' : ''}</span>`;
      }
    }
    const arrow = (d, cls, ch) => `<button class="mz-arrow ${cls}" data-act='{"move":"${d}"}' aria-label="${d}">${ch}</button>`;
    return `
      <div class="mz-leds">${leds}</div>
      <div class="mz-grid">${cells}</div>
      ${arrow('N', 'up', '▲')}${arrow('S', 'down', '▼')}${arrow('W', 'left', '◀')}${arrow('E', 'right', '▶')}`;
  },
};
