import { formatFretPattern, generateVoicings, getChordNotes, normalizeNote, transposeChord } from '../src/index.js';

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recebido ${String(actual)}`);
  }
}

function expectArray(actual: string[], expected: string[], label: string): void {
  expectEqual(actual.join(','), expected.join(','), label);
}

expectEqual(normalizeNote('Bb'), 'A#', 'normalização de bemol');
expectArray(getChordNotes('C'), ['C', 'E', 'G'], 'notas de C');
expectArray(getChordNotes('Am7'), ['A', 'C', 'E', 'G'], 'notas de Am7');
expectEqual(transposeChord('Am7', 2), 'Bm7', 'transposição Am7 +2');
expectEqual(transposeChord('G/B', 2), 'A/C#', 'transposição com baixo invertido');

const cVoicings = generateVoicings({ chord: 'C', maxFret: 5, limit: 12 });

if (cVoicings.length === 0) {
  throw new Error('gerador de voicings não retornou posições para C');
}

const patterns = cVoicings.map(voicing => formatFretPattern(voicing.frets));

if (!patterns.includes('x 3 2 0 1 0')) {
  throw new Error(`posição aberta de C não encontrada. Encontradas: ${patterns.join(' | ')}`);
}

console.log('music-theory: testes concluídos com sucesso');
console.log(`C voicings: ${patterns.slice(0, 6).join(' | ')}`);
