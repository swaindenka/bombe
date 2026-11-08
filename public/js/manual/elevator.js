import { ident, needs, example, warn, mark, ruleOrder } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? 'Turuncu ekranda kat numarası ve ▲/▼ yön oku, altında 1–9 kat düğmeleri. Bazı düğmelerin köşesinde çağrı lambası yanar.'
        : 'An amber display with a floor number and ▲/▼ arrow, floor buttons 1–9 below. Some buttons have a call light in the corner.'
    )}
    ${needs(L, 'elevator')}
    <p>${
      tr
        ? `Çağrı lambası <b>beyaz</b> (normal) ya da <b>kırmızı</b> (acil) yanar. Çağrıları doğru sırayla karşılayın: ${mark('her basıştan önce')} aşağıdaki kurallarla sıradaki katı bulun.`
        : `A call light is <b>white</b> (normal) or <b>red</b> (emergency). Serve the calls in the right order: ${mark('before every press')}, find the next floor with these rules.`
    }</p>
    ${ruleOrder(L)}
    <ol class="steps">
      ${
        tr
          ? `<li>Kırmızı çağrı varsa → asansöre ${mark('en yakın kırmızı')} çağrı. Uzaklık eşitse üstteki.</li>
             <li>Değilse → okun gösterdiği yöndeki ${mark('en yakın')} beyaz çağrı.</li>
             <li>O yönde çağrı kalmadıysa → ${mark('yön değiştirin')}: diğer yöndeki en yakın çağrı.</li>`
          : `<li>Any red call → the ${mark('nearest red')} call. On a tie, the upper one.</li>
             <li>Otherwise → the ${mark('nearest')} white call in the direction of the arrow.</li>
             <li>No calls left that way → ${mark('turn around')}: the nearest call the other way.</li>`
      }
    </ol>
    <p>${
      tr
        ? 'Doğru basışta asansör o kata gider: ekrandaki kat değişir, ok <b>son gidilen yönü</b> gösterir, o katın lambası söner.'
        : 'On a correct press the elevator moves there: the floor changes, the arrow shows the <b>direction it just travelled</b> and that call light goes out.'
    }</p>
    ${example(
      L,
      tr
        ? 'Kat <b>5 ▲</b>. Çağrılar: 2 beyaz, 4 kırmızı, 7 beyaz, 9 beyaz.<br>Kırmızı var → <b>4</b> (asansör aşağı indi: <b>4 ▼</b>). Aşağıda en yakın beyaz → <b>2</b>. Aşağıda çağrı kalmadı, yön değişir → <b>7</b>, sonra <b>9</b>.'
        : 'Floor <b>5 ▲</b>. Calls: 2 white, 4 red, 7 white, 9 white.<br>A red call → <b>4</b> (it went down: <b>4 ▼</b>). Nearest white below → <b>2</b>. Nothing left below, turn around → <b>7</b>, then <b>9</b>.'
    )}
    ${warn(
      L,
      tr
        ? ['Yanlış kat hata yazdırır; asansör yerinde kalır.', 'Ok, asansörün başlangıçtaki yönünü değil, son gittiği yönü gösterir. Her basıştan sonra yeniden sorun.']
        : ['A wrong floor causes a strike; the elevator stays put.', 'The arrow shows the last direction travelled. Ask again after every press.']
    )}`;
};
