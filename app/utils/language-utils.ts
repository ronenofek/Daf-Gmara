export function isHebrewText(text: string): boolean {
  const hebrewPattern = /[\u0590-\u05FF]/
  return hebrewPattern.test(text)
}

export function getPageNameInHebrew(masechet: string, daf: number): string {
  // If masechet is already in Hebrew, use it directly
  if (isHebrewText(masechet)) {
    return `${masechet} דף ${numberToHebrewLetters(daf)}`
  }

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
    "Bava Kamma": "בבא קמא",
    "Bava Metzia": "בבא מציעא",
    "Bava Batra": "בבא בתרא",
    Sanhedrin: "סנהדרין",
    Makkot: "מכות",
    Shevuot: "שבועות",
    "Avodah Zarah": "עבודה זרה",
    Horayot: "הוריות",
    Zevachim: "זבחים",
    Menachot: "מנחות",
    Chullin: "חולין",
    Bechorot: "בכורות",
    Arachin: "ערכין",
    Temurah: "תמורה",
    Keritot: "כריתות",
    Meilah: "מעילה",
    Kinnim: "קינים",
    Tamid: "תמיד",
    Middot: "מידות",
    Niddah: "נידה",
  }

  const hebrewMasechet = masechtotMap[masechet] || masechet
  return `${hebrewMasechet} דף ${numberToHebrewLetters(daf)}`
}

export function getEnglishMasechetName(hebrewName: string): string {
  const masechtotMap: { [key: string]: string } = {
    ברכות: "Berachot",
    שבת: "Shabbat",
    עירובין: "Eruvin",
    פסחים: "Pesachim",
    שקלים: "Shekalim",
    יומא: "Yoma",
    סוכה: "Sukkah",
    ביצה: "Beitzah",
    תענית: "Taanit",
    מגילה: "Megillah",
    "מועד קטן": "Moed Katan",
    חגיגה: "Chagigah",
    יבמות: "Yevamot",
    כתובות: "Ketubot",
    נדרים: "Nedarim",
    נזיר: "Nazir",
    סוטה: "Sotah",
    גיטין: "Gittin",
    קידושין: "Kiddushin",
    "בבא קמא": "Bava Kamma",
    "בבא מציעא": "Bava Metzia",
    "בבא בתרא": "Bava Batra",
    סנהדרין: "Sanhedrin",
    מכות: "Makkot",
    שבועות: "Shevuot",
    "עבודה זרה": "Avodah Zarah",
    הוריות: "Horayot",
    זבחים: "Zevachim",
    מנחות: "Menachot",
    חולין: "Chullin",
    בכורות: "Bechorot",
    ערכין: "Arachin",
    תמורה: "Temurah",
    כריתות: "Keritot",
    מעילה: "Meilah",
    קינים: "Kinnim",
    תמיד: "Tamid",
    מידות: "Middot",
    נידה: "Niddah",
  }

  return masechtotMap[hebrewName] || hebrewName
}

function numberToHebrewLetters(num: number): string {
  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"]

  if (num < 10) return units[num]
  if (num < 20) return "י" + units[num - 10]

  const unit = num % 10
  const ten = Math.floor(num / 10)

  return tens[ten] + (unit > 0 ? units[unit] : "")
}

