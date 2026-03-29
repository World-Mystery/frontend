import { apiFetch } from "@/lib/api-client"

export type GraphDTO = {
  timeAxis?: string[]
  heartRateData?: number[]
  bloodOxygenData?: number[]
  microcirculationData?: number[]
  sdannData?: number[]
  rmssdData?: number[]
  nn50Data?: number[]
  pnn50Data?: number[]
}

type ApiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`请求失败：${res.status}`)
  }
  const body = (await res.json()) as ApiResponse<T>
  if (body && "data" in body) {
    return body.data as T
  }
  throw new Error("响应格式不正确")
}

export async function getVitalsChart(): Promise<GraphDTO> {
  const res = await apiFetch("/member/vitals/chart", { method: "GET" })
  return handleResponse<GraphDTO>(res)
}

