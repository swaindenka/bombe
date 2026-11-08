import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? 'Ekranında iki basamaklı bir sayı ve renkli bir lamba, ortasında 0–9 rakamlı döner bir kadran olan modül.'
        : 'A module with a two-digit number and a coloured lamp on its screen, and a rotating dial numbered 0–9.'
    )}
    ${needs(L, 'safe')}
    <p>${
      tr
        ? `Şifre <b>3 rakamdır</b>. Ekrandaki sayının ${mark('onlar basamağına O')}, ${mark('birler basamağına B')} diyelim (47 → O = 4, B = 7). ${mark('Her hesapta sonuç 10 veya fazlaysa yalnızca son rakamı alın.')}`
        : `The code has <b>3 digits</b>. Call the screen number’s ${mark('tens digit T')} and ${mark('units digit U')} (47 → T = 4, U = 7). ${mark('Whenever a result is 10 or more, keep only its last digit.')}`
    }</p>
    <table class="rules">
      <tbody>
        <tr><th>${tr ? '1. rakam' : 'Digit 1'}</th><td><b>O + ${tr ? 'pil sayısı' : 'battery count'}</b></td></tr>
        <tr><th>${tr ? '2. rakam' : 'Digit 2'}</th><td><b>B + ${tr ? 'seri no. son rakamı' : 'serial last digit'}</b></td></tr>
        <tr><th>${tr ? '3. rakam' : 'Digit 3'}<br><small>${tr ? 'lambaya göre' : 'by lamp'}</small></th><td>
          <div class="lamp-rule">${swatch('red', L)} → <b>${tr ? '1. rakam + 2. rakam' : 'digit 1 + digit 2'}</b></div>
          <div class="lamp-rule">${swatch('blue', L)} → <b>${tr ? '1. ve 2. rakamın farkı' : 'difference of digit 1 and 2'}</b> <small>(${tr ? 'büyükten küçüğü çıkarın' : 'larger minus smaller'})</small></div>
          <div class="lamp-rule">${swatch('green', L)} → <b>${tr ? 'port sayısı' : 'port count'}</b> <small>(${tr ? 'bütün kenarlardaki portların toplamı' : 'all ports on all edges'})</small></div>
          <div class="lamp-rule">${swatch('yellow', L)} → <b>${tr ? 'yanan gösterge sayısı × 3' : 'lit indicator count × 3'}</b></div>
        </td></tr>
      </tbody>
    </table>
    ${steps(
      tr
        ? [
            'Üç rakamı hesaplayıp imhacıya sırayla söyleyin.',
            `İmhacı kadranı ◀ ▶ ile çevirir; ${mark('üstteki kırmızı işaretçinin gösterdiği rakam')} <b>GİR</b> ile kaydedilir.`,
            'Üç rakam girilince kasa kontrol edilir. Sağdaki üç ışık girilen rakam sayısını gösterir.',
          ]
        : [
            'Work out the three digits and read them to the defuser in order.',
            `The defuser turns the dial with ◀ ▶; the digit ${mark('under the red pointer at the top')} is stored with <b>ENTER</b>.`,
            'After three digits the safe checks the code. The three lights on the right show how many digits are entered.',
          ]
    )}
    ${example(
      L,
      tr
        ? `Ekranda <b>47</b>, lamba <b>yeşil</b>. 3 pil, seri no. <b>KR47T5</b>, portlar: USB + HDMI (bir kenarda), AUX (başka kenarda).<br>
           1. rakam: 4 + 3 = <b>7</b> · 2. rakam: 7 + 5 = 12 → <b>2</b> · 3. rakam (yeşil): 2 + 1 port = <b>3</b> → şifre <b>7 2 3</b>.<br>
           Lamba <b>kırmızı</b> olsaydı 3. rakam 7 + 2 = 9, <b>mavi</b> olsaydı 7 − 2 = 5 olurdu.`
        : `Screen <b>47</b>, lamp <b>green</b>. 3 batteries, serial <b>KR47T5</b>, ports: USB + HDMI (one edge), AUX (another edge).<br>
           Digit 1: 4 + 3 = <b>7</b> · Digit 2: 7 + 5 = 12 → <b>2</b> · Digit 3 (green): 2 + 1 ports = <b>3</b> → code <b>7 2 3</b>.<br>
           With a <b>red</b> lamp digit 3 would be 7 + 2 = 9; with <b>blue</b>, 7 − 2 = 5.`
    )}
    ${warn(
      L,
      tr
        ? ['Pil sayısı = pil adedi (yuva değil). Port sayısı = port adedi (plaka değil), dört kenarın hepsi.', 'Hiç port yoksa yeşilde 3. rakam 0’dır. Yanan gösterge yoksa sarıda 0’dır.', 'Yanlış şifre hata yazdırır ve giriş baştan başlar.']
        : ['Battery count = batteries, not holders. Port count = ports, not plates, on all four edges.', 'No ports → green digit 3 is 0. No lit indicators → yellow digit 3 is 0.', 'A wrong code causes a strike and the entry starts over.']
    )}`;
};
