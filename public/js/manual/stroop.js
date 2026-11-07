import { STROOP_WORDS } from '/shared/words.js';
import { ident, note } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const words = Object.values(STROOP_WORDS[CL] || STROOP_WORDS.tr).join(', ');
  return `
    ${ident(
      L,
      tr
        ? 'Ekranında bir renk adı yazan, altında 2×2 dizilmiş renkli düğmeler ve üstünde 3 aşama ışığı olan modül.'
        : 'A module whose screen shows a colour name, with four coloured buttons in a 2×2 layout and 3 stage lights on top.'
    )}
    <p>${tr ? 'Modül <b>3 aşamadan</b> oluşur. Her aşamada şu adımları izleyin:' : 'The module has <b>3 stages</b>. At each stage, follow these steps:'}</p>
    <ol>
      ${
        tr
          ? `<li>Ekrandaki <b>kelime</b> ile yazının <b>mürekkep rengi</b> aynıysa: aşama numarası kadarıncı düğmeye basın (1. aşamada 1. düğme, 2. aşamada 2. düğme…). Bu durumda aşağıdaki adımları atlayın.</li>
             <li>Değilse <b>hedef rengi</b> bulun: ekranın arka planı <b>açık</b> renkliyse hedef, kelimenin söylediği renktir. Arka plan <b>koyu</b> ise hedef, yazının mürekkep rengidir.</li>
             <li>Seri numarasının son rakamı <b>tekse</b>: üzerinde hedef rengin <b>adı yazan</b> düğmeye basın.</li>
             <li>Son rakam <b>çiftse</b>: kendisi hedef <b>renkte</b> olan düğmeye basın (üzerinde ne yazdığına bakmadan).</li>`
          : `<li>If the <b>word</b> on the screen matches its <b>ink colour</b>: press the button whose position equals the stage number (stage 1 → button 1, stage 2 → button 2…). Skip the remaining steps.</li>
             <li>Otherwise find the <b>target colour</b>: if the screen background is <b>light</b>, the target is the colour the word names. If the background is <b>dark</b>, the target is the ink colour.</li>
             <li>If the serial’s last digit is <b>odd</b>: press the button whose <b>label</b> names the target colour.</li>
             <li>If the last digit is <b>even</b>: press the button whose <b>fill colour</b> is the target colour (ignore what it says).</li>`
      }
    </ol>
    ${note(
      tr
        ? 'Düğmeler okuma sırasıyla sayılır: sol üst = 1, sağ üst = 2, sol alt = 3, sağ alt = 4. Yanlış düğme hata yazdırır ve ekran değişir; aşama ilerlemez. Yanan aşama ışıkları tamamlanan aşamaları gösterir.'
        : 'Buttons are numbered in reading order: top-left = 1, top-right = 2, bottom-left = 3, bottom-right = 4. A wrong button causes a strike and the screen changes; the stage does not advance. Lit stage lights show completed stages.'
    )}
    <p class="small">${tr ? 'Bu bombadaki renk kelimeleri' : 'Colour words on this bomb'}: <b>${words}</b></p>`;
};
