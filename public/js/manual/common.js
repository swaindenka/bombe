// Kılavuz sayfalarının ortak yapı taşları. Her sayfa aynı sade düzeni kullanır:
// Tanıma → Gerekenler → Kurallar (ve ham veri tablosu) → Örnek → Dikkat.
// Kılavuz cevapları hazır vermez; kuralı verir. Uzman kuralı imhacının anlattığına uygulayarak bulur.

import { COLOR_HEX, colorName } from '/shared/colors.js';

export const swatch = (c, L) =>
  `<span class="swatch"><i style="background:${COLOR_HEX[c]}"></i>${colorName(L, c)}</span>`;

export const cap = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

/** Kilit nokta vurgusu */
export const mark = (s) => `<mark>${s}</mark>`;

export const ident = (L, text) =>
  `<p class="ident"><b>👁 ${L === 'tr' ? 'Tanıma' : 'Recognize'}:</b> ${text}</p>`;

/** Düz not kutusu */
export const note = (html) => `<div class="note">${html}</div>`;

// Her modülün imhacıdan istemeniz gereken kasa bilgileri
export const NEEDS = {
  wires: ['batteries', 'odd', 'vowel'],
  switches: ['odd', 'lit'],
  tiles: ['batteries'],
  glyphs: ['vowel'],
  arrows: ['odd'],
  maze: [],
  scale: ['batteries'],
  patch: ['odd', 'batteries'],
  elevator: [],
  stroop: ['odd'],
  safe: ['batteries', 'lastDigit', 'ports', 'lit'],
  gauges: ['vowel'],
  rhythm: ['batteries', 'timer'],
  cipher: ['batteries', 'vowel'],
  logic: [],
  homophones: [],
  coolant: [],
  passphrase: [],
  radio: [],
  verify: ['lastDigit'],
  pressure: [],
};

export const NEED_LABEL = {
  tr: {
    batteries: '🔋 Pil sayısı',
    odd: '#️⃣ Seri no. son rakamı tek mi, çift mi',
    lastDigit: '#️⃣ Seri no. son rakamı',
    vowel: '🔤 Seri no.’da sesli harf var mı',
    lit: '💡 Yanan gösterge sayısı',
    ports: '🔌 Port sayısı',
    timer: '⏱ Sayacın saniyesi',
  },
  en: {
    batteries: '🔋 Battery count',
    odd: '#️⃣ Serial last digit odd or even',
    lastDigit: '#️⃣ Serial last digit',
    vowel: '🔤 Vowel in the serial',
    lit: '💡 Lit indicator count',
    ports: '🔌 Port count',
    timer: '⏱ Timer seconds',
  },
};

/** "Gerekenler" satırı: bu modül için kasadan hangi bilgiler lazım */
export function needs(L, type) {
  const list = NEEDS[type] || [];
  const label = L === 'tr' ? 'Gerekenler' : 'You need';
  if (!list.length) return `<div class="needs"><b>${label}:</b> <span class="need-none">${L === 'tr' ? 'Kasa bilgisi gerekmez' : 'No casing info needed'}</span></div>`;
  return `<div class="needs"><b>${label}:</b> ${list.map((k) => `<span class="need-chip">${NEED_LABEL[L][k]}</span>`).join('')}</div>`;
}

/** Numaralı adımlar */
export const steps = (items) => `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;

/** Kurallar sırayla denenir uyarısı */
export const ruleOrder = (L) =>
  `<div class="rule-order">↓ ${
    L === 'tr'
      ? 'Kuralları <b>yukarıdan aşağıya</b> deneyin. <b>İlk uyan kural geçerlidir</b>.'
      : 'Check the rules <b>from top to bottom</b>. <b>The first rule that applies wins</b>.'
  }</div>`;

export const example = (L, html, title) =>
  `<div class="example"><div class="ex-title">📝 ${title || (L === 'tr' ? 'Örnek' : 'Example')}</div>${html}</div>`;

export const warn = (L, items) =>
  `<div class="warn"><div class="warn-title">⚠ ${L === 'tr' ? 'Dikkat' : 'Watch out'}</div><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;

/** Küçük başlık */
export const sub = (text) => `<h3>${text}</h3>`;

export const DIR_LABEL = {
  tr: { N: '↑ Yukarı', E: '→ Sağ', S: '↓ Aşağı', W: '← Sol' },
  en: { N: '↑ Up', E: '→ Right', S: '↓ Down', W: '← Left' },
};
