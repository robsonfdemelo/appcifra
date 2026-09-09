const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
] as const;

const MAJOR_PROFILE = [
  6.35,
  2.23,
  3.48,
  2.33,
  4.38,
  4.09,
  2.52,
  5.19,
  2.39,
  3.66,
  2.29,
  2.88
];

const MINOR_PROFILE = [
  6.33,
  2.68,
  3.52,
  5.38,
  2.60,
  3.53,
  2.54,
  4.75,
  3.98,
  2.69,
  3.34,
  3.17
];

export type DetectedMode = 'major' | 'minor';

export type KeyDetectionResult = {
  root: string;
  mode: DetectedMode;
  confidence: number;
  chroma: number[];
};

function normalize(values: number[]) {
  const sum = values.reduce((acc, value) => acc + value, 0);

  if (sum <= 0) {
    return values.map(() => 0);
  }

  return values.map(value => value / sum);
}

function goertzel(
  samples: Float32Array,
  sampleRate: number,
  frequency: number
) {
  const length = Math.min(samples.length, 4096);
  const offset = samples.length - length;
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const coeff = 2 * Math.cos(omega);

  let s0 = 0;
  let s1 = 0;
  let s2 = 0;

  for (let i = 0; i < length; i += 2) {
    const sample = samples[offset + i] ?? 0;
    const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.max(1, length - 1));

    s0 = sample * window + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }

  const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;

  return Math.max(0, power);
}

export function extractChroma(
  samples: Float32Array,
  sampleRate: number
) {
  if (samples.length < 1024 || sampleRate <= 0) {
    return null;
  }

  let rms = 0;

  for (let i = 0; i < samples.length; i += 8) {
    const value = samples[i] ?? 0;
    rms += value * value;
  }

  rms = Math.sqrt(rms / Math.max(1, Math.ceil(samples.length / 8)));

  if (rms < 0.008) {
    return null;
  }

  const chroma = new Array<number>(12).fill(0);

  for (let midi = 40; midi <= 88; midi += 1) {
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);

    if (frequency >= sampleRate / 2) {
      continue;
    }

    const pitchClass = ((midi % 12) + 12) % 12;
    const energy = goertzel(samples, sampleRate, frequency);

    chroma[pitchClass] = (chroma[pitchClass] ?? 0) + Math.sqrt(energy);
  }

  return normalize(chroma);
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < 12; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;

    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  return denominator > 0 ? dot / denominator : 0;
}

function rotateProfile(profile: number[], root: number) {
  return Array.from({ length: 12 }, (_, pitchClass) => {
    const sourceIndex = (pitchClass - root + 12) % 12;
    return profile[sourceIndex] ?? 0;
  });
}

export function detectKeyFromChroma(
  chromaInput: number[]
): KeyDetectionResult | null {
  if (chromaInput.length !== 12) {
    return null;
  }

  const chroma = normalize(chromaInput);

  if (chroma.every(value => value === 0)) {
    return null;
  }

  const candidates: Array<{
    root: number;
    mode: DetectedMode;
    score: number;
  }> = [];

  for (let root = 0; root < 12; root += 1) {
    candidates.push({
      root,
      mode: 'major',
      score: cosineSimilarity(
        chroma,
        normalize(rotateProfile(MAJOR_PROFILE, root))
      )
    });

    candidates.push({
      root,
      mode: 'minor',
      score: cosineSimilarity(
        chroma,
        normalize(rotateProfile(MINOR_PROFILE, root))
      )
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const second = candidates[1];

  if (!best) {
    return null;
  }

  const gap = Math.max(0, best.score - (second?.score ?? 0));
  const absolute = Math.max(0, Math.min(1, (best.score - 0.58) / 0.32));
  const separation = Math.max(0, Math.min(1, gap / 0.12));
  const confidence = Math.round(
    Math.max(12, Math.min(96, (absolute * 0.7 + separation * 0.3) * 100))
  );

  return {
    root: NOTE_NAMES[best.root] ?? 'C',
    mode: best.mode,
    confidence,
    chroma
  };
}

export function mergeChroma(
  target: number[],
  incoming: number[]
) {
  for (let i = 0; i < 12; i += 1) {
    target[i] = (target[i] ?? 0) + (incoming[i] ?? 0);
  }

  return target;
}
