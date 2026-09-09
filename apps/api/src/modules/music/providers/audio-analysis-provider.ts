import {
  type AudioAnalysis,
  type SongIdentity
} from '../domain/music.types';

export interface AudioAnalysisProvider {
  readonly name: string;

  analyze(
    song: SongIdentity
  ): Promise<AudioAnalysis | null>;
}
