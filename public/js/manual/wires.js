import { WIRE_TABLE, WIRE_COLORS, WIRE_COUNTS } from '/shared/modules/wires.js';
import { colorName } from '/shared/colors.js';
import { swatch, ident, needs, steps, example, warn, mark, cap } from './common.js';

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];

/**
 * Yapısal kuralı kısa bir cümleye çevirir: "Soru? ✔ ... · ✘ ...".
 * Kılavuz metni oyunun kullandığı tablodan üretilir; ikisi birbirinden kopamaz.
 */
function describe(r, L) {
  const tr = L === 'tr';
  const c = r.c ? colorName(L, r.c) : '';
  const d = (x) => describe(x, L);
  // İç içe soru varsa parantezle ayır: "✘ (Mavi var mı? ✔ … ✘ …)"
  const nest = (x) => (x.includes('✔') ? `<span class="nest">(${x})</span>` : x);
  const ask = (q, yes, no) => `${q} <span class="yes">✔ ${nest(yes)}</span> <span class="no">✘ ${nest(no)}</span>`;
  switch (r.t) {
    case 'nth':
      return tr ? `<b>${r.n}.</b> kablo` : `the <b>${ORD_EN[r.n]}</b> wire`;
    case 'last':
      return tr ? '<b>en alttaki</b> kablo' : 'the <b>bottom</b> wire';
    case 'firstOf':
      return ask(tr ? `${cap(c)} var mı?` : `Any ${c}?`, tr ? `en üstteki ${c}` : `the topmost ${c}`, d(r.else));
    case 'lastOf':
      return ask(tr ? `${cap(c)} var mı?` : `Any ${c}?`, tr ? `en alttaki ${c}` : `the lowest ${c}`, d(r.else));
    case 'atLeast':
      return ask(tr ? `En az ${r.n} ${c} var mı?` : `At least ${r.n} ${c}?`, d(r.then), d(r.else));
    case 'bat':
      return ask(tr ? `Pil ≥ ${r.min}?` : `Batteries ≥ ${r.min}?`, d(r.then), d(r.else));
    case 'odd':
      return ask(tr ? 'Son rakam tek mi?' : 'Last digit odd?', d(r.then), d(r.else));
    case 'vowel':
      return ask(tr ? 'Sesli harf var mı?' : 'Vowel in serial?', d(r.then), d(r.else));
  }
  return '?';
}

export { describe as describeWireRule };

export default (L) => {
  const tr = L === 'tr';
  const sections = WIRE_COUNTS.map((n) => {
    const rows = WIRE_COLORS.map((c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td class="wire-rule">${describe(WIRE_TABLE[c][n], L)}</td></tr>`).join('');
    return `
      <h3>${tr ? `${n} kablo` : `${n} wires`}</h3>
      <table class="rules"><thead><tr><th>${tr ? 'En üstteki kablo' : 'Top wire'}</th><th>${tr ? 'Kesilecek kablo' : 'Cut'}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  return `
    ${ident(L, tr ? 'Soldan sağa uzanan 3–6 renkli kablo.' : '3–6 coloured wires running left to right.')}
    ${needs(L, 'wires')}
    ${steps(
      tr
        ? [
            `Kablolar ${mark('yukarıdan aşağıya')} numaralanır; en üstteki <b>1.</b> kablodur.`,
            `Kablo sayısının tablosunda ${mark('en üstteki kablonun rengini')} bulun.`,
            'Soru varsa cevabına göre ✔ ya da ✘ tarafını izleyin. Sonunda tek bir kablo kesilir.',
          ]
        : [
            `Wires are numbered ${mark('from the top')}; the top wire is wire <b>1</b>.`,
            `In the table for the wire count, find the ${mark('top wire’s colour')}.`,
            'If there is a question, follow ✔ or ✘. Exactly one wire is cut.',
          ]
    )}
    ${sections}
    ${example(
      L,
      tr
        ? '5 kablo; yukarıdan: <b>kırmızı, mavi, siyah, mavi, beyaz</b>. 5 kablo tablosu, kırmızı satırı: "Siyah var mı?" → var → en üstteki siyah = <b>3.</b> kablo.'
        : '5 wires; from the top: <b>red, blue, black, blue, white</b>. 5-wire table, red row: "Any black?" → yes → the topmost black = wire <b>3</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Yanlış kesilen kablo yerinde kalır; numaralar <b>değişmez</b>.', 'Beyaz ile siyahı, "en üstteki" ile "en alttaki"yi karıştırmayın.']
        : ['A wrongly cut wire stays in place; the numbering <b>does not change</b>.', 'Don’t mix up white and black, or "topmost" and "lowest".']
    )}`;
};
