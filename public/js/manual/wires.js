import { WIRE_TABLE, WIRE_COLORS, WIRE_COUNTS } from '/shared/modules/wires.js';
import { colorName } from '/shared/colors.js';
import { swatch, ident, needs, steps, example, warn, branch, mark } from './common.js';

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];

/** Yapısal kuralı okunur HTML'e çevirir: koşullar Evet/Hayır dallarıyla gösterilir */
function describe(r, L) {
  const tr = L === 'tr';
  const c = r.c ? `<b>${colorName(L, r.c)}</b>` : '';
  const d = (x) => describe(x, L);
  switch (r.t) {
    case 'nth':
      return tr ? `<b>${r.n}. kabloyu</b> kes` : `cut the <b>${ORD_EN[r.n]} wire</b>`;
    case 'last':
      return tr ? `<b>en alttaki</b> kabloyu kes` : `cut the <b>bottom</b> wire`;
    case 'firstOf':
      return branch(L, tr ? `${c} kablo var mı?` : `Is there a ${c} wire?`, tr ? `${mark('en üstteki')} ${c} kabloyu kes` : `cut the ${mark('topmost')} ${c} wire`, d(r.else));
    case 'lastOf':
      return branch(L, tr ? `${c} kablo var mı?` : `Is there a ${c} wire?`, tr ? `${mark('en alttaki')} ${c} kabloyu kes` : `cut the ${mark('lowest')} ${c} wire`, d(r.else));
    case 'atLeast':
      return branch(
        L,
        r.n === 1 ? (tr ? `En az bir ${c} kablo var mı?` : `Is there at least one ${c} wire?`) : tr ? `En az ${r.n} tane ${c} kablo var mı?` : `Are there at least ${r.n} ${c} wires?`,
        d(r.then),
        d(r.else)
      );
    case 'bat':
      return branch(L, tr ? `Pil sayısı ${mark(r.min + ' veya daha fazla')} mı?` : `Are there ${mark(r.min + ' or more')} batteries?`, d(r.then), d(r.else));
    case 'odd':
      return branch(L, tr ? `Seri no. son rakamı ${mark('tek')} mi?` : `Is the serial’s last digit ${mark('odd')}?`, d(r.then), d(r.else));
    case 'vowel':
      return branch(L, tr ? `Seri no.’da ${mark('sesli harf')} (A E I U) var mı?` : `Does the serial contain a ${mark('vowel')} (A E I U)?`, d(r.then), d(r.else));
  }
  return '?';
}

export { describe as describeWireRule };

export default (L) => {
  const tr = L === 'tr';
  const sections = WIRE_COUNTS.map((n) => {
    const rows = WIRE_COLORS.map((c) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${describe(WIRE_TABLE[c][n], L)}</td></tr>`).join('');
    return `
      <h3>${tr ? `${n} kablo` : `${n} wires`}</h3>
      <table class="rules"><thead><tr><th>${tr ? 'En üstteki kablonun rengi' : 'Colour of the top wire'}</th><th>${tr ? 'Ne yapılacak' : 'What to do'}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).join('');
  return `
    ${ident(L, tr ? 'Soldan sağa uzanan 3 ile 6 arası renkli kablo bulunan panel.' : 'A panel with 3 to 6 coloured wires running left to right.')}
    ${needs(L, 'wires')}
    ${steps(
      tr
        ? [
            `Kabloları ${mark('yukarıdan aşağıya')} numaralayın: en üstteki <b>1.</b> kablodur.`,
            `${mark('Kaç kablo')} olduğunu ve ${mark('en üstteki kablonun rengini')} öğrenin.`,
            'Aşağıda kablo sayısına ait tabloyu açın, en üstteki kablonun rengine ait satırı okuyun.',
            `Bir soru varsa cevabına göre ✔ Evet ya da ✘ Hayır satırını izleyin. Sonunda ${mark('tek bir kablo')} kesilir.`,
          ]
        : [
            `Number the wires ${mark('from top to bottom')}: the top wire is wire <b>1</b>.`,
            `Find out ${mark('how many wires')} there are and ${mark('the colour of the top wire')}.`,
            'Open the table for that wire count and read the row for the top wire’s colour.',
            `If there is a question, follow ✔ Yes or ✘ No. In the end ${mark('exactly one wire')} is cut.`,
          ]
    )}
    ${sections}
    ${example(
      L,
      tr
        ? '4 kablo var, en üstteki <b>kırmızı</b>, seri no. <b>KR47T5</b>. Tablo: "Seri no. son rakamı tek mi?" → 5 tek → ✔ Evet → <b>3. kabloyu kes</b>.'
        : '4 wires, top wire <b>red</b>, serial <b>KR47T5</b>. Table: "Is the serial’s last digit odd?" → 5 is odd → ✔ Yes → <b>cut the 3rd wire</b>.'
    )}
    ${warn(
      L,
      tr
        ? [
            `"En üstteki mavi" = yukarıdan bakınca ${mark('ilk gördüğün')} mavi kablo; "en alttaki mavi" = ${mark('en son')} mavi kablo.`,
            'Yanlış kesilen kablo yerinde kalır; kablo sayısı ve numaralar <b>değişmez</b>. Kesilmiş kabloyu da sayın.',
            'Renkler: kırmızı, mavi, sarı, beyaz, siyah. Beyaz ile siyahı karıştırmayın.',
          ]
        : [
            `"Topmost blue" = the ${mark('first')} blue wire from the top; "lowest blue" = the ${mark('last')} blue wire.`,
            'A wrongly cut wire stays in place; the wire count and numbers <b>do not change</b>. Count cut wires too.',
            'Colours: red, blue, yellow, white, black. Don’t mix up white and black.',
          ]
    )}`;
};
