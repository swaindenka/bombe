import { swatch, ident, needs, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const row = (c, text) => `<tr><td class="nowrap">${swatch(c, L)}</td><td>${text}</td></tr>`;
  const rows = tr
    ? [
        row('red', 'Rakamların <b>yerini değiştirin</b> (47 → 74, 30 → 03)'),
        row('blue', '<b>Seri no. son rakamını</b> ekleyin'),
        row('green', '<b>99’dan</b> çıkarın'),
        row('yellow', '<b>İki katını</b> alın'),
      ]
    : [
        row('red', '<b>Swap the digits</b> (47 → 74, 30 → 03)'),
        row('blue', 'Add the <b>serial’s last digit</b>'),
        row('green', 'Subtract it <b>from 99</b>'),
        row('yellow', '<b>Double</b> it'),
      ];
  return `
    ${ident(
      L,
      tr ? '<b>Sürekli ilgi ister.</b> Ekranda renkli bir lamba ve iki haneli bir sayı, altında sayı yazan üç düğme.' : '<b>Needy.</b> A coloured lamp and a two-digit number, with three number buttons below.'
    )}
    ${needs(L, 'verify')}
    <p>${
      tr
        ? `Devreye girince sayıyı lambanın rengine göre dönüştürün; imhacı sonucun yazdığı düğmeye basar. ${mark('Sonuç her zaman iki hanedir')}: 100 veya üstüyse son iki haneyi alın (116 → 16).`
        : `When it switches on, transform the number by the lamp colour; the defuser presses the result. ${mark('The result is always two digits')}: if it is 100 or more, keep the last two (116 → 16).`
    }</p>
    <table class="rules narrow"><thead><tr><th>${tr ? 'Lamba' : 'Lamp'}</th><th>${tr ? 'Sayıya ne yapılır?' : 'What to do'}</th></tr></thead><tbody>${rows.join('')}</tbody></table>
    ${example(L, tr ? 'Lamba <b>sarı</b>, sayı <b>58</b> → 116 → <b>16</b>. Lamba <b>yeşil</b> olsaydı 99 − 58 = <b>41</b>.' : 'Lamp <b>yellow</b>, number <b>58</b> → 116 → <b>16</b>. With a <b>green</b> lamp: 99 − 58 = <b>41</b>.')}
    ${warn(L, tr ? ['Düğmelerdeki yanlış sayılar başka renklerin sonucudur; rengi iki kez teyit edin.', 'Süre biterse ya da yanlış düğmeye basılırsa hata yazılır.'] : ['The wrong buttons are other colours’ results; double-check the colour.', 'Running out of time or a wrong button causes a strike.'])}`;
};
