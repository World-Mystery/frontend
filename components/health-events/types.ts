export type EventStatus = "active" | "recovered"

export type EventCategory =
  | "digestive"
  | "respiratory"
  | "neurological"
  | "orthopedic"
  | "cardiovascular"
  | "dermatological"
  | "infectious"
  | "other"

export interface HealthEvent {
  id: string
  title: string
  description: string
  date: Date
  status: EventStatus
  nextFollowUp?: Date
  category: EventCategory
}

export const categoryLabels: Record<EventCategory, string> = {
  digestive: "消化系统",
  respiratory: "呼吸系统",
  neurological: "神经系统",
  orthopedic: "骨科",
  cardiovascular: "心血管",
  dermatological: "皮肤科",
  infectious: "传染病",
  other: "其他",
}

export const categoryEmojis: Record<EventCategory, string> = {
  digestive: "🍽️",
  respiratory: "🫁",
  neurological: "🧠",
  orthopedic: "💪",
  cardiovascular: "❤️",
  dermatological: "🩹",
  infectious: "🦠",
  other: "📋",
}
