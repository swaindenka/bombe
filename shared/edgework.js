// Bomba kasası: seri numarası, piller, göstergeler ve portlar.
// Birçok modülün kuralı bu bilgilere bağlıdır; imhacı bombayı çevirip kenarlara bakarak okur.

export const SERIAL_LETTERS = 'ABCDEFGHIJKLMNPRSTUVWXZ'; // O, Q, Y yok (0 ile karışmasın)
export const VOWELS = ['A', 'E', 'I', 'U'];
export const INDICATOR_CODES = ['ZET', 'MUN', 'KAV', 'RIX', 'TOL', 'BEP', 'SIG', 'NOR'];
export const PORT_TYPES = ['USB', 'HDMI', 'RJ45', 'AUX', 'VGA', 'COAX'];
export const SIDES = ['top', 'right', 'bottom', 'left'];

export function generateEdgework(rng) {
  const L = () => rng.pick(SERIAL_LETTERS.split(''));
  const D = () => String(rng.int(0, 9));
  const serial = L() + L() + D() + D() + L() + D();

  // Pil yuvaları: her yuvada 1 ya da 2 pil, toplam en fazla 4
  const batteryHolders = [];
  const holderCount = rng.pick([0, 1, 1, 2, 2, 3]);
  let total = 0;
  for (let i = 0; i < holderCount; i++) {
    const cells = Math.min(rng.int(1, 2), 4 - total);
    if (cells <= 0) break;
    batteryHolders.push(cells);
    total += cells;
  }

  const indicatorCount = rng.pick([0, 1, 1, 2, 2, 3]);
  const indicators = rng
    .sample(INDICATOR_CODES, indicatorCount)
    .map((code) => ({ code, lit: rng.chance(0.5) }));

  const plateCount = rng.pick([0, 1, 1, 2]);
  const portPlates = [];
  for (let i = 0; i < plateCount; i++) {
    portPlates.push(rng.sample(PORT_TYPES, rng.int(1, 3)));
  }

  // Parçaları dört kenara dağıt
  const items = [{ kind: 'serial', value: serial }];
  batteryHolders.forEach((cells) => items.push({ kind: 'battery', cells }));
  indicators.forEach((ind) => items.push({ kind: 'indicator', ...ind }));
  portPlates.forEach((ports) => items.push({ kind: 'ports', ports }));
  const layout = { top: [], right: [], bottom: [], left: [] };
  for (const item of rng.shuffle(items)) {
    // En az dolu kenarlardan birine koy
    const min = Math.min(...SIDES.map((s) => layout[s].length));
    const candidates = SIDES.filter((s) => layout[s].length === min);
    layout[rng.pick(candidates)].push(item);
  }

  return { serial, batteryHolders, indicators, portPlates, layout };
}

// --- Kural yardımcıları (kılavuzla birebir aynı tanımlar) ---

export const batteryCount = (e) => e.batteryHolders.reduce((a, b) => a + b, 0);
export const serialLastDigit = (e) => Number(e.serial[e.serial.length - 1]);
export const serialIsOdd = (e) => serialLastDigit(e) % 2 === 1;
export const serialHasVowel = (e) => e.serial.split('').some((c) => VOWELS.includes(c));
export const serialDigitSum = (e) =>
  e.serial
    .split('')
    .filter((c) => /\d/.test(c))
    .reduce((a, c) => a + Number(c), 0);
export const litIndicatorCount = (e) => e.indicators.filter((i) => i.lit).length;
export const portCount = (e) => e.portPlates.reduce((a, p) => a + p.length, 0);
export const hasPort = (e, type) => e.portPlates.some((p) => p.includes(type));
