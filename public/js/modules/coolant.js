export default {
  render(v) {
    return `
      <div class="lcd cl-code ${v.active ? '' : 'dim'}">${v.active ? v.code : '---'}</div>
      <div class="cl-buttons">${['A', 'B', 'C']
        .map((b) => `<button class="plate-btn" data-act='{"press":"${b}"}' ${v.active ? '' : 'disabled'}>${b}</button>`)
        .join('')}</div>`;
  },
};
