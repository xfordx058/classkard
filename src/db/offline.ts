import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'classkard:cache:';
const CACHE_VERSION = 2;
const VERSION_KEY = 'classkard:cacheVersion';
const TTL_MS = 24 * 60 * 60 * 1000;

export function cacheKey(...parts: (string | number | undefined | null)[]): string {
  const clean = parts
    .filter((p) => p !== undefined && p !== null)
    .join(':');
  return `${CACHE_PREFIX}${clean}`;
}

export async function getCacheEntry<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.t <= (parsed.ttlMs ?? TTL_MS)) {
      return parsed.v as T;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCacheEntry(
  key: string,
  value: unknown,
  ttlMs = TTL_MS
): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value, ttlMs }));
  } catch {
    // ignore cache write failures
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys.filter(Boolean));
  } catch {
    // ignore
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const relevant = allKeys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (relevant.length) await AsyncStorage.multiRemove(relevant);
  } catch {
    // ignore
  }
}

export async function initOfflineEngine(): Promise<() => void> {
  const version = await AsyncStorage.getItem(VERSION_KEY);
  if (version !== String(CACHE_VERSION)) {
    await clearAllCache();
    await AsyncStorage.setItem(VERSION_KEY, String(CACHE_VERSION));
  }
  return () => {};
}