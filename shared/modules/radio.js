// TELSİZ (sürekli ilgi ister): Devreye girince ekranda iki harfli bir çağrı kodu belirir.
// Kılavuzdaki tabloda kodun kanalını bul, kanalı ◀ ▶ ile ayarla ve GÖNDER'e bas.

export const RADIO_CALLSIGNS = [
  ['KX', 3],
  ['BR', 7],
  ['TD', 1],
  ['MZ', 5],
  ['PL', 8],
  ['SV', 2],
  ['AQ', 6],
  ['NW', 4],
  ['HC', 7],
  ['EF', 2],
  ['GJ', 5],
  ['UY', 1],
];
export const RADIO_CHANNELS = 8;

export default {
  type: 'radio',
  needy: true,
  activeFor: 40000,
  generate(rng) {
    return { active: false, callsign: null, answer: null, channel: rng.int(1, RADIO_CHANNELS) };
  },
  activate(s, rng) {
    const [callsign, answer] = rng.pick(RADIO_CALLSIGNS);
    s.active = true;
    s.callsign = callsign;
    s.answer = answer;
    if (s.channel === answer) s.channel = (answer % RADIO_CHANNELS) + 1;
  },
  view(s) {
    return { active: s.active, callsign: s.active ? s.callsign : null, channel: s.channel };
  },
  action(s, a) {
    if (!s.active || !a) return {};
    if (a.tune === 1 || a.tune === -1) {
      s.channel = ((s.channel - 1 + a.tune + RADIO_CHANNELS) % RADIO_CHANNELS) + 1;
      return { changed: true };
    }
    if (a.send) return s.channel === s.answer ? { deactivate: true } : { strike: true, deactivate: true };
    return {};
  },
};
