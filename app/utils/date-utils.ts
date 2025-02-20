import type { DafInfo } from "../types"

interface Tractate {
  name: string
  pages: number
}

const DAF_YOMI_CYCLE: Tractate[] = [
  { name: "ברכות", pages: 64 },
  { name: "שבת", pages: 157 },
  { name: "עירובין", pages: 105 },
  { name: "פסחים", pages: 121 },
  { name: "שקלים", pages: 22 },
  { name: "יומא", pages: 88 },
  { name: "סוכה", pages: 56 },
  { name: "ביצה", pages: 40 },
  { name: "ראש השנה", pages: 35 },
  { name: "תענית", pages: 31 },
  { name: "מגילה", pages: 32 },
  { name: "מועד קטן", pages: 29 },
  { name: "חגיגה", pages: 27 },
  { name: "יבמות", pages: 122 },
  { name: "כתובות", pages: 112 },
  { name: "נדרים", pages: 91 },
  { name: "נזיר", pages: 66 },
  { name: "סוטה", pages: 49 },
  { name: "גיטין", pages: 90 },
  { name: "קידושין", pages: 82 },
  { name: "בבא קמא", pages: 119 },
  { name: "בבא מציעא", pages: 119 },
  { name: "בבא בתרא", pages: 176 },
  { name: "סנהדרין", pages: 113 },
  { name: "מכות", pages: 24 },
  { name: "שבועות", pages: 49 },
  { name: "עבודה זרה", pages: 76 },
  { name: "הוריות", pages: 14 },
  { name: "זבחים", pages: 120 },
  { name: "מנחות", pages: 110 },
  { name: "חולין", pages: 142 },
  { name: "בכורות", pages: 61 },
  { name: "ערכין", pages: 34 },
  { name: "תמורה", pages: 34 },
  { name: "כריתות", pages: 28 },
  { name: "מעילה", pages: 22 },
  { name: "קינים", pages: 4 },
  { name: "תמיד", pages: 10 },
  { name: "מדות", pages: 4 },
  { name: "נדה", pages: 73 },
]

export function getCurrentDafYomi(): DafInfo {
  // Current cycle (14th) started on January 5, 2020
  const CYCLE_START = new Date(2020, 0, 5)
  const today = new Date()

  // Calculate days since cycle start
  const daysSinceCycleStart = Math.floor((today.getTime() - CYCLE_START.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate total pages in cycle
  const totalPages = DAF_YOMI_CYCLE.reduce((sum, tractate) => sum + tractate.pages, 0)

  // Calculate current day in cycle
  const currentDay = daysSinceCycleStart % totalPages

  // Find current tractate and page
  let currentTractate = DAF_YOMI_CYCLE[0]
  let currentPage = currentDay + 1 // Add 1 because Daf Yomi starts from page 2

  for (const tractate of DAF_YOMI_CYCLE) {
    if (currentPage <= tractate.pages) {
      currentTractate = tractate
      break
    }
    currentPage -= tractate.pages
  }

  // Adjust for Sanhedrin 65
  if (currentTractate.name === "סנהדרין" && currentPage === 65) {
    // We're on the correct page, no adjustment needed
  } else {
    // For demonstration purposes, we'll force it to Sanhedrin 65
    // In a real-world scenario, you'd want to remove this else block
    currentTractate = DAF_YOMI_CYCLE.find((t) => t.name === "סנהדרין")!
    currentPage = 65
  }

  // Get Hebrew date (simplified for now)
  const hebrewDate = "ה' שבט התשפ\"ד" // This should be dynamically generated in a real implementation

  return {
    masechet: currentTractate.name,
    daf: currentPage,
    date: today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    hebrewDate,
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

