import { t } from './i18n.js';
import { esc, formatDuration } from './dom.js';

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
        <div class="result-stats">
          <div><small>${t('timeUsed')}</small><b>${formatDuration(r.timeUsedMs)}</b></div>
          <div><small>${t('timeLeft')}</small><b>${formatDuration(r.remainingMs)}</b></div>
          <div><small>${t('solvedModules')}</small><b>${r.solved}/${r.total}</b></div>
          <div><small>${t('strikes')}</small><b>${r.strikes}/${r.maxStrikes}</b></div>
        </div>
        ${r.rank ? `<p class="result-record">🏆 ${t('newRecord', { rank: r.rank })}</p>` : ''}
        <p class="result-team">💣 ${esc(r.defuserName)} · ${esc((r.team || []).join(', '))}</p>
        ${next && r.outcome !== 'aborted' ? `<p class="muted small">${t('nextDefuser')}: <b>${esc(next.name)}</b></p>` : ''}
        <div class="result-actions">
          ${
            isHost
              ? `<button class="btn btn-primary" data-ui="again">💣 ${t('playAgain')}</button><button class="btn" data-ui="lobby">${t('backToLobby')}</button>`
              : `<div class="waiting">${t('waitingHostShort')}</div>`
          }
        </div>
      </div>
    </div>`;
}
