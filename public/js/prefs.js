// Kişisel tercihler (bu tarayıcıda saklanır): renk körü etiketleri, azaltılmış efektler.

import { storage } from './dom.js';

const prefs = { colorblind: false, reduceFx: false, ...storage.get('bombe.prefs', {}) };

export function applyPrefs() {
  document.body.classList.toggle('cb-on', !!prefs.colorblind);
  document.body.classList.toggle('reduce-fx', !!prefs.reduceFx);
}

export function getPref(k) {
  return prefs[k];
}

export function setPref(k, v) {
  prefs[k] = v;
  storage.set('bombe.prefs', prefs);
  applyPrefs();
}
