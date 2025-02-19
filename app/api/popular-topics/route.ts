import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const masechet = searchParams.get("masechet")
  const daf = searchParams.get("daf")

  try {
    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: `List 3 main topics discussed in ${masechet} ${daf} in both English and Hebrew. Format as JSON: 
              { "en": ["topic1", "topic2", "topic3"], "he": ["נושא1", "נושא2", "נושא3"] }`,
      system: "You are a Talmud expert. Provide accurate main topics from the specified daf.",
    })

    return Response.json(JSON.parse(text))
  } catch (error) {
    return Response.json({
      en: ["Loading...", "Loading...", "Loading..."],
      he: ["טוען...", "טוען...", "טוען..."],
    })
  }
}

