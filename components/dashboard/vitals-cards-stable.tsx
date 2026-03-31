"use client"

import { useEffect, useRef, useState } from "react"
import {
  Activity,
  Beaker,
  Check,
  Droplets,
  Gauge,
  Heart,
  Pencil,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile, ProfileUpdatePayload } from "@/lib/profile-stable"

type VitalStatus = "normal" | "high" | "low" | "unknown"

type VitalItem = {
  id: string
  label: string
  value: string
  unit: string
  icon: LucideIcon
  status: VitalStatus
  editable?: boolean
}

const TEXT = {
  normal: "\u6b63\u5e38",
  high: "\u504f\u9ad8",
  low: "\u504f\u4f4e",
  unknown: "\u672a\u5f55\u5165",
  title: "\u6838\u5fc3\u751f\u7406\u6307\u6807",
  subtitle: "\u6570\u636e\u6765\u81ea\u540e\u53f0\u6863\u6848\uff0c\u53ef\u7f16\u8f91\u5e76\u5b9e\u65f6\u4fdd\u5b58",
  edit: "\u7f16\u8f91",
  save: "\u4fdd\u5b58",
  cancel: "\u53d6\u6d88\u7f16\u8f91",
  age: "\u5e74\u9f84",
  ageUnit: "\u5c81",
  height: "\u8eab\u9ad8",
  weight: "\u4f53\u91cd",
  bloodType: "\u8840\u578b",
  cholesterol: "\u80c6\u56fa\u9187",
  heartRate: "\u5fc3\u7387",
  uricAcid: "\u5c3f\u9178",
  invalidHeight: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u8eab\u9ad8\u6570\u503c",
  invalidWeight: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u4f53\u91cd\u6570\u503c",
  invalidCholesterol: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u80c6\u56fa\u9187\u6570\u503c",
  invalidHeartRate: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u5fc3\u7387\u6570\u503c",
  invalidUricAcid: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u5c3f\u9178\u6570\u503c",
} as const

const STATUS_STYLES: Record<
  VitalStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  normal: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-600 dark:text-emerald-400",
    label: TEXT.normal,
  },
  high: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/[0.06]",
    text: "text-amber-600 dark:text-amber-400",
    label: TEXT.high,
  },
  low: {
    dot: "bg-red-500",
    bg: "bg-red-500/[0.06]",
    text: "text-red-600 dark:text-red-400",
    label: TEXT.low,
  },
  unknown: {
    dot: "bg-muted-foreground/50",
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: TEXT.unknown,
  },
}

function getRangeStatus(
  value: number | null | undefined,
  normalMin: number,
  normalMax: number
): VitalStatus {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "unknown"
  }
  if (value < normalMin) return "low"
  if (value > normalMax) return "high"
  return "normal"
}

function getPresenceStatus(value: string | number | null | undefined): VitalStatus {
  if (value === null || value === undefined || value === "") {
    return "unknown"
  }
  return "normal"
}

