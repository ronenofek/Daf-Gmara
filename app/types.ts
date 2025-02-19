export type Language = "en" | "he"

export type Message = {
  text: string
  sender: "user" | "bot"
}

export type DafInfo = {
  masechet: string
  daf: number
  date: string
  hebrewDate: string
}

