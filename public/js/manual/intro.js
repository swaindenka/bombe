import { VOWELS, INDICATOR_CODES, PORT_TYPES } from '/shared/edgework.js';
import { moduleName } from '../i18n.js';
import { mark, NEEDS, NEED_LABEL, example, warn } from './common.js';

const ORDER = ['wires', 'switches', 'tiles', 'glyphs', 'arrows', 'maze', 'stroop', 'safe', 'patch', 'gauges', 'rhythm', 'cipher', 'homophones'];

function needsTable(L) {
  const keys = ['batteries', 'odd', 'lastDigit', 'vowel', 'lit', 'ports'];
  const head = keys.map((k) => `<th class="center">${NEED_LABEL[L][k].split(' ')[0]}</th>`).join('');
  const rows = ORDER.map(
    (t) =>
      `<tr><td>${moduleName(t, L)}</td>${keys
        .map((k) => `<td class="center">${NEEDS[t].includes(k) || (k === 'odd' && NEEDS[t].includes('lastDigit')) ? '●' : ''}</td>`)
        .join('')}</tr>`
  ).join('');
  const legend = keys.map((k) => `<span class="need-chip">${NEED_LABEL[L][k]}</span>`).join(' ');
  return `<p class="small">${legend}</p><table class="rules compact"><thead><tr><th>${L === 'tr' ? 'Modül' : 'Module'}</th>${head}</tr></thead><tbody>${rows}</tbody></table>
    <p class="small muted">${L === 'tr' ? 'Sürekli ilgi isteyen modüller (Soğutucu, Parola, Telsiz, Basınç Vanası) kasa bilgisi istemez.' : 'Needy modules (Coolant, Passphrase, Radio, Pressure Valve) need no casing info.'}</p>`;
}

