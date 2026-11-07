// Renk körü modu: renkli parçaların üzerine küçük harf etiketleri (ayarlardan açılır)
import { getLang } from '../i18n.js';

const CB = {
  tr: { red: 'KI', blue: 'MA', green: 'YE', yellow: 'SA', white: 'BE', black: 'Sİ', amber: 'TU' },
  en: { red: 'RD', blue: 'BL', green: 'GR', yellow: 'YE', white: 'WH', black: 'BK', amber: 'AM' },
};

export const cbText = (color) => (CB[getLang()] || CB.tr)[color] || '';
export const cb = (color, cls = '') => `<b class="cb ${cls}">${cbText(color)}</b>`;
