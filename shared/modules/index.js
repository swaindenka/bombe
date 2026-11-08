import wires from './wires.js';
import switches from './switches.js';
import glyphs from './glyphs.js';
import maze from './maze.js';
import safe from './safe.js';
import stroop from './stroop.js';
import tiles from './tiles.js';
import rhythm from './rhythm.js';
import arrows from './arrows.js';
import patch from './patch.js';
import gauges from './gauges.js';
import cipher from './cipher.js';
import homophones from './homophones.js';
import scale from './scale.js';
import elevator from './elevator.js';
import logic from './logic.js';
import coolant from './coolant.js';
import passphrase from './passphrase.js';
import radio from './radio.js';
import pressure from './pressure.js';
import verify from './verify.js';

export const MODULES = {
  wires,
  switches,
  glyphs,
  maze,
  safe,
  stroop,
  tiles,
  rhythm,
  arrows,
  patch,
  gauges,
  cipher,
  homophones,
  scale,
  elevator,
  logic,
  coolant,
  passphrase,
  radio,
  pressure,
  verify,
};

// Zorluk kademeleri: seviyeler modülleri bu sırayla tanıtır
export const TIERS = {
  1: ['wires', 'switches', 'tiles', 'glyphs', 'arrows'],
  2: ['maze', 'scale', 'patch', 'elevator', 'stroop', 'safe', 'gauges'],
  3: ['rhythm', 'cipher', 'logic', 'homophones'],
};
export const NEEDY_TIERS = {
  1: ['coolant', 'passphrase'],
  2: ['radio', 'verify', 'pressure'],
};

export const REGULAR_TYPES = [...TIERS[1], ...TIERS[2], ...TIERS[3]];
export const NEEDY_TYPES = [...NEEDY_TIERS[1], ...NEEDY_TIERS[2]];
export const ALL_TYPES = [...REGULAR_TYPES, ...NEEDY_TYPES];

// Sürekli ilgi isteyen modüllerin zamanlaması (ms). Modül kendi activeFor değerini verebilir.
export const NEEDY_TIMING = {
  firstDelay: [25000, 50000],
  delay: [20000, 45000],
  activeFor: 40000,
};
