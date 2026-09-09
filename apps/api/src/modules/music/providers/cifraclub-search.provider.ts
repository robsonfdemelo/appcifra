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

    return !blocked.has(parts[0] ?? '');
  } catch {
    return false;
  }
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

  if (t === q) score += 1200;
  if (combined === q) score += 1000;
  if (t.startsWith(q)) score += 700;
  if (t.includes(q)) score += 550;
  if (combined.includes(q)) score += 350;

  const titleHits =
    qTokens.filter(token =>
      t.includes(token)
    ).length;

  const combinedHits =
    qTokens.filter(token =>
      combined.includes(token)
    ).length;

  score +=
    (titleHits /
      Math.max(1, qTokens.length)) *
    500;

  score +=
    (combinedHits /
      Math.max(1, qTokens.length)) *
    250;

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

    if (normalized.length < 2) {
      return [];
    }

    const searchQuery =
      `site:cifraclub.com.br ${normalized}`;

    const searchUrl =
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

    const response =
      await fetch(searchUrl, {
        headers: {
          Accept:
            'text/html,application/xhtml+xml',
          'Accept-Language':
            'pt-BR,pt;q=0.9,en;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36'
        },
        signal:
          AbortSignal.timeout(10000)
      });

    if (!response.ok) {
      return [];
    }

    const html =
      await response.text();

    const $ =
      cheerio.load(html);

    const links =
      new Set<string>();

    $('a.result__a, a.result-link').each(
      (_, element) => {
        const href =
          $(element).attr('href');

        if (!href) return;

        const decoded =
          decodeDuckDuckGoUrl(href);

        if (isCifraUrl(decoded)) {
          links.add(decoded);
        }
      }
    );

    const urls =
      Array.from(links).slice(0, 10);

    if (!urls.length) {
      return [];
    }

    const settled =
      await Promise.allSettled(
        urls.map(url =>
          this.inspectCandidate(
            query,
            url
          )
        )
      );

    const candidates =
      settled
        .flatMap(result =>
          result.status === 'fulfilled' &&
          result.value
            ? [result.value]
            : []
        )
        .sort(
          (a, b) =>
            b.score - a.score
        )
        .slice(0, 8);

    return candidates.map(
      (candidate, index) => ({
        id:
          `cifraclub:${this.pathId(candidate.url)}`,
        provider: this.name,
        externalId:
          this.pathId(candidate.url),
        title: candidate.title,
        artist: candidate.artist,
        sourceLabel:
          'Cifra Club · uso pessoal',
        sourceUrl: candidate.url,
        ...(index === 0
          ? {}
          : {})
      })
    );
  }

  private async inspectCandidate(
    query: string,
    url: string
  ): Promise<Candidate | null> {
    const response =
      await fetch(url, {
        headers: {
          Accept:
            'text/html,application/xhtml+xml',
          'Accept-Language':
            'pt-BR,pt;q=0.9,en;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36'
        },
        redirect: 'follow',
        signal:
          AbortSignal.timeout(8000)
      });

    if (!response.ok) {
      return null;
    }

    const html =
      await response.text();

    const $ =
      cheerio.load(html);

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

    let title = h1;
    let artist = '';

    const titleMatch =
      pageTitle.match(
        /^(.+?)\s+-\s+(.+?)\s+-\s+Cifra Club/i
      );

    if (titleMatch) {
      title =
        titleMatch[1]?.trim() ||
        title;

      artist =
        titleMatch[2]?.trim() ||
        '';
    }

    if (!title) {
      return null;
    }

    if (!artist) {
      const canonicalParts =
        new URL(url)
          .pathname
          .split('/')
          .filter(Boolean);

      artist =
        canonicalParts[0]
          ?.replace(/-/g, ' ') ??
        'Artista não informado';
    }

    return {
      url:
        response.url || url,
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

  private pathId(url: string) {
    try {
      return new URL(url)
        .pathname
        .split('/')
        .filter(Boolean)
        .join(':');
    } catch {
      return url;
    }
  }
}
