// MANTIK KAPILARI: Üç giriş anahtarı (A, B, C), üç kapı ve bir çıkış lambası.
// Üst kapı A ile B'yi, alt kapı B ile C'yi birleştirir; sağdaki kapı bu ikisinin çıkışını alır.
// Kapının ŞEKLİ kuralını verir; TURUNCU kapı kuralın tersini üretir. Lambanın çerçevesi YEŞİLSE
// çıkış AÇIK, KIRMIZIYSA KAPALI olmalıdır. Anahtarlar ayarlanır ve TEST'e basılır.
// Birden fazla doğru dizilim olabilir; hangisi olursa olsun kabul edilir.

export const GATE_SHAPES = ['circle', 'triangle', 'diamond'];

// daire: ikisi de açıksa · üçgen: en az biri açıksa · elmas: ikisi farklıysa
export const GATE_RULES = {
  circle: (a, b) => a && b,
  triangle: (a, b) => a || b,
  diamond: (a, b) => a !== b,
};

export function gateOut(g, a, b) {
  const v = GATE_RULES[g.shape](a, b);
  return g.inverted ? !v : v;
}

/** Devrenin çıkışı. inputs = [A, B, C] (true = yukarı/açık) */
export function circuitOutput(gates, inputs) {
  const [a, b, c] = inputs;
  return gateOut(gates[2], gateOut(gates[0], a, b), gateOut(gates[1], b, c));
}

export const ALL_INPUTS = Array.from({ length: 8 }, (_, i) => [!!(i & 4), !!(i & 2), !!(i & 1)]);

/** Lambanın istediği çıkışı veren bütün dizilimler */
export function logicSolutions(gates, lamp) {
  const want = lamp === 'green';
  return ALL_INPUTS.filter((inp) => circuitOutput(gates, inp) === want);
}

export default {
  type: 'logic',
  needy: false,
  generate(rng) {
    for (;;) {
      const gates = [0, 1, 2].map(() => ({ shape: rng.pick(GATE_SHAPES), inverted: rng.chance(0.4) }));
      const ones = ALL_INPUTS.filter((inp) => circuitOutput(gates, inp)).length;
      if (ones === 0 || ones === 8) continue;
      // Az sayıda doğru dizilimi olan sonucu iste: tahminle çözmek zorlaşsın
      const lamp = ones < 4 ? 'green' : ones > 4 ? 'red' : rng.pick(['green', 'red']);
      const wrong = ALL_INPUTS.filter((inp) => circuitOutput(gates, inp) !== (lamp === 'green'));
      return { gates, lamp, inputs: rng.pick(wrong).slice() };
    }
  },
  view(s) {
    return { gates: s.gates.map((g) => ({ ...g })), lamp: s.lamp, inputs: s.inputs.slice() };
  },
  action(s, a) {
    if (!a) return {};
    if (Number.isInteger(a.toggle) && a.toggle >= 0 && a.toggle < 3) {
      s.inputs[a.toggle] = !s.inputs[a.toggle];
      return { changed: true };
    }
    if (a.test) return circuitOutput(s.gates, s.inputs) === (s.lamp === 'green') ? { solved: true, changed: true } : { strike: true };
    return {};
  },
};
