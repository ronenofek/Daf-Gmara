import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: "Say hello",
      max_tokens: 10,
    })

    return Response.json({ success: true, response: text })
  } catch (error) {
    console.error("OpenAI Test Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : JSON.stringify(error),
      },
      {
        status: 500,
      },
    )
  }
}

