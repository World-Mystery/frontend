export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
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

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {})
  const token = getAuthToken()
  if (token) headers.set("token", token)
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${NORMALIZED_BASE_URL}${path}`, {
    ...options,
    headers,
  })
}

