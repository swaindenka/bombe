// Oyundaki renklerin adları (iki dilde) ve ekranda kullanılan tonları.

export const COLOR_NAMES = {
  tr: {
    red: 'kırmızı',
    blue: 'mavi',
    green: 'yeşil',
    yellow: 'sarı',
    white: 'beyaz',
    black: 'siyah',
    amber: 'turuncu',
  },
  en: {
    red: 'red',
    blue: 'blue',
    green: 'green',
    yellow: 'yellow',
    white: 'white',
    black: 'black',
    amber: 'amber',
  },
};

export const COLOR_HEX = {
  red: '#d7263d',
  blue: '#2a6fdb',
  green: '#2f9e44',
  yellow: '#e8c31a',
  white: '#ececec',
  black: '#1d1d1f',
  amber: '#ff8c1a',
};

export function colorName(lang, key) {
  return (COLOR_NAMES[lang] || COLOR_NAMES.tr)[key] || key;
}
