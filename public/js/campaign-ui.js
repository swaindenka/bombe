// Kampanyanın ortak görsel parçaları: kod adı, canlar, bölüm şeridi, bölüm brifingi.

import { t, getLang, moduleName } from './i18n.js';
import { esc, formatDuration } from './dom.js';
import { codename, placeName, MODIFIERS } from '/shared/campaign.js';

export const opName = (seed) => `${t('campaignOp')} ${esc(codename(seed, getLang()))}`;

export const livesHTML = (lives, max) =>
  `<span class="lives" title="${t('campaignLives')}">${'❤'.repeat(Math.max(0, lives))}<span class="lost">${'❤'.repeat(Math.max(0, max - lives))}</span></span>`;

/** 12 bölümlük şerit: geçilenler yeşil, şu anki vurgulu, patlayanlar kırmızı işaretli */
export function pipsHTML(c) {
  const failed = new Set((c.history || []).filter((h) => h.outcome === 'exploded').map((h) => h.stage));
  let html = '';
  for (let s = 1; s <= c.total; s++) {
    const done = c.won || s < c.stage;
    const cls = done ? 'done' : s === c.stage && !c.over ? 'now' : '';
    html += `<i class="${cls} ${failed.has(s) && !done ? 'fail' : ''}" title="${t('campaignStage')} ${s}">${s}</i>`;
  }
  return `<div class="pips">${html}</div>`;
}

export function modifiersHTML(ids = []) {
  if (!ids.length) return `<span class="muted">${t('noConditions')}</span>`;
  const L = getLang();
  return ids.map((id) => `<span class="mod-chip" title="${esc(MODIFIERS[id].desc[L])}">${MODIFIERS[id].icon} ${esc(MODIFIERS[id].name[L])}</span>`).join('');
}

/** Bölüm brifingi: mekân, modül sayısı, süre, hata hakkı, öne çıkan modül, koşullar */
export function briefHTML(b) {
  if (!b) return '';
  return `
    <div class="brief">
      <div class="brief-title">${t('campaignStage')} ${b.stage} · ${esc(placeName(b.place, getLang()))}</div>
      <div class="brief-meta">💣 ${b.regular} ${t('modules')}${b.needy ? ` + ⏱${b.needy}` : ''} · ⏲ ${formatDuration(b.time * 1000)} · ✕${b.strikes} · ⭐ ${esc(moduleName(b.featured))}</div>
      <div class="brief-mods">${modifiersHTML(b.modifiers)}</div>
    </div>`;
}
