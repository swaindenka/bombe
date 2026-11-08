import { STROOP_WORDS } from '/shared/words.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

export default (L, CL) => {
  const tr = L === 'tr';
  const words = Object.values(STROOP_WORDS[CL] || STROOP_WORDS.tr).join(', ');
  const parts = tr
    ? [
        ['Kelime', 'Ekranda <b>ne yazdığı</b> (ör. "MAVİ")'],
        ['Mürekkep', 'Kelimenin <b>hangi renkle</b> yazıldığı'],
        ['Arka plan', 'Ekranın zemini: <b>açık</b> (krem) ya da <b>koyu</b> (siyah)'],
        ['Düğme rengi', 'Düğmenin <b>kendi rengi</b> (dolgusu)'],
        ['Düğme yazısı', 'Düğmenin <b>üstünde yazan</b> renk adı'],
      ]
    : [
        ['Word', 'What the screen <b>says</b> (e.g. "BLUE")'],
        ['Ink', 'The <b>colour</b> the word is written in'],
        ['Background', 'The screen behind it: <b>light</b> (cream) or <b>dark</b> (black)'],
        ['Button colour', 'The button’s <b>own colour</b> (fill)'],
        ['Button label', 'The colour name <b>written on</b> the button'],
      ];
  const partsTable = `<table class="rules compact"><tbody>${parts.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>`;
  const decide = tr
    ? `<table class="rules"><thead><tr><th></th><th>${mark('Son rakam TEK')}</th><th>${mark('Son rakam ÇİFT')}</th></tr></thead><tbody>
        <tr><th>Neye bak?</th><td>Düğmenin <b>üstünde yazana</b></td><td>Düğmenin <b>kendi rengine</b></td></tr>
        <tr><th>Neye bakma?</th><td>Düğmenin rengine</td><td>Düğmenin üstündeki yazıya</td></tr>
        <tr><th>Basılacak düğme</th><td>Üstünde hedef rengin <b>adı yazan</b></td><td>Kendisi hedef <b>renkte olan</b></td></tr>
      </tbody></table>`
    : `<table class="rules"><thead><tr><th></th><th>${mark('Last digit ODD')}</th><th>${mark('Last digit EVEN')}</th></tr></thead><tbody>
        <tr><th>Look at</th><td>What is <b>written on</b> the button</td><td>The button’s <b>own colour</b></td></tr>
        <tr><th>Ignore</th><td>The button’s colour</td><td>The text on the button</td></tr>
        <tr><th>Press the button</th><td><b>labelled</b> with the target colour</td><td>that <b>is</b> the target colour</td></tr>
      </tbody></table>`;
  return `
    ${ident(
      L,
      tr
        ? 'Ekranında bir renk adı yazan, altında 2×2 dizili dört renkli düğme ve sol üstte 3 aşama ışığı olan modül.'
        : 'A module whose screen shows a colour name, with four coloured buttons in a 2×2 layout and 3 stage lights.'
    )}
    ${needs(L, 'stroop')}
    <p>${tr ? 'Modülde beş şey birbirine karışır; imhacı her birini <b>ayrı ayrı</b> söylemelidir:' : 'Five things get mixed up here; the defuser should say each one <b>separately</b>:'}</p>
    ${partsTable}
    <p>${tr ? 'Modül <b>3 aşamadır</b>. Her aşamada şu üç soruyu sırayla sorun:' : 'The module has <b>3 stages</b>. At each stage ask these three questions in order:'}</p>
    ${steps(
      tr
        ? [
            `<b>Kelime ile mürekkep aynı renk mi?</b> (ör. "KIRMIZI" kırmızıyla yazılmış) → ${mark('Evet ise')} aşama numarası kadarıncı düğmeye basın: 1. aşamada <b>sol üst</b>, 2. aşamada <b>sağ üst</b>, 3. aşamada <b>sol alt</b>. Diğer sorulara geçmeyin.`,
            `<b>Hedef renk ne?</b> Arka plan ${mark('AÇIK')} → hedef, <b>kelimenin söylediği</b> renk. Arka plan ${mark('KOYU')} → hedef, <b>mürekkebin</b> rengi.`,
            '<b>Hangi düğme?</b> Seri no. son rakamına göre aşağıdaki tabloya bakın.',
          ]
        : [
            `<b>Do the word and the ink match?</b> (e.g. "RED" written in red) → ${mark('If yes')}, press the button matching the stage number: stage 1 <b>top-left</b>, stage 2 <b>top-right</b>, stage 3 <b>bottom-left</b>. Skip the other questions.`,
            `<b>What is the target colour?</b> ${mark('LIGHT')} background → the colour <b>the word names</b>. ${mark('DARK')} background → the <b>ink</b> colour.`,
            '<b>Which button?</b> Check the table below using the serial’s last digit.',
          ]
    )}
    ${decide}
    ${example(
      L,
      tr
        ? `Ekranda <b>MAVİ</b> yazıyor, <b>kırmızı</b> mürekkeple, <b>koyu</b> arka planda → hedef <b>kırmızı</b> (mürekkep).<br>
           • Seri <b>…7 (tek)</b> → üstünde "KIRMIZI" <b>yazan</b> düğme (rengi ne olursa olsun).<br>
           • Seri <b>…4 (çift)</b> → <b>kendisi kırmızı</b> olan düğme (üstünde ne yazarsa yazsın).<br>
           • Aynı ekran <b>açık</b> arka planda olsaydı hedef <b>mavi</b> (kelimenin söylediği) olurdu.`
        : `The screen says <b>BLUE</b> in <b>red</b> ink on a <b>dark</b> background → target is <b>red</b> (the ink).<br>
           • Serial <b>…7 (odd)</b> → the button <b>labelled</b> "RED" (whatever its colour).<br>
           • Serial <b>…4 (even)</b> → the button that <b>is red</b> (whatever it says).<br>
           • On a <b>light</b> background the target would be <b>blue</b> (what the word says).`
    )}
    ${warn(
      L,
      tr
        ? [
            `En sık hata: "yazan" ile "renkte olan" düğmeyi karıştırmak. Uzman şöyle söylesin: "Üstünde KIRMIZI ${mark('yazan')} düğme" ya da "${mark('Kendisi')} kırmızı olan düğme".`,
            'Düğme numaraları okuma sırasıdır: sol üst 1, sağ üst 2, sol alt 3, sağ alt 4.',
            'Yanlış düğme hata yazdırır ve ekran tamamen değişir; aşama ilerlemez.',
          ]
        : [
            `Most common mistake: mixing up the button that is ${mark('labelled')} a colour and the button that ${mark('is')} that colour. Say it explicitly.`,
            'Buttons are numbered in reading order: top-left 1, top-right 2, bottom-left 3, bottom-right 4.',
            'A wrong button causes a strike and the whole screen changes; the stage does not advance.',
          ]
    )}
    <p class="small">${tr ? 'Bu bombadaki renk kelimeleri' : 'Colour words on this bomb'}: <b>${words}</b></p>`;
};
