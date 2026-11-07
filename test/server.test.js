import test from 'node:test';
import assert from 'node:assert/strict';
import { io as ioc } from 'socket.io-client';
import { createServer } from '../server/index.js';
import { nextAction } from './solver.js';
import { ALL_TYPES } from '../shared/modules/index.js';

const once = (socket, ev, ms = 4000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('zaman aşımı: ' + ev)), ms);
    socket.once(ev, (d) => {
      clearTimeout(t);
      resolve(d);
    });
  });
const emit = (socket, ev, data) => new Promise((resolve) => socket.emit(ev, data, resolve));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function setup(n = 3, gameOptions = {}) {
  const srv = await createServer({ port: 0, dataFile: null, gameOptions: { startDelayMs: 30, ...gameOptions } });
  const url = `http://localhost:${srv.port}`;
  const clients = [];
  for (let i = 0; i < n; i++) {
    const c = ioc(url, { transports: ['websocket'], forceNew: true });
    await once(c, 'connect');
    clients.push(c);
  }
  const created = await emit(clients[0], 'room:create', { name: 'Ayşe', lang: 'tr' });
  assert.equal(created.ok, true);
  const joins = [created];
  for (let i = 1; i < n; i++) {
    const j = await emit(clients[i], 'room:join', { code: created.code, name: ['Ayşe', 'Burak', 'Cem', 'Deniz'][i] });
    assert.equal(j.ok, true);
    joins.push(j);
  }
  const room = srv.rooms.rooms.get(created.code);
  const cleanup = async () => {
    clients.forEach((c) => c.close());
    await srv.close();
  };
  return { srv, clients, joins, room, code: created.code, cleanup };
}

async function solveAll(room, socket) {
  const game = room.game;
  for (let guard = 0; guard < 500 && !game.ended; guard++) {
    const m = game.modules.find((x) => !x.needy && !x.solved);
    if (!m) break;
    socket.emit('game:action', { moduleId: m.id, action: nextAction(m.type, m.state, game.edgework), t: game.remainingMs() });
    await wait(5);
  }
}

test('oda kurulur, katılınır, kılavuz bölünür ve bomba imha edilir', async () => {
  const { clients, joins, room, cleanup } = await setup(3);
  try {
    assert.equal(room.players.size, 3);
    // Oda sahibi ayarları değiştirir ve imhacıyı seçer
    clients[0].emit('room:settings', {
      mode: 'free',
      free: { regular: 6, needy: 0, pool: ['wires', 'switches', 'glyphs', 'maze', 'safe', 'stroop', 'tiles'], events: false },
      splitManual: true,
    });
    clients[0].emit('room:defuser', { playerId: joins[1].playerId });
    await wait(50);
    assert.equal(room.defuserId, joins[1].playerId);
    assert.equal(room.settings.free.regular, 6);

    // İmhacı olmayan biri ayar değiştiremez
    clients[2].emit('room:settings', { mode: 'level' });
    await wait(30);
    assert.equal(room.settings.mode, 'free');

    const initDefuser = once(clients[1], 'game:init');
    const initExpert1 = once(clients[0], 'game:init');
    const initExpert2 = once(clients[2], 'game:init');
    clients[0].emit('game:start');
    const d = await initDefuser;
    const e1 = await initExpert1;
    const e2 = await initExpert2;

    assert.equal(d.role, 'defuser');
    assert.equal(d.modules.length, 6);
    assert.ok(d.edgework.serial);
    assert.equal(e1.role, 'expert');
    assert.equal(e1.edgework, undefined, 'uzman bombayı görmemeli');
    assert.equal(e1.modules, undefined);
    assert.equal(e1.manual.split, true);
    // İki uzmanın sayfaları çakışmaz ve birlikte her şeyi kapsar
    const all = [...e1.manual.mine, ...e2.manual.mine];
    assert.equal(new Set(all).size, all.length);
    assert.equal(all.length, ALL_TYPES.length);
    // İmhacıya giden görünüm çözüm sızdırmaz
    assert.ok(!JSON.stringify(d.modules).includes('solution'));

    await wait(80);
    // Uzmanın hareketi yok sayılır
    const m0 = room.game.modules[0];
    clients[0].emit('game:action', { moduleId: m0.id, action: nextAction(m0.type, m0.state, room.game.edgework) });
    await wait(30);
    assert.equal(m0.solved, false);

    const end = once(clients[2], 'game:end', 8000);
    await solveAll(room, clients[1]);
    const result = await end;
    assert.equal(result.outcome, 'defused');
    assert.equal(result.strikes, 0);
    assert.equal(result.solved, 6);
    assert.equal(room.phase, 'result');
    // Roller döner
    assert.notEqual(room.defuserId, joins[1].playerId);
    assert.equal(room.players.get(joins[1].playerId).stats.wins, 1);
  } finally {
    await cleanup();
  }
});

