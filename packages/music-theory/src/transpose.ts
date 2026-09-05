import { transposeNote } from './notes.js';
import { parseChordSymbol } from './chords.js';

export function transposeChord(symbol: string, semitones: number): string {
  const parsed = parseChordSymbol(symbol);
  const root = transposeNote(parsed.root, semitones);
  const bass = parsed.bass ? transposeNote(parsed.bass, semitones) : undefined;

  return `${root}${parsed.suffix}${bass ? `/${bass}` : ''}`;
}

export function transposeProgression(chords: string[], semitones: number): string[] {
  return chords.map(chord => transposeChord(chord, semitones));
}
