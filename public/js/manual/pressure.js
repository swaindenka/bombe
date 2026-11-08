import { ident, needs, steps, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr ? '<b>Sürekli ilgi ister.</b> Solda dikey bir basınç tüpü, sağda büyük kırmızı TAHLİYE düğmesi.' : '<b>Needy.</b> A vertical pressure tube and a big red VENT button.'
    )}
    ${needs(L, 'pressure')}
    ${steps(
      tr
        ? ['Devreye girince basınç yavaşça yükselir; tüpte iki yeşil çizgi arasında bir <b>yeşil bölge</b> vardır.', `Basınç ${mark('yeşil bölgedeyken')} TAHLİYE’ye basılır (dolgu da yeşile döner).`]
        : ['When it switches on, the pressure slowly rises; the tube has a <b>green zone</b> between two green lines.', `Press VENT ${mark('while the pressure is in the green zone')} (the fill turns green).`]
    )}
    ${warn(
      L,
      tr
        ? ['Erken basmak ya da basıncın tepeye ulaşması hata yazdırır.', 'Kılavuz gerekmez; ama imhacı başka modülle uğraşırken hatırlatmak sizin işiniz.']
        : ['Pressing too early, or letting it reach the top, causes a strike.', 'No lookup needed, but reminding a busy defuser is your job.']
    )}`;
};
