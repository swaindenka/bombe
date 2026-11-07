// İmhacı ekranı: bombanın ön/arka yüzü, kenarlar, sayaç, olay efektleri.

import { RENDERERS } from './modules/index.js';
import { t, bombText } from './i18n.js';
import { esc, formatTime, toast } from './dom.js';
import { sound } from './audio.js';
import { socket } from './net.js';
import { barControls, handleBarControl, countdownOverlay } from './ui.js';

const DESIGN_W = 730;
const DESIGN_H = 510;
const SLOTS_PER_FACE = 6;

export class DefuserView {
  constructor(root, init, { timer, isHost }) {
    this.root = root;
    this.init = init;
    this.timer = timer;
    this.isHost = isHost;
    this.lang = init.lang;
    this.mods = new Map(init.modules.map((m) => [m.id, { ...m, at: performance.now() }]));
    this.strikes = init.timer.strikes;
    this.maxStrikes = init.timer.maxStrikes;
    this.view = 'front';
    this.lastFace = 'front';
    this.mounts = new Map();
    this.lastSecond = null;
    this.timeouts = [];
    this.started = init.startsInMs <= 0;
    this.ended = !!init.ended;

    this.render();
    this.mountAll();
    this.bind();
    this.fit();
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    this.stopCountdown = countdownOverlay(this.$('#countdown'), init.startsInMs, () => {
      this.started = true;
      if (!this.ended) sound.startMusic();
    });
  }

  $(sel) {
    return this.root.querySelector(sel);
  }

  // --- HTML ---

  render() {
    this.root.innerHTML = `
      <div class="game game-defuser">
        <header class="game-bar">
          <div class="bar-left"><span class="role-badge r-defuser">💣 ${t('youAreDefuser')}</span><span class="bar-note">${t('noPeeking')}</span></div>
          <div class="bar-right">${barControls(this.isHost)}</div>
        </header>
        <main class="stage" id="stage">
          <div class="bomb-scaler" id="scaler" style="width:${DESIGN_W}px;height:${DESIGN_H}px">
            <div class="bomb-view show-front" id="bombView">
              <div class="bomb" id="bomb">
                <div class="face front">${this.faceHTML(0)}</div>
                <div class="face back">${this.faceHTML(1)}</div>
              </div>
              <div class="edges" id="edges">${this.edgesHTML()}</div>
            </div>
          </div>
        </main>
        <footer class="controls">
          <button class="btn" data-ctl="flip">⟲ ${t('flip')}</button>
          <span class="face-label" id="faceLabel">${t('front')}</span>
          <button class="btn" data-ctl="edges">▣ ${t('edges')}</button>
          <span class="hint">${t('keysHint')}</span>
        </footer>
        <div class="fx-flash" id="fxFlash"></div>
        <div class="fx-blackout" id="fxBlackout"><span>${t('flashlightHint')}</span></div>
        <div class="fx-alarm" id="fxAlarm"><button class="btn btn-danger" data-ctl="snooze">🔔 ${t('snooze')}</button></div>
        <div class="countdown" id="countdown"></div>
      </div>`;
  }

  faceHTML(face) {
    let html = '';
    for (let s = face * SLOTS_PER_FACE; s < (face + 1) * SLOTS_PER_FACE; s++) {
      if (s === this.init.timerSlot) {
        html += this.timerHTML();
        continue;
      }
      const m = [...this.mods.values()].find((x) => x.slot === s);
      html += m ? this.moduleHTML(m) : `<div class="module empty">${screws()}<div class="vent"></div></div>`;
    }
    return html;
  }

  moduleHTML(m) {
    const r = RENDERERS[m.type];
    return `
      <div class="module m-${m.type} ${m.needy ? 'needy' : ''} ${m.solved ? 'solved' : ''} ${m.needy && m.view.active ? 'needy-on' : ''}" data-id="${m.id}">
        ${screws()}
        <span class="mod-led"></span>
        ${m.needy ? `<span class="needy-timer lcd" data-needy="${m.id}">--</span>` : ''}
        <div class="mod-body">${r.render(m.view, { lang: this.lang, id: m.id })}</div>
      </div>`;
  }

  timerHTML() {
    return `
      <div class="module timer-mod">
        ${screws()}
        <div class="tm-strikes" id="tmStrikes">${this.strikesHTML()}</div>
        <div class="tm-face lcd"><span class="tm-ghost">88:88</span><span class="tm-digits" id="tmDigits">${formatTime(this.timer.value())}</span></div>
        <div class="tm-wires"><i></i><i></i><i></i></div>
      </div>`;
  }

