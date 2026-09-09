import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query
} from '@nestjs/common';

import {
  MusicService
} from '../services/music.service';

@Controller('music')
export class MusicController {
  constructor(
    private readonly musicService:
      MusicService
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service:
        'app-cifra-api'
    };
  }

  @Get('search')
  async search(
    @Query('q')
    query = ''
  ) {
    const normalized =
      query.trim();

    if (
      normalized.length < 2
    ) {
      throw new BadRequestException(
        'Informe pelo menos 2 caracteres para pesquisar.'
      );
    }

    return this.musicService.search(
      normalized
    );
  }

  @Get('songs/:songId/chart')
  getChart(
    @Param('songId')
    songId: string,
    @Query('title')
    title = '',
    @Query('artist')
    artist = '',
    @Query('provider')
    provider = '',
    @Query('externalId')
    externalId = '',
    @Query('sourceUrl')
    sourceUrl = ''
  ) {
    if (
      !title.trim() ||
      !artist.trim()
    ) {
      throw new BadRequestException(
        'title e artist são obrigatórios para carregar conteúdo musical.'
      );
    }

    return this.musicService.getChart({
      id: songId,
      title:
        title.trim(),
      artist:
        artist.trim(),
      ...(provider.trim()
        ? {
            provider:
              provider.trim()
          }
        : {}),
      ...(externalId.trim()
        ? {
            externalId:
              externalId.trim()
          }
        : {}),
      ...(sourceUrl.trim()
        ? {
            sourceUrl:
              sourceUrl.trim()
          }
        : {})
    });
  }
}
