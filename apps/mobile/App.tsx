import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { type BottomTab } from './src/components/BottomNav';
import { ChordDictionaryScreen } from './src/screens/ChordDictionaryScreen';
import { HomeScreen, type AppFeature } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PadsScreen } from './src/screens/PadsScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { TunerScreen } from './src/screens/TunerScreen';
import { YoutubeScreen } from './src/screens/YoutubeScreen';

type Screen =
  | 'login'
  | 'home'
  | 'songs'
  | 'tuner'
  | 'dictionary'
  | 'youtube'
  | 'pads'
  | 'setlists'
  | 'search'
  | 'tools'
  | 'favorites'
  | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');

  function goHome() {
    setScreen('home');
  }

  function openFeature(feature: AppFeature) {
    setScreen(feature);
  }

  function openBottomTab(tab: BottomTab) {
    if (tab === 'home') {
      goHome();
      return;
    }
    setScreen(tab);
  }

  const dark = screen === 'tuner';

  return (
    <>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={dark ? '#101514' : '#FFFFFF'} />

      {screen === 'login' ? <LoginScreen onLogin={goHome} /> : null}

      {screen === 'home' ? (
        <HomeScreen onOpenFeature={openFeature} onBottomTab={openBottomTab} />
      ) : null}

      {screen === 'tuner' ? <TunerScreen onBack={goHome} /> : null}
      {screen === 'youtube' ? <YoutubeScreen onBack={goHome} /> : null}
      {screen === 'pads' ? <PadsScreen onBack={goHome} /> : null}
      {screen === 'dictionary' ? <ChordDictionaryScreen onBack={goHome} /> : null}

      {screen === 'songs' ? (
        <PlaceholderScreen
          title="Cifras"
          subtitle="Aqui entraremos com busca de músicas, artistas, transposição, capo, cifra interativa, favoritos e rolagem automática."
          icon="♫"
          onBack={goHome}
        />
      ) : null}

      {screen === 'setlists' ? (
        <PlaceholderScreen
          title="Setlists"
          subtitle="Vamos organizar repertórios, shows, ordem das músicas, tonalidades e o futuro Modo Palco."
          icon="☷"
          onBack={goHome}
        />
      ) : null}

      {screen === 'search' ? (
        <PlaceholderScreen
          title="Buscar"
          subtitle="A busca global vai encontrar músicas, artistas, acordes e conteúdos do App Cifra."
          icon="⌕"
          onBack={goHome}
        />
      ) : null}

      {screen === 'tools' ? (
        <PlaceholderScreen
          title="Ferramentas"
          subtitle="Centralizaremos Afinador, Metrônomo, Pads, Dicionário, Campo Harmônico e outras ferramentas musicais."
          icon="⌘"
          onBack={goHome}
        />
      ) : null}

      {screen === 'favorites' ? (
        <PlaceholderScreen
          title="Favoritas"
          subtitle="Suas cifras, músicas, acordes e repertórios favoritos ficarão disponíveis aqui, inclusive para uso offline."
          icon="♡"
          onBack={goHome}
        />
      ) : null}

      {screen === 'profile' ? (
        <PlaceholderScreen
          title="Perfil"
          subtitle="Perfil musical, instrumento principal, afinação, extensão vocal, preferências e progresso de estudo."
          icon="○"
          onBack={goHome}
        />
      ) : null}
    </>
  );
}
