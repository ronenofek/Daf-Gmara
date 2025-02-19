import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isHebrewText } from "../../utils/language-utils"
import { withRetry } from "../../utils/retry"
import { logError } from "../../utils/error-utils"

export const runtime = "nodejs"

const TIMEOUT_DURATION = 40000 // 40 seconds
const MAX_TOKENS = 120 // Reduced from 150 to further optimize costs

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
        ? `אתה חברותא מומחה עם ידע מעמיק בתלמוד. אתה מסביר נושאים תלמודיים בבהירות, תוך שימוש במקורות ודוגמאות רלוונטיות. התאם את התשובות שלך לרמת הידע של השואל.`
        : `You are an expert study partner with deep knowledge of the Talmud. You explain Talmudic topics clearly, using relevant sources and examples. Tailor your responses to the questioner's level of knowledge.`

      const prompt = isHebrew
        ? `נושא: "${message}"
     מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

     הנחיות:
     1. הסבר את הנושא כפי שהוא מופיע בגמרא.
     2. ציין מקורות ודעות רלוונטיות של חכמים.
     3. אם הנושא אינו קשור ישירות לדף הנוכחי, הסבר את הקשר או הצע נושא קרוב מהדף.
     4. השתמש בשפה ברורה ומובנת.

     תשובה:`
        : `Topic: "${message}"
     Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

     Instructions:
     1. Explain the topic as it appears in the Gemara.
     2. Mention relevant sources and opinions of sages.
     3. If the topic is not directly related to the current daf, explain the connection or suggest a close topic from the daf.
     4. Use clear and understandable language.

     Response:`

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
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
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

