import { apiFetch } from "./api-client"

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
  events: HealthEvent[]
  statistics: Record<string, number>
  total: number
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
}): Promise<HealthEvent> {
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
): Promise<HealthEvent> {
  const res = await apiFetch(`/healthEvent/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update health event: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 获取健康事件列表
 */
export async function listHealthEvents(memberId: number): Promise<HealthEventListResponse> {
  const res = await apiFetch(`/healthEvent/list/${memberId}`)
  if (!res.ok) throw new Error(`Failed to list health events: ${res.status}`)
  const data = await res.json()
  return data.data
}

/**
 * 获取健康事件详情
 */
export async function getHealthEventDetail(id: number): Promise<HealthEvent> {
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
