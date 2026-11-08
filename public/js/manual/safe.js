import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr ? 'Ekranında iki basamaklı bir sayı ve renkli bir lamba, ortada 0–9 rakamlı döner kadran.' : 'A screen with a two-digit number and a coloured lamp, and a rotating dial numbered 0–9.'
    )}
    ${needs(L, 'safe')}
    <p>${
      tr
        ? `Şifre <b>3 rakamdır</b>. Ekrandaki sayının onlar basamağı <b>O</b>, birler basamağı <b>B</b> olsun. ${mark('Her sonuçta yalnızca son rakamı tutun.')}`
        : `The code has <b>3 digits</b>. Let <b>T</b> be the tens digit and <b>U</b> the units digit of the number. ${mark('Keep only the last digit of every result.')}`
    }</p>
    <table class="rules">
      <tbody>
        <tr><th>${tr ? '1. rakam' : 'Digit 1'}</th><td>${tr ? 'O + pil sayısı' : 'T + battery count'}</td></tr>
        <tr><th>${tr ? '2. rakam' : 'Digit 2'}</th><td>${tr ? 'B + seri no. son rakamı' : 'U + serial last digit'}</td></tr>
        <tr><th>${tr ? '3. rakam' : 'Digit 3'}</th><td>
          <div class="lamp-rule">${swatch('red', L)} ${tr ? '1. rakam + 2. rakam' : 'digit 1 + digit 2'}</div>
          <div class="lamp-rule">${swatch('blue', L)} ${tr ? '1. ve 2. rakamın farkı (büyükten küçük)' : 'difference of digits 1 and 2 (larger minus smaller)'}</div>
          <div class="lamp-rule">${swatch('green', L)} ${tr ? 'port sayısı' : 'port count'}</div>
          <div class="lamp-rule">${swatch('yellow', L)} ${tr ? 'yanan gösterge sayısı × 3' : 'lit indicator count × 3'}</div>
        </td></tr>
      </tbody>
    </table>
    ${steps(
      tr
        ? [
            `İmhacı kadranı ◀ ▶ ile çevirir; ${mark('kırmızı işaretçinin altındaki')} rakamı <b>GİR</b> ile kaydeder.`,
            'Üç rakam girilince kasa kontrol edilir; sağdaki üç ışık girilen rakam sayısını gösterir.',
          ]
        : [
            `The defuser turns the dial with ◀ ▶ and stores the digit ${mark('under the red pointer')} with <b>ENTER</b>.`,
            'After three digits the safe checks the code; the three lights on the right count the entered digits.',
          ]
    )}
    ${example(
      L,
      tr
        ? 'Ekranda <b>47</b>, lamba <b>mavi</b>; 3 pil, seri no. <b>…5</b>. 1. rakam 4 + 3 = <b>7</b>; 2. rakam 7 + 5 = 12 → <b>2</b>; 3. rakam 7 − 2 = <b>5</b> → şifre <b>7 2 5</b>.'
        : 'Screen <b>47</b>, lamp <b>blue</b>; 3 batteries, serial <b>…5</b>. Digit 1: 4 + 3 = <b>7</b>; digit 2: 7 + 5 = 12 → <b>2</b>; digit 3: 7 − 2 = <b>5</b> → code <b>7 2 5</b>.'
    )}
    ${warn(L, tr ? ['3. rakamı hesaplarken ilk iki rakamın <b>son rakama indirilmiş</b> hâlini kullanın.', 'Yanlış şifre hata yazdırır; giriş baştan başlar.'] : ['For digit 3 use digits 1 and 2 <b>after</b> keeping their last digit.', 'A wrong code causes a strike and the entry starts over.'])}`;
};
