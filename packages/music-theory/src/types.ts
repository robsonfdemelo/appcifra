export type NoteName =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export type ChordQuality =
  | 'major'
  | 'minor'
  | '5'
  | '6'
  | 'minor6'
  | '7'
  | 'maj7'
  | 'minor7'
  | 'minorMaj7'
  | 'dim'
  | 'dim7'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | 'minorAdd9'
  | '9'
  | 'maj9'
  | 'minor9'
  | '11'
  | '13'
  | 'minor7b5'
  | '7sus4'
  | '7b5'
  | '7sharp5'
  | '7b9'
  | '7sharp9';

export interface ParsedChord {
  symbol: string;
  root: NoteName;
  quality: ChordQuality;
  suffix: string;
  bass?: NoteName;
}

export interface InstrumentTuning {
  id: string;
  name: string;
  instrument: 'guitar' | 'bass' | 'ukulele' | 'cavaquinho';
  strings: NoteName[];
}

export interface ChordVoicing {
  chord: string;
  tuningId: string;
  frets: number[];
  firstFret: number;
  fretSpan: number;
  openStrings: number;
  mutedStrings: number;
  difficulty: number;
  fingers?: number[];
}

export interface GenerateVoicingsOptions {
  chord: string;
  tuning?: InstrumentTuning;
  maxFret?: number;
  maxSpan?: number;
  limit?: number;
  minStrings?: number;
}
