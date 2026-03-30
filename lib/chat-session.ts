import { apiFetch } from "@/lib/api-client"

export type ChatSession = {
  id: number
  title?: string
  createTime?: unknown
}

function parseSessionId(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
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
  let previousSessionIds = new Set<number>()
  try {
    const previousSessions = await listChatSessions()
    previousSessionIds = new Set(previousSessions.map((session) => session.id))
  } catch {
    // Continue even if the preflight lookup fails; we'll still try the create request.
  }

  const res = await apiFetch("/chat-session/add", { method: "POST" })
  if (!res.ok) {
    throw new Error(`Failed to add session: ${res.status}`)
  }

  try {
    const data = await res.json()
    const directId = parseSessionId(data?.data?.id ?? data?.id)
    if (directId) {
      return directId
    }
  } catch {
    // Some backend implementations only return a generic success wrapper with no JSON body.
  }

  const sessions = await listChatSessions()
  const createdSession = sessions.find((session) => !previousSessionIds.has(session.id))
  if (createdSession?.id) {
    return createdSession.id
  }

  return sessions[0]?.id
}

export async function deleteChatSession(sessionId: number): Promise<void> {
  const res = await apiFetch(`/chat-session/delete/${sessionId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.status}`)
  }
}
