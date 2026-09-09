import { Injectable } from '@nestjs/common';

import {
  type AudioAnalysisProvider
} from './audio-analysis-provider';
import {
  type AudioAnalysis,
  type SongIdentity
} from '../domain/music.types';

@Injectable()
export class NoAudioAnalysisProvider
  implements AudioAnalysisProvider
{
  readonly name =
    'audio-analysis-unconfigured';

  async analyze(
    _song: SongIdentity
  ): Promise<AudioAnalysis | null> {
    return null;
  }
}
