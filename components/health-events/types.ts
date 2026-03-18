export type EventStatus = "active" | "recovered"

export interface TimelineEntry {
  id: string
  date: string
  description: string
}

export interface HealthEvent {
  id: string | number
  memberId?: number
  title: string
  status: EventStatus
  startDate: string
  resolvedDate?: string
  nextFollowUp?: string
  symptoms: string[]
  medications: string[]
  diagnosis?: string
  aiGenerated: boolean
  aiAdvice?: string
  timeline: TimelineEntry[]
  resolution?: string
}
