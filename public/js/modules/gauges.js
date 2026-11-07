const ROWS = [26, 82, 138];
const CX = 55;
const CY = 47;

function gaugeSvg(value) {
  let ticks = '';
  for (let i = 0; i <= 9; i++) {
    const a = Math.PI - (i * Math.PI) / 9;
    // Ölçek çizgileri içeride, rakamlar dışarıda; ibre rakamların üzerinden geçmez
    const x1 = CX + Math.cos(a) * 25;
    const y1 = CY - Math.sin(a) * 25;
    const x2 = CX + Math.cos(a) * 31;
    const y2 = CY - Math.sin(a) * 31;
    const tx = CX + Math.cos(a) * 40;
    const ty = CY - Math.sin(a) * 40 + 4;
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}">${i}</text>`;
  }
  const a = Math.PI - (value * Math.PI) / 9;
  const nx = CX + Math.cos(a) * 30;
  const ny = CY - Math.sin(a) * 30;
  return `<svg class="gg-dial" viewBox="0 0 110 54">
    <path d="M24 ${CY} A31 31 0 0 1 86 ${CY}" class="gg-rim"/>
    <g class="gg-ticks">${ticks}</g>
    <line x1="${CX}" y1="${CY}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" class="gg-needle"/>
    <circle cx="${CX}" cy="${CY}" r="4.5" class="gg-hub"/>
  </svg>`;
}

export default {
  render(v) {
    const stage = [1, 2].map((i) => `<span class="${i < v.stage ? 'on' : ''}"></span>`).join('');
    const rows = v.values
      .map(
        (val, i) => `
        <div class="gg-row" style="top:${ROWS[i]}px">
          <div class="gg-face">${gaugeSvg(val)}</div>
          <button class="gg-valve" data-act='{"press":${i}}'><span>${['I', 'II', 'III'][i]}</span></button>
        </div>`
      )
      .join('');
    return `<div class="leds-row gg-stage">${stage}</div>${rows}`;
  },
};
