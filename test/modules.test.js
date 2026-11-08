import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../shared/rng.js';
import { generateEdgework, batteryCount, serialHasVowel, serialIsOdd, litIndicatorCount } from '../shared/edgework.js';
import { MODULES, REGULAR_TYPES, NEEDY_TYPES } from '../shared/modules/index.js';
import { WIRE_TABLE, WIRE_COLORS, WIRE_COUNTS, evalWireRule } from '../shared/modules/wires.js';
import { SWITCH_PATTERNS } from '../shared/modules/switches.js';
import { GLYPH_VALUES, GLYPH_COUNT } from '../shared/glyphs.js';
import { MAZES, MAZE_LEDS, MAZE_SIZE, shortestPath } from '../shared/mazes.js';
import { RHYTHM_PATTERNS, rhythmDigit } from '../shared/modules/rhythm.js';
import { safeCombination } from '../shared/modules/safe.js';
import { stroopAnswer } from '../shared/modules/stroop.js';
import { tilesTarget } from '../shared/modules/tiles.js';
import { coolantAnswer } from '../shared/modules/coolant.js';
import { PASSPHRASES } from '../shared/words.js';
import { nextAction } from './solver.js';
import { cipherShift, encode, decode, CIPHER_SHIFTS } from '../shared/modules/cipher.js';
import { gaugeAnswer } from '../shared/modules/gauges.js';
import { arrowAnswer } from '../shared/modules/arrows.js';
import { patchTarget, PATCH_TABLE } from '../shared/modules/patch.js';
import { RADIO_CALLSIGNS } from '../shared/modules/radio.js';
import { HOMOPHONES, CIPHER_WORDS } from '../shared/words.js';
import { LEVELS } from '../shared/levels.js';

const SEEDS = Array.from({ length: 300 }, (_, i) => 1000 + i * 7919);

test('kasa bilgileri tutarlı üretilir', () => {
  for (const seed of SEEDS) {
    const e = generateEdgework(createRng(seed));
    assert.match(e.serial, /^[A-Z]{2}\d{2}[A-Z]\d$/);
    assert.ok(batteryCount(e) <= 4);
    const placed = Object.values(e.layout).flat();
    assert.equal(placed.filter((i) => i.kind === 'serial').length, 1);
    assert.equal(placed.filter((i) => i.kind === 'battery').length, e.batteryHolders.length);
    assert.equal(placed.filter((i) => i.kind === 'indicator').length, e.indicators.length);
  }
});

test('her modül doğru hamlelerle hatasız çözülür', () => {
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const e = generateEdgework(rng);
    for (const type of [...REGULAR_TYPES, ...NEEDY_TYPES]) {
      for (const lang of ['tr', 'en']) {
        const def = MODULES[type];
        const s = def.generate(rng, e, lang);
        if (def.needy) {
          def.activate(s, rng, e, lang);
          const ctx = { edgework: e, rng, lang, needyProgress: s.zone ? (s.zone[0] + 8) / 100 : 0 };
          let r = {};
          for (let step = 0; step < 20 && !r.deactivate; step++) {
            r = def.action(s, nextAction(type, s, e), ctx);
            assert.ok(!r.strike, `${type} beklenmeyen hata (seed ${seed})`);
          }
          assert.deepEqual(r, { deactivate: true }, `${type} seed ${seed}`);
          continue;
        }
        let solved = false;
        for (let step = 0; step < 200 && !solved; step++) {
          const ctx = { edgework: e, rng, lang, displayedRemainingMs: s.answer !== undefined ? s.answer * 1000 + 500 : 0 };
          const r = def.action(s, nextAction(type, s, e), ctx);
          assert.ok(!r.strike, `${type} beklenmeyen hata (seed ${seed})`);
          solved = !!r.solved;
        }
        assert.ok(solved, `${type} çözülemedi (seed ${seed})`);
        // Görünüm çözüm bilgisini sızdırmamalı
        const view = JSON.stringify(def.view(s, e));
        for (const secret of ['solution', 'target', 'combo', 'order', 'answer', 'maze"']) {
          assert.ok(!view.includes(`"${secret}`), `${type} görünümü gizli alan içeriyor: ${secret}`);
        }
      }
    }
  }
});

