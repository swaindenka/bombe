# BOMBE

Arkadaşlarınla tarayıcıda oynadığın, çok oyunculu ve iş birliğine dayalı bir bomba imha oyunu.

> **Biri bombayı görür. Diğerleri nasıl söküleceğini bilir.**

- **İmhacı** bombayı görür ama kılavuza bakamaz.
- **Uzmanlar** kılavuzu okur ama bombayı göremez.
- Discord'da (ya da yan yana) konuşarak süre bitmeden bütün modülleri çözersiniz.

Her şey tarayıcıda çalışır. Kurulum yok, hesap yok: biri oda kurar, diğerleri 4 harfli kodla ya da davet bağlantısıyla katılır.

## Özellikler

- **Gerçek zamanlı çok oyunculu:** Node.js + Socket.IO sunucusu. Çözümler sunucuda tutulur; imhacının tarayıcısına yalnızca gördüğü şey gönderilir.
- **Bölünmüş kılavuz:** 2 veya daha fazla uzman varsa kılavuzun bölümleri uzmanlar arasında paylaştırılır. Herkes konuşmak zorunda kalır, kilitli sayfada o bölümün hangi uzmanda olduğu yazar.
- **Dönen roller:** Her bombadan sonra imhacı sıradaki oyuncu olur. Oda sahibi istediği zaman imhacıyı elle de seçebilir.
- **8 seviye ve serbest mod:** Seviyeler 3 modül ve 5 dakikadan 9 modül, 2 hata hakkı ve rastgele olaylara kadar zorlaşır. Serbest modda süreyi, modül sayısını, hata hakkını ve kullanılacak modülleri siz seçersiniz.
- **8 normal modül:** Kablolar, Şalterler, Renk Izgarası, Glifler, Labirent, Renk Karmaşası, Kasa, Ritim.
- **2 sürekli ilgi isteyen modül:** Soğutucu ve Parola. Bunlar çözülmez; ara ara devreye girer ve ihmal edilirse hata yazar.
- **Rastgele olaylar:** Işıklar söner (fenerle bakılır), bomba sarsılır, alarm çalar, uzmanların kılavuzuna parazit girer.
- **Skor tablosu:** Oda içi istatistikler (kim imhacıyken kaç bomba çözdü, en hızlı süre) ve seviye başına en hızlı imha rekorları.
- **Sesler ve müzik:** Tik-tak, hata sesi, patlama ve gerilim müziği; hepsi kodla üretilir, ses dosyası yoktur.
- **Türkçe + İngilizce:** Arayüz dili herkes için ayrı seçilir. Bombanın üzerindeki kelimeler ve kelime tabloları için oda sahibi bir **bomba dili** belirler.
- **Mobil uyumlu kılavuz:** Uzmanlar Discord'da konuşurken kılavuzu telefondan okuyabilir. Bomba ekranı masaüstü ve tablet için tasarlandı.

## Hızlıca çalıştırma (kendi bilgisayarında)

Node.js 18 veya üstü gerekir.

```bash
npm install
```

```bash
npm start
```

Ardından tarayıcıda `http://localhost:3000` adresini aç. Aynı Wi-Fi'daki arkadaşların `http://<bilgisayarının-yerel-IP'si>:3000` adresinden bağlanabilir. Tek başına denemek için iki ayrı sekme açman yeterli: bir sekme imhacı, diğeri uzman olur.

## İnternete koyma (Render, ücretsiz)

Arkadaşların farklı evlerdeyse oyunu bir sunucuya koyman gerekir. Depoda bunun için hazır bir `render.yaml` var:

1. [render.com](https://render.com) üzerinde hesap aç ve GitHub hesabını bağla.
2. **New → Blueprint** seç ve bu depoyu göster. Render `render.yaml` dosyasını okuyup servisi kendisi kurar.
3. Kurulum bitince `https://bombe-xxxx.onrender.com` gibi bir adres alırsın. Oda kurup davet bağlantısını arkadaşlarına gönder.

Notlar:

