import { Injectable } from '@nestjs/common';

import {
  type MusicSearchProvider
} from '../providers/music-search-provider';
import {
  type MusicSearchPage,
  type SongChart,
  type SongIdentity,
  type SongSearchResult
} from '../domain/music.types';

import {
  CifraClubPersonalProvider
} from '../providers/cifraclub-personal.provider';
import {
  CifraClubSearchProvider
} from '../providers/cifraclub-search.provider';
import {
  MusicBrainzProvider
} from '../providers/musicbrainz.provider';

@Injectable()
export class MusicService {
  private readonly searchProviders:
    MusicSearchProvider[];

  constructor(
    private readonly cifraClubSearchProvider:
      CifraClubSearchProvider,
    private readonly musicBrainzProvider:
      MusicBrainzProvider,
    private readonly cifraClubPersonalProvider:
      CifraClubPersonalProvider
  ) {
    this.searchProviders = [
      cifraClubSearchProvider,
      musicBrainzProvider
    ];
  }

  async search(
    query: string
  ): Promise<MusicSearchPage> {
    const normalized =
      query.trim();

    if (
      normalized.length < 2
    ) {
      return {
        items: [],
        query: normalized,
        providerCount:
          this.searchProviders.length
      };
    }

    let cifraClubItems:
      SongSearchResult[] = [];

    try {
      cifraClubItems =
        await this.cifraClubSearchProvider.search(
          normalized
        );
    } catch (error) {
      console.warn(
        '[MusicService] Cifra Club search failed:',
        error
      );
    }

    if (
      cifraClubItems.length > 0
    ) {
      return {
        query: normalized,
        providerCount:
          this.searchProviders.length,
        items:
          this.dedupe(
            cifraClubItems
          ).slice(0, 20)
      };
    }

    let musicBrainzItems:
      SongSearchResult[] = [];

    try {
      musicBrainzItems =
        await this.musicBrainzProvider.search(
          normalized
        );
    } catch (error) {
      console.warn(
        '[MusicService] MusicBrainz fallback failed:',
        error
      );
    }

    return {
      query: normalized,
      providerCount:
        this.searchProviders.length,
      items:
        this.dedupe(
          musicBrainzItems
        ).slice(0, 20)
    };
  }

  async getChart(
    song: SongIdentity
  ): Promise<SongChart> {
    try {
      const chart =
        await this.cifraClubPersonalProvider.getChart(
          song
        );

      if (chart) {
        return chart;
      }
    } catch (error) {
      console.warn(
        '[MusicService] Chart load failed:',
        error
      );
    }

    return {
      songId: song.id,
      availability:
        'unavailable',
      chords: [],
      sections: [],
      message:
        'A música foi encontrada, mas não foi possível carregar a cifra da fonte pessoal.'
    };
  }

  private dedupe(
    items:
      SongSearchResult[]
  ) {
    const map =
      new Map<
        string,
        SongSearchResult
      >();

    for (const item of items) {
      const key =
        `${item.title}|${item.artist}`
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            ''
          )
          .toLocaleLowerCase(
            'pt-BR'
          );

      const existing =
        map.get(key);

      if (!existing) {
        map.set(key, item);
        continue;
      }

      if (
        item.provider ===
          'cifraclub-personal' &&
        existing.provider !==
          'cifraclub-personal'
      ) {
        map.set(key, item);
      }
    }

    return Array.from(
      map.values()
    );
  }
}
