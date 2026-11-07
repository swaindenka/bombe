import { t, moduleName, getLang } from './i18n.js';
import { esc, formatDuration } from './dom.js';
import { opName, livesHTML, pipsHTML, briefHTML } from './campaign-ui.js';

/** Kampanya: canlar, bölüm şeridi, sonraki bölüm brifingi ve geri sayım */
function campaignHTML(r, isHost) {
  const c = r.campaign;
  if (!c) return '';
  const head = `<div class="camp-name">🎯 ${opName(c.seed)} · ${t('campaignStage')} ${c.played}/${c.total}</div>
    <div class="camp-line">${livesHTML(c.lives, c.maxLives)} · ${t('campaignScore')}: <b>${c.score}</b></div>${pipsHTML(c)}`;
  if (c.over) {
    const reached = c.won ? c.total : Math.max(0, c.stage - 1);
    return `<div class="auto-next ${c.won ? 'done' : 'over'}">${head}
      <b class="camp-final">${c.won ? `🏆 ${t('campaignWon')}` : `💀 ${t('campaignOver')}`}</b>
      <span>${t('campaignReached', { n: reached })}</span>
      ${isHost ? `<div class="auto-actions"><button class="btn btn-primary" data-ui="again">🎯 ${t('campaignNew')}</button></div>` : ''}
    </div>`;
  }
  const a = r.autoNext;
  const timer = !a
    ? ''
    : a.held
      ? `<span class="muted">${t('autoHeld')}</span>`
      : `<span>${t('startsIn')} <b data-autocount>${Math.ceil((a.inMs || 0) / 1000)}</b> ${t('seconds')}</span>`;
  const buttons = isHost && a ? `<button class="btn btn-primary" data-ui="again">▶ ${t('startNow')}</button>${a.held ? '' : `<button class="btn" data-ui="hold">⏸ ${t('holdAuto')}</button>`}` : '';
  return `<div class="auto-next ${a?.retry ? 'retry' : ''}">${head}
    <b>${a?.retry ? `🔁 ${t('retryStage')}` : `⏭ ${t('nextStage')}`}</b>
    ${briefHTML(c.next)}
    ${timer}
    <div class="auto-actions">${buttons}</div>
  </div>`;
}

function reportHTML(r) {
  const mods = (r.modules || []).filter((m) => !m.needy);
  const needy = (r.modules || []).filter((m) => m.needy);
  if (!mods.length) return '';
  const rows = mods
    .slice()
    .sort((a, b) => (a.solvedAtMs ?? Infinity) - (b.solvedAtMs ?? Infinity))
    .map(
      (m) => `
      <li class="${m.solvedAtMs !== null ? 'ok' : 'no'}">
        <span class="rp-name">${m.solvedAtMs !== null ? '✓' : '✕'} ${esc(moduleName(m.type))}</span>
        <span class="rp-strikes">${m.strikes ? '✕'.repeat(Math.min(m.strikes, 5)) : ''}</span>
        <span class="rp-time">${m.solvedAtMs !== null ? formatDuration(m.solvedAtMs) : t('notSolved')}</span>
      </li>`
    )
    .join('');
  const needyLine = needy.length
    ? `<p class="small muted">⏱ ${needy.map((m) => `${esc(moduleName(m.type))}${m.strikes ? ` (✕${m.strikes})` : ''}`).join(' · ')}</p>`
    : '';
  return `<details class="report" open><summary>${t('report')}</summary><ul>${rows}</ul>${needyLine}</details>`;
}

export function resultHTML(r, room, me) {
  const isHost = room?.hostId === me;
  const icon = r.outcome === 'defused' ? '✅' : r.outcome === 'exploded' ? '💥' : '⏹';
  const next = room && room.settings.rotateRoles ? room.players.find((p) => p.id === room.defuserId) : null;
  return `
    <div class="result-overlay o-${r.outcome}">
      <div class="result-card">
        <div class="result-icon">${icon}</div>
        <h1>${t(r.outcome)}</h1>
        <p class="result-reason">${t('reason_' + r.reason)}</p>
        ${r.outcome !== 'aborted' ? `<div class="result-score"><small>${t('score')}</small><b>${r.score ?? 0}</b></div>` : ''}
        <div class="result-stats">
          <div><small>${t('timeUsed')}</small><b>${formatDuration(r.timeUsedMs)}</b></div>
          <div><small>${t('timeLeft')}</small><b>${formatDuration(r.remainingMs)}</b></div>
          <div><small>${t('solvedModules')}</small><b>${r.solved}/${r.total}</b></div>
          <div><small>${t('strikes')}</small><b>${r.strikes}/${r.maxStrikes}</b></div>
        </div>
        ${r.rank ? `<p class="result-record">🏆 ${t('newRecord', { rank: r.rank })}</p>` : ''}
        ${campaignHTML(r, isHost)}
        ${reportHTML(r)}
        <p class="result-team">💣 ${esc(r.defuserName)} · ${esc((r.team || []).join(', '))}</p>
        ${next && r.outcome !== 'aborted' ? `<p class="muted small">${t('nextDefuser')}: <b>${esc(next.name)}</b></p>` : ''}
        <div class="result-actions">
          ${
            isHost
              ? `${r.autoNext || r.campaign ? '' : `<button class="btn btn-primary" data-ui="again">💣 ${t('playAgain')}</button>`}<button class="btn" data-ui="lobby">${t('backToLobby')}</button>`
              : `<div class="waiting">${r.autoNext && !r.autoNext.held ? '' : t('waitingHostShort')}</div>`
          }
        </div>
      </div>
    </div>`;
}
