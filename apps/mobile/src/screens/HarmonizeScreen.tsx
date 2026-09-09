import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { transposeNote } from '@app-cifra/music-theory';
import { colors } from '../theme';

type Props = {
  onBack: () => void;
};

type Mode = 'major' | 'minor';

const ROOTS = [
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

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;

const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'] as const;
const MINOR_QUALITIES = ['m', 'dim', '', 'm', 'm', '', ''] as const;

const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const ROMAN_MINOR = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

function buildHarmony(root: string, mode: Mode) {
  const intervals = mode === 'major' ? MAJOR_INTERVALS : MINOR_INTERVALS;
  const qualities = mode === 'major' ? MAJOR_QUALITIES : MINOR_QUALITIES;
  const roman = mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR;

  const scale = intervals.map(interval => transposeNote(root, interval));

  const chords = scale.map(
    (note, index) => `${note}${qualities[index] ?? ''}`
  );

  return {
    scale,
    chords,
    roman
  };
}

function progression(chords: string[], indexes: number[]) {
  return indexes
    .map(index => chords[index])
    .filter(Boolean)
    .join('  –  ');
}

export function HarmonizeScreen({ onBack }: Props) {
  const [root, setRoot] = React.useState('C');
  const [mode, setMode] = React.useState<Mode>('major');

  const harmony = React.useMemo(
    () => buildHarmony(root, mode),
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.topTitle}>
            <Text style={styles.title}>Harmonizar</Text>
            <Text style={styles.topSubtitle}>TOM E CAMPO HARMÔNICO</Text>
          </View>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>TOM SELECIONADO</Text>

            <Text style={styles.heroKey}>
              {root}
              <Text style={styles.heroMode}>
                {mode === 'major' ? ' maior' : ' menor'}
              </Text>
            </Text>

            <Text style={styles.heroText}>
              Escolha um tom para visualizar escala, graus, acordes e progressões.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Tonalidade</Text>

          <View style={styles.rootGrid}>
            {ROOTS.map(note => {
              const active = note === root;

              return (
                <Pressable
                  key={note}
                  onPress={() => setRoot(note)}
                  style={[
                    styles.rootButton,
                    active && styles.rootButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.rootText,
                      active && styles.rootTextActive
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
              onPress={() => setMode('major')}
              style={[
                styles.modeButton,
                mode === 'major' && styles.modeButtonActive
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'major' && styles.modeTextActive
                ]}
              >
                Maior
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('minor')}
              style={[
                styles.modeButton,
                mode === 'minor' && styles.modeButtonActive
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === 'minor' && styles.modeTextActive
                ]}
              >
                Menor
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Escala</Text>

          <View style={styles.noteRow}>
            {harmony.scale.map(note => (
              <View key={note} style={styles.notePill}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Campo harmônico</Text>

          <View style={styles.chordList}>
            {harmony.chords.map((chord, index) => (
              <View
                key={`${chord}-${index}`}
                style={styles.chordRow}
              >
                <View style={styles.degree}>
                  <Text style={styles.degreeText}>
                    {harmony.roman[index]}
                  </Text>
                </View>

                <Text style={styles.chord}>{chord}</Text>

                <Text style={styles.chordHint}>
                  Grau {index + 1}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            Progressões para experimentar
          </Text>

          <View style={styles.progressions}>
            {progressions.map((indexes, index) => (
              <View key={index} style={styles.progressionCard}>
                <Text style={styles.progressionLabel}>
                  OPÇÃO {index + 1}
                </Text>

                <Text style={styles.progressionText}>
                  {progression(harmony.chords, indexes)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.nextCard}>
            <Text style={styles.nextTag}>PRÓXIMA ETAPA</Text>

            <Text style={styles.nextTitle}>
              Detectar o tom pelo áudio
            </Text>

            <Text style={styles.nextText}>
              Depois conectamos esta tela ao microfone/análise de áudio para preencher automaticamente o tom provável da música.
            </Text>
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
  },
  nextCard: {
    borderRadius: 20,
    backgroundColor: '#EDF7F0',
    padding: 18,
    marginTop: 26
  },
  nextTag: {
    color: colors.greenDark,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3
  },
  nextTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 7
  },
  nextText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5
  }
});
