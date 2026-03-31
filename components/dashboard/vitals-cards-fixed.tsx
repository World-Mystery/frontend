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
import type { Profile, ProfileUpdatePayload } from "@/lib/profile"

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

const STATUS_STYLES: Record<
  VitalStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  normal: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "正常",
  },
  high: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/[0.06]",
    text: "text-amber-600 dark:text-amber-400",
    label: "偏高",
  },
  low: {
    dot: "bg-red-500",
    bg: "bg-red-500/[0.06]",
    text: "text-red-600 dark:text-red-400",
    label: "偏低",
  },
  unknown: {
    dot: "bg-muted-foreground/50",
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "未录入",
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
          aria-label={`编辑${vital.label}`}
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
            aria-label={`保存${vital.label}`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`取消编辑${vital.label}`}
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
      label: "年龄",
      value: formatValue(profile?.age),
      unit: "岁",
      icon: Heart,
      status: getPresenceStatus(profile?.age),
    },
    {
      id: "height",
      label: "身高",
      value: formatValue(profile?.heightCm),
      unit: "cm",
      icon: Activity,
      status: getPresenceStatus(profile?.heightCm),
      editable: true,
    },
    {
      id: "weight",
      label: "体重",
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
      unit: "kg/m²",
      icon: Beaker,
      status: getRangeStatus(profile?.bmi, 18.5, 23.9),
    },
    {
      id: "blood-type",
      label: "血型",
      value: formatValue(profile?.bloodType),
      unit: "",
      icon: Droplets,
      status: getPresenceStatus(profile?.bloodType),
      editable: true,
    },
    {
      id: "cholesterol",
      label: "胆固醇",
      value: formatValue(profile?.totalCholesterol),
      unit: "mmol/L",
      icon: Heart,
      status: getRangeStatus(profile?.totalCholesterol, 3.1, 5.2),
      editable: true,
    },
    {
      id: "heart-rate",
      label: "心率",
      value: formatValue(profile?.restingHeartRate),
      unit: "bpm",
      icon: Heart,
      status: getRangeStatus(profile?.restingHeartRate, 60, 100),
      editable: true,
    },
    {
      id: "uric-acid",
      label: "尿酸",
      value: formatValue(profile?.uricAcid),
      unit: "μmol/L",
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
          onError?.("请输入有效的身高数值")
          return
        }
        payload.heightCm = numberValue
        break
      }
      case "weight": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.("请输入有效的体重数值")
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
          onError?.("请输入有效的胆固醇数值")
          return
        }
        payload.totalCholesterol = numberValue
        break
      }
      case "heart-rate": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.("请输入有效的心率数值")
          return
        }
        payload.restingHeartRate = Math.round(numberValue)
        break
      }
      case "uric-acid": {
        const numberValue = toNumber(value)
        if (numberValue === null) {
          onError?.("请输入有效的尿酸数值")
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
          <h2 className="text-base font-semibold text-foreground">核心生理指标</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            数据来自后台档案，可编辑并实时保存
          </p>
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
