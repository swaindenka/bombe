import { COLOR_HEX } from '/shared/colors.js';
import { bombText } from '../i18n.js';

// Kadranın dönüşü yumuşak olsun diye bu modül yerinde güncellenir.
export default {
  render(v, ctx) {
    // Rakamlar kadranla birlikte döner ama --rot sayesinde her zaman dik kalır (6 ile 9 karışmasın)
    const nums = Array.from({ length: 10 }, (_, i) => `<span class="sf-n" style="--a:${i * 36}deg">${i}</span>`).join('');
    const leds = [0, 1, 2].map((i) => `<span class="${i < v.entered ? 'on' : ''}"></span>`).join('');
    return `
      <div class="sf-display"><span class="sf-lamp" style="--c:${COLOR_HEX[v.lamp]}"></span><span class="sf-num">${v.number}</span></div>
      <div class="sf-dial-wrap"><div class="sf-pointer"></div><div class="sf-dial" style="--rot:${-v.dial * 36}deg">${nums}<div class="sf-knob"></div></div></div>
      <div class="sf-progress">${leds}</div>
      <button class="plate-btn sf-rot l" data-act='{"rotate":-1}' aria-label="-1">◀</button>
      <button class="plate-btn sf-rot r" data-act='{"rotate":1}' aria-label="+1">▶</button>
      <button class="plate-btn sf-enter" data-act='{"enter":true}'>${bombText(ctx.lang, 'enter')}</button>`;
  },
  update(el, v, prev) {
    const dial = el.querySelector('.sf-dial');
    if (!dial) return false;
    // En kısa yönde dön ve toplam açıyı koru
    let delta = v.dial - prev.dial;
    if (delta > 5) delta -= 10;
    if (delta < -5) delta += 10;
    el._rot = (el._rot ?? -prev.dial * 36) - delta * 36;
    dial.style.setProperty('--rot', `${el._rot}deg`);
    el.querySelectorAll('.sf-progress span').forEach((s, i) => s.classList.toggle('on', i < v.entered));
    return true;
  },
};
