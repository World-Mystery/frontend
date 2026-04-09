import { apiFetch } from "./api-client"
import type { HealthEvent as UIHealthEvent } from "@/components/health-events/types"

export interface BackendHealthEvent {
  id: number
  memberId: number
  eventName: string
  diseaseName?: string
  status: string
  symptoms?: string[]
  medications?: string[]
  source?: string
  createTime?: string
  followUpTime?: string
}

export interface HealthEvent {
  id: number
  eventName: string
  diseaseName?: string
  status: "进行中" | "已康复" | "长期慢病"
  symptoms?: string[]
  medications?: string[]
  source?: string
  createTime?: string
  updateTime?: string
  followUpTime?: string
  recordCount?: number
}

export interface HealthEventRecord {
  id: number
  eventId: number
  recordTime: string
  description: string
  recordType?: string
  createTime?: string
}

export interface HealthEventListResponse {
  events: BackendHealthEvent[]
  statistics?: Record<string, number>
  total?: number
}

function mapBackendStatusToUIStatus(backendStatus: string): UIHealthEvent["status"] {
  switch (backendStatus?.toLowerCase()) {
    case "进行中":
    case "active":
      return "active"
    case "已康复":
    case "recovered":
      return "recovered"
    default:
      return "active"
  }
}

function formatDateParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function formatDate(dateInput?: unknown): string | undefined {
  if (!dateInput) return undefined

  if (Array.isArray(dateInput) && dateInput.length >= 3) {
    const [year, month, day] = dateInput
    if ([year, month, day].every((value) => typeof value === "number")) {
      return formatDateParts(year, month, day)
    }
  }

  if (typeof dateInput === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput
    }

    const javaLocalDateTimeMatch = dateInput.match(
      /^(\d{4}),(\d{1,2}),(\d{1,2})(?:,\d{1,2},\d{1,2},\d{1,2}(?:,\d+)?)?$/
    )
    if (javaLocalDateTimeMatch) {
      return formatDateParts(
        Number(javaLocalDateTimeMatch[1]),
        Number(javaLocalDateTimeMatch[2]),
        Number(javaLocalDateTimeMatch[3])
      )
    }

    const isoDateMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T/)
    if (isoDateMatch) {
      return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`
    }
  }

  try {
    const date =
      typeof dateInput === "number"
        ? new Date(dateInput)
        : new Date(String(dateInput))

    if (Number.isNaN(date.getTime())) {
      return String(dateInput)
    }

    return formatDateParts(date.getFullYear(), date.getMonth() + 1, date.getDate())
  } catch {
    return String(dateInput)
  }
}

export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function ensureDateFormat(dateString: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  return formatDate(dateString) || getTodayDateString()
}

function toBackendLocalDateTime(dateString?: string): string | undefined {
  if (!dateString) return undefined

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return dateString
  }

  return `${ensureDateFormat(dateString)}T00:00:00`
}

async function parseApiError(
  res: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.msg === "string" && data.msg.trim()) {
      return data.msg
    }
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message
    }
  } catch {
    // Ignore JSON parse failures and use the fallback message.
  }

  return fallbackMessage
}

export function mapBackendRecordToTimelineEntry(
  record: HealthEventRecord
): UIHealthEvent["timeline"][number] {
  return {
    id: String(record.id),
    date: formatDate(record.recordTime) || getTodayDateString(),
    description: record.description,
  }
}

export function sortTimelineEntries<T extends UIHealthEvent["timeline"][number]>(
  entries: T[]
): T[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function mapBackendEventToUI(
  event: BackendHealthEvent,
  records?: HealthEventRecord[]
): UIHealthEvent {
  const timeline = records
    ? sortTimelineEntries(records.map(mapBackendRecordToTimelineEntry))
    : [
        {
          id: `t-${event.id}`,
          date: formatDate(event.createTime) || getTodayDateString(),
          description: `${event.eventName} 开始记录`,
        },
      ]

  return {
    id: String(event.id),
    memberId: event.memberId,
    title: event.eventName,
    status: mapBackendStatusToUIStatus(event.status),
    startDate: formatDate(event.createTime) || getTodayDateString(),
    nextFollowUp: formatDate(event.followUpTime),
    symptoms: event.symptoms || [],
    medications: event.medications || [],
    diagnosis: event.diseaseName,
    aiGenerated: event.source === "AI",
    aiAdvice: undefined,
    timeline,
    resolution: undefined,
  }
}

export async function createHealthEvent(payload: {
  eventName: string
  memberId: number
  diseaseName?: string
  status: string
  symptoms?: string[]
  medications?: string[]
  diagnosis?: string
  source?: string
}): Promise<BackendHealthEvent> {
  const res = await apiFetch("/healthEvent/create", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to create health event: ${res.status}`)
  const data = await res.json()
  return data.data
}

