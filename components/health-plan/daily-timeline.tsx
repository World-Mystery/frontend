"use client"

import {
  RefreshCw,
  Trash2,
  UtensilsCrossed,
  Dumbbell,
  Moon,
  Pill,
  Stethoscope,
  SquarePen,
  Sparkles,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryMeta, type ScheduleBlock, type BlockCategory } from "./types"

interface DailyTimelineProps {
  schedule: ScheduleBlock[]
  refreshingId: string | null
  onRefresh: (id: string) => void
  onDelete: (id: string) => void
  onClickTimeslot: (time: string) => void
}

const categoryIcons: Record<BlockCategory, React.ElementType> = {
  meal: UtensilsCrossed,
  exercise: Dumbbell,
  rest: Moon,
  medication: Pill,
  checkup: Stethoscope,
  custom: SquarePen,
}

// Generate time slots from 06:00 to 22:00
const timeSlots: string[] = []
for (let h = 6; h <= 22; h++) {
  timeSlots.push(`${String(h).padStart(2, "0")}:00`)
}

function getBlockPosition(startTime: string): number {
  const [h, m] = startTime.split(":").map(Number)
  return (h - 6) * 80 + (m / 60) * 80 // 80px per hour
}

function getBlockHeight(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  return Math.max(((endMin - startMin) / 60) * 80, 56) // min 56px
}

function ScheduleBlockCard({
  block,
  isRefreshing,
  onRefresh,
  onDelete,
}: {
  block: ScheduleBlock
  isRefreshing: boolean
  onRefresh: () => void
  onDelete: () => void
}) {
  const meta = categoryMeta[block.category]
  const Icon = categoryIcons[block.category]
  const top = getBlockPosition(block.startTime)
  const height = getBlockHeight(block.startTime, block.endTime)

  return (
    <div
      className="group absolute left-0 right-0 z-10"
      style={{ top: `${top}px`, minHeight: `${height}px` }}
    >
      <div
        className={cn(
          "relative ml-[72px] mr-2 flex overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md",
          "border-border/60 hover:border-border"
        )}
      >
        {/* Left color accent */}
        <div className={cn("w-1 shrink-0 rounded-l-xl", meta.color)} />

        <div className="flex flex-1 items-start gap-3 px-4 py-3">
          {/* Icon */}
          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.bgLight)}>
            <Icon className={cn("h-4 w-4", meta.textColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{block.title}</h3>
              {block.aiGenerated && (
                <span className="flex items-center gap-0.5 rounded-md bg-primary/[0.07] px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {block.startTime} - {block.endTime}
            </p>
            {/* Detail chips */}
            {block.details.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {block.details.map((d, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                      meta.bgLight, meta.textColor
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions - hover reveal */}
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {(block.category === "meal" || block.category === "exercise") && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
                title="让 AI 换一个"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5 text-primary",
                    isRefreshing && "animate-spin"
                  )}
                />
              </button>
            )}
            {!block.aiGenerated && (
              <button
                onClick={onDelete}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                title="删除"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyTimeline({
  schedule,
  refreshingId,
  onRefresh,
  onDelete,
  onClickTimeslot,
}: DailyTimelineProps) {
  // Check if a given timeslot already has a block starting within that hour
  const isSlotOccupied = (slotTime: string) => {
    const [sh] = slotTime.split(":").map(Number)
    return schedule.some((b) => {
      const [bh] = b.startTime.split(":").map(Number)
      return bh === sh
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">AI 动态日程</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {"点击空白时段添加自定义安排"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(["meal", "exercise", "rest", "medication"] as BlockCategory[]).map((cat) => {
              const m = categoryMeta[cat]
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", m.bgDot)} />
                  <span className="text-[11px] text-muted-foreground">{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline body */}
      <div className="relative overflow-y-auto px-4 py-2" style={{ height: "calc(17 * 80px)" }}>
        {/* Time grid lines */}
        {timeSlots.map((slot, i) => {
          const top = i * 80
          const occupied = isSlotOccupied(slot)
          return (
            <div
              key={slot}
              className="absolute left-0 right-0"
              style={{ top: `${top}px` }}
            >
              {/* Time label */}
              <div className="absolute left-4 top-0 flex h-6 items-center">
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground/70">
                  {slot}
                </span>
              </div>
              {/* Grid line */}
              <div className="absolute left-[72px] right-4 top-0 h-px bg-border/30" />
              {/* Clickable empty zone */}
              {!occupied && (
                <button
                  onClick={() => onClickTimeslot(slot)}
                  className="absolute left-[72px] right-4 top-0 z-0 flex h-[80px] items-center justify-center rounded-lg opacity-0 transition-all hover:bg-accent/40 hover:opacity-100"
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" />
                    <span>添加安排</span>
                  </div>
                </button>
              )}
            </div>
          )
        })}

        {/* Schedule blocks */}
        {schedule.map((block) => (
          <ScheduleBlockCard
            key={block.id}
            block={block}
            isRefreshing={refreshingId === block.id}
            onRefresh={() => onRefresh(block.id)}
            onDelete={() => onDelete(block.id)}
          />
        ))}
      </div>
    </div>
  )
}
