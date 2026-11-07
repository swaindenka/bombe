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

// ŞİFRE ÇÖZÜCÜ: 26 harfli Latin alfabesiyle yazılabilen 5 harfli kelimeler
export const CIPHER_WORDS = {
  tr: ['KALEM', 'BULUT', 'DOLAP', 'MASAL', 'ROKET', 'LAMBA', 'ZEBRA', 'HOROZ', 'PERDE', 'BALON', 'TABLO', 'KAVUN'],
  en: ['PLANT', 'ROBOT', 'CANDY', 'GHOST', 'LEMON', 'MAPLE', 'NOVEL', 'OCEAN', 'PIANO', 'TIGER', 'VAPOR', 'WHALE'],
};

// SESTEŞ: ekrandaki kelime -> basılacak kelime. Kelimeler bilerek birbirine çok benziyor.
export const HOMOPHONES = {
  tr: [
    ['BİN', 'KÂR'],
    ['BIN', 'HAL'],
    ['PİN', 'BEN'],
    ['BEN', 'ŞAY'],
    ['ŞEY', 'BIN'],
    ['ŞAY', 'HALL'],
    ['HAL', 'PİN'],
    ['HÂL', 'ŞEY'],
    ['KAR', 'HÂL'],
    ['KÂR', 'KAAR'],
    ['KAAR', 'BİN'],
    ['HALL', 'KAR'],
  ],
  en: [
    ['WRITE', 'NIGHT'],
    ['RIGHT', 'FORE'],
    ['RITE', 'HOLE'],
    ['KNIGHT', 'WRITE'],
    ['NIGHT', 'FOR'],
    ['NITE', 'RIGHT'],
    ['FOUR', 'HOLL'],
    ['FOR', 'KNIGHT'],
    ['FORE', 'NITE'],
    ['WHOLE', 'RITE'],
    ['HOLE', 'FOUR'],
    ['HOLL', 'WHOLE'],
  ],
};
