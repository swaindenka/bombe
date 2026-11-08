import { gateIcon, GATE_PATH } from '/shared/icons.js';
import { swatch, ident, needs, steps, example, warn, mark } from './common.js';

// Modüldeki devrenin aynısı: A,B → üst kapı; B,C → alt kapı; üst + alt → sağ kapı → lamba
function schema(L) {
  const tr = L === 'tr';
  const box = (x, y, label) =>
    `<g transform="translate(${x - 12} ${y - 12})" class="sch-gate">${GATE_PATH.circle.replace('r="9"', 'r="11"')}</g><text x="${x}" y="${y + 4}" class="sch-q">?</text><text x="${x}" y="${y - 17}" class="sch-lbl">${label}</text>`;
  return `<svg class="logic-schema" viewBox="0 0 220 130" aria-hidden="true">
    <path d="M24 26H52V40H68M24 66H44V52H68M44 66V80H68M24 106H52V92H68M92 46H112V60H128M92 86H112V72H128M152 66H176" class="sch-wire"/>
    <text x="12" y="30" class="sch-in">A</text><text x="12" y="70" class="sch-in">B</text><text x="12" y="110" class="sch-in">C</text>
    ${box(80, 46, tr ? 'Üst' : 'Top')}${box(80, 86, '')}<text x="80" y="118" class="sch-lbl">${tr ? 'Alt' : 'Bottom'}</text>
    ${box(140, 66, tr ? 'Sağ' : 'Right')}
    <circle cx="190" cy="66" r="11" class="sch-lamp"/><text x="190" y="94" class="sch-lbl">${tr ? 'Lamba' : 'Lamp'}</text>
  </svg>`;
}

export default (L) => {
  const tr = L === 'tr';
  const rule = (shape, text) => `<tr><td class="center">${gateIcon(shape)}</td><td>${text}</td></tr>`;
  const rules = tr
    ? [
        rule('circle', `<b>Daire</b>: ${mark('iki giriş de açık')} ise açık`),
        rule('triangle', `<b>Üçgen</b>: ${mark('en az bir giriş açık')} ise açık`),
        rule('diamond', `<b>Elmas</b>: ${mark('girişler farklı')} ise açık`),
      ]
    : [
        rule('circle', `<b>Circle</b>: on if ${mark('both')} inputs are ON`),
        rule('triangle', `<b>Triangle</b>: on if ${mark('at least one')} input is ON`),
        rule('diamond', `<b>Diamond</b>: on if the inputs ${mark('differ')}`),
      ];
  return `
    ${ident(
      L,
      tr
        ? 'Solda A, B, C girişleri, ortada şekilli üç kapı, sağda çerçeveli bir lamba; altta A, B, C anahtarları ve TEST.'
        : 'Inputs A, B, C on the left, three shaped gates, a ringed lamp on the right; switches A, B, C and TEST below.'
    )}
    ${needs(L, 'logic')}
    <div class="rule-split">
      ${schema(L)}
      <table class="rules compact"><tbody>${rules.join('')}
        <tr><td class="center">${gateIcon('triangle', 'inv')}</td><td>${tr ? `<b>Turuncu</b> kapı: kuralın sonucunu ${mark('tersine çevirin')}` : `<b>Amber</b> gate: ${mark('invert')} the rule’s result`}</td></tr>
      </tbody></table>
    </div>
    ${steps(
      tr
        ? [
            'İmhacıdan üç kapının <b>şeklini</b> ve <b>rengini</b> (beyaz / turuncu), lambanın <b>çerçeve rengini</b> isteyin.',
            `Çerçeve ${swatch('green', L)} → çıkış ${mark('AÇIK')} olmalı. Çerçeve ${swatch('red', L)} → çıkış ${mark('KAPALI')} olmalı.`,
            'Anahtar yukarı = AÇIK, aşağı = KAPALI. İstenen çıkışı veren bir dizilim bulun, ayarlatın ve <b>TEST</b>’e bastırın.',
          ]
        : [
            'Ask for each gate’s <b>shape</b> and <b>colour</b> (white / amber) and the lamp’s <b>ring colour</b>.',
            `${swatch('green', L)} ring → the output must be ${mark('ON')}. ${swatch('red', L)} ring → it must be ${mark('OFF')}.`,
            'Switch up = ON, down = OFF. Find a setting that gives the required output, set it and press <b>TEST</b>.',
          ]
    )}
    ${example(
      L,
      tr
        ? 'Üst: beyaz daire · Alt: turuncu üçgen · Sağ: beyaz elmas · çerçeve yeşil.<br>Deneyin A↑ B↑ C↓: üst = ikisi de açık → açık; alt = en az biri açık → açık, turuncu → <b>kapalı</b>; sağ = açık ile kapalı farklı → <b>açık</b> ✔.'
        : 'Top: white circle · Bottom: amber triangle · Right: white diamond · green ring.<br>Try A↑ B↑ C↓: top = both on → on; bottom = at least one on → on, amber → <b>off</b>; right = on vs off differ → <b>on</b> ✔.'
    )}
    ${warn(
      L,
      tr
        ? ['Birden çok doğru dizilim olabilir; biri yeter. Lamba siz TEST’e basana kadar hiçbir şey göstermez.', 'B girişi iki kapıya birden gider.']
        : ['Several settings may work; any one will do. The lamp shows nothing until TEST.', 'Input B feeds both of the first two gates.']
    )}`;
};