test('yanlış hamleler hata yazdırır', () => {
  for (const seed of SEEDS.slice(0, 100)) {
    const rng = createRng(seed);
    const e = generateEdgework(rng);

    const w = MODULES.wires.generate(rng, e);
    const wrong = w.wires.findIndex((_, i) => i !== w.solution);
    assert.equal(MODULES.wires.action(w, { cut: wrong }).strike, true);

    const g = MODULES.glyphs.generate(rng, e);
    assert.equal(MODULES.glyphs.action(g, { press: g.order[1] }).strike, true);

    const sw = MODULES.switches.generate(rng, e);
    assert.equal(MODULES.switches.action(sw, { submit: true }).strike, true);

    const t = MODULES.tiles.generate(rng, e);
    const bad = t.tiles.findIndex((c) => c !== t.target);
    assert.equal(MODULES.tiles.action(t, { press: bad }).strike, true);

    const r = MODULES.rhythm.generate(rng, e);
    const ctx = { displayedRemainingMs: ((r.answer + 1) % 10) * 1000 + 300 };
    assert.equal(MODULES.rhythm.action(r, { press: true }, ctx).strike, true);

    const c = MODULES.coolant.generate(rng, e);
    MODULES.coolant.activate(c, rng, e);
    const wrongBtn = ['A', 'B', 'C'].find((b) => b !== coolantAnswer(c.code));
    assert.deepEqual(MODULES.coolant.action(c, { press: wrongBtn }), { strike: true, deactivate: true });
  }
});

test('kablo tablosu her durumda geçerli bir kablo seçer', () => {
  const rng = createRng(42);
  for (let i = 0; i < 5000; i++) {
    const e = generateEdgework(rng);
    const count = rng.pick(WIRE_COUNTS);
    const wires = Array.from({ length: count }, () => ({ color: rng.pick(WIRE_COLORS) }));
    const idx = evalWireRule(WIRE_TABLE[wires[0].color][count], wires, e);
    assert.ok(idx >= 0 && idx < count);
  }
});

test('sabit veriler benzersiz', () => {
  const patterns = Object.values(SWITCH_PATTERNS).flatMap((p) => [p.even, p.odd]);
  assert.equal(new Set(patterns).size, patterns.length);
  assert.equal(GLYPH_VALUES.length, GLYPH_COUNT);
  assert.equal(new Set(GLYPH_VALUES).size, GLYPH_COUNT);
  assert.equal(new Set(MAZE_LEDS.map((l) => l.join(''))).size, MAZES.length);
  assert.equal(new Set(RHYTHM_PATTERNS).size, 10);
  for (const lang of ['tr', 'en']) {
    const h = HOMOPHONES[lang];
    assert.equal(new Set(h.map((p) => p[0])).size, h.length);
    assert.deepEqual(new Set(h.map((p) => p[1])), new Set(h.map((p) => p[0])), 'sesteş hedefleri listedeki kelimeler olmalı');
    assert.ok(h.every(([a, b]) => a !== b));
    assert.ok(CIPHER_WORDS[lang].every((w) => /^[A-Z]{5}$/.test(w)));
    for (const tbl of Object.values(PATCH_TABLE)) assert.equal(new Set(Object.values(tbl)).size, 4);
    assert.equal(new Set(RADIO_CALLSIGNS.map((c) => c[0])).size, RADIO_CALLSIGNS.length);
    const list = PASSPHRASES[lang];
    assert.equal(new Set(list.map((p) => p[0])).size, list.length);
    assert.equal(new Set(list.map((p) => p[1])).size, list.length);
  }
});

test('her modül en az bir seviyede tanıtılır', () => {
  const introduced = LEVELS.flatMap((l) => l.introduces);
  for (const t of [...REGULAR_TYPES, ...NEEDY_TYPES]) assert.ok(introduced.includes(t), t + ' hiçbir seviyede yok');
  assert.equal(new Set(introduced).size, introduced.length);
});

test('labirentlerin tüm hücreleri birbirine ulaşır', () => {
  for (let m = 0; m < MAZES.length; m++) {
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let x = 0; x < MAZE_SIZE; x++) {
        if (x === 0 && y === 0) continue;
        assert.ok(shortestPath(m, { x: 0, y: 0 }, { x, y }).length > 0, `labirent ${m} (${x},${y})`);
      }
    }
  }
});

