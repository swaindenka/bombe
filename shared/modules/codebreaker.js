// KOD KIRICI: 5 renkten 4'ü farklı sırayla gizli bir kod oluşturur (aynı renk iki kez geçmez).
// İmhacı 4 yuvayı renklendirip DENE'ye basar; her denemenin yanında ▲ ve ● işaretleri belirir.
// İşaretlerin anlamı ekranın çerçeve rengine bağlıdır (kılavuz):
//   MAVİ çerçeve:    ▲ = doğru renk doğru yerde · ● = doğru renk yanlış yerde
//   TURUNCU çerçeve: ▲ = doğru renk yanlış yerde · ● = doğru renk doğru yerde
// 6 deneme hakkı vardır. Hepsi biterse hata yazılır ve yeni bir kod gelir. Yanlış deneme tek başına hata değildir.

export const CODE_COLORS = ['red', 'blue', 'green', 'yellow', 'white'];
export const CODE_LEN = 4;
export const CODE_TRIES = 6;
export const CODE_FRAMES = ['blue', 'amber'];

/** Tahmin ile kod karşılaştırması: exact = doğru yerde, near = yanlış yerde */
export function codeFeedback(guess, code) {
  let exact = 0;
  let common = 0;
  for (let i = 0; i < CODE_LEN; i++) if (guess[i] === code[i]) exact++;
  for (const c of CODE_COLORS) common += Math.min(guess.filter((g) => g === c).length, code.filter((g) => g === c).length);
  return { exact, near: common - exact };
}

/** Ekranda görünen işaret sayıları (çerçeveye göre) */
export const feedbackSymbols = (fb, frame) => (frame === 'blue' ? { tri: fb.exact, dot: fb.near } : { tri: fb.near, dot: fb.exact });

function newRound(s, rng) {
  s.code = rng.sample(CODE_COLORS, CODE_LEN);
  s.frame = rng.pick(CODE_FRAMES);
  s.history = [];
  s.guess = [null, null, null, null];
}

export default {
  type: 'codebreaker',
  needy: false,
  generate(rng) {
    const s = {};
    newRound(s, rng);
    return s;
  },
  view(s) {
    return {
      frame: s.frame,
      guess: s.guess.slice(),
      history: s.history.map((h) => ({ guess: h.guess.slice(), ...feedbackSymbols(h.fb, s.frame) })),
      tries: CODE_TRIES - s.history.length,
    };
  },
  action(s, a, ctx) {
    if (!a) return {};
    if (Number.isInteger(a.cycle) && a.cycle >= 0 && a.cycle < CODE_LEN) {
      const cur = s.guess[a.cycle];
      s.guess[a.cycle] = CODE_COLORS[(cur === null ? 0 : CODE_COLORS.indexOf(cur) + 1) % CODE_COLORS.length];
      return { changed: true };
    }
    if (a.try) {
      if (s.guess.some((g) => g === null)) return {};
      const fb = codeFeedback(s.guess, s.code);
      if (fb.exact === CODE_LEN) return { solved: true, changed: true };
      s.history.push({ guess: s.guess.slice(), fb });
      if (s.history.length >= CODE_TRIES) {
        newRound(s, ctx.rng);
        return { strike: true, changed: true };
      }
      return { changed: true };
    }
    return {};
  },
};
