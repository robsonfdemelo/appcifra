import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  requestRecordingPermissionsAsync,
  useAudioStream,
  type AudioStreamBuffer
} from 'expo-audio';

import { transposeNote } from '@app-cifra/music-theory';
import { colors } from '../theme';
import {
  detectKeyFromChroma,
  extractChroma,
  mergeChroma,
  type DetectedMode
} from '../audio/keyDetection';
import {
  prepareRecordingAudio,
  releaseAudioSession
} from '../audio/session';

type Props = {
  onBack: () => void;
};

type Mode = DetectedMode;

const ROOTS = [
  'C', 'C#', 'D', 'D#',
  'E', 'F', 'F#', 'G',
  'G#', 'A', 'A#', 'B'
] as const;

const MAJOR_INTERVALS =
  [0, 2, 4, 5, 7, 9, 11] as const;

const MINOR_INTERVALS =
  [0, 2, 3, 5, 7, 8, 10] as const;

const MAJOR_QUALITIES =
  ['', 'm', 'm', '', '', 'm', 'dim'] as const;

const MINOR_QUALITIES =
  ['m', 'dim', '', 'm', 'm', '', ''] as const;

const ROMAN_MAJOR =
  ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

const ROMAN_MINOR =
  ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

const ANALYSIS_BLOCK_SIZE = 8192;

function buildHarmony(
  root: string,
  mode: Mode
) {
  const intervals =
    mode === 'major'
      ? MAJOR_INTERVALS
      : MINOR_INTERVALS;

  const qualities =
    mode === 'major'
      ? MAJOR_QUALITIES
      : MINOR_QUALITIES;

  const roman =
    mode === 'major'
      ? ROMAN_MAJOR
      : ROMAN_MINOR;

  const scale =
    intervals.map(interval =>
      transposeNote(root, interval)
    );

  const chords =
    scale.map(
      (note, index) =>
        `${note}${qualities[index] ?? ''}`
    );

  return {
    scale,
    chords,
    roman
  };
}

function progression(
  chords: string[],
  indexes: number[]
) {
  return indexes
    .map(index => chords[index])
    .filter(Boolean)
    .join('  –  ');
}

function appendSamples(
  current: Float32Array,
  incoming: Float32Array
) {
  const merged =
    new Float32Array(
      current.length +
        incoming.length
    );

  merged.set(current, 0);
  merged.set(
    incoming,
    current.length
  );

  return merged;
}

