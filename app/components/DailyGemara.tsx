"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getCurrentDafYomi } from "@/app/utils/date-utils"
import { getPageNameInHebrew } from "@/app/utils/language-utils"
import type { Language } from "@/app/types"
import { ThinkingIndicator } from "./thinking-indicator"
import { ErrorBoundary } from "./error-boundary"

const DailyGemara = () => {
  const [dafInfo, setDafInfo] = useState(null)
  const [message, setMessage] = useState("")
  const [traditionalResponse, setTraditionalResponse] = useState("")
  const [modernResponse, setModernResponse] = useState("")
  const [language, setLanguage] = useState<Language>("en")
  const [isTraditionalThinking, setIsTraditionalThinking] = useState(false)
  const [isModernThinking, setIsModernThinking] = useState(false)

  useEffect(() => {
    const fetchDafInfo = async () => {
      const data = await getCurrentDafYomi()
      setDafInfo(data)
    }

    fetchDafInfo()
  }, [])

  useEffect(() => {
    if (message) {
      setLanguage(isHebrew(message) ? "he" : "en")
    }
  }, [message])

  const isHebrew = (text: string) => /[\u0590-\u05FF]/.test(text)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleSubmit = async (type: "traditional" | "modern") => {
    if (!message || !dafInfo) return

    const apiUrl = type === "traditional" ? "/api/chat/traditional" : "/api/chat/modern"
    const setResponse = type === "traditional" ? setTraditionalResponse : setModernResponse
    const setIsThinking = type === "traditional" ? setIsTraditionalThinking : setIsModernThinking

    setIsThinking(true)
    setResponse("")

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, dafInfo }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate response")
      }

      const data = await response.json()
      setResponse(data.response)
    } catch (error: any) {
      setResponse(
        language === "he"
          ? "מצטערים, אירעה שגיאה בעיבוד ההודעה. נא לנסות שוב."
          : "Sorry, there was an error processing your message. Please try again.",
      )
    } finally {
      setIsThinking(false)
    }
  }

  if (!dafInfo) {
    return <div>Loading...</div>
  }

  const pageName = getPageNameInHebrew(dafInfo.masechet, dafInfo.daf)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{pageName}</h1>
      <p className="mb-2">
        {dafInfo.date} - {dafInfo.hebrewDate}
      </p>

      <div className="mb-4">
        <label
          htmlFor="message"
          className={`block text-sm font-medium ${language === "he" ? "text-right" : "text-left"}`}
        >
          {language === "he" ? "הודעה:" : "Message:"}
        </label>
        <textarea
          id="message"
          rows={4}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
          value={message}
          onChange={handleInputChange}
          dir={language === "he" ? "rtl" : "ltr"}
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleSubmit("traditional")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {language === "he" ? "הסבר מסורתי" : "Traditional Explanation"}
        </button>
        <button
          onClick={() => handleSubmit("modern")}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {language === "he" ? "משמעות מודרנית" : "Modern Significance"}
        </button>
      </div>

      {isTraditionalThinking && <ThinkingIndicator language={language} />}
      {traditionalResponse && (
        <ErrorBoundary language={language}>
          <div
            className={`mb-4 ${language === "he" ? "text-right" : "text-left"}`}
            dir={language === "he" ? "rtl" : "ltr"}
          >
            <p>{traditionalResponse}</p>
          </div>
        </ErrorBoundary>
      )}

      {isModernThinking && <ThinkingIndicator language={language} />}
      {modernResponse && (
        <ErrorBoundary language={language}>
          <div
            className={`mb-4 ${language === "he" ? "text-right" : "text-left"}`}
            dir={language === "he" ? "rtl" : "ltr"}
          >
            <p>{modernResponse}</p>
          </div>
        </ErrorBoundary>
      )}
    </div>
  )
}

export default DailyGemara

