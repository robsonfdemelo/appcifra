import React, {
  useEffect,
  useState
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import {
  BottomNav,
  type BottomTab
} from '../components/BottomNav';
import { colors } from '../theme';
import {
  searchSongs
} from '../music/search';
import {
  type SongSearchResult
} from '../music/types';

type Props = {
  initialQuery?: string;
  onBack: () => void;
  onOpenSong: (
    song: SongSearchResult
  ) => void;
  onAddToSetlist: (
    song: SongSearchResult
  ) => void;
  onBottomTab?: (
    tab: BottomTab
  ) => void;
};

export function SongsSearchScreen({
  initialQuery = '',
  onBack,
  onOpenSong,
  onAddToSetlist,
  onBottomTab
}: Props) {
  const [query, setQuery] =
    useState(initialQuery);

  const [results, setResults] =
    useState<SongSearchResult[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState(
      'Digite uma música ou artista.'
    );

  async function runSearch(
    value = query
  ) {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setMessage(
        'Digite pelo menos 2 caracteres.'
      );
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const found =
        await searchSongs(trimmed);

      setResults(found);

      setMessage(
        found.length
          ? `${found.length} resultado(s)`
          : 'Nenhum resultado encontrado.'
      );
    } catch (error) {
      setResults([]);

      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível pesquisar.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) {
      void runSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              onPress={onBack}
              style={styles.backButton}
            >
              <Text style={styles.back}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Buscar músicas
              </Text>

              <Text
                style={styles.subtitle}
              >
                Busca centralizada pela API
                do App Cifra.
              </Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ex.: Bondade de Deus"
              placeholderTextColor="#909995"
              returnKeyType="search"
              onSubmitEditing={() =>
                runSearch()
              }
              style={styles.input}
            />

            <Pressable
              style={styles.searchButton}
              onPress={() => runSearch()}
            >
              <Text
                style={
                  styles.searchButtonText
                }
              >
                Buscar
              </Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Catálogo desacoplado do app
            </Text>

            <Text style={styles.infoText}>
              O aplicativo não contém uma
              lista fixa de músicas. A busca
              passa pela API e por provedores
              configurados no backend.
            </Text>
          </View>

          <View
            style={styles.resultHeader}
          >
            <Text
              style={styles.resultTitle}
            >
              Resultados
            </Text>

            {loading ? (
              <ActivityIndicator
                color={colors.green}
              />
            ) : (
              <Text
                style={styles.resultCount}
              >
                {message}
              </Text>
            )}
          </View>

          <View style={styles.list}>
            {results.map(song => (
              <View
                key={song.id}
                style={styles.songCard}
              >
                <Pressable
                  style={styles.songMain}
                  onPress={() =>
                    onOpenSong(song)
                  }
                >
                  <View
                    style={styles.songBadge}
                  >
                    <Text
                      style={
                        styles.songBadgeText
                      }
                    >
                      ♫
                    </Text>
                  </View>

                  <View
                    style={styles.songText}
                  >
                    <Text
                      style={
                        styles.songTitle
                      }
                    >
                      {song.title}
                    </Text>

                    <Text
                      style={
                        styles.songArtist
                      }
                    >
                      {song.artist}
                    </Text>

                    <View
                      style={styles.metaRow}
                    >
                      {song.originalKey ? (
                        <Text
                          style={
                            styles.keyPill
                          }
                        >
                          Tom{' '}
                          {song.originalKey}
                        </Text>
                      ) : null}

                      {song.capo ? (
                        <Text
                          style={
                            styles.metaPill
                          }
                        >
                          Capo {song.capo}
                        </Text>
                      ) : null}

                      <Text
                        style={styles.source}
                      >
                        {song.sourceLabel}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.chevron}
                  >
                    ›
                  </Text>
                </Pressable>

                <View
                  style={styles.actions}
                >
                  <Pressable
                    style={
                      styles.secondaryButton
                    }
                    onPress={() =>
                      onOpenSong(song)
                    }
                  >
                    <Text
                      style={
                        styles.secondaryText
                      }
                    >
                      Abrir
                    </Text>
                  </Pressable>

                  <Pressable
                    style={
                      styles.primaryButton
                    }
                    onPress={() =>
                      onAddToSetlist(song)
                    }
                  >
                    <Text
                      style={
                        styles.primaryText
                      }
                    >
                      + Setlist
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {onBottomTab ? (
          <BottomNav
            active="search"
            onChange={onBottomTab}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  flex: {
    flex: 1
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F5F4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  back: {
    fontSize: 30,
    color: colors.ink,
    marginTop: -3
  },
  headerText: {
    flex: 1,
    marginLeft: 12
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  searchRow: {
    flexDirection: 'row',
    gap: 9
  },
  input: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#F3F5F4',
    borderRadius: 16,
    paddingHorizontal: 15,
    color: colors.ink,
    fontSize: 14
  },
  searchButton: {
    minWidth: 84,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13
  },
  infoCard: {
    backgroundColor: '#F2FAF4',
    borderColor: '#D9ECDD',
    borderWidth: 1,
    borderRadius: 17,
    padding: 14,
    marginTop: 12
  },
  infoTitle: {
    color: colors.greenDark,
    fontWeight: '900',
    fontSize: 12
  },
  infoText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4
  },
  resultHeader: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  resultTitle: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 19
  },
  resultCount: {
    color: colors.muted,
    fontSize: 11,
    maxWidth: '65%',
    textAlign: 'right'
  },
  list: {
    gap: 10
  },
  songCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: '#FFF',
    padding: 12
  },
  songMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  songBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  songBadgeText: {
    color: colors.greenDark,
    fontSize: 21,
    fontWeight: '900'
  },
  songText: {
    flex: 1,
    marginLeft: 11
  },
  songTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900'
  },
  songArtist: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 7
  },
  keyPill: {
    color: colors.greenDark,
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999
  },
  metaPill: {
    color: '#6A5840',
    fontSize: 9,
    fontWeight: '900',
    backgroundColor: '#FFF5E7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999
  },
  source: {
    color: '#8A9490',
    fontSize: 9
  },
  chevron: {
    color: '#A0AAA5',
    fontSize: 28
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 11
  },
  secondaryButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F3F5F4'
  },
  secondaryText: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 11
  },
  primaryButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.green
  },
  primaryText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 11
  }
});
