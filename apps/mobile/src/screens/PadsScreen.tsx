import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme';
import { preparePlaybackAudio, recoverPlaybackAudio, releaseAudioSession } from '../audio/session';

type Props = { onBack: () => void };

type KeyPad = {
  id: string;
  label: string;
  file: number;
};

const keyPads: KeyPad[] = [
  { id: 'C', label: 'C', file: require('../../assets/ambient-keypads/C.wav') },
  { id: 'Cs', label: 'C#', file: require('../../assets/ambient-keypads/Cs.wav') },
  { id: 'D', label: 'D', file: require('../../assets/ambient-keypads/D.wav') },
  { id: 'Ds', label: 'D#', file: require('../../assets/ambient-keypads/Ds.wav') },
  { id: 'E', label: 'E', file: require('../../assets/ambient-keypads/E.wav') },
  { id: 'F', label: 'F', file: require('../../assets/ambient-keypads/F.wav') },
  { id: 'Fs', label: 'F#', file: require('../../assets/ambient-keypads/Fs.wav') },
  { id: 'G', label: 'G', file: require('../../assets/ambient-keypads/G.wav') },
  { id: 'Gs', label: 'G#', file: require('../../assets/ambient-keypads/Gs.wav') },
  { id: 'A', label: 'A', file: require('../../assets/ambient-keypads/A.wav') },
  { id: 'As', label: 'A#', file: require('../../assets/ambient-keypads/As.wav') },
  { id: 'B', label: 'B', file: require('../../assets/ambient-keypads/B.wav') }
];

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms));

