import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  ActivityIndicator,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  generateVoicings,
  transposeChord,
  type ChordVoicing
} from '@app-cifra/music-theory';

import { ChordDiagram } from '../components/ChordDiagram';
import { getExternalCifraSources } from '../music/providers/externalCifraSources';
import { loadSongChart } from '../music/songContent';
import {
  type SongChart,
  type SongSearchResult
} from '../music/types';

type Props = {
  song: SongSearchResult;
  onBack: () => void;
  onAddToSetlist: (song: SongSearchResult) => void;
  onOpenPads: () => void;
};

type ChordCard = {
  sourceChord: string;
  chord: string;
  voicing: ChordVoicing | null;
};

function getFirstVoicing(chord: string): ChordVoicing | null {
  try {
    return (
      generateVoicings({
        chord,
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

function getDisplayChord(chord: string, offset: number) {
  try {
    return transposeChord(chord, offset);
  } catch {
    return chord;
  }
}

function CompactChordStrip({
  chords
}: {
  chords: ChordCard[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.compactChordRow}
    >
      {chords.map(item => (
        <View
          key={item.sourceChord}
          style={styles.compactChordChip}
        >
          <Text style={styles.compactChordText}>
            {item.chord}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function SongDetailScreen({
  song,
  onBack,
  onAddToSetlist,
  onOpenPads
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const maxScrollRef = useRef(0);
  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const [chart, setChart] = useState<SongChart | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const originalKey =
    chart?.key ??
    song.originalKey ??
    song.displayKey ??
    'C';

  const shapeKey =
    chart?.shapeKey ??
    song.displayKey ??
    chart?.key ??
    song.originalKey ??
    'C';

  const [offset, setOffset] = useState(0);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showScrollPanel, setShowScrollPanel] = useState(false);
  const [stageMode, setStageMode] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    let active = true;

    setChart(null);
    setChartError(null);
    setChartLoading(true);
    setOffset(0);
    setAutoScrolling(false);
    setShowScrollPanel(false);
    setStageMode(false);
    scrollYRef.current = 0;

    scrollRef.current?.scrollTo({
      y: 0,
      animated: false
    });

    loadSongChart(song)
      .then(value => {
        if (!active) return;
        setChart(value);
      })
      .catch(error => {
        if (!active) return;

        setChartError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a cifra.'
        );
      })
      .finally(() => {
        if (!active) return;
        setChartLoading(false);
      });

    return () => {
      active = false;
    };
  }, [song.id]);

  const selectedKey = useMemo(
    () => getDisplayChord(originalKey, offset),
    [originalKey, offset]
  );

  const selectedShape = useMemo(
    () => getDisplayChord(shapeKey, offset),
    [shapeKey, offset]
  );

  const chordCards = useMemo<ChordCard[]>(() => {
    if (!chart) return [];

    return chart.chords.map(sourceChord => {
      const chord = getDisplayChord(sourceChord, offset);

      return {
        sourceChord,
        chord,
        voicing: getFirstVoicing(chord)
      };
    });
  }, [chart, offset]);

  const hasPlayableChart =
    chart?.availability === 'available' &&
    chart.sections.length > 0;

  const externalSources = getExternalCifraSources(song);

  function clearScrollTimer() {
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function stopAutoScroll() {
    setAutoScrolling(false);
    clearScrollTimer();
  }

  useEffect(() => {
    if (!autoScrolling) {
      clearScrollTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      const step = Math.max(0.65, speed * 1.15);
      const nextY = scrollYRef.current + step;

      if (nextY >= maxScrollRef.current) {
        scrollYRef.current = maxScrollRef.current;

        scrollRef.current?.scrollTo({
          y: maxScrollRef.current,
          animated: false
        });

        stopAutoScroll();
        return;
      }

      scrollYRef.current = nextY;

      scrollRef.current?.scrollTo({
        y: nextY,
        animated: false
      });
    }, 30);

    return clearScrollTimer;
  }, [autoScrolling, speed]);

  useEffect(() => {
    maxScrollRef.current = Math.max(
      0,
      contentHeight - viewportHeight
    );
  }, [contentHeight, viewportHeight]);

  function handleScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    scrollYRef.current =
      event.nativeEvent.contentOffset.y;
  }

  function toggleAutoScroll() {
    if (!hasPlayableChart) return;

    if (!autoScrolling) {
      setStageMode(true);
      setShowScrollPanel(false);
      setAutoScrolling(true);
      return;
    }

    stopAutoScroll();
  }

  function leaveStageMode() {
    stopAutoScroll();
    setShowScrollPanel(false);
    setStageMode(false);
  }

  async function openSource(url: string) {
    await Linking.openURL(url);
  }

  return (
    <View
      style={[
        styles.screen,
        stageMode && styles.stageScreen
      ]}
    >
      {stageMode && hasPlayableChart ? (
        <View style={styles.stageHeader}>
          <View style={styles.stageHeaderTop}>
            <Pressable
              onPress={leaveStageMode}
              style={styles.stageBackButton}
            >
              <Text style={styles.stageBackText}>‹</Text>
            </Pressable>

            <View style={styles.stageTitleArea}>
              <Text style={styles.stageSongTitle} numberOfLines={1}>
                {song.title}
              </Text>

              <Text style={styles.stageArtist} numberOfLines={1}>
                {song.artist} · Tom {selectedKey}
              </Text>
            </View>
          </View>

          <CompactChordStrip chords={chordCards} />
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          stageMode && styles.stageContent
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={event =>
          setViewportHeight(event.nativeEvent.layout.height)
        }
        onContentSizeChange={(_, height) =>
          setContentHeight(height)
        }
      >
        {!stageMode ? (
          <>
            <View style={styles.header}>
              <Pressable onPress={onBack} style={styles.backButton}>
                <Text style={styles.backText}>‹</Text>
              </Pressable>

              <Text style={styles.headerTitle}>Música</Text>

              {hasPlayableChart ? (
                <Pressable
                  onPress={() => setStageMode(true)}
                  style={styles.stageModeButton}
                >
                  <Text style={styles.stageModeButtonText}>
                    Palco
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.headerSpacer} />
              )}
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>
                CIFRA / REPERTÓRIO
              </Text>

              <Text style={styles.songTitle}>
                {song.title}
              </Text>

              <Text style={styles.artist}>
                {song.artist}
              </Text>

              <Text style={styles.playKeyLabel}>
                TOM PARA TOCAR
              </Text>

              <View style={styles.keySelector}>
                <Pressable
                  style={styles.keyButton}
                  onPress={() => setOffset(value => value - 1)}
                >
                  <Text style={styles.keyButtonText}>−</Text>
                </Pressable>

                <Text style={styles.currentKey}>
                  {selectedKey}
                </Text>

                <Pressable
                  style={styles.keyButton}
                  onPress={() => setOffset(value => value + 1)}
                >
                  <Text style={styles.keyButtonText}>+</Text>
                </Pressable>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Tom da fonte</Text>
                  <Text style={styles.infoValue}>
                    {chart?.key ?? song.originalKey ?? '—'}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Forma</Text>
                  <Text style={styles.infoValue}>
                    {chart?.shapeKey ?? song.displayKey ?? '—'}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Capo</Text>
                  <Text style={styles.infoValue}>
                    {(chart?.capo ?? song.capo)
                      ? `${chart?.capo ?? song.capo}ª casa`
                      : 'Sem capo'}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Fonte</Text>
                  <Text style={styles.infoValue}>
                    {chart?.sourceLabel ?? song.sourceLabel}
                  </Text>
                </View>
              </View>
            </View>

            {chordCards.length ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Acordes da música
                  </Text>

                  <Text style={styles.sectionHint}>
                    deslize para ver
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chordsRow}
                >
                  {chordCards.map(item => (
                    <View
                      key={item.sourceChord}
                      style={styles.chordCard}
                    >
                      <Text style={styles.chordName}>
                        {item.chord}
                      </Text>

                      {item.voicing ? (
                        <ChordDiagram
                          voicing={item.voicing}
                          light
                          compact
                        />
                      ) : (
                        <View style={styles.noDiagram}>
                          <Text style={styles.noDiagramText}>
                            Diagrama{'\n'}indisponível
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : null}

        {chartLoading ? (
          <View style={styles.noticeCard}>
            <ActivityIndicator color="#18AA4F" />
            <Text style={styles.noticeText}>
              Carregando conteúdo da música...
            </Text>
          </View>
        ) : chartError ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              Não foi possível carregar a cifra
            </Text>
            <Text style={styles.noticeText}>
              {chartError}
            </Text>
          </View>
        ) : chart ? (
          <View
            style={[
              styles.cifraCard,
              stageMode && styles.stageCifraCard
            ]}
          >
            {!stageMode ? (
              <>
                <View style={styles.cifraInfoRow}>
                  <View>
                    <Text style={styles.cifraMetaLabel}>TOM</Text>
                    <Text style={styles.cifraMetaValue}>
                      {selectedKey}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.cifraMetaLabel}>FORMA</Text>
                    <Text style={styles.cifraMetaValue}>
                      {selectedShape}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.cifraMetaLabel}>
                      CAPOTRASTE
                    </Text>
                    <Text style={styles.cifraMetaValue}>
                      {(chart.capo ?? song.capo)
                        ? `${chart.capo ?? song.capo}ª casa`
                        : '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />
              </>
            ) : null}

            {chart.availability === 'available' ? (
              <CifraSections
                chart={chart}
                offset={offset}
                stageMode={stageMode}
              />
            ) : (
              <View style={styles.unavailableContent}>
                <Text style={styles.unavailableTitle}>
                  Cifra completa ainda não disponível no App Cifra
                </Text>

                <Text style={styles.unavailableText}>
                  {chart.message ??
                    'Esta música ainda não possui cifra autorizada disponível.'}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {!stageMode ? (
          <>
            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                onAddToSetlist({
                  ...song,
                  displayKey: selectedKey
                })
              }
            >
              <Text style={styles.primaryButtonText}>
                + Adicionar ao Setlist
              </Text>
            </Pressable>

            <Pressable
              style={styles.padButton}
              onPress={onOpenPads}
            >
              <Text style={styles.padButtonText}>
                ▶ Abrir Pads · Tom {selectedKey}
              </Text>
            </Pressable>

            <View style={styles.externalSourcesSection}>
              <Text style={styles.externalSourcesTitle}>
                Fontes externas
              </Text>

              {externalSources.map(source => (
                <Pressable
                  key={source.id}
                  style={styles.sourceButton}
                  onPress={() => openSource(source.url)}
                >
                  <View style={styles.sourceTextBox}>
                    <Text style={styles.sourceButtonText}>
                      {source.label}
                    </Text>
                    <Text style={styles.sourceDescription}>
                      {source.description}
                    </Text>
                  </View>

                  <Text style={styles.sourceArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <View
          style={
            stageMode
              ? styles.stageBottomSpace
              : styles.bottomSpace
          }
        />
      </ScrollView>

      {showScrollPanel && hasPlayableChart ? (
        <View style={styles.scrollPanel}>
          <View style={styles.scrollPanelTop}>
            <Text style={styles.scrollPanelTitle}>
              Rolagem automática
            </Text>

            <Pressable
              onPress={() => setShowScrollPanel(false)}
            >
              <Text style={styles.closePanelText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.speedOptions}>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(value => (
              <Pressable
                key={value}
                onPress={() => setSpeed(value)}
                style={[
                  styles.speedOption,
                  speed === value && styles.speedOptionActive
                ]}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    speed === value && styles.speedOptionTextActive
                  ]}
                >
                  {value.toFixed(2)}x
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.scrollToggleButton}
            onPress={toggleAutoScroll}
          >
            <Text style={styles.scrollToggleText}>
              {autoScrolling ? 'Pausar' : 'Iniciar'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {hasPlayableChart ? (
        <View
          style={[
            styles.bottomBar,
            stageMode && styles.stageBottomBar
          ]}
        >
          <Pressable
            style={styles.bottomItem}
            onPress={() => setOffset(value => value - 1)}
          >
            <Text style={styles.bottomTopText}>TOM</Text>
            <Text style={styles.bottomMainText}>
              − {selectedKey}
            </Text>
          </Pressable>

          <View style={styles.bottomDivider} />

          <Pressable
            style={styles.bottomItem}
            onPress={() =>
              setShowScrollPanel(value => !value)
            }
          >
            <Text style={styles.bottomIcon}>
              {autoScrolling ? 'Ⅱ' : '▶'}
            </Text>
            <Text style={styles.bottomMainText}>Rolagem</Text>
            <Text style={styles.bottomSmallText}>
              {speed.toFixed(2)}x
            </Text>
          </Pressable>

          <View style={styles.bottomDivider} />

          <Pressable
            style={styles.bottomItem}
            onPress={onOpenPads}
          >
            <Text style={styles.bottomIcon}>♫</Text>
            <Text style={styles.bottomMainText}>
              Pad {selectedKey}
            </Text>
          </Pressable>

          <View style={styles.bottomDivider} />

          <Pressable
            style={styles.bottomItem}
            onPress={() => {
              if (stageMode) {
                leaveStageMode();
              } else {
                setStageMode(true);
              }
            }}
          >
            <Text style={styles.bottomIcon}>⌁</Text>
            <Text style={styles.bottomMainText}>
              {stageMode ? 'Sair' : 'Palco'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function CifraSections({
  chart,
  offset,
  stageMode
}: {
  chart: SongChart;
  offset: number;
  stageMode: boolean;
}) {
  return (
    <>
      {chart.sections.map((section, sectionIndex) => (
        <View
          key={`section-${sectionIndex}-${section.title}`}
          style={styles.songSection}
        >
          <Text
            style={[
              styles.sectionLine,
              stageMode && styles.stageSectionLine
            ]}
          >
            [{section.title}]
          </Text>

          {section.introChords?.length ? (
            <Text
              style={[
                styles.chordLine,
                stageMode && styles.stageChordLine
              ]}
            >
              {section.introChords
                .map(chord => getDisplayChord(chord, offset))
                .join('   ')}
            </Text>
          ) : null}

          {section.lines.map((line, index) => (
            <View
              key={`${section.title}-${index}`}
              style={styles.lyricBlock}
            >
              {line.chord ? (
                <Text
                  style={[
                    styles.chordLine,
                    stageMode && styles.stageChordLine
                  ]}
                >
                  {getDisplayChord(line.chord, offset)}
                </Text>
              ) : null}

              <Text
                style={[
                  styles.lyricLine,
                  stageMode && styles.stageLyricLine
                ]}
              >
                {line.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  stageScreen: { backgroundColor: '#0A0F0D' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 48 },
  stageContent: { paddingHorizontal: 0, paddingTop: 126 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  backButton: {
    width: 64,
    height: 44,
    justifyContent: 'center'
  },
  backText: {
    fontSize: 44,
    lineHeight: 44,
    color: '#111827'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827'
  },
  headerSpacer: { width: 64 },

  stageModeButton: {
    minWidth: 64,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#05261C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  stageModeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },

  heroCard: {
    backgroundColor: '#05261C',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24
  },
  eyebrow: {
    color: '#69E0A1',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12
  },
  songTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 34,
    marginTop: 8
  },
  artist: {
    color: '#C7D3CE',
    fontSize: 18,
    marginTop: 4
  },
  playKeyLabel: {
    color: '#90A59D',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 30
  },
  keySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 22
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#123F30',
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyButtonText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '500'
  },
  currentKey: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: '900'
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#103328',
    borderRadius: 16,
    padding: 14
  },
  infoLabel: {
    color: '#83A096',
    fontWeight: '700',
    fontSize: 12
  },
  infoValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginTop: 6
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#101820'
  },
  sectionHint: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700'
  },
  chordsRow: {
    gap: 12,
    paddingVertical: 14,
    paddingRight: 20
  },
  chordCard: {
    width: 168,
    minHeight: 220,
    backgroundColor: '#F2F7F4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE8E0',
    padding: 12,
    alignItems: 'center'
  },
  chordName: {
    color: '#16A34A',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6
  },
  noDiagram: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noDiagramText: {
    color: '#6B7280',
    textAlign: 'center'
  },

  cifraCard: {
    backgroundColor: '#0B1712',
    borderRadius: 24,
    padding: 18,
    marginTop: 10
  },
  stageCifraCard: {
    borderRadius: 0,
    marginTop: 0,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: '#0A0F0D'
  },
  cifraInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cifraMetaLabel: {
    color: '#82948D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  cifraMetaValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#26352F',
    marginVertical: 20
  },

  songSection: { marginBottom: 22 },
  sectionLine: {
    color: '#E5E7EB',
    fontSize: 22,
    lineHeight: 31,
    marginBottom: 14
  },
  stageSectionLine: {
    fontSize: 24,
    lineHeight: 36,
    marginTop: 8,
    marginBottom: 18
  },
  chordLine: {
    color: '#67E1A0',
    fontSize: 23,
    lineHeight: 31,
    fontWeight: '900',
    marginBottom: 2
  },
  stageChordLine: {
    fontSize: 27,
    lineHeight: 38
  },
  lyricBlock: { marginBottom: 8 },
  lyricLine: {
    color: '#F9FAFB',
    fontSize: 22,
    lineHeight: 31,
    marginBottom: 14
  },
  stageLyricLine: {
    fontSize: 25,
    lineHeight: 39,
    marginBottom: 18
  },

  unavailableContent: { paddingVertical: 20 },
  unavailableTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 28
  },
  unavailableText: {
    color: '#A8B7B0',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10
  },

  noticeCard: {
    backgroundColor: '#EFF7F1',
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D7E9DC',
    alignItems: 'center'
  },
  noticeTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  },
  noticeText: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
    textAlign: 'center'
  },

  primaryButton: {
    backgroundColor: '#18AA4F',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 18
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18
  },
  padButton: {
    backgroundColor: '#05261C',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 12
  },
  padButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 17
  },

  externalSourcesSection: { marginTop: 24 },
  externalSourcesTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10
  },
  sourceButton: {
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: '#F1F4F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  sourceTextBox: { flex: 1 },
  sourceButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900'
  },
  sourceDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 3
  },
  sourceArrow: {
    color: '#111827',
    fontSize: 28
  },

  bottomSpace: { height: 130 },
  stageBottomSpace: { height: 150 },

  stageHeader: {
    position: 'absolute',
    zIndex: 20,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D1310',
    borderBottomWidth: 1,
    borderBottomColor: '#233029',
    paddingTop: 42
  },
  stageHeaderTop: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  stageBackButton: {
    width: 42,
    justifyContent: 'center'
  },
  stageBackText: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 42
  },
  stageTitleArea: {
    flex: 1,
    paddingHorizontal: 8
  },
  stageSongTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  stageArtist: {
    color: '#8D9B95',
    fontSize: 12,
    marginTop: 2
  },
  compactChordRow: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8
  },
  compactChordChip: {
    minWidth: 68,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#16211C',
    borderWidth: 1,
    borderColor: '#2A3932',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  compactChordText: {
    color: '#63DE98',
    fontSize: 15,
    fontWeight: '900'
  },

  bottomBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    minHeight: 86,
    borderRadius: 22,
    backgroundColor: '#05261C',
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  stageBottomBar: {
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    minHeight: 82,
    backgroundColor: '#0D1712',
    borderTopWidth: 1,
    borderTopColor: '#24342C'
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  bottomDivider: {
    width: 1,
    marginVertical: 18,
    backgroundColor: '#24513F'
  },
  bottomTopText: {
    color: '#79A994',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  bottomIcon: {
    color: '#62DF98',
    fontSize: 18,
    fontWeight: '900'
  },
  bottomMainText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center'
  },
  bottomSmallText: {
    color: '#7FB79F',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1
  },

  scrollPanel: {
    position: 'absolute',
    zIndex: 30,
    left: 16,
    right: 16,
    bottom: 102,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#101814',
    borderWidth: 1,
    borderColor: '#314038'
  },
  scrollPanelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  scrollPanelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  closePanelText: {
    color: '#C8D1CD',
    fontSize: 26
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14
  },
  speedOption: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1C2722'
  },
  speedOptionActive: {
    backgroundColor: '#69E0A1'
  },
  speedOptionText: {
    color: '#A8B7B0',
    fontWeight: '800'
  },
  speedOptionTextActive: {
    color: '#05261C'
  },
  scrollToggleButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#18AA4F',
    alignItems: 'center',
    paddingVertical: 12
  },
  scrollToggleText: {
    color: '#FFFFFF',
    fontWeight: '900'
  }
});
