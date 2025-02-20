export function getApiKey(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openai_api_key")
  }
  return null
}

export function setApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("openai_api_key", key)
  }
}

export function removeApiKey(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("openai_api_key")
  }
}

