import { ALPHABET } from '/shared/modules/cipher.js';
import { CIPHER_WORDS } from '/shared/words.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

// Hazır çözme tablosu: her olası kaydırma için kod harfi → gerçek harf. Geri saymaya gerek kalmaz.
const SHIFTS = [2, 3, 4, 5, 6, 7];
const decode = (c, k) => ALPHABET[(ALPHABET.indexOf(c) - k + 26) % 26];

export default (L, CL) => {
  const tr = L === 'tr';
  const head = `<tr><th>${tr ? 'Kod harfi →' : 'Code letter →'}</th>${ALPHABET.split('').map((c) => `<th class="center">${c}</th>`).join('')}</tr>`;
  const body = SHIFTS.map((k) => `<tr><th>${tr ? `Kaydırma ${k}` : `Shift ${k}`}</th>${ALPHABET.split('').map((c) => `<td class="center">${decode(c, k)}</td>`).join('')}</tr>`).join('');
  const words = (CIPHER_WORDS[CL] || CIPHER_WORDS.tr).join(' · ');
  return `
    ${ident(
      L,
      tr ? 'Ekranında anlamsız görünen 5 harfli bir kod ve altında kelime yazan dört düğme olan modül.' : 'A module showing a meaningless five-letter code, with four word buttons below it.'
    )}
    ${needs(L, 'cipher')}
    ${steps(
      tr
        ? [
            `${mark('Kaydırma')} = pil sayısı + 2. Seri numarasında sesli harf (A E I U) varsa ${mark('+1')} daha.`,
            'İmhacıdan koddaki 5 harfi <b>tek tek</b> isteyin.',
            `Aşağıdaki tabloda kendi kaydırmanızın ${mark('satırına')} gidin. Her kod harfinin ${mark('altındaki')} harf gerçek harftir.`,
            'Çıkan kelimeyi okuyun; imhacı o kelimenin yazdığı düğmeye basar.',
          ]
        : [
            `${mark('Shift')} = battery count + 2. If the serial contains a vowel (A E I U), ${mark('+1')} more.`,
            'Have the defuser read the 5 code letters <b>one by one</b>.',
            `Go to your shift’s ${mark('row')} below. The letter ${mark('under')} each code letter is the real letter.`,
            'Read off the word; the defuser presses the button showing it.',
          ]
    )}
    <div class="table-scroll"><table class="rules cipher-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>
    ${example(
      L,
      tr
        ? '3 pil, seri no.’da sesli harf var → kaydırma 3 + 2 + 1 = <b>6</b>. Kod <b>QGRKS</b>: "Kaydırma 6" satırında Q→K, G→A, R→L, K→E, S→M → <b>KALEM</b>.'
        : '3 batteries, serial has a vowel → shift 3 + 2 + 1 = <b>6</b>. Code <b>VRGTZ</b>: in the "Shift 6" row V→P, R→L, G→A, T→N, Z→T → <b>PLANT</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Bu cihaz 26 harfli <b>Latin alfabesi</b> kullanır (Q, W, X var; Ç, Ğ, İ, Ö, Ş, Ü yok). Ekrandaki I noktasız Latin I’dır.', 'Kelimenin tamamını çözmeden önce ilk 2–3 harf genelde düğmeyi bulmaya yeter.', 'Yanlış düğme hata yazdırır.']
        : ['This device uses the 26-letter <b>Latin alphabet</b>.', 'The first 2–3 decoded letters are usually enough to pick the button.', 'A wrong button causes a strike.']
    )}
    <p class="small">${tr ? 'Bu bombada olası kelimeler' : 'Possible words on this bomb'}: <b>${words}</b></p>`;
};
