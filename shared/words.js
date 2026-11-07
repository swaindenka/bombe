// Dile bağlı modüllerin kelime listeleri. Bomba dili (oda ayarı) hangi listenin kullanılacağını belirler.

export const STROOP_WORDS = {
  tr: { red: 'KIRMIZI', blue: 'MAVİ', green: 'YEŞİL', yellow: 'SARI' },
  en: { red: 'RED', blue: 'BLUE', green: 'GREEN', yellow: 'YELLOW' },
};

// PAROLA modülü: soru kelimesi -> doğru cevap
export const PASSPHRASES = {
  tr: [
    ['BALIK', 'ŞEMSİYE'],
    ['KALE', 'PAMUK'],
    ['BULUT', 'ÇEKİÇ'],
    ['ORMAN', 'MÜREKKEP'],
    ['YILDIZ', 'TUZ'],
    ['KUM', 'FENER'],
    ['DEMİR', 'KELEBEK'],
    ['SAAT', 'ZEYTİN'],
    ['KAYIK', 'DUMAN'],
    ['ELMAS', 'TAVŞAN'],
    ['BAYKUŞ', 'KİLİT'],
    ['RÜZGAR', 'MASA'],
  ],
  en: [
    ['FISH', 'UMBRELLA'],
    ['CASTLE', 'COTTON'],
    ['CLOUD', 'HAMMER'],
    ['FOREST', 'INK'],
    ['STAR', 'SALT'],
    ['SAND', 'LANTERN'],
    ['IRON', 'BUTTERFLY'],
    ['CLOCK', 'OLIVE'],
    ['BOAT', 'SMOKE'],
    ['DIAMOND', 'RABBIT'],
    ['OWL', 'LOCK'],
    ['WIND', 'TABLE'],
  ],
};
