// Uzmanların ortak not defteri: kasa bilgileri + serbest not. Alanlar anlık paylaşılır.
// Seri numarası girilince kurallarda sık kullanılan özellikler otomatik hesaplanır.

import { t } from './i18n.js';
import { esc } from './dom.js';
import { socket } from './net.js';
import { VOWELS, PORT_TYPES, INDICATOR_CODES } from '/shared/edgework.js';

const FIELDS = [
  ['serial', 12],
  ['batteries', 4],
  ['lit', 40],
  ['unlit', 40],
  ['ports', 60],
];

export function notesHTML(notes = {}) {
  const input = (k, max, cls = '', mode = '') =>
    `<input data-note="${k}" maxlength="${max}" value="${esc(notes[k] || '')}" class="${cls}" ${mode} autocomplete="off" spellcheck="false">`;
  return `
    <aside class="notes" id="notes" aria-label="${t('notesTitle')}">
      <div class="notes-head"><b>📝 ${t('notesTitle')}</b><button class="icon-btn notes-close" data-ctl="notes" aria-label="${t('close')}">✕</button></div>
      <p class="notes-sub">${t('notesHint')}</p>
      <label class="note-field"><span>${t('noteSerial')}</span>${input('serial', 12, 'mono upper')}</label>
      <div class="facts" id="serialFacts"></div>
      <div class="note-row">
        <label class="note-field"><span>${t('noteBatteries')}</span>${input('batteries', 4, 'mono', 'inputmode="numeric"')}</label>
        <label class="note-field"><span>${t('notePorts')}</span>${input('ports', 60, 'upper')}</label>
      </div>
      <div class="note-row">
        <label class="note-field"><span>${t('noteLit')}</span>${input('lit', 40, 'upper')}</label>
        <label class="note-field"><span>${t('noteUnlit')}</span>${input('unlit', 40, 'upper')}</label>
      </div>
      <div class="facts" id="otherFacts"></div>
      <label class="note-field"><span>${t('noteText')}</span><textarea data-note="text" maxlength="1500" rows="6" spellcheck="false">${esc(notes.text || '')}</textarea></label>
    </aside>`;
}

function serialFacts(serial) {
  const s = (serial || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!s) return '';
  const digits = s.split('').filter((c) => /\d/.test(c));
  const last = /\d$/.test(s) ? Number(s.at(-1)) : null;
  const vowel = s.split('').some((c) => VOWELS.includes(c));
  const chips = [];
  if (last !== null) chips.push(`${t('factLast')}: <b>${last}</b> (${last % 2 ? t('odd') : t('even')})`);
  chips.push(`${t('factVowel')}: <b>${vowel ? t('yes') : t('no')}</b>`);
  if (digits.length) chips.push(`${t('factDigitSum')}: <b>${digits.reduce((a, c) => a + Number(c), 0)}</b>`);
  return chips.map((c) => `<span class="fact">${c}</span>`).join('');
}

const countTokens = (text, list) => (text || '').toUpperCase().split(/[^A-Z0-9]+/).filter((w) => list.includes(w)).length;

function otherFacts(notes) {
  const chips = [];
  const ports = countTokens(notes.ports, PORT_TYPES);
  if (ports) chips.push(`${t('factPorts')}: <b>${ports}</b>`);
  const lit = countTokens(notes.lit, INDICATOR_CODES);
  if (notes.lit) chips.push(`${t('factLit')}: <b>${lit}</b>`);
  return chips.map((c) => `<span class="fact">${c}</span>`).join('');
}

export class NotesPanel {
  constructor(root, notes = {}) {
    this.root = root;
    this.notes = { ...notes };
    this.timers = {};
    this.onInput = (e) => {
      const k = e.target.dataset.note;
      if (!k) return;
      this.notes[k] = e.target.value;
      this.refresh();
      clearTimeout(this.timers[k]);
      this.timers[k] = setTimeout(() => socket.emit('notes:set', { field: k, value: e.target.value }), 180);
    };
    root.addEventListener('input', this.onInput);
    this.refresh();
  }

  refresh() {
    const sf = this.root.querySelector('#serialFacts');
    if (sf) sf.innerHTML = serialFacts(this.notes.serial);
    const of = this.root.querySelector('#otherFacts');
    if (of) of.innerHTML = otherFacts(this.notes);
  }

  /** Başka bir uzmandan gelen güncelleme */
  apply({ field, value }) {
    this.notes[field] = value;
    const el = this.root.querySelector(`[data-note="${field}"]`);
    if (el && document.activeElement !== el) {
      el.value = value;
      el.classList.remove('flash-note');
      void el.offsetWidth;
      el.classList.add('flash-note');
    }
    this.refresh();
  }

  destroy() {
    Object.values(this.timers).forEach(clearTimeout);
    this.root.removeEventListener('input', this.onInput);
  }
}

export const NOTE_FIELD_LIMITS = Object.fromEntries(FIELDS);
