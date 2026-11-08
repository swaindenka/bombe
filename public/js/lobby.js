// Lobi: oyuncular, roller, ayarlar, seviyeler ve skor tablosu.

import { t, getLang, moduleName } from './i18n.js';
import { esc, formatDuration } from './dom.js';
import { LEVELS, FREE_LIMITS } from '/shared/levels.js';
import { REGULAR_TYPES, NEEDY_TYPES } from '/shared/modules/index.js';
import { VERSION } from '/shared/version.js';
import { opName, livesHTML, pipsHTML, briefHTML } from './campaign-ui.js';

function campaignLobbyHTML(room, isHost) {
  const run = room.campaign?.run;
  const best = room.campaign?.best;
  const active = run && !run.over;
  const status = active
    ? `<div class="camp-status">
        <div class="camp-name">🎯 ${opName(run.seed)}</div>
        <div class="camp-line">${t('campaignStage')} <b>${run.stage}/${run.total}</b> · ${livesHTML(run.lives, run.maxLives)} · <b>${run.score}</b> ${t('points')}</div>
        ${pipsHTML(run)}
        <div class="field-label">${t('nextStage')}</div>
        ${briefHTML(run.next)}
        ${isHost ? `<button class="btn btn-small btn-ghost" data-ui="campaignNew">↺ ${t('campaignNew')}</button>` : ''}
      </div>`
    : `<p>${t('campaignNoRun')}</p>`;
  return `
    <div class="campaign-box">
      <b>🎯 ${t('modeCampaign')}</b>
      <p class="small">${t('campaignHint')}</p>
      <ul class="camp-rules"><li>✅ ${t('campaignRule1')}</li><li>💥 ${t('campaignRule2')}</li><li>🏆 ${t('campaignRule3')}</li></ul>
      ${status}
      ${best?.stage ? `<p class="small muted">🏅 ${t('campaignBestLine', { n: best.stage, score: best.score })}</p>` : ''}
    </div>`;
}

