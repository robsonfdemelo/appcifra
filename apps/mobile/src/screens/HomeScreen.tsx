import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomNav, type BottomTab } from '../components/BottomNav';
import { colors } from '../theme';

export type AppFeature = 'songs' | 'tuner' | 'dictionary' | 'youtube' | 'pads' | 'setlists';

type Props = {
  onOpenFeature: (feature: AppFeature) => void;
  onBottomTab: (tab: BottomTab) => void;
};

const features: Array<{
  key: AppFeature;
  icon: string;
  title: string;
  subtitle: string;
  tint: string;
  accent: string;
}> = [
  {
    key: 'songs',
    icon: '♫',
    title: 'Cifras',
    subtitle: 'Milhares de músicas',
    tint: '#ECF8EF',
    accent: colors.green
  },
  {
    key: 'tuner',
    icon: '≋',
    title: 'Afinador',
    subtitle: 'Afine seu instrumento',
    tint: '#F0F8F3',
    accent: colors.greenDark
  },
  {
    key: 'dictionary',
    icon: '▦',
    title: 'Dicionário de Acordes',
    subtitle: 'Aprenda e explore',
    tint: '#FFF5E7',
    accent: colors.orange
  },
  {
    key: 'youtube',
    icon: '▶',
    title: 'YouTube',
    subtitle: 'Descubra cifras',
    tint: '#FFF0F0',
    accent: colors.red
  },
  {
    key: 'pads',
    icon: '▦',
    title: 'Pads',
    subtitle: 'Sons e loops',
    tint: '#F3EFFF',
    accent: colors.purple
  },
  {
    key: 'setlists',
    icon: '☷',
    title: 'Setlists',
    subtitle: 'Organize seus shows',
    tint: '#F1EFFF',
    accent: '#6D4CE8'
  }
];

const songs = [
  { title: 'Evidências', artist: 'Chitãozinho & Xororó', key: 'G', art: 'EV' },
  { title: 'Tempo Perdido', artist: 'Legião Urbana', key: 'D', art: 'TP' },
  { title: 'Anna Júlia', artist: 'Los Hermanos', key: 'E', art: 'AJ' }
];

export function HomeScreen({ onOpenFeature, onBottomTab }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={styles.greetingWrap}>
              <Text style={styles.greeting}>Olá, músico!</Text>
              <Text style={styles.subGreeting}>O que vamos tocar hoje?</Text>
            </View>
            <Pressable style={styles.bellButton}>
              <Text style={styles.bell}>●</Text>
            </Pressable>
          </View>

          <View style={styles.searchShell}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              placeholder="Buscar música, artista ou cifra"
              placeholderTextColor="#8B9591"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.featureGrid}>
            {features.map(feature => (
              <Pressable
                key={feature.key}
                style={[styles.featureCard, { backgroundColor: feature.tint }]}
                onPress={() => onOpenFeature(feature.key)}
              >
                <View style={[styles.featureIconBox, { backgroundColor: feature.accent }]}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mais acessadas</Text>
            <Pressable onPress={() => onOpenFeature('songs')}>
              <Text style={styles.seeAll}>Ver todas ›</Text>
            </Pressable>
          </View>

          <View style={styles.songList}>
            {songs.map(song => (
              <Pressable key={song.title} style={styles.songRow} onPress={() => onOpenFeature('songs')}>
                <View style={styles.albumArt}>
                  <Text style={styles.albumText}>{song.art}</Text>
                </View>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <View style={styles.keyBadge}>
                  <Text style={styles.keyText}>{song.key}</Text>
                </View>
                <Text style={styles.heart}>♡</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.discoverCard}>
            <Text style={styles.discoverEyebrow}>PARA SEU ESTUDO</Text>
            <Text style={styles.discoverTitle}>Toque, escute e evolua no mesmo lugar.</Text>
            <Text style={styles.discoverText}>
              Use cifras, afinador, pads e o dicionário enquanto pratica suas músicas.
            </Text>
          </View>
        </ScrollView>

        <BottomNav active="home" onChange={onBottomTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  flex: {
    flex: 1
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  greetingWrap: {
    flex: 1
  },
  greeting: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900'
  },
  subGreeting: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bell: {
    color: colors.green,
    fontSize: 17
  },
  searchShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F3F5F4',
    marginTop: 18,
    paddingHorizontal: 15
  },
  searchIcon: {
    color: '#68736F',
    fontSize: 22,
    width: 28
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    color: colors.ink,
    fontSize: 14
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16
  },
  featureCard: {
    width: '48.5%',
    minHeight: 132,
    borderRadius: 18,
    padding: 14
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900'
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: 12
  },
  featureSubtitle: {
    color: '#6C7672',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 8
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900'
  },
  seeAll: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: '800'
  },
  songList: {
    gap: 2
  },
  songRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F1'
  },
  albumArt: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#1B2320',
    alignItems: 'center',
    justifyContent: 'center'
  },
  albumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900'
  },
  songArtist: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  keyBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyText: {
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: '900'
  },
  heart: {
    color: '#69746F',
    fontSize: 22,
    marginLeft: 1
  },
  discoverCard: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: colors.greenFaint,
    borderWidth: 1,
    borderColor: '#DDEFE3',
    padding: 18
  },
  discoverEyebrow: {
    color: colors.greenDark,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '900'
  },
  discoverTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 7
  },
  discoverText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  }
});
