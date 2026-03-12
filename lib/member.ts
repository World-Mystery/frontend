import { apiFetch } from "@/lib/api-client"

type Member = {
  id: number
  nickname?: string
}

const STORAGE_KEY = "aiHealthy.activeMemberId"

export function getStoredMemberId(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function setStoredMemberId(memberId: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, String(memberId))
}

async function fetchMembers(): Promise<Member[]> {
  const res = await apiFetch("/member/list", {
    method: "GET",
  })
  if (!res.ok) {
    throw new Error(`Failed to load members: ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data?.data) ? data.data : []
}

async function createDefaultMember(): Promise<void> {
  const nickname = `我-${Date.now().toString().slice(-6)}`
  const res = await apiFetch("/member/add", {
    method: "POST",
    body: JSON.stringify({ nickname }),
  })
  if (!res.ok) {
    throw new Error(`Failed to create default member: ${res.status}`)
  }
}

export async function ensureActiveMemberId(): Promise<number | null> {
  const cached = getStoredMemberId()
  if (cached) return cached

  const members = await fetchMembers()
  if (members.length === 0) {
    await createDefaultMember()
  }

  const refreshed = members.length === 0 ? await fetchMembers() : members
  const first = refreshed[0]
  if (!first?.id) return null

  setStoredMemberId(first.id)
  return first.id
}
