// İmhacı ekranı: bombanın ön/arka yüzü, kenarlar, sayaç, olay efektleri.

import { RENDERERS as KNOWN } from './modules/index.js';
import { t, bombText, moduleName } from './i18n.js';
import { esc, formatTime, toast } from './dom.js';
import { sound } from './audio.js';
import { socket } from './net.js';
import { barControls, handleBarControl, countdownOverlay, pauseOverlayHTML, setPauseButton, levelChip } from './ui.js';
import { reportError } from './errors.js';

// Tanınmayan modül (eski önbellekli istemci) bütün ekranı çökertmesin
const UNKNOWN = { render: () => `<div class="mod-unknown">⟳<small>${t('reloadPage')}</small></div>` };
const RENDERERS = new Proxy(KNOWN, { get: (o, k) => o[k] || UNKNOWN });

/** Tek bir modülün çizim hatası bütün bombayı boş bırakmasın */
function safeRender(type, view, ctx) {
  try {
    return RENDERERS[type].render(view, ctx);
  } catch (err) {
    reportError(err, `render ${type}`);
    return `<div class="mod-unknown">⚠<small>${t('reloadPage')}</small></div>`;
  }
}

const DESIGN_W = 730;
const DESIGN_H = 510;
const SLOTS_PER_FACE = 6;

// Hareket türüne göre anlık ses
const ACT_SFX = { cut: 'snip', toggle: 'toggle', rotate: 'dial', tune: 'dial', move: 'step', connect: 'plug', unplug: 'plug', submit: 'heavy', enter: 'heavy', test: 'heavy', send: 'heavy', vent: 'heavy' };
const sfxFor = (action) => ACT_SFX[Object.keys(action)[0]] || 'press';

