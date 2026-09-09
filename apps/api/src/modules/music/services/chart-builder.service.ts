import { Injectable } from '@nestjs/common';

import {
  type AudioAnalysis,
  type SongChart,
  type SongChartLine,
  type SongIdentity,
  type SongLyrics
} from '../domain/music.types';

@Injectable()
export class ChartBuilderService {
  build(
    song: SongIdentity,
    lyrics: SongLyrics | null,
    analysis: AudioAnalysis | null
  ): SongChart {
    if (!lyrics && !analysis) {
      return {
        songId: song.id,
        availability: 'unavailable',
        chords: [],
        sections: [],
        message:
          'A música foi encontrada, mas ainda não existe letra autorizada nem análise de áudio disponível para este item.'
      };
    }

    const chords = this.uniqueChords(
      analysis?.chordTimeline.map(
        item => item.chord
      ) ?? []
    );

    if (lyrics && !analysis) {
      return {
        songId: song.id,
        availability: 'partial',
        chords: [],
        sections: [
          {
            title: 'Letra',
            lines: lyrics.lines.map(line => ({
              text: line.text
            }))
          }
        ],
        sourceLabel: lyrics.sourceLabel,
        ...(lyrics.sourceUrl
          ? {
              sourceUrl: lyrics.sourceUrl
            }
          : {}),
        message:
          'Letra disponível. A análise de tom, BPM e acordes ainda não está configurada.'
      };
    }

    if (!lyrics && analysis) {
      return {
        songId: song.id,
        availability: 'partial',
        chords,
        sections: [],
        sourceLabel: analysis.sourceLabel,
        ...(analysis.key
          ? {
              key: analysis.key
            }
          : {}),
        ...(analysis.bpm !== undefined
          ? {
              bpm: analysis.bpm
            }
          : {}),
        ...(analysis.timeSignature
          ? {
              timeSignature:
                analysis.timeSignature
            }
          : {}),
        message:
          'Análise musical disponível, mas não há letra autorizada para montar a cifra completa.'
      };
    }

    const resolvedLyrics = lyrics!;
    const resolvedAnalysis = analysis!;

    return {
      songId: song.id,
      availability: 'partial',
      chords,
      sections: [
        {
          title: 'Letra',
          lines: this.attachApproximateChords(
            resolvedLyrics,
            resolvedAnalysis
          )
        }
      ],
      sourceLabel:
        `${resolvedLyrics.sourceLabel} + ${resolvedAnalysis.sourceLabel}`,
      ...(resolvedLyrics.sourceUrl
        ? {
            sourceUrl:
              resolvedLyrics.sourceUrl
          }
        : {}),
      ...(resolvedAnalysis.key
        ? {
            key: resolvedAnalysis.key
          }
        : {}),
      ...(resolvedAnalysis.bpm !== undefined
        ? {
            bpm: resolvedAnalysis.bpm
          }
        : {}),
      ...(resolvedAnalysis.timeSignature
        ? {
            timeSignature:
              resolvedAnalysis.timeSignature
          }
        : {}),
      message:
        'Letra e análise disponíveis. O alinhamento acorde/letra é aproximado até o motor de sincronização por áudio estar habilitado.'
    };
  }

  private uniqueChords(
    chords: string[]
  ) {
    return Array.from(
      new Set(
        chords.filter(Boolean)
      )
    );
  }

  private attachApproximateChords(
    lyrics: SongLyrics,
    analysis: AudioAnalysis
  ): SongChartLine[] {
    const lines = lyrics.lines;

    if (
      !lines.length ||
      !analysis.chordTimeline.length
    ) {
      return lines.map(line => ({
        text: line.text
      }));
    }

    return lines.map(
      (line, index) => {
        const chordIndex =
          Math.floor(
            (index /
              Math.max(
                1,
                lines.length
              )) *
              analysis.chordTimeline.length
          );

        const item =
          analysis.chordTimeline[
            Math.min(
              analysis.chordTimeline.length -
                1,
              chordIndex
            )
          ];

        return {
          ...(item?.chord
            ? {
                chord:
                  item.chord
              }
            : {}),
          text: line.text
        };
      }
    );
  }
}
