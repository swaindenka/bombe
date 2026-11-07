import { ALPHABET } from '/shared/modules/cipher.js';
import { CIPHER_WORDS } from '/shared/words.js';
import { ident, note } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const strip = ALPHABET.split('')
    .map((c, i) => `<span><b>${c}</b><small>${i}</small></span>`)
    .join('');
  const words = (CIPHER_WORDS[CL] || CIPHER_WORDS.tr).join(' · ');
  return `
    ${ident(
      L,
      tr
        ? 'Ekranında anlamsız görünen 5 harfli bir kod ve altında kelime yazan dört düğme olan modül.'
        : 'A module showing a meaningless five-letter code, with four word buttons below it.'
    )}
    <ol>
      ${
        tr
          ? `<li><b>Kaydırma miktarını</b> hesaplayın: pil sayısı + 2. Seri numarasında sesli harf varsa 1 daha ekleyin.</li>
             <li>Koddaki her harf, gerçek harfin alfabede o kadar <b>ileri</b> kaydırılmış hâlidir. Çözmek için her harfi aynı miktar <b>geri</b> kaydırın (A’dan geri gidince Z’ye dönülür).</li>
             <li>Çıkan kelimenin yazdığı düğmeye bastırın. Yanlış düğme hata yazdırır.</li>`
          : `<li>Work out the <b>shift</b>: battery count + 2. Add 1 more if the serial number contains a vowel.</li>
             <li>Each letter of the code is the real letter moved <b>forward</b> by the shift. To decode, move each letter <b>back</b> by the same amount (going back from A wraps to Z).</li>
             <li>Have the button showing the decoded word pressed. A wrong button causes a strike.</li>`
      }
    </ol>
    <div class="alpha-strip">${strip}</div>
    ${note(
      tr
        ? 'Bu cihaz 26 harfli Latin alfabesini kullanır (Q, W, X dahil; Ç, Ğ, İ, Ö, Ş, Ü yok). Harfleri tek tek, karıştırmadan okutun!'
        : 'This device uses the 26-letter Latin alphabet. Have the letters read out one by one!'
    )}
    <p class="small">${tr ? 'Örnek: kaydırma 6 ise QGRKS → KALEM.' : 'Example: with a shift of 6, VRGTZ → PLANT.'}</p>
    <p class="small">${tr ? 'Bu bombada olası kelimeler' : 'Possible words on this bomb'}: <b>${words}</b></p>`;
};
