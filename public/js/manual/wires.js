import { WIRE_TABLE, WIRE_COLORS, WIRE_COUNTS } from '/shared/modules/wires.js';
import { colorName } from '/shared/colors.js';
import { swatch, cap, ident, note } from './common.js';

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];

function describe(r, L) {
  const c = r.c ? colorName(L, r.c) : '';
  const d = (x) => describe(x, L);
  if (L === 'tr') {
    switch (r.t) {
      case 'nth':
        return `<b>${r.n}. kabloyu</b> kes`;
      case 'last':
        return '<b>son kabloyu</b> kes';
      case 'firstOf':
        return `<b>ilk ${c}</b> kabloyu kes; ${c} kablo yoksa ${d(r.else)}`;
      case 'lastOf':
        return `<b>son ${c}</b> kabloyu kes; ${c} kablo yoksa ${d(r.else)}`;
      case 'atLeast':
        return r.n === 1
          ? `${c} kablo varsa ${d(r.then)}, yoksa ${d(r.else)}`
          : `en az ${r.n} ${c} kablo varsa ${d(r.then)}, yoksa ${d(r.else)}`;
      case 'bat':
        return `en az ${r.min} pil varsa ${d(r.then)}, yoksa ${d(r.else)}`;
      case 'odd':
        return `seri no. son rakamı tekse ${d(r.then)}, çiftse ${d(r.else)}`;
      case 'vowel':
        return `seri no.’da sesli harf varsa ${d(r.then)}, yoksa ${d(r.else)}`;
    }
  } else {
    switch (r.t) {
      case 'nth':
        return `cut the <b>${ORD_EN[r.n]} wire</b>`;
      case 'last':
        return 'cut the <b>last wire</b>';
      case 'firstOf':
        return `cut the <b>first ${c}</b> wire; if there is no ${c} wire, ${d(r.else)}`;
      case 'lastOf':
        return `cut the <b>last ${c}</b> wire; if there is no ${c} wire, ${d(r.else)}`;
      case 'atLeast':
        return r.n === 1
          ? `if there is a ${c} wire, ${d(r.then)}; otherwise ${d(r.else)}`
          : `if there are at least ${r.n} ${c} wires, ${d(r.then)}; otherwise ${d(r.else)}`;
      case 'bat':
        return `if there are at least ${r.min} batteries, ${d(r.then)}; otherwise ${d(r.else)}`;
      case 'odd':
        return `if the serial’s last digit is odd, ${d(r.then)}; otherwise ${d(r.else)}`;
      case 'vowel':
        return `if the serial contains a vowel, ${d(r.then)}; otherwise ${d(r.else)}`;
    }
  }
  return '?';
}

export { describe as describeWireRule };

export default (L) => {
  const tr = L === 'tr';
  const sections = WIRE_COUNTS.map((n) => {
    const rows = WIRE_COLORS.map(
      (c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${cap(describe(WIRE_TABLE[c][n], L))}.</td></tr>`
    ).join('');
    return `
      <h3>${tr ? `${n} kablo varsa` : `${n} wires`}</h3>
      <table class="rules"><thead><tr><th>${tr ? 'En üstteki kablo' : 'Top wire'}</th><th>${tr ? 'Yapılacak' : 'Action'}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  return `
    ${ident(L, tr ? 'Soldan sağa uzanan 3 ile 6 arası renkli kablo bulunan panel.' : 'A panel with 3 to 6 coloured wires running left to right.')}
    <ol>
      ${
        tr
          ? '<li>Kablolar <b>yukarıdan aşağıya</b> 1., 2., 3. … diye sayılır.</li><li>Kablo sayısını ve <b>en üstteki</b> kablonun rengini öğrenin.</li><li>Aşağıdaki tablodan kesilecek <b>tek</b> kabloyu bulun. Yanlış kablo hata yazdırır.</li>'
          : '<li>Wires are numbered 1st, 2nd, 3rd … <b>from top to bottom</b>.</li><li>Find out how many wires there are and the colour of the <b>top</b> wire.</li><li>Use the tables below to find the <b>one</b> wire to cut. Cutting a wrong wire causes a strike.</li>'
      }
    </ol>
    ${sections}
    ${note(tr ? 'Renkler: kırmızı, mavi, sarı, beyaz, siyah.' : 'Colours: red, blue, yellow, white, black.')}`;
};
