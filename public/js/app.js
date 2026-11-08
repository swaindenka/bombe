// Uygulama: ekranlar arası geçiş, bağlantı, oturumun hatırlanması.

import { socket, request, Timer } from './net.js';
import { t, getLang, setLang } from './i18n.js';
import { esc, toast, storage } from './dom.js';
import { sound } from './audio.js';
import { lobbyHTML, bindLobby, langSwitch } from './lobby.js';
import { resultHTML } from './result.js';
import { manualHTML, bindManual } from './manual.js';
import { DefuserView } from './bomb.js';
import { ExpertView } from './expert.js';
import { applyPrefs } from './prefs.js';
import { VERSION } from '/shared/version.js';
import { reportError, installGlobalHandlers } from './errors.js';
import { LEVELS } from '/shared/levels.js';
import { settingsHTML, bindSettings } from './ui.js';

applyPrefs();

const app = document.getElementById('app');
app.innerHTML = `<div id="banner" class="banner"></div><div id="screen" class="screen"></div><div id="resultLayer"></div><div id="manualLayer"></div><div id="settingsLayer"></div>`;
const screen = document.getElementById('screen');
const resultLayer = document.getElementById('resultLayer');
const manualLayer = document.getElementById('manualLayer');
const banner = document.getElementById('banner');
const settingsLayer = document.getElementById('settingsLayer');
let disposeModalManual = null;

const state = {
  room: null,
  me: null,
  init: null,
  view: null,
  result: null,
  resultAt: 0,
  screen: null,
};
const timer = new Timer();
window.__bombe = state; // hata ayıklama için

const urlCode = () => (new URLSearchParams(location.search).get('room') || '').toUpperCase().slice(0, 4);
const session = () => storage.get('bombe.session', null, true);

// --- Ekranlar ---

function showHome() {
  state.screen = 'home';
  sound.stopAmbient();
  const name = storage.get('bombe.name', '');
  screen.innerHTML = `
    <div class="home">
      <div class="home-top"><button class="icon-btn" data-ui="settings" aria-label="${t('settingsTitle')}">⚙</button>${langSwitch()}</div>
      <div class="hero">
        <div class="logo"><span class="logo-bomb">●</span>BOMBE</div>
        <p class="tagline">${t('tagline')}</p>
      </div>
      <form class="card home-card" id="homeForm" autocomplete="off">
        <label class="field"><span>${t('yourName')}</span><input id="nameInput" maxlength="20" placeholder="${esc(t('namePlaceholder'))}" value="${esc(name)}"></label>
        <button type="button" class="btn btn-primary btn-big" data-ui="create">💣 ${t('createRoom')}</button>
        <label class="check-line"><input type="checkbox" id="publicInput" ${storage.get('bombe.publicDefault', false) ? 'checked' : ''}> <span>🌐 ${t('listPublic')}</span></label>
        <div class="or"><span>${t('or')}</span></div>
        <div class="join-row">
          <input id="codeInput" maxlength="4" placeholder="${esc(t('roomCode'))}" value="${esc(urlCode())}" aria-label="${esc(t('roomCode'))}">
          <button type="submit" class="btn" data-ui="join">${t('joinRoom')}</button>
        </div>
      </form>
      <section class="card pub-rooms">
        <div class="pub-head"><h2>🌐 ${t('publicRooms')}</h2><span class="live-dot" title="${esc(t('liveList'))}"></span></div>
        <p class="muted small">${t('publicRoomsHint')}</p>
        <ul class="pub-list" id="pubList">${publicRoomsHTML()}</ul>
      </section>
      <section class="how">
        <h2>${t('howTitle')}</h2>
        <ol>
          <li><span>💣</span><p>${t('how1')}</p></li>
          <li><span>📖</span><p>${t('how2')}</p></li>
          <li><span>🎧</span><p>${t('how3')}</p></li>
        </ol>
        <button class="btn btn-ghost" data-ui="manual">📖 ${t('readManual')}</button>
      </section>
      <p class="version-tag">BOMBE v${VERSION}</p>
    </div>`;
  const code = document.getElementById('codeInput');
  code.addEventListener('input', () => (code.value = code.value.toUpperCase().replace(/[^A-Z]/g, '')));
  document.getElementById('publicInput').addEventListener('change', (e) => storage.set('bombe.publicDefault', e.target.checked));
  socket.emit('rooms:watch');
  document.getElementById('homeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    joinRoom();
  });
}

