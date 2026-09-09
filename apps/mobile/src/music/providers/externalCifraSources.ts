import { type SongSearchResult } from '../types';

export type ExternalCifraSource = {
  id: 'cifraclub' | 'cifra';
  label: string;
  description: string;
  url: string;
};

function buildSiteSearchUrl(domain: string, song: SongSearchResult) {
  const query = `site:${domain} ${song.title} ${song.artist} cifra`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function getExternalCifraSources(
  song: SongSearchResult
): ExternalCifraSource[] {
  const sources: ExternalCifraSource[] = [];

  if (song.sourceUrl && song.sourceLabel === 'Cifra Club') {
    sources.push({
      id: 'cifraclub',
      label: 'Cifra Club',
      description: 'Abrir a página original da cifra',
      url: song.sourceUrl
    });
  } else {
    sources.push({
      id: 'cifraclub',
      label: 'Cifra Club',
      description: 'Procurar esta música no Cifra Club',
      url: buildSiteSearchUrl('cifraclub.com.br', song)
    });
  }

  sources.push({
    id: 'cifra',
    label: 'Cifra.com.br',
    description: 'Procurar esta música no Cifra.com.br',
    url: buildSiteSearchUrl('cifra.com.br', song)
  });

  return sources;
}
