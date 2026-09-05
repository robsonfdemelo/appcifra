import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  formatFretPattern,
  generateVoicings,
  getChordNotes,
  parseChordSymbol,
  type ChordVoicing
} from '@app-cifra/music-theory';
import { ChordDiagram } from '../components/ChordDiagram';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme';

type Props = {
  onBack: () => void;
};

const quickChords = ['C', 'D', 'E', 'G', 'A', 'Am', 'Em', 'Dm', 'F', 'Bm7'];

export function ChordDictionaryScreen({ onBack }: Props) {
  const [query, setQuery] = useState('Am7');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const result = useMemo(() => {
    try {
      const parsed = parseChordSymbol(query);
      const notes = getChordNotes(parsed.symbol);
      const voicings = generateVoicings({ chord: parsed.symbol, limit: 12 });

      return { parsed, notes, voicings, error: '' };
    } catch (error) {
      return {
        parsed: null,
        notes: [],
        voicings: [] as ChordVoicing[],
        error: error instanceof Error ? error.message : 'Não foi possível interpretar o acorde.'
      };
    }
  }, [query]);

  const selected = result.voicings[selectedIndex] ?? result.voicings[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Dicionário de Acordes" onBack={onBack} rightLabel="♡" />

        <View style={styles.searchShell}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={value => {
              setQuery(value);
              setSelectedIndex(0);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Ex.: Am7, Cmaj7, G/B"
            placeholderTextColor="#98A2A0"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          {quickChords.map(chord => (
            <Pressable
              key={chord}
              onPress={() => {
                setQuery(chord);
                setSelectedIndex(0);
              }}
              style={[styles.quickButton, query === chord ? styles.quickButtonActive : null]}
            >
              <Text style={[styles.quickText, query === chord ? styles.quickTextActive : null]}>{chord}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {result.error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Ainda não reconheci esse acorde</Text>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        ) : null}

        {result.parsed && selected ? (
          <>
            <Text style={styles.chordName}>{result.parsed.symbol}</Text>

            <View style={styles.diagramCard}>
              <ChordDiagram voicing={selected} light />
            </View>

            <Text style={styles.noteLine}>{result.notes.join('   ')}</Text>

            <Pressable style={styles.listenButton}>
              <View style={styles.listenIconBox}>
                <Text style={styles.listenIcon}>▶</Text>
              </View>
              <Text style={styles.listenText}>Ouvir acorde</Text>
            </Pressable>

            <View style={styles.detailRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Posição</Text>
                <Text style={styles.detailValue}>{formatFretPattern(selected.frets)}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Dificuldade</Text>
                <Text style={styles.detailValue}>{selected.difficulty.toFixed(1)}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Outras posições</Text>
              <Text style={styles.sectionAction}>{result.voicings.length} opções</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voicingRow}>
              {result.voicings.map((voicing, index) => (
                <Pressable
                  key={`${formatFretPattern(voicing.frets)}-${index}`}
                  onPress={() => setSelectedIndex(index)}
                  style={[styles.voicingCard, selected === voicing ? styles.voicingCardSelected : null]}
                >
                  <Text style={styles.voicingName}>{result.parsed?.symbol}</Text>
                  <View style={styles.voicingMiniGrid}>
                    <ChordDiagram voicing={voicing} light compact />
                  </View>
                  <Text style={styles.voicingPattern}>{formatFretPattern(voicing.frets)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 34
  },
  searchShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F5F4',
    marginTop: 8,
    paddingHorizontal: 14
  },
  searchIcon: {
    width: 28,
    color: '#68736F',
    fontSize: 22
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700'
  },
  clearButton: {
    width: 38,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearText: {
    color: '#7D8783',
    fontSize: 23
  },
  quickRow: {
    gap: 7,
    paddingTop: 11,
    paddingBottom: 5
  },
  quickButton: {
    minWidth: 43,
    height: 37,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickButtonActive: {
    backgroundColor: colors.greenSoft,
    borderColor: '#B9DFC4'
  },
  quickText: {
    color: '#66716D',
    fontSize: 12,
    fontWeight: '800'
  },
  quickTextActive: {
    color: colors.greenDark
  },
  errorCard: {
    borderRadius: 16,
    backgroundColor: '#FFF4F3',
    borderWidth: 1,
    borderColor: '#F7D4D1',
    padding: 14,
    marginTop: 13
  },
  errorTitle: {
    color: '#9F2116',
    fontSize: 13,
    fontWeight: '900'
  },
  errorText: {
    color: '#B5473F',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3
  },
  chordName: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: '900',
    marginTop: 19
  },
  diagramCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    marginTop: 3
  },
  noteLine: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 4
  },
  listenButton: {
    alignSelf: 'center',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 23,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 15,
    marginTop: 15
  },
  listenIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listenIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 2
  },
  listenText: {
    color: colors.greenDark,
    fontSize: 13,
    fontWeight: '900'
  },
  detailRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17
  },
  detailCard: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#EDF0EE',
    padding: 12
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 10
  },
  detailValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 3
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  sectionAction: {
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: '800'
  },
  voicingRow: {
    gap: 10,
    paddingBottom: 4
  },
  voicingCard: {
    width: 126,
    minHeight: 155,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10
  },
  voicingCardSelected: {
    borderColor: colors.green,
    backgroundColor: '#F8FFF9'
  },
  voicingName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center'
  },
  voicingMiniGrid: {
    height: 82,
    position: 'relative',
    marginHorizontal: 12,
    marginTop: 9
  },
  miniFret: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#87928E'
  },
  miniString: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#87928E'
  },
  voicingPattern: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 7
  }
});
