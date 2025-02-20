import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getCachedData, setCachedData, generateCacheKey } from "../../utils/cache"
import { withRetry } from "../../utils/retry"

export async function generateChatResponse(
  type: "main" | "traditional" | "modern",
  message: string,
  dafInfo: { masechet: string; daf: number },
  language: "en" | "he",
  maxTokens: number,
  model: "gpt-3.5-turbo" | "gpt-4o", // Add this parameter
) {
  const cacheKey = generateCacheKey(type, dafInfo.masechet, dafInfo.daf, message, language, model) // Include model in cache key
  const cachedResponse = getCachedData(cacheKey)

  if (cachedResponse) {
    return cachedResponse
  }

  const systemMessage = getSystemMessage(type, language)
  const prompt = getPrompt(type, message, dafInfo, language)

  const generateResponse = async () => {
    const { text } = await generateText({
      model: openai(model), // Use the specified model
      system: systemMessage,
      prompt,
      max_tokens: maxTokens,
      temperature: 0.7,
    })
    return text
  }

  const response = await withRetry(generateResponse, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  })

  setCachedData(cacheKey, response)
  return response
}

function getSystemMessage(type: "main" | "traditional" | "modern", language: "en" | "he"): string {
  const messages = {
    main: {
      en: "You are an expert study partner with deep knowledge of the Talmud. You explain Talmudic topics clearly, using relevant sources and examples. Tailor your responses to the questioner's level of knowledge.",
      he: "אתה חברותא מומחה עם ידע מעמיק בתלמוד. אתה מסביר נושאים תלמודיים בבהירות, תוך שימוש במקורות ודוגמאות רלוונטיות. התאם את התשובות שלך לרמת הידע של השואל.",
    },
    traditional: {
      en: "You are an expert study partner with deep knowledge of the Talmud. You explain Talmudic topics clearly, using relevant sources and examples. Focus on the traditional explanation of the text.",
      he: "אתה חברותא מומחה עם ידע מעמיק בתלמוד. אתה מסביר נושאים תלמודיים בבהירות, תוך שימוש במקורות ודוגמאות רלוונטיות. התמקד בהסבר המסורתי של הטקסט.",
    },
    modern: {
      en: "You are an expert study partner with deep knowledge of the Talmud and its modern implications. You explain how Talmudic topics are relevant to modern life.",
      he: "אתה חברותא מומחה עם ידע מעמיק בתלמוד ובהשלכותיו המודרניות. אתה מסביר כיצד נושאים תלמודיים רלוונטיים לחיים המודרניים.",
    },
  }

  return messages[type][language]
}

function getPrompt(
  type: "main" | "traditional" | "modern",
  message: string,
  dafInfo: { masechet: string; daf: number },
  language: "en" | "he",
): string {
  const prompts = {
    main: {
      en: `Topic: "${message}"
Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

Instructions:
1. Explain the topic as it appears in the Gemara.
2. Mention relevant sources and opinions of sages.
3. If the topic is not directly related to the current daf, explain the connection or suggest a close topic from the daf.
4. Use clear and understandable language.

Response:`,
      he: `נושא: "${message}"
מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

הנחיות:
1. הסבר את הנושא כפי שהוא מופיע בגמרא.
2. ציין מקורות ודעות רלוונטיות של חכמים.
3. אם הנושא אינו קשור ישירות לדף הנוכחי, הסבר את הקשר או הצע נושא קרוב מהדף.
4. השתמש בשפה ברורה ומובנת.

תשובה:`,
    },
    traditional: {
      en: `Topic: "${message}"
Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

Instructions:
1. Explain the topic as it appears in the Gemara, using traditional interpretation.
2. Mention relevant sources and opinions of sages.
3. Emphasize important halachic concepts and principles.
4. Use clear and understandable language.

Traditional Explanation:`,
      he: `נושא: "${message}"
מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

הנחיות:
1. הסבר את הנושא כפי שהוא מופיע בגמרא, תוך שימוש בפרשנות מסורתית.
2. ציין מקורות ודעות רלוונטיות של חכמים.
3. הדגש מושגים ועקרונות הלכתיים חשובים.
4. השתמש בשפה ברורה ומובנת.

הסבר מסורתי:`,
    },
    modern: {
      en: `Topic: "${message}"
Tractate: ${dafInfo.masechet}, Daf: ${dafInfo.daf}

Instructions:
1. Briefly explain the modern significance of the topic (up to 50 words).
2. Address ethical, social, or practical implications in our time.
3. If possible, give a modern example of the Talmudic principle.
4. Use clear language relevant to a modern audience.

Modern Significance:`,
      he: `נושא: "${message}"
מסכת: ${dafInfo.masechet}, דף: ${dafInfo.daf}

הנחיות:
1. הסבר בקצרה את המשמעות המודרנית של הנושא (עד 50 מילים).
2. התייחס להשלכות אתיות, חברתיות או מעשיות בימינו.
3. אם אפשר, תן דוגמה מודרנית לעיקרון התלמודי.
4. השתמש בשפה ברורה ורלוונטית לקהל מודרני.

משמעות מודרנית:`,
    },
  }

  return prompts[type][language]
}