export async function updateHealthEvent(
  id: number,
  payload: {
    eventName?: string
    diseaseName?: string
    status?: string
    symptoms?: string[]
    medications?: string[]
    diagnosis?: string
    followUpTime?: string
  }
): Promise<BackendHealthEvent> {
  const res = await apiFetch(`/healthEvent/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update health event: ${res.status}`)
  const data = await res.json()
  return data.data
}

export async function listHealthEvents(memberId: number): Promise<BackendHealthEvent[]> {
  const res = await apiFetch(`/healthEvent/list/${memberId}`)
  if (!res.ok) throw new Error(`Failed to list health events: ${res.status}`)
  const data = await res.json()
  const result = data.data as HealthEventListResponse
  return result.events || []
}

export async function getHealthEventDetail(id: number): Promise<BackendHealthEvent> {
  const res = await apiFetch(`/healthEvent/detail/${id}`)
  if (!res.ok) throw new Error(`Failed to get health event detail: ${res.status}`)
  const data = await res.json()
  return data.data
}

export async function deleteHealthEvent(id: number): Promise<void> {
  const res = await apiFetch(`/healthEvent/delete/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete health event: ${res.status}`)
}

export async function addHealthEventRecord(payload: {
  eventId: number
  recordTime?: string
  description: string
  recordType?: string
}): Promise<HealthEventRecord> {
  const res = await apiFetch("/healthEvent/record/add", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      recordTime: toBackendLocalDateTime(payload.recordTime),
    }),
  })

  if (!res.ok) {
    throw new Error(
      await parseApiError(res, `Failed to add health event record: ${res.status}`)
    )
  }

  const data = await res.json()
  return data.data
}

export async function updateHealthEventRecord(
  recordId: number,
  payload: {
    recordTime?: string
    description?: string
    recordType?: string
  }
): Promise<HealthEventRecord> {
  const res = await apiFetch(`/healthEvent/record/update/${recordId}`, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      recordTime: toBackendLocalDateTime(payload.recordTime),
    }),
  })

  if (!res.ok) {
    throw new Error(
      await parseApiError(res, `Failed to update health event record: ${res.status}`)
    )
  }

  const data = await res.json()
  return data.data
}

export async function deleteHealthEventRecord(recordId: number): Promise<void> {
  const res = await apiFetch(`/healthEvent/record/delete/${recordId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete health event record: ${res.status}`)
}

export async function getHealthEventRecords(eventId: number): Promise<HealthEventRecord[]> {
  const res = await apiFetch(`/healthEvent/record/list/${eventId}`)
  if (!res.ok) throw new Error(`Failed to get health event records: ${res.status}`)
  const data = await res.json()
  return data.data
}

export async function getHealthEventStatistics(
  memberId: number
): Promise<Record<string, number>> {
  const res = await apiFetch(`/healthEvent/statistics/${memberId}`)
  if (!res.ok) throw new Error(`Failed to get health event statistics: ${res.status}`)
  const data = await res.json()
  return data.data
}
