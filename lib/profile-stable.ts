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
  heightCm: number | null
  weightKg: number | null
  bloodType: string | null
  systolicPressure: number | null
  diastolicPressure: number | null
  fastingGlucose: number | null
  postprandialGlucose: number | null
  uricAcid: number | null
  totalCholesterol: number | null
  restingHeartRate: number | null
  allergies: string[]
  chronicDiseases: string[]
  familyHistory: string[]
  pastSurgeries: string[]
  bodyConstitution: string | null
  smokingStatus: string | null
  drinkingStatus: string | null
  averageSleepHours: number | null
  subjectiveSymptom: string | null
}>

type ApiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`\u8bf7\u6c42\u5931\u8d25\uff1a${res.status}`)
  }

  const body = (await res.json()) as ApiResponse<T>
  if (body && "data" in body) {
    return body.data as T
  }

  throw new Error("\u54cd\u5e94\u683c\u5f0f\u4e0d\u6b63\u786e")
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
