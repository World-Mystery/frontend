"use client"

import { useState, useEffect } from "react"
import {
  X,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
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
  startTime: string,
): AiFeedback | null {
  if (!title.trim()) return null

  const hour = parseInt(startTime.split(":")[0], 10)

  // Late night exercise warning
  if (category === "exercise" && hour >= 21) {
    return {
      type: "warning",
      message:
        "您近期的健康档案显示有失眠倾向，睡前剧烈运动可能影响睡眠质量。建议将此安排改为 15 分钟的助眠拉伸，或调整到下午时段。",
    }
  }

  // Late night eating
  if (category === "meal" && hour >= 21) {
    return {
      type: "warning",
      message:
        "晚间进食不利于消化和血糖控制。如确需进食，建议选择低热量、易消化的食物，如温牛奶或少量坚果。",
    }
  }

  // Early morning intense exercise
  if (category === "exercise" && hour < 7) {
    return {
      type: "suggestion",
      message:
        "清晨空腹运动可能引起低血糖，建议先饮用温水、简单进食后再开始运动，或将运动调整到早餐后。",
    }
  }

  // Medication timing
  if (category === "medication" && (hour >= 22 || hour <= 5)) {
    return {
      type: "suggestion",
      message:
        "夜间用药请确认是否符合医嘱。部分降压药在清晨服用效果更佳，建议咨询医生后确定时间。",
    }
  }

  // General positive feedback
  if (category === "rest" && hour >= 13 && hour <= 14) {
    return {
      type: "positive",
      message: "午间适当休息有助于降低血压、恢复精力，非常好的安排！",
    }
  }

  if (category === "exercise" && hour >= 9 && hour <= 11) {
    return {
      type: "positive",
      message: "上午 9-11 点是运动的黄金时段，此时身体机能较好，非常适合中等强度运动。",
    }
  }

  return {
    type: "positive",
    message: "这个安排看起来不错，已纳入今日计划。",
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
  warning: "健康提醒",
  suggestion: "AI 建议",
  positive: "AI 评估",
}

export function AddBlockDialog({
  open,
  onOpenChange,
  defaultTime,
  onAdd,
}: AddBlockDialogProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<BlockCategory>("custom")
  const [startTime, setStartTime] = useState(defaultTime)
  const [endTime, setEndTime] = useState("")
  const [details, setDetails] = useState("")
  const [feedback, setFeedback] = useState<AiFeedback | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  useEffect(() => {
    setStartTime(defaultTime)
    // Auto-set end time 30 min after start
    const [h, m] = defaultTime.split(":").map(Number)
    const totalMin = h * 60 + m + 30
    const eh = Math.floor(totalMin / 60)
    const em = totalMin % 60
    setEndTime(`${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`)
  }, [defaultTime])

  // AI evaluation with debounce
  useEffect(() => {
    if (!title.trim()) {
      setFeedback(null)
      return
    }
    setEvaluating(true)
    const timer = setTimeout(() => {
      const fb = generateAiFeedback(title, category, startTime)
      setFeedback(fb)
      setEvaluating(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [title, category, startTime])

  const handleSubmit = () => {
    if (!title.trim()) return
    const block: ScheduleBlock = {
      id: `custom-${Date.now()}`,
      startTime,
      endTime: endTime || startTime,
      title: title.trim(),
      category,
      details: details
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      aiGenerated: false,
    }
    onAdd(block)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTitle("")
    setCategory("custom")
    setDetails("")
    setFeedback(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  if (!open) return null

  const FeedbackIcon = feedback ? feedbackIcons[feedback.type] : null
  const fbStyle = feedback ? feedbackStyles[feedback.type] : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/5 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">添加自定义安排</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">AI 将实时评估您的安排</p>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 px-5 py-4">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                安排名称
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 晚间跑步"
                className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                类型
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(categoryMeta) as BlockCategory[]).map((cat) => {
                  const meta = categoryMeta[cat]
                  return (
                    <button
                      key={cat}
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

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  开始时间
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  结束时间
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {"详细内容（每行一条）"}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={"例如:\n公园慢跑\n注意补水"}
                rows={3}
                className="w-full resize-none rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* AI Feedback */}
            {evaluating && title.trim() && (
              <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">AI 正在评估...</span>
              </div>
            )}
            {!evaluating && feedback && fbStyle && FeedbackIcon && (
              <div className={cn("rounded-xl border px-4 py-3", fbStyle.border, fbStyle.bg)}>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <FeedbackIcon className={cn("h-4 w-4", fbStyle.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className={cn("h-3 w-3", fbStyle.icon)} />
                      <span className={cn("text-xs font-semibold", fbStyle.title)}>
                        {feedbackLabels[feedback.type]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{feedback.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3">
            <button
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground transition-all",
                title.trim()
                  ? "bg-primary hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              添加到日程
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