test('hata hakkı biterse bomba patlar', async () => {
  const { clients, room, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'free', free: { regular: 3, needy: 0, strikes: 2, pool: ['wires'], events: false } });
    await wait(30);
    const init = once(clients[0], 'game:init');
    clients[0].emit('game:start');
    await init;
    await wait(80);
    const end = once(clients[1], 'game:end');
    const strikes = [];
    clients[1].on('game:strike', (s) => strikes.push(s));
    for (const m of room.game.modules) {
      if (room.game.ended) break;
      const wrong = m.state.wires.findIndex((_, i) => i !== m.state.solution);
      clients[0].emit('game:action', { moduleId: m.id, action: { cut: wrong } });
      await wait(20);
    }
    const r = await end;
    assert.equal(r.outcome, 'exploded');
    assert.equal(r.reason, 'strikes');
    assert.equal(strikes.length, 2);
  } finally {
    await cleanup();
  }
});

test('sayaç hatayla hızlanır ve süre bitince patlar', async () => {
  const { clients, room, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'free', free: { time: 60, regular: 1, needy: 0, pool: ['glyphs'], events: false } });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    await wait(80);
    const g = room.game;
    clients[0].emit('game:action', { moduleId: 'm0', action: { press: g.modules[0].state.order[3] } });
    await wait(30);
    assert.equal(g.strikes, 1);
    assert.equal(g.rate, 1.25);
    // Süreyi yapay olarak bitir
    g.elapsed = g.totalMs - 10;
    const r = await once(clients[1], 'game:end');
    assert.equal(r.outcome, 'exploded');
    assert.equal(r.reason, 'time');
  } finally {
    await cleanup();
  }
});

test('sürekli ilgi isteyen modül ihmal edilirse hata yazar', async () => {
  const { clients, room, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'free', free: { regular: 1, needy: 1, needyPool: ['coolant'], pool: ['wires'], events: false } });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    await wait(80);
    const needy = room.game.modules.find((m) => m.needy);
    const activated = once(clients[0], 'game:module');
    needy.nextAt = Date.now();
    const view = await activated;
    assert.equal(view.view.active, true);
    assert.match(view.view.code, /^\d{3}$/);
    const strike = once(clients[1], 'game:strike');
    needy.activeUntil = Date.now();
    const s = await strike;
    assert.equal(s.moduleId, needy.id);
    assert.equal(needy.state.active, false);
  } finally {
    await cleanup();
  }
});

test('kopan oyuncu jetonla geri döner ve oyuna kaldığı yerden devam eder', async () => {
  const { srv, clients, joins, room, code, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'level', levelId: 'l1' });
    clients[0].emit('room:defuser', { playerId: joins[1].playerId });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[1], 'game:init');
    clients[1].close();
    await wait(60);
    assert.equal(room.players.get(joins[1].playerId).connected, false);

    const again = ioc(`http://localhost:${srv.port}`, { transports: ['websocket'], forceNew: true });
    await once(again, 'connect');
    const init = once(again, 'game:init');
    const j = await emit(again, 'room:join', { code, token: joins[1].token, name: 'Burak' });
    assert.equal(j.playerId, joins[1].playerId);
    const d = await init;
    assert.equal(d.role, 'defuser');
    assert.equal(room.players.size, 2);
    again.close();
  } finally {
    await cleanup();
  }
});

test('olmayan odaya katılma reddedilir', async () => {
  const { srv, cleanup } = await setup(1);
  try {
    const c = ioc(`http://localhost:${srv.port}`, { transports: ['websocket'], forceNew: true });
    await once(c, 'connect');
    const r = await emit(c, 'room:join', { code: 'ZZZZ', name: 'X' });
    assert.deepEqual(r, { ok: false, error: 'room_not_found' });
    c.close();
  } finally {
    await cleanup();
  }
});

test('seviye modunda imha edilen bomba rekor tablosuna girer', async () => {
  const { clients, room, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'level', levelId: 'l1' });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    await wait(80);
    const defuserSocket = clients[room.players.get(room.gameDefuserId).name === 'Ayşe' ? 0 : 1];
    const state = once(clients[1], 'game:end', 8000);
    await solveAll(room, defuserSocket);
    const r = await state;
    assert.equal(r.outcome, 'defused');
    assert.equal(r.rank, 1);
    const top = room.publicState().records.l1;
    assert.equal(top.length, 1);
    assert.deepEqual(top[0].team, ['Ayşe', 'Burak']);
  } finally {
    await cleanup();
  }
});

