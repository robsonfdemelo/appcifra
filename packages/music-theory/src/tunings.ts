import type { InstrumentTuning } from './types.js';

export const GUITAR_STANDARD: InstrumentTuning = {
  id: 'guitar-standard',
  name: 'Padrão E A D G B E',
  instrument: 'guitar',
  strings: ['E', 'A', 'D', 'G', 'B', 'E']
};

export const GUITAR_DROP_D: InstrumentTuning = {
  id: 'guitar-drop-d',
  name: 'Drop D',
  instrument: 'guitar',
  strings: ['D', 'A', 'D', 'G', 'B', 'E']
};

export const GUITAR_HALF_STEP_DOWN: InstrumentTuning = {
  id: 'guitar-half-step-down',
  name: 'Meio tom abaixo',
  instrument: 'guitar',
  strings: ['D#', 'G#', 'C#', 'F#', 'A#', 'D#']
};

export const UKULELE_STANDARD: InstrumentTuning = {
  id: 'ukulele-standard',
  name: 'Padrão G C E A',
  instrument: 'ukulele',
  strings: ['G', 'C', 'E', 'A']
};

export const TUNINGS = [
  GUITAR_STANDARD,
  GUITAR_DROP_D,
  GUITAR_HALF_STEP_DOWN,
  UKULELE_STANDARD
] as const;
