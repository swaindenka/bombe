import { ident, needs, steps, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr ? '<b>Sürekli ilgi ister.</b> Solda dikey bir basınç tüpü, sağda büyük kırmızı bir TAHLİYE düğmesi olan modül.' : '<b>Needy.</b> A module with a vertical pressure tube on the left and a big red VENT button.'
    )}
    ${needs(L, 'pressure')}
    ${steps(
      tr
        ? [
            'Devreye girince tüpteki basınç yavaşça yükselir. Tüpte iki yeşil çizgi arasında bir <b>yeşil bölge</b> vardır.',
            `Basınç ${mark('yeşil bölgedeyken')} TAHLİYE’ye basılır. Bu sırada tüpün dolgusu da yeşile döner.`,
          ]
        : [
            'When it switches on, the pressure in the tube slowly rises. The tube has a <b>green zone</b> between two green lines.',
            `Press VENT ${mark('while the pressure is in the green zone')}. The fill turns green then.`,
          ]
    )}
    ${warn(
      L,
      tr
        ? ['Erken basmak ya da basıncın tepeye ulaşmasına izin vermek hata yazdırır.', 'Bu modül için kılavuz gerekmez; ama imhacı başka bir modülle uğraşırken ona hatırlatmak sizin işiniz.']
        : ['Pressing too early, or letting the pressure reach the top, causes a strike.', 'No lookup needed, but reminding a busy defuser is your job.']
    )}`;
};