// Kılavuz metniyle birebir aynı kuralları elle yeniden yazıp sonuçları karşılaştırır.
test('kurallar kılavuzdaki tanımla örtüşür', () => {
  const e = {
    serial: 'AB12C7',
    batteryHolders: [2, 1],
    indicators: [{ code: 'ZET', lit: true }],
    portPlates: [['USB', 'HDMI']],
  };
  assert.equal(serialHasVowel(e), true);
  assert.equal(serialIsOdd(e), true);
  assert.equal(litIndicatorCount(e), 1);
  // Kasa: 47, kırmızı → (4+3)%10=7, (7+7)%10=4, (7+4)%10=1
  assert.deepEqual(safeCombination(47, 'red', e), [7, 4, 1]);
  assert.deepEqual(safeCombination(47, 'blue', e), [7, 4, 3]);
  assert.deepEqual(safeCombination(47, 'green', e), [7, 4, 2]);
  assert.deepEqual(safeCombination(47, 'yellow', e), [7, 4, 3]);
  // Ritim: turuncu → rakam + 3 pil
  assert.equal(rhythmDigit(8, 'amber', e), 1);
  assert.equal(rhythmDigit(8, 'white', e), 8);
  // Renk karmaşası: tek seri → etikete bak
  const st = { word: 'blue', ink: 'red', background: 'dark', fills: ['red', 'blue', 'green', 'yellow'], labels: ['yellow', 'green', 'red', 'blue'] };
  assert.equal(stroopAnswer(1, st, e), 2);
  assert.equal(stroopAnswer(1, { ...st, background: 'light' }, e), 3);
  assert.equal(stroopAnswer(3, { ...st, ink: 'blue' }, e), 2);
  // Izgara: 3 pil, baskın kırmızı → sarı
  assert.equal(tilesTarget(['red', 'red', 'red', 'blue', 'yellow', 'green', 'blue', 'red', 'green'], e), 'yellow');
  // Eşitlikte kırmızı > mavi: kırmızı ve mavi 3'er → kırmızı baskın → sarı yoksa kırmızı
  assert.equal(tilesTarget(['red', 'red', 'red', 'blue', 'blue', 'blue', 'green', 'green', 'green'], e), 'red');
  // Şifre çözücü: 3 pil + 2 + sesli harf 1 = 6
  assert.equal(cipherShift(e), 6);
  assert.equal(encode('KALEM', 6), 'QGRKS');
  assert.equal(encode('ZEBRA', 1), 'AFCSB');
  // Manometreler
  assert.equal(gaugeAnswer([3, 3, 7], e), 2);
  assert.equal(gaugeAnswer([2, 9, 9], e), 0);
  assert.equal(gaugeAnswer([5, 5, 5], e), 1);
  assert.equal(gaugeAnswer([8, 6, 5], e), 0);
  assert.equal(gaugeAnswer([1, 4, 2], e), 0);
  assert.equal(gaugeAnswer([1, 4, 2], { ...e, serial: 'BC12D7' }), 2);
  // Pusula
  assert.equal(arrowAnswer(1, 'N', 'red', e), 'S');
  assert.equal(arrowAnswer(3, 'N', 'red', e), 'W');
  assert.equal(arrowAnswer(1, 'E', 'blue', e), 'S');
  assert.equal(arrowAnswer(1, 'N', 'yellow', e), 'W');
  assert.equal(arrowAnswer(4, 'W', 'green', { ...e, serial: 'AB12C8' }), 'W');
  // Bağlantı panosu: tek seri, 3 pil → üçgen/kare yer değiştirir
  assert.equal(patchTarget('red', e), 'triangle');
  assert.equal(patchTarget('blue', e), 'star');
  assert.equal(patchTarget('yellow', e), 'square');
  assert.equal(patchTarget('red', { ...e, batteryHolders: [1] }), 'square');
  // Soğutucu
  assert.equal(coolantAnswer('121'), 'B');
  assert.equal(coolantAnswer('123'), 'A');
  assert.equal(coolantAnswer('124'), 'C');
});

test('seviyenin tanıttığı yeni modüller bombada mutlaka bulunur', async () => {
  const { Game } = await import('../server/game.js');
  const { bombConfig } = await import('../shared/levels.js');
  for (const lv of LEVELS) {
    for (let seed = 1; seed <= 20; seed++) {
      const g = new Game({ config: bombConfig({ mode: 'level', levelId: lv.id }), seed });
      const types = g.modules.map((m) => m.type);
      for (const t of lv.introduces) assert.ok(types.includes(t), `${lv.id}: ${t} bombada yok`);
      assert.equal(g.modules.filter((m) => !m.needy).length, lv.regular);
      assert.equal(g.modules.filter((m) => m.needy).length, lv.needy);
      assert.equal(new Set(g.modules.map((m) => m.slot)).size, g.modules.length);
    }
  }
});

