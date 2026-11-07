import { VOWELS, INDICATOR_CODES, PORT_TYPES } from '/shared/edgework.js';
import { note } from './common.js';

const TXT = {
  tr: (exampleLit, exampleUnlit) => `
    <p class="lead">Bu kılavuz bombayı <b>göremeyen</b> uzmanlar içindir. İmhacı bombada gördüklerini anlatır; siz kuralları uygulayıp ona ne yapması gerektiğini söylersiniz. İmhacı bu kılavuza bakamaz!</p>
    <h3>Sayaç ve hatalar</h3>
    <ul>
      <li>Bombanın ön yüzünde bir sayaç ve hata göstergesi vardır.</li>
      <li>Her yanlış hamle bir <b>HATA</b> yazdırır. Her hata sayacı <b>%25 hızlandırır</b>.</li>
      <li>Hata hakkı dolarsa ya da süre biterse bomba patlar.</li>
    </ul>
    <h3>Modüller</h3>
    <ul>
      <li>Bombanın <b>ön ve arka</b> yüzünde modüller bulunur. İmhacı bombayı çevirerek iki yüze de bakabilir.</li>
      <li>Her modülün sağ üst köşesinde bir durum ışığı vardır: çözülen modülde <b>yeşil</b> yanar, hata anında kırmızı yanıp söner.</li>
      <li>Bütün normal modüller çözüldüğünde bomba imha edilir.</li>
      <li><b>Sürekli ilgi isteyen</b> modüllerin üstünde küçük bir geri sayım ekranı vardır. Bunlar çözülmez: ara ara devreye girerler ve sayaç bitmeden doğru hamle yapılmazsa hata yazılır.</li>
    </ul>
    <h3>Bomba kasası</h3>
    <p>Birçok kural kasanın kenarlarındaki bilgilere bağlıdır. İmhacı <b>Kenarlar</b> görünümünden bunlara bakabilir.</p>
    <dl class="defs">
      <dt>Seri numarası</dt>
      <dd>Bir kenardaki beyaz etikette 6 karakterli kod. Son karakter her zaman bir rakamdır. Bu kılavuzda yalnızca <b>${VOWELS.join(', ')}</b> sesli harf sayılır (seri numaralarında O harfi kullanılmaz).</dd>
      <dt>Piller</dt>
      <dd>Pil yuvalarında 1 ya da 2 pil durur. <b>Pil sayısı</b>, bütün yuvalardaki pillerin toplamıdır.</dd>
      <dt>Göstergeler</dt>
      <dd>Yanında üç harfli bir etiket olan küçük ışıklar (ör. ${exampleLit}, ${exampleUnlit}). Işığı yanıyorsa <b>yanan gösterge</b> sayılır. Olası etiketler: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Portlar</dt>
      <dd>Port plakalarındaki bağlantılar: ${PORT_TYPES.join(', ')}. <b>Port sayısı</b>, bütün plakalardaki portların toplamıdır.</dd>
    </dl>
    ${note('İpucu: Oyunun başında imhacıya kenarları okutup seri numarasını, pil, gösterge ve port bilgisini bir kenara not edin. Birçok modülde lazım olacak.')}
    <h3>“Son rakam”</h3>
    <p>Bir hesabın sonucu 10 veya daha büyükse yalnızca <b>son rakamını</b> kullanın (ör. 14 → 4, 20 → 0).</p>`,
  en: (exampleLit, exampleUnlit) => `
    <p class="lead">This manual is for the experts who <b>cannot see</b> the bomb. The defuser describes what they see; you apply the rules and tell them what to do. The defuser may not read this manual!</p>
    <h3>Timer and strikes</h3>
    <ul>
      <li>The front of the bomb has a timer and a strike display.</li>
      <li>Every wrong action causes a <b>STRIKE</b>. Each strike makes the timer run <b>25% faster</b>.</li>
      <li>The bomb explodes when the strikes run out or the time reaches zero.</li>
    </ul>
    <h3>Modules</h3>
    <ul>
      <li>Modules sit on the <b>front and back</b> of the bomb. The defuser can flip the bomb to see both faces.</li>
      <li>Each module has a status light in its top-right corner: it turns <b>green</b> when the module is solved and flashes red on a strike.</li>
      <li>The bomb is defused once every regular module is solved.</li>
      <li><b>Needy</b> modules have a small countdown display on top. They are never solved: they switch on from time to time, and if the right action isn’t taken before the countdown ends, a strike is recorded.</li>
    </ul>
    <h3>Bomb casing</h3>
    <p>Many rules depend on details printed on the edges of the casing. The defuser can check them in the <b>Edges</b> view.</p>
    <dl class="defs">
      <dt>Serial number</dt>
      <dd>A 6-character code on a white sticker. The last character is always a digit. In this manual only <b>${VOWELS.join(', ')}</b> count as vowels (serial numbers never use the letter O).</dd>
      <dt>Batteries</dt>
      <dd>Battery holders contain 1 or 2 batteries. The <b>battery count</b> is the total number of batteries in all holders.</dd>
      <dt>Indicators</dt>
      <dd>Small lights with a three-letter label (e.g. ${exampleLit}, ${exampleUnlit}). If the light is on, it counts as a <b>lit indicator</b>. Possible labels: ${INDICATOR_CODES.join(', ')}.</dd>
      <dt>Ports</dt>
      <dd>Connectors on port plates: ${PORT_TYPES.join(', ')}. The <b>port count</b> is the total number of ports on all plates.</dd>
    </dl>
    ${note('Tip: At the start, have the defuser read out the edges and write down the serial number, batteries, indicators and ports. You will need them for many modules.')}
    <h3>“Last digit”</h3>
    <p>If a calculation gives 10 or more, use only its <b>last digit</b> (e.g. 14 → 4, 20 → 0).</p>`,
};

export default (L) => {
  const lit = '<span class="ind-sample lit">●</span>&nbsp;ZET';
  const unlit = '<span class="ind-sample">●</span>&nbsp;KAV';
  return TXT[L](lit, unlit);
};