function formatValue(
  value: number | string | null | undefined,
  formatter?: (value: number | string) => string
) {
  if (value === null || value === undefined || value === "") {
    return "--"
  }

  return formatter ? formatter(value) : String(value)
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

function EditableVitalCard({
  vital,
  onSave,
  saving,
  disabled,
}: {
  vital: VitalItem
  onSave: (id: string, value: string) => Promise<void>
  saving: boolean
  disabled?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(vital.value === "--" ? "" : vital.value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(vital.value === "--" ? "" : vital.value)
  }, [vital.value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const nextValue = editValue.trim()
    if (!nextValue) {
      return
    }

    onSave(vital.id, nextValue)
      .then(() => setIsEditing(false))
      .catch(() => {
        /* 错误由父组件统一提示 */
      })
  }

  const handleCancel = () => {
    setEditValue(vital.value === "--" ? "" : vital.value)
    setIsEditing(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave()
    }
    if (event.key === "Escape") {
      handleCancel()
    }
  }

  const Icon = vital.icon
  const colors = STATUS_STYLES[vital.status]

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm">
      {!isEditing && vital.editable && !disabled && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-accent group-hover:opacity-100"
          aria-label={`${TEXT.edit}${vital.label}`}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}

      <div className="mb-3 flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <p className="text-sm font-medium text-foreground">{vital.label}</p>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="h-8 min-w-0 flex-1 rounded-md border border-primary/30 bg-background px-2 text-lg font-semibold text-foreground outline-none ring-1 ring-primary/20 selection:bg-primary selection:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`${TEXT.save}${vital.label}`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`${TEXT.cancel}${vital.label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">{vital.value}</span>
          <span className="text-sm text-muted-foreground">{vital.unit}</span>
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
        <span className={cn("text-xs font-medium", colors.text)}>{colors.label}</span>
      </div>
    </div>
  )
}

type VitalsCardsProps = {
  profile: Profile | null
  loading?: boolean
  saving?: boolean
  onSave: (payload: ProfileUpdatePayload) => Promise<void>
  onError?: (message: string) => void
}

export function VitalsCards({
  profile,
  loading,
  saving,
  onSave,
  onError,
}: VitalsCardsProps) {
  const [savingId, setSavingId] = useState<string | null>(null)

  const vitals: VitalItem[] = [
    {
      id: "age",
      label: TEXT.age,
      value: formatValue(profile?.age),
      unit: TEXT.ageUnit,
      icon: Heart,
      status: getPresenceStatus(profile?.age),
    },
    {
      id: "height",
      label: TEXT.height,
      value: formatValue(profile?.heightCm),
      unit: "cm",
      icon: Activity,
      status: getPresenceStatus(profile?.heightCm),
      editable: true,
    },
    {
      id: "weight",
      label: TEXT.weight,
      value: formatValue(profile?.weightKg),
      unit: "kg",
      icon: Gauge,
      status: getPresenceStatus(profile?.weightKg),
      editable: true,
    },
    {
      id: "bmi",
      label: "BMI",
      value: formatValue(profile?.bmi, (value) => Number(value).toFixed(1)),
      unit: "kg/m\u00b2",
      icon: Beaker,
      status: getRangeStatus(profile?.bmi, 18.5, 23.9),
    },
    {
      id: "blood-type",
      label: TEXT.bloodType,
      value: formatValue(profile?.bloodType),
      unit: "",
      icon: Droplets,
      status: getPresenceStatus(profile?.bloodType),
      editable: true,
    },
    {
      id: "cholesterol",
      label: TEXT.cholesterol,
      value: formatValue(profile?.totalCholesterol),
      unit: "mmol/L",
      icon: Heart,
      status: getRangeStatus(profile?.totalCholesterol, 3.1, 5.2),
      editable: true,
    },
    {
      id: "heart-rate",
      label: TEXT.heartRate,
      value: formatValue(profile?.restingHeartRate),
      unit: "bpm",
      icon: Heart,
      status: getRangeStatus(profile?.restingHeartRate, 60, 100),
      editable: true,
    },
    {
      id: "uric-acid",
      label: TEXT.uricAcid,
      value: formatValue(profile?.uricAcid),
      unit: "\u03bcmol/L",
      icon: Gauge,
      status: getRangeStatus(profile?.uricAcid, 210, 420),
      editable: true,
    },
  ]

  const handleSave = async (id: string, value: string) => {
    const payload: ProfileUpdatePayload = {}

    switch (id) {
      case "height": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.(TEXT.invalidHeight)
          return
        }
        payload.heightCm = numberValue
        break
      }
      case "weight": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.(TEXT.invalidWeight)
          return
        }
        payload.weightKg = numberValue
        break
      }
      case "blood-type":
        payload.bloodType = value.toUpperCase()
        break
      case "cholesterol": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.(TEXT.invalidCholesterol)
          return
        }
        payload.totalCholesterol = numberValue
        break
      }
      case "heart-rate": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.(TEXT.invalidHeartRate)
          return
        }
        payload.restingHeartRate = Math.round(numberValue)
        break
      }
      case "uric-acid": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.(TEXT.invalidUricAcid)
          return
        }
        payload.uricAcid = numberValue
        break
      }
      default:
        return
    }

    setSavingId(id)
    try {
      await onSave(payload)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card">
      <div className="border-b border-border/40 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{TEXT.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{TEXT.subtitle}</p>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {vitals.map((vital) => (
            <EditableVitalCard
              key={vital.id}
              vital={vital}
              onSave={handleSave}
              saving={Boolean(saving) || savingId === vital.id}
              disabled={loading || saving || !vital.editable}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