test('kampanya bölümleri: kurallara uyar, tohuma göre değişir, zorluk artar', async () => {
  const { campaignStage, CAMPAIGN_STAGES, MODIFIERS } = await import('../shared/campaign.js');
  const { Game } = await import('../server/game.js');
  const signatures = new Set();
  const avg = Array(CAMPAIGN_STAGES + 1).fill(0);
  const N = 60;
  for (let i = 0; i < N; i++) {
    const seed = 1000 + i * 7777;
    let sig = '';
    const featured = [];
    for (let s = 1; s <= CAMPAIGN_STAGES; s++) {
      const c = campaignStage(seed, s);
      assert.deepEqual(c, campaignStage(seed, s), 'aynı tohum aynı bölümü üretmeli');
      assert.ok(c.regular >= 3 && c.regular + c.needy <= 11, `modül sayısı (${seed}/${s})`);
      assert.ok(c.strikes >= 1 && c.time >= 120);
      assert.ok(c.pool.includes(c.featured));
      assert.ok(!c.needy || c.needyPool.length, 'sürekli ilgi varsa havuz boş olamaz');
      if (s <= 2) assert.equal(c.modifiers.length, 0, 'ilk bölümler koşulsuz');
      for (const m of c.modifiers) assert.ok(MODIFIERS[m].minStage <= s);
      assert.notDeepEqual(campaignStage(seed, s, 1), c, 'tekrar deneme farklı olmalı');
      // Gerçek bir bomba üretilebilmeli ve öne çıkan modül bombada olmalı
      const g = new Game({ config: c, seed: seed + s });
      assert.ok(g.modules.some((m) => m.type === c.featured));
      assert.equal(g.modules.filter((m) => !m.needy).length, c.regular);
      featured.push(c.featured);
      avg[s] += c.regular / N;
      sig += `${c.regular}${c.featured}${c.modifiers.join()}${c.time}|`;
    }
    assert.equal(new Set(featured).size, CAMPAIGN_STAGES, 'bir kampanyada öne çıkan modül tekrar etmemeli');
    signatures.add(sig);
  }
  assert.equal(signatures.size, N, 'her kampanya farklı olmalı');
  assert.ok(avg[1] < avg[6] && avg[6] < avg[12], `zorluk artmalı: ${avg.slice(1).map((x) => x.toFixed(1))}`);
});

test('ritim modülü her zaman sayacın olduğu ön yüzde, mümkünse sayaca bitişik', async () => {
  const { Game, FRONT_ONLY } = await import('../server/game.js');
  assert.ok(FRONT_ONLY.includes('rhythm'));
  for (let seed = 1; seed <= 300; seed++) {
    const n = 1 + (seed % 3);
    const g = new Game({ config: { regular: 9, needy: 2, time: 300, strikes: 3, pool: ['rhythm', 'wires', 'maze', 'cipher'], needyPool: ['radio'], introduces: Array(n).fill('rhythm') }, seed });
    const rhythms = g.modules.filter((m) => m.type === 'rhythm');
    assert.ok(rhythms.length >= 1);
    for (const m of rhythms.slice(0, 5)) assert.ok(m.slot < 6, `ritim arka yüzde (seed ${seed}, yuva ${m.slot})`);
    if (rhythms.length) assert.ok([0, 2, 4].includes(rhythms[0].slot), 'ilk ritim sayaca bitişik olmalı');
    assert.equal(new Set(g.modules.map((m) => m.slot)).size, g.modules.length, 'yuvalar çakışmamalı');
    assert.ok(g.modules.every((m) => m.slot !== 1 && m.slot >= 0 && m.slot < 12));
  }
});

