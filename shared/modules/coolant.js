// SOĞUTUCU (sürekli ilgi ister): Ara ara devreye girer ve 3 haneli bir kod gösterir.
// Süresi bitmeden doğru düğmeye (A/B/C) basılmazsa hata yazılır.
// 1) Kodda tekrar eden bir rakam varsa B. 2) Değilse rakamların toplamı çiftse A. 3) Değilse C.

export function coolantAnswer(code) {
  const d = code.split('').map(Number);
  if (new Set(d).size < d.length) return 'B';
  return d.reduce((a, b) => a + b, 0) % 2 === 0 ? 'A' : 'C';
}

export default {
  type: 'coolant',
  needy: true,
  generate() {
    return { active: false, code: null };
  },
  activate(s, rng) {
    s.active = true;
    s.code = String(rng.int(0, 999)).padStart(3, '0');
  },
  view(s) {
    return { active: s.active, code: s.active ? s.code : null };
  },
  action(s, a) {
    const b = a && a.press;
    if (!s.active || !['A', 'B', 'C'].includes(b)) return {};
    return b === coolantAnswer(s.code) ? { deactivate: true } : { strike: true, deactivate: true };
  },
};
