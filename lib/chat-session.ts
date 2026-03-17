import { apiFetch } from "@/lib/api-client"

export type ChatSession = {
  id: number
  title?: string
  createTime?: unknown
}

export async function listChatSessions(): Promise<ChatSession[]> {
  const res = await apiFetch("/chat-session/list", { method: "GET" })
  if (!res.ok) {
    throw new Error(`Failed to load sessions: ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data?.data) ? data.data : []
}

export async function addChatSession(): Promise<number | undefined> {
  const res = await apiFetch("/chat-session/add", { method: "POST" })
  if (!res.ok) {
    throw new Error(`Failed to add session: ${res.status}`)
  }
  try {
    const data = await res.json()
    return data?.data?.id ?? data?.id
  } catch {
    return undefined
  }
}

export async function deleteChatSession(sessionId: number): Promise<void> {
  const res = await apiFetch(`/chat-session/delete/${sessionId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.status}`)
  }
}