export default (L) => {
  const tr = L === 'tr';
  const lit = '<span class="ind-sample lit">●</span>&nbsp;ZET';
  const unlit = '<span class="ind-sample">●</span>&nbsp;KAV';
  if (tr)
    return `
    <p class="lead">Bu kılavuz bombayı <b>göremeyen</b> uzmanlar içindir. İmhacı gördüğünü anlatır, siz kuralı uygulayıp ne yapacağını söylersiniz. ${mark('İmhacı bu kılavuza bakamaz.')}</p>

    <h3>Bu kılavuz nasıl okunur?</h3>
    <ul class="legend">
      <li>${mark('Sarı vurgulu')} yerler kuralın kilit noktasıdır; önce onlara bakın.</li>
      <li>Her sayfanın başındaki <span class="need-chip">Gerekenler</span> satırı, o modül için imhacıdan hangi kasa bilgisini istemeniz gerektiğini söyler.</li>
      <li><b>📝 Örnek</b> kutuları kuralın uygulanmış hâlidir. <b>⚠ Dikkat</b> kutuları en sık yapılan hatalardır.</li>
    </ul>

    <h3>Sayaç ve hatalar</h3>
    <ul>
      <li>Her yanlış hamle bir <b>HATA</b> yazdırır ve sayacı ${mark('%25 hızlandırır')}.</li>
      <li>Hata hakkı dolarsa ya da süre biterse bomba patlar.</li>
      <li>Bütün normal modüller çözülünce bomba imha edilir. Çözülen modülün sağ üst ışığı <b>yeşil</b> yanar.</li>
      <li><b>Sürekli ilgi isteyen</b> modüllerin (üstünde küçük geri sayım ekranı olanlar) çözülmesi gerekmez; devreye girdiklerinde süre bitmeden doğru hamle yapılmalıdır.</li>
    </ul>

    <h3>Kısa sözlük</h3>
    <dl class="defs">
      <dt>Seri numarası</dt>
      <dd>Bir kenardaki beyaz etiketteki 6 karakterlik kod. ${mark('Son karakter her zaman bir rakamdır')}; "son rakam" bu karakterdir.</dd>
      <dt>Tek / çift</dt>
      <dd><b>Tek:</b> 1, 3, 5, 7, 9 · <b>Çift:</b> ${mark('0')}, 2, 4, 6, 8 (0 çifttir).</dd>
      <dt>Sesli harf</dt>
      <dd>Bu kılavuzda yalnızca ${mark(VOWELS.join(' · '))} sesli harf sayılır. Seri numaralarında O harfi hiç yoktur.</dd>
      <dt>Pil sayısı</dt>
      <dd>${mark('Pillerin toplam adedidir, yuvaların sayısı değil.')} İki pilli bir yuva 2 sayılır.</dd>
      <dt>Yanan gösterge</dt>
      <dd>Yanında üç harfli etiketi olan küçük ışık (ör. ${lit}). Işığı açıksa <b>yanan</b>dır. Sönük göstergeler (ör. ${unlit}) ${mark('hiçbir kuralda sayılmaz')}. Olası etiketler: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Port sayısı</dt>
      <dd>Bütün kenarlardaki bütün plakaların ${mark('üzerindeki port kutucuklarının toplamıdır')}, plaka sayısı değil. Port türleri: ${PORT_TYPES.join(', ')}.</dd>
      <dt>"Son rakamını alın"</dt>
      <dd>Bir hesap 10 veya daha büyük çıkarsa yalnızca son rakamı kullanılır: 14 → 4, 20 → 0.</dd>
      <dt>Okuma sırası</dt>
      <dd>Soldan sağa, sonra yukarıdan aşağıya (sol üst = 1, sağ üst = 2, sol alt = 3, sağ alt = 4).</dd>
    </dl>

    <h3>Hangi modül hangi kasa bilgisini ister?</h3>
    ${needsTable(L)}
    ${example(L, 'Oyunun başında imhacıya kenarları (<b>E</b> tuşu) okutun ve seri numarasını, pil sayısını, yanan göstergeleri ve portları <b>ortak notlara</b> yazın. Not defteri seri numarasından son rakamı, tek/çift durumunu ve sesli harfi otomatik gösterir.', 'Önerilen başlangıç')}
    ${warn(L, ['Pil yuvasını değil pilleri sayın.', 'Port plakasını değil portları sayın; dört kenarın hepsine bakın.', '0 çift sayıdır.'])}`;
  return `
    <p class="lead">This manual is for the experts who <b>cannot see</b> the bomb. The defuser describes what they see; you apply the rule and tell them what to do. ${mark('The defuser may not read this manual.')}</p>

    <h3>How to read this manual</h3>
    <ul class="legend">
      <li>${mark('Highlighted')} parts are the key points of a rule; look at them first.</li>
      <li>The <span class="need-chip">You need</span> line at the top of each page tells you which casing info to ask the defuser for.</li>
      <li><b>📝 Example</b> boxes show the rule applied. <b>⚠ Watch out</b> boxes list the most common mistakes.</li>
    </ul>

    <h3>Timer and strikes</h3>
    <ul>
      <li>Every wrong action records a <b>STRIKE</b> and makes the timer ${mark('25% faster')}.</li>
      <li>The bomb explodes when the strikes run out or the time reaches zero.</li>
      <li>The bomb is defused once every regular module is solved. A solved module’s top-right light turns <b>green</b>.</li>
      <li><b>Needy</b> modules (with a small countdown on top) are never solved; when they switch on, the right action must be taken before the countdown ends.</li>
    </ul>

    <h3>Glossary</h3>
    <dl class="defs">
      <dt>Serial number</dt>
      <dd>The 6-character code on a white sticker. ${mark('The last character is always a digit')}; the "last digit" is that character.</dd>
      <dt>Odd / even</dt>
      <dd><b>Odd:</b> 1, 3, 5, 7, 9 · <b>Even:</b> ${mark('0')}, 2, 4, 6, 8 (0 is even).</dd>
      <dt>Vowel</dt>
      <dd>Only ${mark(VOWELS.join(' · '))} count as vowels. Serial numbers never contain the letter O.</dd>
      <dt>Battery count</dt>
      <dd>${mark('The total number of batteries, not holders.')} A holder with two batteries counts as 2.</dd>
      <dt>Lit indicator</dt>
      <dd>A small light with a three-letter label (e.g. ${lit}). If the light is on it is <b>lit</b>. Unlit indicators (e.g. ${unlit}) ${mark('never count')}. Possible labels: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Port count</dt>
      <dd>${mark('The total number of port sockets')} on every plate on every edge — not the number of plates. Port types: ${PORT_TYPES.join(', ')}.</dd>
      <dt>"Keep the last digit"</dt>
      <dd>If a result is 10 or more, use only its last digit: 14 → 4, 20 → 0.</dd>
      <dt>Reading order</dt>
      <dd>Left to right, then top to bottom (top-left = 1, top-right = 2, bottom-left = 3, bottom-right = 4).</dd>
    </dl>

    <h3>Which module needs which casing info?</h3>
    ${needsTable(L)}
    ${example(L, 'At the start, have the defuser read the edges (<b>E</b> key) and write the serial number, batteries, lit indicators and ports into the <b>shared notes</b>. The notes show the last digit, odd/even and vowel automatically.', 'Recommended start')}
    ${warn(L, ['Count batteries, not holders.', 'Count ports, not plates — check all four edges.', '0 is an even number.'])}`;
};
