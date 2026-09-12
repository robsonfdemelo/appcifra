import {
  getChordIntervals,
  getChordNotes,
  noteToPitchClass,
  parseChordSymbol,
  transposeNote
} from '@app-cifra/music-theory';

export type HarmonicFunction =
  | 'Tônica'
  | 'Subdominante'
  | 'Dominante'
  | 'Cromático';

export type HarmonicContext = {
  inputChord: string;
  normalizedChord: string;
  displayName: string;
  qualityLabel: string;
  notes: string[];
  formula: string[];
  degree: string;
  degreeNumber: number | null;
  harmonicFunction: HarmonicFunction;
  functionDescription: string;
  characterLabel: string;
  stability: number;
  tension: number;
  keyLabel: string;
  field: Array<{
    degree: string;
    chord: string;
    active: boolean;
  }>;
  substitutions: Array<{
    chord: string;
    reason: string;
  }>;
};

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'] as const;
const MAJOR_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const;

const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;
const MINOR_QUALITIES = ['m', 'dim', '', 'm', 'm', '', ''] as const;
const MINOR_DEGREES = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const;

const QUALITY_LABELS: Record<string, string> = {
  major: 'Maior',
  minor: 'Menor',
  '5': 'Power chord',
  '6': 'Maior com sexta',
  minor6: 'Menor com sexta',
  '7': 'Dominante com sétima',
  maj7: 'Maior com sétima maior',
  minor7: 'Menor com sétima',
  minorMaj7: 'Menor com sétima maior',
  dim: 'Diminuto',
  dim7: 'Diminuto com sétima',
  aug: 'Aumentado',
  sus2: 'Suspenso com segunda',
  sus4: 'Suspenso com quarta',
  add9: 'Maior com nona adicionada',
  minorAdd9: 'Menor com nona adicionada',
  '9': 'Dominante com nona',
  maj9: 'Maior com nona maior',
  minor9: 'Menor com nona',
  '11': 'Dominante com décima primeira',
  '13': 'Dominante com décima terceira',
  minor7b5: 'Meio diminuto',
  '7sus4': 'Dominante suspenso',
  '7b5': 'Dominante com quinta diminuta',
  '7sharp5': 'Dominante com quinta aumentada',
  '7b9': 'Dominante com nona menor',
  '7sharp9': 'Dominante com nona aumentada'
};

