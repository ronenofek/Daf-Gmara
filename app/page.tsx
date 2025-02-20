"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Language, Message, DafInfo } from "./types"
import { isHebrewText, getEnglishMasechetName } from "./utils/language-utils"
import { ErrorBoundary } from "./components/error-boundary"
import { handleFetchResponse, logError } from "./utils/error-utils"

const numberToHebrewLetters = (num: number): string => {
  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"]
  const hundreds = ["", "ק", "ר", "ש", "ת"]

  let result = ""
  let remainder = num

  const hundredsDigit = Math.floor(remainder / 100)
  if (hundredsDigit > 0) {
    result += hundreds[hundredsDigit]
    remainder %= 100
  }

  const tensDigit = Math.floor(remainder / 10)
  if (tensDigit > 0) {
    result += tens[tensDigit]
    remainder %= 10
  }

  if (remainder > 0) {
    result += units[remainder]
  }

  return result
}

// Update the getDefaultDiscussionPoints function
const getDefaultDiscussionPoints = (masechet: string, daf: number) => ({
  en: [
    `The main discussion in ${getEnglishMasechetName(masechet)} ${daf}`,
    `Key legal principles in ${getEnglishMasechetName(masechet)} ${daf}`,
    `Ethical teachings in ${getEnglishMasechetName(masechet)} ${daf}`,
    `Practical applications of ${getEnglishMasechetName(masechet)} ${daf}`,
    `Related discussions to ${getEnglishMasechetName(masechet)} ${daf}`,
    `Modern implications of selected subjects in ${getEnglishMasechetName(masechet)} ${daf}`,
  ],
  he: [
    `הדיון המרכזי ב${masechet} דף ${numberToHebrewLetters(daf)}`,
    `עקרונות הלכתיים ב${masechet} דף ${numberToHebrewLetters(daf)}`,
    `לימודי מוסר ב${masechet} דף ${numberToHebrewLetters(daf)}`,
    `יישומים מעשיים של ${masechet} דף ${numberToHebrewLetters(daf)}`,
    `דיונים קשורים ל${masechet} דף ${numberToHebrewLetters(daf)}`,
    `השלכות מודרניות של נושאים נבחרים ב${masechet} דף ${numberToHebrewLetters(daf)}`,
  ],
})

const ThinkingIndicator = ({ language }: { language: Language }) => {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`mb-4 ${language === "he" ? "text-right" : "text-left"}`}>
      <div className="inline-block p-3 rounded-lg bg-muted" dir={language === "he" ? "rtl" : "ltr"}>
        {language === "he" ? `חושב${dots}` : `Thinking${dots}`}
      </div>
    </div>
  )
}