export function HarmonizeScreen({
  onBack
}: Props) {
  const [root, setRoot] =
    React.useState('C');

  const [mode, setMode] =
    React.useState<Mode>('major');

  const [confidence, setConfidence] =
    React.useState<number | null>(null);

  const [isListening, setIsListening] =
    React.useState(false);

  const [listeningSeconds, setListeningSeconds] =
    React.useState(0);

  const [acceptedBlocks, setAcceptedBlocks] =
    React.useState(0);

  const listeningRef =
    React.useRef(false);

  const acceptedBlocksRef =
    React.useRef(0);

  const accumulatedChroma =
    React.useRef<number[]>(
      new Array<number>(12).fill(0)
    );

  const pendingSamplesRef =
    React.useRef<Float32Array>(
      new Float32Array(0)
    );

  const startedAt =
    React.useRef(0);

  const timerRef =
    React.useRef<
      ReturnType<typeof setInterval> | null
    >(null);

  const audioStream =
    useAudioStream({
      sampleRate: 48000,
      channels: 1,
      encoding: 'float32',
      onBuffer: (
        buffer: AudioStreamBuffer
      ) => {
        if (!listeningRef.current) {
          return;
        }

        const incoming =
          new Float32Array(
            buffer.data
          );

        if (!incoming.length) {
          return;
        }

        pendingSamplesRef.current =
          appendSamples(
            pendingSamplesRef.current,
            incoming
          );

        while (
          pendingSamplesRef.current.length >=
          ANALYSIS_BLOCK_SIZE
        ) {
          const block =
            pendingSamplesRef.current.slice(
              0,
              ANALYSIS_BLOCK_SIZE
            );

          pendingSamplesRef.current =
            pendingSamplesRef.current.slice(
              ANALYSIS_BLOCK_SIZE
            );

          const chroma =
            extractChroma(
              block,
              buffer.sampleRate
            );

          if (!chroma) {
            continue;
          }

          mergeChroma(
            accumulatedChroma.current,
            chroma
          );

          acceptedBlocksRef.current += 1;
          setAcceptedBlocks(
            acceptedBlocksRef.current
          );

          if (
            acceptedBlocksRef.current >= 3
          ) {
            const result =
              detectKeyFromChroma(
                accumulatedChroma.current
              );

            if (result) {
              setRoot(result.root);
              setMode(result.mode);
              setConfidence(
                result.confidence
              );
            }
          }
        }
      }
    });

  const harmony =
    React.useMemo(
      () =>
        buildHarmony(root, mode),
      [root, mode]
    );

  const progressions =
    mode === 'major'
      ? [
          [0, 4, 5, 3],
          [0, 3, 5, 4],
          [5, 3, 0, 4],
          [0, 5, 1, 4]
        ]
      : [
          [0, 5, 2, 6],
          [0, 3, 5, 4],
          [0, 6, 5, 6],
          [0, 5, 3, 4]
        ];

  const finishDetection =
    React.useCallback(async () => {
      if (!listeningRef.current) {
        return;
      }

      listeningRef.current = false;
      setIsListening(false);

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }

      try {
        audioStream.stream.stop();
      } catch {}

      const result =
        detectKeyFromChroma(
          accumulatedChroma.current
        );

      if (
        result &&
        acceptedBlocksRef.current >= 2
      ) {
        setRoot(result.root);
        setMode(result.mode);
        setConfidence(
          result.confidence
        );
      } else {
        Alert.alert(
          'Não consegui identificar o tom',
          'Tente novamente com a música mais próxima do microfone e use um trecho com instrumentos e acordes claros.'
        );
      }

      await releaseAudioSession();
    }, [audioStream.stream]);

  React.useEffect(() => {
    return () => {
      listeningRef.current = false;

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }

      try {
        audioStream.stream.stop();
      } catch {}

      releaseAudioSession().catch(
        () => undefined
      );
    };
  }, [audioStream.stream]);

  async function startDetection() {
    if (listeningRef.current) {
      await finishDetection();
      return;
    }

    const permission =
      await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Microfone',
        'Precisamos da permissão do microfone para detectar a tonalidade.'
      );

      return;
    }

    accumulatedChroma.current =
      new Array<number>(12).fill(0);

    pendingSamplesRef.current =
      new Float32Array(0);

    acceptedBlocksRef.current = 0;
    setAcceptedBlocks(0);
    setListeningSeconds(0);
    setConfidence(null);

    try {
      await prepareRecordingAudio();

      listeningRef.current = true;
      setIsListening(true);
      startedAt.current = Date.now();

      await audioStream.stream.start();

      timerRef.current =
        setInterval(() => {
          const elapsed =
            Math.floor(
              (Date.now() -
                startedAt.current) /
                1000
            );

          setListeningSeconds(
            elapsed
          );

          if (elapsed >= 12) {
            void finishDetection();
          }
        }, 500);
    } catch {
      listeningRef.current = false;
      setIsListening(false);

      Alert.alert(
        'Detectar tonalidade',
        'Não foi possível iniciar a leitura do microfone.'
      );
    }
  }

  const detectionLabel =
    isListening
      ? `Ouvindo... ${Math.min(listeningSeconds, 12)}s`
      : confidence !== null
        ? `${root} ${mode === 'major' ? 'maior' : 'menor'}`
        : 'Pronto para ouvir';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.topTitle}>
            <Text style={styles.title}>Harmonizar</Text>
            <Text style={styles.topSubtitle}>
              TOM E CAMPO HARMÔNICO
            </Text>
          </View>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>TOM ATUAL</Text>

            <Text style={styles.heroKey}>
              {root}
              <Text style={styles.heroMode}>
                {mode === 'major'
                  ? ' maior'
                  : ' menor'}
              </Text>
            </Text>

            <Text style={styles.heroText}>
              Detecte o tom pelo microfone ou ajuste manualmente abaixo.
            </Text>
          </View>

          <View style={styles.detectorCard}>
            <View style={styles.detectorHeader}>
              <View>
                <Text style={styles.detectorEyebrow}>
                  DETECTAR PELO ÁUDIO
                </Text>

                <Text style={styles.detectorTitle}>
                  {detectionLabel}
                </Text>
              </View>

              <View
                style={[
                  styles.liveDot,
                  isListening
                    ? styles.liveDotActive
                    : null
                ]}
              />
            </View>

            <Text style={styles.detectorText}>
              Toque a música perto do microfone por 8 a 12 segundos. Prefira um trecho com acordes claros e pouca fala.
            </Text>

            {isListening ? (
              <Text style={styles.debugText}>
                Blocos de áudio analisados: {acceptedBlocks}
              </Text>
            ) : null}

            {confidence !== null &&
            !isListening ? (
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>
                  Confiança estimada
                </Text>

                <Text style={styles.confidenceValue}>
                  {confidence}%
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={startDetection}
              style={[
                styles.detectButton,
                isListening
                  ? styles.detectButtonActive
                  : null
              ]}
            >
              <Text style={styles.detectButtonIcon}>
                {isListening ? '■' : '●'}
              </Text>

              <Text style={styles.detectButtonText}>
                {isListening
                  ? 'Parar análise'
                  : 'Detectar tonalidade'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Tonalidade
          </Text>

          <View style={styles.rootGrid}>
            {ROOTS.map(note => {
              const active =
                note === root;

              return (
                <Pressable
                  key={note}
                  onPress={() => {
                    setRoot(note);
                    setConfidence(null);
                  }}
                  style={[
                    styles.rootButton,
                    active
                      ? styles.rootButtonActive
                      : null
                  ]}
                >
                  <Text
                    style={[
                      styles.rootText,
                      active
                        ? styles.rootTextActive
                        : null
                    ]}
                  >
                    {note}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.modeRow}>
            <Pressable
              onPress={() => {
                setMode('major');
                setConfidence(null);
              }}
              style={[
                styles.modeButton,
                mode === 'major'
                  ? styles.modeButtonActive
                  : null
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'major'
                    ? styles.modeTextActive
                    : null
                ]}
              >
                Maior
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode('minor');
                setConfidence(null);
              }}
              style={[
                styles.modeButton,
                mode === 'minor'
                  ? styles.modeButtonActive
                  : null
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'minor'
                    ? styles.modeTextActive
                    : null
                ]}
              >
                Menor
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            Escala
          </Text>

          <View style={styles.noteRow}>
            {harmony.scale.map(note => (
              <View
                key={note}
                style={styles.notePill}
              >
                <Text style={styles.noteText}>
                  {note}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            Campo harmônico
          </Text>

          <View style={styles.chordList}>
            {harmony.chords.map(
              (chord, index) => (
                <View
                  key={`${chord}-${index}`}
                  style={styles.chordRow}
                >
                  <View style={styles.degree}>
                    <Text style={styles.degreeText}>
                      {harmony.roman[index]}
                    </Text>
                  </View>

                  <Text style={styles.chord}>
                    {chord}
                  </Text>

                  <Text style={styles.chordHint}>
                    Grau {index + 1}
                  </Text>
                </View>
              )
            )}
          </View>

          <Text style={styles.sectionTitle}>
            Progressões para experimentar
          </Text>

          <View style={styles.progressions}>
            {progressions.map(
              (indexes, index) => (
                <View
                  key={index}
                  style={styles.progressionCard}
                >
                  <Text style={styles.progressionLabel}>
                    OPÇÃO {index + 1}
                  </Text>

                  <Text style={styles.progressionText}>
                    {progression(
                      harmony.chords,
                      indexes
                    )}
                  </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FBFCFB'
  },
  screen: {
    flex: 1,
    backgroundColor: '#FBFCFB'
  },
  topBar: {
    minHeight: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#EDF3EF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3
  },
  topTitle: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900'
  },
  topSubtitle: {
    color: colors.greenDark,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 2
  },
  spacer: {
    width: 44
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36
  },
  hero: {
    borderRadius: 24,
    backgroundColor: '#123C2E',
    padding: 22,
    marginTop: 8
  },
  heroEyebrow: {
    color: '#A9D8BF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  heroKey: {
    color: '#FFFFFF',
    fontSize: 50,
    lineHeight: 58,
    fontWeight: '900',
    marginTop: 8
  },
  heroMode: {
    color: '#BBD8C7',
    fontSize: 17,
    fontWeight: '700'
  },
  heroText: {
    color: '#C9DDD2',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 285
  },
  detectorCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EAE5',
    padding: 17,
    marginTop: 14
  },
  detectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  detectorEyebrow: {
    color: colors.greenDark,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4
  },
  detectorTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 5
  },
  detectorText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10
  },
  debugText: {
    color: colors.greenDark,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 10
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C5CEC9'
  },
  liveDotActive: {
    backgroundColor: colors.green
  },
  confidenceRow: {
    minHeight: 42,
    borderRadius: 13,
    backgroundColor: '#F1F8F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12
  },
  confidenceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700'
  },
  confidenceValue: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: '900'
  },
  detectButton: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 13
  },
  detectButtonActive: {
    backgroundColor: '#1B2C25'
  },
  detectButtonIcon: {
    color: '#FFFFFF',
    fontSize: 12
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 26,
    marginBottom: 11
  },
  rootGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  rootButton: {
    width: '22.8%',
    height: 46,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rootButtonActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  rootText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900'
  },
  rootTextActive: {
    color: '#FFFFFF'
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#EFF3F0',
    borderRadius: 16,
    padding: 4,
    marginTop: 12
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF'
  },
  modeText: {
    color: '#7E8983',
    fontSize: 13,
    fontWeight: '800'
  },
  modeTextActive: {
    color: colors.greenDark
  },
  noteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  notePill: {
    minWidth: 42,
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#EAF6EE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noteText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: '900'
  },
  chordList: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7ECE9',
    backgroundColor: '#FFFFFF'
  },
  chordRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2F0',
    paddingHorizontal: 14
  },
  degree: {
    width: 42
  },
  degreeText: {
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: '900'
  },
  chord: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  chordHint: {
    color: '#98A29D',
    fontSize: 10
  },
  progressions: {
    gap: 9
  },
  progressionCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7ECE9',
    padding: 15
  },
  progressionLabel: {
    color: '#8A958F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  progressionText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 6
  }
});
