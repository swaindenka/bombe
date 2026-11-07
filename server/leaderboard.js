// Seviye rekorları: her seviye için en hızlı imhalar. data/records.json dosyasında saklanır.
// Not: Render gibi ücretsiz servislerde disk her yeniden başlatmada sıfırlanabilir.

import fs from 'fs';
import path from 'path';

const KEEP = 10;

export class Leaderboard {
  constructor(file) {
    this.file = file;
    this.data = {};
    this.saveTimer = null;
    if (!file) return;
    try {
      this.data = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
    } catch {
      this.data = {};
    }
  }

  record(levelId, entry) {
    if (!levelId) return null;
    const list = (this.data[levelId] ||= []);
    const item = { ...entry, date: new Date().toISOString() };
    list.push(item);
    list.sort((a, b) => a.timeMs - b.timeMs || a.strikes - b.strikes);
    list.length = Math.min(list.length, KEEP);
    this.scheduleSave();
    const rank = list.indexOf(item);
    return rank >= 0 ? rank + 1 : null;
  }

  top(n = 5) {
    const out = {};
    for (const [k, v] of Object.entries(this.data)) out[k] = v.slice(0, n);
    return out;
  }

  scheduleSave() {
    if (!this.file || this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      try {
        fs.mkdirSync(path.dirname(this.file), { recursive: true });
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
      } catch (err) {
        console.error('Rekorlar kaydedilemedi:', err.message);
      }
    }, 500);
  }
}
