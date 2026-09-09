import { type SongSearchResult } from '../domain/music.types';

export interface MusicSearchProvider {
  readonly name: string;

  search(
    query: string
  ): Promise<SongSearchResult[]>;
}
