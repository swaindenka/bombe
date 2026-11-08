import { SWITCH_PATTERNS, SWITCH_LAMPS } from '/shared/modules/switches.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

const arrows = (p) => `<span class="arrows">${p.split('').map((c) => (c === 'U' ? '↑' : '↓')).join(' ')}</span>`;

export default (L) => {
  const tr = L === 'tr';
  const rows = SWITCH_LAMPS.map((c) => {
    const p = SWITCH_PATTERNS[c];
    return `<tr><td class="nowrap">${swatch(c, L)}</td><td>${arrows(p.even)}</td><td>${arrows(p.odd)}</td></tr>`;
  }).join('');
  const ex = SWITCH_PATTERNS.blue.odd;
  return `
    ${ident(L, tr ? 'Üstünde renkli bir lamba, ortasında 5 şalter, altında ONAY düğmesi.' : 'A coloured lamp on top, 5 switches and a SUBMIT button.')}
    ${needs(L, 'switches')}
    ${steps(
      tr
        ? [
            'Lambanın rengi ve seri no. son rakamının tek/çift oluşuyla tablodan dizilimi okuyun (↑ yukarı, ↓ aşağı).',
            `Dizilim normalde ${mark('soldan sağa')} uygulanır. Bombada ${mark('en az bir yanan gösterge')} varsa dizilimi ${mark('sağdan sola')} uygulayın: tablodaki ilk ok en sağdaki şaltere gider.`,
            'İmhacı şalterleri ayarlayıp <b>ONAY</b>’a basar.',
          ]
        : [
            'Read the pattern from the lamp colour and whether the serial’s last digit is odd or even (↑ up, ↓ down).',
            `Normally apply it ${mark('left to right')}. If the bomb has ${mark('at least one lit indicator')}, apply it ${mark('right to left')}: the first arrow goes to the rightmost switch.`,
            'The defuser sets the switches and presses <b>SUBMIT</b>.',
          ]
    )}
    <table class="rules"><thead><tr><th>${tr ? 'Lamba' : 'Lamp'}</th><th>${tr ? 'Son rakam çift' : 'Last digit even'}</th><th>${tr ? 'Son rakam tek' : 'Last digit odd'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${example(
      L,
      tr
        ? `Lamba <b>mavi</b>, seri no. <b>…5</b> (tek) → ${arrows(ex)}. Yanan bir gösterge var → sağdan sola: en sağdaki şalter ${ex[0] === 'U' ? '↑' : '↓'}, sonra sola doğru devam. Soldan okununca: ${arrows(ex.split('').reverse().join(''))}.`
        : `Lamp <b>blue</b>, serial ends in <b>5</b> (odd) → ${arrows(ex)}. There is a lit indicator → right to left: the rightmost switch is ${ex[0] === 'U' ? '↑' : '↓'}, then continue leftwards. Read from the left: ${arrows(ex.split('').reverse().join(''))}.`
    )}
    ${warn(
      L,
      tr
        ? ['Sönük göstergeler sayılmaz.', 'Şalter çevirmek güvenlidir; yalnızca yanlış dizilimle ONAY’a basmak hata yazdırır.']
        : ['Unlit indicators don’t count.', 'Flipping switches is safe; only SUBMIT with a wrong pattern causes a strike.']
    )}`;
};
