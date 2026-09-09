import {
  apiGet
} from '../api/apiClient';

import {
  type SongChart,
  type SongSearchResult
} from './types';

export async function loadSongChart(
  song: SongSearchResult
): Promise<SongChart> {
  const params =
    new URLSearchParams({
      title: song.title,
      artist: song.artist,
      provider: song.provider,
      ...(song.externalId
        ? {
            externalId:
              song.externalId
          }
        : {}),
      ...(song.sourceUrl
        ? {
            sourceUrl:
              song.sourceUrl
          }
        : {})
    });

  return apiGet<SongChart>(
    `/api/music/songs/${encodeURIComponent(song.id)}/chart?${params.toString()}`
  );
}
