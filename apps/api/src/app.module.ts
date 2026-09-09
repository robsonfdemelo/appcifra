import { Module } from '@nestjs/common';
import { MusicModule } from './modules/music/music.module';

@Module({
  imports: [MusicModule]
})
export class AppModule {}
