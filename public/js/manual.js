// Kılavuz: içindekiler + sayfalar. Bölünmüş modda uzmanın sahip olmadığı sayfalar kilitli görünür.

import { PAGES, PAGE_ORDER, NEEDY_PAGES } from './manual/index.js';
import { t, getLang, moduleName } from './i18n.js';
import { esc } from './dom.js';

/**
 * @param {object} opts
 * @param {string} opts.contentLang  bomba dili (kelime tabloları)
 * @param {object} [opts.manual]     { split, mine, owners }
 */
export function manualHTML({ contentLang = 'tr', manual = { split: false } } = {}) {
  const L = getLang();
  const visible = (type) => type === 'intro' || !manual.split || manual.mine.includes(type);
  const order = manual.split
    ? ['intro', ...PAGE_ORDER.filter((p) => p !== 'intro' && visible(p)), ...PAGE_ORDER.filter((p) => !visible(p))]
    : PAGE_ORDER;

  let toc = '';
  let pages = '';
  let lockedHeader = false;
  order.forEach((type, i) => {
    const open = visible(type);
    if (manual.split && !open && !lockedHeader) {
      toc += `<li class="toc-sep">${t('otherPages')}</li>`;
      lockedHeader = true;
    }
    const needy = NEEDY_PAGES.includes(type);
    toc += `<li><a href="#page-${type}" class="${open ? '' : 'locked'}" data-page="${type}"><span class="toc-no">${i + 1}</span>${esc(moduleName(type, L))}${needy ? ' <span class="tag">⏱</span>' : ''}${open ? '' : ' 🔒'}</a></li>`;
    const body = open
      ? PAGES[type](L, contentLang)
      : `<div class="locked-page">🔒 ${t('lockedPage', { name: esc(manual.owners?.[type] || '?') })}</div>`;
    pages += `
      <section class="page ${open ? '' : 'is-locked'}" id="page-${type}">
        <header class="page-head"><span class="page-no">${i + 1}</span><h2>${esc(moduleName(type, L))}</h2>${needy ? `<span class="page-tag">${esc(t('needy'))}</span>` : ''}</header>
        <div class="page-body">${body}</div>
      </section>`;
  });

  return `
    <div class="manual">
      <nav class="manual-toc" aria-label="${esc(t('contents'))}">
        <div class="toc-title">${esc(t('contents'))}</div>
        ${manual.split ? `<div class="toc-sub">${esc(t('yourPages'))}</div>` : ''}
        <ol>${toc}</ol>
      </nav>
      <div class="manual-pages">
        <div class="manual-cover"><div class="cover-logo">BOMBE</div><div class="cover-sub">${L === 'tr' ? 'İmha Uzmanı Kılavuzu · Sürüm 1' : 'Defusal Expert Manual · Version 1'}</div></div>
        ${pages}
      </div>
    </div>`;
}

/** İçindekiler bağlantıları sayfa içinde kaydırır */
export function bindManual(root) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('.manual-toc a[data-page]');
    if (!a) return;
    e.preventDefault();
    const page = root.querySelector(`#page-${a.dataset.page}`);
    page?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
