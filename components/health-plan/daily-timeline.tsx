"use client"

import { useRef, useState } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryMeta, type ScheduleBlock, type BlockCategory } from "./types"

interface DailyTimelineProps {
  schedule: ScheduleBlock[]
  refreshingId: string | null
  onRefresh: (id: string) => void
  onDelete: (id: string) => void
  onClickTimeslot: (time: string) => void
  onBlockClick: (block: ScheduleBlock) => void
  expandedBlockId?: string | null
}

const categoryIcons: Record<BlockCategory, React.ElementType> = {
  meal: UtensilsCrossed,
  exercise: Dumbbell,
  rest: Moon,
  medication: Pill,
  checkup: Stethoscope,
  custom: SquarePen,
}

// Constants controlling vertical scale
const PIXELS_PER_MINUTE = 2.5 // pixels per minute; 15min block = 37.5px height
const TIMELINE_START_HOUR = 6 // timeline starts at 06:00
const TIMELINE_END_HOUR = 23 // timeline ends at 23:00
const TOTAL_MINUTES = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60 // 1020 minutes
const TIMELINE_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE // total height in pixels

// Convert time strings (HH:MM) to minutes from timeline start (06:00)
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m - TIMELINE_START_HOUR * 60
}

// Convert minutes from timeline start back to time string (HH:MM)
function minutesToTime(minutes: number): string {
  const totalMinutes = minutes + TIMELINE_START_HOUR * 60
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

interface ScheduleBlockCardProps {
  block: ScheduleBlock
  isRefreshing: boolean
  onRefresh: () => void
  onDelete: () => void
  onClick?: () => void
  left: string
  top: number
  height: number
  width: string
  isExpanded?: boolean
}

function ScheduleBlockCard({
  block,
  isRefreshing,
  onRefresh,
  onDelete,
  onClick,
  left,
  top,
  height,
  width,
  isExpanded,
}: ScheduleBlockCardProps) {
  const meta = categoryMeta[block.category]
  const Icon = categoryIcons[block.category]

  // For very short blocks (< 40px), show minimal content, but allow expansion
  const isShortBlock = height < 40
  const showDetails = isExpanded || (!isShortBlock && block.details.length > 0)
  const displayHeight = isExpanded ? height * 2 : height

  // Short blocks are always clickable (to expand)
  const handleClickCard = isShortBlock ? onClick : undefined

  return (
    <div
      style={{
        left,
        top: `${top}px`,
        height: `${displayHeight}px`,
        width,
      }}
      onClick={(e) => {
        e.stopPropagation()
        handleClickCard && handleClickCard()
      }}
      className={cn("group absolute", isShortBlock && "cursor-pointer", isExpanded && "z-50")}
    >
      <div
        className={cn(
          "relative flex h-full rounded-xl border bg-card transition-all hover:shadow-lg hover:shadow-black/10",
          "border-border/60 hover:border-border hover:z-20",
          isExpanded && "overflow-y-auto"
        )}
      >
        {/* Left color accent */}
        <div className={cn("w-1 shrink-0 rounded-l-xl", meta.color)} />

        <div className={cn(
          "flex flex-1 min-w-0 flex-col px-3",
          isShortBlock ? "py-1.5" : "py-2"
        )}>
          {/* Title row */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={cn(
              "shrink-0 flex items-center justify-center rounded-md",
              isShortBlock ? "h-5 w-5" : "h-6 w-6",
              meta.bgLight
            )}>
              <Icon className={cn("h-3 w-3", meta.textColor)} />
            </div>
            <h3 className={cn(
              "font-semibold text-foreground truncate flex-1",
              isShortBlock ? "text-xs" : "text-sm"
            )}>
              {block.title}
            </h3>
            {block.aiGenerated && (!isShortBlock || isExpanded) && (
              <span className="flex items-center gap-0.5 rounded-md bg-primary/[0.07] px-1 py-0.5 text-[9px] font-medium text-primary shrink-0">
                <Sparkles className="h-2 w-2" />
              </span>
            )}
          </div>

          {/* Time and details */}
          {(!isShortBlock || isExpanded) && (
            <>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {block.startTime} - {block.endTime}
              </p>

              {showDetails && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {isExpanded
                    ? block.details.map((d, i) => (
                        <span
                          key={i}
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0 text-[9px] font-medium",
                            meta.bgLight,
                            meta.textColor
                          )}
                        >
                          {d}
                        </span>
                      ))
                    : block.details.slice(0, 2).map((d, i) => (
                        <span
                          key={i}
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0 text-[9px] font-medium truncate",
                            meta.bgLight,
                            meta.textColor
                          )}
                        >
                          {d}
                        </span>
                      ))}
                  {!isExpanded && block.details.length > 2 && (
                    <span className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0 text-[9px] font-medium",
                      meta.bgLight,
                      meta.textColor
                    )}>
                      +{block.details.length - 2}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions - hover reveal */}
        <div className="flex shrink-0 items-center gap-1 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-primary/10"
            title="让 AI 换一个"
          >
            <RefreshCw
              className={cn(
                "h-3 w-3 text-primary",
                isRefreshing && "animate-spin"
              )}
            />
          </button>
          {!block.aiGenerated && (
            <button
              onClick={onDelete}
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-500/10"
              title="删除"
            >
              <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
            </button>
          )}
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
  onBlockClick,
  expandedBlockId,
}: DailyTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  // Compute horizontal layout for overlapping blocks
  function computeLayout(blocks: ScheduleBlock[]): (ScheduleBlock & {
    startMin: number
    endMin: number
    col: number
    totalCols: number
  })[] {
    const items = blocks.map((b) => {
      const startMin = timeToMinutes(b.startTime)
      const endMin = timeToMinutes(b.endTime)
      return {
        ...b,
        startMin,
        endMin,
        col: 0,
        totalCols: 1,
      }
    })

    items.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

    // Group overlapping blocks
    const groups: typeof items[] = []
    let currentGroup: typeof items = []
    let currentMaxEnd = -1

    for (const item of items) {
      if (currentGroup.length === 0 || item.startMin < currentMaxEnd) {
        currentGroup.push(item)
        currentMaxEnd = Math.max(currentMaxEnd, item.endMin)
      } else {
        groups.push(currentGroup)
        currentGroup = [item]
        currentMaxEnd = item.endMin
      }
    }
    if (currentGroup.length) groups.push(currentGroup)

    // Assign columns within each group
    groups.forEach((group) => {
      const cols: typeof group[] = []
      group.forEach((blk) => {
        let placed = false
        for (let ci = 0; ci < cols.length; ci++) {
          const last = cols[ci][cols[ci].length - 1]
          if (blk.startMin >= last.endMin) {
            cols[ci].push(blk)
            blk.col = ci
            placed = true
            break
          }
        }
        if (!placed) {
          blk.col = cols.length
          cols.push([blk])
        }
      })
      const total = cols.length
      group.forEach((blk) => {
        blk.totalCols = total
      })
    })

    return items
  }

  const positioned = computeLayout(schedule)

  // Handle click on timeline background to create new event
  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + timelineRef.current.scrollTop
    const minutesFromStart = Math.floor(y / PIXELS_PER_MINUTE)
    const roundedMinutes = Math.floor(minutesFromStart / 15) * 15
    const time = minutesToTime(roundedMinutes)

    onClickTimeslot(time)
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 bg-card min-h-[600px]">
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">AI 动态日程</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {"点击时间线添加自定义安排"}
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

      {/* Timeline body with absolute positioning */}
      <div
        ref={timelineRef}
        className="relative flex-1 overflow-y-auto px-4 py-0"
        onClick={handleTimelineClick}
      >
        {/* Background grid lines - using absolute positioning */}
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
          {Array.from({ length: (TIMELINE_END_HOUR - TIMELINE_START_HOUR) + 1 }).map(
            (_, hourIndex) => {
              const hour = TIMELINE_START_HOUR + hourIndex
              const top = hourIndex * 60 * PIXELS_PER_MINUTE

              return (
                <div key={hour} className="relative" style={{ height: `${60 * PIXELS_PER_MINUTE}px` }}>
                  {/* Hour line */}
                  <div
                    className="absolute left-0 right-0 border-t border-border/50"
                    style={{ top: 0 }}
                  />

                  {/* Hour label */}
                  <div
                    className="absolute left-0 text-[11px] font-medium tabular-nums text-muted-foreground/60"
                    style={{ top: -6 }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>

                  {/* 30-minute subdivision line */}
                  <div
                    className="absolute left-0 right-0 border-t border-border/20"
                    style={{ top: `${30 * PIXELS_PER_MINUTE}px` }}
                  />
                </div>
              )
            }
          )}
        </div>

        {/* Schedule blocks container with margin for time labels */}
        <div className="absolute left-[70px] right-4 top-0 bottom-0">
          {positioned.map((block) => {
            const top = block.startMin * PIXELS_PER_MINUTE
            const height = (block.endMin - block.startMin) * PIXELS_PER_MINUTE
            const leftPercent = (block.col / block.totalCols) * 100
            const widthPercent = 100 / block.totalCols

            return (
              <ScheduleBlockCard
                key={block.id}
                block={block}
                isRefreshing={refreshingId === block.id}
                onRefresh={() => onRefresh(block.id)}
                onDelete={() => onDelete(block.id)}
                onClick={() => onBlockClick(block)}
                left={`${leftPercent}%`}
                top={top}
                height={height}
                width={`${widthPercent}%`}
                isExpanded={expandedBlockId === block.id}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}