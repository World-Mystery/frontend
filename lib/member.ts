import { apiFetch } from "@/lib/api-client"

export type Member = {
  id: number
  nickname?: string
  sex?: "m" | "f"
  birthday?: string
  heightCm?: number
  weightKg?: number
}

const STORAGE_KEY = "aiHealthy.activeMemberId"
const DEFAULT_MEMBER_ID_KEY = "aiHealthy.defaultMemberId"
const DEFAULT_MEMBER_NICKNAME = "我"

export function getStoredMemberId(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function getDefaultMemberId(): number | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(DEFAULT_MEMBER_ID_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function setDefaultMemberId(memberId: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(DEFAULT_MEMBER_ID_KEY, String(memberId))
}

export function isDefaultMember(member: Pick<Member, "id" | "nickname">): boolean {
  const storedDefaultId = getDefaultMemberId()
  if (storedDefaultId) return member.id === storedDefaultId
  return member.nickname?.trim() === DEFAULT_MEMBER_NICKNAME
}

function ensureDefaultMemberId(members: Member[]) {
  if (members.length === 0) return
  const storedDefault = getDefaultMemberId()
  if (storedDefault && members.some((member) => member.id === storedDefault)) return
  const namedDefault = members.find(
    (member) => member.nickname?.trim() === DEFAULT_MEMBER_NICKNAME
  )
  setDefaultMemberId((namedDefault ?? members[0]).id)
}

export function setStoredMemberId(memberId: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, String(memberId))
}

export async function listMembers(): Promise<Member[]> {
  const res = await apiFetch("/member/list", {
    method: "GET",
  })
  if (!res.ok) {
    throw new Error(`Failed to load members: ${res.status}`)
  }
  const data = await res.json()
  return Array.isArray(data?.data) ? data.data : []
}

export async function addMember(payload: Partial<Member>): Promise<void> {
  const res = await apiFetch("/member/add", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Failed to add member: ${res.status}`)
  }
}

export async function updateMember(payload: Partial<Member> & { id: number }): Promise<void> {
  const res = await apiFetch("/member/update", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Failed to update member: ${res.status}`)
  }
}

export async function deleteMember(memberId: number): Promise<void> {
  const defaultId = getDefaultMemberId()
  if (defaultId && memberId === defaultId) {
    throw new Error("Default member cannot be deleted")
  }
  const res = await apiFetch(`/member/${memberId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error(`Failed to delete member: ${res.status}`)
  }
}

async function createDefaultMember(): Promise<void> {
  await addMember({ nickname: DEFAULT_MEMBER_NICKNAME })
}

export async function ensureActiveMemberId(): Promise<number | null> {
  const cached = getStoredMemberId()
  const members = await listMembers()
  if (members.length === 0) {
    await createDefaultMember()
    const refreshed = await listMembers()
    const first = refreshed[0]
    if (!first?.id) return null
    setStoredMemberId(first.id)
    setDefaultMemberId(first.id)
    return first.id
  }

  ensureDefaultMemberId(members)

  if (cached && members.some((member) => member.id === cached)) {
    return cached
  }

  const first = members[0]
  if (!first?.id) return null

  setStoredMemberId(first.id)
  return first.id
}
