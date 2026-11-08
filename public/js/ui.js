// Ortak arayüz parçaları: oyun çubuğu düğmeleri, ayarlar penceresi, geri sayım.

import { t } from './i18n.js';
import { sound } from './audio.js';
import { socket } from './net.js';
import { getPref, setPref } from './prefs.js';

import { LEVELS } from '/shared/levels.js';
import { getLang } from './i18n.js';
import { esc } from './dom.js';
import { opName, livesHTML, modifiersHTML } from './campaign-ui.js';
import { placeName } from '/shared/campaign.js';
import { MODIFIERS, DIFFICULTIES } from '/shared/campaign.js';

/** Üst çubukta hangi seviye / mod / kampanya bölümünde oynandığı */
export function levelChip(init) {
  const c = init.campaign;
  if (c) {
    const mods = (c.modifiers || []).map((id) => MODIFIERS[id].icon).join('');
    const diff = c.difficulty && c.difficulty !== 'normal' ? `${DIFFICULTIES[c.difficulty]?.icon || ''} ` : '';
    return `<span class="level-chip">🎯 ${diff}${t('campaignStage')} ${c.stage}/${c.total} · ${livesHTML(c.lives, c.maxLives)}${mods ? ` · ${mods}` : ''}</span>`;
  }
  if (!init.levelId) return init.mode === 'free' ? `<span class="level-chip">🎲 ${t('modeFree')}</span>` : '';
  const i = LEVELS.findIndex((l) => l.id === init.levelId);
  return `<span class="level-chip">🏁 ${t('levelShort')} ${i + 1}/${LEVELS.length} · ${esc(LEVELS[i]?.name[getLang()] || '')}</span>`;
}

/** Geri sayım ekranında bölüm brifingi */
export function campaignIntroHTML(init) {
  const c = init.campaign;
  if (!c) return '';
  return `<div class="cd-brief"><div class="cd-op">${opName(c.seed)}</div><div class="cd-stage">${t('campaignStage')} ${c.stage}/${c.total} · ${esc(placeName(c.place, getLang()))}</div><div class="cd-mods">${modifiersHTML(c.modifiers)}</div></div>`;
}

export function barControls(isHost, { paused = false } = {}) {
  return `
    <button class="icon-btn" data-ctl="sound" title="${t('sound')}" aria-label="${t('sound')}">${sound.muted ? '🔇' : '🔊'}</button>
    <button class="icon-btn ${sound.musicOn ? '' : 'off'}" data-ctl="music" title="${t('music')}" aria-label="${t('music')}">🎵</button>
    <button class="icon-btn" data-ui="settings" title="${t('settingsTitle')}" aria-label="${t('settingsTitle')}">⚙</button>
    ${isHost ? `<button class="btn btn-small" data-ctl="pause" data-paused="${paused ? 1 : 0}">${paused ? '▶ ' + t('resume') : '⏸ ' + t('pause')}</button>` : ''}
    ${isHost ? `<button class="btn btn-small btn-ghost" data-ctl="abort">${t('abort')}</button>` : ''}`;
}

/** true dönerse kontrol işlendi */
export function handleBarControl(ctl, btn) {
  if (ctl === 'sound') {
    sound.setMuted(!sound.muted);
    btn.textContent = sound.muted ? '🔇' : '🔊';
    return true;
  }
  if (ctl === 'music') {
    sound.setMusic(!sound.musicOn);
    btn.classList.toggle('off', !sound.musicOn);
    return true;
  }
  if (ctl === 'pause') {
    socket.emit('game:pause', { paused: btn.dataset.paused !== '1' });
    return true;
  }
  if (ctl === 'abort') {
    if (confirm(t('abortConfirm'))) socket.emit('game:abort');
    return true;
  }
  return false;
}

export function setPauseButton(root, paused) {
  const b = root.querySelector('[data-ctl=pause]');
  if (!b) return;
  b.dataset.paused = paused ? '1' : '0';
  b.textContent = paused ? '▶ ' + t('resume') : '⏸ ' + t('pause');
}

