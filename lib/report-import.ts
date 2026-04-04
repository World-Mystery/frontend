import { apiFetch } from "@/lib/api-client"

type ApiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text()
  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    return {}
  }
}

export async function importHealthReport(file: File): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiFetch("/ai/extraction/image", {
    method: "POST",
    body: formData,
  })

  const result = await parseApiResponse<unknown>(response)

  if (!response.ok) {
    throw new Error(result.msg || `体检单解析请求失败：${response.status}`)
  }

  if (typeof result.code === "number" && result.code !== 1) {
    throw new Error(result.msg || "体检单解析失败")
  }
}
