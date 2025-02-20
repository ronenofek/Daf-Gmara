import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function testO3Mini(prompt: string, reasoningEffort: "low" | "medium" | "high") {
  try {
    const { text } = await generateText({
      model: openai("o3-mini"),
      prompt,
      max_tokens: 500,
      temperature: 0.7,
      providerOptions: {
        openai: { reasoningEffort },
      },
    })
    return text
  } catch (error) {
    console.error("Error testing o3-mini:", error)
    throw error
  }
}

// Example usage
const talmudPrompt = `
Explain the concept of "Kal vachomer" (קל וחומר) in Talmudic reasoning. 
Provide an example from the Talmud and explain how this logical principle is applied.
`

async function runTest() {
  const result = await testO3Mini(talmudPrompt, "high")
  console.log("o3-mini response:", result)
}

runTest()