const hue = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export function lobbyHTML(room, me) {
  const L = getLang();
  const isHost = room.hostId === me;
  const s = room.settings;
  const dis = isHost ? '' : 'disabled';
  const connected = room.players.filter((p) => p.connected).length;

  const players = room.players
    .map((p) => {
      const isDef = p.id === room.defuserId;
      return `
        <li class="player ${p.connected ? '' : 'offline'} ${p.id === me ? 'me' : ''}">
          <span class="avatar" style="--h:${hue(p.name)}">${esc(p.name.charAt(0).toLocaleUpperCase('tr'))}</span>
          <span class="pname">${esc(p.name)}${p.id === me ? ` <small>(${t('you')})</small>` : ''}</span>
          <span class="badges">
            ${p.id === room.hostId ? `<span class="badge b-host">★ ${t('host')}</span>` : ''}
            ${isDef ? `<span class="badge b-defuser">💣 ${t('defuser')}</span>` : `<span class="badge b-expert">📖 ${t('expert')}</span>`}
            ${p.connected ? '' : `<span class="badge b-off">${t('offline')}</span>`}
          </span>
          ${
            isHost
              ? `<span class="player-actions">${
                  !isDef && p.connected
                    ? `<button class="icon-btn" data-defuser="${p.id}" title="${t('makeDefuser')}" aria-label="${t('makeDefuser')}">💣</button>`
                    : ''
                }${p.id !== me ? `<button class="icon-btn kick" data-ui="kick" data-kick="${p.id}" data-name="${esc(p.name)}" title="${t('kick')}" aria-label="${t('kick')}">✕</button>` : ''}</span>`
              : ''
          }
        </li>`;
    })
    .join('');

  const best = (id) => room.records?.[id]?.[0];
  const done = new Set(room.completed || []);
  const levels = LEVELS.map((lv, i) => {
    const b = best(lv.id);
    const intro = lv.introduces.map((ty) => `<span class="new-chip">${esc(moduleName(ty))}</span>`).join('');
    return `
      <button class="level ${s.levelId === lv.id ? 'sel' : ''} ${done.has(lv.id) ? 'done' : ''}" data-level="${lv.id}" ${dis}>
        <span class="lv-no">${done.has(lv.id) ? '✓' : i + 1}</span>
        <span class="lv-name">${esc(lv.name[L])}</span>
        <span class="lv-meta">${lv.regular} ${t('modules')} · ${formatDuration(lv.time * 1000)} · ✕${lv.strikes}${lv.needy ? ` · ⏱${lv.needy}` : ''}${lv.events ? ' · ⚡' : ''}</span>
        ${intro ? `<span class="lv-new"><b>${t('newModules')}</b> ${intro}</span>` : ''}
        <span class="lv-best">${b ? `🏆 ${formatDuration(b.timeMs)}` : '&nbsp;'}</span>
      </button>`;
  }).join('');

  const f = s.free;
  const range = (key, label, value, display, [min, max], step = 1) => `
    <label class="range">
      <span class="range-head"><span>${label}</span><b data-out="${key}">${display}</b></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-free="${key}" ${dis}>
    </label>`;
  const check = (attr, key, label, checked) =>
    `<label class="chip ${checked ? 'on' : ''}"><input type="checkbox" ${attr}="${key}" ${checked ? 'checked' : ''} ${dis}><span>${label}</span></label>`;

  const free = `
    <div class="free-grid">
      ${range('time', t('time'), f.time, formatDuration(f.time * 1000), FREE_LIMITS.time, 30)}
      ${range('regular', t('modulesCap'), f.regular, f.regular, FREE_LIMITS.regular)}
      ${range('needy', t('needy'), f.needy, f.needy, [0, Math.min(FREE_LIMITS.needy[1], 11 - f.regular)])}
      ${range('strikes', t('strikes'), f.strikes, f.strikes, FREE_LIMITS.strikes)}
    </div>
    <div class="field-label">${t('poolRegular')}</div>
    <div class="chips">${REGULAR_TYPES.map((ty) => check('data-pool', ty, esc(moduleName(ty)), f.pool.includes(ty))).join('')}</div>
    <div class="field-label">${t('poolNeedy')}</div>
    <div class="chips">${NEEDY_TYPES.map((ty) => check('data-needypool', ty, esc(moduleName(ty)), f.needyPool.includes(ty))).join('')}</div>
    <div class="field-label">⚡ ${t('events')}</div>
    <div class="chips">${check('data-freeflag', 'events', t('eventsOn'), f.events)}</div>`;

  const toggle = (key, label, hint) => `
    <label class="toggle">
      <input type="checkbox" data-opt="${key}" ${s[key] ? 'checked' : ''} ${dis}>
      <span class="toggle-ui"></span>
      <span class="toggle-text"><b>${label}</b><small>${hint}</small></span>
    </label>`;

  const selLevel = LEVELS.find((l) => l.id === s.levelId) || LEVELS[0];
  const recList = room.records?.[selLevel.id] || [];
  const records = recList.length
    ? `<ol class="records">${recList
        .map(
          (r) =>
            `<li><span class="rec-time">${formatDuration(r.timeMs)}</span><span class="rec-team">${esc(r.team.join(', '))}</span><span class="rec-meta">💣 ${esc(r.defuser)} · ✕${r.strikes}</span></li>`
        )
        .join('')}</ol>`
    : `<p class="muted small">${t('noRecords')}</p>`;

  const statsRows = room.players
    .map(
      (p) =>
        `<tr><td>${esc(p.name)}</td><td>${p.stats.wins}</td><td>${p.stats.losses}</td><td>${p.stats.bestMs !== null ? formatDuration(p.stats.bestMs) : '–'}</td></tr>`
    )
    .join('');

  const last = room.lastResult;
  const lastBanner = last
    ? `<div class="last-result ${last.outcome}">${t('lastResult')}: <b>${t(last.outcome)}</b> · 💣 ${esc(last.defuserName)} · ${formatDuration(last.timeUsedMs)}</div>`
    : '';

  return `
    <div class="lobby">
      <header class="topbar">
        <div class="brand">BOMBE</div>
        <div class="room-chip"><span>${t('room')}</span><b id="roomCode">${esc(room.code)}</b><button class="btn btn-small" data-ui="copy">🔗 ${t('copyLink')}</button><button class="vis-chip ${s.public ? 'pub' : ''}" data-vis="${s.public ? 0 : 1}" title="${esc((s.public ? t('publicRoomHint') : t('privateRoomHint')) + (isHost ? ' ' + t('visToggleHint') : ''))}" ${dis}>${s.public ? t('visPublic') : t('visPrivate')}</button></div>
        <div class="topbar-right">
          <button class="btn btn-small btn-ghost" data-ui="manual">📖 ${t('manual')}</button>
          <button class="icon-btn" data-ui="settings" title="${t('settingsTitle')}" aria-label="${t('settingsTitle')}">⚙</button>
          ${langSwitch()}
          <button class="btn btn-small btn-ghost" data-ui="leave">${t('leave')}</button>
        </div>
      </header>
      ${lastBanner}
      <div class="lobby-grid">
        <section class="card card-players">
          <h2>${t('players')} <small>${connected}/${room.players.length}</small></h2>
          <ul class="players">${players}</ul>
          ${connected < 2 ? `<p class="hint-box">👋 ${t('soloWarning')}</p>` : ''}
        </section>

        <section class="card card-settings">
          <h2>${t('settings')}</h2>
          ${isHost ? '' : `<p class="muted small">${t('onlyHost')}</p>`}
          <div class="tabs">
            <button class="tab ${s.mode === 'level' ? 'on' : ''}" data-mode="level" ${dis}>${t('modeLevels')}</button>
            <button class="tab ${s.mode === 'campaign' ? 'on' : ''}" data-mode="campaign" ${dis}>🎯 ${t('modeCampaign')}</button>
            <button class="tab ${s.mode === 'free' ? 'on' : ''}" data-mode="free" ${dis}>${t('modeFree')}</button>
          </div>
          ${s.mode === 'free' ? free : s.mode === 'campaign' ? campaignLobbyHTML(room, isHost) : `<div class="levels">${levels}</div>`}
          <div class="field-label">${t('options')}</div>
          <div class="toggles">
            ${toggle('splitManual', t('splitManual'), t('splitManualHint'))}
            ${toggle('rotateRoles', t('rotateRoles'), t('rotateRolesHint'))}
            ${toggle('expertsSeeTimer', t('expertsSeeTimer'), t('expertsSeeTimerHint'))}
            ${toggle('showModuleNames', t('showModuleNames'), t('showModuleNamesHint'))}
            ${toggle('public', '🌐 ' + t('publicRoom'), t('publicRoomHint'))}
            <label class="field room-title"><span>${t('roomTitle')}</span><input data-title maxlength="30" placeholder="${esc(t('roomTitlePlaceholder'))}" value="${esc(s.title || '')}" ${dis}></label>
          </div>
          <div class="bomb-lang">
            <span><b>${t('bombLang')}</b><small>${t('bombLangHint')}</small></span>
            <div class="seg">
              <button class="${s.contentLang === 'tr' ? 'on' : ''}" data-clang="tr" ${dis}>Türkçe</button>
              <button class="${s.contentLang === 'en' ? 'on' : ''}" data-clang="en" ${dis}>English</button>
            </div>
          </div>
        </section>

        <section class="card card-score">
          <h2>${t('scoreboard')}</h2>
          <div class="team-line">${t('team')}: <b>${room.team.wins}</b> ${t('wins').toLocaleLowerCase(L)} / ${room.team.games} ${t('games').toLocaleLowerCase(L)} · <b>${room.team.points || 0}</b> ${t('points')}</div>
          <table class="stats"><thead><tr><th>${t('roomStats')}</th><th>${t('wins')}</th><th>${t('losses')}</th><th>${t('fastest')}</th></tr></thead><tbody>${statsRows}</tbody></table>
          <h3>🏆 ${t('records')} · ${esc(selLevel.name[L])}</h3>
          ${records}
        </section>
      </div>
      <div class="start-bar">
        ${
          isHost
            ? `<button class="btn btn-primary btn-big" data-ui="start">${
                s.mode === 'campaign'
                  ? room.campaign?.run && !room.campaign.run.over
                    ? `▶ ${t('campaignContinue', { n: room.campaign.run.stage })}`
                    : `🎯 ${t('campaignStart')}`
                  : `💣 ${t('start')}`
              }</button>`
            : `<div class="waiting">${t('waitingHost')}</div>`
        }
      </div>
      <p class="version-tag">BOMBE v${VERSION}</p>
    </div>`;
}

