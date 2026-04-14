"use client"

import { useEffect, useState } from "react"
import {
  X,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api-client"
import { categoryMeta, type ScheduleBlock, type BlockCategory, type AiFeedback } from "./types"

interface AddBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTime: string
  onAdd: (block: ScheduleBlock) => void
  existingSchedule: ScheduleBlock[]
}

function generateAiFeedback(
  title: string,
  category: BlockCategory,
  startTime: string
): AiFeedback | null {
  if (!title.trim()) return null

  const hour = Number(startTime.split(":")[0])

  if (category === "exercise" && hour >= 21) {
    return {
      type: "warning",
      message:
        "\u591c\u95f4\u5267\u70c8\u8fd0\u52a8\u53ef\u80fd\u5f71\u54cd\u5165\u7761\uff0c\u5efa\u8bae\u6539\u4e3a\u8f7b\u91cf\u62c9\u4f38\uff0c\u6216\u63d0\u524d\u5230\u508d\u665a\u65f6\u6bb5\u3002",
    }
  }

  if (category === "meal" && hour >= 21) {
    return {
      type: "warning",
      message:
        "\u8f83\u665a\u8fdb\u98df\u4f1a\u589e\u52a0\u6d88\u5316\u8d1f\u62c5\uff0c\u5982\u679c\u786e\u5b9e\u9700\u8981\u52a0\u9910\uff0c\u5efa\u8bae\u9009\u62e9\u5c11\u91cf\u3001\u6e05\u6de1\u3001\u6613\u6d88\u5316\u7684\u98df\u7269\u3002",
    }
  }

  if (category === "exercise" && hour < 7) {
    return {
      type: "suggestion",
      message:
        "\u6668\u8d77\u8fd0\u52a8\u524d\u53ef\u4ee5\u5148\u8865\u5145\u5c11\u91cf\u6c34\u5206\u6216\u7b80\u5355\u8fdb\u98df\uff0c\u907f\u514d\u7a7a\u8179\u9ad8\u5f3a\u5ea6\u6d3b\u52a8\u3002",
    }
  }

  if (category === "medication" && (hour >= 22 || hour <= 5)) {
    return {
      type: "suggestion",
      message:
        "\u591c\u95f4\u7528\u836f\u8bf7\u786e\u8ba4\u4e0e\u533b\u5631\u4e00\u81f4\uff0c\u5982\u9700\u957f\u671f\u670d\u836f\uff0c\u5efa\u8bae\u7ed3\u5408\u533b\u751f\u5efa\u8bae\u56fa\u5b9a\u63d0\u9192\u65f6\u95f4\u3002",
    }
  }

  if (category === "rest" && hour >= 13 && hour <= 14) {
    return {
      type: "positive",
      message:
        "\u5348\u95f4\u5b89\u6392\u9002\u5ea6\u4f11\u606f\u6709\u52a9\u4e8e\u6062\u590d\u7cbe\u529b\uff0c\u8fd9\u4e2a\u65f6\u95f4\u6bb5\u6bd4\u8f83\u5408\u9002\u3002",
    }
  }

  if (category === "exercise" && hour >= 9 && hour <= 11) {
    return {
      type: "positive",
      message:
        "\u4e0a\u5348\u662f\u5f88\u591a\u4eba\u72b6\u6001\u6bd4\u8f83\u7a33\u5b9a\u7684\u8fd0\u52a8\u65f6\u6bb5\uff0c\u8fd9\u4e2a\u5b89\u6392\u6574\u4f53\u4e0d\u9519\u3002",
    }
  }

  return {
    type: "positive",
    message:
      "\u8fd9\u4e2a\u5b89\u6392\u770b\u8d77\u6765\u6bd4\u8f83\u5408\u7406\uff0c\u53ef\u4ee5\u52a0\u5165\u4eca\u5929\u7684\u65e5\u7a0b\u3002",
  }
}

const feedbackIcons = {
  warning: AlertTriangle,
  suggestion: Lightbulb,
  positive: ThumbsUp,
}