- Ücretsiz plan 15 dakika boyunca kimse bağlanmazsa uykuya geçer. İlk açılış bu yüzden 30–60 saniye sürebilir.
- Rekorlar `data/records.json` dosyasında tutulur. Ücretsiz planda disk kalıcı olmadığından sunucu yeniden başlayınca rekorlar sıfırlanabilir. Kalıcı disk bağlarsan `DATA_DIR` ortam değişkeniyle klasörü değiştirebilirsin.
- WebSocket destekleyen herhangi bir Node.js barındırma servisi (Fly.io, Railway, kendi VPS'in) de çalışır. Komut `npm start`, port `PORT` ortam değişkeninden okunur.

## Nasıl oynanır?

1. Biri **Oda kur** der ve davet bağlantısını paylaşır.
2. Oda sahibi bir seviye ya da serbest mod seçer, sonra **Bombayı getir** der.
3. İmhacı bombayı çevirerek (Boşluk tuşu) ön ve arka yüze, **Kenarlar** görünümünden (E tuşu) seri numarası, pil, gösterge ve portlara bakar ve gördüklerini anlatır.
4. Uzmanlar kılavuzda doğru sayfayı bulur ve imhacıya ne yapacağını söyler.
5. Her yanlış hamle bir hata yazdırır ve sayacı %25 hızlandırır. Hata hakkı biterse ya da süre dolarsa... 💥

Kural: İmhacı kılavuza bakmaz. Oyun buna güvenir. Kılavuz her oyuncunun tarayıcısında çalıştığı için hile tamamen dürüstlüğe kalmış.

## Proje yapısı

```
server/            Node.js sunucusu
  index.js         HTTP + Socket.IO giriş noktası
  rooms.js         odalar, oyuncular, roller, kılavuz paylaştırma
  game.js          bir bomba turu: sayaç, hatalar, sürekli ilgi isteyen modüller, olaylar
  leaderboard.js   seviye rekorları (JSON dosyası)
shared/            sunucu ve tarayıcının ortak kullandığı kurallar
  modules/         her modülün üretimi, görünümü ve doğrulaması
  edgework.js      seri no., piller, göstergeler, portlar
  levels.js        seviyeler ve serbest mod sınırları
public/            tarayıcı tarafı (derleme adımı yok)
  js/modules/      modüllerin bomba üzerindeki çizimi
  js/manual/       kılavuz sayfaları (TR/EN)
  js/bomb.js       imhacı ekranı
  js/expert.js     uzman ekranı
test/              birim ve entegrasyon testleri
```

Kılavuzdaki tablolar (kablo kuralları, şalter dizilimleri, glif değerleri, labirentler) oyunun kullandığı aynı veriden üretilir. Bu yüzden kılavuz ile oyun mantığı birbirinden kopamaz.

## Testler

```bash
npm test
```

Testler her modülün yüzlerce rastgele bombada doğru hamlelerle hatasız çözüldüğünü, yanlış hamlelerin hata yazdırdığını ve imhacıya giden görünümde çözüm bilgisi bulunmadığını kontrol eder. Gerçek soket bağlantılarıyla da oda kurma, katılma, kılavuz paylaştırma, kazanma, patlama, hızlanan sayaç, sürekli ilgi isteyen modüller ve yeniden bağlanma senaryolarını çalıştırır.

## Yeni modül eklemek

1. `shared/modules/<ad>.js`: `generate`, `view`, `action` fonksiyonları (sürekli ilgi isteyen modüller için ayrıca `activate`).
2. `shared/modules/index.js` içine kaydet.
3. `public/js/modules/<ad>.js`: bomba üzerindeki çizim. Tıklanabilir öğelere `data-act='{"...":...}'` eklemen yeterli.
4. `public/js/manual/<ad>.js`: kılavuz sayfası. Ardından `public/js/manual/index.js` ve `public/js/i18n.js` içindeki modül adlarına ekle.
5. `test/solver.js` içine çözücüsünü ekle; testler modülü otomatik olarak dener.
