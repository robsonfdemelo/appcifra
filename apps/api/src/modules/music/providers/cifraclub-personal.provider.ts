import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import {
  type SongChart,
  type SongChartLine,
  type SongChartSection,
  type SongIdentity
} from '../domain/music.types';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeLine(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+$/g, '');
}

const CHORD_TOKEN =
  /^[A-G](?:#|b)?(?:m|M|maj|min|dim|aug|sus|add)?(?:\d+|7M)?(?:\([^)]+\))?(?:\/[A-G](?:#|b)?)?[*+°]?$/;

function isChordToken(value: string) {
  return CHORD_TOKEN.test(
    value.trim()
  );
}

function extractChordTokens(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map(token =>
      token
        .replace(/[|,:;]+$/g, '')
        .trim()
    )
    .filter(isChordToken);
}

function isChordOnlyLine(value: string) {
  const trimmed =
    value.trim();

  if (!trimmed) return false;

  if (
    /^(E|A|D|G|B|e)\|/.test(
      trimmed
    )
  ) {
    return false;
  }

  const tokens =
    trimmed.split(/\s+/);

  const chordTokens =
    extractChordTokens(trimmed);

  return (
    chordTokens.length > 0 &&
    chordTokens.length ===
      tokens.length
  );
}

function unique(values: string[]) {
  return Array.from(
    new Set(
      values.filter(Boolean)
    )
  );
}

@Injectable()
export class CifraClubPersonalProvider {
  readonly name =
    'cifraclub-personal';

  async getChart(
    song: SongIdentity
  ): Promise<SongChart | null> {
    const sourceUrl =
      song.sourceUrl &&
      this.isAllowedUrl(
        song.sourceUrl
      )
        ? song.sourceUrl
        : this.buildUrl(song);

    if (!sourceUrl) {
      return null;
    }

    const response =
      await fetch(sourceUrl, {
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
          AbortSignal.timeout(10000)
      });

    if (!response.ok) {
      return null;
    }

    const html =
      await response.text();

    const $ =
      cheerio.load(html);

    const pageTitle =
      $('h1')
        .first()
        .text()
        .trim();

    if (!pageTitle) {
      return null;
    }

    const pre =
      $('.cifra_cnt pre')
        .first()
        .length
        ? $('.cifra_cnt pre')
            .first()
        : $('pre').first();

    if (!pre.length) {
      return null;
    }

    const raw =
      pre.text();

    if (!raw.trim()) {
      return null;
    }

    const pageText =
      $('body')
        .text()
        .replace(/\s+/g, ' ');

    const key =
      this.extractKey(pageText);

    const shapeKey =
      this.extractShapeKey(
        pageText
      );

    const capo =
      this.extractCapo(pageText);

    const {
      chords,
      sections
    } = this.parseChart(raw);

    if (!sections.length) {
      return null;
    }

    return {
      songId: song.id,
      availability: 'available',
      ...(key
        ? { key }
        : {}),
      ...(shapeKey
        ? { shapeKey }
        : {}),
      ...(capo !== null
        ? { capo }
        : {}),
      chords,
      sections,
      sourceLabel:
        'Cifra Club · uso pessoal',
      sourceUrl:
        response.url ||
        sourceUrl,
      message:
        'Conteúdo carregado dinamicamente da fonte pessoal configurada.'
    };
  }

  private buildUrl(
    song: SongIdentity
  ) {
    const artistSlug =
      slugify(song.artist);

    const songSlug =
      slugify(song.title);

    if (
      !artistSlug ||
      !songSlug
    ) {
      return null;
    }

    return (
      'https://www.cifraclub.com.br/' +
      `${artistSlug}/${songSlug}/`
    );
  }

  private isAllowedUrl(
    value: string
  ) {
    try {
      const url =
        new URL(value);

      return (
        url.hostname ===
          'www.cifraclub.com.br' ||
        url.hostname ===
          'cifraclub.com.br'
      );
    } catch {
      return false;
    }
  }

  private extractKey(
    text: string
  ) {
    const match =
      text.match(
        /Tom:\s*([A-G](?:#|b)?m?)/i
      );

    return match?.[1] ?? null;
  }

  private extractShapeKey(
    text: string
  ) {
    const match =
      text.match(
        /com forma de\s+([A-G](?:#|b)?m?)/i
      );

    return match?.[1] ?? null;
  }

  private extractCapo(
    text: string
  ) {
    const match =
      text.match(
        /Capotraste:\s*(\d+)\s*[ªa]?\s*casa/i
      );

    if (!match?.[1]) {
      return null;
    }

    const value =
      Number(match[1]);

    return Number.isFinite(
      value
    )
      ? value
      : null;
  }

  private parseChart(
    raw: string
  ): {
    chords: string[];
    sections:
      SongChartSection[];
  } {
    const lines =
      raw
        .split('\n')
        .map(normalizeLine);

    const sections:
      SongChartSection[] = [];

    const allChords:
      string[] = [];

    let current:
      SongChartSection = {
        title: 'Cifra',
        lines: []
      };

    let pendingChord:
      string | null = null;

    const pushCurrent = () => {
      if (
        current.lines.length ||
        current.introChords
          ?.length
      ) {
        sections.push(
          current
        );
      }
    };

    for (
      const rawLine of lines
    ) {
      const line =
        rawLine.trimEnd();

      const trimmed =
        line.trim();

      if (!trimmed) {
        continue;
      }

      const sectionMatch =
        trimmed.match(
          /^\[([^\]]+)\]\s*(.*)$/
        );

      if (sectionMatch) {
        pushCurrent();

        const title =
          sectionMatch[1]
            ?.trim() ||
          'Parte';

        const tail =
          sectionMatch[2]
            ?.trim() ??
          '';

        const introChords =
          isChordOnlyLine(tail)
            ? extractChordTokens(
                tail
              )
            : [];

        allChords.push(
          ...introChords
        );

        current = {
          title,
          lines: [],
          ...(introChords.length
            ? {
                introChords
              }
            : {})
        };

        pendingChord = null;
        continue;
      }

      if (
        isChordOnlyLine(
          trimmed
        )
      ) {
        if (pendingChord) {
          current.lines.push({
            chord:
              pendingChord,
            text: ''
          });
        }

        pendingChord =
          trimmed;

        allChords.push(
          ...extractChordTokens(
            trimmed
          )
        );

        continue;
      }

      const lineItem:
        SongChartLine = {
          text: line
        };

      if (pendingChord) {
        lineItem.chord =
          pendingChord;

        pendingChord =
          null;
      }

      current.lines.push(
        lineItem
      );
    }

    if (pendingChord) {
      current.lines.push({
        chord: pendingChord,
        text: ''
      });
    }

    pushCurrent();

    return {
      chords:
        unique(allChords),
      sections
    };
  }
}
