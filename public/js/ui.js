// Oyun ekranlarında ortak üst çubuk düğmeleri

import { t } from './i18n.js';
import { sound } from './audio.js';
import { socket } from './net.js';

export function barControls(isHost) {
  return `
    <button class="icon-btn" data-ctl="sound" title="${t('sound')}" aria-label="${t('sound')}">${sound.muted ? '🔇' : '🔊'}</button>
    <button class="icon-btn ${sound.musicOn ? '' : 'off'}" data-ctl="music" title="${t('music')}" aria-label="${t('music')}">🎵</button>
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
  if (ctl === 'abort') {
    if (confirm(t('abortConfirm'))) socket.emit('game:abort');
    return true;
  }
  return false;
}

export function countdownOverlay(el, ms, onDone) {
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
      el.innerHTML = `<div class="cd-label">${t('getReady')}</div><div class="cd-num">${n}</div>`;
      sound.countdown(false);
    }
    raf = requestAnimationFrame(step);
  };
  step();
  return () => cancelAnimationFrame(raf);
}
