import {
  type SongIdentity,
  type SongLyrics
} from '../domain/music.types';

export interface LyricsProvider {
  readonly name: string;

  getLyrics(
    song: SongIdentity
  ): Promise<SongLyrics | null>;
}