  strikesHTML() {
    let s = '';
    for (let i = 0; i < this.maxStrikes; i++) s += `<span class="${i < this.strikes ? 'hit' : ''}">✕</span>`;
    return s;
  }

  edgesHTML() {
    const e = this.init.edgework;
    const sides = [
      ['top', t('edgeTop')],
      ['right', t('edgeRight')],
      ['bottom', t('edgeBottom')],
      ['left', t('edgeLeft')],
    ];
    const item = (it) => {
      switch (it.kind) {
        case 'serial':
          return `<div class="ed-serial"><small>${bombText(this.lang, 'serial')}</small><b>${esc(it.value)}</b></div>`;
        case 'battery':
          return `<div class="ed-battery">${'<i></i>'.repeat(it.cells)}</div>`;
        case 'indicator':
          return `<div class="ed-ind ${it.lit ? 'lit' : ''}"><i></i><span>${esc(it.code)}</span></div>`;
        case 'ports':
          return `<div class="ed-ports">${it.ports.map((p) => `<div class="port p-${p.toLowerCase()}"><i></i><span>${p}</span></div>`).join('')}</div>`;
        default:
          return '';
      }
    };
    return sides
      .map(
        ([s, label]) =>
          `<div class="edge"><div class="edge-label">${label}</div><div class="edge-strip">${e.layout[s].map(item).join('') || '<span class="edge-empty">—</span>'}</div></div>`
      )
      .join('');
  }

  // --- Davranış ---

  mountAll() {
    for (const m of this.mods.values()) this.mountModule(m);
  }

  mountModule(m) {
    this.mounts.get(m.id)?.();
    this.mounts.delete(m.id);
    const r = RENDERERS[m.type];
    if (!r.mount) return;
    const body = this.$(`.module[data-id="${m.id}"] .mod-body`);
    if (body) this.mounts.set(m.id, r.mount(body, m.view));
  }

