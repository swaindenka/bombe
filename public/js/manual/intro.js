import { VOWELS, INDICATOR_CODES, PORT_TYPES } from '/shared/edgework.js';
import { REGULAR_TYPES, NEEDY_TYPES } from '/shared/modules/index.js';
import { moduleName } from '../i18n.js';
import { mark, NEEDS, NEED_LABEL, example, warn } from './common.js';

// 'lastDigit' sütunu hem "son rakam" hem de "tek mi çift mi" isteyen modülleri kapsar
const KEYS = ['batteries', 'lastDigit', 'vowel', 'lit', 'ports'];

/** Hangi modül hangi kasa bilgisini ister (yalnızca bir şey isteyen modüller) */
function needsTable(L) {
  const head = KEYS.map((k) => `<th class="center" title="${NEED_LABEL[L][k]}">${NEED_LABEL[L][k].split(' ')[0]}</th>`).join('');
  const uses = (t, k) => NEEDS[t].includes(k) || (k === 'lastDigit' && NEEDS[t].includes('odd'));
  const rows = [...REGULAR_TYPES, ...NEEDY_TYPES]
    .filter((t) => KEYS.some((k) => uses(t, k)))
    .map((t) => `<tr><td>${moduleName(t, L)}</td>${KEYS.map((k) => `<td class="center">${uses(t, k) ? '●' : ''}</td>`).join('')}</tr>`)
    .join('');
  const legend = KEYS.map((k) => `<span class="need-chip">${NEED_LABEL[L][k]}</span>`).join(' ');
  return `<p class="small">${legend}</p><table class="rules compact"><thead><tr><th>${L === 'tr' ? 'Modül' : 'Module'}</th>${head}</tr></thead><tbody>${rows}</tbody></table>
    <p class="small muted">${L === 'tr' ? 'Listede olmayan modüller kasa bilgisi istemez.' : 'Modules not listed need no casing info.'}</p>`;
}

