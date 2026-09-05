import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { type Setlist, type SongSearchResult } from '../music/types';
import { colors } from '../theme';

type Props = {
  setlists: Setlist[];
  onBack: () => void;
  onCreate: (name: string) => void;
  onOpen: (setlist: Setlist) => void;
  pendingSong?: SongSearchResult | null;
  onAddToExisting?: (setlistId: string) => void;
};

export function SetlistsScreen({ setlists, onBack, onCreate, onOpen, pendingSong, onAddToExisting }: Props) {
  const [name, setName] = useState('');

  function create() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName('');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Setlists" onBack={onBack} />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SEU REPERTÓRIO</Text>
          <Text style={styles.heroTitle}>Organize músicas para ensaio, culto ou show.</Text>
          <Text style={styles.heroText}>Tom, ordem e observações ficam salvos no aparelho.</Text>
        </View>

        {pendingSong ? (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingLabel}>ADICIONAR AO SETLIST</Text>
            <Text style={styles.pendingTitle}>{pendingSong.title}</Text>
            <Text style={styles.pendingArtist}>{pendingSong.artist}</Text>
          </View>
        ) : null}

        <View style={styles.createCard}>
          <Text style={styles.label}>Novo setlist</Text>
          <View style={styles.createRow}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Culto Domingo"
              placeholderTextColor="#929B97"
              style={styles.input}
              onSubmitEditing={create}
            />
            <Pressable style={styles.createButton} onPress={create}>
              <Text style={styles.createButtonText}>Criar</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Meus Setlists</Text>

        {setlists.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>☷</Text>
            <Text style={styles.emptyTitle}>Nenhum setlist ainda</Text>
            <Text style={styles.emptyText}>Crie um repertório e adicione músicas pela busca.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {setlists.map(setlist => (
              <View key={setlist.id} style={styles.card}>
                <Pressable style={styles.cardMain} onPress={() => onOpen(setlist)}>
                <View style={styles.icon}><Text style={styles.iconText}>☷</Text></View>
                <View style={styles.info}>
                  <Text style={styles.name}>{setlist.name}</Text>
                  <Text style={styles.count}>{setlist.songs.length} música(s)</Text>
                </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
                {pendingSong && onAddToExisting ? (
                  <Pressable style={styles.addHere} onPress={() => onAddToExisting(setlist.id)}>
                    <Text style={styles.addHereText}>Adicionar aqui</Text>
                  </Pressable>
                ) : null}
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
  hero: { marginTop: 10, borderRadius: 22, backgroundColor: '#0B1E17', padding: 19 },
  eyebrow: { color: '#7FE0A1', fontSize: 9, letterSpacing: 1.5, fontWeight: '900' },
  heroTitle: { color: '#FFF', fontSize: 20, lineHeight: 25, fontWeight: '900', marginTop: 7 },
  heroText: { color: '#BDD0C7', fontSize: 11, lineHeight: 17, marginTop: 6 },
  pendingCard: { borderRadius: 18, backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#F3D7A2', padding: 14, marginTop: 14 },
  pendingLabel: { color: '#9A6B13', fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  pendingTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 5 },
  pendingArtist: { color: colors.muted, fontSize: 10, marginTop: 2 },
  createCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginTop: 14 },
  label: { color: colors.ink, fontWeight: '900', fontSize: 13, marginBottom: 8 },
  createRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: '#F3F5F4', paddingHorizontal: 13, color: colors.ink },
  createButton: { minWidth: 74, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  createButtonText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 24, marginBottom: 9 },
  empty: { borderRadius: 18, backgroundColor: '#F8FAF9', alignItems: 'center', padding: 30 },
  emptyIcon: { color: colors.green, fontSize: 34 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 8 },
  emptyText: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  list: { gap: 9 },
  card: { minHeight: 72, borderWidth: 1, borderColor: colors.border, borderRadius: 17, paddingHorizontal: 13, paddingVertical: 8 },
  cardMain: { flexDirection: 'row', alignItems: 'center', minHeight: 54 },
  icon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.greenDark, fontSize: 20, fontWeight: '900' },
  info: { flex: 1, marginLeft: 11 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  count: { color: colors.muted, fontSize: 10, marginTop: 3 },
  chevron: { color: '#A0AAA5', fontSize: 28 },
  addHere: { marginTop: 5, minHeight: 36, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  addHereText: { color: '#FFF', fontSize: 10, fontWeight: '900' }
});
