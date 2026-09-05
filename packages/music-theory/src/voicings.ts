import { getChordNotes, parseChordSymbol } from './chords.js';
import { noteToPitchClass } from './notes.js';
import { GUITAR_STANDARD } from './tunings.js';
import type { ChordVoicing, GenerateVoicingsOptions, InstrumentTuning } from './types.js';

type PreferredShape = { frets: number[]; fingers?: number[] };

const PREFERRED: Record<string, PreferredShape[]> = {
  C: [
    { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1] },
    { frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1] }
  ],
  D: [
    { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    { frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1] },
    { frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1] }
  ],
  E: [
    { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    { frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 3, 3, 1] },
    { frets: [12, 14, 14, 13, 12, 12], fingers: [1, 3, 4, 2, 1, 1] }
  ],
  F: [
    { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
    { frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1] },
    { frets: [-1, 8, 10, 10, 10, 8], fingers: [0, 1, 3, 3, 3, 1] }
  ],
  G: [
    { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    { frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4] },
    { frets: [-1, 10, 12, 12, 12, 10], fingers: [0, 1, 3, 3, 3, 1] }
  ],
  A: [
    { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1] },
    { frets: [-1, 12, 14, 14, 14, 12], fingers: [0, 1, 3, 3, 3, 1] }
  ],
  Am: [
    { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1] }
  ],
  Em: [
    { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    { frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1] }
  ],
  Dm: [
    { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    { frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1] }
  ],
  Am7: [
    { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
    { frets: [5, 7, 5, 5, 5, 5], fingers: [1, 3, 1, 1, 1, 1] }
  ],
  C7: [
    { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
    { frets: [8, 10, 8, 9, 8, 8], fingers: [1, 3, 1, 2, 1, 1] }
  ],
  Cmaj7: [
    { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
    { frets: [8, 10, 9, 9, 8, 8], fingers: [1, 3, 2, 2, 1, 1] }
  ],
  Csus2: [
    { frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 2, 0, 0, 1, 3] },
    { frets: [-1, 3, 5, 5, 3, 3], fingers: [0, 1, 3, 4, 1, 1] }
  ],
  Csus4: [
    { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
    { frets: [8, 10, 10, 10, 8, 8], fingers: [1, 3, 3, 3, 1, 1] }
  ]
};

function noteAtFret(openString: string, fret: number): number {
  return (noteToPitchClass(openString) + fret) % 12;
}

function getAllowedFrets(openString: string, chordPitchClasses: Set<number>, maxFret: number): number[] {
  const result = [-1];
  for (let fret = 0; fret <= maxFret; fret += 1) if (chordPitchClasses.has(noteAtFret(openString, fret))) result.push(fret);
  return result;
}

function cartesianProduct(values: number[][], index = 0, current: number[] = [], output: number[][] = []): number[][] {
  if (index === values.length) { output.push([...current]); return output; }
  for (const value of values[index] ?? []) { current.push(value); cartesianProduct(values, index + 1, current, output); current.pop(); }
  return output;
}

function scoreVoicing(frets: number[], rootPitchClass: number, tuning: InstrumentTuning, fingers?: number[]): ChordVoicing | null {
  const played = frets.map((fret, stringIndex) => ({ fret, stringIndex })).filter(item => item.fret >= 0);
  if (!played.length) return null;
  const positiveFrets = played.map(item => item.fret).filter(fret => fret > 0);
  const firstFret = positiveFrets.length ? Math.min(...positiveFrets) : 0;
  const highestFret = positiveFrets.length ? Math.max(...positiveFrets) : 0;
  const fretSpan = positiveFrets.length ? highestFret - firstFret : 0;
  const openStrings = played.filter(item => item.fret === 0).length;
  const mutedStrings = frets.filter(fret => fret < 0).length;
  const rootCount = played.filter(item => { const open = tuning.strings[item.stringIndex]; return open ? noteAtFret(open, item.fret) === rootPitchClass : false; }).length;
  const lowestPlayed = played[0];
  const lowestOpen = lowestPlayed ? tuning.strings[lowestPlayed.stringIndex] : undefined;
  const rootInBass = !!(lowestPlayed && lowestOpen && noteAtFret(lowestOpen, lowestPlayed.fret) === rootPitchClass);
  const inversionPenalty = rootInBass ? -1.4 : 1.4;
  const baseDifficulty = positiveFrets.length + mutedStrings * .35 + fretSpan * .8 + firstFret * .08 + inversionPenalty;
  const difficulty = Math.max(1, Math.min(10, Number((baseDifficulty - openStrings * .45 - rootCount * .15).toFixed(1))));
  return { chord: '', tuningId: tuning.id, frets: [...frets], firstFret, fretSpan, openStrings, mutedStrings, difficulty, ...(fingers ? { fingers: [...fingers] } : {}) };
}

function isValidVoicing(frets: number[], chordPitchClasses: Set<number>, rootPitchClass: number, tuning: InstrumentTuning, maxSpan: number, minStrings: number): boolean {
  const sounding = frets.filter(fret => fret >= 0);
  if (sounding.length < minStrings) return false;
  const positiveFrets = frets.filter(fret => fret > 0);
  if (positiveFrets.length > 1 && Math.max(...positiveFrets) - Math.min(...positiveFrets) > maxSpan) return false;
  const soundedPitchClasses = new Set<number>(); let hasRoot = false;
  frets.forEach((fret, stringIndex) => { const open = tuning.strings[stringIndex]; if (fret < 0 || !open) return; const pc = noteAtFret(open, fret); soundedPitchClasses.add(pc); if (pc === rootPitchClass) hasRoot = true; });
  if (!hasRoot) return false;
  for (const pitchClass of chordPitchClasses) if (!soundedPitchClasses.has(pitchClass)) return false;
  return true;
}

function preferredVoicings(symbol: string, tuning: InstrumentTuning, rootPitchClass: number): ChordVoicing[] {
  if (tuning.id !== GUITAR_STANDARD.id) return [];
  return (PREFERRED[symbol] ?? []).map(shape => scoreVoicing(shape.frets, rootPitchClass, tuning, shape.fingers)).filter((item): item is ChordVoicing => !!item).map(item => ({ ...item, chord: symbol, difficulty: Math.max(1, Math.min(item.difficulty, 4)) }));
}

export function generateVoicings(options: GenerateVoicingsOptions): ChordVoicing[] {
  const tuning = options.tuning ?? GUITAR_STANDARD;
  const maxFret = options.maxFret ?? 12;
  const maxSpan = options.maxSpan ?? 4;
  const limit = options.limit ?? 24;
  const minStrings = options.minStrings ?? Math.min(4, tuning.strings.length);
  const parsed = parseChordSymbol(options.chord);
  const chordPitchClasses = new Set(getChordNotes(options.chord).map(noteToPitchClass));
  const rootPitchClass = noteToPitchClass(parsed.root);
  const curated = preferredVoicings(parsed.symbol, tuning, rootPitchClass);
  const choices = tuning.strings.map(openString => getAllowedFrets(openString, chordPitchClasses, maxFret));
  const combinations = cartesianProduct(choices);
  const generated: ChordVoicing[] = [];
  for (const frets of combinations) {
    if (!isValidVoicing(frets, chordPitchClasses, rootPitchClass, tuning, maxSpan, minStrings)) continue;
    const scored = scoreVoicing(frets, rootPitchClass, tuning);
    if (!scored) continue;
    scored.chord = parsed.symbol;
    generated.push(scored);
  }
  const seen = new Set<string>();
  return [...curated, ...generated.sort((a,b) => a.difficulty-b.difficulty || a.firstFret-b.firstFret || a.mutedStrings-b.mutedStrings || b.openStrings-a.openStrings)]
    .filter(item => { const key=item.frets.join(','); if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, limit);
}

export function formatFretPattern(frets: number[]): string {
  return frets.map(fret => fret < 0 ? 'x' : String(fret)).join(' ');
}
