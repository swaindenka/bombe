# BOMBE

Arkadaşlarınla tarayıcıda oynadığın, çok oyunculu ve iş birliğine dayalı bir bomba imha oyunu.

> **Biri bombayı görür. Diğerleri nasıl söküleceğini bilir.**

- **İmhacı** bombayı görür ama kılavuza bakamaz.
- **Uzmanlar** kılavuzu okur ama bombayı göremez.
- Discord'da (ya da yan yana) konuşarak süre bitmeden bütün modülleri çözersiniz.

Her şey tarayıcıda çalışır. Kurulum yok, hesap yok: biri oda kurar, diğerleri 4 harfli kodla ya da davet bağlantısıyla katılır.

## Özellikler

- **Gerçek zamanlı çok oyunculu:** Node.js + Socket.IO sunucusu. Çözümler sunucuda tutulur; imhacının tarayıcısına yalnızca gördüğü şey gönderilir.
- **21 modül:** 16 normal ve 5 sürekli ilgi isteyen modül (aşağıdaki tablo). Yeni: Terazi, Asansör, Mantık Kapıları ve Doğrulama.
- **Çeşitlilik:** Bir bombada, havuzdaki her modül bir kez çıkmadan hiçbiri ikinci kez çıkmaz (eskiden "glifler, pusula, glifler, pusula" gibi tekrarlar olabiliyordu).
- **Kampanya modu:** Seviyelerden bağımsız, kendi bölüm sistemi olan 12 bölümlük bir operasyon. Başlatınca doğrudan 1. bölümden ilerlenir.
  - Her kampanya rastgele üretilir: kod adı (ör. "Operasyon Paslı Fener"), her bölümün mekânı, modül sayısı ve havuzu, öne çıkan modülü, süresi, hata hakkı ve **koşulları** her seferinde farklıdır. Koşullar: Karanlık oda, Sarsıntılı bölge, Hatlarda parazit, Hızlı sayaç, Kırılgan, Kalabalık, Ek süre ve yeni gelenler: **Ödül süresi** (süre kısa başlar, çözülen her modül +20 sn), **Hassas devre** (her hata sayacı %50 hızlandırır), **Dalgalı akım** (modül ekranları sık karıncalanır), **Dağınık kılavuz** (uzmanların kılavuzu karışık sırada, içindekiler ve arama yok).
  - **Zorluk:** Kampanya Normal, Zor ya da Uzman başlatılır. Zor: süre %15 kısa ve 3. bölümden itibaren her bölümde bir koşul fazla. Uzman: süre %25 kısa, bir hata hakkı eksik, fazladan koşul ve 2 can. Seçilen zorluk o kampanya boyunca değişmez.
  - Zorluk eğrisi sabittir: bölüm ilerledikçe modül sayısı artar, süre kısalır, zor modüller ve koşullar açılır. Bir kampanyada aynı modül iki kez öne çıkmaz.
  - Takımın 3 canı var (Uzman zorlukta 2). İmha edince sonraki bölümün brifingi ve geri sayımı gösterilir, bölüm kendiliğinden başlar. Patlarsa 1 can gider ve bölüm *farklı bir bombayla* tekrar gelir. Canlar biterse kampanya biter, 12. bölüm geçilirse operasyon tamamlanır.
  - Oda sahibi "Şimdi başla", "Durdur" ve "Yeni kampanya" diyebilir. Odadaki en iyi kampanya sonucu saklanır.