  bind() {
    this.onClick = (e) => {
      const ctlBtn = e.target.closest('[data-ctl]');
      if (ctlBtn) {
        const ctl = ctlBtn.dataset.ctl;
        if (handleBarControl(ctl, ctlBtn)) return;
        if (ctl === 'flip') this.flip();
        else if (ctl === 'edges') this.toggleEdges();
        else if (ctl === 'snooze') this.snooze();
        return;
      }
      const actEl = e.target.closest('[data-act]');
      if (!actEl || this.ended || !this.started) return;
      const modEl = actEl.closest('.module[data-id]');
      if (!modEl || modEl.classList.contains('solved')) return;
      if (this.view === 'edges') return;
      let action;
      try {
        action = JSON.parse(actEl.dataset.act);
      } catch {
        return;
      }
      sound.click();
      socket.emit('game:action', { moduleId: modEl.dataset.id, action, t: this.timer.value() });
    };
    this.onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.flip();
      } else if (e.key === 'e' || e.key === 'E') {
        this.toggleEdges();
      }
    };
    this.onResize = () => this.fit();
    this.onMove = (e) => {
      const fx = this.$('#fxBlackout');
      if (!fx) return;
      fx.style.setProperty('--mx', `${e.clientX}px`);
      fx.style.setProperty('--my', `${e.clientY}px`);
    };
    this.root.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onMove);
  }

  fit() {
    const stage = this.$('#stage');
    const scaler = this.$('#scaler');
    if (!stage || !scaler) return;
    const w = stage.clientWidth - 16;
    const h = stage.clientHeight - 16;
    const s = Math.max(0.3, Math.min(w / DESIGN_W, h / DESIGN_H, 1.7));
    scaler.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  setView(v) {
    this.view = v;
    if (v !== 'edges') this.lastFace = v;
    this.$('#bombView').className = `bomb-view show-${v}`;
    this.$('#faceLabel').textContent = v === 'front' ? t('front') : v === 'back' ? t('back') : t('edges');
  }

  flip() {
    if (this.view === 'edges') this.setView(this.lastFace);
    else this.setView(this.view === 'front' ? 'back' : 'front');
  }

  toggleEdges() {
    this.setView(this.view === 'edges' ? this.lastFace : 'edges');
  }

  frame() {
    const rem = this.timer.value();
    const digits = this.$('#tmDigits');
    if (digits) {
      const txt = formatTime(rem);
      if (digits.textContent !== txt) digits.textContent = txt;
      digits.parentElement.classList.toggle('low', rem < 60000);
    }
    const sec = Math.floor(rem / 1000);
    if (this.started && !this.ended && this.timer.rate > 0 && sec !== this.lastSecond && this.lastSecond !== null) {
      sound.tick(rem < 30000);
    }
    this.lastSecond = sec;
    sound.setIntensity(1 - rem / 150000);

    const now = performance.now();
    for (const m of this.mods.values()) {
      if (!m.needy) continue;
      const el = this.root.querySelector(`[data-needy="${m.id}"]`);
      if (!el) continue;
      if (m.view.active && m.needyRemainingMs !== null && !this.ended) {
        const r = Math.max(0, m.needyRemainingMs - (now - m.at));
        el.textContent = String(Math.ceil(r / 1000)).padStart(2, '0');
        el.classList.toggle('warn', r < 10000);
      } else {
        el.textContent = '--';
        el.classList.remove('warn');
      }
    }
    this.raf = requestAnimationFrame(this.frame);
  }

  // --- Sunucu olayları ---

  updateModule(mv) {
    const prev = this.mods.get(mv.id);
    const m = { ...mv, at: performance.now() };
    this.mods.set(mv.id, m);
    const el = this.$(`.module[data-id="${mv.id}"]`);
    if (!el) return;
    el.classList.toggle('solved', mv.solved);
    if (mv.needy) {
      if (mv.view.active && !prev?.view.active) {
        sound.needy();
        el.classList.add('needy-alert');
        this.later(() => el.classList.remove('needy-alert'), 1200);
      }
      el.classList.toggle('needy-on', !!mv.view.active);
    }
    const body = el.querySelector('.mod-body');
    const r = RENDERERS[mv.type];
    if (r.update && prev && r.update(body, mv.view, prev.view)) return;
    body.innerHTML = r.render(mv.view, { lang: this.lang, id: mv.id });
    this.mountModule(m);
  }

  onTimer(tp) {
    if (tp.strikes !== this.strikes) {
      this.strikes = tp.strikes;
      const s = this.$('#tmStrikes');
      if (s) s.innerHTML = this.strikesHTML();
    }
  }

  onStrike(s) {
    this.strikes = s.strikes;
    const box = this.$('#tmStrikes');
    if (box) box.innerHTML = this.strikesHTML();
    sound.strike();
    if (s.moduleId) {
      const el = this.$(`.module[data-id="${s.moduleId}"]`);
      if (el) {
        el.classList.remove('flash-strike');
        void el.offsetWidth;
        el.classList.add('flash-strike');
        this.later(() => el.classList.remove('flash-strike'), 900);
      }
    }
    this.pulse('#fxFlash', 'on', 450);
    this.pulse('#stage', 'jolt', 400);
  }

  onSolved() {
    sound.solve();
  }

  onEvent(ev) {
    toast('⚡ ' + t('ev_' + ev.type), 'warn');
    if (ev.type === 'blackout') this.pulse('#fxBlackout', 'on', ev.duration);
    else if (ev.type === 'shake') this.pulse('#stage', 'quake', ev.duration);
    else if (ev.type === 'alarm') {
      this.pulse('#fxAlarm', 'on', ev.duration);
      sound.alarm(ev.duration);
    }
  }

  snooze() {
    this.$('#fxAlarm')?.classList.remove('on');
    sound.stopAlarm();
  }

  onEnd(result) {
    this.ended = true;
    this.snooze();
    this.$('#fxBlackout')?.classList.remove('on');
    sound.stopMusic();
    if (result.outcome === 'exploded') {
      sound.explode();
      this.$('.game')?.classList.add('boom');
    } else if (result.outcome === 'defused') sound.win();
  }

  pulse(sel, cls, ms) {
    const el = this.$(sel);
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    this.later(() => el.classList.remove(cls), ms);
  }

  later(fn, ms) {
    this.timeouts.push(setTimeout(fn, ms));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.stopCountdown?.();
    this.timeouts.forEach(clearTimeout);
    this.mounts.forEach((fn) => fn?.());
    this.root.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onMove);
    sound.stopAlarm();
    sound.stopMusic();
  }
}

function screws() {
  return '<i class="screw s1"></i><i class="screw s2"></i><i class="screw s3"></i><i class="screw s4"></i>';
}
