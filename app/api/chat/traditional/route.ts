import { generateChatResponse } from "../utils"
import { isHebrewText } from "../../../utils/language-utils"
import { logError } from "../../../utils/error-utils"

export const runtime = "nodejs"

const TIMEOUT_DURATION = 30000 // 30 seconds
const MAX_TOKENS = 300

export async function POST(req: Request) {
  let message = ""
  try {
    const { message: reqMessage, dafInfo } = await req.json()
    message = reqMessage
    if (!message || !dafInfo) {
      throw new Error("Missing message or dafInfo")
    }

    const isHebrew = isHebrewText(message)
    const language = isHebrew ? "he" : "en"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION)

    try {
      const response = await generateChatResponse("traditional", message, dafInfo, language, MAX_TOKENS)

      clearTimeout(timeoutId)
      return Response.json({ response })
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  } catch (error) {
    logError(error, "Traditional chat generation", { message })

    const errorMessage = isHebrewText(message)
      ? "מצטערים, אירעה שגיאה בעיבוד ההודעה. נא לנסות שוב."
      : "Sorry, there was an error processing your message. Please try again."

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

