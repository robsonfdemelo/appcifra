import {
  apiGet
} from '../api/apiClient';
import {
  type SongSearchResult
} from './types';

type MusicSearchResponse = {
  items: SongSearchResult[];
  query: string;
  providerCount: number;
};

export async function searchSongs(
  query: string
): Promise<SongSearchResult[]> {
  const normalized = query.trim();

  if (normalized.length < 2) {
    return [];
  }

  const response =
    await apiGet<MusicSearchResponse>(
      `/api/music/search?q=${encodeURIComponent(normalized)}`
    );

  return response.items;
}

export function getInitialSongs():
  SongSearchResult[] {
  return [];
}

export function getExternalCifraSearchUrl(
  song: SongSearchResult
) {
  if (song.sourceUrl) {
    return song.sourceUrl;
  }

  const query =
    `${song.title} ${song.artist} cifra`;

  return (
    'https://www.google.com/search?q=' +
    encodeURIComponent(query)
  );
}
