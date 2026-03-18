"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createHealthEvent, updateHealthEvent, mapBackendEventToUI, formatDate, getTodayDateString } from "@/lib/health-event"
import { getStoredMemberId } from "@/lib/member"
import type { HealthEvent, EventStatus } from "./types"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: HealthEvent | null
  onSave: (event: HealthEvent) => void
}

export function EventDialog({ open, onOpenChange, event, onSave }: EventDialogProps) {
  const isNew = !event
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [status, setStatus] = useState<EventStatus>("active")
  const [diagnosis, setDiagnosis] = useState("")
  const [nextFollowUp, setNextFollowUp] = useState("")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [resolution, setResolution] = useState("")
  const [newSymptom, setNewSymptom] = useState("")
  const [newMedication, setNewMedication] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStartDate(event.startDate)
      setStatus(event.status)
      setDiagnosis(event.diagnosis || "")
      setNextFollowUp(event.nextFollowUp || "")
      setSymptoms([...event.symptoms])
      setMedications([...event.medications])
      setResolution(event.resolution || "")
    } else {
      setTitle("")
      setStartDate(getTodayDateString())
      setStatus("active")
      setDiagnosis("")
      setNextFollowUp("")
      setSymptoms([])
      setMedications([])
      setResolution("")
    }
    setError(null)
  }, [event, open])

  const handleAddSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()])
      setNewSymptom("")
    }
  }

  const handleAddMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()])
      setNewMedication("")
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !startDate) return

    setSaving(true)
    setError(null)

    try {
      const memberId = getStoredMemberId()
      if (!memberId) {
        throw new Error("未能获取成员信息")
      }

      let result: any

      if (isNew) {
        // 创建新事件
        result = await createHealthEvent({
          eventName: title.trim(),
          diseaseName: diagnosis.trim() || undefined,
          status: status === "active" ? "进行中" : "已康复",
          symptoms,
          medications,
          source: "手工",
          memberId,
        })
      } else {
        // 更新现有事件
        const eventId = typeof event?.id === "number" ? event.id : parseInt(String(event?.id), 10)
        result = await updateHealthEvent(eventId, {
          eventName: title.trim(),
          diseaseName: diagnosis.trim() || undefined,
          status: status === "active" ? "进行中" : "已康复",
          symptoms,
          medications,
        })
      }

      // 将后端返回的数据转换为前端格式
      const savedEvent = mapBackendEventToUI(result)
      onSave(savedEvent)
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败，请重试"
      setError(message)
      console.error("Failed to save event:", err)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "新增健康事件" : "编辑健康事件"}</DialogTitle>
          <DialogDescription>
            {isNew ? "记录一次新的健康事件，追踪病程发展" : "更新事件信息和状态"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              事件名称 <span className="text-destructive">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：急性肠胃炎"
              className={inputClass}
              disabled={saving}
            />
          </div>

          {/* Date & Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                发生日期 <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
                disabled={saving}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                当前状态
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus("active")}
                  disabled={saving}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    status === "active"
                      ? "border-red-300 bg-red-500/[0.07] text-red-600 dark:border-red-800 dark:text-red-400"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  治疗中
                </button>
                <button
                  onClick={() => setStatus("recovered")}
                  disabled={saving}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    status === "recovered"
                      ? "border-emerald-300 bg-emerald-500/[0.07] text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  已康复
                </button>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              诊断结论
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="如：慢性浅表性胃炎"
              className={inputClass}
              disabled={saving}
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              症状
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {symptoms.map((s, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs">
                  {s}
                  <button
                    onClick={() => setSymptoms(symptoms.filter((_, j) => j !== i))}
                    disabled={saving}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSymptom())}
                placeholder="添加症状..."
                className={cn(inputClass, "flex-1")}
                disabled={saving}
              />
              <button
                onClick={handleAddSymptom}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              用药情况
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {medications.map((m, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="gap-1 pr-1 text-xs border-amber-200 text-amber-600 dark:border-amber-900/40 dark:text-amber-400"
                >
                  {m}
                  <button
                    onClick={() => setMedications(medications.filter((_, j) => j !== i))}
                    disabled={saving}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMedication())}
                placeholder="添加药物..."
                className={cn(inputClass, "flex-1")}
                disabled={saving}
              />
              <button
                onClick={handleAddMedication}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !startDate || saving}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2",
              title.trim() && startDate && !saving
                ? "btn-bubble"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isNew ? "创建事件" : "保存更改"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
