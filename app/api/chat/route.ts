import { generateChatResponse } from "../utils"
import { isHebrewText } from "../../utils/language-utils"
import { logError } from "../../utils/error-utils"

export const runtime = "nodejs"

const TIMEOUT_DURATION = 40000 // 40 seconds
const MAX_TOKENS = 120

// Modify the POST function to accept the model parameter
export async function POST(req: Request) {
  let message = ""
  try {
    const { message: reqMessage, dafInfo, model } = await req.json()
    message = reqMessage
    if (!message || !dafInfo || !model) {
      throw new Error("Missing message, dafInfo, or model")
    }

    const isHebrew = isHebrewText(message)
    const language = isHebrew ? "he" : "en"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION)

    try {
      const response = await generateChatResponse("main", message, dafInfo, language, MAX_TOKENS, model)

      clearTimeout(timeoutId)
      return Response.json({ response })
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error(
          isHebrew
            ? "הבקשה ארכה זמן רב מדי. אנא נסה שוב עם שאלה קצרה יותר."
            : "Request took too long. Please try again with a shorter question.",
        )
      }
      throw error
    }
  } catch (error) {
    logError(error, "Chat generation", { message })

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

