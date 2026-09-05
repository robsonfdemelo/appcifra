import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { requestRecordingPermissionsAsync, useAudioStream, type AudioStreamBuffer } from 'expo-audio';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme';
import { detectPitch } from '../audio/pitch';
import { prepareRecordingAudio, releaseAudioSession } from '../audio/session';

type Props = { onBack: () => void };

const strings = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

export function TunerScreen({ onBack }: Props) {
  const [selectedString, setSelectedString] = useState(0);
  const [pitch, setPitch] = useState<{ note: string; octave: number; cents: number; frequency: number } | null>(null);
  const lastUpdate = useRef(0);

  const audioStream = useAudioStream({
    sampleRate: 48000,
    channels: 1,
    encoding: 'float32',
    onBuffer: (buffer: AudioStreamBuffer) => {
      const now = Date.now();
      if (now - lastUpdate.current < 90) return;
      lastUpdate.current = now;
      const frames = new Float32Array(buffer.data);
      const detected = detectPitch(frames, buffer.sampleRate);
      if (detected) setPitch(detected);
    }
  });


  useEffect(() => {
    return () => {
      try {
        audioStream.stream.stop();
      } catch {}
      releaseAudioSession().catch(() => undefined);
    };
  }, []);

  const bars = useMemo(() => Array.from({ length: 17 }), []);
  const cents = pitch?.cents ?? 0;
  const status = !audioStream.isStreaming ? 'Pronto' : !pitch ? 'Ouvindo...' : Math.abs(cents) <= 5 ? 'Afinado!' : cents < 0 ? 'Aperte a corda' : 'Afrouxe a corda';
  const displayNote = pitch ? `${pitch.note}${pitch.octave}` : strings[selectedString];
  const needleOffset = Math.max(-70, Math.min(70, cents * 1.4));

  async function toggleMicrophone() {
    if (audioStream.isStreaming) {
      audioStream.stream.stop();
      setPitch(null);
      await releaseAudioSession();
      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microfone', 'Precisamos da permissão do microfone para usar o afinador.');
      return;
    }

    try {
      await prepareRecordingAudio();
      await audioStream.stream.start();
    } catch {
      Alert.alert('Afinador', 'Não foi possível iniciar a leitura do microfone.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title="Afinador" onBack={onBack} rightLabel="Padrão⌄" dark />
        <View style={styles.meterWrap}>
          <View style={styles.arc}>
            {Array.from({ length: 13 }).map((_, index) => (
              <View key={index} style={[styles.tick, { transform: [{ rotate: `${-50 + index * 8.3}deg` }, { translateY: -92 }] }]} />
            ))}
            <View style={[styles.centerLine, { transform: [{ translateX: needleOffset }] }]} />
          </View>
          <Text style={styles.flat}>♭</Text><Text style={styles.sharp}>#</Text>
        </View>
        <Text style={styles.note}>{displayNote}</Text>
        <Text style={styles.status}>{status}</Text>
        {pitch ? <Text style={styles.frequency}>{pitch.frequency.toFixed(1)} Hz · {cents > 0 ? '+' : ''}{cents} cents</Text> : null}
        <View style={styles.waveform}>{bars.map((_, index) => { const distance = Math.abs(8 - index); const height = 14 + (8 - Math.min(distance, 8)) * 4; return <View key={index} style={[styles.waveBar, { height, opacity: distance < 5 ? 1 : 0.36 }]} />; })}</View>
        <Text style={styles.helper}>Toque uma corda por vez</Text>
        <View style={styles.stringRow}>{strings.map((string, index) => { const selected = index === selectedString; return <Pressable key={`${string}-${index}`} onPress={() => setSelectedString(index)} style={[styles.stringButton, selected ? styles.stringButtonSelected : null]}><Text style={[styles.stringText, selected ? styles.stringTextSelected : null]}>{string.replace(/[0-9]/g, '')}</Text></Pressable>; })}</View>
        <Pressable style={[styles.micButton, audioStream.isStreaming ? styles.micButtonActive : null]} onPress={toggleMicrophone}><Text style={styles.micIcon}>🎤</Text><Text style={styles.micText}>{audioStream.isStreaming ? 'Parar microfone' : 'Ativar microfone'}</Text></Pressable>
        <View style={styles.tipCard}><View style={styles.tipIconBox}><Text style={styles.tipIcon}>♩</Text></View><View style={styles.tipContent}><Text style={styles.tipTitle}>Dica</Text><Text style={styles.tipText}>Toque uma corda limpa e deixe o som sustentar por alguns segundos.</Text></View></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.dark},content:{flex:1,paddingHorizontal:18,paddingBottom:20},meterWrap:{height:170,marginTop:18,position:'relative',alignItems:'center',justifyContent:'center'},arc:{width:240,height:120,borderTopLeftRadius:130,borderTopRightRadius:130,borderTopWidth:2,borderColor:'#313936',position:'relative',overflow:'visible'},tick:{position:'absolute',left:118,top:92,width:2,height:16,backgroundColor:'#4A5551'},centerLine:{position:'absolute',left:117,top:-2,width:4,height:92,borderRadius:2,backgroundColor:'#1ED760'},flat:{position:'absolute',left:18,bottom:20,color:'#69746F',fontSize:20},sharp:{position:'absolute',right:18,bottom:20,color:'#69746F',fontSize:20},note:{color:'#FFF',fontSize:58,lineHeight:66,fontWeight:'900',textAlign:'center',marginTop:-18},status:{color:'#1ED760',fontSize:17,fontWeight:'900',textAlign:'center',marginTop:3},frequency:{color:'#9AA7A2',fontSize:12,textAlign:'center',marginTop:4},waveform:{minHeight:68,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,marginTop:8},waveBar:{width:4,borderRadius:4,backgroundColor:'#1ED760'},helper:{color:'#E7ECEA',textAlign:'center',fontSize:14,fontWeight:'700'},stringRow:{flexDirection:'row',justifyContent:'space-between',marginTop:18},stringButton:{width:46,height:46,borderRadius:23,backgroundColor:'#222A27',borderWidth:1,borderColor:'#2F3935',alignItems:'center',justifyContent:'center'},stringButtonSelected:{backgroundColor:'#0E8F3D',borderColor:'#21D966'},stringText:{color:'#D2D9D6',fontSize:15,fontWeight:'900'},stringTextSelected:{color:'#FFF'},micButton:{minHeight:52,flexDirection:'row',gap:9,alignItems:'center',justifyContent:'center',backgroundColor:'#1B2421',borderWidth:1,borderColor:'#2C3833',borderRadius:16,marginTop:20},micButtonActive:{borderColor:'#1ED760',backgroundColor:'#152A1C'},micIcon:{fontSize:18},micText:{color:'#FFF',fontSize:14,fontWeight:'900'},tipCard:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#2B3732',backgroundColor:'#17201D',borderRadius:18,padding:14,marginTop:18},tipIconBox:{width:44,height:44,borderRadius:14,backgroundColor:'#0E1714',alignItems:'center',justifyContent:'center'},tipIcon:{color:'#FFF',fontSize:22},tipContent:{flex:1},tipTitle:{color:'#1ED760',fontSize:15,fontWeight:'900'},tipText:{color:'#AAB5B1',fontSize:12,lineHeight:18,marginTop:3}
});
