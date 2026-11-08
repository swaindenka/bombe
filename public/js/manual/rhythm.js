import { RHYTHM_PATTERNS } from '/shared/modules/rhythm.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

const beats = (p) => `<span class="beats">${p.split('').map((b) => (b === 'S' ? '<i class="s"></i>' : '<i class="l"></i>')).join('')}</span>`;
const words = (p, tr) => p.split('').map((b) => (b === 'S' ? (tr ? 'kısa' : 'short') : tr ? 'UZUN' : 'LONG')).join(' · ');

export default (L) => {
  const tr = L === 'tr';
  const rows = RHYTHM_PATTERNS.map((p, d) => `<tr><td>${beats(p)}</td><td class="small">${words(p, tr)}</td><td class="digit">${d}</td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? 'Büyük bir lamba ve BAS düğmesi olan modül. Lamba bir desenle yanıp söner ve tekrar eder. <b>Her zaman sayacın yanındadır.</b>'
        : 'A module with a large lamp and a PRESS button. The lamp blinks in a repeating pattern. <b>It is always next to the timer.</b>'
    )}
    ${needs(L, 'rhythm')}
    ${steps(
      tr
        ? [
            `Lamba her turda ${mark('4 kez')} yanar; her yanış <b>kısa</b> ya da <b>uzun</b>dur. ${mark('Uzun bir karanlık')} desenin başladığını gösterir. İmhacı deseni "kısa, uzun, uzun, kısa" diye söylesin.`,
            'Desenin rakamını aşağıdaki tablodan bulun.',
            `Lamba ${swatch('amber', L)} ise rakama ${mark('pil sayısını ekleyin')} (10 veya fazlaysa son rakamı). Lamba ${swatch('white', L)} ise rakam aynen kalır.`,
            `İmhacı BAS’a, sayaçtaki ${mark('saniyenin son rakamı')} bu rakamken basar. Rakam 4 ise sayaç 02:1<b>4</b>, 01:5<b>4</b>, 00:0<b>4</b> gibi ${mark('…4 ile biten')} herhangi bir anda.`,
          ]
        : [
            `Each cycle the lamp lights ${mark('4 times')}; each flash is <b>short</b> or <b>long</b>. ${mark('A long darkness')} marks the start of the pattern. Have the defuser say it as "short, long, long, short".`,
            'Find the pattern’s digit in the table.',
            `If the lamp is ${swatch('amber', L)}, ${mark('add the battery count')} (keep the last digit). If it is ${swatch('white', L)}, the digit stays as is.`,
            `The defuser presses PRESS when the ${mark('last digit of the seconds')} equals that digit. For 4: any moment the timer ${mark('ends in 4')}, e.g. 02:1<b>4</b>, 01:5<b>4</b>, 00:0<b>4</b>.`,
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Desen' : 'Pattern'}</th><th>${tr ? 'Okunuşu' : 'Read as'}</th><th>${tr ? 'Rakam' : 'Digit'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? `Desen <b>kısa · UZUN · UZUN · kısa</b> → rakam <b>0</b>. Lamba <b>turuncu</b>, 3 pil → 0 + 3 = <b>3</b>. Sayaç …<b>3</b> gösterirken bas (ör. 03:2<b>3</b>).`
        : `Pattern <b>short · LONG · LONG · short</b> → digit <b>0</b>. Lamp <b>amber</b>, 3 batteries → 0 + 3 = <b>3</b>. Press while the timer ends in <b>3</b> (e.g. 03:2<b>3</b>).`
    )}
    ${warn(
      L,
      tr
        ? ['Hatalar sayacı hızlandırır; saniyeler daha hızlı akar. Rakam gelmeden hazır olun.', 'Yanlış anda basmak hata yazdırır.']
        : ['Strikes speed up the timer, so seconds tick faster. Be ready before the digit comes.', 'Pressing at the wrong moment causes a strike.']
    )}`;
};
