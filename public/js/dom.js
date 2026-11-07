// Küçük DOM yardımcıları

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export function formatTime(ms) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function toast(text, kind = 'info', ms = 2600) {
  const box = document.getElementById('toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = text;
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), ms - 300);
  setTimeout(() => el.remove(), ms);
}

export const storage = {
  get(key, fallback = null, session = false) {
    try {
      const v = (session ? sessionStorage : localStorage).getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value, session = false) {
    try {
      (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key, session = false) {
    try {
      (session ? sessionStorage : localStorage).removeItem(key);
    } catch {}
  },
};
