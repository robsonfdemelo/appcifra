import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';

import {
  preparePlaybackAudio,
  recoverPlaybackAudio,
  releaseAudioSession
} from '../audio/session';

type Props = {
  onBack: () => void;
};

type Tab = 'ambient' | 'performance';
type Preset = 'Worship' | 'Warm' | 'Deep';

const ambientPads = [
  { id: 'C', label: 'C', file: require('../../assets/ambient-keypads-light/C.wav') },
  { id: 'Cs', label: 'C#', file: require('../../assets/ambient-keypads-light/Cs.wav') },
  { id: 'D', label: 'D', file: require('../../assets/ambient-keypads-light/D.wav') },
  { id: 'Ds', label: 'D#', file: require('../../assets/ambient-keypads-light/Ds.wav') },
  { id: 'E', label: 'E', file: require('../../assets/ambient-keypads-light/E.wav') },
  { id: 'F', label: 'F', file: require('../../assets/ambient-keypads-light/F.wav') },
  { id: 'Fs', label: 'F#', file: require('../../assets/ambient-keypads-light/Fs.wav') },
  { id: 'G', label: 'G', file: require('../../assets/ambient-keypads-light/G.wav') },
  { id: 'Gs', label: 'G#', file: require('../../assets/ambient-keypads-light/Gs.wav') },
  { id: 'A', label: 'A', file: require('../../assets/ambient-keypads-light/A.wav') },
  { id: 'As', label: 'A#', file: require('../../assets/ambient-keypads-light/As.wav') },
  { id: 'B', label: 'B', file: require('../../assets/ambient-keypads-light/B.wav') }
] as const;

