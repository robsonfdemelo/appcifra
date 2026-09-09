import { Module } from '@nestjs/common';

import {
  MusicController
} from './controllers/music.controller';
import {
  CifraClubPersonalProvider
} from './providers/cifraclub-personal.provider';
import {
  CifraClubSearchProvider
} from './providers/cifraclub-search.provider';
import {
  MusicBrainzProvider
} from './providers/musicbrainz.provider';
import {
  MusicService
} from './services/music.service';

@Module({
  controllers: [
    MusicController
  ],
  providers: [
    MusicService,
    CifraClubSearchProvider,
    CifraClubPersonalProvider,
    MusicBrainzProvider
  ]
})
export class MusicModule {}
