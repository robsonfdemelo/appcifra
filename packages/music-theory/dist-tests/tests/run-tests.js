"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
function expectEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`${label}: esperado ${String(expected)}, recebido ${String(actual)}`);
    }
}
function expectArray(actual, expected, label) {
    expectEqual(actual.join(','), expected.join(','), label);
}
expectEqual((0, index_js_1.normalizeNote)('Bb'), 'A#', 'normalização de bemol');
expectArray((0, index_js_1.getChordNotes)('C'), ['C', 'E', 'G'], 'notas de C');
expectArray((0, index_js_1.getChordNotes)('Am7'), ['A', 'C', 'E', 'G'], 'notas de Am7');
expectEqual((0, index_js_1.transposeChord)('Am7', 2), 'Bm7', 'transposição Am7 +2');
expectEqual((0, index_js_1.transposeChord)('G/B', 2), 'A/C#', 'transposição com baixo invertido');
const cVoicings = (0, index_js_1.generateVoicings)({ chord: 'C', maxFret: 5, limit: 12 });
if (cVoicings.length === 0) {
    throw new Error('gerador de voicings não retornou posições para C');
}
const patterns = cVoicings.map(voicing => (0, index_js_1.formatFretPattern)(voicing.frets));
if (!patterns.includes('x 3 2 0 1 0')) {
    throw new Error(`posição aberta de C não encontrada. Encontradas: ${patterns.join(' | ')}`);
}
console.log('music-theory: testes concluídos com sucesso');
console.log(`C voicings: ${patterns.slice(0, 6).join(' | ')}`);
