import intro from './intro.js';
import wires from './wires.js';
import switches from './switches.js';
import tiles from './tiles.js';
import glyphs from './glyphs.js';
import arrows from './arrows.js';
import maze from './maze.js';
import stroop from './stroop.js';
import safe from './safe.js';
import patch from './patch.js';
import gauges from './gauges.js';
import rhythm from './rhythm.js';
import cipher from './cipher.js';
import homophones from './homophones.js';
import coolant from './coolant.js';
import passphrase from './passphrase.js';
import radio from './radio.js';
import pressure from './pressure.js';

export const PAGE_ORDER = [
  'intro',
  'wires',
  'switches',
  'tiles',
  'glyphs',
  'arrows',
  'maze',
  'stroop',
  'safe',
  'patch',
  'gauges',
  'rhythm',
  'cipher',
  'homophones',
  'coolant',
  'passphrase',
  'radio',
  'pressure',
];
export const PAGES = { intro, wires, switches, tiles, glyphs, arrows, maze, stroop, safe, patch, gauges, rhythm, cipher, homophones, coolant, passphrase, radio, pressure };
export const NEEDY_PAGES = ['coolant', 'passphrase', 'radio', 'pressure'];
