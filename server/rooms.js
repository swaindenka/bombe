// Odalar, oyuncular, roller ve Socket.IO olayları.

import crypto from 'crypto';
import { Game } from './game.js';
import { bombConfig, LEVELS, sanitizeFree, DEFAULT_FREE } from '../shared/levels.js';
import { ALL_TYPES } from '../shared/modules/index.js';
import { campaignStage, stageBrief, CAMPAIGN_STAGES, DIFFICULTY_IDS, difficultyOf } from '../shared/campaign.js';
import { VERSION } from '../shared/version.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const MAX_PLAYERS = 10;
const ROOM_TTL_MS = 15 * 60 * 1000;
const HOST_GRACE_MS = 20000;
const AUTO_NEXT_MS = 12000; // kampanyada sonraki bombaya kadar sonuç ekranı süresi
const RELEASE_DELAY_MS = 8000; // kopan uzman bu süre içinde dönmezse kılavuz sayfaları diğerlerine açılır
const MODES = ['level', 'free', 'campaign'];
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
    showModuleNames: false,
    campaignDifficulty: 'normal', // yeni kampanya bu zorlukla başlar
    public: false, // ana sayfadaki açık oda listesinde görünsün mü
    title: '',
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

const TITLE_MAX = 30;
const PUBLIC_LIST_MAX = 50;
const cleanTitle = (s) =>
  String(s ?? '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, TITLE_MAX);

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
    this.campaign = { run: null, best: { stage: 0, score: 0 }, runs: 0 };
    this.autoTimer = null;
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
    socket.leave('browser'); // odaya giren artık listeyi izlemez
    socket.data.code = this.code;
    socket.data.playerId = player.id;
    this.emptySince = null;
  }

  detach(player) {
    player.connected = false;
    player.socketId = null;
    if (!this.connectedPlayers().length) this.emptySince = Date.now();
    // Sayfa yenileme gibi kısa kopmalarda sayfalar paylaşılmasın; uzman dönmezse açılır
    if (this.phase === 'playing') {
      const game = this.game;
      const t = setTimeout(() => {
        if (this.game === game && !player.connected) this.releasePages(player.id);
      }, this.manager.gameOptions?.releaseDelayMs ?? RELEASE_DELAY_MS);
      t.unref?.();
    }
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
    this.releasePages(playerId);
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
      campaign: { run: this.campaignSummary(), best: this.campaign.best },
      records: this.manager.leaderboard.top(5),
    };
  }

  broadcast() {
    this.io.to(this.channel).emit('room:state', this.publicState());
    this.manager.notifyBrowser();
  }

  /** Açık oda listesinde gösterilen özet (oyuncu jetonları vb. içermez) */
  listing() {
    const host = this.players.get(this.hostId);
    const s = this.settings;
    return {
      code: this.code,
      title: s.title,
      host: host?.name || '?',
      players: this.connectedPlayers().length,
      max: MAX_PLAYERS,
      phase: this.phase,
      mode: s.mode,
      levelId: s.mode === 'level' ? s.levelId : null,
      stage: s.mode === 'campaign' ? this.campaign.run?.stage || null : null,
      lang: s.contentLang,
    };
  }

  updateSettings(s) {
    if (!s || typeof s !== 'object' || this.phase === 'playing') return;
    const cur = this.settings;
    if (MODES.includes(s.mode)) cur.mode = s.mode;
    if (LEVELS.some((l) => l.id === s.levelId)) cur.levelId = s.levelId;
    if (s.free && typeof s.free === 'object') cur.free = sanitizeFree({ ...cur.free, ...s.free });
    for (const k of ['splitManual', 'rotateRoles', 'expertsSeeTimer', 'showModuleNames', 'public']) if (typeof s[k] === 'boolean') cur[k] = s[k];
    if (typeof s.title === 'string') cur.title = cleanTitle(s.title);
    if (DIFFICULTY_IDS.includes(s.campaignDifficulty)) cur.campaignDifficulty = s.campaignDifficulty;
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
    this.clearAuto();
    const connected = this.connectedPlayers();
    if (!connected.length) return;
    if (!this.players.get(this.defuserId)?.connected) this.defuserId = connected[0].id;

    this.game?.destroy();
    this.gameDefuserId = this.defuserId;
    this.gamePlayerIds = connected.map((p) => p.id);
    this.game = new Game({
      config: this.settings.mode === 'campaign' ? this.campaignConfig() : bombConfig(this.settings),
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
    return { split: true, owners, expertIds: experts.map((p) => p.id), shared: [] };
  }

  manualFor(playerId) {
    const m = this.manual;
    if (!m || !m.split || !m.expertIds.includes(playerId)) return { split: false };
    const owners = {};
    for (const [t, id] of Object.entries(m.owners)) owners[t] = this.players.get(id)?.name || '?';
    // Bağlantısı kopan uzmanın sayfaları herkese açılır (shared)
    return { split: true, mine: Object.keys(m.owners).filter((t) => m.owners[t] === playerId || m.shared.includes(t)), owners };
  }

  /**
   * Oyun sırasında bir uzman ayrılır ya da bağlantısı koparsa, kılavuzun onda kalan bölümleri
   * diğer uzmanlara açılır. Kimse bir sayfayı kaybetmez; dönen uzman da kendi sayfalarını görür.
   */
  releasePages(playerId) {
    const m = this.manual;
    if (this.phase !== 'playing' || !m?.split || !m.expertIds.includes(playerId)) return;
    const fresh = Object.keys(m.owners).filter((t) => m.owners[t] === playerId && !m.shared.includes(t));
    if (!fresh.length) return;
    m.shared.push(...fresh);
    for (const id of m.expertIds) {
      const p = id !== playerId && this.players.get(id);
      if (p?.connected && p.socketId) this.io.to(p.socketId).emit('game:manual', { manual: this.manualFor(id), released: fresh, by: this.players.get(playerId)?.name || '?' });
    }
  }

  sendInit(player) {
    if (!this.game || !player.socketId) return;
    const role = player.id === this.gameDefuserId ? 'defuser' : 'expert';
    const extra = {
      defuserName: this.players.get(this.gameDefuserId)?.name || '?',
      expertsSeeTimer: this.settings.expertsSeeTimer,
      showModuleNames: this.settings.showModuleNames,
      levelId: this.game.config.levelId,
      mode: this.settings.mode,
    };
    if (this.game.config.stage) {
      const c = this.game.config;
      extra.campaign = {
        seed: this.campaign.run?.seed,
        stage: c.stage,
        total: CAMPAIGN_STAGES,
        lives: this.campaign.run?.lives,
        maxLives: this.campaign.run?.maxLives,
        difficulty: c.difficulty,
        modifiers: c.modifiers,
        place: c.place,
        featured: c.featured,
      };
    }
    if (role === 'expert') {
      extra.manual = this.manualFor(player.id);
      extra.notes = this.notes;
      if (this.game.config.scrambledManual) extra.scrambledManual = this.game.seed;
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

  /** Oda sahibi bir oyuncuyu çıkarır (oyun sırasında değil) */
  kickPlayer(playerId, byId) {
    if (this.phase === 'playing' || playerId === byId || !this.players.has(playerId)) return;
    const p = this.players.get(playerId);
    const sock = p.socketId && this.io.sockets.sockets.get(p.socketId);
    if (sock) {
      sock.leave(this.channel);
      sock.data.code = null;
      sock.data.playerId = null;
      sock.emit('room:kicked');
    }
    this.removePlayer(playerId);
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
        if (result.levelId) {
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
      ...this.campaignStep(result),
    };
    this.phase = 'result';
    if (this.settings.rotateRoles && result.outcome !== 'aborted') this.rotateDefuser();
    this.io.to(this.channel).emit('game:end', this.resultPayload());
    this.broadcast();
  }

  // --- Kampanya: kendi bölüm sistemi (seviye listesinden bağımsız) ---

  /** Yeni kampanya: rastgele tohum, 1. bölüm, tam can */
  newCampaignRun() {
    const difficulty = this.settings.campaignDifficulty;
    const lives = difficultyOf(difficulty).lives;
    this.campaign.run = {
      seed: crypto.randomInt(1, 2 ** 31),
      difficulty,
      stage: 1,
      attempt: 0,
      lives,
      maxLives: lives,
      score: 0,
      history: [],
      over: false,
      won: false,
    };
    this.campaign.runs++;
    return this.campaign.run;
  }

  /** Oynanacak bölümün yapılandırması; bitmiş ya da hiç başlamamış kampanya yenisini açar */
  campaignConfig() {
    let run = this.campaign.run;
    if (!run || run.over) run = this.newCampaignRun();
    return campaignStage(run.seed, run.stage, run.attempt, run.difficulty);
  }

  campaignSummary() {
    const run = this.campaign.run;
    if (!run) return null;
    return {
      seed: run.seed,
      difficulty: run.difficulty,
      stage: run.stage,
      total: CAMPAIGN_STAGES,
      lives: run.lives,
      maxLives: run.maxLives,
      score: run.score,
      over: run.over,
      won: run.won,
      history: run.history,
      next: run.over ? null : stageBrief(campaignStage(run.seed, run.stage, run.attempt, run.difficulty)),
    };
  }

  /** İmha edilince sonraki bölüm, patlayınca can gider ve bölüm farklı bir bombayla tekrar gelir */
  campaignStep(result) {
    const run = this.campaign.run;
    const cfg = this.game?.config;
    if (this.settings.mode !== 'campaign' || result.outcome === 'aborted' || !run || !cfg?.stage) return {};
    const defused = result.outcome === 'defused';
    run.history.push({ stage: cfg.stage, outcome: result.outcome, score: result.score || 0 });
    if (defused) {
      run.score += result.score || 0;
      if (cfg.stage >= CAMPAIGN_STAGES) {
        run.won = true;
        run.over = true;
      } else {
        run.stage = cfg.stage + 1;
        run.attempt = 0;
      }
    } else {
      run.lives--;
      run.attempt++;
      if (run.lives <= 0) run.over = true;
    }
    const best = this.campaign.best;
    const reached = defused ? cfg.stage : cfg.stage - 1;
    if (reached > best.stage || (reached === best.stage && run.score > best.score)) {
      this.campaign.best = { stage: reached, score: run.score };
    }
    const campaign = { played: cfg.stage, ...this.campaignSummary() };
    if (run.over) return { campaign };
    const delay = this.manager.gameOptions?.autoNextMs ?? AUTO_NEXT_MS;
    this.autoTimer = setTimeout(() => {
      this.autoTimer = null;
      if (this.phase === 'result' && this.settings.mode === 'campaign') this.startGame();
    }, delay);
    this.autoTimer.unref?.();
    return { campaign, autoNext: { stage: run.stage, retry: !defused, at: Date.now() + delay, held: false } };
  }

  /** Oda sahibi kampanyayı sıfırlar */
  resetCampaign() {
    if (this.phase === 'playing') return;
    this.clearAuto();
    this.campaign.run = null;
    this.broadcast();
  }

  /** Sonuç; otomatik başlangıca kalan süre gönderildiği anda hesaplanır */
  resultPayload() {
    const r = this.lastResult;
    if (!r?.autoNext) return r;
    return { ...r, autoNext: { ...r.autoNext, inMs: r.autoNext.held ? null : Math.max(0, r.autoNext.at - Date.now()) } };
  }

  clearAuto() {
    clearTimeout(this.autoTimer);
    this.autoTimer = null;
  }

  holdCampaign() {
    if (!this.autoTimer || !this.lastResult?.autoNext) return;
    this.clearAuto();
    this.lastResult.autoNext.held = true;
    this.io.to(this.channel).emit('game:end', this.resultPayload());
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
    this.clearAuto();
    this.phase = 'lobby';
    this.game?.destroy();
    this.game = null;
    this.broadcast();
  }

  destroy() {
    this.game?.destroy();
    this.clearAuto();
    clearTimeout(this.hostTimer);
  }
}

export class RoomManager {
  constructor(io, leaderboard, gameOptions = null) {
    this.io = io;
    this.leaderboard = leaderboard;
    this.gameOptions = gameOptions;
    this.rooms = new Map();
    this.browserTimer = null;
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
    this.notifyBrowser();
  }

  /** Açık odalar: en az bir bağlı oyuncusu olan, herkese açık işaretli odalar */
  publicRooms() {
    const order = { lobby: 0, result: 1, playing: 2 };
    return [...this.rooms.values()]
      .filter((r) => r.settings.public && r.connectedPlayers().length > 0)
      .map((r) => r.listing())
      .sort((a, b) => order[a.phase] - order[b.phase] || (a.players >= a.max) - (b.players >= b.max) || b.players - a.players)
      .slice(0, PUBLIC_LIST_MAX);
  }

  /** Ana sayfada listeyi izleyenlere değişiklikleri toplu gönder */
  notifyBrowser() {
    if (this.browserTimer) return;
    this.browserTimer = setTimeout(() => {
      this.browserTimer = null;
      this.io.to('browser').emit('rooms:list', this.publicRooms());
    }, 250);
    this.browserTimer.unref?.();
  }

  sweep() {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      if (room.emptySince && now - room.emptySince > ROOM_TTL_MS) this.destroyRoom(room.code);
    }
  }

  close() {
    clearInterval(this.sweeper);
    clearTimeout(this.browserTimer);
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
      room.settings.public = p.public === true;
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
      if (room.phase === 'result' && room.lastResult) socket.emit('game:end', room.resultPayload());
    });

    socket.on('room:leave', () => this.leaveCurrent(socket));

    // Ana sayfadaki açık oda listesi
    socket.on('rooms:watch', () => {
      socket.join('browser');
      socket.emit('rooms:list', this.publicRooms());
    });
    socket.on('rooms:unwatch', () => socket.leave('browser'));

    socket.on(
      'room:settings',
      asHost((room, s) => room.updateSettings(s))
    );
    socket.on(
      'room:kick',
      asHost((room, p, host) => room.kickPlayer(p && p.playerId, host.id))
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
      'campaign:new',
      asHost((room) => room.resetCampaign())
    );
    socket.on(
      'campaign:hold',
      asHost((room) => room.holdCampaign())
    );
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
