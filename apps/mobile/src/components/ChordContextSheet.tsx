import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  generateVoicings,
  type ChordVoicing
} from '@app-cifra/music-theory';

import { ChordDiagram } from './ChordDiagram';
import {
  buildHarmonicContext,
  normalizeChordForTheory
} from '../music/harmonyContext';

type Props = {
  visible: boolean;
  chord: string | null;
  currentKey: string;
  onClose: () => void;
};

function Meter({
  value,
  kind
}: {
  value: number;
  kind: 'stability' | 'tension';
}) {
  return (
    <View style={styles.meterRow}>
      {Array.from({ length: 5 }, (_, index) => (
        <View
          key={index}
          style={[
            styles.meterDot,
            index < value
              ? kind === 'stability'
                ? styles.meterDotGreen
                : styles.meterDotRed
              : null
          ]}
        />
      ))}
    </View>
  );
}

function getVoicing(chord: string): ChordVoicing | null {
  try {
    return (
      generateVoicings({
        chord: normalizeChordForTheory(chord),
        maxFret: 12,
        maxSpan: 4,
        limit: 1,
        minStrings: 4
      })[0] ?? null
    );
  } catch {
    return null;
  }
}

export function ChordContextSheet({
  visible,
  chord,
  currentKey,
  onClose
}: Props) {
  const result = useMemo(() => {
    if (!chord) return null;

    try {
      return {
        context: buildHarmonicContext(chord, currentKey),
        voicing: getVoicing(chord),
        error: ''
      };
    } catch (error) {
      return {
        context: null,
        voicing: null,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível analisar este acorde.'
      };
    }
  }, [chord, currentKey]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>‹ Voltar</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Contexto do acorde</Text>

          <Pressable
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {result?.context ? (
            <>
              <View style={styles.hero}>
                <View style={styles.heroMain}>
                  <Text style={styles.chordName}>
                    {result.context.displayName}
                  </Text>

                  <Text style={styles.quality}>
                    {result.context.qualityLabel}
                  </Text>

                  <View style={styles.badges}>
                    <View style={styles.functionBadge}>
                      <Text style={styles.functionBadgeText}>
                        {result.context.harmonicFunction}
                      </Text>
                    </View>

                    <View style={styles.degreeBadge}>
                      <Text style={styles.degreeBadgeText}>
                        {result.context.degree}
                        {result.context.degreeNumber
                          ? ` · ${result.context.degreeNumber}º grau`
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.keyCard}>
                  <Text style={styles.keyLabel}>TONALIDADE ATUAL</Text>
                  <Text style={styles.keyValue}>
                    {result.context.keyLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardEyebrow}>
                  COMO O ACORDE É FORMADO
                </Text>

                <View style={styles.formulaGrid}>
                  {result.context.formula.map((degree, index) => (
                    <View
                      key={`${degree}-${index}`}
                      style={styles.formulaItem}
                    >
                      <Text style={styles.formulaDegree}>
                        {degree}
                      </Text>
                      <Text style={styles.formulaNote}>
                        {result.context.notes[index] ?? '—'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {result.voicing ? (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardEyebrow}>DIAGRAMA</Text>
                    <Text style={styles.cardHint}>posição sugerida</Text>
                  </View>

                  <View style={styles.diagramWrap}>
                    <ChordDiagram voicing={result.voicing} light />
                  </View>
                </View>
              ) : null}

              <View style={styles.card}>
                <Text style={styles.cardEyebrow}>
                  NO CAMPO HARMÔNICO DE {result.context.keyLabel.toUpperCase()}
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.fieldRow}
                >
                  {result.context.field.map(item => (
                    <View
                      key={`${item.degree}-${item.chord}`}
                      style={[
                        styles.fieldItem,
                        item.active ? styles.fieldItemActive : null
                      ]}
                    >
                      <Text
                        style={[
                          styles.fieldChord,
                          item.active ? styles.fieldTextActive : null
                        ]}
                      >
                        {item.chord}
                      </Text>
                      <Text
                        style={[
                          styles.fieldDegree,
                          item.active ? styles.fieldTextActive : null
                        ]}
                      >
                        {item.degree}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.twoColumns}>
                <View style={[styles.card, styles.halfCard]}>
                  <Text style={styles.cardEyebrow}>FUNÇÃO HARMÔNICA</Text>
                  <Text style={styles.bigValue}>
                    {result.context.harmonicFunction}
                  </Text>
                  <Text style={styles.description}>
                    {result.context.functionDescription}
                  </Text>
                </View>

                <View style={[styles.card, styles.halfCard]}>
                  <Text style={styles.cardEyebrow}>CARÁTER SONORO</Text>
                  <Text style={styles.bigValue}>
                    {result.context.characterLabel}
                  </Text>

                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Estabilidade</Text>
                    <Meter
                      value={result.context.stability}
                      kind="stability"
                    />
                  </View>

                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Tensão</Text>
                    <Meter
                      value={result.context.tension}
                      kind="tension"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardEyebrow}>
                  SUBSTITUIÇÕES POSSÍVEIS
                </Text>

                {result.context.substitutions.length ? (
                  result.context.substitutions.map(item => (
                    <View
                      key={item.chord}
                      style={styles.substitution}
                    >
                      <Text style={styles.substitutionChord}>
                        {item.chord}
                      </Text>
                      <Text style={styles.substitutionReason}>
                        {item.reason}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.description}>
                    Este acorde não está no campo diatônico básico. Vale analisar a melodia e a condução das vozes antes de substituí-lo.
                  </Text>
                )}
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>Uso musical</Text>
                <Text style={styles.tipText}>
                  As substituições são sugestões harmônicas. A melodia da música é quem determina se a troca funciona bem no trecho.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                Ainda não consegui analisar este acorde
              </Text>
              <Text style={styles.description}>
                {result?.error ?? 'Acorde indisponível.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8F7'
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEA',
    backgroundColor: '#FFFFFF'
  },
  back: {
    color: '#137A48',
    fontSize: 14,
    fontWeight: '800'
  },
  headerTitle: {
    flex: 1,
    color: '#111827',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '900'
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EEF2F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeText: {
    color: '#26332D',
    fontSize: 24,
    lineHeight: 26
  },
  content: {
    padding: 18,
    paddingBottom: 40
  },
  hero: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  heroMain: {
    flex: 1
  },
  chordName: {
    color: '#10221A',
    fontSize: 38,
    fontWeight: '900'
  },
  quality: {
    color: '#69766F',
    fontSize: 13,
    marginTop: 2
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10
  },
  functionBadge: {
    borderRadius: 10,
    backgroundColor: '#E7F7EC',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  functionBadgeText: {
    color: '#14834C',
    fontSize: 11,
    fontWeight: '900'
  },
  degreeBadge: {
    borderRadius: 10,
    backgroundColor: '#EEF0F7',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  degreeBadgeText: {
    color: '#55617D',
    fontSize: 11,
    fontWeight: '800'
  },
  keyCard: {
    minWidth: 120,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBE8',
    padding: 12
  },
  keyLabel: {
    color: '#8D9792',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1
  },
  keyValue: {
    color: '#17231E',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE7',
    padding: 16,
    marginTop: 14
  },
  cardEyebrow: {
    color: '#667A70',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1
  },
  cardHint: {
    color: '#9AA49F',
    fontSize: 10
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  formulaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  formulaItem: {
    minWidth: 68,
    flexGrow: 1,
    borderRadius: 14,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    padding: 10
  },
  formulaDegree: {
    color: '#18241E',
    fontSize: 16,
    fontWeight: '900'
  },
  formulaNote: {
    color: '#197C4C',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4
  },
  diagramWrap: {
    alignItems: 'center',
    marginTop: 12
  },
  fieldRow: {
    gap: 7,
    paddingTop: 12
  },
  fieldItem: {
    width: 58,
    height: 58,
    borderRadius: 13,
    backgroundColor: '#F1F4F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fieldItemActive: {
    backgroundColor: '#1FA45B'
  },
  fieldChord: {
    color: '#1C2B24',
    fontSize: 13,
    fontWeight: '900'
  },
  fieldDegree: {
    color: '#8A9690',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3
  },
  fieldTextActive: {
    color: '#FFFFFF'
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 10
  },
  halfCard: {
    flex: 1
  },
  bigValue: {
    color: '#14211B',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8
  },
  description: {
    color: '#6B7671',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7
  },
  metric: {
    marginTop: 10
  },
  metricLabel: {
    color: '#7E8984',
    fontSize: 9,
    marginBottom: 5
  },
  meterRow: {
    flexDirection: 'row',
    gap: 4
  },
  meterDot: {
    width: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E1E6E3'
  },
  meterDotGreen: {
    backgroundColor: '#24A95D'
  },
  meterDotRed: {
    backgroundColor: '#E15858'
  },
  substitution: {
    borderRadius: 14,
    backgroundColor: '#F5F8F6',
    padding: 12,
    marginTop: 9
  },
  substitutionChord: {
    color: '#15231C',
    fontSize: 18,
    fontWeight: '900'
  },
  substitutionReason: {
    color: '#7A8680',
    fontSize: 10,
    marginTop: 3
  },
  tipCard: {
    borderRadius: 18,
    backgroundColor: '#EAF6EE',
    padding: 15,
    marginTop: 14
  },
  tipTitle: {
    color: '#146E42',
    fontSize: 12,
    fontWeight: '900'
  },
  tipText: {
    color: '#527061',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4
  },
  errorCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE7',
    padding: 18
  },
  errorTitle: {
    color: '#17231E',
    fontSize: 16,
    fontWeight: '900'
  }
});
