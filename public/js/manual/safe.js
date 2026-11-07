import { swatch, ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? 'Ekranında iki basamaklı bir sayı ve renkli bir lamba, ortasında 0–9 rakamlı döner bir kadran olan modül.'
        : 'A module with a two-digit number and a coloured lamp on its screen, and a rotating dial numbered 0–9.'
    )}
    <p>${
      tr
        ? 'Şifre <b>üç rakamdan</b> oluşur. Ekrandaki sayının onlar basamağına <b>O</b>, birler basamağına <b>B</b> diyelim.'
        : 'The code has <b>three digits</b>. Call the tens digit of the number on the screen <b>T</b> and the units digit <b>U</b>.'
    }</p>
    <table class="rules">
      <tbody>
        <tr><th>${tr ? '1. rakam' : 'Digit 1'}</th><td>${tr ? 'O + pil sayısı' : 'T + battery count'}</td></tr>
        <tr><th>${tr ? '2. rakam' : 'Digit 2'}</th><td>${tr ? 'B + seri numarasının son rakamı' : 'U + last digit of the serial number'}</td></tr>
        <tr><th>${tr ? '3. rakam' : 'Digit 3'}</th><td>
          ${swatch('red', L)}: ${tr ? '1. rakam + 2. rakam' : 'digit 1 + digit 2'}<br>
          ${swatch('blue', L)}: ${tr ? '1. ve 2. rakam arasındaki fark (büyükten küçük)' : 'difference between digit 1 and digit 2 (larger minus smaller)'}<br>
          ${swatch('green', L)}: ${tr ? 'port sayısı' : 'port count'}<br>
          ${swatch('yellow', L)}: ${tr ? 'yanan gösterge sayısı × 3' : 'lit indicator count × 3'}
        </td></tr>
      </tbody>
    </table>
    ${note(tr ? 'Her hesapta sonuç 10 veya fazlaysa yalnızca <b>son rakamı</b> kullanın.' : 'For every calculation, if the result is 10 or more, use only its <b>last digit</b>.')}
    <ol>
      ${
        tr
          ? `<li>İmhacı kadranı ◀ ▶ ile çevirir. Kadranın üstündeki işaretçinin gösterdiği rakam <b>GİR</b> ile kaydedilir.</li>
             <li>Üç rakam girildiğinde kasa kontrol edilir. Şifre yanlışsa hata yazılır ve giriş baştan başlar.</li>`
          : `<li>The defuser turns the dial with ◀ ▶. The digit under the pointer at the top is stored with <b>ENTER</b>.</li>
             <li>After three digits the safe checks the code. A wrong code causes a strike and the entry starts over.</li>`
      }
    </ol>
    <p class="small">${
      tr
        ? 'Örnek: Ekranda 47 ve kırmızı lamba, 3 pil, seri son rakamı 7 → 1. rakam 4+3 = <b>7</b>, 2. rakam 7+7 = 14 → <b>4</b>, 3. rakam 7+4 = 11 → <b>1</b>. Şifre: 7 4 1.'
        : 'Example: screen shows 47 with a red lamp, 3 batteries, serial ends in 7 → digit 1 is 4+3 = <b>7</b>, digit 2 is 7+7 = 14 → <b>4</b>, digit 3 is 7+4 = 11 → <b>1</b>. Code: 7 4 1.'
    }</p>`;
};