// --- Açık odalar ---

function modeLabel(r) {
  if (r.mode === 'campaign') return `🎯 ${t('modeCampaign')}${r.stage ? ` · ${t('campaignStage')} ${r.stage}` : ''}`;
  if (r.mode === 'free') return `🎲 ${t('modeFree')}`;
  const i = LEVELS.findIndex((l) => l.id === r.levelId);
  return `🏁 ${t('levelShort')} ${i + 1}`;
}

function publicRoomsHTML() {
  const list = state.publicRooms;
  if (!list) return `<li class="pub-empty">${t('connecting')}</li>`;
  if (!list.length) return `<li class="pub-empty">${t('noPublicRooms')}</li>`;
  return list
    .map((r) => {
      const full = r.players >= r.max;
      const status = full ? t('full') : r.phase === 'playing' ? t('statusPlaying') : r.phase === 'result' ? t('statusResult') : t('statusLobby');
      return `
        <li class="pub-room">
          <div class="pr-main">
            <b>${esc(r.title || '🏠 ' + r.host)}</b>
            <span class="pr-meta">${r.title ? `👤 ${esc(r.host)} · ` : ''}👥 ${r.players}/${r.max} · ${modeLabel(r)} · ${r.lang.toUpperCase()} · <span class="mono">${esc(r.code)}</span></span>
          </div>
          <span class="pr-status ${full ? 'full' : r.phase}">${status}</span>
          <button class="btn btn-small ${full ? '' : 'btn-primary'}" data-ui="joinPublic" data-code="${esc(r.code)}" ${full ? 'disabled' : ''}>${t('joinRoom')}</button>
        </li>`;
    })
    .join('');
}

function renderPublicRooms() {
  const ul = document.getElementById('pubList');
  if (ul) ul.innerHTML = publicRoomsHTML();
}

function showLobby() {
  state.screen = 'lobby';
  sound.startAmbient();
  const scroll = screen.querySelector('.lobby')?.scrollTop ?? 0;
  const winScroll = window.scrollY;
  // Oda adı yazılırken gelen bir güncelleme yazılanı silmesin
  const typing = document.activeElement?.matches?.('[data-title]') ? document.activeElement : null;
  const draft = typing && { value: typing.value, a: typing.selectionStart, b: typing.selectionEnd };
  screen.innerHTML = lobbyHTML(state.room, state.me);
  if (draft) {
    const el = screen.querySelector('[data-title]');
    if (el) {
      el.value = draft.value;
      el.focus();
      el.setSelectionRange(draft.a, draft.b);
    }
  }
  const l = screen.querySelector('.lobby');
  if (l) l.scrollTop = scroll;
  window.scrollTo(0, winScroll);
}

