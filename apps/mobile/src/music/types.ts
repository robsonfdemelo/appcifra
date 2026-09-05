export type SongSearchResult = {
  id: string;
  title: string;
  artist: string;
  originalKey?: string;
  displayKey?: string;
  capo?: number;
  sourceLabel: string;
  sourceUrl?: string;
  provider: 'curated' | 'musicbrainz';
};

export type SetlistSong = SongSearchResult & {
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
