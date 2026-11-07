// İstemci hataları: ekranı boş bırakmak yerine kullanıcıya gösterilir ve sunucu günlüğüne yazılır.

import { socket } from './net.js';
import { VERSION } from '/shared/version.js';

let sent = 0;

export function reportError(err, where = '') {
  const message = String(err?.message || err || 'unknown');
  console.error('[BOMBE]', where, err);
  if (sent++ < 10) {
    socket.emit('client:error', {
      where: String(where).slice(0, 80),
      message: message.slice(0, 300),
      stack: String(err?.stack || '').slice(0, 600),
      version: VERSION,
      ua: navigator.userAgent.slice(0, 200),
    });
  }
  return message;
}

export function installGlobalHandlers(onError) {
  window.addEventListener('error', (e) => onError(reportError(e.error || e.message, 'window')));
  window.addEventListener('unhandledrejection', (e) => onError(reportError(e.reason, 'promise')));
}
