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
import { cipherShift, encode } from '../shared/modules/cipher.js';
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
