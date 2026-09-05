import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { type Setlist } from '../music/types';
import { colors } from '../theme';

type Props = {
  setlist: Setlist;
  onBack: () => void;
  onOpenSong: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
};

export function SetlistDetailScreen({ setlist, onBack, onOpenSong, onRemove, onMove }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={setlist.name} onBack={onBack} />

        <View style={styles.summary}>
          <Text style={styles.summaryNumber}>{setlist.songs.length}</Text>
          <Text style={styles.summaryLabel}>música(s) no repertório</Text>
        </View>

        {setlist.songs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Setlist vazio</Text>
            <Text style={styles.emptyText}>Vá em Buscar e use “+ Setlist” para adicionar músicas.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {setlist.songs.map((song, index) => (
              <View key={song.setlistItemId} style={styles.card}>
                <Pressable style={styles.main} onPress={() => onOpenSong(index)}>
                  <View style={styles.order}><Text style={styles.orderText}>{String(index + 1).padStart(2, '0')}</Text></View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.artist}>{song.artist}</Text>
                    <Text style={styles.key}>Tom: {song.selectedKey ?? song.displayKey ?? song.originalKey ?? '—'}</Text>
                  </View>
                </Pressable>

                <View style={styles.actions}>
                  <Pressable disabled={index === 0} onPress={() => onMove(index, -1)} style={[styles.small, index === 0 ? styles.disabled : null]}><Text style={styles.smallText}>↑</Text></Pressable>
                  <Pressable disabled={index === setlist.songs.length - 1} onPress={() => onMove(index, 1)} style={[styles.small, index === setlist.songs.length - 1 ? styles.disabled : null]}><Text style={styles.smallText}>↓</Text></Pressable>
                  <Pressable onPress={() => onRemove(index)} style={styles.remove}><Text style={styles.removeText}>Remover</Text></Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  content: { paddingHorizontal: 18, paddingBottom: 34 },
  summary: { marginTop: 10, borderRadius: 20, backgroundColor: '#0B1E17', minHeight: 105, padding: 18, justifyContent: 'center' },
  summaryNumber: { color: '#FFF', fontSize: 34, fontWeight: '900' },
  summaryLabel: { color: '#BBD0C7', fontSize: 11, marginTop: 2 },
  empty: { marginTop: 15, padding: 26, borderRadius: 18, backgroundColor: '#F8FAF9', alignItems: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  list: { gap: 10, marginTop: 15 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 12 },
  main: { flexDirection: 'row', alignItems: 'center' },
  order: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  orderText: { color: colors.greenDark, fontWeight: '900' },
  songInfo: { flex: 1, marginLeft: 11 },
  songTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  artist: { color: colors.muted, fontSize: 10, marginTop: 2 },
  key: { color: colors.greenDark, fontSize: 10, fontWeight: '800', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 7, justifyContent: 'flex-end', marginTop: 10 },
  small: { width: 38, height: 34, borderRadius: 10, backgroundColor: '#F0F3F1', alignItems: 'center', justifyContent: 'center' },
  smallText: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  disabled: { opacity: 0.35 },
  remove: { height: 34, borderRadius: 10, backgroundColor: '#FFF0F0', paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#B42318', fontSize: 10, fontWeight: '900' }
});
