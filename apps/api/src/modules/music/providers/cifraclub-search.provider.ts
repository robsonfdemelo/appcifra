import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import {
  type SongSearchResult
} from '../domain/music.types';
import {
  type MusicSearchProvider
} from './music-search-provider';

type Candidate = {
  url: string;
  title: string;
  artist: string;
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

function decodeDuckDuckGoUrl(href: string) {
  try {
    const url = new URL(
      href,
      'https://html.duckduckgo.com'
    );

    const uddg =
      url.searchParams.get('uddg');

    if (uddg) {
      return decodeURIComponent(uddg);
    }

    return url.toString();
  } catch {
    return href;
  }
}

function isCifraUrl(value: string) {
  try {
    const url = new URL(value);

    if (
      url.hostname !== 'www.cifraclub.com.br' &&
      url.hostname !== 'cifraclub.com.br'
    ) {
      return false;
    }

    const parts =
      url.pathname
        .split('/')
        .filter(Boolean);

    if (parts.length !== 2) {
      return false;
    }

    const blocked = new Set([
      'estilos',
      'listas',
      'academy',
      'forum',
      'noticias',
      'blog'
    ]);

    return !blocked.has(
      parts[0] ?? ''
    );
  } catch {
    return false;
  }
}

function tokenCoverage(
  queryTokens: string[],
  candidate: string
) {
  if (!queryTokens.length) {
    return 0;
  }

  const normalizedCandidate =
    normalize(candidate);

  const hits =
    queryTokens.filter(
      token =>
        normalizedCandidate.includes(
          token
        )
    ).length;

  return hits /
    queryTokens.length;
}

function scoreCandidate(
  query: string,
  title: string,
  artist: string
) {
  const q = normalize(query);
  const t = normalize(title);
  const a = normalize(artist);
  const combined = `${t} ${a}`;
  const qTokens = tokens(query);

  let score = 0;

  if (t === q) score += 1800;
  if (combined === q) score += 1500;
  if (t.startsWith(q)) score += 800;
  if (t.includes(q)) score += 650;
  if (combined.includes(q)) score += 400;

  score +=
    tokenCoverage(
      qTokens,
      t
    ) * 600;

  score +=
    tokenCoverage(
      qTokens,
      a
    ) * 220;

  score +=
    tokenCoverage(
      qTokens,
      combined
    ) * 260;

  if (
    /\b(ao vivo|live|cover|karaoke|playback|tributo|remix)\b/i.test(
      `${title} ${artist}`
    )
  ) {
    score -= 40;
  }

  return score;
}

@Injectable()
export class CifraClubSearchProvider
  implements MusicSearchProvider
{
  readonly name =
    'cifraclub-personal';

  async search(
    query: string
  ): Promise<SongSearchResult[]> {
    const normalized =
      query.trim();

    if (
      normalized.length < 2
    ) {
      return [];
    }

    const urls =
      await this.discoverUrls(
        normalized
      );

    if (!urls.length) {
      console.warn(
        '[CifraClubSearch] nenhum link de cifra encontrado para:',
        normalized
      );

      return [];
    }

    const settled =
      await Promise.allSettled(
        urls.map(url =>
          this.inspectCandidate(
            normalized,
            url
          )
        )
      );

    const candidates =
      settled
        .flatMap(result =>
          result.status ===
            'fulfilled' &&
          result.value
            ? [result.value]
            : []
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        )
        .slice(0, 20);

    console.log(
      `[CifraClubSearch] ${candidates.length} cifra(s) válida(s) para "${normalized}"`
    );

    return candidates.map(
      candidate => ({
        id:
          `cifraclub:${this.pathId(candidate.url)}`,
        provider:
          this.name,
        externalId:
          this.pathId(candidate.url),
        title:
          candidate.title,
        artist:
          candidate.artist,
        sourceLabel:
          'Cifra Club · uso pessoal',
        sourceUrl:
          candidate.url
      })
    );
  }

  private async discoverUrls(
    query: string
  ) {
    const searchQueries = [
      `site:cifraclub.com.br "${query}" cifra`,
      `site:cifraclub.com.br ${query}`
    ];

    const discovered =
      new Set<string>();

    for (
      const searchQuery of searchQueries
    ) {
      try {
        const searchUrl =
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

        const response =
          await fetch(
            searchUrl,
            {
              headers: {
                Accept:
                  'text/html,application/xhtml+xml',
                'Accept-Language':
                  'pt-BR,pt;q=0.9,en;q=0.8',
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36'
              },
              signal:
                AbortSignal.timeout(
                  10000
                )
            }
          );

        if (!response.ok) {
          console.warn(
            '[CifraClubSearch] busca externa respondeu:',
            response.status
          );

          continue;
        }

        const html =
          await response.text();

        const $ =
          cheerio.load(html);

        $('a').each(
          (_, element) => {
            const href =
              $(element)
                .attr('href');

            if (!href) {
              return;
            }

            const decoded =
              decodeDuckDuckGoUrl(
                href
              );

            if (
              isCifraUrl(decoded)
            ) {
              discovered.add(
                decoded
              );
            }
          }
        );
      } catch (error) {
        console.warn(
          '[CifraClubSearch] falha ao descobrir links:',
          error
        );
      }

      if (
        discovered.size >=
        20
      ) {
        break;
      }
    }

    return Array.from(
      discovered
    ).slice(0, 20);
  }

  private async inspectCandidate(
    query: string,
    url: string
  ): Promise<Candidate | null> {
    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              'text/html,application/xhtml+xml',
            'Accept-Language':
              'pt-BR,pt;q=0.9,en;q=0.8',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36'
          },
          redirect:
            'follow',
          signal:
            AbortSignal.timeout(
              8000
            )
        }
      );

    if (!response.ok) {
      return null;
    }

    const html =
      await response.text();

    const $ =
      cheerio.load(html);

    const chartElement =
      $('.cifra_cnt pre')
        .first()
        .length
        ? $('.cifra_cnt pre')
            .first()
        : $('pre').first();

    const chartText =
      chartElement
        .text()
        .trim();

    if (
      !chartElement.length ||
      chartText.length < 20
    ) {
      return null;
    }

    const h1 =
      $('h1')
        .first()
        .text()
        .trim();

    const pageTitle =
      $('title')
        .first()
        .text()
        .trim();

    const ogTitle =
      $('meta[property="og:title"]')
        .attr('content')
        ?.trim() ??
      '';

    let title =
      h1;

    let artist =
      '';

    const candidateTitles = [
      pageTitle,
      ogTitle
    ];

    for (
      const value of candidateTitles
    ) {
      if (!value) {
        continue;
      }

      const match =
        value.match(
          /^(.+?)\s+-\s+(.+?)(?:\s+-\s+Cifra Club|\s+\|\s+Cifra Club|\s+\(Cifra Club\)|$)/i
        );

      if (
        match?.[1] &&
        match?.[2]
      ) {
        title =
          match[1].trim();

        artist =
          match[2].trim();

        break;
      }
    }

    if (!title) {
      return null;
    }

    if (!artist) {
      const canonicalParts =
        new URL(
          response.url ||
            url
        )
          .pathname
          .split('/')
          .filter(Boolean);

      artist =
        canonicalParts[0]
          ?.replace(
            /-/g,
            ' '
          ) ??
        'Artista não informado';
    }

    return {
      url:
        response.url ||
        url,
      title,
      artist,
      score:
        scoreCandidate(
          query,
          title,
          artist
        )
    };
  }

  private pathId(
    url: string
  ) {
    try {
      return new URL(
        url
      )
        .pathname
        .split('/')
        .filter(Boolean)
        .join(':');
    } catch {
      return url;
    }
  }
}
