import intro from './intro.js';
import wires from './wires.js';
import switches from './switches.js';
import tiles from './tiles.js';
import glyphs from './glyphs.js';
import arrows from './arrows.js';
import maze from './maze.js';
import scale from './scale.js';
import patch from './patch.js';
import elevator from './elevator.js';
import stroop from './stroop.js';
import safe from './safe.js';
import gauges from './gauges.js';
import rhythm from './rhythm.js';
import cipher from './cipher.js';
import logic from './logic.js';
import homophones from './homophones.js';
import coolant from './coolant.js';
import passphrase from './passphrase.js';
import radio from './radio.js';
import verify from './verify.js';
import pressure from './pressure.js';

// Sayfa sırası modüllerin tanıtılma sırasını izler (kolaydan zora), sürekli ilgi isteyenler sonda
export const PAGES = { intro, wires, switches, tiles, glyphs, arrows, maze, scale, patch, elevator, stroop, safe, gauges, rhythm, cipher, logic, homophones, coolant, passphrase, radio, verify, pressure };
export const PAGE_ORDER = Object.keys(PAGES);
export const NEEDY_PAGES = ['coolant', 'passphrase', 'radio', 'verify', 'pressure'];