const feedbackStyles = {
  warning: {
    border: "border-red-200 dark:border-red-900/40",
    bg: "bg-red-500/[0.04]",
    icon: "text-red-500 dark:text-red-400",
    title: "text-red-600 dark:text-red-400",
  },
  suggestion: {
    border: "border-amber-200 dark:border-amber-900/40",
    bg: "bg-amber-500/[0.04]",
    icon: "text-amber-500 dark:text-amber-400",
    title: "text-amber-600 dark:text-amber-400",
  },
  positive: {
    border: "border-emerald-200 dark:border-emerald-900/40",
    bg: "bg-emerald-500/[0.04]",
    icon: "text-emerald-500 dark:text-emerald-400",
    title: "text-emerald-600 dark:text-emerald-400",
  },
}

const feedbackLabels = {
  warning: "\u5065\u5eb7\u63d0\u9192",
  suggestion: "AI \u5efa\u8bae",
  positive: "AI \u8bc4\u4f30",
}

const categoryTypeMap: Record<BlockCategory, string> = {
  meal: "\u996e\u98df",
  exercise: "\u8fd0\u52a8",
  rest: "\u4f11\u606f",
  medication: "\u7528\u836f",
  checkup: "\u68c0\u67e5",
  custom: "\u81ea\u5b9a\u4e49",
}

function roundToQuarter(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m
  const rounded = Math.floor(total / 15) * 15
  const rh = Math.floor(rounded / 60)
  const rm = rounded % 60
  return `${String(rh).padStart(2, "0")}:${String(rm).padStart(2, "0")}`
}

