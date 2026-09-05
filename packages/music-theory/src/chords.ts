import { normalizeNote, pitchClassToNote, noteToPitchClass } from './notes.js';
import type { ChordQuality, NoteName, ParsedChord } from './types.js';

interface ChordDefinition {
  quality: ChordQuality;
  suffix: string;
  intervals: number[];
}

const DEFINITIONS: Record<string, ChordDefinition> = {
  '': { quality: 'major', suffix: '', intervals: [0, 4, 7] },
  m: { quality: 'minor', suffix: 'm', intervals: [0, 3, 7] },
  min: { quality: 'minor', suffix: 'm', intervals: [0, 3, 7] },
  '5': { quality: '5', suffix: '5', intervals: [0, 7] },
  '6': { quality: '6', suffix: '6', intervals: [0, 4, 7, 9] },
  m6: { quality: 'minor6', suffix: 'm6', intervals: [0, 3, 7, 9] },
  '7': { quality: '7', suffix: '7', intervals: [0, 4, 7, 10] },
  maj7: { quality: 'maj7', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  M7: { quality: 'maj7', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  m7: { quality: 'minor7', suffix: 'm7', intervals: [0, 3, 7, 10] },
  mMaj7: { quality: 'minorMaj7', suffix: 'mMaj7', intervals: [0, 3, 7, 11] },
  dim: { quality: 'dim', suffix: 'dim', intervals: [0, 3, 6] },
  dim7: { quality: 'dim7', suffix: 'dim7', intervals: [0, 3, 6, 9] },
  aug: { quality: 'aug', suffix: 'aug', intervals: [0, 4, 8] },
  '+': { quality: 'aug', suffix: 'aug', intervals: [0, 4, 8] },
  sus2: { quality: 'sus2', suffix: 'sus2', intervals: [0, 2, 7] },
  sus4: { quality: 'sus4', suffix: 'sus4', intervals: [0, 5, 7] },
  sus: { quality: 'sus4', suffix: 'sus4', intervals: [0, 5, 7] },
  add9: { quality: 'add9', suffix: 'add9', intervals: [0, 4, 7, 14] },
  madd9: { quality: 'minorAdd9', suffix: 'madd9', intervals: [0, 3, 7, 14] },
  '9': { quality: '9', suffix: '9', intervals: [0, 4, 7, 10, 14] },
  maj9: { quality: 'maj9', suffix: 'maj9', intervals: [0, 4, 7, 11, 14] },
  m9: { quality: 'minor9', suffix: 'm9', intervals: [0, 3, 7, 10, 14] },
  '11': { quality: '11', suffix: '11', intervals: [0, 4, 7, 10, 14, 17] },
  '13': { quality: '13', suffix: '13', intervals: [0, 4, 7, 10, 14, 21] },
  m7b5: { quality: 'minor7b5', suffix: 'm7b5', intervals: [0, 3, 6, 10] },
  'ø': { quality: 'minor7b5', suffix: 'm7b5', intervals: [0, 3, 6, 10] },
  '7sus4': { quality: '7sus4', suffix: '7sus4', intervals: [0, 5, 7, 10] },
  '7b5': { quality: '7b5', suffix: '7b5', intervals: [0, 4, 6, 10] },
  '7#5': { quality: '7sharp5', suffix: '7#5', intervals: [0, 4, 8, 10] },
  '7b9': { quality: '7b9', suffix: '7b9', intervals: [0, 4, 7, 10, 13] },
  '7#9': { quality: '7sharp9', suffix: '7#9', intervals: [0, 4, 7, 10, 15] }
};

export const SUPPORTED_CHORD_SUFFIXES = Object.keys(DEFINITIONS)
  .filter(Boolean)
  .sort((a, b) => b.length - a.length);

export function parseChordSymbol(symbol: string): ParsedChord {
  const cleaned = symbol.replace(/\s+/g, '');
  const match = /^([A-Ga-g])([#b]?)([^/]*)?(?:\/([A-Ga-g])([#b]?))?$/.exec(cleaned);

  if (!match) {
    throw new Error(`Acorde inválido: ${symbol}`);
  }

  const [, letter, accidental = '', rawSuffix = '', bassLetter, bassAccidental = ''] = match;
  const root = normalizeNote(`${letter?.toUpperCase()}${accidental}`);
  const definition = DEFINITIONS[rawSuffix];

  if (!definition) {
    throw new Error(`Tipo de acorde ainda não suportado: ${rawSuffix || '(maior)'}`);
  }

  const bass = bassLetter
    ? normalizeNote(`${bassLetter.toUpperCase()}${bassAccidental}`)
    : undefined;

  return {
    symbol: `${root}${definition.suffix}${bass ? `/${bass}` : ''}`,
    root,
    quality: definition.quality,
    suffix: definition.suffix,
    ...(bass ? { bass } : {})
  };
}

export function getChordIntervals(symbol: string): number[] {
  const parsed = parseChordSymbol(symbol);
  const definition = Object.values(DEFINITIONS).find(
    item => item.quality === parsed.quality && item.suffix === parsed.suffix
  );

  if (!definition) {
    throw new Error(`Definição não encontrada para ${symbol}`);
  }

  return [...definition.intervals];
}

export function getChordNotes(symbol: string): NoteName[] {
  const parsed = parseChordSymbol(symbol);
  const rootPitchClass = noteToPitchClass(parsed.root);
  const intervals = getChordIntervals(symbol);
  const seen = new Set<NoteName>();

  for (const interval of intervals) {
    seen.add(pitchClassToNote(rootPitchClass + interval));
  }

  return [...seen];
}
