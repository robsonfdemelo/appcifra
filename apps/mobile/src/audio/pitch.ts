const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type PitchResult = {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  midi: number;
};

export function detectPitch(samples: Float32Array, sampleRate: number): PitchResult | null {
  if (samples.length < 512 || sampleRate <= 0) return null;

  const length = Math.min(samples.length, 4096);
  const offset = samples.length - length;
  let mean = 0;
  for (let i = 0; i < length; i += 1) mean += samples[offset + i] ?? 0;
  mean /= length;

  let rms = 0;
  for (let i = 0; i < length; i += 1) {
    const value = (samples[offset + i] ?? 0) - mean;
    rms += value * value;
  }
  rms = Math.sqrt(rms / length);
  if (rms < 0.012) return null;

  const minHz = 70;
  const maxHz = 1000;
  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const maxLag = Math.min(length - 2, Math.ceil(sampleRate / minHz));
  let bestLag = -1;
  let bestScore = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let sum = 0;
    let normA = 0;
    let normB = 0;
    const count = length - lag;
    for (let i = 0; i < count; i += 2) {
      const a = (samples[offset + i] ?? 0) - mean;
      const b = (samples[offset + i + lag] ?? 0) - mean;
      sum += a * b;
      normA += a * a;
      normB += b * b;
    }
    const denom = Math.sqrt(normA * normB) || 1;
    const score = sum / denom;
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  if (bestLag <= 0 || bestScore < 0.45) return null;

  const frequency = sampleRate / bestLag;
  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  const note = NOTE_NAMES[((midi % 12) + 12) % 12] ?? 'A';
  const octave = Math.floor(midi / 12) - 1;

  return { frequency, note, octave, cents, midi };
}