const DailyGemara = () => {
  const [language, setLanguage] = useState<Language>("he")
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [dafInfo, setDafInfo] = useState<DafInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDafInfo = async () => {
      try {
        const dafInfoData = await handleFetchResponse(await fetch("/api/daf-info"))
        setDafInfo(dafInfoData)
      } catch (error) {
        logError(error, "Fetching daf info")
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      }
    }

    fetchDafInfo()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSend = async () => {
    if (!dafInfo || !message.trim() || isLoading) return

    const userMessage = message
    setChatMessages((prev) => [...prev, { text: userMessage, sender: "user" }])
    setMessage("")
    setIsLoading(true)
    setIsThinking(true)
    setError(null)
    setCurrentTopic(userMessage)

    try {
      const data = await handleFetchResponse(
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, dafInfo }),
        }),
      )

      setChatMessages((prev) => [...prev, { text: data.response, sender: "bot" }])
    } catch (error) {
      logError(error, "handleSend", { userMessage })
      const errorMessage = handleError(error, userMessage)
      setChatMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }])
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setIsThinking(false)
    }
  }

  const translations = {
    en: {
      title: "Talmud Today",
      enterTopic: "Enter topic to discuss...",
      send: "Send",
      chavruta: "Chavruta",
      error: "An error occurred. Please try again later.",
      showModern: "Discuss modern implications",
      subtitle: "Tradition Meets Technology - Daily Daf Learning with AI",
      defaultDiscussionPoints: "Suggested Discussion Points",
    },
    he: {
      title: "תלמוד היום",
      enterTopic: "הכנס נושא לדיון...",
      send: "שלח",
      chavruta: "חברותא",
      error: "אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
      showModern: "דון בהשלכות מודרניות",
      subtitle: "מסורת פוגשת טכנולוגיה - לימוד הדף היומי בעזרת הבינה המלאכותית",
      defaultDiscussionPoints: "נושאי שיחה מוצעים",
    },
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{translations[language].error}</p>
            <p className="text-center mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary language={language}>
      <div
        className={`min-h-screen bg-gradient-to-b from-blue-100 to-background ${
          language === "he" ? "text-right rtl" : "text-left ltr"
        }`}
      >
        <header className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
          <div
            className={`max-w-7xl mx-auto px-4 py-3 flex flex-col ${language === "he" ? "items-end" : "items-start"}`}
          >
            <h1 className="text-2xl font-bold text-primary">{translations[language].title}</h1>
            <p className="text-sm text-muted-foreground">{translations[language].subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLanguage((prev) => (prev === "en" ? "he" : "en"))}
            className="absolute top-3 right-4 rounded-full hover:bg-blue-100 hover:text-blue-600"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </header>

        <main className="pt-20 max-w-7xl mx-auto px-4">
          <Card className="mb-8 border-2 border-blue-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-lg text-muted-foreground mb-2">
                {dafInfo?.date} | {dafInfo?.hebrewDate}
              </div>
              <div className="text-xl font-bold text-primary">
                {language === "he"
                  ? `${dafInfo?.masechet} דף ${numberToHebrewLetters(dafInfo?.daf || 0)}`
                  : `${getEnglishMasechetName(dafInfo?.masechet || "")} ${dafInfo?.daf}`}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`md:col-span-2 ${language === "he" ? "md:order-2" : ""}`}>
              <Card className="h-[600px] flex flex-col border-2 border-blue-200 shadow-lg">
                <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                  {chatMessages.map((msg, idx) => {
                    const isHebrew = isHebrewText(msg.text)
                    return (
                      <div
                        key={idx}
                        className={`mb-4 ${
                          msg.sender === "user" ? "text-right" : isHebrew ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "bg-blue-100 text-blue-800 shadow-sm"
                          }`}
                          dir={isHebrew ? "rtl" : "ltr"}
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
                  {isThinking && <ThinkingIndicator language={language} />}
                  <div ref={chatEndRef} />
                </CardContent>
                <div className="p-4 border-t border-blue-200">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={translations[language].enterTopic}
                      onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                      dir={language === "he" ? "rtl" : "ltr"}
                      disabled={isLoading}
                      className="border-blue-200 focus:ring-blue-400"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className={`space-y-6 ${language === "he" ? "md:order-1" : ""}`}>
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-primary">{translations[language].defaultDiscussionPoints}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dafInfo &&
                    getDefaultDiscussionPoints(dafInfo.masechet, dafInfo.daf)[language].map((topic, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        className={`w-full justify-start whitespace-normal h-auto hover:bg-blue-100 hover:text-blue-600 ${
                          language === "he" ? "text-right" : "text-left"
                        }`}
                        onClick={() => setMessage(topic)}
                        dir={language === "he" ? "rtl" : "ltr"}
                      >
                        {topic}
                      </Button>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

const handleError = (error: unknown, userMessage: string) => {
  console.error("Error details:", error)
  const isHebrew = isHebrewText(userMessage)
  let errorMessage = isHebrew
    ? "מצטערים, אירעה שגיאה בתקשורת. נא לנסות שוב."
    : "Sorry, there was a network error. Please try again."

  if (error instanceof Error) {
    errorMessage += isHebrew ? ` פרטי השגיאה: ${error.message}` : ` Error details: ${error.message}`
  }

  return errorMessage
}

export default DailyGemara

