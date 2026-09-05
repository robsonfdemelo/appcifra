"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHROMATIC_SHARPS = void 0;
exports.normalizeNote = normalizeNote;
exports.noteToPitchClass = noteToPitchClass;
exports.pitchClassToNote = pitchClassToNote;
exports.transposeNote = transposeNote;
exports.CHROMATIC_SHARPS = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];
const NOTE_ALIASES = {
    C: 'C',
    'B#': 'C',
    'C#': 'C#',
    Db: 'C#',
    D: 'D',
    'D#': 'D#',
    Eb: 'D#',
    E: 'E',
    Fb: 'E',
    F: 'F',
    'E#': 'F',
    'F#': 'F#',
    Gb: 'F#',
    G: 'G',
    'G#': 'G#',
    Ab: 'G#',
    A: 'A',
    'A#': 'A#',
    Bb: 'A#',
    B: 'B',
    Cb: 'B'
};
function normalizeNote(note) {
    const cleaned = note.trim();
    const normalized = NOTE_ALIASES[cleaned];
    if (!normalized) {
        throw new Error(`Nota inválida: ${note}`);
    }
    return normalized;
}
function noteToPitchClass(note) {
    return exports.CHROMATIC_SHARPS.indexOf(normalizeNote(note));
}
function pitchClassToNote(pitchClass) {
    const normalized = ((pitchClass % 12) + 12) % 12;
    const note = exports.CHROMATIC_SHARPS[normalized];
    if (!note) {
        throw new Error(`Classe de altura inválida: ${pitchClass}`);
    }
    return note;
}
function transposeNote(note, semitones) {
    return pitchClassToNote(noteToPitchClass(note) + semitones);
}
