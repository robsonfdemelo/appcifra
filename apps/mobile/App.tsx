import React, { useEffect, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { type BottomTab } from './src/components/BottomNav';
import { ChordDictionaryScreen } from './src/screens/ChordDictionaryScreen';
import { HomeScreen, type AppFeature } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PadsScreen } from './src/screens/PadsScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { SetlistDetailScreen } from './src/screens/SetlistDetailScreen';
import { SetlistsScreen } from './src/screens/SetlistsScreen';
import { SongDetailScreen } from './src/screens/SongDetailScreen';
import { SongsSearchScreen } from './src/screens/SongsSearchScreen';
import { TunerScreen } from './src/screens/TunerScreen';
import { YoutubeScreen } from './src/screens/YoutubeScreen';
import {
  type Setlist,
  type SetlistSong,
  type SongSearchResult
} from './src/music/types';
import { loadSetlists, saveSetlists } from './src/storage/setlists';

type Screen =
  | 'login'
  | 'home'
  | 'songs'
  | 'song-detail'
  | 'tuner'
  | 'dictionary'
  | 'youtube'
  | 'pads'
  | 'setlists'
  | 'setlist-detail'
  | 'search'
  | 'tools'
  | 'favorites'
  | 'profile';

function createSetlistSong(song: SongSearchResult): SetlistSong {
  const selectedKey = song.displayKey ?? song.originalKey;

  const setlistSong: SetlistSong = {
    ...song,
    setlistItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  };

  if (selectedKey) {
    setlistSong.selectedKey = selectedKey;
  }

  return setlistSong;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(null);
  const [pendingSong, setPendingSong] = useState<SongSearchResult | null>(null);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlistId, setSelectedSetlistId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    loadSetlists()
      .then(value => {
        setSetlists(value);
        setStorageReady(true);
      })
      .catch(() => {
        setSetlists([]);
        setStorageReady(true);
      });
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    saveSetlists(setlists).catch(() => undefined);
  }, [setlists, storageReady]);

  function goHome() {
    setPendingSong(null);
    setScreen('home');
  }

  function openFeature(feature: AppFeature) {
    if (feature === 'songs') {
      setSearchQuery('');
    }

    setScreen(feature);
  }

  function openBottomTab(tab: BottomTab) {
    if (tab === 'home') {
      goHome();
      return;
    }

    if (tab === 'search') {
      setSearchQuery('');
    }

    setScreen(tab);
  }

  function openSearch(query = '') {
    setSearchQuery(query);
    setScreen('search');
  }

  function openSong(song: SongSearchResult) {
    setSelectedSong(song);
    setScreen('song-detail');
  }

  function requestAddToSetlist(song: SongSearchResult) {
    setPendingSong(song);
    setScreen('setlists');
  }

  function createSetlist(name: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const songs: SetlistSong[] = pendingSong ? [createSetlistSong(pendingSong)] : [];

    const created: Setlist = {
      id,
      name,
      createdAt: new Date().toISOString(),
      songs
    };

    setSetlists(current => [created, ...current]);
    setPendingSong(null);
    setSelectedSetlistId(id);
    setScreen('setlist-detail');
  }

  function addPendingToSetlist(setlistId: string) {
    if (!pendingSong) return;

    const songToAdd = createSetlistSong(pendingSong);

    setSetlists(current =>
      current.map(setlist => {
        if (setlist.id !== setlistId) return setlist;

        const alreadyExists = setlist.songs.some(item => item.id === pendingSong.id);

        if (alreadyExists) {
          Alert.alert(
            'Música já adicionada',
            'Essa música já está neste setlist.'
          );
          return setlist;
        }

        return {
          ...setlist,
          songs: [...setlist.songs, songToAdd]
        };
      })
    );

    setSelectedSetlistId(setlistId);
    setPendingSong(null);
    setScreen('setlist-detail');
  }

  function openSetlist(setlist: Setlist) {
    setSelectedSetlistId(setlist.id);
    setScreen('setlist-detail');
  }

  function removeFromSetlist(index: number) {
    if (!selectedSetlistId) return;

    setSetlists(current =>
      current.map(setlist =>
        setlist.id === selectedSetlistId
          ? {
              ...setlist,
              songs: setlist.songs.filter(
                (_, itemIndex) => itemIndex !== index
              )
            }
          : setlist
      )
    );
  }

  function moveSetlistSong(index: number, direction: -1 | 1) {
    if (!selectedSetlistId) return;

    setSetlists(current =>
      current.map(setlist => {
        if (setlist.id !== selectedSetlistId) return setlist;

        const target = index + direction;

        if (target < 0 || target >= setlist.songs.length) {
          return setlist;
        }

        const songs = [...setlist.songs];
        const currentSong = songs[index];
        const targetSong = songs[target];

        if (!currentSong || !targetSong) {
          return setlist;
        }

        songs[index] = targetSong;
        songs[target] = currentSong;

        return {
          ...setlist,
          songs
        };
      })
    );
  }

  const selectedSetlist =
    setlists.find(item => item.id === selectedSetlistId) ?? null;

  const dark = screen === 'tuner';

  return (
    <>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={dark ? '#101514' : '#FFFFFF'}
      />

      {screen === 'login' ? <LoginScreen onLogin={goHome} /> : null}

      {screen === 'home' ? (
        <HomeScreen
          onOpenFeature={openFeature}
          onBottomTab={openBottomTab}
          onSearch={openSearch}
        />
      ) : null}

      {screen === 'tuner' ? <TunerScreen onBack={goHome} /> : null}

      {screen === 'youtube' ? <YoutubeScreen onBack={goHome} /> : null}

      {screen === 'pads' ? <PadsScreen onBack={goHome} /> : null}

      {screen === 'dictionary' ? (
        <ChordDictionaryScreen onBack={goHome} />
      ) : null}

      {screen === 'songs' || screen === 'search' ? (
        <SongsSearchScreen
          initialQuery={searchQuery}
          onBack={goHome}
          onOpenSong={openSong}
          onAddToSetlist={requestAddToSetlist}
          {...(screen === 'search' ? { onBottomTab: openBottomTab } : {})}
        />
      ) : null}

      {screen === 'song-detail' && selectedSong ? (
        <SongDetailScreen
          song={selectedSong}
          onBack={() => setScreen('search')}
          onAddToSetlist={requestAddToSetlist}
          onOpenPads={() => setScreen('pads')}
        />
      ) : null}

      {screen === 'setlists' ? (
        <SetlistsScreen
          setlists={setlists}
          pendingSong={pendingSong}
          onBack={goHome}
          onCreate={createSetlist}
          onOpen={openSetlist}
          onAddToExisting={addPendingToSetlist}
        />
      ) : null}

      {screen === 'setlist-detail' && selectedSetlist ? (
        <SetlistDetailScreen
          setlist={selectedSetlist}
          onBack={() => setScreen('setlists')}
          onOpenSong={index => {
            const song = selectedSetlist.songs[index];

            if (!song) return;

            setSelectedSong(song);
            setScreen('song-detail');
          }}
          onRemove={removeFromSetlist}
          onMove={moveSetlistSong}
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
