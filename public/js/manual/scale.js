import { SCALE_ITEMS, SCALE_KINDS, SCALE_WEIGHTS } from '/shared/modules/scale.js';
import { itemIcon } from '/shared/icons.js';
import { ident, needs, steps, example, warn, mark } from './common.js';

const NAMES = {
  tr: { anchor: 'Çapa', bell: 'Çan', key: 'Anahtar', crown: 'Taç', gear: 'Dişli', hourglass: 'Kum saati' },
  en: { anchor: 'Anchor', bell: 'Bell', key: 'Key', crown: 'Crown', gear: 'Gear', hourglass: 'Hourglass' },
};

export default (L) => {
  const tr = L === 'tr';
  const items = SCALE_KINDS.map(
    (k) => `<div class="item-cell">${itemIcon(k)}<span>${NAMES[L][k]}</span><b>${SCALE_ITEMS[k]}</b></div>`
  ).join('');
  const w = (k) => SCALE_ITEMS[k];
  const exTotal = w('anchor') + w('key') * 2 + 2;
  const exPicks = SCALE_WEIGHTS.filter((x) => exTotal & x)
    .reverse()
    .join(' + ');
  return `
    ${ident(
      L,
      tr
        ? 'Bir terazi: sol kefede 2–3 nesne, altta <b>1 2 4 8 16</b> yazan ağırlık düğmeleri ve TART düğmesi.'
        : 'A balance: 2–3 objects on the left pan, weight buttons <b>1 2 4 8 16</b> and a WEIGH button.'
    )}
    ${needs(L, 'scale')}
    ${steps(
      tr
        ? [
            'İmhacıdan sol kefedeki nesneleri ve renklerini (gri ya da bakır) isteyin.',
            `Nesnelerin ağırlıklarını toplayın. ${mark('Bakır renkli nesne iki kat ağırdır.')} Toplama ${mark('pil sayısını')} ekleyin: bu, sol kefenin ağırlığıdır.`,
            `Sağ kefeye, toplamı ${mark('tam olarak')} bu sayı olan ağırlıkları koydurun (her biri en fazla bir kez) ve <b>TART</b>’a bastırın.`,
          ]
        : [
            'Ask for the objects on the left pan and their colours (grey or copper).',
            `Add up their weights. ${mark('A copper object weighs double.')} Add the ${mark('battery count')}: that is the left pan’s weight.`,
            `Have weights put on the right pan that add up to ${mark('exactly')} that number (each at most once), then press <b>WEIGH</b>.`,
          ]
    )}
    <div class="item-grid">${items}</div>
    ${example(
      L,
      tr
        ? `Gri çapa, bakır anahtar; 2 pil → ${w('anchor')} + ${w('key')}×2 + 2 = <b>${exTotal}</b>. Büyükten başlayın: 16 fazla, 8 sığar (kalan ${exTotal - 8}), 4 sığar… → <b>${exPicks}</b>.`
        : `Grey anchor, copper key; 2 batteries → ${w('anchor')} + ${w('key')}×2 + 2 = <b>${exTotal}</b>. Start big: 16 is too much, 8 fits (${exTotal - 8} left), 4 fits… → <b>${exPicks}</b>.`
    )}
    ${warn(
      L,
      tr
        ? ['Terazi kilitlidir: ancak TART’a basınca eğilir. Yanlış tartı hata yazdırır ve ağır gelen kefe aşağı iner.', 'Seçili ağırlık sarı yanar; tekrar basmak geri alır.']
        : ['The balance is locked until you weigh. A wrong weighing causes a strike and the heavier pan drops.', 'A selected weight lights up yellow; press again to remove it.']
    )}`;
};
