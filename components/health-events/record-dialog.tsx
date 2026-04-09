"use client"

import { useEffect, useState } from "react"
import { Loader2, NotebookPen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  addHealthEventRecord,
  getTodayDateString,
  updateHealthEventRecord,
  type HealthEventRecord,
} from "@/lib/health-event"
import type { TimelineEntry } from "./types"

interface RecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: number | null
  eventTitle: string
  entry: TimelineEntry | null
  onSave: (record: HealthEventRecord) => void | Promise<void>
}

export function RecordDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  entry,
  onSave,
}: RecordDialogProps) {
  const isEditing = !!entry
  const [recordDate, setRecordDate] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setRecordDate(entry?.date || getTodayDateString())
    setDescription(entry?.description || "")
    setError(null)
  }, [entry, open])

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"

  const handleSubmit = async () => {
    if (!eventId || !recordDate || !description.trim()) return

    setSaving(true)
    setError(null)

    try {
      const savedRecord = isEditing
        ? await updateHealthEventRecord(Number(entry.id), {
            recordTime: recordDate,
            description: description.trim(),
          })
        : await addHealthEventRecord({
            eventId,
            recordTime: recordDate,
            description: description.trim(),
          })

      await onSave(savedRecord)
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存健康事件记录失败，请重试"
      setError(message)
      console.error("Failed to save health event record:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-primary" />
            {isEditing ? "编辑健康事件记录" : "新增健康事件记录"}
          </DialogTitle>
          <DialogDescription>
            {eventTitle ? `为“${eventTitle}”补充更详细的病程记录。` : "补充更详细的病程记录。"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              记录日期 <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              详细记录 <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：餐后腹胀加重，服药后症状略有缓解，建议继续观察。"
              rows={5}
              className={cn(
                "min-h-[132px] resize-none rounded-lg border-border bg-background text-sm",
                "focus-visible:border-primary/40 focus-visible:ring-primary/20"
              )}
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!eventId || !recordDate || !description.trim() || saving}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              eventId && recordDate && description.trim() && !saving
                ? "btn-bubble"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? "保存记录" : "新增记录"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
