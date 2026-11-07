// Tohumlanabilir rastgele sayı üreteci (mulberry32). Hem sunucu hem tarayıcı kullanır.

export function createRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    next,
    /** a ile b arasında (ikisi de dahil) tam sayı */
    int(a, b) {
      return a + Math.floor(next() * (b - a + 1));
    },
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    chance(p) {
      return next() < p;
    },
    shuffle(arr) {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    /** Diziden tekrarsız n eleman */
    sample(arr, n) {
      return rng.shuffle(arr).slice(0, n);
    },
  };
  return rng;
}

export function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
