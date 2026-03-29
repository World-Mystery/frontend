﻿// Prefer env, fallback to local backend dev port to avoid hitting Next.js dev server with relative paths
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081"
const NORMALIZED_BASE_URL = API_BASE_URL.endsWith("/")
  ? API_BASE_URL.slice(0, -1)
  : API_BASE_URL

export function getAuthToken(): string {
  if (typeof window === "undefined") return ""
  return (
    localStorage.getItem("aiHealthy.token") ??
    localStorage.getItem("token") ??
    ""
  )
}

function getStoredMemberId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("aiHealthy.activeMemberId") ?? ""
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {})
  const token = getAuthToken()
  if (token) headers.set("token", token)
  const memberIdHeader = headers.get("memberId") ?? getStoredMemberId()
  if (memberIdHeader) headers.set("memberId", memberIdHeader)
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const fullUrl = `${NORMALIZED_BASE_URL}${path}`
  console.log(`API Request: ${fullUrl}`)
  console.log("Headers:", {
    token: token ? "***" : "not set",
    memberId: memberIdHeader || "not set",
  })

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  console.log(`API Response for ${path}: ${response.status}`)

  return response
}
