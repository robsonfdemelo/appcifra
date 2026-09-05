"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transposeChord = transposeChord;
exports.transposeProgression = transposeProgression;
const notes_js_1 = require("./notes.js");
const chords_js_1 = require("./chords.js");
function transposeChord(symbol, semitones) {
    const parsed = (0, chords_js_1.parseChordSymbol)(symbol);
    const root = (0, notes_js_1.transposeNote)(parsed.root, semitones);
    const bass = parsed.bass ? (0, notes_js_1.transposeNote)(parsed.bass, semitones) : undefined;
    return `${root}${parsed.suffix}${bass ? `/${bass}` : ''}`;
}
function transposeProgression(chords, semitones) {
    return chords.map(chord => transposeChord(chord, semitones));
}
