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

const app = document.getElementById('app');
app.innerHTML = `<div id="banner" class="banner"></div><div id="screen" class="screen"></div><div id="resultLayer"></div><div id="manualLayer"></div>`;
const screen = document.getElementById('screen');
const resultLayer = document.getElementById('resultLayer');
const manualLayer = document.getElementById('manualLayer');
const banner = document.getElementById('banner');

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
  const name = storage.get('bombe.name', '');
  screen.innerHTML = `
    <div class="home">
      <div class="home-top">${langSwitch()}</div>
      <div class="hero">
        <div class="logo"><span class="logo-bomb">●</span>BOMBE</div>
        <p class="tagline">${t('tagline')}</p>
      </div>
      <form class="card home-card" id="homeForm" autocomplete="off">
        <label class="field"><span>${t('yourName')}</span><input id="nameInput" maxlength="20" placeholder="${esc(t('namePlaceholder'))}" value="${esc(name)}"></label>
        <button type="button" class="btn btn-primary btn-big" data-ui="create">💣 ${t('createRoom')}</button>
        <div class="or"><span>${t('or')}</span></div>
        <div class="join-row">
          <input id="codeInput" maxlength="4" placeholder="${esc(t('roomCode'))}" value="${esc(urlCode())}" aria-label="${esc(t('roomCode'))}">
          <button type="submit" class="btn" data-ui="join">${t('joinRoom')}</button>
        </div>
      </form>
      <section class="how">
        <h2>${t('howTitle')}</h2>
        <ol>
          <li><span>💣</span><p>${t('how1')}</p></li>
          <li><span>📖</span><p>${t('how2')}</p></li>
          <li><span>🎧</span><p>${t('how3')}</p></li>
        </ol>
        <button class="btn btn-ghost" data-ui="manual">📖 ${t('readManual')}</button>
      </section>
    </div>`;
  const code = document.getElementById('codeInput');
  code.addEventListener('input', () => (code.value = code.value.toUpperCase().replace(/[^A-Z]/g, '')));
  document.getElementById('homeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    joinRoom();
  });
}

function showLobby() {
  state.screen = 'lobby';
  const scroll = screen.querySelector('.lobby')?.scrollTop ?? 0;
  const winScroll = window.scrollY;
  screen.innerHTML = lobbyHTML(state.room, state.me);
  const l = screen.querySelector('.lobby');
  if (l) l.scrollTop = scroll;
  window.scrollTo(0, winScroll);
}

function showLoading() {
  state.screen = 'loading';
  screen.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

function showResult() {
  if (!state.result) {
    resultLayer.innerHTML = '';
    return;
  }
  resultLayer.innerHTML = resultHTML(state.result, state.room, state.me);
}

function hideResult() {
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
}

function closeManual() {
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

function mountGame(init) {
  destroyGame();
  hideResult();
  closeManual();
  state.init = init;
  state.result = null;
  state.screen = 'game';
  timer.sync(init.timer);
  screen.innerHTML = '';
  const opts = { timer, isHost: state.room?.hostId === state.me };
  state.view = init.role === 'defuser' ? new DefuserView(screen, init, opts) : new ExpertView(screen, init, opts);
}

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
  state.me = res.playerId;
  storage.set('bombe.session', { code: res.code, token: res.token }, true);
  history.replaceState(null, '', `?room=${res.code}`);
}

async function createRoom() {
  const name = readName();
  if (!name) return;
  const res = await request('room:create', { name, lang: getLang() });
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

document.addEventListener('pointerdown', () => sound.unlock(), { capture: true });

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-ui]');
  if (!el || el.disabled) return;
  const ui = el.dataset.ui;
  if (ui === 'create') createRoom();
  else if (ui === 'join' && el.type !== 'submit') joinRoom();
  else if (ui === 'copy') copyLink();
  else if (ui === 'leave') leaveRoom();
  else if (ui === 'manual') openManual();
  else if (ui === 'closeManual') closeManual();
  else if (ui === 'start' || ui === 'again') socket.emit('game:start');
  else if (ui === 'lobby') socket.emit('game:lobby');
  else if (ui === 'lang') {
    setLang(el.dataset.lang);
    if (state.screen === 'home') showHome();
    else if (state.screen === 'lobby') showLobby();
    if (state.result) showResult();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && manualLayer.innerHTML) closeManual();
});

bindLobby(screen, () => state.room, (ev, data) => socket.emit(ev, data));
bindManual(manualLayer);

// --- Sunucu olayları ---

socket.on('connect', () => {
  banner.classList.remove('on');
  rejoin();
});

socket.on('disconnect', () => {
  banner.textContent = t('disconnected');
  banner.classList.add('on');
});

socket.on('connect_error', () => {
  banner.textContent = t('connecting');
  banner.classList.add('on');
});

socket.on('room:state', (room) => {
  state.room = room;
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
socket.on('game:event', (ev) => state.view?.onEvent?.(ev));
socket.on('game:end', (r) => {
  const first = !state.result;
  state.result = r;
  if (first) state.view?.onEnd?.(r);
  const delay = state.view ? (r.outcome === 'exploded' ? 1500 : 700) : 0;
  state.resultAt = performance.now() + delay;
  setTimeout(() => state.result && state.room?.phase === 'result' && showResult(), delay);
});

route();