- **Modül adları (isteğe bağlı):** Lobideki "Modül adlarını göster" seçeneği açıkken imhacının bombasında her modülün altında, kılavuzdaki başlıkla aynı adı taşıyan bir etiket görünür. Yeni başlayanlar için idealdir.
- **12 seviye ve serbest mod:** Seviyeler modülleri kademeli tanıtır; her seviye en fazla 2–3 yeni şey getirir ve lobide "Yeni:" rozetiyle gösterir. Zorluk düzgün artar: 3 modülden 9 modüle çıkılırken modül başına süre ~100 sn'den ~50 sn'ye iner, son iki seviyede hata hakkı 2'dir. Tamamlanan seviyeler ✓ ile işaretlenir. Serbest modda süre, modül sayısı, hata hakkı ve modül havuzu seçilir; **Kolay / Normal / Zor / Uzman** düğmeleri bunları tek tıkla doldurur.
- **Açık odalar:** Oda kuran kişi odasının herkese açık mı (ana sayfadaki listede görünür) yoksa gizli mi (sadece kodla katılınır) olacağını oda kurarken ya da lobide 🌐/🔒 düğmesiyle seçer ve isteğe bağlı bir oda adı verir. Ana sayfada açık odalar; sahibi, oyuncu sayısı, durumu (lobide/oyunda), modu ve bomba diliyle canlı listelenir ve tek tıkla katılınır. Varsayılan gizlidir.
- **Bölünmüş kılavuz:** 2 veya daha fazla uzman varsa kılavuzun bölümleri uzmanlar arasında paylaştırılır; kilitli sayfada o bölümün kimde olduğu yazar. Oyun sırasında bir uzman ayrılırsa ya da 8 saniyeden uzun süre bağlantısı koparsa onun sayfaları diğer uzmanlara açılır; kimse sayfasını kaybetmez.
- **Dönen roller:** Her bombadan sonra imhacı sıradaki oyuncu olur.
- **Ortak not defteri:** Uzmanlar seri numarası, pil, gösterge ve port bilgisini anlık paylaşır. Seri numarası girilince son rakam (tek/çift), sesli harf ve rakam toplamı otomatik hesaplanır.
- **Uzman bildirimleri:** Hata ve çözümler hangi modülde olduğuyla birlikte bildirilir ("✕ HATA · Kablolar"). Sürekli ilgi isteyen bir modül devreye girince uzmanlar haber alır ve o modülün kılavuz sayfası içindekilerde yanıp söner.
- **Ritim sayacın yanında:** Ritim modülü her zaman sayacın olduğu ön yüzde, mümkünse sayacın hemen yanında ya da altında çıkar.
- **Oyuncu çıkarma ve ilk oyun ipuçları:** Oda sahibi lobide oyuncu çıkarabilir. Yeni oyunculara rolleri için bir kerelik kısa ipucu kartı gösterilir.
- **Sade ama düşündüren kılavuz (Sürüm 4):** Kılavuz cevabı hazır vermez, **kuralı** verir. Her sayfa aynı kısa düzende: 👁 Tanıma → Gerekenler (imhacıdan hangi kasa bilgisinin isteneceği) → kurallar (kilit yerler sarı vurgulu) → kuralın adım adım uygulandığı tek bir 📝 Örnek → ⚠ Dikkat. Hazır cevap tabloları kaldırıldı; yerlerine kısa kurallar geldi: Pusula'da renk → dönüş kuralı ve pusula gülü, Şalterler'de "yanan gösterge varsa sağdan sola uygula", Bağlantı Panosu'nda "3+ pilde üçgen ile kare yer değiştirir", Şifre Çözücü'de numaralı alfabe şeridi ve "geri say" kuralı, Kablolar'da tek satırlık ✔/✘ kuralları. Kural tabloları hâlâ oyunun kullandığı aynı veriden üretilir ve testler kuralı metindeki gibi uygulayıp oyunla karşılaştırır.
- **Kılavuzda arama:** `/` ile arama kutusuna geçilir (ör. "hdmi" yazınca portlarla ilgili sayfalar kalır). Okunan sayfa içindekilerde vurgulanır.
- **Duraklatma:** Oda sahibi oyunu duraklatabilir; sayaç, sürekli ilgi isteyen modüller ve olaylar donar.
- **Tur sonu raporu:** Puan, hangi modülün kaçıncı saniyede çözüldüğü ve hangi modülde kaç hata yapıldığı.
- **Rastgele olaylar:** Işıklar söner (fenerle bakılır), bomba sarsılır, alarm çalar, uzmanların kılavuzuna parazit girer, **elektrik dalgalanması** çözülmemiş bir modülün ekranını birkaç saniye karıncalandırır.
- **Skor tablosu:** Oda içi istatistikler, takım puanı ve seviye başına en hızlı imha rekorları.
- **Ses tasarımı:** Her etkileşimin kendi sesi var (kablo kesme, şalter, kadran, fiş). Müzik katmanlıdır: süre azaldıkça arpej ve gerilim tonu devreye girer, hata aldıkça tempo artar. Son 10 saniyede bip sesi, lobide yumuşak bir ambiyans çalar. Hepsi kodla üretilir; ana ses, müzik ve efekt seviyeleri ayrı ayarlanır.
- **Erişilebilirlik:** Renk körü etiketleri (renkli parçaların üzerine KI/MA/YE/SA gibi kısaltmalar) ve "efektleri azalt" seçeneği.
- **Kısayollar:** Boşluk = bombayı çevir, E = kenarlar, ok tuşları = imlecin altındaki labirent/pusula, `/` = kılavuzda ara.
- **Türkçe + İngilizce:** Arayüz dili kişiye özel, bombadaki kelimelerin dili oda ayarı.
- **Mobil uyumlu kılavuz:** Uzmanlar kılavuzu telefondan okuyabilir.

### Modüller