test('şifre çözücü: kodlama/çözme, kaydırma aralığı ve kılavuz tablosu kapsamı', async () => {
  const { ALPHABET, CIPHER_SHIFTS, MAX_BATTERIES, encode, decode, decodeLetter, cipherShift } = await import('../shared/modules/cipher.js');
  const { batteryCount } = await import('../shared/edgework.js');
  // Çözme, kodlamanın tam tersidir (her kelime, her kaydırma)
  for (const lang of ['tr', 'en']) {
    for (const w of CIPHER_WORDS[lang]) {
      for (let k = 0; k < 26; k++) assert.equal(decode(encode(w, k), k), w);
    }
  }
  // Tek harf çözme: alfabe başında geri sarma (A geri 2 → Y)
  assert.equal(decodeLetter('A', 2), 'Y');
  assert.equal(decodeLetter('B', 7), 'U');
  assert.equal(encode('XYZ', 3), 'ABC');
  assert.equal(new Set(ALPHABET).size, 26);
  // Oyunda çıkabilecek her kaydırma kılavuz tablosunda var
  const rng = createRng(77);
  const seen = new Set();
  for (let i = 0; i < 5000; i++) {
    const e = generateEdgework(rng);
    assert.ok(batteryCount(e) <= MAX_BATTERIES);
    const k = cipherShift(e);
    assert.ok(CIPHER_SHIFTS.includes(k), `kaydırma ${k} kılavuzda yok`);
    seen.add(k);
  }
  assert.deepEqual([...seen].sort(), [...CIPHER_SHIFTS].sort(), 'tablodaki her satır gerçekten kullanılır');
  // Kılavuzdaki küçük tablo: pil + 2, sesli harf varsa + 3
  for (let b = 0; b <= MAX_BATTERIES; b++) {
    assert.equal(cipherShift({ serial: 'BC12D7', batteryHolders: b ? [b] : [], indicators: [], portPlates: [] }), b + 2);
    assert.equal(cipherShift({ serial: 'AC12D7', batteryHolders: b ? [b] : [], indicators: [], portPlates: [] }), b + 3);
  }
});

test('şifre çözücü modülü: her bombada çözülebilir, belirsizlik yok, yanlışta kod değişmez', () => {
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const e = generateEdgework(rng);
    for (const lang of ['tr', 'en']) {
      const def = MODULES.cipher;
      const s = def.generate(rng, e, lang);
      const list = CIPHER_WORDS[lang];
      assert.match(s.code, /^[A-Z]{5}$/);
      assert.equal(s.options.length, 4);
      assert.equal(new Set(s.options).size, 4, 'düğmeler farklı');
      assert.ok(s.options.every((w) => list.includes(w)), 'düğmeler listeden');
      // Kılavuz yolu: kaydırmayı bul, çöz → seçeneklerden tam biri eşleşir
      const decoded = decode(s.code, cipherShift(e));
      assert.equal(s.options.filter((w) => w === decoded).length, 1);
      // Yanlış kaydırma listede olmayan ya da yanlış bir kelime verir; kendi kendini kontrol mümkün
      for (const k of CIPHER_SHIFTS) if (k !== cipherShift(e)) assert.notEqual(decode(s.code, k), s.word);
      // Yanlış düğme: hata, kod ve seçenekler aynı kalır
      const before = JSON.stringify(def.view(s));
      const wrong = s.options.findIndex((w) => w !== s.word);
      assert.deepEqual(def.action(s, { press: wrong }), { strike: true });
      assert.equal(JSON.stringify(def.view(s)), before);
      assert.deepEqual(def.action(s, { press: s.options.indexOf(decoded) }), { solved: true });
      // Görünüm cevabı ayrı bir alan olarak sızdırmaz
      assert.deepEqual(Object.keys(def.view(s)).sort(), ['code', 'options']);
    }
  }
});

// --- Sürüm 3: yeni modüller, kural tabanlı kılavuz, çeşitlilik ---

test('mantık kapıları: kapı kuralları, çözülebilirlik ve yanlış TEST', async () => {
  const { circuitOutput, gateOut, logicSolutions, ALL_INPUTS } = await import('../shared/modules/logic.js');
  // Kılavuzdaki tanımlar: daire = ikisi de açık, üçgen = en az biri, elmas = farklı, turuncu = ters
  const T = true;
  const F = false;
  assert.equal(gateOut({ shape: 'circle' }, T, T), T);
  assert.equal(gateOut({ shape: 'circle' }, T, F), F);
  assert.equal(gateOut({ shape: 'triangle' }, F, T), T);
  assert.equal(gateOut({ shape: 'triangle' }, F, F), F);
  assert.equal(gateOut({ shape: 'diamond' }, T, F), T);
  assert.equal(gateOut({ shape: 'diamond' }, T, T), F);
  assert.equal(gateOut({ shape: 'circle', inverted: true }, T, T), F);
  // Kılavuz örneği: beyaz daire, turuncu üçgen, beyaz elmas; A↑ B↑ C↓ → açık
  const ex = [{ shape: 'circle' }, { shape: 'triangle', inverted: true }, { shape: 'diamond' }];
  assert.equal(circuitOutput(ex, [T, T, F]), T);
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const s = MODULES.logic.generate(rng);
    const sols = logicSolutions(s.gates, s.lamp);
    assert.ok(sols.length >= 1 && sols.length <= 4, 'az ama en az bir çözüm');
    assert.ok(!sols.some((w) => w.every((v, k) => v === s.inputs[k])), 'başlangıç dizilimi çözüm olmamalı');
    assert.ok(ALL_INPUTS.length === 8);
    // Yanlış TEST: hata, anahtarlar aynı kalır
    const before = s.inputs.slice();
    assert.deepEqual(MODULES.logic.action(s, { test: true }), { strike: true });
    assert.deepEqual(s.inputs, before);
  }
});