// Ok tuşlarıyla oynanabilen modüller
const KEY_DIR = { ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'W' };
const KEY_ACTIONS = {
  maze: (d) => ({ move: d }),
  arrows: (d) => ({ press: d }),
};

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
    this.paused = !!init.timer.paused;
    this.pausedAt = performance.now();
    this.hover = null;

    this.render();
    this.mountAll();
    this.bind();
    this.fit();
    sound.setStrikes(this.strikes);
    if (this.paused) this.onPaused({ paused: true }, true);
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    this.stopCountdown = countdownOverlay(this.$('#countdown'), init.startsInMs, () => {
      this.started = true;
      if (!this.ended && !this.paused) sound.startMusic();
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
          <div class="bar-left"><span class="role-badge r-defuser">💣 ${t('youAreDefuser')}</span>${levelChip(this.init)}<span class="bar-note">${t('noPeeking')}</span></div>
          <div class="bar-right">${barControls(this.isHost, { paused: this.paused })}</div>
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
          <div class="face-dots" aria-hidden="true"><i class="on" data-face="front"></i><i data-face="back"></i><i data-face="edges"></i></div>
          <span class="face-label" id="faceLabel">${t('front')}</span>
          <button class="btn" data-ctl="edges">▣ ${t('edges')}</button>
          <span class="hint">${t('keysHint')}</span>
        </footer>
        <div class="fx-flash" id="fxFlash"></div>
        <div class="fx-blackout" id="fxBlackout"><span>${t('flashlightHint')}</span></div>
        <div class="fx-alarm" id="fxAlarm"><button class="btn btn-danger" data-ctl="snooze">🔔 ${t('snooze')}</button></div>
        ${pauseOverlayHTML()}
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
    return `
      <div class="module m-${m.type} ${m.needy ? 'needy' : ''} ${m.solved ? 'solved' : ''} ${m.needy && m.view.active ? 'needy-on' : ''}" data-id="${m.id}">
        ${screws()}
        <span class="mod-led"></span>
        ${m.needy ? `<span class="needy-timer lcd" data-needy="${m.id}">--</span>` : ''}
        <div class="mod-body">${safeRender(m.type, m.view, { lang: this.lang, id: m.id })}</div>
        ${this.init.showModuleNames ? `<span class="mod-name">${esc(moduleName(m.type, this.lang))}</span>` : ''}
        <div class="solved-stamp" aria-hidden="true">✓</div>
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
    if (!body) return;
    try {
      this.mounts.set(m.id, r.mount(body, m.view));
    } catch (err) {
      reportError(err, `mount ${m.type}`);
    }
  }

  canAct() {
    return this.started && !this.ended && !this.paused && this.view !== 'edges';
  }

  send(moduleId, action) {
    socket.emit('game:action', { moduleId, action, t: this.timer.value() });
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
      const modEl = e.target.closest('.module[data-id]');
      if (!modEl || modEl.classList.contains('solved') || !this.canAct()) return;
      const id = modEl.dataset.id;
      const localEl = e.target.closest('[data-local]');
      if (localEl) {
        const r = RENDERERS[this.mods.get(id).type];
        const kind = r.local?.(modEl.querySelector('.mod-body'), localEl.dataset.local, (a) => this.send(id, a));
        if (kind) sound.act(kind);
        return;
      }
      const actEl = e.target.closest('[data-act]');
      if (!actEl || actEl.disabled) return;
      let action;
      try {
        action = JSON.parse(actEl.dataset.act);
      } catch {
        return;
      }
      sound.act(sfxFor(action));
      this.send(id, action);
    };
    this.onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.code === 'Space' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.flip();
      } else if (e.key === 'e' || e.key === 'E') {
        this.toggleEdges();
      } else if (KEY_DIR[e.key] && this.hover && this.canAct()) {
        const m = this.mods.get(this.hover.dataset.id);
        const make = m && !m.solved && KEY_ACTIONS[m.type];
        if (!make) return;
        e.preventDefault();
        const action = make(KEY_DIR[e.key]);
        sound.act(sfxFor(action));
        this.send(m.id, action);
      }
    };
    this.onOver = (e) => {
      this.hover = e.target.closest?.('.module[data-id]') || null;
    };
    this.onResize = () => this.fit();
    this.onMove = (e) => {
      const fx = this.$('#fxBlackout');
      if (!fx) return;
      fx.style.setProperty('--mx', `${e.clientX}px`);
      fx.style.setProperty('--my', `${e.clientY}px`);
    };
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('pointerover', this.onOver);
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
    if (v !== this.view) sound.act(v === 'edges' || this.view === 'edges' ? 'toggle' : 'heavy');
    this.view = v;
    if (v !== 'edges') this.lastFace = v;
    this.$('#bombView').className = `bomb-view show-${v}`;
    this.$('#faceLabel').textContent = v === 'front' ? t('front') : v === 'back' ? t('back') : t('edges');
    this.root.querySelectorAll('.face-dots i').forEach((d) => d.classList.toggle('on', d.dataset.face === v));
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
      digits.parentElement.classList.toggle('critical', rem < 10000);
    }
    const sec = Math.floor(rem / 1000);
    if (this.started && !this.ended && this.timer.rate > 0 && sec !== this.lastSecond && this.lastSecond !== null) {
      if (rem < 10000) sound.finalBeep();
      else sound.tick(sec % 2, rem < 30000);
    }
    this.lastSecond = sec;
    sound.setIntensity(1 - rem / 150000);

    const now = this.paused ? this.pausedAt : performance.now();
    for (const m of this.mods.values()) {
      if (!m.needy) continue;
      const el = this.root.querySelector(`[data-needy="${m.id}"]`);
      if (!el) continue;
      let r = null;
      if (m.view.active && m.needyRemainingMs !== null && !this.ended) {
        r = Math.max(0, m.needyRemainingMs - (now - m.at));
        const s = Math.ceil(r / 1000);
        el.textContent = String(s).padStart(2, '0');
        el.classList.toggle('warn', r < 10000);
        if (r < 10000 && s !== m.lastWarn && !this.paused) {
          m.lastWarn = s;
          sound.needyWarn();
        }
      } else {
        el.textContent = '--';
        el.classList.remove('warn');
      }
      const fr = RENDERERS[m.type].frame;
      if (fr) fr(el.parentElement.querySelector('.mod-body'), m.view, r);
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
    if (mv.view.stage && prev?.view.stage && mv.view.stage > prev.view.stage) sound.stage();
    const body = el.querySelector('.mod-body');
    const r = RENDERERS[mv.type];
    if (r.update && prev && r.update(body, mv.view, prev.view)) return;
    body.innerHTML = safeRender(mv.type, mv.view, { lang: this.lang, id: mv.id });
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
    sound.setStrikes(s.strikes);
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

  onSolved(s) {
    sound.solve();
    const el = s && this.$(`.module[data-id="${s.moduleId}"]`);
    if (el) {
      el.classList.add('just-solved');
      this.later(() => el.classList.remove('just-solved'), 900);
    }
  }

  onPaused({ paused }, silent = false) {
    this.paused = paused;
    if (paused) this.pausedAt = performance.now();
    this.$('#pauseOverlay')?.classList.toggle('on', paused);
    setPauseButton(this.root, paused);
    if (silent) return;
    sound.pause(paused);
    if (paused) {
      sound.stopMusic();
      this.snooze();
    } else if (this.started && !this.ended) sound.startMusic();
  }

  onEvent(ev) {
    toast('⚡ ' + t('ev_' + ev.type), 'warn');
    if (ev.type === 'blackout') {
      sound.blackout();
      this.pulse('#fxBlackout', 'on', ev.duration);
    } else if (ev.type === 'shake') {
      sound.rumble(ev.duration);
      this.pulse('#stage', 'quake', ev.duration);
    } else if (ev.type === 'alarm') {
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
    this.$('#pauseOverlay')?.classList.remove('on');
    if (result.outcome === 'exploded') {
      sound.stopMusic(true);
      sound.explode();
      this.$('.game')?.classList.add('boom');
    } else {
      sound.stopMusic();
      if (result.outcome === 'defused') sound.win();
    }
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
    this.root.removeEventListener('pointerover', this.onOver);
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
