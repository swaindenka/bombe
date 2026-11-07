import wires from './wires.js';
import switches from './switches.js';
import glyphs from './glyphs.js';
import maze from './maze.js';
import safe from './safe.js';
import stroop from './stroop.js';
import tiles from './tiles.js';
import rhythm from './rhythm.js';
import coolant from './coolant.js';
import passphrase from './passphrase.js';

export const MODULES = { wires, switches, glyphs, maze, safe, stroop, tiles, rhythm, coolant, passphrase };

export const REGULAR_TYPES = ['wires', 'switches', 'tiles', 'glyphs', 'maze', 'stroop', 'safe', 'rhythm'];
export const NEEDY_TYPES = ['coolant', 'passphrase'];
export const ALL_TYPES = [...REGULAR_TYPES, ...NEEDY_TYPES];

// Sürekli ilgi isteyen modüllerin zamanlaması (ms)
export const NEEDY_TIMING = {
  firstDelay: [25000, 50000],
  delay: [20000, 45000],
  activeFor: 40000,
};
