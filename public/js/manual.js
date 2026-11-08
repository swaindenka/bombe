// Kılavuz: içindekiler (arama + okunan sayfa vurgusu) ve sayfalar.
// Bölünmüş modda uzmanın sahip olmadığı sayfalar kilitli görünür.

import { PAGES, PAGE_ORDER, NEEDY_PAGES } from './manual/index.js';
import { t, getLang, moduleName } from './i18n.js';
import { esc } from './dom.js';
import { createRng } from '/shared/rng.js';

/**
 * @param {object} opts
 * @param {string} opts.contentLang  bomba dili (kelime tabloları)
 * @param {object} [opts.manual]     { split, mine, owners }
 * @param {number} [opts.scrambled]  kampanya koşulu "Dağınık kılavuz": sayfalar bu tohumla karışır,
 *                                   içindekiler ve arama gizlenir
 */
export function manualHTML({ contentLang = 'tr', manual = { split: false }, scrambled = null } = {}) {
  const L = getLang();
  const visible = (type) => type === 'intro' || !manual.split || manual.mine.includes(type);
  const base = scrambled ? ['intro', ...createRng(scrambled).shuffle(PAGE_ORDER.filter((p) => p !== 'intro'))] : PAGE_ORDER;
  const order = manual.split
    ? ['intro', ...base.filter((p) => p !== 'intro' && visible(p)), ...base.filter((p) => !visible(p))]
    : base;

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
    toc += `<li><a href="#page-${type}" class="${open ? '' : 'locked'}" data-page="${type}"><span class="toc-no">${i + 1}</span><span class="toc-name">${esc(moduleName(type, L))}</span>${needy ? ' <span class="tag">⏱</span>' : ''}${open ? '' : ' 🔒'}</a></li>`;
    const body = open
      ? PAGES[type](L, contentLang)
      : `<div class="locked-page">🔒 ${t('lockedPage', { name: esc(manual.owners?.[type] || '?') })}</div>`;
    pages += `
      <section class="page ${open ? '' : 'is-locked'}" id="page-${type}" data-page="${type}">
        <header class="page-head"><span class="page-no">${i + 1}</span><h2>${esc(moduleName(type, L))}</h2>${needy ? `<span class="page-tag">${esc(t('needy'))}</span>` : ''}</header>
        <div class="page-body">${body}</div>
      </section>`;
  });

  return `
    <div class="manual ${scrambled ? 'scrambled' : ''}">
      ${scrambled ? `<div class="scrambled-note">🗂 ${esc(t('scrambledNote'))}</div>` : ''}
      <nav class="manual-toc" aria-label="${esc(t('contents'))}">
        <div class="toc-title">${esc(t('contents'))}</div>
        <input class="toc-search" type="search" data-msearch placeholder="🔎 ${esc(t('searchManual'))}" aria-label="${esc(t('searchManual'))}">
        ${manual.split ? `<div class="toc-sub">${esc(t('yourPages'))}</div>` : ''}
        <ol>${toc}</ol>
        <div class="toc-empty">${esc(t('noMatches'))}</div>
      </nav>
      <div class="manual-pages">
        <div class="manual-cover"><div class="cover-logo">BOMBE</div><div class="cover-sub">${L === 'tr' ? 'İmha Uzmanı Kılavuzu · Sürüm 4' : 'Defusal Expert Manual · Version 4'}</div></div>
        ${pages}
        <div class="manual-end" aria-hidden="true">— ${esc(t('manualEnd'))} —</div>
      </div>
    </div>`;
}

// Türkçe I/ı/İ/i farkı aramayı bozmasın: hepsi "i" olarak karşılaştırılır
const norm = (s) =>
  s
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** İçindekiler, arama ve okunan sayfa vurgusu. Kaldırmak için dönen fonksiyonu çağır. */
export function bindManual(root) {
  let lockSpy = 0;
  const index = new Map();
  root.querySelectorAll('.page[data-page]').forEach((p) => index.set(p.dataset.page, norm(p.textContent)));

  const mark = (type) =>
    root.querySelectorAll('.manual-toc a[data-page]').forEach((a) => a.classList.toggle('active', a.dataset.page === type));
  // Süreye karşı oynanıyor: kaydırma anında olsun, hedef sayfa kısa bir parlamayla belirsin
  const go = (type) => {
    const page = root.querySelector(`#page-${type}`);
    if (!page) return;
    page.scrollIntoView({ behavior: 'auto', block: 'start' });
    mark(type);
    lockSpy = performance.now() + 400;
    page.classList.remove('flash-page');
    void page.offsetWidth;
    page.classList.add('flash-page');
  };
  const onClick = (e) => {
    const a = e.target.closest('.manual-toc a[data-page]');
    if (!a) return;
    e.preventDefault();
    go(a.dataset.page);
  };
  const filter = (q) => {
    const query = norm(q.trim());
    let first = null;
    let count = 0;
    root.querySelectorAll('.manual-toc a[data-page]').forEach((a) => {
      const hit = !query || norm(a.textContent).includes(query) || index.get(a.dataset.page)?.includes(query);
      a.parentElement.hidden = !hit;
      if (hit) {
        count++;
        first = first || a.dataset.page;
      }
    });
    root.querySelector('.manual-toc')?.classList.toggle('no-match', !!query && !count);
    return first;
  };
  const onInput = (e) => {
    if (e.target.matches('[data-msearch]')) filter(e.target.value);
  };
  const onKeySearch = (e) => {
    if (!e.target.matches('[data-msearch]')) return;
    if (e.key === 'Enter') {
      const first = filter(e.target.value);
      if (first) go(first);
    } else if (e.key === 'Escape') {
      e.target.value = '';
      filter('');
      e.target.blur();
    }
  };
  const onGlobalKey = (e) => {
    if (e.key !== '/' || e.target.closest?.('input, textarea')) return;
    const s = root.querySelector('[data-msearch]');
    if (s && root.offsetParent !== null) {
      e.preventDefault();
      s.focus();
    }
  };
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('keydown', onKeySearch);
  window.addEventListener('keydown', onGlobalKey);

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < lockSpy) return;
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const type = en.target.dataset.page;
          root.querySelectorAll('.manual-toc a[data-page]').forEach((a) => a.classList.toggle('active', a.dataset.page === type));
        }
      },
      { rootMargin: '-15% 0px -75% 0px' }
    );
    root.querySelectorAll('.page[data-page]').forEach((p) => observer.observe(p));
  }

  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('input', onInput);
    root.removeEventListener('keydown', onKeySearch);
    window.removeEventListener('keydown', onGlobalKey);
    observer?.disconnect();
  };
}
