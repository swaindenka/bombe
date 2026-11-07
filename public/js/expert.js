// Uzman ekranı: kılavuz + küçük durum göstergesi (hatalar, çözülen modüller, isteğe bağlı sayaç).

import { t } from './i18n.js';
import { esc, formatTime, toast } from './dom.js';
import { sound } from './audio.js';
import { manualHTML, bindManual } from './manual.js';
import { barControls, handleBarControl, countdownOverlay } from './ui.js';

export class ExpertView {
  constructor(root, init, { timer, isHost }) {
    this.root = root;
    this.init = init;
    this.timer = timer;
    this.isHost = isHost;
    this.showTimer = !!init.expertsSeeTimer;
    this.strikes = init.timer.strikes;
    this.maxStrikes = init.timer.maxStrikes;
    this.solved = init.timer.solved;
    this.total = init.timer.total;
    this.timeouts = [];
    this.ended = !!init.ended;
    this.render();
    bindManual(this.root);
    this.onClick = (e) => {
      const b = e.target.closest('[data-ctl]');
      if (b) handleBarControl(b.dataset.ctl, b);
    };
    this.root.addEventListener('click', this.onClick);
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    this.stopCountdown = countdownOverlay(this.root.querySelector('#countdown'), init.startsInMs, () => {
      if (!this.ended) sound.startMusic();
    });
  }

  render() {
    this.root.innerHTML = `
      <div class="game game-expert">
        <header class="game-bar">
          <div class="bar-left"><span class="role-badge r-expert">📖 ${t('youAreExpert')}</span><span class="bar-note">${esc(t('defuserIs', { name: this.init.defuserName }))}</span></div>
          <div class="bar-mid">
            <span class="hud hud-strikes" id="hudStrikes" title="${t('strikesLabel')}"></span>
            <span class="hud hud-solved" id="hudSolved"></span>
            <span class="hud hud-timer lcd ${this.showTimer ? '' : 'hidden-timer'}" id="hudTimer" title="${this.showTimer ? '' : t('timerHidden')}">${this.showTimer ? '' : '⏱ ??:??'}</span>
          </div>
          <div class="bar-right">${barControls(this.isHost)}</div>
        </header>
        <div class="manual-wrap" id="manualWrap">${manualHTML({ contentLang: this.init.lang, manual: this.init.manual })}</div>
        <div class="fx-flash" id="fxFlash"></div>
        <div class="countdown" id="countdown"></div>
      </div>`;
    this.updateHud();
  }

  updateHud() {
    const s = this.root.querySelector('#hudStrikes');
    if (s) {
      let html = `<small>${t('strikesLabel')}</small>`;
      for (let i = 0; i < this.maxStrikes; i++) html += `<b class="${i < this.strikes ? 'hit' : ''}">✕</b>`;
      s.innerHTML = html;
    }
    const v = this.root.querySelector('#hudSolved');
    if (v) v.textContent = t('solvedCount', { n: this.solved, total: this.total });
  }

  frame() {
    if (this.showTimer) {
      const el = this.root.querySelector('#hudTimer');
      const rem = this.timer.value();
      if (el) {
        el.textContent = formatTime(rem);
        el.classList.toggle('low', rem < 60000);
      }
      sound.setIntensity(1 - rem / 150000);
    }
    this.raf = requestAnimationFrame(this.frame);
  }

  onTimer(tp) {
    this.strikes = tp.strikes;
    this.solved = tp.solved;
    this.total = tp.total;
    this.updateHud();
  }

  onStrike(s) {
    this.strikes = s.strikes;
    this.updateHud();
    sound.strike();
    toast('✕ ' + t('strikeToast'), 'danger', 1500);
    this.pulse('#fxFlash', 'on', 450);
  }

  onSolved(s) {
    this.solved = s.solved;
    this.total = s.total;
    this.updateHud();
    sound.solve();
  }

  onEvent(ev) {
    toast('⚡ ' + t('ev_' + ev.type), 'warn');
    if (ev.type === 'glitch') this.pulse('#manualWrap', 'glitch', ev.duration);
  }

  onEnd(result) {
    this.ended = true;
    sound.stopMusic();
    if (result.outcome === 'exploded') sound.explode();
    else if (result.outcome === 'defused') sound.win();
  }

  pulse(sel, cls, ms) {
    const el = this.root.querySelector(sel);
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    this.timeouts.push(setTimeout(() => el.classList.remove(cls), ms));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.stopCountdown?.();
    this.timeouts.forEach(clearTimeout);
    this.root.removeEventListener('click', this.onClick);
    sound.stopMusic();
  }
}
