import { RADIO_CALLSIGNS } from '/shared/modules/radio.js';
import { ident, needs, steps, warn, mark } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const list = RADIO_CALLSIGNS.slice().sort((a, b) => a[0].localeCompare(b[0]));
  const rows = list.map(([c, ch]) => `<tr><td class="mono">${c}</td><td class="digit">${ch}</td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Turuncu iki ekranlı (çağrı kodu ve kanal), ◀ ▶ düğmeli ve GÖNDER düğmeli bir telsiz.'
        : '<b>Needy.</b> A radio with two amber displays (call sign and channel), ◀ ▶ buttons and a SEND button.'
    )}
    ${needs(L, 'radio')}
    ${steps(
      tr
        ? [
            `Devreye girince ${mark('sol ekranda')} iki harfli bir <b>çağrı kodu</b> belirir (sağ ekran şu anki kanaldır).`,
            'Tabloda (alfabetik) kodun <b>kanalını</b> bulun.',
            `İmhacı kanalı ◀ ▶ ile ayarlar ve ${mark('GÖNDER')}’e basar.`,
          ]
        : [
            `When it switches on, a two-letter <b>call sign</b> appears on the ${mark('left display')} (the right one is the current channel).`,
            'Find its <b>channel</b> in the table (alphabetical).',
            `The defuser sets the channel with ◀ ▶ and presses ${mark('SEND')}.`,
          ]
    )}
    <table class="rules narrow"><thead><tr><th>${tr ? 'Çağrı kodu' : 'Call sign'}</th><th>${tr ? 'Kanal' : 'Channel'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${warn(L, tr ? ['Kanallar 1–8 arasıdır; 8’den sonra 1’e döner.', 'Yanlış kanaldan göndermek ya da süreyi kaçırmak hata yazdırır.'] : ['Channels go 1–8 and wrap around.', 'Sending on the wrong channel or running out of time causes a strike.'])}`;
};
