// Odalar, oyuncular, roller ve Socket.IO olayları.

import crypto from 'crypto';
import { Game } from './game.js';
import { bombConfig, LEVELS, sanitizeFree, DEFAULT_FREE } from '../shared/levels.js';
import { ALL_TYPES } from '../shared/modules/index.js';
import { VERSION } from '../shared/version.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const MAX_PLAYERS = 10;
const ROOM_TTL_MS = 15 * 60 * 1000;
const HOST_GRACE_MS = 20000;
const NAME_MAX = 20;
const LANGS = ['tr', 'en'];
const NOTE_FIELDS = { serial: 12, batteries: 4, lit: 40, unlit: 40, ports: 60, text: 1500 };
const emptyNotes = () => Object.fromEntries(Object.keys(NOTE_FIELDS).map((k) => [k, '']));

function defaultSettings(lang) {
  return {
    mode: 'level',
    levelId: LEVELS[0].id,
    free: { ...DEFAULT_FREE, pool: DEFAULT_FREE.pool.slice(), needyPool: DEFAULT_FREE.needyPool.slice() },
    splitManual: true,
    rotateRoles: true,
    expertsSeeTimer: false,
    contentLang: LANGS.includes(lang) ? lang : 'tr',
  };
}

function cleanName(name) {
  const n = String(name || '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX);
  return n || 'Oyuncu';
}

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

class Room {
  constructor(manager, code, lang) {
    this.manager = manager;
    this.io = manager.io;
    this.code = code;
    this.players = new Map();
    this.hostId = null;
    this.defuserId = null;
    this.settings = defaultSettings(lang);
    this.phase = 'lobby'; // 'lobby' | 'playing' | 'result'
    this.game = null;
    this.gameDefuserId = null;
    this.gamePlayerIds = [];
    this.manual = null;
    this.lastResult = null;
    this.team = { games: 0, wins: 0, points: 0 };
    this.completed = new Set();
    this.notes = emptyNotes();
    this.emptySince = null;
    this.hostTimer = null;
  }

  get channel() {
    return 'room:' + this.code;
  }

  connectedPlayers() {
    return [...this.players.values()].filter((p) => p.connected);
  }

  uniqueName(name) {
    const taken = new Set([...this.players.values()].map((p) => p.name.toLocaleLowerCase('tr')));
    if (!taken.has(name.toLocaleLowerCase('tr'))) return name;
    for (let i = 2; ; i++) {
      const n = `${name.slice(0, NAME_MAX - 3)} ${i}`;
      if (!taken.has(n.toLocaleLowerCase('tr'))) return n;
    }
  }

  addPlayer(name, lang) {
    const player = {
      id: crypto.randomBytes(6).toString('hex'),
      token: crypto.randomBytes(16).toString('hex'),
      name: this.uniqueName(cleanName(name)),
      lang: LANGS.includes(lang) ? lang : 'tr',
      socketId: null,
      connected: false,
      stats: { games: 0, wins: 0, losses: 0, bestMs: null },
    };
    this.players.set(player.id, player);
    if (!this.hostId) this.hostId = player.id;
    if (!this.defuserId) this.defuserId = player.id;
    return player;
  }

  attach(player, socket) {
    player.socketId = socket.id;
    player.connected = true;
    socket.join(this.channel);
    socket.data.code = this.code;
    socket.data.playerId = player.id;
    this.emptySince = null;
  }

  detach(player) {
    player.connected = false;
    player.socketId = null;
    if (!this.connectedPlayers().length) this.emptySince = Date.now();
    if (player.id === this.hostId) {
      clearTimeout(this.hostTimer);
      this.hostTimer = setTimeout(() => {
        const host = this.players.get(this.hostId);
        if (host && !host.connected) {
          const next = this.connectedPlayers()[0];
          if (next) {
            this.hostId = next.id;
            this.broadcast();
          }
        }
      }, HOST_GRACE_MS);
      this.hostTimer.unref?.();
    }
    this.broadcast();
  }

  removePlayer(playerId) {
    const p = this.players.get(playerId);
    if (!p) return;
    this.players.delete(playerId);
    if (this.phase === 'playing' && playerId === this.gameDefuserId) this.abortGame();
    if (this.hostId === playerId) this.hostId = (this.connectedPlayers()[0] || [...this.players.values()][0])?.id || null;
    if (this.defuserId === playerId) this.defuserId = (this.connectedPlayers()[0] || [...this.players.values()][0])?.id || null;
    if (!this.players.size) {
      this.manager.destroyRoom(this.code);
      return;
    }
    if (!this.connectedPlayers().length) this.emptySince = Date.now();
    this.broadcast();
  }

  publicState() {
    return {
      version: VERSION,
      code: this.code,
      phase: this.phase,
      hostId: this.hostId,
      defuserId: this.defuserId,
      settings: this.settings,
      players: [...this.players.values()].map((p) => ({ id: p.id, name: p.name, connected: p.connected, stats: p.stats })),
      team: this.team,
      lastResult: this.lastResult,
      completed: [...this.completed],
      records: this.manager.leaderboard.top(5),
    };
  }

  broadcast() {
    this.io.to(this.channel).emit('room:state', this.publicState());
  }

  updateSettings(s) {
    if (!s || typeof s !== 'object' || this.phase === 'playing') return;
    const cur = this.settings;
    if (s.mode === 'level' || s.mode === 'free') cur.mode = s.mode;
    if (LEVELS.some((l) => l.id === s.levelId)) cur.levelId = s.levelId;
    if (s.free && typeof s.free === 'object') cur.free = sanitizeFree({ ...cur.free, ...s.free });
    for (const k of ['splitManual', 'rotateRoles', 'expertsSeeTimer']) if (typeof s[k] === 'boolean') cur[k] = s[k];
    if (LANGS.includes(s.contentLang)) cur.contentLang = s.contentLang;
    this.broadcast();
  }

  setDefuser(playerId) {
    if (this.phase === 'playing' || !this.players.has(playerId)) return;
    this.defuserId = playerId;
    this.broadcast();
  }

  startGame() {
    if (this.phase === 'playing') return;
    const connected = this.connectedPlayers();
    if (!connected.length) return;
    if (!this.players.get(this.defuserId)?.connected) this.defuserId = connected[0].id;

    this.game?.destroy();
    this.gameDefuserId = this.defuserId;
    this.gamePlayerIds = connected.map((p) => p.id);
    this.game = new Game({
      config: bombConfig(this.settings),
      lang: this.settings.contentLang,
      hooks: {
        toDefuser: (ev, data) => {
          const p = this.players.get(this.gameDefuserId);
          if (p?.socketId) this.io.to(p.socketId).emit(ev, data);
        },
        toAll: (ev, data) => this.io.to(this.channel).emit(ev, data),
        onEnd: (result) => this.onGameEnd(result),
      },
      ...(this.manager.gameOptions || {}),
    });
    this.manual = this.assignManual();
    this.notes = emptyNotes();
    this.phase = 'playing';
    this.lastResult = null;
    this.broadcast();
    for (const p of connected) this.sendInit(p);
    this.game.start();
  }

  assignManual() {
    const experts = this.connectedPlayers().filter((p) => p.id !== this.gameDefuserId);
    if (!this.settings.splitManual || experts.length < 2) return { split: false };
    const present = [...new Set(this.game.modules.map((m) => m.type))];
    const absent = ALL_TYPES.filter((t) => !present.includes(t));
    const order = shuffle(experts);
    const owners = {};
    let k = 0;
    for (const t of [...shuffle(present), ...shuffle(absent)]) owners[t] = order[k++ % order.length].id;
    return { split: true, owners, expertIds: experts.map((p) => p.id) };
  }

  manualFor(playerId) {
    const m = this.manual;
    if (!m || !m.split || !m.expertIds.includes(playerId)) return { split: false };
    const owners = {};
    for (const [t, id] of Object.entries(m.owners)) owners[t] = this.players.get(id)?.name || '?';
    return { split: true, mine: Object.keys(m.owners).filter((t) => m.owners[t] === playerId), owners };
  }

  sendInit(player) {
    if (!this.game || !player.socketId) return;
    const role = player.id === this.gameDefuserId ? 'defuser' : 'expert';
    const extra = {
      defuserName: this.players.get(this.gameDefuserId)?.name || '?',
      expertsSeeTimer: this.settings.expertsSeeTimer,
      levelId: this.game.config.levelId,
    };
    if (role === 'expert') {
      extra.manual = this.manualFor(player.id);
      extra.notes = this.notes;
    }
    this.io.to(player.socketId).emit('game:init', this.game.initPayload(role, extra));
  }

  setNote(field, value, fromSocket) {
    if (this.phase !== 'playing' || !(field in NOTE_FIELDS)) return;
    const v = String(value ?? '').slice(0, NOTE_FIELDS[field]);
    if (this.notes[field] === v) return;
    this.notes[field] = v;
    fromSocket.to(this.channel).emit('notes:update', { field, value: v });
  }

  abortGame() {
    if (this.phase === 'playing' && this.game) this.game.end('aborted', 'aborted');
  }

  onGameEnd(result) {
    const defuser = this.players.get(this.gameDefuserId);
    const names = this.gamePlayerIds.map((id) => this.players.get(id)?.name).filter(Boolean);
    let rank = null;
    if (result.outcome !== 'aborted') {
      this.team.games++;
      this.team.points += result.score || 0;
      if (defuser) {
        defuser.stats.games++;
        if (result.outcome === 'defused') {
          defuser.stats.wins++;
          if (defuser.stats.bestMs === null || result.timeUsedMs < defuser.stats.bestMs) defuser.stats.bestMs = result.timeUsedMs;
        } else defuser.stats.losses++;
      }
      if (result.outcome === 'defused') {
        this.team.wins++;
        if (this.settings.mode === 'level' && result.levelId) {
          this.completed.add(result.levelId);
          rank = this.manager.leaderboard.record(result.levelId, {
            team: names,
            defuser: defuser?.name || '?',
            timeMs: result.timeUsedMs,
            strikes: result.strikes,
          });
        }
      }
    }
    this.lastResult = {
      ...result,
      mode: this.settings.mode,
      defuserName: defuser?.name || '?',
      team: names,
      rank,
    };
    this.phase = 'result';
    if (this.settings.rotateRoles && result.outcome !== 'aborted') this.rotateDefuser();
    this.io.to(this.channel).emit('game:end', this.lastResult);
    this.broadcast();
  }

  rotateDefuser() {
    const ids = [...this.players.keys()];
    if (ids.length < 2) return;
    const start = ids.indexOf(this.gameDefuserId);
    for (let i = 1; i <= ids.length; i++) {
      const p = this.players.get(ids[(start + i) % ids.length]);
      if (p.connected) {
        this.defuserId = p.id;
        return;
      }
    }
  }

  toLobby() {
    if (this.phase !== 'result') return;
    this.phase = 'lobby';
    this.game?.destroy();
    this.game = null;
    this.broadcast();
  }

  destroy() {
    this.game?.destroy();
    clearTimeout(this.hostTimer);
  }
}

export class RoomManager {
  constructor(io, leaderboard, gameOptions = null) {
    this.io = io;
    this.leaderboard = leaderboard;
    this.gameOptions = gameOptions;
    this.rooms = new Map();
    this.sweeper = setInterval(() => this.sweep(), 60000);
    this.sweeper.unref?.();
    io.on('connection', (socket) => this.handleConnection(socket));
  }

  newCode() {
    for (;;) {
      let c = '';
      for (let i = 0; i < 4; i++) c += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
      if (!this.rooms.has(c)) return c;
    }
  }

  destroyRoom(code) {
    const room = this.rooms.get(code);
    if (!room) return;
    room.destroy();
    this.rooms.delete(code);
  }

  sweep() {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      if (room.emptySince && now - room.emptySince > ROOM_TTL_MS) this.destroyRoom(room.code);
    }
  }

  close() {
    clearInterval(this.sweeper);
    for (const code of [...this.rooms.keys()]) this.destroyRoom(code);
  }

  ctx(socket) {
    const room = this.rooms.get(socket.data.code);
    const player = room?.players.get(socket.data.playerId);
    return room && player ? { room, player } : null;
  }

  leaveCurrent(socket) {
    const c = this.ctx(socket);
    if (c) {
      socket.leave(c.room.channel);
      c.room.removePlayer(c.player.id);
    }
    socket.data.code = null;
    socket.data.playerId = null;
  }

  handleConnection(socket) {
    const reply = (ack, data) => typeof ack === 'function' && ack(data);
    const asHost = (fn) => (payload) => {
      const c = this.ctx(socket);
      if (c && c.room.hostId === c.player.id) fn(c.room, payload, c.player);
    };

    socket.on('room:create', (p = {}, ack) => {
      this.leaveCurrent(socket);
      const room = new Room(this, this.newCode(), p.lang);
      this.rooms.set(room.code, room);
      const player = room.addPlayer(p.name, p.lang);
      room.attach(player, socket);
      reply(ack, { ok: true, code: room.code, playerId: player.id, token: player.token });
      room.broadcast();
    });

    socket.on('room:join', (p = {}, ack) => {
      const code = String(p.code || '')
        .toUpperCase()
        .trim();
      const room = this.rooms.get(code);
      if (!room) return reply(ack, { ok: false, error: 'room_not_found' });
      let player = p.token ? [...room.players.values()].find((x) => x.token === p.token) : null;
      const cur = this.ctx(socket);
      if (!(cur && player && cur.player.id === player.id)) this.leaveCurrent(socket);
      if (!player) {
        if (room.players.size >= MAX_PLAYERS) return reply(ack, { ok: false, error: 'room_full' });
        player = room.addPlayer(p.name, p.lang);
      } else if (player.connected && player.socketId !== socket.id) {
        const old = this.io.sockets.sockets.get(player.socketId);
        if (old) {
          old.leave(room.channel);
          old.data.code = null;
          old.data.playerId = null;
          old.emit('room:replaced');
        }
      }
      room.attach(player, socket);
      reply(ack, { ok: true, code: room.code, playerId: player.id, token: player.token });
      room.broadcast();
      if (room.phase === 'playing') room.sendInit(player);
      if (room.phase === 'result' && room.lastResult) socket.emit('game:end', room.lastResult);
    });

    socket.on('room:leave', () => this.leaveCurrent(socket));

    socket.on(
      'room:settings',
      asHost((room, s) => room.updateSettings(s))
    );
    socket.on(
      'room:defuser',
      asHost((room, p) => room.setDefuser(p && p.playerId))
    );
    socket.on(
      'game:start',
      asHost((room) => room.startGame())
    );
    socket.on(
      'game:pause',
      asHost((room, p) => room.phase === 'playing' && room.game?.setPaused(!!(p && p.paused)))
    );
    socket.on('notes:set', (p = {}) => {
      const c = this.ctx(socket);
      if (c && c.player.id !== c.room.gameDefuserId) c.room.setNote(String(p.field), p.value, socket);
    });
    socket.on(
      'game:abort',
      asHost((room) => room.abortGame())
    );
    socket.on(
      'game:lobby',
      asHost((room) => room.toLobby())
    );

    socket.on('game:action', (p = {}) => {
      const c = this.ctx(socket);
      if (!c || c.room.phase !== 'playing' || c.player.id !== c.room.gameDefuserId) return;
      c.room.game?.handleAction(String(p.moduleId), p.action, p.t);
    });

    socket.on('client:error', (p = {}) => {
      const c = this.ctx(socket);
      const s = (v, n) => String(v ?? '').slice(0, n);
      console.warn(`[istemci hatası] oda=${c?.room.code || '-'} v=${s(p.version, 12)} ${s(p.where, 80)}: ${s(p.message, 300)}\n  ${s(p.ua, 200)}\n  ${s(p.stack, 600)}`);
    });

    socket.on('disconnect', () => {
      const c = this.ctx(socket);
      if (c && c.player.socketId === socket.id) c.room.detach(c.player);
    });
  }
}
