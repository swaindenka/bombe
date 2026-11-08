// ASANSÖR: Ekranda asansörün bulunduğu kat ve gittiği yön (▲/▼), altında 1–9 kat düğmeleri.
// Bazı katlarda çağrı lambası yanar: BEYAZ = normal, KIRMIZI = acil. Çağrılar kılavuzdaki sırayla
// karşılanır; her doğru basışta asansör o kata gider, yönü de son gittiği yön olur.
// 1) Acil çağrı varsa en yakın acil çağrı (eşit uzaklıkta üstteki).
// 2) Yoksa gidilen yöndeki en yakın normal çağrı.
// 3) O yönde çağrı kalmadıysa yön değişir: diğer yöndeki en yakın çağrı.

export const FLOORS = 9;

export function nextStop(s) {
  const open = s.calls.filter((c) => !c.served);
  if (!open.length) return null;
  const dist = (c) => Math.abs(c.floor - s.floor);
  const red = open.filter((c) => c.red);
  if (red.length) return red.sort((a, b) => dist(a) - dist(b) || b.floor - a.floor)[0].floor;
  const up = (c) => c.floor > s.floor;
  const ahead = open.filter((c) => (s.dir === 'up' ? up(c) : !up(c)));
  const pool = ahead.length ? ahead : open;
  return pool.sort((a, b) => dist(a) - dist(b))[0].floor;
}

export default {
  type: 'elevator',
  needy: false,
  generate(rng) {
    const floor = rng.int(1, FLOORS);
    const dir = floor === FLOORS ? 'down' : floor === 1 ? 'up' : rng.pick(['up', 'down']);
    const floors = rng.sample(
      Array.from({ length: FLOORS }, (_, i) => i + 1).filter((f) => f !== floor),
      4
    );
    const reds = rng.pick([0, 1, 1, 1, 2]);
    const calls = floors.map((f, i) => ({ floor: f, red: i < reds, served: false })).sort((a, b) => a.floor - b.floor);
    return { floor, dir, calls };
  },
  view(s) {
    return { floor: s.floor, dir: s.dir, calls: s.calls.map((c) => ({ ...c })) };
  },
  action(s, a) {
    const f = a && a.press;
    if (!Number.isInteger(f) || f < 1 || f > FLOORS) return {};
    if (f !== nextStop(s)) return { strike: true };
    s.calls.find((c) => c.floor === f).served = true;
    s.dir = f > s.floor ? 'up' : 'down';
    s.floor = f;
    return { changed: true, solved: s.calls.every((c) => c.served) };
  },
};
