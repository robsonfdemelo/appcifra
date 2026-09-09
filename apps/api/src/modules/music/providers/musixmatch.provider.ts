import { Injectable } from '@nestjs/common';

import {
  type LyricsProvider
} from './lyrics-provider';
import {
  type SongIdentity,
  type SongLyrics
} from '../domain/music.types';

type MusixmatchLyricsResponse = {
  message?: {
    header?: {
      status_code?: number;
    };
    body?: {
      lyrics?: {
        lyrics_body?: string;
        lyrics_copyright?: string;
      };
    };
  };
};

@Injectable()
export class MusixmatchProvider
  implements LyricsProvider
{
  readonly name = 'musixmatch';

  async getLyrics(
    song: SongIdentity
  ): Promise<SongLyrics | null> {
    const apiKey =
      process.env.MUSIXMATCH_API_KEY?.trim();

    if (!apiKey) {
      return null;
    }

    const params = new URLSearchParams({
      q_track: song.title,
      q_artist: song.artist,
      apikey: apiKey
    });

    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      return null;
    }

    const body =
      (await response.json()) as MusixmatchLyricsResponse;

    const statusCode =
      body.message?.header?.status_code;

    if (
      statusCode &&
      statusCode !== 200
    ) {
      return null;
    }

    const lyrics =
      body.message?.body?.lyrics;

    const text =
      lyrics?.lyrics_body?.trim();

    if (!text) {
      return null;
    }

    const lines =
      text
        .replace(
          '******* This Lyrics is NOT for Commercial use *******',
          ''
        )
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => ({ text: line }));

    if (!lines.length) {
      return null;
    }

    return {
      songId: song.id,
      lines,
      sourceLabel: 'Musixmatch',
      sourceUrl:
        'https://www.musixmatch.com/',
      ...(lyrics?.lyrics_copyright
        ? {
            copyright:
              lyrics.lyrics_copyright
          }
        : {})
    };
  }
}
