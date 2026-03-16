import { apiFetch } from "@/lib/api-client"

export type ChatHistoryItem = {
  id: number
  role: "user" | "assistant"
  message: string
  createTime?: string
}

/**
 * 保存聊天记录到后端。
 * 后端目前使用 form-urlencoded 解析参数，这里保持兼容。
 */
export async function addChatHistory(
  sessionId: number,
  message: string,
  role?: "user" | "assistant"
): Promise<void> {
  const body = new URLSearchParams()
  body.set("sessionId", String(sessionId))
  body.set("message", message)
  if (role) body.set("role", role)

  const res = await apiFetch("/chat-history/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  if (!res.ok) {
    throw new Error(`保存聊天记录失败: ${res.status}`)
  }
}

/**
 * 获取会话的历史聊天记录。
 * 注意：如果后端未实现该接口，可能会返回 404，这里会兜底为空数组。
 */
export async function listChatHistory(sessionId: number, limit = 50): Promise<ChatHistoryItem[]> {
  const res = await apiFetch(`/chat-history/list/${sessionId}?limit=${limit}`, { method: "GET" })
  if (res.status === 404 || res.status === 204) return []
  if (!res.ok) {
    throw new Error(`历史记录接口不可用，状态码: ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data?.data) ? data.data : []
}
