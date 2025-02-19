import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isHebrewText } from "../../../utils/language-utils"
import { withRetry } from "../../../utils/retry"

export const runtime = "nodejs"

const TIMEOUT_DURATION = 30000 // 30 seconds
const MAX_TOKENS = 300 // Reduced from 500 to optimize costs

export async function POST(req: Request) {
  let message = "" // Declare message here to ensure it's defined in the outer scope
  try {
    const { message: reqMessage, dafInfo } = await req.json()
    message = reqMessage // Assign the value from the request to the message variable
    if (!message || !dafInfo) {
      throw new Error("Missing message or dafInfo")
    }

    const isHebrew = isHebrewText(message)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION)

    try {
      const systemMessage = isHebrew
        ? `אתה חברותא מומחה עם ידע מעמיק בתלמוד. אתה מסביר נושאים תלמודיים בבהירות, תוך שימוש במקורות ודוגמאות רלוונטיות. התמקד בהסבר המסורתי של הטקסט.`
        : `You are an expert study partner with deep knowledge of the Talmud. You explain Talmudic topics clearly, using relevant sources and examples. Focus on the traditional explanation of the text.`

      const prompt = isHebrew
        ? `נושא: "${message}"
     מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

     הנחיות:
     1. הסבר את הנושא כפי שהוא מופיע בגמרא, תוך שימוש בפרשנות מסורתית.
     2. ציין מקורות ודעות רלוונטיות של חכמים.
     3. הדגש מושגים ועקרונות הלכתיים חשובים.
     4. השתמש בשפה ברורה ומובנת.

     הסבר מסורתי:`
        : `Topic: "${message}"
     Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

     Instructions:
     1. Explain the topic as it appears in the Gemara, using traditional interpretation.
     2. Mention relevant sources and opinions of sages.
     3. Emphasize important halachic concepts and principles.
     4. Use clear and understandable language.

     Traditional Explanation:`

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
      throw error
    }
  } catch (error) {
    console.error("Error in traditional chat API:", error)
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