export default (L) => {
  const tr = L === 'tr';
  const lit = '<span class="ind-sample lit">●</span>&nbsp;ZET';
  const unlit = '<span class="ind-sample">●</span>&nbsp;KAV';
  if (tr)
    return `
    <p class="lead">Bu kılavuz bombayı <b>göremeyen</b> uzmanlar içindir. Kılavuz size cevabı vermez; <b>kuralı</b> verir. İmhacı gördüğünü anlatır, siz kuralı uygulayıp ne yapacağını söylersiniz. ${mark('İmhacı bu kılavuza bakamaz.')}</p>

    <h3>Bomba nasıl çalışır?</h3>
    <ul>
      <li>Bütün normal modüller çözülünce bomba imha edilir. Çözülen modülün sağ üst ışığı <b>yeşil</b> yanar.</li>
      <li>Her yanlış hamle bir <b>HATA</b> yazdırır ve sayacı ${mark('%25 hızlandırır')}. Hata hakkı dolarsa ya da süre biterse bomba patlar.</li>
      <li><b>Sürekli ilgi isteyen</b> modüller (⏱, üstünde küçük geri sayım olanlar) çözülmez. Devreye girdiklerinde süreleri bitmeden doğru hamle yapılmalıdır.</li>
      <li>Her sayfa aynı düzendedir: <b>👁 Tanıma</b>, <span class="need-chip">Gerekenler</span>, kurallar, <b>📝 Örnek</b>, <b>⚠ Dikkat</b>.</li>
    </ul>

    <h3>Bomba kasası</h3>
    <dl class="defs">
      <dt>Seri numarası</dt>
      <dd>Bir kenardaki beyaz etiketteki 6 karakter. ${mark('Son karakter her zaman bir rakamdır')}: "son rakam" odur.</dd>
      <dt>Tek / çift</dt>
      <dd>Tek: 1 3 5 7 9 · Çift: ${mark('0')} 2 4 6 8.</dd>
      <dt>Sesli harf</dt>
      <dd>Yalnızca ${mark(VOWELS.join(' '))}. (Seri numaralarında O harfi yoktur.)</dd>
      <dt>Pil sayısı</dt>
      <dd>${mark('Pillerin toplamı, yuvaların değil.')} İki pilli bir yuva 2 sayılır.</dd>
      <dt>Yanan gösterge</dt>
      <dd>Üç harfli etiketli küçük ışık (${lit}). Sönük olanlar (${unlit}) ${mark('hiçbir kuralda sayılmaz')}. Etiketler: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Port sayısı</dt>
      <dd>Dört kenardaki ${mark('port kutucuklarının toplamı')}, plaka sayısı değil. Türler: ${PORT_TYPES.join(', ')}.</dd>
      <dt>Son rakamı alın</dt>
      <dd>Sonuç 10 veya daha büyükse yalnızca son rakam kullanılır: 14 → 4, 20 → 0.</dd>
      <dt>Okuma sırası</dt>
      <dd>Soldan sağa, sonra yukarıdan aşağıya: sol üst 1, sağ üst 2, sol alt 3, sağ alt 4.</dd>
    </dl>

    <h3>Hangi modül hangi bilgiyi ister?</h3>
    ${needsTable(L)}
    ${example(L, 'İmhacıya önce kenarları (<b>E</b> tuşu) okutun; seri numarasını, pilleri, yanan göstergeleri ve portları <b>ortak notlara</b> yazın. Bu bilgiler bomba boyunca değişmez.', 'İlk 30 saniye')}
    ${warn(L, ['Pil yuvası değil pil; port plakası değil port sayılır.', 'İmhacıya yorum değil, gördüğünü sorun: "Kaç tane?", "Hangi renk?", "Yukarıdan kaçıncı?"'])}`;
  return `
    <p class="lead">This manual is for the experts who <b>cannot see</b> the bomb. It never hands you the answer; it gives you the <b>rule</b>. The defuser describes what they see, you apply the rule and tell them what to do. ${mark('The defuser may not read this manual.')}</p>

    <h3>How the bomb works</h3>
    <ul>
      <li>The bomb is defused once every regular module is solved. A solved module’s top-right light turns <b>green</b>.</li>
      <li>Every wrong action records a <b>STRIKE</b> and makes the timer ${mark('25% faster')}. Run out of strikes or time and the bomb explodes.</li>
      <li><b>Needy</b> modules (⏱, with a small countdown on top) are never solved. When one switches on, the right action must be taken before its countdown ends.</li>
      <li>Every page has the same layout: <b>👁 Recognize</b>, <span class="need-chip">You need</span>, rules, <b>📝 Example</b>, <b>⚠ Watch out</b>.</li>
    </ul>

    <h3>Bomb casing</h3>
    <dl class="defs">
      <dt>Serial number</dt>
      <dd>The 6 characters on a white sticker. ${mark('The last character is always a digit')}: that is the "last digit".</dd>
      <dt>Odd / even</dt>
      <dd>Odd: 1 3 5 7 9 · Even: ${mark('0')} 2 4 6 8.</dd>
      <dt>Vowel</dt>
      <dd>Only ${mark(VOWELS.join(' '))}. (Serial numbers never contain O.)</dd>
      <dt>Battery count</dt>
      <dd>${mark('Total batteries, not holders.')} A holder with two batteries counts as 2.</dd>
      <dt>Lit indicator</dt>
      <dd>A small light with a three-letter label (${lit}). Unlit ones (${unlit}) ${mark('never count')}. Labels: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Port count</dt>
      <dd>${mark('Total port sockets')} on all four edges, not plates. Types: ${PORT_TYPES.join(', ')}.</dd>
      <dt>Keep the last digit</dt>
      <dd>If a result is 10 or more, use only its last digit: 14 → 4, 20 → 0.</dd>
      <dt>Reading order</dt>
      <dd>Left to right, then top to bottom: top-left 1, top-right 2, bottom-left 3, bottom-right 4.</dd>
    </dl>

    <h3>Which module needs which info?</h3>
    ${needsTable(L)}
    ${example(L, 'Have the defuser read the edges first (<b>E</b> key) and write the serial number, batteries, lit indicators and ports into the <b>shared notes</b>. They never change during the bomb.', 'The first 30 seconds')}
    ${warn(L, ['Count batteries, not holders; ports, not plates.', 'Ask what they see, not what they think: "How many?", "Which colour?", "Which one from the top?"'])}`;
};