const performancePads = [
  { id: 'longImpact', label: 'Long Impact', short: 'IMPACT', duration: '4s', file: require('../../assets/performance-pads-long/long-impact.wav') },
  { id: 'subDrop', label: 'Sub Drop', short: 'SUB', duration: '4.5s', file: require('../../assets/performance-pads-long/sub-drop-long.wav') },
  { id: 'riser', label: 'Riser', short: 'RISER', duration: '5s', file: require('../../assets/performance-pads-long/riser-long.wav') },
  { id: 'reverse', label: 'Reverse', short: 'REV', duration: '4s', file: require('../../assets/performance-pads-long/reverse-long.wav') },
  { id: 'swell', label: 'Cymbal Swell', short: 'SWELL', duration: '5.5s', file: require('../../assets/performance-pads-long/swell-long.wav') },
  { id: 'shimmer', label: 'Shimmer Tail', short: 'SHIMMER', duration: '5s', file: require('../../assets/performance-pads-long/shimmer-tail.wav') },
  { id: 'atmosphere', label: 'Atmosphere', short: 'ATMOS', duration: '6s', file: require('../../assets/performance-pads-long/atmosphere.wav') },
  { id: 'transition', label: 'Transition', short: 'TRANS', duration: '4.5s', file: require('../../assets/performance-pads-long/transition.wav') },
  { id: 'airSweep', label: 'Air Sweep', short: 'AIR', duration: '4s', file: require('../../assets/performance-pads-long/air-sweep.wav') },
  { id: 'buildUp', label: 'Build Up', short: 'BUILD', duration: '5s', file: require('../../assets/performance-pads-long/build-up.wav') },
  { id: 'release', label: 'Release', short: 'REL', duration: '4s', file: require('../../assets/performance-pads-long/release.wav') },
  { id: 'cinematicHit', label: 'Cinematic Hit', short: 'CINE', duration: '4.5s', file: require('../../assets/performance-pads-long/cinematic-hit.wav') }
] as const;

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export function PadsScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('ambient');
  const [activeKey, setActiveKey] = useState('C');
  const [playing, setPlaying] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [preset, setPreset] = useState<Preset>('Worship');
  const [intensity, setIntensity] = useState(4);
  const [lastHit, setLastHit] = useState<string | null>(null);

  const c = useAudioPlayer(ambientPads[0].file, { downloadFirst: true, keepAudioSessionActive: true });
  const cs = useAudioPlayer(ambientPads[1].file, { downloadFirst: true, keepAudioSessionActive: true });
  const d = useAudioPlayer(ambientPads[2].file, { downloadFirst: true, keepAudioSessionActive: true });
  const ds = useAudioPlayer(ambientPads[3].file, { downloadFirst: true, keepAudioSessionActive: true });
  const e = useAudioPlayer(ambientPads[4].file, { downloadFirst: true, keepAudioSessionActive: true });
  const f = useAudioPlayer(ambientPads[5].file, { downloadFirst: true, keepAudioSessionActive: true });
  const fs = useAudioPlayer(ambientPads[6].file, { downloadFirst: true, keepAudioSessionActive: true });
  const g = useAudioPlayer(ambientPads[7].file, { downloadFirst: true, keepAudioSessionActive: true });
  const gs = useAudioPlayer(ambientPads[8].file, { downloadFirst: true, keepAudioSessionActive: true });
  const a = useAudioPlayer(ambientPads[9].file, { downloadFirst: true, keepAudioSessionActive: true });
  const as = useAudioPlayer(ambientPads[10].file, { downloadFirst: true, keepAudioSessionActive: true });
  const b = useAudioPlayer(ambientPads[11].file, { downloadFirst: true, keepAudioSessionActive: true });

  const longImpact = useAudioPlayer(performancePads[0].file, { downloadFirst: true, keepAudioSessionActive: true });
  const subDrop = useAudioPlayer(performancePads[1].file, { downloadFirst: true, keepAudioSessionActive: true });
  const riser = useAudioPlayer(performancePads[2].file, { downloadFirst: true, keepAudioSessionActive: true });
  const reverse = useAudioPlayer(performancePads[3].file, { downloadFirst: true, keepAudioSessionActive: true });
  const swell = useAudioPlayer(performancePads[4].file, { downloadFirst: true, keepAudioSessionActive: true });
  const shimmer = useAudioPlayer(performancePads[5].file, { downloadFirst: true, keepAudioSessionActive: true });
  const atmosphere = useAudioPlayer(performancePads[6].file, { downloadFirst: true, keepAudioSessionActive: true });
  const transition = useAudioPlayer(performancePads[7].file, { downloadFirst: true, keepAudioSessionActive: true });
  const airSweep = useAudioPlayer(performancePads[8].file, { downloadFirst: true, keepAudioSessionActive: true });
  const buildUp = useAudioPlayer(performancePads[9].file, { downloadFirst: true, keepAudioSessionActive: true });
  const release = useAudioPlayer(performancePads[10].file, { downloadFirst: true, keepAudioSessionActive: true });
  const cinematicHit = useAudioPlayer(performancePads[11].file, { downloadFirst: true, keepAudioSessionActive: true });

  const ambientPlayers = useMemo(
    () => ({ C: c, Cs: cs, D: d, Ds: ds, E: e, F: f, Fs: fs, G: g, Gs: gs, A: a, As: as, B: b }),
    [c, cs, d, ds, e, f, fs, g, gs, a, as, b]
  );

  const performancePlayers = useMemo(
    () => ({ longImpact, subDrop, riser, reverse, swell, shimmer, atmosphere, transition, airSweep, buildUp, release, cinematicHit }),
    [longImpact, subDrop, riser, reverse, swell, shimmer, atmosphere, transition, airSweep, buildUp, release, cinematicHit]
  );

  const targetVolume = Math.min(1, 0.12 + intensity * 0.15);

  useEffect(() => {
    preparePlaybackAudio().catch(() => undefined);

    return () => {
      Object.values(ambientPlayers).forEach(player => {
        try { player.pause(); } catch {}
      });

      Object.values(performancePlayers).forEach(player => {
        try { player.pause(); } catch {}
      });

      releaseAudioSession().catch(() => undefined);
    };
  }, [ambientPlayers, performancePlayers]);

  useEffect(() => {
    Object.values(ambientPlayers).forEach(player => {
      player.loop = true;
      player.volume = targetVolume;
    });

    Object.values(performancePlayers).forEach(player => {
      player.loop = false;
      player.volume = Math.min(1, targetVolume + 0.05);
    });
  }, [ambientPlayers, performancePlayers, targetVolume]);

  async function fade(
    player: (typeof ambientPlayers)[keyof typeof ambientPlayers],
    from: number,
    to: number,
    duration: number
  ) {
    const steps = 14;

    for (let step = 0; step <= steps; step += 1) {
      player.volume = from + (to - from) * (step / steps);
      await sleep(duration / steps);
    }
  }

  async function selectAmbient(id: string) {
    if (transitioning) return;

    const next = ambientPlayers[id as keyof typeof ambientPlayers];
    const current = ambientPlayers[activeKey as keyof typeof ambientPlayers];

    setTransitioning(true);

    try {
      await preparePlaybackAudio();

      if (id === activeKey && playing) {
        await fade(current, current.volume ?? targetVolume, 0, 380);
        current.pause();
        current.volume = targetVolume;
        setPlaying(false);
        return;
      }

      await next.seekTo(0);
      next.loop = true;
      next.volume = 0;
      next.play();

      if (playing) {
        await Promise.all([
          fade(current, current.volume ?? targetVolume, 0, 1000),
          fade(next, 0, targetVolume, 1000)
        ]);

        current.pause();
        await current.seekTo(0);
        current.volume = targetVolume;
      } else {
        await fade(next, 0, targetVolume, 760);
      }

      setActiveKey(id);
      setPlaying(true);
    } catch {
      try {
        await recoverPlaybackAudio();
        next.volume = targetVolume;
        next.loop = true;
        next.play();
        setActiveKey(id);
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } finally {
      setTransitioning(false);
    }
  }

  async function hitPerformancePad(id: string) {
    const player =
      performancePlayers[id as keyof typeof performancePlayers];

    try {
      await preparePlaybackAudio();

      // Tocar de novo reinicia o efeito do começo.
      player.pause();
      await player.seekTo(0);
      player.volume = Math.min(1, targetVolume + 0.05);
      player.play();

      setLastHit(id);

      setTimeout(() => {
        setLastHit(current =>
          current === id ? null : current
        );
      }, 260);
    } catch {
      try {
        await recoverPlaybackAudio();
        await player.seekTo(0);
        player.play();
      } catch {}
    }
  }

  const currentLabel =
    ambientPads.find(item => item.id === activeKey)?.label ?? activeKey;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.titleBox}>
            <Text style={styles.title}>Performance Pads</Text>
            <Text style={styles.subtitle}>AMBIENT + LONG FX</Text>
          </View>

          <View style={styles.topSpacer} />
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setTab('ambient')}
            style={[
              styles.tabButton,
              tab === 'ambient' && styles.tabButtonActive
            ]}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'ambient' && styles.tabTextActive
              ]}
            >
              Ambient
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab('performance')}
            style={[
              styles.tabButton,
              tab === 'performance' && styles.tabButtonActive
            ]}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'performance' && styles.tabTextActive
              ]}
            >
              Long FX
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {tab === 'ambient' ? (
            <>
              <View style={styles.hero}>
                <View>
                  <Text style={styles.heroSmall}>TONALIDADE ATUAL</Text>
                  <Text style={styles.heroKey}>{currentLabel}</Text>
                </View>

                <Text style={styles.heroState}>
                  {transitioning
                    ? 'TRANSIÇÃO'
                    : playing
                      ? 'TOCANDO'
                      : 'PRONTO'}
                </Text>
              </View>

              <View style={styles.presetRow}>
                {(['Worship', 'Warm', 'Deep'] as Preset[]).map(item => (
                  <Pressable
                    key={item}
                    onPress={() => setPreset(item)}
                    style={[
                      styles.preset,
                      preset === item && styles.presetActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        preset === item && styles.presetTextActive
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Escolha o tom</Text>

              <View style={styles.ambientGrid}>
                {ambientPads.map(item => {
                  const active = item.id === activeKey;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => selectAmbient(item.id)}
                      style={[
                        styles.ambientPad,
                        active && styles.ambientPadActive,
                        active && playing && styles.ambientPadPlaying
                      ]}
                    >
                      <Text style={styles.padMainText}>{item.label}</Text>
                      <Text style={styles.padMeta}>
                        {active && playing
                          ? 'PLAYING'
                          : preset.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <View style={styles.fxHero}>
                <Text style={styles.fxEyebrow}>LONG PERFORMANCE FX</Text>
                <Text style={styles.fxTitle}>Sons sustentados</Text>
                <Text style={styles.fxText}>
                  Efeitos de 4 a 6 segundos para transições, entradas e momentos de impacto.
                </Text>
              </View>

              <View style={styles.fxGrid}>
                {performancePads.map(item => {
                  const hit = lastHit === item.id;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => hitPerformancePad(item.id)}
                      style={({ pressed }) => [
                        styles.fxPad,
                        (pressed || hit) && styles.fxPadHit
                      ]}
                    >
                      <Text style={styles.fxShort}>{item.short}</Text>
                      <Text style={styles.fxLabel}>{item.label}</Text>
                      <Text style={styles.fxDuration}>{item.duration}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.tipCard}>
                <Text style={styles.tipTitle}>Camadas independentes</Text>
                <Text style={styles.tipText}>
                  Um efeito não precisa cortar o Ambient. Tocar novamente no mesmo FX reinicia o som do começo.
                </Text>
              </View>
            </>
          )}

          <View style={styles.intensityCard}>
            <Text style={styles.intensityTitle}>INTENSIDADE</Text>

            <View style={styles.intensityBars}>
              {[1, 2, 3, 4, 5].map(value => (
                <Pressable
                  key={value}
                  onPress={() => setIntensity(value)}
                  style={[
                    styles.intensityBar,
                    value <= intensity && styles.intensityBarActive,
                    { height: 8 + value * 5 }
                  ]}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080512' },
  screen: { flex: 1, backgroundColor: '#080512' },

  topBar: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#171025',
    borderWidth: 1,
    borderColor: '#392A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 38,
    marginTop: -4
  },
  titleBox: { flex: 1, alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  subtitle: {
    color: '#8F7DE0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2
  },
  topSpacer: { width: 46 },

  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    marginBottom: 10
  },
  tabButton: {
    flex: 1,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#15101D',
    borderWidth: 1,
    borderColor: '#2C2337',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabButtonActive: {
    backgroundColor: '#3A2D77',
    borderColor: '#806DFF'
  },
  tabText: { color: '#777080', fontWeight: '900' },
  tabTextActive: { color: '#FFFFFF' },

  content: { paddingHorizontal: 18, paddingBottom: 34 },

  hero: {
    minHeight: 145,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#161025',
    borderWidth: 1,
    borderColor: '#392A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heroSmall: {
    color: '#9388A9',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4
  },
  heroKey: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 72
  },
  heroState: {
    color: '#CBC2FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },

  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  preset: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#15101D',
    borderWidth: 1,
    borderColor: '#2B2334',
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetActive: {
    backgroundColor: '#392E70',
    borderColor: '#806DFF'
  },
  presetText: {
    color: '#756D7F',
    fontWeight: '800'
  },
  presetTextActive: {
    color: '#FFFFFF'
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 22,
    marginBottom: 12
  },

  ambientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  ambientPad: {
    width: '31.4%',
    minHeight: 102,
    borderRadius: 22,
    backgroundColor: '#15101D',
    borderWidth: 1,
    borderColor: '#2B2335',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ambientPadActive: {
    backgroundColor: '#251C46',
    borderColor: '#6F5ED0'
  },
  ambientPadPlaying: {
    backgroundColor: '#413388',
    borderColor: '#9787FF'
  },
  padMainText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900'
  },
  padMeta: {
    color: '#9D93AB',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 7
  },

  fxHero: {
    borderRadius: 24,
    backgroundColor: '#161025',
    borderWidth: 1,
    borderColor: '#392A5F',
    padding: 20
  },
  fxEyebrow: {
    color: '#9D8DFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6
  },
  fxTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6
  },
  fxText: {
    color: '#9F97A8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6
  },

  fxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14
  },
  fxPad: {
    width: '48.5%',
    minHeight: 132,
    borderRadius: 24,
    backgroundColor: '#181121',
    borderWidth: 1,
    borderColor: '#32263D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fxPadHit: {
    backgroundColor: '#6549C8',
    borderColor: '#B0A2FF',
    transform: [{ scale: 0.97 }]
  },
  fxShort: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900'
  },
  fxLabel: {
    color: '#9D93A7',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6
  },
  fxDuration: {
    color: '#7B6FCC',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 5
  },

  tipCard: {
    borderRadius: 18,
    backgroundColor: '#13101A',
    borderWidth: 1,
    borderColor: '#2C2434',
    padding: 14,
    marginTop: 14
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  tipText: {
    color: '#7D7685',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4
  },

  intensityCard: {
    borderRadius: 18,
    backgroundColor: '#13101A',
    borderWidth: 1,
    borderColor: '#2C2434',
    padding: 14,
    marginTop: 14
  },
  intensityTitle: {
    color: '#817887',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  intensityBars: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 6
  },
  intensityBar: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#2A2430'
  },
  intensityBarActive: {
    backgroundColor: '#745FE1'
  }
});
