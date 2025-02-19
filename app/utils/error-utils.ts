import * as Sentry from "@sentry/nextjs"

export function logError(error: unknown, context: string, additionalInfo?: Record<string, unknown>) {
  console.error(`Error in ${context}:`, {
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  })

  Sentry.captureException(error, {
    tags: { context },
    extra: additionalInfo,
  })
}

export async function handleFetchResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

