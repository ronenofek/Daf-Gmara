"use client"

import { useState, useRef, useEffect } from "react"
import { Globe, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Language, Message, DafInfo } from "./types"
import { getPageNameInHebrew } from "./utils/language-utils"

export default function DailyGemara() {
  const [language, setLanguage] = useState<Language>("en")
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [dafInfo, setDafInfo] = useState<DafInfo | null>(null)
  const [popularTopics, setPopularTopics] = useState<{ en: string[]; he: string[] }>({
    en: ["Loading..."],
    he: ["טוען..."],
  })

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDafInfo = async () => {
      const response = await fetch("/api/daf-info")
      const data = await response.json()
      setDafInfo(data)

      // Fetch popular topics after getting daf info
      const topicsResponse = await fetch(`/api/popular-topics?masechet=${data.masechet}&daf=${data.daf}`)
      const topicsData = await topicsResponse.json()
      setPopularTopics(topicsData)
    }

    fetchDafInfo()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, chatEndRef])

  const handleSend = async () => {
    if (!message.trim() || !dafInfo) return

    const userMessage = message
    setChatMessages((prev) => [...prev, { text: userMessage, sender: "user" }])
    setMessage("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, dafInfo }),
      })

      const data = await response.json()
      setChatMessages((prev) => [...prev, { text: data.response, sender: "bot" }])
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error processing your message.",
          sender: "bot",
        },
      ])
    }
  }

  const translations = {
    en: {
      title: "Daily Gemara Learning",
      enterTopic: "Enter topic to discuss...",
      send: "Send",
      popularTopics: "Popular Topics",
      recentDiscussions: "Recent Discussions",
      chavruta: "Chavruta AI",
    },
    he: {
      title: "דף היומי",
      enterTopic: "הכנס נושא לדיון...",
      send: "שלח",
      popularTopics: "נושאים פופולריים",
      recentDiscussions: "דיונים אחרונים",
      chavruta: "חברותא",
    },
  }

  return (
    <div className={`min-h-screen ${language === "he" ? "text-right rtl" : "text-left ltr"}`}>
      <header className="fixed top-0 w-full bg-background border-b z-50">
        <div
          className={`max-w-7xl mx-auto px-4 py-3 flex justify-between items-center ${language === "he" ? "flex-row-reverse" : ""}`}
        >
          <h1 className="text-2xl font-bold">{translations[language].title}</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLanguage((prev) => (prev === "en" ? "he" : "en"))}
            className="rounded-full"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="pt-20 max-w-7xl mx-auto px-4">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-lg text-muted-foreground mb-2">
              {dafInfo?.date}
              {language === "he" && ` | ${dafInfo?.hebrewDate}`}
            </div>
            <div className="text-xl font-bold">
              {language === "he" && dafInfo
                ? getPageNameInHebrew(dafInfo.masechet, dafInfo.daf)
                : `${dafInfo?.masechet} ${dafInfo?.daf}`}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`md:col-span-2 ${language === "he" ? "md:order-2" : ""}`}>
            <Card className="h-[600px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={translations[language].enterTopic}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    dir={language === "he" ? "rtl" : "ltr"}
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className={`space-y-6 ${language === "he" ? "md:order-1" : ""}`}>
            <Card>
              <CardHeader>
                <CardTitle>{translations[language].popularTopics}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularTopics[language].map((topic, idx) => (
                  <Button key={idx} variant="ghost" className="w-full justify-start" onClick={() => setMessage(topic)}>
                    {topic}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