test('terazi: toplam kılavuzdaki gibi hesaplanır, tek doğru seçim vardır, yanlış tartı yönü gösterir', async () => {
  const { scaleTotal, scalePicks, SCALE_ITEMS, SCALE_WEIGHTS, SCALE_MAX } = await import('../shared/modules/scale.js');
  const e = { serial: 'AB12C7', batteryHolders: [2], indicators: [], portPlates: [] };
  // Kılavuz örneği: gri çapa + bakır anahtar + 2 pil = 7 + 6 + 2 = 15 → 8 + 4 + 2 + 1
  const total = scaleTotal([{ kind: 'anchor' }, { kind: 'key', copper: true }], e);
  assert.equal(total, SCALE_ITEMS.anchor + SCALE_ITEMS.key * 2 + 2);
  assert.equal(total, 15);
  assert.deepEqual(scalePicks(15), [true, true, true, true, false]);
  for (let n = 1; n <= SCALE_MAX; n++) {
    assert.equal(SCALE_WEIGHTS.reduce((a, w, i) => a + (scalePicks(n)[i] ? w : 0), 0), n);
  }
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const ew = generateEdgework(rng);
    const s = MODULES.scale.generate(rng, ew);
    assert.ok(s.total >= 6 && s.total <= SCALE_MAX);
    assert.equal(s.total, scaleTotal(s.items, ew));
    // Hiç ağırlık yokken tartı: sol kefe ağır → tilt 1
    const r = MODULES.scale.action(s, { weigh: true });
    assert.equal(r.strike, true);
    assert.equal(s.tilt, 1);
    // Hepsi konunca (31) sağ ağır gelir (toplam 31 değilse)
    SCALE_WEIGHTS.forEach((_, i) => MODULES.scale.action(s, { toggle: i }));
    assert.equal(s.tilt, 0, 'ağırlık değişince terazi kilitlenir');
    if (s.total !== SCALE_MAX) {
      MODULES.scale.action(s, { weigh: true });
      assert.equal(s.tilt, -1);
    }
    assert.ok(!('total' in MODULES.scale.view(s)));
  }
});

test('asansör: kılavuzdaki sıra kuralları', async () => {
  const { nextStop } = await import('../shared/modules/elevator.js');
  // Kılavuz örneği: kat 5 ▲; 2 beyaz, 4 kırmızı, 7 beyaz, 9 beyaz → 4, 2, 7, 9
  const s = {
    floor: 5,
    dir: 'up',
    calls: [2, 4, 7, 9].map((f) => ({ floor: f, red: f === 4, served: false })),
  };
  const order = [];
  for (let i = 0; i < 4; i++) {
    const f = nextStop(s);
    order.push(f);
    assert.equal(MODULES.elevator.action(s, { press: f }).changed, true);
  }
  assert.deepEqual(order, [4, 2, 7, 9]);
  // Eşit uzaklıkta iki kırmızı: üstteki
  assert.equal(nextStop({ floor: 5, dir: 'down', calls: [3, 7].map((f) => ({ floor: f, red: true, served: false })) }), 7);
  // Yöndeki en yakın beyaz, arkadaki daha yakın olsa bile
  assert.equal(nextStop({ floor: 5, dir: 'up', calls: [4, 9].map((f) => ({ floor: f, red: false, served: false })) }), 9);
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const st = MODULES.elevator.generate(rng);
    assert.equal(st.calls.length, 4);
    assert.ok(!st.calls.some((c) => c.floor === st.floor));
    const wrong = [1, 2, 3, 4, 5, 6, 7, 8, 9].find((f) => f !== nextStop(st));
    const before = JSON.stringify(st);
    assert.deepEqual(MODULES.elevator.action(st, { press: wrong }), { strike: true });
    assert.equal(JSON.stringify(st), before, 'yanlış katta asansör yerinde kalır');
  }
});

