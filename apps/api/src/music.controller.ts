import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { generateVoicings, getChordNotes, parseChordSymbol, transposeChord } from '@app-cifra/music-theory';

@Controller('music')
export class MusicController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'app-cifra-api'
    };
  }

  @Get('chord')
  chord(@Query('symbol') symbol = 'C') {
    try {
      const chord = parseChordSymbol(symbol);

      return {
        chord,
        notes: getChordNotes(chord.symbol),
        voicings: generateVoicings({ chord: chord.symbol, limit: 12 })
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Acorde inválido');
    }
  }

  @Get('transpose')
  transpose(@Query('symbol') symbol = 'C', @Query('semitones') rawSemitones = '0') {
    const semitones = Number(rawSemitones);

    if (!Number.isInteger(semitones)) {
      throw new BadRequestException('semitones deve ser um número inteiro');
    }

    try {
      return {
        original: symbol,
        semitones,
        result: transposeChord(symbol, semitones)
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Acorde inválido');
    }
  }
}