function showLoading() {
  state.screen = 'loading';
  screen.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

let autoTick = null;
function showResult() {
  clearInterval(autoTick);
  if (!state.result) {
    resultLayer.innerHTML = '';
    return;
  }
  resultLayer.innerHTML = resultHTML(state.result, state.room, state.me);
  // Kampanya geri sayımı
  const a = state.result.autoNext;
  if (a && !a.held && state.autoAt) {
    const el = () => resultLayer.querySelector('[data-autocount]');
    autoTick = setInterval(() => {
      const left = Math.max(0, Math.ceil((state.autoAt - performance.now()) / 1000));
      if (el()) el().textContent = left;
      if (left <= 3 && left > 0 && left !== state.lastBeep) {
        state.lastBeep = left;
        sound.countdown(false);
      }
      if (!left) clearInterval(autoTick);
    }, 200);
  }
}

function hideResult() {
  clearInterval(autoTick);
  resultLayer.innerHTML = '';
}

function openManual() {
  const contentLang = state.room?.settings.contentLang || getLang();
  manualLayer.innerHTML = `
    <div class="modal">
      <div class="modal-bar"><b>📖 ${t('manual')}</b><button class="btn btn-small" data-ui="closeManual">✕ ${t('close')}</button></div>
      <div class="modal-body">${manualHTML({ contentLang })}</div>
    </div>`;
  document.body.classList.add('modal-open');
  disposeModalManual?.();
  disposeModalManual = bindManual(manualLayer.querySelector('.modal-body'));
}

function closeManual() {
  disposeModalManual?.();
  disposeModalManual = null;
  manualLayer.innerHTML = '';
  document.body.classList.remove('modal-open');
}

function destroyGame() {
  state.view?.destroy();
  state.view = null;
  state.init = null;
  screen.querySelector('.game')?.remove();
}

function route() {
  const room = state.room;
  if (!room) {
    destroyGame();
    hideResult();
    showHome();
    return;
  }
  if (room.phase === 'lobby') {
    destroyGame();
    state.result = null;
    hideResult();
    showLobby();
  } else if (room.phase === 'playing') {
    hideResult();
    if (!state.view) showLoading();
  } else if (room.phase === 'result') {
    if (!state.view) showLobby();
    state.result = state.result || room.lastResult;
    if (performance.now() >= state.resultAt) showResult();
  }
}

function toggleSettings(open = !settingsLayer.innerHTML) {
  settingsLayer.innerHTML = open ? `<div class="settings-backdrop" data-ui="closeSettings"></div>${settingsHTML()}` : '';
}

function mountGame(init) {
  sound.stopAmbient();
  destroyGame();
  hideResult();
  closeManual();
  state.init = init;
  state.result = null;
  state.screen = 'game';
  timer.sync(init.timer);
  screen.innerHTML = '';
  const opts = { timer, isHost: state.room?.hostId === state.me };
  try {
    state.view = init.role === 'defuser' ? new DefuserView(screen, init, opts) : new ExpertView(screen, init, opts);
  } catch (err) {
    state.view = null;
    showCrash(reportError(err, `mount ${init.role}`));
    return;
  }
  showTip(init.role);
}

/** Her rol için bir kerelik kısa ipucu */
function showTip(role) {
  if (storage.get('bombe.tip.' + role, false)) return;
  // Bombanın üstünü kapatmasın: üst çubuğun altında akışa giren bir şerit; sahne küçülür, bomba yeniden ölçeklenir
  const bar = screen.querySelector('.game-bar');
  if (!bar) return;
  const card = document.createElement('div');
  card.className = 'tip-card';
  card.innerHTML = `<b>💡 ${t(role === 'defuser' ? 'tipDefuserTitle' : 'tipExpertTitle')}</b><ul>${t(role === 'defuser' ? 'tipDefuser' : 'tipExpert')
    .split('|')
    .map((x) => `<li>${x}</li>`)
    .join('')}</ul><button class="btn btn-small btn-primary" data-ui="tipOk" data-role="${role}">${t('tipOk')}</button>`;
  bar.after(card);
}

/** Oyun ekranı açılamazsa boş ekran yerine sebebini göster */
function showCrash(message) {
  state.screen = 'crash';
  screen.innerHTML = `
    <div class="crash">
      <div class="crash-card">
        <div class="crash-icon">⚠</div>
        <h2>${t('crashTitle')}</h2>
        <p>${t('crashText')}</p>
        <pre>${esc(message)}\nv${VERSION} · ${esc(navigator.userAgent)}</pre>
        <div class="crash-actions">
          <button class="btn btn-primary" data-ui="reload">⟳ ${t('reload')}</button>
          ${state.room?.hostId === state.me ? `<button class="btn" data-ui="abortCrash">${t('abort')}</button>` : ''}
        </div>
      </div>
    </div>`;
}

installGlobalHandlers((msg) => {
  if (state.screen === 'game' && !screen.querySelector('.game')) showCrash(msg);
  else toast('⚠ ' + msg, 'danger', 5000);
});

// --- Oda işlemleri ---

function readName() {
  const input = document.getElementById('nameInput');
  const name = (input?.value || '').trim();
  if (!name) {
    toast(t('nameRequired'), 'danger');
    input?.focus();
    return null;
  }
  storage.set('bombe.name', name);
  return name;
}

function enteredRoom(res) {
  socket.emit('rooms:unwatch');
  state.me = res.playerId;
  storage.set('bombe.session', { code: res.code, token: res.token }, true);
  history.replaceState(null, '', `?room=${res.code}`);
}

async function createRoom() {
  const name = readName();
  if (!name) return;
  const isPublic = !!document.getElementById('publicInput')?.checked;
  const res = await request('room:create', { name, lang: getLang(), public: isPublic });
  if (res?.ok) enteredRoom(res);
}

async function joinRoom() {
  const name = readName();
  if (!name) return;
  const code = (document.getElementById('codeInput')?.value || '').trim().toUpperCase();
  if (code.length !== 4) {
    toast(t('codeRequired'), 'danger');
    return;
  }
  const res = await request('room:join', { code, name, lang: getLang() });
  if (res?.ok) enteredRoom(res);
  else toast(t('err_' + (res?.error || 'room_not_found')), 'danger');
}

async function rejoin() {
  const s = session();
  if (!s) return;
  const res = await request('room:join', { code: s.code, token: s.token, name: storage.get('bombe.name', ''), lang: getLang() });
  if (res?.ok) enteredRoom(res);
  else {
    storage.remove('bombe.session', true);
    if (state.room) {
      state.room = null;
      route();
    }
  }
}

function leaveRoom() {
  socket.emit('room:leave');
  storage.remove('bombe.session', true);
  history.replaceState(null, '', '/');
  state.room = null;
  state.me = null;
  route();
}

function copyLink() {
  const url = `${location.origin}/?room=${state.room.code}`;
  const done = () => toast(t('copied'), 'ok');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => prompt(t('copyLink'), url));
  else prompt(t('copyLink'), url);
}