| Kademe | Modül | Kısaca |
| --- | --- | --- |
| 1 | Kablolar | Kablo sayısı ve en üstteki kablonun rengiyle tablodan kesilecek kablo |
| 1 | Şalterler | Lamba rengi + seri no. → 5 şalterin dizilimi |
| 1 | Renk Izgarası | Baskın renk + pil sayısı → basılacak karolar |
| 1 | Glifler | Sembollerin değerine göre sıralı basma |
| 1 | Pusula | Okun rengine göre yön çevirme, 4 aşama |
| 2 | Labirent | Görünmez duvarlı labirentte yön tarifi |
| 2 | Terazi | Nesnelerin ağırlığı (bakır = iki kat) + pil → 1/2/4/8/16'lık ağırlıklarla dengeleme |
| 2 | Bağlantı Panosu | Renkli fişleri doğru şekilli prizlere takma |
| 2 | Asansör | Acil ve normal çağrıları kurallara göre doğru sırayla karşılama |
| 2 | Renk Karmaşası | Kelime/mürekkep/arka plan karmaşası, 3 aşama |
| 2 | Kasa | Kasa bilgilerinden 3 haneli şifre hesaplama |
| 2 | Manometreler | Üç göstergeyi okuyup doğru vanayı açma, 2 aşama |
| 3 | Ritim | Yanıp sönen desenden rakam, sayaca göre zamanlı basma |
| 3 | Şifre Çözücü | Harfleri kaydırılmış kodu çözme |
| 3 | Mantık Kapıları | Şekilli kapılardan (turuncu = ters) geçen devrenin çıkışını istenen hâle getirme |
| 3 | Sesteş | Birbirine çok benzeyen kelimeleri doğru tarif etme, 3 aşama |
| ⏱ | Soğutucu | Kodun rakamlarına göre A/B/C |
| ⏱ | Parola | Soru kelimesinin cevabı |
| ⏱ | Telsiz | Çağrı kodunun kanalını ayarlayıp gönderme |
| ⏱ | Doğrulama | Lambanın rengine göre iki haneli sayıyı dönüştürme |
| ⏱ | Basınç Vanası | Basınç yeşil bölgedeyken tahliye (dikkat ister) |

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
2. Oda sahibi bir seviye ya da serbest mod seçer, sonra **Bombayı getir** der. İlk kez oynuyorsanız 1. seviyeden başlayın.
3. İmhacı bombayı çevirerek (Boşluk tuşu) ön ve arka yüze, **Kenarlar** görünümünden (E tuşu) seri numarası, pil, gösterge ve portlara bakar ve gördüklerini anlatır.
4. Uzmanlar kılavuzda doğru sayfayı bulur, kasa bilgilerini ortak not defterine yazar ve imhacıya ne yapacağını söyler.
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
  icons.js         bomba ile kılavuzun ortak çizimleri (kapılar, terazi nesneleri)
  campaign.js      kampanya bölümleri, koşullar ve zorluklar
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

Testler her modülün yüzlerce rastgele bombada doğru hamlelerle hatasız çözüldüğünü, kılavuzdaki kuralların (metinde yazıldığı gibi bağımsız uygulanınca) oyunla aynı sonucu verdiğini, bombada gereksiz modül tekrarı olmadığını, seviye eğrisinin düzgün arttığını, yanlış hamlelerin hata yazdırdığını, imhacıya giden görünümde çözüm bilgisi bulunmadığını ve her seviyenin tanıttığı modüllerin bombada gerçekten çıktığını kontrol eder. Gerçek soket bağlantılarıyla da oda kurma, katılma, kılavuz paylaştırma, kazanma, patlama, hızlanan sayaç, sürekli ilgi isteyen modüller, duraklatma, ortak notlar, puan ve yeniden bağlanma senaryolarını çalıştırır.

## Yeni modül eklemek

1. `shared/modules/<ad>.js`: `generate`, `view`, `action` fonksiyonları (sürekli ilgi isteyen modüller için ayrıca `activate` ve isteğe bağlı `activeFor`).
2. `shared/modules/index.js` içinde kaydet ve bir zorluk kademesine (`TIERS`) ekle. Bir seviyenin havuzuna girince lobide otomatik olarak "Yeni" rozetiyle tanıtılır.
3. `public/js/modules/<ad>.js`: bomba üzerindeki çizim. Tıklanabilir öğelere `data-act='{"...":...}'` eklemen yeterli. Sadece tarayıcıda kalan seçimler için `local()`, her karede çizim için `frame()` kullanılabilir (örnekler: Bağlantı Panosu, Basınç Vanası).
4. `public/js/manual/<ad>.js`: kılavuz sayfası. Ardından `public/js/manual/index.js` ve `public/js/i18n.js` içindeki modül adlarına ekle.
5. `test/solver.js` içine çözücüsünü ekle; testler modülü otomatik olarak dener.