function timeToLocalDateTime(time: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}T${time}:00`
}

function extractTimeFromDateTime(dateTime: string | Record<string, number>): string {
  if (typeof dateTime === "string") {
    const match = dateTime.match(/(?:T|\s)(\d{2}:\d{2})/)
    if (match?.[1]) return match[1]
    if (/^\d{2}:\d{2}/.test(dateTime)) return dateTime.slice(0, 5)
    return "00:00"
  }

  const hour = dateTime.hour ?? dateTime.hours ?? dateTime.h ?? dateTime[3] ?? dateTime[0] ?? 0
  const minute = dateTime.minute ?? dateTime.minutes ?? dateTime.m ?? dateTime[4] ?? dateTime[1] ?? 0
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function hasOverlap(newBlock: Pick<ScheduleBlock, "startTime" | "endTime">, existing: ScheduleBlock[]) {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const newStart = toMinutes(newBlock.startTime)
  const newEnd = toMinutes(newBlock.endTime)

  return existing.some((block) => {
    const blockStart = toMinutes(block.startTime)
    const blockEnd = toMinutes(block.endTime)
    return newStart < blockEnd && newEnd > blockStart
  })
}

export function AddBlockDialog({
  open,
  onOpenChange,
  defaultTime,
  onAdd,
  existingSchedule,
}: AddBlockDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<BlockCategory>("custom")
  const [startTime, setStartTime] = useState(defaultTime)
  const [endTime, setEndTime] = useState("")
  const [details, setDetails] = useState("")
  const [feedback, setFeedback] = useState<AiFeedback | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStartTime(defaultTime)
    const [h, m] = defaultTime.split(":").map(Number)
    const totalMinutes = h * 60 + m + 30
    const rounded = Math.round(totalMinutes / 15) * 15
    const endHour = Math.floor(rounded / 60)
    const endMinute = rounded % 60
    setEndTime(`${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`)
  }, [defaultTime])

  useEffect(() => {
    if (!title.trim()) {
      setFeedback(null)
      return
    }

    setEvaluating(true)
    const timer = setTimeout(() => {
      setFeedback(generateAiFeedback(title, category, startTime))
      setEvaluating(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [title, category, startTime])

  const resetForm = () => {
    setTitle("")
    setCategory("custom")
    setDetails("")
    setFeedback(null)
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number)
      return h * 60 + m
    }

    if (toMinutes(startTime) % 15 !== 0 || toMinutes(endTime) % 15 !== 0) {
      setError("\u65f6\u95f4\u5fc5\u987b\u662f 15 \u5206\u949f\u7684\u500d\u6570")
      return
    }

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      setError("\u7ed3\u675f\u65f6\u95f4\u5fc5\u987b\u665a\u4e8e\u5f00\u59cb\u65f6\u95f4")
      return
    }

    if (hasOverlap({ startTime, endTime }, existingSchedule)) {
      setError("\u65f6\u95f4\u6bb5\u4e0e\u73b0\u6709\u65e5\u7a0b\u51b2\u7a81\uff0c\u8bf7\u9009\u62e9\u5176\u4ed6\u65f6\u95f4")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const payload = {
        startTime: timeToLocalDateTime(startTime),
        endTime: timeToLocalDateTime(endTime),
        title: title.trim(),
        scheduleType: categoryTypeMap[category],
        details: details
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }

      const response = await apiFetch("/health-plan/schedules/add", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        try {
          const errorData = await response.json()
          setError(errorData.message || "\u6dfb\u52a0\u65e5\u7a0b\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5")
        } catch {
          setError("\u6dfb\u52a0\u65e5\u7a0b\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5")
        }
        return
      }

      const result = await response.json()
      const vo = result.data

      const block: ScheduleBlock = {
        id: String(vo.id),
        startTime: extractTimeFromDateTime(vo.start_time || vo.startTime),
        endTime: extractTimeFromDateTime(vo.end_time || vo.endTime),
        title: vo.title || title.trim(),
        category,
        details: Array.isArray(vo.details) ? vo.details : payload.details,
        aiGenerated: false,
      }

      onAdd(block)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to add schedule:", err)
      setError(err instanceof Error ? err.message : "\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const FeedbackIcon = feedback ? feedbackIcons[feedback.type] : null
  const feedbackStyle = feedback ? feedbackStyles[feedback.type] : null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/5 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {"\u6dfb\u52a0\u81ea\u5b9a\u4e49\u5b89\u6392"}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {"AI \u4f1a\u5b9e\u65f6\u8bc4\u4f30\u5f53\u524d\u5b89\u6392\u662f\u5426\u5408\u7406"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {"\u5b89\u6392\u540d\u79f0"}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={"\u4f8b\u5982\uff1a\u665a\u95f4\u6563\u6b65"}
                className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {"\u7c7b\u578b"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(categoryMeta) as BlockCategory[]).map((cat) => {
                  const meta = categoryMeta[cat]
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                        category === cat
                          ? cn("border-transparent", meta.bgLight, meta.textColor)
                          : "border-border/60 text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full", meta.bgDot)} />
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {"\u5f00\u59cb\u65f6\u95f4"}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(roundToQuarter(e.target.value))}
                  step="900"
                  className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {"\u7ed3\u675f\u65f6\u95f4"}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(roundToQuarter(e.target.value))}
                  step="900"
                  className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {"\u8be6\u7ec6\u5185\u5bb9\uff08\u6bcf\u884c\u4e00\u9879\uff09"}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={"\u4f8b\u5982\uff1a\n\u516c\u56ed\u6162\u8d70 20 \u5206\u949f\n\u6ce8\u610f\u8865\u6c34"}
                rows={3}
                className="w-full resize-none rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {error && <div className="text-xs text-red-500">{error}</div>}

            {evaluating && title.trim() && (
              <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">{"AI \u6b63\u5728\u8bc4\u4f30..."}</span>
              </div>
            )}

            {!evaluating && feedback && feedbackStyle && FeedbackIcon && (
              <div className={cn("rounded-xl border px-4 py-3", feedbackStyle.border, feedbackStyle.bg)}>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <FeedbackIcon className={cn("h-4 w-4", feedbackStyle.icon)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Sparkles className={cn("h-3 w-3", feedbackStyle.icon)} />
                      <span className={cn("text-xs font-semibold", feedbackStyle.title)}>
                        {feedbackLabels[feedback.type]}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{feedback.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {"\u53d6\u6d88"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground transition-all",
                title.trim() && !submitting
                  ? "btn-bubble"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "\u6dfb\u52a0\u4e2d..." : "\u6dfb\u52a0\u5230\u65e5\u7a0b"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
