import { STROOP_WORDS } from '/shared/words.js';
import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const words = Object.values(STROOP_WORDS[CL] || STROOP_WORDS.tr).join(', ');
  const terms = tr
    ? '<b>Kelime</b>: ekranda ne yazdığı · <b>Mürekkep</b>: hangi renkle yazıldığı · <b>Zemin</b>: ekranın açık (krem) ya da koyu (siyah) olması · Düğmenin <b>rengi</b> ve üstündeki <b>yazı</b> ayrı şeylerdir.'
    : '<b>Word</b>: what the screen says · <b>Ink</b>: the colour it is written in · <b>Background</b>: light (cream) or dark (black) · A button’s <b>colour</b> and its <b>label</b> are different things.';
  return `
    ${ident(
      L,
      tr ? 'Ekranında bir renk adı, altında 2×2 dört renkli düğme, sol üstte 3 aşama ışığı.' : 'A screen showing a colour name, four coloured buttons in a 2×2 grid and 3 stage lights.'
    )}
    ${needs(L, 'stroop')}
    <p class="small">${terms}</p>
    <p>${tr ? 'Modül <b>3 aşamadır</b>; her aşamada ekran yenilenir.' : 'The module has <b>3 stages</b>; the screen changes every stage.'}</p>
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li>Kelime ile mürekkep ${mark('aynı renkse')} → aşama numarası kadarıncı düğme (okuma sırasıyla). Bitti.</li>
             <li>Değilse <b>hedef rengi</b> bulun: zemin ${mark('açıksa')} kelimenin söylediği renk, ${mark('koyuysa')} mürekkebin rengi.</li>
             <li>Seri no. son rakamı ${mark('tekse')} üstünde hedef rengin <b>adı yazan</b> düğme; ${mark('çiftse')} <b>kendisi</b> hedef renkte olan düğme.</li>`
          : `<li>Word and ink ${mark('match')} → the button numbered like the stage (reading order). Done.</li>
             <li>Otherwise find the <b>target colour</b>: on a ${mark('light')} background the colour the word names, on a ${mark('dark')} one the ink colour.</li>
             <li>If the serial’s last digit is ${mark('odd')}, press the button <b>labelled</b> with the target; if ${mark('even')}, the button that <b>is</b> the target colour.</li>`
      }
    </ol>
    ${example(
      L,
      tr
        ? 'Ekranda <b>MAVİ</b>, <b>kırmızı</b> mürekkeple, <b>koyu</b> zeminde → hedef <b>kırmızı</b>. Seri <b>…7</b> (tek) → üstünde "KIRMIZI" yazan düğme, rengi ne olursa olsun.'
        : 'The screen says <b>BLUE</b> in <b>red</b> ink on a <b>dark</b> background → target <b>red</b>. Serial <b>…7</b> (odd) → the button labelled "RED", whatever its colour.'
    )}
    ${warn(
      L,
      tr
        ? [`Açık konuşun: "üstünde KIRMIZI ${mark('yazan')}" ile "${mark('kendisi')} kırmızı olan" farklı düğmelerdir.`, 'Yanlış düğme hata yazdırır ve ekran değişir; aşama ilerlemez.']
        : [`Be explicit: "${mark('labelled')} RED" and "${mark('coloured')} red" are different buttons.`, 'A wrong button causes a strike and the screen changes; the stage does not advance.']
    )}
    <p class="small muted">${tr ? 'Bu bombadaki renk kelimeleri' : 'Colour words on this bomb'}: <b>${words}</b></p>`;
};
