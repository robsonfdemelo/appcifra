import { type SongSearchResult } from './types';

const curated: SongSearchResult[] = [
  {
    id: 'morada-so-tu-es-santo',
    title: 'Só Tu És Santo',
    artist: 'MORADA',
    originalKey: 'A',
    displayKey: 'G',
    capo: 2,
    sourceLabel: 'Cifra Club',
    sourceUrl: 'https://www.cifraclub.com.br/ministerio-morada/so-tu-s-santo/',
    provider: 'curated'
  },
  {
    id: 'legiao-tempo-perdido',
    title: 'Tempo Perdido',
    artist: 'Legião Urbana',
    originalKey: 'D',
    sourceLabel: 'Busca de cifra na web',
    provider: 'curated'
  },
  {
    id: 'los-hermanos-anna-julia',
    title: 'Anna Júlia',
    artist: 'Los Hermanos',
    originalKey: 'E',
    sourceLabel: 'Busca de cifra na web',
    provider: 'curated'
  }
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function buildCifraSearchUrl(title: string, artist: string) {
  const query = `site:cifraclub.com.br ${title} ${artist} cifra`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function localMatches(query: string) {
  const q = normalize(query);
  if (!q) return curated;

  return curated.filter(item =>
    normalize(`${item.title} ${item.artist}`).includes(q)
  );
}

type MusicBrainzResponse = {
  recordings?: Array<{
    id: string;
    title: string;
    'artist-credit'?: Array<{ name?: string; artist?: { name?: string } }>;
  }>;
};

export async function searchSongs(query: string): Promise<SongSearchResult[]> {
  const local = localMatches(query);
  const trimmed = query.trim();

  if (trimmed.length < 2) return local;

  try {
    const expression = `recording:${JSON.stringify(trimmed)} OR artist:${JSON.stringify(trimmed)}`;
    const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(expression)}&fmt=json&limit=12`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) return local;

    const body = (await response.json()) as MusicBrainzResponse;
    const remote = (body.recordings ?? [])
      .map(recording => {
        const artist = recording['artist-credit']?.[0]?.name
          ?? recording['artist-credit']?.[0]?.artist?.name
          ?? 'Artista não informado';

        return {
          id: `mb-${recording.id}`,
          title: recording.title,
          artist,
          sourceLabel: 'Catálogo musical · procurar cifra',
          sourceUrl: buildCifraSearchUrl(recording.title, artist),
          provider: 'musicbrainz' as const
        };
      })
      .filter(item => item.title && item.artist);

    const dedupe = new Map<string, SongSearchResult>();
    [...local, ...remote].forEach(item => {
      dedupe.set(normalize(`${item.title}|${item.artist}`), item);
    });

    return Array.from(dedupe.values()).slice(0, 16);
  } catch {
    return local;
  }
}

export function getInitialSongs() {
  return curated;
}

export function getExternalCifraSearchUrl(song: SongSearchResult) {
  return song.sourceUrl ?? buildCifraSearchUrl(song.title, song.artist);
}