// --- Genel tıklamalar ---

document.addEventListener(
  'pointerdown',
  () => {
    const first = !sound.ready;
    sound.unlock();
    if (first && state.screen === 'lobby') setTimeout(() => sound.startAmbient(), 100);
  },
  { capture: true }
);

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-ui]');
  if (!el || el.disabled) return;
  const ui = el.dataset.ui;
  if (ui === 'create') createRoom();
  else if (ui === 'join' && el.type !== 'submit') joinRoom();
  else if (ui === 'joinPublic') {
    const input = document.getElementById('codeInput');
    if (input) input.value = el.dataset.code;
    joinRoom();
  }
  else if (ui === 'copy') copyLink();
  else if (ui === 'leave') leaveRoom();
  else if (ui === 'manual') openManual();
  else if (ui === 'closeManual') closeManual();
  else if (ui === 'settings') toggleSettings();
  else if (ui === 'reload') location.reload();
  else if (ui === 'abortCrash') socket.emit('game:abort');
  else if (ui === 'closeSettings' && (e.target === el || el.tagName === 'BUTTON')) toggleSettings(false);
  else if (ui === 'start' || ui === 'again') socket.emit('game:start');
  else if (ui === 'lobby') socket.emit('game:lobby');
  else if (ui === 'hold') socket.emit('campaign:hold');
  else if (ui === 'kick' && confirm(t('kickConfirm', { name: el.dataset.name }))) socket.emit('room:kick', { playerId: el.dataset.kick });
  else if (ui === 'tipOk') {
    storage.set('bombe.tip.' + el.dataset.role, true);
    el.closest('.tip-card')?.remove();
  }
  else if (ui === 'campaignNew' && confirm(t('campaignNewConfirm'))) socket.emit('campaign:new');
  else if (ui === 'lang') {
    setLang(el.dataset.lang);
    if (state.screen === 'home') showHome();
    else if (state.screen === 'lobby') showLobby();
    if (state.result) showResult();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && settingsLayer.innerHTML) toggleSettings(false);
  else if (e.key === 'Escape' && manualLayer.innerHTML) closeManual();
});

