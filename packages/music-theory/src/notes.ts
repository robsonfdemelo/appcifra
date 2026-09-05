import type { NoteName } from './types.js';

export const CHROMATIC_SHARPS: readonly NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const NOTE_ALIASES: Record<string, NoteName> = {
  C: 'C',
  'B#': 'C',
  'C#': 'C#',
  Db: 'C#',
  D: 'D',
  'D#': 'D#',
  Eb: 'D#',
  E: 'E',
  Fb: 'E',
  F: 'F',
  'E#': 'F',
  'F#': 'F#',
  Gb: 'F#',
  G: 'G',
  'G#': 'G#',
  Ab: 'G#',
  A: 'A',
  'A#': 'A#',
  Bb: 'A#',
  B: 'B',
  Cb: 'B'
};

export function normalizeNote(note: string): NoteName {
  const cleaned = note.trim();
  const normalized = NOTE_ALIASES[cleaned];

  if (!normalized) {
    throw new Error(`Nota inválida: ${note}`);
  }

  return normalized;
}

export function noteToPitchClass(note: string): number {
  return CHROMATIC_SHARPS.indexOf(normalizeNote(note));
}

export function pitchClassToNote(pitchClass: number): NoteName {
  const normalized = ((pitchClass % 12) + 12) % 12;
  const note = CHROMATIC_SHARPS[normalized];

  if (!note) {
    throw new Error(`Classe de altura inválida: ${pitchClass}`);
  }

  return note;
}

export function transposeNote(note: string, semitones: number): NoteName {
  return pitchClassToNote(noteToPitchClass(note) + semitones);
}
