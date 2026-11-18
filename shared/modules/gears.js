// DİŞLİ KUTUSU: Soldaki motor en soldaki dişliyi çevirir; dişliler birbirine ya dişleriyle değerek
// ya da düz/çapraz kayışla bağlıdır. Uzman en sağdaki dişlinin YÖNÜNÜ ve HIZINI (devir/dakika) bulur,
// imhacı ikisini birlikte yazan düğmeye basar.
// - Motor hızı lambanın rengine bağlıdır. Motor saat yönünde döner; seri numarasında sesli harf varsa tersine.
// - Değen dişliler zıt yöne, düz kayışla bağlılar aynı yöne, çapraz kayışla bağlılar zıt yöne döner.
// - Bağlı iki dişlide hız × diş sayısı eşittir.

import { serialHasVowel } from '../edgework.js';

export const MOTOR_RPM = { red: 60, blue: 40, green: 30, yellow: 90 };
export const MOTOR_COLORS = Object.keys(MOTOR_RPM);
export const GEAR_TEETH = [8, 10, 12, 15, 16, 20, 24, 30];
export const LINK_TYPES = ['mesh', 'belt', 'cross']; // değiyor · düz kayış · çapraz kayış

// Çizim ölçüleri (bomba ile aynı): diş sayısı arttıkça dişli büyür
export const gearRadius = (t) => 7 + t * 0.25;
export const GEAR_BELT_GAP = 14;
export const GEAR_MAX_SPAN = 170; // motor dahil; bunu aşan dizilim modüle sığmaz, okunmaz olur

/** Motor dahil, dişli zincirinin toplam genişliği */
export function gearSpan(teeth, links) {
  let w = 30 + gearRadius(teeth[0]) * 2;
  for (let i = 1; i < teeth.length; i++) {
    const b = gearRadius(teeth[i]);
    w += (links[i - 1] === 'mesh' ? -2.5 : GEAR_BELT_GAP) + b * 2;
  }
  return w;
}

/** Bir bağlantı yönü çevirir mi? */
export const linkFlips = (link) => link !== 'belt';

export function motorDir(e) {
  return serialHasVowel(e) ? 'ccw' : 'cw';
}

/** En sağdaki dişlinin yönü ve hızı */
export function gearAnswer(st, e) {
  const flips = st.links.filter(linkFlips).length;
  const m = motorDir(e);
  const dir = flips % 2 ? (m === 'cw' ? 'ccw' : 'cw') : m;
  const rpm = (MOTOR_RPM[st.motor] * st.teeth[0]) / st.teeth[st.teeth.length - 1];
  return { dir, rpm };
}

const other = (d) => (d === 'cw' ? 'ccw' : 'cw');

export default {
  type: 'gears',
  needy: false,
  generate(rng, e) {
    for (;;) {
      const n = rng.pick([3, 4, 4]);
      const teeth = Array.from({ length: n }, () => rng.pick(GEAR_TEETH));
      const links = Array.from({ length: n - 1 }, () => rng.pick(['mesh', 'mesh', 'belt', 'cross']));
      if (gearSpan(teeth, links) > GEAR_MAX_SPAN) continue;
      const motor = rng.pick(MOTOR_COLORS);
      const st = { motor, teeth, links };
      const { dir, rpm } = gearAnswer(st, e);
      const base = MOTOR_RPM[motor];
      // Hız tam sayı olsun ve oran gerçekten önemli olsun (motor hızıyla aynı çıkmasın)
      if (!Number.isInteger(rpm) || rpm === base || rpm > 400) continue;
      // Yanlış hızlar: ters oran, motor hızı, yalnızca ilk çiftin oranı (sık yapılan hatalar)
      const wrongs = [(base * teeth[n - 1]) / teeth[0], base, (base * teeth[0]) / teeth[1], rpm * 2, Math.round(rpm / 2)].filter(
        (w) => Number.isInteger(w) && w > 0 && w !== rpm && w <= 400
      );
      if (!wrongs.length) continue;
      const wrong = rng.pick(wrongs);
      const options = rng.shuffle([
        { dir, rpm },
        { dir: other(dir), rpm },
        { dir, rpm: wrong },
        { dir: other(dir), rpm: wrong },
      ]);
      return { ...st, options };
    }
  },
  view(s) {
    return { motor: s.motor, teeth: s.teeth.slice(), links: s.links.slice(), options: s.options.map((o) => ({ ...o })) };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i >= s.options.length) return {};
    const ans = gearAnswer(s, ctx.edgework);
    const o = s.options[i];
    return o.dir === ans.dir && o.rpm === ans.rpm ? { solved: true, changed: true } : { strike: true };
  },
};
