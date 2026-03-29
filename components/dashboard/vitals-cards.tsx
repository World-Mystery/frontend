"use client"

import { useState, useRef, useEffect } from "react"
import {
  Droplets,
  Heart,
  Activity,
  Beaker,
  Gauge,
  Pencil,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile, ProfileUpdatePayload } from "@/lib/profile"

type VitalStatus = "normal" | "warning" | "danger"

interface VitalItem {
  id: string
  label: string
  value: string
  unit: string
  icon: React.ElementType
  status: VitalStatus
  subLabel?: string
  editable?: boolean
}

const statusColors = {
  normal: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "正常",
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/[0.06]",
    text: "text-amber-600 dark:text-amber-400",
    label: "偏高",
  },
  danger: {
    dot: "bg-red-500",
    bg: "bg-red-500/[0.06]",
    text: "text-red-600 dark:text-red-400",
    label: "异常",
  },
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
  const [editValue, setEditValue] = useState(vital.value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(vital.value)
  }, [vital.value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(vital.id, editValue.trim()).catch(() => {
        /* error surfaced by parent */
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(vital.value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  const Icon = vital.icon
  const colors = statusColors[vital.status]

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm">
      {/* Edit button */}
      {!isEditing && vital.editable && !disabled && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-accent group-hover:opacity-100"
          aria-label={`编辑${vital.label}`}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}

      {/* Icon + Label */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.text)} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{vital.label}</p>
          {vital.subLabel && (
            <p className="text-[11px] text-muted-foreground">{vital.subLabel}</p>
          )}
        </div>
      </div>

      {/* Value */}
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className="h-8 w-full rounded-md border border-primary/30 bg-background px-2 text-lg font-semibold text-foreground outline-none ring-1 ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {vital.value}
          </span>
          <span className="text-sm text-muted-foreground">{vital.unit}</span>
        </div>
      )}

      {/* Status indicator */}
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

export function VitalsCards({ profile, loading, saving, onSave, onError }: VitalsCardsProps) {
  const [savingId, setSavingId] = useState<string | null>(null)

  const safeValue = (value?: number | string | null, formatter?: (v: number | string) => string) => {
    if (value === undefined || value === null || value === "") return "--"
    return formatter ? formatter(value) : String(value)
  }

  const vitals: VitalItem[] = [
    {
      id: "age",
      label: "年龄",
      value: safeValue(profile?.age),
      unit: "岁",
      icon: Heart,
      status: "normal",
      editable: false,
    },
    {
      id: "height",
      label: "身高",
      value: safeValue(profile?.heightCm),
      unit: "cm",
      icon: Activity,
      status: "normal",
      editable: true,
    },
    {
      id: "weight",
      label: "体重",
      value: safeValue(profile?.weightKg),
      unit: "kg",
      icon: Gauge,
      status: "normal",
      editable: true,
    },
    {
      id: "bmi",
      label: "BMI",
      value: safeValue(profile?.bmi, (v) => Number(v).toFixed(1)),
      unit: "kg/m²",
      icon: Beaker,
      status: "normal",
      editable: false,
    },
    {
      id: "blood-type",
      label: "血型",
      value: safeValue(profile?.bloodType),
      unit: "型",
      icon: Droplets,
      status: "normal",
      editable: true,
    },
    {
      id: "cholesterol",
      label: "胆固醇",
      value: safeValue(profile?.totalCholesterol),
      unit: "mmol/L",
      icon: Heart,
      status: "warning",
      editable: true,
    },
    {
      id: "heart-rate",
      label: "心率",
      value: safeValue(profile?.restingHeartRate),
      unit: "bpm",
      icon: Heart,
      status: "normal",
      editable: true,
    },
    {
      id: "uric-acid",
      label: "尿酸",
      value: safeValue(profile?.uricAcid),
      unit: "μmol/L",
      icon: Gauge,
      status: "normal",
      editable: true,
    },
  ]

  const toNumber = (value: string) => {
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : null
  }

  const handleSave = async (id: string, value: string) => {
    const payload: ProfileUpdatePayload = {}
    switch (id) {
      case "height": {
        const num = toNumber(value)
        if (num === null) return onError?.("请输入有效的身高数值")
        payload.heightCm = num
        break
      }
      case "weight": {
        const num = toNumber(value)
        if (num === null) return onError?.("请输入有效的体重数值")
        payload.weightKg = num
        break
      }
      case "blood-type":
        payload.bloodType = value
        break
      case "cholesterol": {
        const num = toNumber(value)
        if (num === null) return onError?.("请输入有效的胆固醇数值")
        payload.totalCholesterol = num
        break
      }
      case "heart-rate": {
        const num = toNumber(value)
        if (num === null) return onError?.("请输入有效的心率数值")
        payload.restingHeartRate = Math.round(num)
        break
      }
      case "uric-acid": {
        const num = toNumber(value)
        if (num === null) return onError?.("请输入有效的尿酸数值")
        payload.uricAcid = num
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
              saving={saving || savingId === vital.id}
              disabled={loading || saving || !vital.editable}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
