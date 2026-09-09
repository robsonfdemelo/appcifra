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
    cifraClubSearchProvider:
      CifraClubSearchProvider,
    musicBrainzProvider:
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

    const settled =
      await Promise.allSettled(
        this.searchProviders.map(
          provider =>
            provider.search(
              normalized
            )
        )
      );

    const providerItems =
      settled.map(result =>
        result.status ===
        'fulfilled'
          ? result.value
          : []
      );

    const cifraClubItems =
      providerItems[0] ?? [];

    const musicBrainzItems =
      providerItems[1] ?? [];

    return {
      query: normalized,
      providerCount:
        this.searchProviders.length,
      items:
        this.dedupe([
          ...cifraClubItems,
          ...musicBrainzItems
        ]).slice(0, 20)
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
    } catch {
      // retorno seguro abaixo
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
