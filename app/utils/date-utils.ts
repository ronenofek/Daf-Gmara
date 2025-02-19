import type { DafInfo } from "../types"

export async function getCurrentDafYomi(): Promise<DafInfo> {
  try {
    const response = await fetch("https://daf-yomi.com/dafYomi.aspx")
    const html = await response.text()

    // Extract Hebrew date
    const hebrewDateMatch = html.match(/כ"[א-ת]\s+[א-ת]+\s+[א-ת]+"?[א-ת]+/g)
    const hebrewDate = hebrewDateMatch ? hebrewDateMatch[0] : "כ״א שבט התשפ״ה"

    // Extract Masechet and Daf
    const masechtMatch = html.match(/מסכת\s+([א-ת\s]+)\s+דף\s+([א-ת]+)/i)
    let masechet = "סנהדרין"
    let daf = 64

    if (masechtMatch && masechtMatch.length > 2) {
      masechet = masechtMatch[1].trim()
      // Convert Hebrew letters to number
      const hebrewDaf = masechtMatch[2].trim()
      daf = hebrewLettersToNumber(hebrewDaf)
    }

    const today = new Date()
    const englishDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return {
      masechet,
      daf,
      date: englishDate,
      hebrewDate,
    }
  } catch (error) {
    console.error("Error fetching Daf Yomi information:", error)
    // Fallback to current known values
    return {
      masechet: "סנהדרין",
      daf: 64,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      hebrewDate: "כ״א שבט התשפ״ה",
    }
  }
}

function hebrewLettersToNumber(hebrewStr: string): number {
  const values: { [key: string]: number } = {
    א: 1,
    ב: 2,
    ג: 3,
    ד: 4,
    ה: 5,
    ו: 6,
    ז: 7,
    ח: 8,
    ט: 9,
    י: 10,
    כ: 20,
    ל: 30,
    מ: 40,
    נ: 50,
    ס: 60,
    ע: 70,
    פ: 80,
    צ: 90,
    ק: 100,
    ר: 200,
    ש: 300,
    ת: 400,
  }

  let sum = 0
  const letters = hebrewStr.split("")

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    if (values[letter]) {
      sum += values[letter]
    }
  }

  return sum
}