bindLobby(screen, () => state.room, (ev, data) => socket.emit(ev, data));
bindSettings(settingsLayer);

// --- Sunucu olayları ---

socket.on('connect', () => {
  banner.classList.remove('on');
  if (state.screen === 'home') socket.emit('rooms:watch');
  rejoin();
});

socket.on('rooms:list', (list) => {
  state.publicRooms = list;
  renderPublicRooms();
});

socket.on('disconnect', () => {
  banner.textContent = t('disconnected');
  banner.classList.add('on');
});

socket.on('connect_error', () => {
  banner.textContent = t('connecting');
  banner.classList.add('on');
});

let warnedVersion = false;
function checkVersion(v) {
  if (!v || v === VERSION || warnedVersion) return;
  warnedVersion = true;
  const box = document.createElement('div');
  box.className = 'update-banner';
  box.innerHTML = `<span>🔄 ${t('newVersion')}</span><button class="btn btn-small btn-primary" data-ui="reload">${t('reload')}</button>`;
  document.body.appendChild(box);
}

socket.on('room:state', (room) => {
  checkVersion(room.version);
  state.room = room;
  route();
});

socket.on('room:kicked', () => {
  storage.remove('bombe.session', true);
  history.replaceState(null, '', '/');
  state.room = null;
  state.me = null;
  toast(t('kicked'), 'warn', 5000);
  route();
});

socket.on('room:replaced', () => {
  storage.remove('bombe.session', true);
  state.room = null;
  toast(t('replaced'), 'warn', 4000);
  route();
});

socket.on('game:init', (init) => mountGame(init));
socket.on('game:module', (m) => state.view?.updateModule?.(m));
socket.on('game:timer', (tp) => {
  timer.sync(tp);
  state.view?.onTimer?.(tp);
});
socket.on('game:strike', (s) => state.view?.onStrike?.(s));
socket.on('game:solved', (s) => state.view?.onSolved?.(s));
socket.on('game:needy', (n) => state.view?.onNeedy?.(n));
socket.on('game:event', (ev) => state.view?.onEvent?.(ev));
socket.on('game:paused', (p) => state.view?.onPaused?.(p));
socket.on('notes:update', (n) => state.view?.onNotes?.(n));
socket.on('game:manual', (m) => state.view?.onManual?.(m));
socket.on('game:end', (r) => {
  const first = !state.result;
  state.result = r;
  state.autoAt = r.autoNext && !r.autoNext.held ? performance.now() + (r.autoNext.inMs || 0) : 0;
  state.lastBeep = null;
  if (first) state.view?.onEnd?.(r);
  // İlk sonuçta patlama/kutlama animasyonu için kısa bekle; güncellemeler (ör. Durdur) hemen görünsün
  const delay = first && state.view ? (r.outcome === 'exploded' ? 1500 : 700) : 0;
  state.resultAt = Math.max(state.resultAt || 0, performance.now() + delay);
  setTimeout(() => state.result && state.room?.phase === 'result' && showResult(), Math.max(0, state.resultAt - performance.now()));
});

route();