export function PadsScreen({ onBack }: Props) {
  const [activeKey, setActiveKey] = useState('C');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(4);
  const [transitioning, setTransitioning] = useState(false);

  const c = useAudioPlayer(keyPads[0]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const cs = useAudioPlayer(keyPads[1]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const d = useAudioPlayer(keyPads[2]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const ds = useAudioPlayer(keyPads[3]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const e = useAudioPlayer(keyPads[4]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const f = useAudioPlayer(keyPads[5]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const fs = useAudioPlayer(keyPads[6]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const g = useAudioPlayer(keyPads[7]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const gs = useAudioPlayer(keyPads[8]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const a = useAudioPlayer(keyPads[9]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const as = useAudioPlayer(keyPads[10]!.file, { downloadFirst: true, keepAudioSessionActive: true });
  const b = useAudioPlayer(keyPads[11]!.file, { downloadFirst: true, keepAudioSessionActive: true });

  const players = useMemo(
    () => ({ C: c, Cs: cs, D: d, Ds: ds, E: e, F: f, Fs: fs, G: g, Gs: gs, A: a, As: as, B: b }),
    [c, cs, d, ds, e, f, fs, g, gs, a, as, b]
  );

  const targetVolume = volume / 5;

  useEffect(() => {
    preparePlaybackAudio().catch(() => undefined);

    return () => {
      Object.values(players).forEach(player => {
        try {
          player.pause();
        } catch {}
      });
      releaseAudioSession().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    Object.values(players).forEach(player => {
      player.volume = targetVolume;
      player.loop = true;
    });
  }, [players, targetVolume]);

  async function fadePlayer(
    player: (typeof players)[keyof typeof players],
    from: number,
    to: number,
    duration = 1800
  ) {
    const steps = 24;
    for (let step = 0; step <= steps; step += 1) {
      player.volume = from + (to - from) * (step / steps);
      await sleep(duration / steps);
    }
  }

  async function stopAll() {
    const activePlayers = Object.values(players);
    await Promise.all(
      activePlayers.map(async player => {
        try {
          await fadePlayer(player, player.volume ?? targetVolume, 0, 700);
          player.pause();
          await player.seekTo(0);
          player.volume = targetVolume;
        } catch {}
      })
    );
    setPlaying(false);
  }

  async function switchPad(id: string) {
    if (transitioning) return;
    setTransitioning(true);

    const next = players[id as keyof typeof players];
    const current = players[activeKey as keyof typeof players];

    try {
      await preparePlaybackAudio();

      if (id === activeKey && playing) {
        await fadePlayer(current, current.volume ?? targetVolume, 0, 900);
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
          fadePlayer(current, current.volume ?? targetVolume, 0, 2200),
          fadePlayer(next, 0, targetVolume, 2200)
        ]);
        current.pause();
        await current.seekTo(0);
        current.volume = targetVolume;
      } else {
        await fadePlayer(next, 0, targetVolume, 1800);
      }

      setActiveKey(id);
      setPlaying(true);
    } catch {
      try {
        await recoverPlaybackAudio();
        await next.seekTo(0);
        next.loop = true;
        next.volume = targetVolume;
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

  async function toggleCurrent() {
    const player = players[activeKey as keyof typeof players];

    if (playing) {
      await fadePlayer(player, player.volume ?? targetVolume, 0, 900);
      player.pause();
      player.volume = targetVolume;
      setPlaying(false);
      return;
    }

    try {
      await preparePlaybackAudio();
      player.volume = 0;
      player.play();
      await fadePlayer(player, 0, targetVolume, 1800);
      setPlaying(true);
    } catch {
      try {
        await recoverPlaybackAudio();
        player.volume = targetVolume;
        player.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  const currentLabel = keyPads.find(item => item.id === activeKey)?.label ?? activeKey;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Pads" onBack={onBack} />

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>WORSHIP / AMBIENT</Text>
              <Text style={styles.heroTitle}>Peaceful Atmosphere</Text>
            </View>
            <View style={styles.ambientBadge}>
              <Text style={styles.ambientBadgeText}>AMBIENT</Text>
            </View>
          </View>

          <Text style={styles.heroKey}>{currentLabel}</Text>
          <Text style={styles.heroText}>
            Pad contínuo, macio e profundo para preencher a música com ambiência sem competir com voz ou instrumento.
          </Text>
        </View>

        <View style={styles.modeRow}>
          <View style={[styles.modeChip, styles.modeChipActive]}>
            <Text style={styles.modeChipActiveText}>Peaceful</Text>
          </View>
          <View style={styles.modeChip}><Text style={styles.modeChipText}>Worship</Text></View>
          <View style={styles.modeChip}><Text style={styles.modeChipText}>Warm</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Escolha o tom</Text>
            <Text style={styles.sectionSubtitle}>A troca de tonalidade usa crossfade longo e suave.</Text>
          </View>
          <Text style={styles.keyCount}>12 TONS</Text>
        </View>

        <View style={styles.padGrid}>
          {keyPads.map(item => {
            const active = item.id === activeKey;
            return (
              <Pressable
                key={item.id}
                onPress={() => switchPad(item.id)}
                disabled={transitioning}
                style={[styles.pad, active ? styles.padActive : null]}
              >
                <Text style={[styles.padLabel, active ? styles.padLabelActive : null]}>{item.label}</Text>
                <Text style={[styles.padMeta, active ? styles.padMetaActive : null]}>
                  {active && playing ? 'TOCANDO' : active ? 'SELECIONADO' : 'AMBIENT'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.nowCard}>
          <View>
            <Text style={styles.nowLabel}>PAD ATUAL</Text>
            <Text style={styles.nowValue}>{currentLabel} · Peaceful</Text>
          </View>
          <View style={styles.livePill}>
            <View style={[styles.liveDot, !playing ? styles.liveDotOff : null]} />
            <Text style={styles.liveText}>
              {transitioning ? 'TRANSIÇÃO' : playing ? 'ATIVO' : 'PAUSADO'}
            </Text>
          </View>
        </View>

        <View style={styles.transportCard}>
          <View style={styles.transportRow}>
            <Pressable style={styles.playButton} onPress={toggleCurrent} disabled={transitioning}>
              <Text style={styles.playButtonText}>{playing ? 'Ⅱ' : '▶'}</Text>
            </Pressable>

            <Pressable style={styles.stopButton} onPress={stopAll} disabled={transitioning}>
              <Text style={styles.stopText}>■</Text>
            </Pressable>

            <View style={styles.volumeArea}>
              <Text style={styles.volumeLabel}>INTENSIDADE</Text>
              <View style={styles.volumeBars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.volumeBar,
                      index < volume ? styles.volumeBarActive : null,
                      { height: 9 + index * 4 }
                    ]}
                    onPress={() => setVolume(index + 1)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Worship Ambient original do App Cifra</Text>
          <Text style={styles.infoText}>
            Texturas originais com tônica, quinta, oitava, estéreo amplo, movimento lento e entrada suave.
            A troca entre tons usa cerca de 2,2 segundos de crossfade para evitar cortes secos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingBottom: 36 },
  heroCard: { marginTop: 10, borderRadius: 24, padding: 20, backgroundColor: '#0B1E17' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  heroEyebrow: { color: '#7FE0A1', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 5 },
  ambientBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#153B2A' },
  ambientBadgeText: { color: '#88E1A7', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroKey: { color: '#FFFFFF', fontSize: 58, fontWeight: '900', marginTop: 17 },
  heroText: { color: '#C7D5CE', fontSize: 13, lineHeight: 19, marginTop: 4 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  modeChip: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#F3F5F4', borderWidth: 1, borderColor: colors.border },
  modeChipActive: { backgroundColor: '#E9F8EE', borderColor: '#BDE4CA' },
  modeChipText: { color: '#87928D', fontSize: 11, fontWeight: '800' },
  modeChipActiveText: { color: colors.greenDark, fontSize: 11, fontWeight: '900' },
  sectionHeader: { marginTop: 22, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  keyCount: { color: colors.greenDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  padGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pad: { width: '31.4%', minHeight: 88, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAF9', alignItems: 'center', justifyContent: 'center' },
  padActive: { backgroundColor: colors.green, borderColor: colors.green },
  padLabel: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  padLabelActive: { color: '#FFFFFF' },
  padMeta: { color: '#9AA5A0', fontSize: 8, letterSpacing: 1.1, fontWeight: '900', marginTop: 7 },
  padMetaActive: { color: '#DDF8E6' },
  nowCard: { marginTop: 16, minHeight: 82, borderRadius: 18, backgroundColor: '#F8FAF9', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowLabel: { color: '#98A2A0', fontSize: 9, letterSpacing: 1.4, fontWeight: '900' },
  nowValue: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: '#ECF8EF' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  liveDotOff: { backgroundColor: '#AAB3AF' },
  liveText: { color: colors.greenDark, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  transportCard: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 12 },
  transportRow: { flexDirection: 'row', alignItems: 'center' },
  playButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  playButtonText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  stopButton: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#F0F2F1', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  stopText: { color: colors.ink, fontSize: 19 },
  volumeArea: { marginLeft: 'auto', alignItems: 'flex-end' },
  volumeLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  volumeBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 28, marginTop: 8 },
  volumeBar: { width: 8, borderRadius: 4, backgroundColor: '#E1E6E3' },
  volumeBarActive: { backgroundColor: colors.green },
  infoCard: { borderRadius: 18, backgroundColor: '#F1F9F3', borderWidth: 1, borderColor: '#D8EBDD', padding: 15, marginTop: 16 },
  infoTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 5 }
});
