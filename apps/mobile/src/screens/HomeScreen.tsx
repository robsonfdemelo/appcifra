import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { BottomNav, type BottomTab } from '../components/BottomNav';
import { colors } from '../theme';

export type AppFeature =
  | 'songs'
  | 'tuner'
  | 'dictionary'
  | 'youtube'
  | 'pads'
  | 'setlists'
  | 'harmonize';

type Props = {
  onOpenFeature: (feature: AppFeature) => void;
  onBottomTab: (tab: BottomTab) => void;
  onSearch: (query: string) => void;
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
    subtitle: 'Buscar suas músicas',
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
    subtitle: 'Formas e voicings',
    tint: '#FFF5E7',
    accent: colors.orange
  },
  {
    key: 'youtube',
    icon: '▶',
    title: 'YouTube',
    subtitle: 'Estude com vídeo',
    tint: '#FFF0F0',
    accent: colors.red
  },
  {
    key: 'pads',
    icon: '▦',
    title: 'Pads',
    subtitle: 'Ambient e efeitos',
    tint: '#F3EFFF',
    accent: colors.purple
  },
  {
    key: 'harmonize',
    icon: 'H',
    title: 'Harmonizar',
    subtitle: 'Tom e campo harmônico',
    tint: '#ECF8EF',
    accent: colors.greenDark
  },
  {
    key: 'setlists',
    icon: '☷',
    title: 'Setlists',
    subtitle: 'Organize seu repertório',
    tint: '#F1EFFF',
    accent: '#6D4CE8'
  }
];

export function HomeScreen({
  onOpenFeature,
  onBottomTab,
  onSearch
}: Props) {
  const [query, setQuery] = React.useState('');

  function submitSearch() {
    const normalized = query.trim();

    if (!normalized) {
      return;
    }

    onSearch(normalized);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <View style={styles.greetingWrap}>
              <Text style={styles.brand}>APP CIFRA</Text>
              <Text style={styles.greeting}>Olá, músico!</Text>
              <Text style={styles.subGreeting}>
                O que vamos tocar hoje?
              </Text>
            </View>

            <View style={styles.brandButton}>
              <Text style={styles.brandButtonText}>AC</Text>
            </View>
          </View>

          <View style={styles.searchShell}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
              placeholder="Buscar música, artista ou cifra"
              placeholderTextColor="#8B9591"
              style={styles.searchInput}
            />

            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
              >
                <Text style={styles.clearButton}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.featureEyebrow}>FERRAMENTAS</Text>

          <View style={styles.featureGrid}>
            {features.map(feature => (
              <Pressable
                key={feature.key}
                onPress={() => onOpenFeature(feature.key)}
                style={({ pressed }) => [
                  styles.featureCard,
                  {
                    backgroundColor: feature.tint
                  },
                  pressed ? styles.featureCardPressed : null
                ]}
              >
                <View
                  style={[
                    styles.featureIconBox,
                    {
                      backgroundColor: feature.accent
                    }
                  ]}
                >
                  <Text style={styles.featureIcon}>
                    {feature.icon}
                  </Text>
                </View>

                <Text style={styles.featureTitle}>
                  {feature.title}
                </Text>

                <Text style={styles.featureSubtitle}>
                  {feature.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Últimas cifras acessadas
              </Text>

              <Text style={styles.sectionSubtitle}>
                Seu histórico aparecerá aqui
              </Text>
            </View>

            <Pressable onPress={() => onOpenFeature('songs')}>
              <Text style={styles.seeAll}>Buscar</Text>
            </Pressable>
          </View>

          <View style={styles.emptyRecent}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>♫</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Nenhuma cifra recente
            </Text>

            <Text style={styles.emptyText}>
              Quando você abrir uma cifra, ela poderá aparecer aqui para acesso rápido.
            </Text>

            <Pressable
              onPress={() => onOpenFeature('songs')}
              style={({ pressed }) => [
                styles.emptyButton,
                pressed ? styles.emptyButtonPressed : null
              ]}
            >
              <Text style={styles.emptyButtonText}>
                Buscar cifra
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomNav
          active="home"
          onChange={onBottomTab}
        />
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
    paddingTop: 16,
    paddingBottom: 30
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  greetingWrap: {
    flex: 1
  },
  brand: {
    color: colors.greenDark,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 6
  },
  greeting: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900'
  },
  subGreeting: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  brandButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14
  },
  brandButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.4
  },
  searchShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: '#F2F5F3',
    marginTop: 22,
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
  clearButton: {
    color: '#7A8580',
    fontSize: 23,
    paddingLeft: 10
  },
  featureEyebrow: {
    color: '#8B9591',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 22,
    marginBottom: 10
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  featureCard: {
    width: '48.5%',
    minHeight: 126,
    borderRadius: 20,
    padding: 14
  },
  featureCardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }]
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 12
  },
  sectionHeaderText: {
    flex: 1
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900'
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3
  },
  seeAll: {
    color: colors.greenDark,
    fontSize: 12,
    fontWeight: '900',
    paddingLeft: 14,
    paddingBottom: 1
  },
  emptyRecent: {
    minHeight: 190,
    borderRadius: 22,
    backgroundColor: '#F7FAF8',
    borderWidth: 1,
    borderColor: '#E4ECE7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 22
  },
  emptyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyIcon: {
    color: colors.greenDark,
    fontSize: 18,
    fontWeight: '900'
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10
  },
  emptyText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5
  },
  emptyButton: {
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 14
  },
  emptyButtonPressed: {
    opacity: 0.78
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  }
});