test('doğrulama: renk kuralları, tek doğru düğme', async () => {
  const { verifyAnswer, pad2 } = await import('../shared/modules/verify.js');
  const e = { serial: 'AB12C7', batteryHolders: [], indicators: [], portPlates: [] };
  assert.equal(verifyAnswer(47, 'red', e), 74);
  assert.equal(pad2(verifyAnswer(30, 'red', e)), '03');
  assert.equal(verifyAnswer(47, 'blue', e), 54);
  assert.equal(verifyAnswer(95, 'blue', e), 2);
  assert.equal(verifyAnswer(58, 'green', e), 41);
  assert.equal(verifyAnswer(58, 'yellow', e), 16);
  for (const seed of SEEDS) {
    const rng = createRng(seed);
    const ew = generateEdgework(rng);
    const s = MODULES.verify.generate(rng, ew);
    MODULES.verify.activate(s, rng, ew);
    assert.equal(s.options.length, 3);
    assert.equal(new Set(s.options).size, 3);
    assert.equal(s.options.filter((o) => o === pad2(verifyAnswer(s.number, s.lamp, ew))).length, 1);
    assert.ok(s.options.every((o) => /^\d\d$/.test(o)));
    assert.ok(!JSON.stringify(MODULES.verify.view(s)).includes('answer'));
    const wrong = s.options.findIndex((o) => o !== s.answer);
    assert.deepEqual(MODULES.verify.action(s, { press: wrong }), { strike: true, deactivate: true });
  }
});

// Kılavuz artık hazır cevap tablosu değil kural veriyor: kuralı metindeki gibi bağımsız uygulayıp
// oyunun cevabıyla karşılaştır.
test('kural tabanlı kılavuz: pusula, şalterler, bağlantı panosu, şifre çözücü', async () => {
  const { SWITCH_LAMPS, SWITCH_PATTERNS, switchTarget } = await import('../shared/modules/switches.js');
  const { ALPHABET } = await import('../shared/modules/cipher.js');
  const rng = createRng(2024);
  const CW = ['N', 'E', 'S', 'W'];
  const turnOf = { red: 2, blue: 1, green: 0, yellow: -1 };
  for (let i = 0; i < 400; i++) {
    const e = generateEdgework(rng);
    const odd = Number(e.serial.at(-1)) % 2 === 1;
    // Pusula: okun yönünden rengin dediği kadar dön; 3–4. aşama + tek → ¼ tur daha saat yönünde
    for (const stage of [1, 2, 3, 4])
      for (const dir of CW)
        for (const color of Object.keys(turnOf)) {
          const q = turnOf[color] + (stage >= 3 && odd ? 1 : 0);
          assert.equal(arrowAnswer(stage, dir, color, e), CW[(CW.indexOf(dir) + q + 8) % 4]);
        }
    // Şalterler: tablo dizilimi; yanan gösterge varsa sağdan sola uygulanır
    const lit = e.indicators.some((x) => x.lit);
    for (const lamp of SWITCH_LAMPS) {
      const p = SWITCH_PATTERNS[lamp][odd ? 'odd' : 'even'].split('').map((c) => c === 'U');
      assert.deepEqual(switchTarget(lamp, e), lit ? p.reverse() : p);
    }
    // Bağlantı panosu: tablo; 3+ pilde üçgen ile kare yer değiştirir
    const swap = { triangle: 'square', square: 'triangle' };
    for (const c of ['red', 'blue', 'green', 'yellow']) {
      const base = PATCH_TABLE[odd ? 'odd' : 'even'][c];
      assert.equal(patchTarget(c, e), batteryCount(e) >= 3 ? swap[base] || base : base);
    }
    // Şifre çözücü: kaydırma = pil + 2 (+1 sesli harf); her harften o kadar geri say
    const k = batteryCount(e) + 2 + (serialHasVowel(e) ? 1 : 0);
    assert.equal(cipherShift(e), k);
    const word = CIPHER_WORDS.tr[i % CIPHER_WORDS.tr.length];
    const back = encode(word, k)
      .split('')
      .map((c) => ALPHABET[(ALPHABET.indexOf(c) - k + 26) % 26])
      .join('');
    assert.equal(back, word);
  }
});