test('oda sahibi duraklatınca sayaç ve hamleler durur', async () => {
  const { clients, room, cleanup } = await setup(2);
  try {
    clients[0].emit('room:settings', { mode: 'free', free: { regular: 2, needy: 1, needyPool: ['radio'], pool: ['wires'], events: false } });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    await wait(80);
    const g = room.game;
    const paused = once(clients[1], 'game:paused');
    clients[1].emit('game:pause', { paused: true }); // oda sahibi değil: yok sayılır
    await wait(30);
    assert.equal(g.paused, false);
    clients[0].emit('game:pause', { paused: true });
    assert.deepEqual(await paused, { paused: true });
    const before = g.remainingMs();
    const needy = g.modules.find((m) => m.needy);
    const nextAt = needy.nextAt;
    await wait(150);
    assert.equal(g.remainingMs(), before);
    // Duraklatılmışken hamle işlenmez
    const w = g.modules.find((m) => !m.needy);
    clients[0].emit('game:action', { moduleId: w.id, action: { cut: w.state.solution } });
    await wait(30);
    assert.equal(w.solved, false);
    clients[0].emit('game:pause', { paused: false });
    await wait(30);
    assert.equal(g.paused, false);
    assert.ok(needy.nextAt >= nextAt + 150, 'sürekli ilgi zamanlaması duraklama kadar ötelenmeli');
    assert.ok(g.remainingMs() < before);
  } finally {
    await cleanup();
  }
});

test('uzmanlar ortak not defterini paylaşır, sonuçta modül raporu ve puan gelir', async () => {
  const { clients, joins, room, cleanup } = await setup(3);
  try {
    clients[0].emit('room:settings', { mode: 'free', free: { regular: 2, needy: 0, pool: ['arrows', 'patch'], events: false } });
    clients[0].emit('room:defuser', { playerId: joins[1].playerId });
    await wait(30);
    clients[0].emit('game:start');
    const init = await once(clients[2], 'game:init');
    assert.equal(init.notes.serial, '');
    const upd = once(clients[2], 'notes:update');
    clients[0].emit('notes:set', { field: 'serial', value: 'AB12C7-ve-cok-uzun-bir-deger' });
    const u = await upd;
    assert.equal(u.field, 'serial');
    assert.equal(u.value.length, 12);
    clients[1].emit('notes:set', { field: 'text', value: 'imhacı yazamaz' });
    clients[0].emit('notes:set', { field: 'hack', value: 'x' });
    await wait(40);
    assert.equal(room.notes.text, '');
    assert.equal(room.notes.hack, undefined);

    await wait(60);
    const end = once(clients[0], 'game:end', 8000);
    await solveAll(room, clients[1]);
    const r = await end;
    assert.equal(r.outcome, 'defused');
    assert.equal(r.modules.length, 2);
    assert.ok(r.modules.every((m) => m.solvedAtMs >= 0 && m.strikes === 0));
    assert.ok(r.score > 1000);
    assert.equal(room.team.points, r.score);
  } finally {
    await cleanup();
  }
});

const defuserSocket = (room, clients) => clients[[...room.players.values()].findIndex((p) => p.id === room.gameDefuserId)];

test('kampanya kendi bölümleriyle başlar: imha → sonraki bölüm, patlama → can gider ve bölüm farklı bombayla tekrar', async () => {
  const { clients, room, cleanup } = await setup(2, { autoNextMs: 250 });
  try {
    clients[0].emit('room:settings', { mode: 'campaign', levelId: 'l7' }); // seviye seçimi kampanyayı etkilemez
    await wait(30);
    clients[0].emit('game:start');
    const init = await once(clients[0], 'game:init');
    assert.equal(init.levelId, null, 'kampanya seviye listesini kullanmaz');
    assert.equal(init.campaign.stage, 1);
    assert.equal(init.campaign.lives, 3);
    const seed = room.campaign.run.seed;
    await wait(80);

    let end = once(clients[0], 'game:end', 8000);
    await solveAll(room, defuserSocket(room, clients));
    let r = await end;
    assert.equal(r.outcome, 'defused');
    assert.equal(r.levelId, null);
    assert.equal(r.campaign.played, 1);
    assert.equal(r.campaign.stage, 2);
    assert.equal(r.campaign.lives, 3);
    assert.ok(r.campaign.score > 0);
    assert.equal(r.autoNext.stage, 2);
    assert.equal(r.autoNext.retry, false);
    assert.equal(r.campaign.next.stage, 2);
    assert.deepEqual(room.publicState().records, {}, 'kampanya seviye rekorlarına yazılmaz');

    const init2 = await once(clients[0], 'game:init', 3000);
    assert.equal(init2.campaign.stage, 2);
    await wait(80);
    end = once(clients[0], 'game:end', 8000);
    while (!room.game.ended) room.game.strike(null);
    r = await end;
    assert.equal(r.outcome, 'exploded');
    assert.equal(r.campaign.lives, 2);
    assert.equal(r.campaign.stage, 2, 'patlayınca aynı bölüm');
    assert.equal(r.autoNext.retry, true);

    await once(clients[0], 'game:init', 3000);
    assert.equal(room.campaign.run.seed, seed, 'aynı kampanya devam eder');
    assert.equal(room.game.config.attempt, 1);
    assert.equal(room.game.config.stage, 2);
  } finally {
    await cleanup();
  }
});

