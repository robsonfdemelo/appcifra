import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme';
import { preparePlaybackAudio, releaseAudioSession } from '../audio/session';

type Props = { onBack: () => void };

type VideoInfo = {
  id: string;
  title: string;
  author: string;
};

function extractYoutubeId(value: string) {
  const trimmed = value.trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?[^#]*v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function YoutubeScreen({ onBack }: Props) {
  useEffect(() => {
    preparePlaybackAudio().catch(() => undefined);
    return () => {
      releaseAudioSession().catch(() => undefined);
    };
  }, []);
  const [url, setUrl] = useState('');
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function analyze() {
    const id = extractYoutubeId(url);
    if (!id) {
      setVideo(null);
      setMessage('Cole um link válido do YouTube.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${id}`;
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
      if (!response.ok) throw new Error('metadata');
      const data = await response.json();
      setVideo({ id, title: data.title ?? 'Vídeo do YouTube', author: data.author_name ?? 'YouTube' });
    } catch {
      setVideo({ id, title: 'Vídeo do YouTube', author: 'YouTube' });
      setMessage('O vídeo foi carregado, mas não foi possível obter todos os metadados.');
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setUrl('');
    setVideo(null);
    setMessage('');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Cifra pelo YouTube" onBack={onBack} />

        <Text style={styles.intro}>
          Cole o link. O App Cifra identifica o vídeo, abre o player dentro do app e prepara a área de análise harmônica logo abaixo.
        </Text>

        <View style={styles.urlShell}>
          <Text style={styles.linkIcon}>↗</Text>
          <TextInput
            value={url}
            onChangeText={value => {
              setUrl(value);
              setVideo(null);
              setMessage('');
            }}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#98A2A0"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.urlInput}
          />
          {url ? <Pressable onPress={clear} style={styles.clearButton}><Text style={styles.clearText}>×</Text></Pressable> : null}
        </View>

        <Pressable style={styles.analyzeButton} onPress={analyze} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.analyzeText}>Carregar vídeo</Text>}
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {video ? (
          <View style={styles.resultWrap}>
            <View style={styles.playerShell}>
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${video.id}?playsinline=1&rel=0` }}
                style={styles.webview}
                allowsFullscreenVideo
                javaScriptEnabled
                mediaPlaybackRequiresUserAction
                originWhitelist={['https://*', 'http://*']}
              />
            </View>

            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoSource}>{video.author}</Text>

            <View style={styles.analysisHeader}>
              <View>
                <Text style={styles.analysisEyebrow}>ANÁLISE MUSICAL</Text>
                <Text style={styles.sectionTitle}>Possíveis acordes</Text>
              </View>
              <View style={styles.statusPill}><Text style={styles.statusText}>próxima etapa</Text></View>
            </View>

            <View style={styles.pendingCard}>
              <Text style={styles.pendingIcon}>♫</Text>
              <View style={styles.pendingTextWrap}>
                <Text style={styles.pendingTitle}>Player e informações do vídeo já são reais</Text>
                <Text style={styles.pendingText}>
                  A próxima ligação será o analisador de áudio para preencher aqui tom provável, BPM, capo sugerido e a sequência de acordes sincronizada com o tempo do vídeo.
                </Text>
              </View>
            </View>

            <View style={styles.timelinePreview}>
              <Text style={styles.timelineLabel}>Como ficará a timeline</Text>
              <View style={styles.timelineRow}>
                {['Tom', 'BPM', 'Capo', 'Acordes'].map(item => (
                  <View key={item} style={styles.timelineChip}><Text style={styles.timelineChipText}>{item}</Text></View>
                ))}
              </View>
              <Text style={styles.timelineHint}>Os acordes não são preenchidos com valores fictícios nesta versão.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▶</Text>
            <Text style={styles.emptyTitle}>Cole um vídeo para começar</Text>
            <Text style={styles.emptyText}>O próprio vídeo ficará tocando aqui dentro do App Cifra.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingBottom: 36 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 17 },
  urlShell: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  linkIcon: { width: 27, color: '#68736F', fontSize: 19 },
  urlInput: { flex: 1, minHeight: 54, color: colors.ink, fontSize: 13 },
  clearButton: { width: 38, height: 44, alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#7D8783', fontSize: 23 },
  analyzeButton: { minHeight: 54, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  analyzeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  message: { color: '#B26A00', fontSize: 12, lineHeight: 17, marginTop: 9 },
  resultWrap: { marginTop: 20 },
  playerShell: { height: 216, borderRadius: 18, overflow: 'hidden', backgroundColor: '#111111' },
  webview: { flex: 1, backgroundColor: '#111111' },
  videoTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 12 },
  videoSource: { color: colors.muted, fontSize: 12, marginTop: 3 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 11 },
  analysisEyebrow: { color: colors.greenDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 2 },
  statusPill: { borderRadius: 999, backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { color: colors.greenDark, fontSize: 9, fontWeight: '900' },
  pendingCard: { flexDirection: 'row', gap: 12, borderRadius: 18, backgroundColor: '#F8FAF9', borderWidth: 1, borderColor: colors.border, padding: 15 },
  pendingIcon: { width: 34, height: 34, textAlign: 'center', textAlignVertical: 'center', borderRadius: 17, color: colors.greenDark, backgroundColor: colors.greenSoft, fontSize: 19, fontWeight: '900' },
  pendingTextWrap: { flex: 1 },
  pendingTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  pendingText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  timelinePreview: { borderRadius: 18, backgroundColor: '#F1F9F3', padding: 14, marginTop: 12 },
  timelineLabel: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  timelineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  timelineChip: { borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCEADF', paddingHorizontal: 12, paddingVertical: 9 },
  timelineChipText: { color: colors.greenDark, fontSize: 11, fontWeight: '900' },
  timelineHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 10 },
  emptyCard: { alignItems: 'center', borderRadius: 20, backgroundColor: '#F8FAF9', borderWidth: 1, borderColor: '#EDF0EE', paddingHorizontal: 22, paddingVertical: 40, marginTop: 26 },
  emptyIcon: { color: colors.green, fontSize: 31 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 12 },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 }
});
