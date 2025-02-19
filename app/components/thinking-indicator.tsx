"use client"

import { useState, useEffect } from "react"
import type { Language } from "../types"

export const ThinkingIndicator = ({ language }: { language: Language }) => {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`mb-4 ${language === "he" ? "text-right" : "text-left"}`}>
      <div
        className="inline-block p-3 rounded-lg bg-accent text-accent-foreground shadow-sm animate-pulse"
        dir={language === "he" ? "rtl" : "ltr"}
      >
        {language === "he" ? `חושב${dots}` : `Thinking${dots}`}
      </div>
    </div>
  )
}