export function pauseOverlayHTML() {
  return `<div class="pause-overlay" id="pauseOverlay"><div class="pause-card"><div class="pause-icon">⏸</div><h2>${t('pausedTitle')}</h2><p>${t('pausedText')}</p></div></div>`;
}

// --- Ayarlar penceresi ---

export function settingsHTML() {
  const vol = (k, label) => `
    <label class="range">
      <span class="range-head"><span>${label}</span><b data-volout="${k}">${Math.round(sound.cfg[k] * 100)}</b></span>
      <input type="range" min="0" max="100" value="${Math.round(sound.cfg[k] * 100)}" data-vol="${k}">
    </label>`;
  const tog = (k, label, hint, checked) => `
    <label class="toggle">
      <input type="checkbox" data-pref="${k}" ${checked ? 'checked' : ''}>
      <span class="toggle-ui"></span>
      <span class="toggle-text"><b>${label}</b><small>${hint}</small></span>
    </label>`;
  return `
    <div class="settings-pop" role="dialog" aria-label="${t('settingsTitle')}">
      <div class="settings-head"><b>⚙ ${t('settingsTitle')}</b><button class="btn btn-small" data-ui="closeSettings">✕</button></div>
      <div class="field-label">${t('audio')}</div>
      ${vol('master', t('volMaster'))}
      ${vol('music', t('volMusic'))}
      ${vol('sfx', t('volSfx'))}
      <div class="toggles">
        ${tog('muted', t('muteAll'), t('muteAllHint'), sound.muted)}
        ${tog('musicOn', t('musicOn'), t('musicOnHint'), sound.musicOn)}
      </div>
      <div class="field-label">${t('accessibility')}</div>
      <div class="toggles">
        ${tog('colorblind', t('colorblind'), t('colorblindHint'), getPref('colorblind'))}
        ${tog('reduceFx', t('reduceFx'), t('reduceFxHint'), getPref('reduceFx'))}
      </div>
      <div class="field-label">${t('shortcuts')}</div>
      <ul class="keys">
        <li><kbd>Space</kbd> / <kbd>F</kbd> ${t('keyFlip')}</li>
        <li><kbd>E</kbd> ${t('keyEdges')}</li>
        <li><kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> ${t('keyArrows')}</li>
        <li><kbd>/</kbd> ${t('keySearch')}</li>
      </ul>
    </div>`;
}

export function bindSettings(layer) {
  layer.addEventListener('input', (e) => {
    const k = e.target.dataset.vol;
    if (!k) return;
    sound.setVolume(k, e.target.value / 100);
    const out = layer.querySelector(`[data-volout="${k}"]`);
    if (out) out.textContent = e.target.value;
  });
  layer.addEventListener('change', (e) => {
    const k = e.target.dataset.pref;
    if (!k) return;
    if (k === 'muted') sound.setMuted(e.target.checked);
    else if (k === 'musicOn') sound.setMusic(e.target.checked);
    else setPref(k, e.target.checked);
    if (k === 'colorblind') document.dispatchEvent(new CustomEvent('bombe:prefs'));
    sound.act('toggle');
  });
}

export function countdownOverlay(el, ms, onDone, extraHTML = '') {
  if (!el || ms <= 0) {
    onDone?.();
    return () => {};
  }
  const end = performance.now() + ms;
  el.classList.add('on');
  let last = null;
  let raf;
  const step = () => {
    const left = end - performance.now();
    if (left <= 0) {
      el.classList.remove('on');
      sound.countdown(true);
      onDone?.();
      return;
    }
    const n = Math.ceil(left / 1000);
    if (n !== last) {
      last = n;
      el.innerHTML = `${extraHTML}<div class="cd-label">${t('getReady')}</div><div class="cd-num">${n}</div>`;
      sound.countdown(false);
    }
    raf = requestAnimationFrame(step);
  };
  step();
  return () => cancelAnimationFrame(raf);
}
