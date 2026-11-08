import { SWITCH_PATTERNS, SWITCH_LAMPS } from '/shared/modules/switches.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

const arrows = (p) => `<span class="arrows">${p.split('').map((c) => (c === 'U' ? '↑' : '↓')).join(' ')}</span>`;
const rev = (p) => p.split('').reverse().join('');

export default (L) => {
  const tr = L === 'tr';
  // İki ayrı tablo: ters çevirmeyi uzmanın kafasında yapması gerekmesin
  const table = (reversed) =>
    `<table class="rules"><thead><tr><th>${tr ? 'Lamba' : 'Lamp'}</th><th>${tr ? 'Son rakam çift' : 'Last digit even'}</th><th>${tr ? 'Son rakam tek' : 'Last digit odd'}</th></tr></thead><tbody>${SWITCH_LAMPS.map(
      (c) => {
        const p = SWITCH_PATTERNS[c];
        return `<tr><td class="nowrap">${swatch(c, L)}</td><td>${arrows(reversed ? rev(p.even) : p.even)}</td><td>${arrows(reversed ? rev(p.odd) : p.odd)}</td></tr>`;
      }
    ).join('')}</tbody></table>`;
  return `
    ${ident(L, tr ? 'Üstünde renkli bir lamba, ortasında 5 şalter, altında bir ONAY düğmesi olan modül.' : 'A module with a coloured lamp on top, 5 toggle switches and a SUBMIT button.')}
    ${needs(L, 'switches')}
    ${steps(
      tr
        ? [
            `Bombada ${mark('en az bir yanan gösterge')} var mı? Buna göre aşağıdaki <b>A</b> ya da <b>B</b> tablosunu kullanın.`,
            'Lambanın rengi ve seri numarasının son rakamının tek/çift oluşuyla hedef dizilimi okuyun.',
            `Dizilim ${mark('soldan sağa')} okunur: ↑ = şalter yukarıda, ↓ = şalter aşağıda.`,
            'İmhacı şalterleri bu dizilime getirip <b>ONAY</b>’a basar.',
          ]
        : [
            `Does the bomb have ${mark('at least one lit indicator')}? Use table <b>A</b> or <b>B</b> below accordingly.`,
            'Read the target pattern from the lamp colour and whether the serial’s last digit is odd or even.',
            `Patterns are read ${mark('left to right')}: ↑ = switch up, ↓ = switch down.`,
            'The defuser sets the switches and presses <b>SUBMIT</b>.',
          ]
    )}
    <h3>A · ${tr ? 'Yanan gösterge YOK' : 'NO lit indicator'}</h3>
    ${table(false)}
    <h3>B · ${tr ? 'En az bir yanan gösterge VAR' : 'At least one lit indicator'}</h3>
    ${table(true)}
    ${example(
      L,
      tr
        ? 'Lamba <b>mavi</b>, seri no. <b>…5</b> (tek), yanan <b>ZET</b> göstergesi var → <b>B</b> tablosu, mavi, tek sütunu → <span class="arrows">↓ ↑ ↓ ↓ ↑</span>.'
        : 'Lamp <b>blue</b>, serial ends in <b>5</b> (odd), lit <b>ZET</b> indicator → table <b>B</b>, blue, odd column → <span class="arrows">↓ ↑ ↓ ↓ ↑</span>.'
    )}
    ${warn(
      L,
      tr
        ? ['Sönük göstergeler sayılmaz; yalnızca ışığı açık olanlar.', 'Şalter çevirmek hata yazdırmaz. Sadece yanlış dizilimle ONAY’a basmak hata yazdırır.']
        : ['Unlit indicators don’t count; only those with the light on.', 'Flipping switches is safe. Only SUBMIT with a wrong pattern causes a strike.']
    )}`;
};
