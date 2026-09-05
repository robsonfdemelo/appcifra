import React, { useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { transposeChord } from '@app-cifra/music-theory';
import { ScreenHeader } from '../components/ScreenHeader';
import { getExternalCifraSearchUrl } from '../music/search';
import { type SongSearchResult } from '../music/types';
import { colors } from '../theme';

type Props = {
  song: SongSearchResult;
  onBack: () => void;
  onAddToSetlist: (song: SongSearchResult) => void;
  onOpenPads: () => void;
};

export function SongDetailScreen({ song, onBack, onAddToSetlist, onOpenPads }: Props) {
  const baseKey = song.displayKey ?? song.originalKey ?? 'C';
  const [offset, setOffset] = useState(0);
  const selectedKey = transposeChord(baseKey, offset);

  async function openSource() {
    await Linking.openURL(getExternalCifraSearchUrl(song));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Música" onBack={onBack} />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>CIFRA / REPERTÓRIO</Text>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist}</Text>

          <View style={styles.keyBox}>
            <Pressable style={styles.keyButton} onPress={() => setOffset(value => value - 1)}><Text style={styles.keyButtonText}>−</Text></Pressable>
            <View style={styles.keyCenter}>
              <Text style={styles.keyLabel}>TOM PARA TOCAR</Text>
              <Text style={styles.key}>{selectedKey}</Text>
            </View>
            <Pressable style={styles.keyButton} onPress={() => setOffset(value => value + 1)}><Text style={styles.keyButtonText}>+</Text></Pressable>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}><Text style={styles.metaLabel}>Tom da fonte</Text><Text style={styles.metaValue}>{song.originalKey ?? '—'}</Text></View>
            <View style={styles.metaCard}><Text style={styles.metaLabel}>Forma</Text><Text style={styles.metaValue}>{song.displayKey ?? song.originalKey ?? '—'}</Text></View>
            <View style={styles.metaCard}><Text style={styles.metaLabel}>Capo</Text><Text style={styles.metaValue}>{song.capo ? `${song.capo}ª casa` : '—'}</Text></View>
            <View style={styles.metaCard}><Text style={styles.metaLabel}>Fonte</Text><Text style={styles.metaValueSmall}>{song.sourceLabel}</Text></View>
          </View>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Conteúdo da cifra</Text>
          <Text style={styles.noticeText}>
            Nesta fase o App Cifra mantém os metadados e o link da fonte. A letra/cifra completa de terceiros não é copiada automaticamente para dentro do app.
          </Text>
        </View>

        <Pressable style={styles.primary} onPress={() => onAddToSetlist({ ...song, displayKey: selectedKey })}>
          <Text style={styles.primaryText}>+ Adicionar ao Setlist</Text>
        </Pressable>
        <Pressable style={styles.padButton} onPress={onOpenPads}>
          <Text style={styles.padButtonText}>▶ Abrir Pads · Tom {selectedKey}</Text>
        </Pressable>
        <Pressable style={styles.sourceButton} onPress={openSource}>
          <Text style={styles.sourceButtonText}>Abrir fonte / procurar cifra</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  hero: { marginTop: 10, backgroundColor: '#0B1E17', borderRadius: 24, padding: 20 },
  eyebrow: { color: '#7FE0A1', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: '#FFF', fontSize: 26, lineHeight: 31, fontWeight: '900', marginTop: 8 },
  artist: { color: '#BDD0C7', fontSize: 13, marginTop: 4 },
  keyBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  keyButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#163A2B', alignItems: 'center', justifyContent: 'center' },
  keyButtonText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  keyCenter: { minWidth: 130, alignItems: 'center' },
  keyLabel: { color: '#8AA69A', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  key: { color: '#FFF', fontSize: 48, fontWeight: '900' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  metaCard: { width: '48.5%', minHeight: 65, borderRadius: 14, backgroundColor: '#142B22', padding: 11 },
  metaLabel: { color: '#789488', fontSize: 9, fontWeight: '800' },
  metaValue: { color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 4 },
  metaValueSmall: { color: '#FFF', fontSize: 11, fontWeight: '800', marginTop: 5 },
  notice: { borderWidth: 1, borderColor: '#D9ECDD', backgroundColor: '#F2FAF4', borderRadius: 17, padding: 15, marginTop: 14 },
  noticeTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  noticeText: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 5 },
  primary: { minHeight: 52, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  padButton: { minHeight: 52, borderRadius: 16, backgroundColor: '#0B1E17', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  padButtonText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  sourceButton: { minHeight: 48, borderRadius: 16, backgroundColor: '#F3F5F4', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  sourceButtonText: { color: colors.ink, fontWeight: '800', fontSize: 12 }
});
