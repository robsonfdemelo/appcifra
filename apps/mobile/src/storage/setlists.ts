import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Setlist } from '../music/types';

const KEY = '@app-cifra/setlists/v1';

export async function loadSetlists(): Promise<Setlist[]> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    if (!value) return [];
    const parsed = JSON.parse(value) as Setlist[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSetlists(setlists: Setlist[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(setlists));
}