export function langSwitch() {
  const L = getLang();
  return `<div class="seg seg-lang" title="${t('lang')}"><button class="${L === 'tr' ? 'on' : ''}" data-ui="lang" data-lang="tr">TR</button><button class="${L === 'en' ? 'on' : ''}" data-ui="lang" data-lang="en">EN</button></div>`;
}

/** Lobi etkileşimlerini bağlar; send(event, payload) sunucuya gönderir */
export function bindLobby(root, getRoom, send) {
  root.addEventListener('click', (e) => {
    const room = getRoom();
    if (!room) return;
    const el = e.target.closest('[data-defuser],[data-level],[data-mode],[data-clang],[data-vis]');
    if (!el || el.disabled) return;
    if (el.dataset.vis) send('room:settings', { public: el.dataset.vis === '1' });
    else if (el.dataset.defuser) send('room:defuser', { playerId: el.dataset.defuser });
    else if (el.dataset.level) send('room:settings', { levelId: el.dataset.level });
    else if (el.dataset.mode) send('room:settings', { mode: el.dataset.mode });
    else if (el.dataset.clang) send('room:settings', { contentLang: el.dataset.clang });
  });
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.dataset.free) return;
    const out = root.querySelector(`[data-out="${el.dataset.free}"]`);
    if (out) out.textContent = el.dataset.free === 'time' ? formatDuration(el.value * 1000) : el.value;
  });
  root.addEventListener('change', (e) => {
    const el = e.target;
    const room = getRoom();
    if (!room) return;
    const f = room.settings.free;
    if (el.dataset.title !== undefined) send('room:settings', { title: el.value });
    else if (el.dataset.free) send('room:settings', { free: { [el.dataset.free]: Number(el.value) } });
    else if (el.dataset.opt) send('room:settings', { [el.dataset.opt]: el.checked });
    else if (el.dataset.freeflag) send('room:settings', { free: { [el.dataset.freeflag]: el.checked } });
    else if (el.dataset.pool || el.dataset.needypool) {
      const key = el.dataset.pool ? 'pool' : 'needyPool';
      const type = el.dataset.pool || el.dataset.needypool;
      const set = new Set(f[key]);
      if (el.checked) set.add(type);
      else set.delete(type);
      if (key === 'pool' && !set.size) {
        el.checked = true;
        return;
      }
      send('room:settings', { free: { [key]: [...set] } });
    }
  });
}
