import { RADIO_CALLSIGNS } from '/shared/modules/radio.js';
import { ident, note } from './common.js';

export default (L) => {
  const tr = L === 'tr';
  const rows = RADIO_CALLSIGNS.map(([c, ch]) => `<tr><td class="mono">${c}</td><td class="digit">${ch}</td></tr>`).join('');
  return `
    ${ident(
      L,
      tr
        ? '<b>Sürekli ilgi ister.</b> Turuncu iki ekranlı (çağrı kodu ve kanal), ◀ ▶ düğmeli ve GÖNDER düğmeli bir telsiz.'
        : '<b>Needy.</b> A radio with two amber displays (call sign and channel), ◀ ▶ buttons and a SEND button.'
    )}
    <p>${
      tr
        ? 'Devreye girince sol ekranda iki harfli bir <b>çağrı kodu</b> belirir. Tabloda kodun kanalını bulun. İmhacı kanalı ◀ ▶ ile ayarlayıp <b>GÖNDER</b>’e basar.'
        : 'When it switches on, a two-letter <b>call sign</b> appears on the left display. Find its channel below. The defuser sets the channel with ◀ ▶ and presses <b>SEND</b>.'
    }</p>
    <table class="rules narrow"><thead><tr><th>${tr ? 'Çağrı kodu' : 'Call sign'}</th><th>${tr ? 'Kanal' : 'Channel'}</th></tr></thead><tbody>${rows}</tbody></table>
    ${note(tr ? 'Yanlış kanaldan göndermek ya da süreyi kaçırmak hata yazdırır.' : 'Sending on the wrong channel or running out of time causes a strike.')}`;
};
