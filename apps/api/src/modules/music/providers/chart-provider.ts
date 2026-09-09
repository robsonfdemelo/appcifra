import {
  type SongChart,
  type SongIdentity
} from '../domain/music.types';

export interface ChartProvider {
  readonly name: string;

  getChart(
    song: SongIdentity
  ): Promise<SongChart | null>;
}
