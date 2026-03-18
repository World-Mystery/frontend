import { apiFetch } from "./api-client"
import type { HealthEvent as UIHealthEvent } from "@/components/health-events/types"

/**
 * 后端返回的原始健康事件数据结构
 */
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

/**
 * 将后端状态值映射为前端状态
 */
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

/**
 * 将后端日期格式 (ISO 8601 或时间戳) 转换为前端格式 (YYYY-MM-DD)
 */
export function formatDate(dateString?: string | number): string | undefined {
  if (!dateString) return undefined
  try {
    let date: Date

    // 如果是数字，当作时间戳处理
    if (typeof dateString === "number") {
      date = new Date(dateString)
    } else if (typeof dateString === "string") {
      // 如果是纯数字字符串，当作时间戳处理
      if (/^\d+$/.test(dateString)) {
        date = new Date(parseInt(dateString, 10))
      } else {
        // 否则当作日期字符串处理
        date = new Date(dateString)
      }
    } else {
      return undefined
    }

    // 验证日期有效性
    if (isNaN(date.getTime())) {
      return String(dateString)
    }

    return date.toISOString().split("T")[0]
  } catch {
    return String(dateString)
  }
}

/**
 * 获取今天的日期，格式为 YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * 确保日期字符串格式为 YYYY-MM-DD
 */
export function ensureDateFormat(dateString: string): string {
  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  // 否则尝试解析并格式化
  return formatDate(dateString) || getTodayDateString()
}

/**
 * 将后端健康事件数据转换为前端UI格式
 */
export function mapBackendEventToUI(
  event: BackendHealthEvent,
  records?: HealthEventRecord[]
): UIHealthEvent {
  const timeline = records
    ? records.map((record) => ({
        id: String(record.id),
        date: formatDate(record.recordTime) || new Date().toISOString().split("T")[0],
        description: record.description,
      }))
    : [
        {
          id: `t-${event.id}`,
          date: formatDate(event.createTime) || new Date().toISOString().split("T")[0],
          description: `${event.eventName} 开始记录`,
        },
      ]

  return {
    id: String(event.id),
    memberId: event.memberId,
    title: event.eventName,
    status: mapBackendStatusToUIStatus(event.status),
    startDate: formatDate(event.createTime) || new Date().toISOString().split("T")[0],
    nextFollowUp: formatDate(event.followUpTime),
    symptoms: event.symptoms || [],
    medications: event.medications || [],
    diagnosis: event.diseaseName,
    aiGenerated: event.source === "AI" || false,
    aiAdvice: undefined,
    timeline,
    resolution: undefined,
  }
}

/**
 * 创建健康事件
 */
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

/**
 * 编辑健康事件
 */
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

/**
 * 获取健康事件列表
 */
export async function listHealthEvents(memberId: number): Promise<BackendHealthEvent[]> {
  const res = await apiFetch(`/healthEvent/list/${memberId}`)
  if (!res.ok) throw new Error(`Failed to list health events: ${res.status}`)
  const data = await res.json()
  // 后端返回的是 Map，包含 events 数组
  const result = data.data as HealthEventListResponse
  return result.events || []
}

/**
 * 获取健康事件详情
 */
export async function getHealthEventDetail(id: number): Promise<BackendHealthEvent> {
  const res = await apiFetch(`/healthEvent/detail/${id}`)
  if (!res.ok) throw new Error(`Failed to get health event detail: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 删除健康事件
 */
export async function deleteHealthEvent(id: number): Promise<void> {
  const res = await apiFetch(`/healthEvent/delete/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete health event: ${res.status}`)
}

/**
 * 添加健康事件记录
 */
export async function addHealthEventRecord(payload: {
  eventId: number
  recordTime?: string
  description: string
  recordType?: string
}): Promise<HealthEventRecord> {
  const res = await apiFetch(`/healthEvent/record/add`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to add health event record: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 编辑健康事件记录
 */
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
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update health event record: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 删除健康事件记录
 */
export async function deleteHealthEventRecord(recordId: number): Promise<void> {
  const res = await apiFetch(`/healthEvent/record/delete/${recordId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error(`Failed to delete health event record: ${res.status}`)
}

/**
 * 获取健康事件的历程记录
 */
export async function getHealthEventRecords(eventId: number): Promise<HealthEventRecord[]> {
  const res = await apiFetch(`/healthEvent/record/list/${eventId}`)
  if (!res.ok) throw new Error(`Failed to get health event records: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 获取健康事件状态统计
 */
export async function getHealthEventStatistics(memberId: number): Promise<Record<string, number>> {
  const res = await apiFetch(`/healthEvent/statistics/${memberId}`)
  if (!res.ok) throw new Error(`Failed to get health event statistics: ${res.status}`)
  const data = await res.json()
  return data.data
}
