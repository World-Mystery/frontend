import { apiFetch } from "@/lib/api-client"

export type AiMemoryCategory =
  | "symptom"
  | "medication"
  | "habit"
  | "preference"
  | "other"

export type AiMemory = {
  id: string
  content: string
  source: string
  category: AiMemoryCategory
  rawCategory: string
  timestamp: number | null
}

type ApiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type AiMemoryApiItem = {
  id?: string | number | null
  content?: string | null
  message?: string | null
  source?: string | null
  category?: string | null
  createTime?: number | string | null
  time?: number | string | null
}

function normalizeTimestamp(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function normalizeCategory(value: string | null | undefined): AiMemoryCategory {
  const normalized = value?.trim().toLowerCase()

  if (
    normalized === "symptom" ||
    value === "\u75c7\u72b6" ||
    value === "鐥囩姸"
  ) {
    return "symptom"
  }

  if (
    normalized === "medication" ||
    value === "\u7528\u836f" ||
    value === "\u7528\u85e5" ||
    value === "\u7981\u5fcc" ||
    value === "\u836f\u7269" ||
    value === "\u85e5\u7269" ||
    value === "鐢ㄨ嵂" ||
    value === "绂佸繉"
  ) {
    return "medication"
  }

  if (
    normalized === "habit" ||
    value === "\u4e60\u60ef" ||
    value === "涔犳儻"
  ) {
    return "habit"
  }

  if (
    normalized === "preference" ||
    value === "\u504f\u597d" ||
    value === "鍋忓ソ"
  ) {
    return "preference"
  }

  return "other"
}

export async function getAiMemories(): Promise<AiMemory[]> {
  const res = await apiFetch("/ai/memory/list", { method: "GET" })
  if (!res.ok) {
    throw new Error(`Failed to load AI memories: ${res.status}`)
  }

  const body = (await res.json()) as ApiResponse<AiMemoryApiItem[]>
  const items = Array.isArray(body?.data) ? body.data : []

  return items.map((item, index) => {
    const rawCategory = item.category?.trim() || "other"
    return {
      id: String(item.id ?? `memory-${index}`),
      content: (item.content ?? item.message ?? "").trim(),
      source: (item.source ?? "").trim(),
      category: normalizeCategory(rawCategory),
      rawCategory,
      timestamp: normalizeTimestamp(item.createTime ?? item.time),
    }
  })
}

