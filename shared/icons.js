// Bomba ile kılavuzun aynı çizimleri kullanması için ortak SVG simgeleri (24x24 koordinatlarında).
// Mantık Kapıları modülünün kapı şekilleri ve Terazi modülünün nesneleri.

export const GATE_PATH = {
  circle: '<circle cx="12" cy="12" r="9"/>',
  triangle: '<path d="M12 2.5 L21.5 20.5 H2.5 Z"/>',
  diamond: '<path d="M12 1.5 L22.5 12 L12 22.5 L1.5 12 Z"/>',
};

export const ITEM_PATH = {
  anchor: '<circle cx="12" cy="4.5" r="2.5"/><path d="M12 7v14M7 11h10M4 15q1 6 8 6q7 0 8-6" fill="none"/>',
  bell: '<path d="M5 18q2-2 2-8a5 5 0 0 1 10 0q0 6 2 8z"/><circle cx="12" cy="20.5" r="1.8"/>',
  key: '<circle cx="7" cy="12" r="4.5" fill="none"/><path d="M11.5 12h10M18 12v4M21 12v3" fill="none"/>',
  crown: '<path d="M3 19 L4 7 L9 12 L12 5 L15 12 L20 7 L21 19 Z"/>',
  gear: '<path d="M10.5 2h3l.6 3 2.4 1 2.5-1.8 2.1 2.1-1.8 2.5 1 2.4 3 .6v3l-3 .6-1 2.4 1.8 2.5-2.1 2.1-2.5-1.8-2.4 1-.6 3h-3l-.6-3-2.4-1-2.5 1.8-2.1-2.1 1.8-2.5-1-2.4-3-.6v-3l3-.6 1-2.4-1.8-2.5 2.1-2.1 2.5 1.8 2.4-1z"/><circle cx="12" cy="12" r="3.2" class="hole"/>',
  hourglass: '<path d="M5 2.5h14M5 21.5h14M7 2.5q0 6 5 9.5q-5 3.5-5 9.5h10q0-6-5-9.5q5-3.5 5-9.5z"/>',
};

// Işık Paneli modülünün sembolleri
export const PANEL_PATH = {
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M19.1 4.9l-2.5 2.5M7.4 16.6l-2.5 2.5" fill="none"/>',
  moon: '<path d="M15.5 3a9 9 0 1 0 5.5 14.5A7.5 7.5 0 0 1 15.5 3z"/>',
  cloud: '<path d="M6.5 19a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.3A3.9 3.9 0 0 1 17.5 19z"/>',
  drop: '<path d="M12 2.5C15 7.5 18.5 11 18.5 15a6.5 6.5 0 0 1-13 0c0-4 3.5-7.5 6.5-12.5z"/>',
  leaf: '<path d="M4 20C4 9 10 4 20.5 3.5 20.5 14 15 20 4 20z"/><path d="M4 20L14 10" fill="none"/>',
  bolt: '<path d="M13.5 2L5 13.5h6L9.5 22 19 9.5h-6.2z"/>',
};

/** Tek başına kullanılabilen küçük SVG (kılavuz ve bomba) */
export const gateIcon = (shape, cls = '') => `<svg class="gate-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${GATE_PATH[shape]}</svg>`;
export const itemIcon = (kind, cls = '') => `<svg class="item-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ITEM_PATH[kind]}</svg>`;
export const panelIcon = (sym, cls = '') => `<svg class="panel-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PANEL_PATH[sym]}</svg>`;
