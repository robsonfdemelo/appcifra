import { Injectable } from '@nestjs/common';

import {
  type MusicSearchProvider
} from './music-search-provider';
import {
  type SongSearchResult
} from '../domain/music.types';

type MusicBrainzRecording = {
  id: string;
  title: string;
  score?: number;
  'artist-credit'?: Array<{
    name?: string;
    artist?: {
      name?: string;
    };
  }>;
};

type MusicBrainzResponse = {
  recordings?: MusicBrainzRecording[];
};

type CacheEntry = {
  expiresAt: number;
  items: SongSearchResult[];
};

type RankedSong = {
  item: SongSearchResult;
  score: number;
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(' ')
    .filter(Boolean);
}

function tokenCoverage(
  queryTokens: string[],
  candidate: string
) {
  if (!queryTokens.length) return 0;

  const normalizedCandidate =
    normalize(candidate);

  const hits = queryTokens.filter(
    token =>
      normalizedCandidate.includes(token)
  ).length;

  return hits / queryTokens.length;
}

function scoreSong(
  query: string,
  item: SongSearchResult,
  providerScore = 0
) {
  const q = normalize(query);
  const title = normalize(item.title);
  const artist = normalize(item.artist);
  const combined = `${title} ${artist}`;
  const queryTokens = tokens(query);

  let score = 0;

  if (title === q) score += 1000;
  if (combined === q) score += 900;

  if (title.startsWith(q)) score += 650;
  if (title.includes(q)) score += 500;
  if (artist === q) score += 350;
  if (artist.includes(q)) score += 220;

  score +=
    tokenCoverage(queryTokens, title) * 450;

  score +=
    tokenCoverage(queryTokens, artist) * 180;

  score +=
    tokenCoverage(queryTokens, combined) * 200;

  score +=
    Math.min(100, providerScore);

  const livePenalty =
    /\b(live|ao vivo|remaster|karaoke|tribute|cover)\b/i.test(
      `${item.title} ${item.artist}`
    )
      ? -25
      : 0;

  return score + livePenalty;
}

@Injectable()
export class MusicBrainzProvider
  implements MusicSearchProvider
{
  readonly name = 'musicbrainz';

  private readonly cache =
    new Map<string, CacheEntry>();

  async search(
    query: string
  ): Promise<SongSearchResult[]> {
    const normalized = query.trim();

    if (normalized.length < 2) {
      return [];
    }

    const cacheKey =
      normalize(normalized);

    const cached =
      this.cache.get(cacheKey);

    if (
      cached &&
      cached.expiresAt > Date.now()
    ) {
      return cached.items;
    }

    const searchUrl =
      `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(normalized)}&fmt=json&limit=50`;

    const response = await fetch(
      searchUrl,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'App-Cifra/0.1 (https://github.com/robsonfdemelo/appcifra)'
        },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      throw new Error(
        `MusicBrainz respondeu ${response.status}`
      );
    }

    const body =
      (await response.json()) as MusicBrainzResponse;

    const ranked = (body.recordings ?? [])
      .map(recording =>
        this.toRankedSong(
          normalized,
          recording
        )
      )
      .filter(
        (
          value
        ): value is RankedSong =>
          Boolean(value)
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 20)
      .map(value => value.item);

    this.cache.set(cacheKey, {
      expiresAt:
        Date.now() + 5 * 60 * 1000,
      items: ranked
    });

    return ranked;
  }

  private toRankedSong(
    query: string,
    recording: MusicBrainzRecording
  ): RankedSong | null {
    const title =
      recording.title?.trim();

    const artist =
      recording['artist-credit']?.[0]
        ?.name ??
      recording['artist-credit']?.[0]
        ?.artist?.name;

    if (!title || !artist) {
      return null;
    }

    const item: SongSearchResult = {
      id: `musicbrainz:${recording.id}`,
      provider: this.name,
      externalId: recording.id,
      title,
      artist,
      sourceLabel: 'MusicBrainz',
      sourceUrl:
        `https://musicbrainz.org/recording/${recording.id}`
    };

    return {
      item,
      score: scoreSong(
        query,
        item,
        recording.score ?? 0
      )
    };
  }
}