test('çeşitlilik: havuz yetiyorsa bombada aynı modül iki kez çıkmaz', async () => {
  const { Game } = await import('../server/game.js');
  for (let seed = 1; seed <= 200; seed++) {
    const n = 2 + (seed % 9);
    const g = new Game({ config: { regular: n, needy: 2, time: 300, strikes: 3, pool: REGULAR_TYPES, needyPool: NEEDY_TYPES, introduces: [] }, seed });
    const regular = g.modules.filter((m) => !m.needy).map((m) => m.type);
    assert.equal(new Set(regular).size, regular.length, `tekrar eden modül (seed ${seed})`);
    const needy = g.modules.filter((m) => m.needy).map((m) => m.type);
    assert.equal(new Set(needy).size, needy.length);
  }
  // Havuz küçükse tekrar mecburdur ama her tür en az bir kez çıkar
  const g = new Game({ config: { regular: 5, needy: 0, time: 300, strikes: 3, pool: ['wires', 'maze'], needyPool: [], introduces: [] }, seed: 9 });
  assert.deepEqual(new Set(g.modules.map((m) => m.type)), new Set(['wires', 'maze']));
});

test('seviye eğrisi: modül sayısı artar, modül başına süre azalır, her seviye en çok 3 yenilik getirir', () => {
  for (let i = 1; i < LEVELS.length; i++) {
    const a = LEVELS[i - 1];
    const b = LEVELS[i];
    assert.ok(b.regular >= a.regular, `${b.id} modül sayısı`);
    assert.ok(b.time / b.regular <= a.time / a.regular + 0.01, `${b.id} modül başına süre`);
    assert.ok(b.introduces.length <= 3, `${b.id} çok fazla yenilik`);
    assert.ok(b.regular + b.needy <= 11);
  }
});

test('kampanya zorluğu: zor ve uzman daha kısa süre, uzman daha az hata hakkı', async () => {
  const { campaignStage, DIFFICULTIES } = await import('../shared/campaign.js');
  for (let seed = 1; seed <= 40; seed++) {
    for (let s = 1; s <= 12; s++) {
      const n = campaignStage(seed * 977, s, 0, 'normal');
      const h = campaignStage(seed * 977, s, 0, 'hard');
      const x = campaignStage(seed * 977, s, 0, 'expert');
      assert.equal(x.difficulty, 'expert');
      assert.ok(x.strikes >= 1 && x.strikes <= n.strikes);
      if (s >= 3) assert.ok(h.modifiers.length >= 1 && x.modifiers.length >= 1, 'zorda her bölümde koşul var');
      assert.ok(!h.modifiers.includes('bonusTime') && !x.modifiers.includes('bonusTime'));
      assert.ok(x.time >= 120);
    }
  }
  assert.equal(DIFFICULTIES.expert.lives, 2);
  // Bilinmeyen zorluk normal sayılır
  assert.deepEqual(campaignStage(5, 4, 0, 'nope'), campaignStage(5, 4, 0, 'normal'));
});

test('kampanya koşulları oyuna yansır: ödül süresi, hassas devre, dalgalanma olayı', async () => {
  const { Game } = await import('../server/game.js');
  const events = [];
  const g = new Game({
    config: { regular: 2, needy: 0, time: 300, strikes: 3, pool: ['wires'], needyPool: [], solveBonusMs: 20000, strikeSpeedup: 0.5, events: false },
    seed: 3,
    startDelayMs: 0,
    hooks: { toAll: (ev, d) => events.push([ev, d]) },
  });
  g.begin();
  try {
    const [w1, w2] = g.modules;
    g.elapsed = 60000;
    g.handleAction(w1.id, { cut: w1.state.solution });
    assert.ok(g.elapsed <= 40100, 'çözülen modül 20 sn ekler');
    g.handleAction(w2.id, { cut: w2.state.wires.findIndex((_, i) => i !== w2.state.solution) });
    assert.equal(g.rate, 1.5, 'hassas devre: hata başına %50');
    g.fireEvent('surge');
    const surge = events.find(([ev, d]) => ev === 'game:event' && d.type === 'surge');
    assert.equal(surge[1].moduleId, w2.id, 'dalgalanma çözülmemiş bir modüle gelir');
  } finally {
    g.destroy();
  }
});
