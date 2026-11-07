import test from 'node:test';
import assert from 'node:assert/strict';
import { io as ioc } from 'socket.io-client';
import { createServer } from '../server/index.js';
import { nextAction } from './solver.js';

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

async function setup(n = 3) {
  const srv = await createServer({ port: 0, dataFile: null, gameOptions: { startDelayMs: 30 } });
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
    assert.equal(all.length, 10);
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
