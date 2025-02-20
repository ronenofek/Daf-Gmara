import { LRUCache } from "lru-cache"

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
})

export function getCachedData(key: string) {
  return cache.get(key)
}

export function setCachedData(key: string, data: any) {
  cache.set(key, data)
}

export function generateCacheKey(type: string, masechet: string, daf: number, message: string, language: string) {
  return `${type}-${masechet}-${daf}-${message}-${language}`
}

