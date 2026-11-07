import { RHYTHM_TIMING } from '/shared/modules/rhythm.js';
import { bombText } from '../i18n.js';

/** Desenden yanık/sönük zaman dilimleri: [{on, dur}] */
function schedule(pattern) {
  const out = [];
  for (const b of pattern) {
    out.push({ on: true, dur: b === 'L' ? RHYTHM_TIMING.long : RHYTHM_TIMING.short });
    out.push({ on: false, dur: RHYTHM_TIMING.gap });
  }
  out[out.length - 1].dur = RHYTHM_TIMING.pause;
  return out;
}

export default {
  render(v, ctx) {
    return `
      <div class="rh-housing"><div class="rh-lamp ${v.lamp}"></div></div>
      <button class="plate-btn rh-press" data-act='{"press":true}'>${bombText(ctx.lang, 'press')}</button>`;
  },
  mount(el, v) {
    const slots = schedule(v.pattern);
    const cycle = slots.reduce((a, s) => a + s.dur, 0);
    const t0 = performance.now() - (cycle - RHYTHM_TIMING.pause); // önce kısa bir duraklama
    let raf;
    const loop = () => {
      const lamp = el.querySelector('.rh-lamp');
      if (lamp) {
        let t = (performance.now() - t0) % cycle;
        let on = false;
        for (const s of slots) {
          if (t < s.dur) {
            on = s.on;
            break;
          }
          t -= s.dur;
        }
        lamp.classList.toggle('on', on);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  },
};
