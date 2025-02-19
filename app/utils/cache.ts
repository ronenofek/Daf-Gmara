import { LRUCache } from "lru-cache"

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
})

export function getCachedData(key: string) {
  return cache.get(key)
}

export function setCachedData(key: string, data: any) {
  cache.set(key, data)
}

