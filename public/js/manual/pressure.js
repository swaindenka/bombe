import { ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Solda dikey bir basınç tüpü, sağda büyük kırmızı bir TAHLİYE düğmesi olan modül.'
        : '<b>Needy.</b> A module with a vertical pressure tube on the left and a big red VENT button.'
    )}
    <p>${
      tr
        ? 'Devreye girince tüpteki basınç yavaşça yükselir. Tüpte <b>yeşil bir bölge</b> vardır.'
        : 'When it switches on, the pressure in the tube slowly rises. The tube has a <b>green zone</b>.'
    }</p>
    <ul>
      ${
        tr
          ? `<li>Basınç yeşil bölgedeyken <b>TAHLİYE</b>’ye basılmalıdır.</li>
             <li>Erken basmak ya da basıncın tepeye ulaşmasına izin vermek hata yazdırır.</li>
             <li>Bu modül için kılavuza gerek yoktur; ama imhacı başka bir modülle uğraşırken ona hatırlatmak sizin işiniz!</li>`
          : `<li><b>VENT</b> must be pressed while the pressure is inside the green zone.</li>
             <li>Pressing too early, or letting the pressure reach the top, causes a strike.</li>
             <li>This module needs no lookup, but reminding a busy defuser about it is your job!</li>`
      }
    </ul>
    ${note(tr ? 'Yeşil bölgedeyken tüp de yeşile döner.' : 'The tube turns green while the pressure is in the zone.')}`;
};
