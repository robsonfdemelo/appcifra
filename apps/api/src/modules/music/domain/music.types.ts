export type SongSearchResult = {
  id: string;
  provider: string;
  externalId: string;
  title: string;
  artist: string;
  sourceLabel: string;
  sourceUrl?: string;
  originalKey?: string;
  displayKey?: string;
  capo?: number;
};

export type SongIdentity = {
  id: string;
  title: string;
  artist: string;
  provider?: string;
  externalId?: string;
  sourceUrl?: string;
};

export type SongLyricLine = {
  text: string;
};

export type SongLyrics = {
  songId: string;
  lines: SongLyricLine[];
  sourceLabel: string;
  sourceUrl?: string;
  copyright?: string;
};

export type ChordTimelineItem = {
  startMs: number;
  endMs?: number;
  chord: string;
  confidence?: number;
};

export type AudioAnalysis = {
  songId: string;
  key?: string;
  bpm?: number;
  timeSignature?: string;
  chordTimeline: ChordTimelineItem[];
  sourceLabel: string;
};

export type SongChartLine = {
  chord?: string;
  text: string;
};

export type SongChartSection = {
  title: string;
  introChords?: string[];
  lines: SongChartLine[];
};

export type SongChart = {
  songId: string;
  availability: 'available' | 'partial' | 'unavailable';
  key?: string;
  shapeKey?: string;
  capo?: number;
  tuning?: string;
  bpm?: number;
  timeSignature?: string;
  chords: string[];
  sections: SongChartSection[];
  sourceLabel?: string;
  sourceUrl?: string;
  message?: string;
};

export type MusicSearchPage = {
  items: SongSearchResult[];
  query: string;
  providerCount: number;
};
