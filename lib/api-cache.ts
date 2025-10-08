// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30000; // 30 seconds

export function getCachedData(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function invalidateCacheOnMutation(type: 'player' | 'payment' | 'expense' | 'user'): void {
  clearCache(type);
}