export function normalizeChordForTheory(chord: string) {
  return chord
    .trim()
    .replace(/7M(?=\/|$)/g, 'maj7')
    .replace(/([A-G](?:#|b)?)4(?=\/|$)/g, '$1sus4');
}

function parseKey(key: string) {
  const cleaned = key.trim().replace(/\s+/g, '');

  if (/^[A-G](?:#|b)?m$/i.test(cleaned)) {
    return {
      root: cleaned.slice(0, -1),
      mode: 'minor' as const
    };
  }

  const rootMatch = /^([A-G](?:#|b)?)/i.exec(cleaned);

  return {
    root: rootMatch?.[1] ?? 'C',
    mode: 'major' as const
  };
}

function intervalLabel(interval: number) {
  const normalized = interval % 12;
  const octave = Math.floor(interval / 12);

  if (octave >= 1) {
    const extension: Record<number, string> = {
      0: '8',
      1: 'b9',
      2: '9',
      3: '#9',
      4: '10',
      5: '11',
      6: '#11',
      7: '12',
      8: 'b13',
      9: '13',
      10: 'b14',
      11: '14'
    };

    return extension[normalized] ?? String(interval);
  }

  const basic: Record<number, string> = {
    0: '1',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: '#5',
    9: '6',
    10: 'b7',
    11: '7'
  };

  return basic[normalized] ?? String(interval);
}

function functionForDegree(
  degreeIndex: number,
  mode: 'major' | 'minor'
): HarmonicFunction {
  if (mode === 'major') {
    if ([0, 2, 5].includes(degreeIndex)) return 'Tônica';
    if ([1, 3].includes(degreeIndex)) return 'Subdominante';
    if ([4, 6].includes(degreeIndex)) return 'Dominante';
  } else {
    if ([0, 2, 5].includes(degreeIndex)) return 'Tônica';
    if ([1, 3].includes(degreeIndex)) return 'Subdominante';
    if ([4, 6].includes(degreeIndex)) return 'Dominante';
  }

  return 'Cromático';
}

function functionDescription(value: HarmonicFunction) {
  switch (value) {
    case 'Tônica':
      return 'Sensação de repouso, resolução e centro tonal.';
    case 'Subdominante':
      return 'Movimento e preparação; afasta do repouso e conduz a harmonia.';
    case 'Dominante':
      return 'Tensão e direção; cria forte expectativa de resolução.';
    default:
      return 'Acorde fora do campo diatônico; pode funcionar como empréstimo, passagem ou dominante secundária.';
  }
}

function characterForQuality(quality: string) {
  if (quality.includes('dim')) {
    return {
      label: 'Instável',
      stability: 1,
      tension: 5
    };
  }

  if (
    quality === '7' ||
    quality === '9' ||
    quality === '11' ||
    quality === '13' ||
    quality.startsWith('7')
  ) {
    return {
      label: 'Tenso',
      stability: 2,
      tension: 5
    };
  }

  if (quality.includes('minor')) {
    return {
      label: 'Menor',
      stability: 3,
      tension: 2
    };
  }

  if (quality.includes('sus')) {
    return {
      label: 'Suspenso',
      stability: 2,
      tension: 3
    };
  }

  return {
    label: 'Maior',
    stability: 4,
    tension: 1
  };
}

export function buildHarmonicContext(
  chord: string,
  currentKey: string
): HarmonicContext {
  const normalizedChord = normalizeChordForTheory(chord);
  const parsed = parseChordSymbol(normalizedChord);
  const notes = getChordNotes(normalizedChord);
  const intervals = getChordIntervals(normalizedChord);
  const key = parseKey(currentKey);

  const keyPitch = noteToPitchClass(key.root);
  const chordPitch = noteToPitchClass(parsed.root);
  const relativePitch = (chordPitch - keyPitch + 12) % 12;

  const scaleIntervals =
    key.mode === 'major'
      ? MAJOR_INTERVALS
      : MINOR_INTERVALS;

  const scaleQualities =
    key.mode === 'major'
      ? MAJOR_QUALITIES
      : MINOR_QUALITIES;

  const degrees =
    key.mode === 'major'
      ? MAJOR_DEGREES
      : MINOR_DEGREES;

  const degreeIndex = scaleIntervals.findIndex(
    interval => interval === relativePitch
  );

  const harmonicFunction =
    degreeIndex >= 0
      ? functionForDegree(degreeIndex, key.mode)
      : 'Cromático';

  const field = scaleIntervals.map((interval, index) => {
    const root = transposeNote(key.root, interval);
    const quality = scaleQualities[index] ?? '';
    const fieldChord = `${root}${quality}`;

    return {
      degree: degrees[index] ?? String(index + 1),
      chord: fieldChord,
      active: degreeIndex === index
    };
  });

  const substitutions =
    degreeIndex >= 0
      ? field
          .filter((_, index) => {
            if (index === degreeIndex) return false;
            return functionForDegree(index, key.mode) === harmonicFunction;
          })
          .slice(0, 3)
          .map(item => ({
            chord: item.chord,
            reason:
              harmonicFunction === 'Tônica'
                ? 'Mesma família de função tônica'
                : harmonicFunction === 'Subdominante'
                  ? 'Mesma família de preparação'
                  : 'Mesma família de tensão/dominante'
          }))
      : [];

  const character = characterForQuality(parsed.quality);

  return {
    inputChord: chord,
    normalizedChord,
    displayName: chord,
    qualityLabel:
      QUALITY_LABELS[parsed.quality] ??
      parsed.quality,
    notes,
    formula: intervals.map(intervalLabel),
    degree:
      degreeIndex >= 0
        ? degrees[degreeIndex] ?? '—'
        : 'Fora do campo',
    degreeNumber:
      degreeIndex >= 0 ? degreeIndex + 1 : null,
    harmonicFunction,
    functionDescription: functionDescription(harmonicFunction),
    characterLabel: character.label,
    stability: character.stability,
    tension: character.tension,
    keyLabel: `${key.root} ${key.mode === 'major' ? 'maior' : 'menor'}`,
    field,
    substitutions
  };
}
