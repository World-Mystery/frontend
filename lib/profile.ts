import { apiFetch } from "@/lib/api-client"

export type Profile = {
  age?: number
  heightCm?: number
  weightKg?: number
  bmi?: number
  bloodType?: string
  totalCholesterol?: number
  restingHeartRate?: number
  uricAcid?: number
  allergies?: string[]
  chronicDiseases?: string[]
  familyHistory?: string[]
  pastSurgeries?: string[]
  bodyConstitution?: string
  smokingStatus?: string
  drinkingStatus?: string
  averageSleepHours?: number
}

export type ProfileUpdatePayload = Partial<{
  heightCm: number
  weightKg: number
  bloodType: string
  systolicPressure: number
  diastolicPressure: number
  fastingGlucose: number
  postprandialGlucose: number
  uricAcid: number
  totalCholesterol: number
  restingHeartRate: number
  allergies: string[]
  chronicDiseases: string[]
  familyHistory: string[]
  pastSurgeries: string[]
  bodyConstitution: string | null
  smokingStatus: string | null
  drinkingStatus: string | null
  averageSleepHours: number
  subjectiveSymptom: string | null
}>

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

export async function getProfile(): Promise<Profile> {
  const res = await apiFetch("/member/profile", { method: "GET" })
  return handleResponse<Profile>(res)
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  const res = await apiFetch("/member/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return handleResponse<Profile>(res)
}
