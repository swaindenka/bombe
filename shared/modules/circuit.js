// DİRENÇ DEVRESİ (uzman kademesi): Bir pil (gerilimi üstünde yazar) ve renk bantlı üç direnç. Dirençler
// iki düzenden biriyle bağlıdır: R1 ile (R2 ∥ R3) seri, ya da (R1 + R2) ile R3 paralel. Uzman renk kodundan
// değerleri çıkarır, toplam direnci ve Ohm yasasıyla ana koldan geçen akımı (mA) hesaplar; imhacı o değeri
// yazan düğmeye basar. Renk kodu: 1. bant onlar, 2. bant birler, 3. bant çarpan (siyah ×1, kahverengi ×10).
// Bombada en az bir yanan gösterge varsa pilin gerilimi iki katı sayılır (devre "takviyeli").

import { litIndicatorCount } from '../edgework.js';

export const BAND_COLORS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
export const BAND_HEX = {
  black: '#1d1d1f',
  brown: '#7a4a21',
  red: '#d7263d',
  orange: '#ff8c1a',
  yellow: '#f2d21b',
  green: '#2f9e44',
  blue: '#2a6fdb',
  violet: '#8e44ad',
  grey: '#8a8f96',
  white: '#f5f5f5',
};
export const CIRCUIT_TOPOLOGIES = ['sp', 'ps']; // sp: R1 + (R2 ∥ R3) · ps: (R1 + R2) ∥ R3
const BASE = [10, 12, 15, 18, 20, 22, 24, 27, 30, 33, 36, 39, 40, 45, 47, 50, 56, 60, 68, 75, 80, 82, 90];
const VALUES = [...BASE, ...BASE.map((v) => v * 10)];
const VOLTS = [3, 6, 9, 12];

/** Direnç değeri → üç bant */
export function bandsOf(v) {
  const mul = v >= 100 ? 1 : 0;
  const two = mul ? v / 10 : v;
  return [BAND_COLORS[Math.floor(two / 10)], BAND_COLORS[two % 10], BAND_COLORS[mul]];
}

/** Üç bant → değer (kılavuzdaki okuma) */
export const valueOf = (bands) => (BAND_COLORS.indexOf(bands[0]) * 10 + BAND_COLORS.indexOf(bands[1])) * 10 ** BAND_COLORS.indexOf(bands[2]);

const par = (a, b) => (a * b) / (a + b);

export function totalResistance(topo, [r1, r2, r3]) {
  return topo === 'sp' ? r1 + par(r2, r3) : par(r1 + r2, r3);
}

/** Etkin gerilim: yanan gösterge varsa iki katı */
export const effectiveVolts = (volts, e) => (litIndicatorCount(e) > 0 ? volts * 2 : volts);

/** Ana koldan geçen akım, mA */
export function circuitCurrent(st, e) {
  return (effectiveVolts(st.volts, e) * 1000) / totalResistance(st.topo, st.values);
}

const nice = (x) => Number.isInteger(x) && x >= 10 && x <= 9999;

export default {
  type: 'circuit',
  needy: false,
  generate(rng, e) {
    for (;;) {
      const topo = rng.pick(CIRCUIT_TOPOLOGIES);
      const values = [rng.pick(VALUES), rng.pick(VALUES), rng.pick(VALUES)];
      const volts = rng.pick(VOLTS);
      // Ara sonuçlar da tam sayı olsun: kâğıt üstünde hesaplanabilir kalsın
      const inner = topo === 'sp' ? par(values[1], values[2]) : values[0] + values[1];
      const R = totalResistance(topo, values);
      if (!Number.isInteger(inner) || !Number.isInteger(R)) continue;
      const st = { topo, values, volts };
      const mA = circuitCurrent(st, e);
      if (!nice(mA)) continue;
      // Yanlış seçenekler: sık yapılan hatalar (hepsi seri, ters düzen, gerilimi ikiye katlamamak/fazladan katlamak)
      const V = effectiveVolts(volts, e);
      const wrong = [
        (V * 1000) / (values[0] + values[1] + values[2]),
        (V * 1000) / totalResistance(topo === 'sp' ? 'ps' : 'sp', values),
        litIndicatorCount(e) > 0 ? mA / 2 : mA * 2,
        mA * 10,
        mA / 10,
      ].filter((w) => nice(w) && w !== mA);
      const picks = [...new Set(wrong)];
      if (picks.length < 3) continue;
      const options = rng.shuffle([mA, ...rng.sample(picks, 3)]);
      return { ...st, bands: values.map(bandsOf), options };
    }
  },
  view(s) {
    return { topo: s.topo, volts: s.volts, bands: s.bands.map((b) => b.slice()), options: s.options.slice() };
  },
  action(s, a, ctx) {
    const i = a && a.press;
    if (!Number.isInteger(i) || i < 0 || i >= s.options.length) return {};
    return s.options[i] === circuitCurrent(s, ctx.edgework) ? { solved: true, changed: true } : { strike: true };
  },
};
