export type Language = "en" | "he"

export type Message = {
  text: string
  sender: "user" | "bot"
}

export type Translations = {
  [key in Language]: {
    title: string
    date: string
    gemaraPage: string
    enterTopic: string
    send: string
    popularTopics: string
    recentDiscussions: string
    chavruta: string
  }
}

export type DafInfo = {
  masechet: string
  daf: number
  date: string
  hebrewDate: string
}

