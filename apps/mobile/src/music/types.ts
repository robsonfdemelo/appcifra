export type SongSearchResult = {
  id: string;
  provider: string;
  externalId?: string;
  title: string;
  artist: string;
  originalKey?: string;
  displayKey?: string;
  capo?: number;
  sourceLabel: string;
  sourceUrl?: string;
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
  availability:
    | 'available'
    | 'unavailable';
  key?: string;
  shapeKey?: string;
  capo?: number;
  tuning?: string;
  chords: string[];
  sections: SongChartSection[];
  sourceLabel?: string;
  sourceUrl?: string;
  message?: string;
};

export type SetlistSong =
  SongSearchResult & {
    setlistItemId: string;
    selectedKey?: string;
    notes?: string;
  };

export type Setlist = {
  id: string;
  name: string;
  createdAt: string;
  songs: SetlistSong[];
};
