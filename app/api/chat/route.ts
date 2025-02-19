import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { isHebrewText } from "@/app/utils/language-utils"

export async function POST(req: Request) {
  const { message, dafInfo } = await req.json()
  const isHebrew = isHebrewText(message)

  try {
    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: `You are a Talmud study partner discussing ${dafInfo.masechet} ${dafInfo.daf}. 
              User message: ${message}`,
      system: isHebrew
        ? "אתה חברותא המתמחה בלימוד גמרא. עליך לענות בעברית בלבד, בצורה ברורה ותמציתית, ולהשתמש במונחים תורניים מקובלים."
        : "You are a knowledgeable Talmud study partner. Provide clear, concise explanations and engage in meaningful discussion about the daily daf.",
    })

    return Response.json({ response: text })
  } catch (error) {
    return Response.json(
      {
        error: isHebrew ? "מצטערים, אירעה שגיאה בעיבוד ההודעה" : "Failed to generate response",
      },
      { status: 500 },
    )
  }
}

