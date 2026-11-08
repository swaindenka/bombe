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

/** Tek başına kullanılabilen küçük SVG (kılavuz ve bomba) */
export const gateIcon = (shape, cls = '') => `<svg class="gate-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${GATE_PATH[shape]}</svg>`;
export const itemIcon = (kind, cls = '') => `<svg class="item-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ITEM_PATH[kind]}</svg>`;
