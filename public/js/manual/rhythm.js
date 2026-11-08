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
        ? 'Büyük bir lamba ve BAS düğmesi; lamba bir desenle yanıp söner. <b>Her zaman sayacın yanındadır.</b>'
        : 'A big lamp and a PRESS button; the lamp blinks in a pattern. <b>Always next to the timer.</b>'
    )}
    ${needs(L, 'rhythm')}
    ${steps(
      tr
        ? [
            `Lamba her turda ${mark('4 kez')} yanar: kısa ya da uzun. ${mark('Uzun bir karanlık')} desenin başıdır. Desenin rakamını tablodan bulun.`,
            `Lamba ${swatch('amber', L)} ise rakama ${mark('pil sayısını ekleyin')} (son rakamı tutun). ${swatch('white', L)} ise rakam aynen kalır.`,
            `İmhacı BAS’a, sayaçtaki ${mark('saniyenin son rakamı')} bu rakamken basar.`,
          ]
        : [
            `Each cycle the lamp lights ${mark('4 times')}: short or long. ${mark('A long darkness')} marks the start. Find the pattern’s digit in the table.`,
            `If the lamp is ${swatch('amber', L)}, ${mark('add the battery count')} (keep the last digit). If ${swatch('white', L)}, the digit stays.`,
            `The defuser presses PRESS when the ${mark('last digit of the seconds')} equals that digit.`,
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Desen' : 'Pattern'}</th><th>${tr ? 'Okunuşu' : 'Read as'}</th><th>${tr ? 'Rakam' : 'Digit'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? `Desen <b>kısa · UZUN · UZUN · kısa</b> → 0. Lamba turuncu, 3 pil → <b>3</b>. Sayaç …<b>3</b> iken bas: 03:2<b>3</b>, 03:1<b>3</b>…`
        : `Pattern <b>short · LONG · LONG · short</b> → 0. Amber lamp, 3 batteries → <b>3</b>. Press when the timer ends in <b>3</b>: 03:2<b>3</b>, 03:1<b>3</b>…`
    )}
    ${warn(
      L,
      tr ? ['Hatalar sayacı hızlandırır; rakam gelmeden hazır olun.', 'Yanlış anda basmak hata yazdırır.'] : ['Strikes speed up the timer; be ready before the digit comes.', 'Pressing at the wrong moment causes a strike.']
    )}`;
};
