import { CODE_COLORS, CODE_TRIES } from '/shared/modules/codebreaker.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const colors = CODE_COLORS.map((c) => swatch(c, L)).join(' ');
  return `
    ${ident(
      L,
      tr
        ? 'Renkli çerçeveli bir deneme ekranı (6 satır), altında 4 renk yuvası ve DENE düğmesi.'
        : 'A framed screen listing up to 6 tries, 4 colour slots and a TRY button.'
    )}
    ${needs(L, 'codebreaker')}
    ${steps(
      tr
        ? [
            `Gizli kod ${mark('4 renktir')}: ${colors} renklerinden dördü, ${mark('her biri en fazla bir kez')}.`,
            'İmhacı yuvalara tıklayarak renk seçer (her tıklama sıradaki renge geçer) ve <b>DENE</b>’ye basar.',
            'Her denemenin yanında ▲ ve ● işaretleri çıkar. Anlamları ekranın <b>çerçeve rengine</b> bağlıdır (tablo).',
            `${CODE_TRIES} deneme hakkı vardır. Biterse ${mark('HATA')} yazılır ve yeni bir kod gelir (çerçeve rengi de değişebilir).`,
          ]
        : [
            `The secret code is ${mark('4 colours')}: four of ${colors}, ${mark('each at most once')}.`,
            'The defuser clicks the slots to pick colours (each click moves to the next colour) and presses <b>TRY</b>.',
            'Each try shows ▲ and ● marks. What they mean depends on the screen’s <b>frame colour</b> (table).',
            `There are ${CODE_TRIES} tries. When they run out, a ${mark('STRIKE')} is recorded and a new code appears (the frame may change).`,
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Çerçeve' : 'Frame'}</th><th>▲</th><th>●</th></tr></thead><tbody>
      <tr><td class="nowrap">${swatch('blue', L)}</td><td>${tr ? 'doğru renk, <b>doğru yerde</b>' : 'right colour, <b>right place</b>'}</td><td>${tr ? 'doğru renk, <b>yanlış yerde</b>' : 'right colour, <b>wrong place</b>'}</td></tr>
      <tr><td class="nowrap">${swatch('amber', L)}</td><td>${tr ? 'doğru renk, <b>yanlış yerde</b>' : 'right colour, <b>wrong place</b>'}</td><td>${tr ? 'doğru renk, <b>doğru yerde</b>' : 'right colour, <b>right place</b>'}</td></tr>
    </tbody></table>
    <h3>${tr ? 'Düşünme ipuçları' : 'Thinking tips'}</h3>
    <ul>
      ${
        tr
          ? `<li>▲ + ● toplamı, denemedeki renklerden ${mark('kaçının kodda olduğunu')} söyler. Kodda 5 renkten 4’ü var: toplam 3 ise denemede kullanmadığınız renk kesin koddadır.</li>
             <li>Toplam 4 ise renkler tamam; artık sadece sıralama kaldı.</li>
             <li>Her yeni deneme ${mark('önceki bütün işaretlerle')} uyumlu olsun; uymayan bir deneme hakkı boşa harcar.</li>`
          : `<li>▲ + ● tells you ${mark('how many of the tried colours are in the code')}. The code uses 4 of 5 colours: a total of 3 means the colour you didn’t try is certainly in it.</li>
             <li>A total of 4 means the colours are right; only the order is left.</li>
             <li>Make every new try ${mark('consistent with all earlier marks')}; an inconsistent try wastes a turn.</li>`
      }
    </ul>
    ${example(
      L,
      tr
        ? 'Mavi çerçeve. Deneme <b>kırmızı · mavi · yeşil · sarı</b> → <b>▲▲●</b>: iki renk doğru yerde, biri yanlış yerde, toplam 3. Demek ki <b>beyaz kesin kodda</b> ve dört renkten biri kodda yok. Sonraki denemede beyazı kullanın ve sırayla hangi rengin çıktığını eleyin.'
        : 'Blue frame. Try <b>red · blue · green · yellow</b> → <b>▲▲●</b>: two in the right place, one misplaced, total 3. So <b>white is certainly in the code</b> and one of the four is not. Use white next and work out which colour drops out.'
    )}
    ${warn(
      L,
      tr
        ? ['Turuncu çerçevede işaretlerin anlamı tersine döner; çerçeveyi her yeni kodda yeniden sorun.', 'Denemeleri ortak notlara yazın; ekrandaki eski satırları imhacıya tekrar okutmak zaman kaybettirir.']
        : ['With an amber frame the marks swap meaning; ask for the frame again after every new code.', 'Write the tries into the shared notes; having old rows re-read wastes time.']
    )}`;
};
