import { cache } from "./cache"

interface CacheParams {
  type: "chat" | "brief"
  masechet: string
  daf: number
  message?: string
  language?: "en" | "he"
}

export async function withCache<T>(params: CacheParams, fn: () => Promise<T>): Promise<T> {
  const { type, masechet, daf, message, language } = params

  let key = `${type}-${masechet}-${daf}`
  if (message) {
    key += `-${message}`
  }
  if (language) {
    key += `-${language}`
  }

  const cached = cache.get(key)
  if (cached) {
    return JSON.parse(cached) as T
  }

  const result = await fn()
  cache.set(key, JSON.stringify(result))
  return result
}

interface OpenAIResponse {
  text: string
}

export function validateOpenAIResponse(response: OpenAIResponse): boolean {
  if (!response || !response.text) {
    return false
  }

  return true
}

export function sanitizeResponse(text: string): string {
  // Remove leading/trailing whitespace
  const sanitized = text.trim()

  return sanitized
}

