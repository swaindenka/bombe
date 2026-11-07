import intro from './intro.js';
import wires from './wires.js';
import switches from './switches.js';
import tiles from './tiles.js';
import glyphs from './glyphs.js';
import maze from './maze.js';
import stroop from './stroop.js';
import safe from './safe.js';
import rhythm from './rhythm.js';
import coolant from './coolant.js';
import passphrase from './passphrase.js';

export const PAGE_ORDER = ['intro', 'wires', 'switches', 'tiles', 'glyphs', 'maze', 'stroop', 'safe', 'rhythm', 'coolant', 'passphrase'];
export const PAGES = { intro, wires, switches, tiles, glyphs, maze, stroop, safe, rhythm, coolant, passphrase };
export const NEEDY_PAGES = ['coolant', 'passphrase'];