test('kampanya: canlar bitince sona erer, yeni başlatma yeni bir kampanya açar', async () => {
  const { clients, room, cleanup } = await setup(2, { autoNextMs: 60 });
  try {
    clients[0].emit('room:settings', { mode: 'campaign' });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    const seed = room.campaign.run.seed;
    let r;
    for (let i = 0; i < 3; i++) {
      await wait(80);
      const end = once(clients[0], 'game:end', 8000);
      while (!room.game.ended) room.game.strike(null);
      r = await end;
      if (i < 2) await once(clients[0], 'game:init', 3000);
    }
    assert.equal(r.campaign.lives, 0);
    assert.equal(r.campaign.over, true);
    assert.equal(r.campaign.won, false);
    assert.equal(r.autoNext, undefined);
    await wait(200);
    assert.equal(room.phase, 'result', 'bitmiş kampanya kendiliğinden başlamaz');
    clients[0].emit('game:start');
    const init = await once(clients[0], 'game:init');
    assert.equal(init.campaign.stage, 1);
    assert.equal(init.campaign.lives, 3);
    assert.notEqual(room.campaign.run.seed, seed, 'yeni kampanya yeni tohumla başlar');
  } finally {
    await cleanup();
  }
});

test('kampanya: 12. bölüm geçilince kazanılır; durdur ve sıfırla çalışır', async () => {
  const { clients, room, cleanup } = await setup(2, { autoNextMs: 200 });
  try {
    clients[0].emit('room:settings', { mode: 'campaign' });
    await wait(30);
    clients[0].emit('game:start');
    await once(clients[0], 'game:init');
    await wait(80);
    // Durdur: yalnızca oda sahibi
    let end = once(clients[0], 'game:end', 8000);
    await solveAll(room, defuserSocket(room, clients));
    await end;
    await wait(40);
    const held = once(clients[1], 'game:end');
    clients[1].emit('campaign:hold');
    clients[0].emit('campaign:hold');
    assert.equal((await held).autoNext.held, true);
    await wait(300);
    assert.equal(room.phase, 'result');

    // Son bölüme atla ve kazan
    room.campaign.run.stage = 12;
    clients[0].emit('game:start');
    const init = await once(clients[0], 'game:init');
    assert.equal(init.campaign.stage, 12);
    await wait(80);
    // 12. bölümün havuzunda zamanlı basılan Ritim olabilir; bölümü doğrudan imha edilmiş say
    end = once(clients[0], 'game:end', 8000);
    for (const m of room.game.regularModules) m.solved = true;
    room.game.end('defused', 'solved');
    const r = await end;
    assert.equal(r.campaign.won, true);
    assert.equal(r.campaign.over, true);
    assert.equal(r.autoNext, undefined);
    assert.equal(room.campaign.best.stage, 12);

    // Sıfırla
    clients[1].emit('campaign:new');
    await wait(30);
    assert.ok(room.campaign.run);
    clients[0].emit('campaign:new');
    await wait(30);
    assert.equal(room.campaign.run, null);
  } finally {
    await cleanup();
  }
});

test('modül adları seçeneği imhacıya iletilir', async () => {
  const { clients, joins, room, cleanup } = await setup(2);
  try {
    assert.equal(room.settings.showModuleNames, false);
    clients[0].emit('room:settings', { showModuleNames: 'evet' }); // geçersiz tür yok sayılır
    clients[0].emit('room:defuser', { playerId: joins[1].playerId });
    await wait(30);
    assert.equal(room.settings.showModuleNames, false);
    clients[0].emit('room:settings', { showModuleNames: true });
    await wait(30);
    clients[0].emit('game:start');
    const d = await once(clients[1], 'game:init');
    assert.equal(d.role, 'defuser');
    assert.equal(d.showModuleNames, true);
  } finally {
    await cleanup();
  }
});
