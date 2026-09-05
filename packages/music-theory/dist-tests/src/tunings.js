"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUNINGS = exports.UKULELE_STANDARD = exports.GUITAR_HALF_STEP_DOWN = exports.GUITAR_DROP_D = exports.GUITAR_STANDARD = void 0;
exports.GUITAR_STANDARD = {
    id: 'guitar-standard',
    name: 'Padrão E A D G B E',
    instrument: 'guitar',
    strings: ['E', 'A', 'D', 'G', 'B', 'E']
};
exports.GUITAR_DROP_D = {
    id: 'guitar-drop-d',
    name: 'Drop D',
    instrument: 'guitar',
    strings: ['D', 'A', 'D', 'G', 'B', 'E']
};
exports.GUITAR_HALF_STEP_DOWN = {
    id: 'guitar-half-step-down',
    name: 'Meio tom abaixo',
    instrument: 'guitar',
    strings: ['D#', 'G#', 'C#', 'F#', 'A#', 'D#']
};
exports.UKULELE_STANDARD = {
    id: 'ukulele-standard',
    name: 'Padrão G C E A',
    instrument: 'ukulele',
    strings: ['G', 'C', 'E', 'A']
};
exports.TUNINGS = [
    exports.GUITAR_STANDARD,
    exports.GUITAR_DROP_D,
    exports.GUITAR_HALF_STEP_DOWN,
    exports.UKULELE_STANDARD
];
