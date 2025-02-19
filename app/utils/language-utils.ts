export function isHebrewText(text: string): boolean {
  // Hebrew Unicode range: \u0590-\u05FF
  const hebrewPattern = /[\u0590-\u05FF]/
  return hebrewPattern.test(text)
}

export function getPageNameInHebrew(masechet: string, daf: number): string {
  // Hebrew mapping for common masechtos
  const masechtotMap: { [key: string]: string } = {
    Berachot: "ברכות",
    Shabbat: "שבת",
    Eruvin: "עירובין",
    Pesachim: "פסחים",
    Shekalim: "שקלים",
    Yoma: "יומא",
    Sukkah: "סוכה",
    Beitzah: "ביצה",
    Taanit: "תענית",
    Megillah: "מגילה",
    "Moed Katan": "מועד קטן",
    Chagigah: "חגיגה",
    Yevamot: "יבמות",
    Ketubot: "כתובות",
    Nedarim: "נדרים",
    Nazir: "נזיר",
    Sotah: "סוטה",
    Gittin: "גיטין",
    Kiddushin: "קידושין",
    // Add more masechtos as needed
  }

  // Convert number to Hebrew letters
  function numberToHebrewLetters(num: number): string {
    const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
    const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"]

    if (num < 10) return units[num]
    if (num < 20) return "י" + units[num - 10]

    const unit = num % 10
    const ten = Math.floor(num / 10)

    return tens[ten] + (unit > 0 ? units[unit] : "")
  }

  const hebrewMasechet = masechtotMap[masechet] || masechet
  const hebrewDaf = numberToHebrewLetters(daf)

  return `${hebrewMasechet} דף ${hebrewDaf}`
}

