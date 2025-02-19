export const maxDuration = 60
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isHebrewText } from "../../../utils/language-utils"
import { withRetry } from "../../../utils/retry"
import { logError } from "../../../utils/error-utils"

export const runtime = "nodejs"

const TIMEOUT_DURATION = 15000 // 15 seconds
const MAX_TOKENS = 200 // Increased from 100 to provide more detailed modern context

export async function POST(req: Request) {
  let message = ""
  try {
    const { message: reqMessage, dafInfo } = await req.json()
    message = reqMessage
    if (!message || !dafInfo) {
      throw new Error("Missing message or dafInfo")
    }

    const isHebrew = isHebrewText(message)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION)

    try {
      const systemMessage = isHebrew
        ? `אתה חברותא מומחה עם ידע מעמיק בתלמוד ובהשלכותיו המודרניות. אתה מסביר כיצד נושאים תלמודיים רלוונטיים לחיים המודרניים.`
        : `You are an expert study partner with deep knowledge of the Talmud and its modern implications. You explain how Talmudic topics are relevant to modern life.`

      const prompt = isHebrew
        ? `נושא: "${message}"
     מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

     הנחיות:
     1. הסבר בקצרה את המשמעות המודרנית של הנושא (עד 50 מילים).
     2. התייחס להשלכות אתיות, חברתיות או מעשיות בימינו.
     3. אם אפשר, תן דוגמה מודרנית לעיקרון התלמודי.
     4. השתמש בשפה ברורה ורלוונטית לקהל מודרני.

     משמעות מודרנית:`
        : `Topic: "${message}"
     Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

     Instructions:
     1. Briefly explain the modern significance of the topic (up to 50 words).
     2. Address ethical, social, or practical implications in our time.
     3. If possible, give a modern example of the Talmudic principle.
     4. Use clear language relevant to a modern audience.

     Modern Significance:`

      const generateResponse = async () => {
        const { text } = await generateText({
          model: openai("gpt-3.5-turbo"),
          system: systemMessage,
          prompt,
          max_tokens: MAX_TOKENS,
          temperature: 0.7,
        })
        return text
      }

      const response = await withRetry(generateResponse, {
        maxAttempts: 4,
        initialDelay: 1000,
        maxDelay: 3000,
      })

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
    logError(error, "Modern chat generation", { message })

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

