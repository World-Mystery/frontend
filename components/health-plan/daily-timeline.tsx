"use client"

import { useRef } from "react"
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
  deletingId?: string | null
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

const PIXELS_PER_MINUTE = 2.5
const TIMELINE_START_HOUR = 6
const TIMELINE_END_HOUR = 23

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m - TIMELINE_START_HOUR * 60
}

function minutesToTime(minutes: number): string {
  const totalMinutes = minutes + TIMELINE_START_HOUR * 60
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

interface PositionedScheduleBlock extends ScheduleBlock {
  startMin: number
  endMin: number
  col: number
  totalCols: number
}

interface ScheduleBlockCardProps {
  block: ScheduleBlock
  isRefreshing: boolean
  isDeleting: boolean
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
  isDeleting,
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
  const isShortBlock = height < 40
  const showDetails = isExpanded || (!isShortBlock && block.details.length > 0)
  const displayHeight = isExpanded ? height * 2 : height
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
        handleClickCard?.()
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
        <div className={cn("w-1 shrink-0 rounded-l-xl", meta.color)} />

        <div className={cn("flex min-w-0 flex-1 flex-col px-3", isShortBlock ? "py-1.5" : "py-2")}>
          <div className="flex min-w-0 items-center gap-1.5">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md",
                isShortBlock ? "h-5 w-5" : "h-6 w-6",
                meta.bgLight
              )}
            >
              <Icon className={cn("h-3 w-3", meta.textColor)} />
            </div>
            <h3
              className={cn(
                "flex-1 truncate font-semibold text-foreground",
                isShortBlock ? "text-xs" : "text-sm"
              )}
            >
              {block.title}
            </h3>
            {block.aiGenerated && (!isShortBlock || isExpanded) && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-primary/[0.07] px-1 py-0.5 text-[9px] font-medium text-primary">
                <Sparkles className="h-2 w-2" />
              </span>
            )}
          </div>

          {(!isShortBlock || isExpanded) && (
            <>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {block.startTime} - {block.endTime}
              </p>

              {showDetails && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {(isExpanded ? block.details : block.details.slice(0, 2)).map((detail, index) => (
                    <span
                      key={`${block.id}-${index}`}
                      className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0 text-[9px] font-medium",
                        !isExpanded && "truncate",
                        meta.bgLight,
                        meta.textColor
                      )}
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRefresh()
            }}
            disabled={isRefreshing || isDeleting}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            title={"\u91cd\u65b0\u751f\u6210"}
          >
            <RefreshCw className={cn("h-3 w-3 text-primary", isRefreshing && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isDeleting}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            title={"\u5220\u9664"}
          >
            <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

function computeLayout(blocks: ScheduleBlock[]): PositionedScheduleBlock[] {
  const items: PositionedScheduleBlock[] = blocks
    .map((block) => ({
      ...block,
      startMin: timeToMinutes(block.startTime),
      endMin: timeToMinutes(block.endTime),
      col: 0,
      totalCols: 1,
    }))
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  const groups: PositionedScheduleBlock[][] = []
  let currentGroup: PositionedScheduleBlock[] = []
  let currentMaxEnd = -1

  for (const item of items) {
    if (currentGroup.length === 0 || item.startMin < currentMaxEnd) {
      currentGroup.push(item)
      currentMaxEnd = Math.max(currentMaxEnd, item.endMin)
      continue
    }

    groups.push(currentGroup)
    currentGroup = [item]
    currentMaxEnd = item.endMin
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  groups.forEach((group) => {
    const columns: PositionedScheduleBlock[][] = []

    group.forEach((block) => {
      let placed = false

      for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
        const lastBlockInColumn = columns[columnIndex][columns[columnIndex].length - 1]
        if (block.startMin >= lastBlockInColumn.endMin) {
          columns[columnIndex].push(block)
          block.col = columnIndex
          placed = true
          break
        }
      }

      if (!placed) {
        block.col = columns.length
        columns.push([block])
      }
    })

    group.forEach((block) => {
      block.totalCols = columns.length
    })
  })

  return items
}

export function DailyTimeline({
  schedule,
  refreshingId,
  deletingId,
  onRefresh,
  onDelete,
  onClickTimeslot,
  onBlockClick,
  expandedBlockId,
}: DailyTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const positioned = computeLayout(schedule)

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top + timelineRef.current.scrollTop
    const minutesFromStart = Math.floor(y / PIXELS_PER_MINUTE)
    const roundedMinutes = Math.floor(minutesFromStart / 15) * 15

    onClickTimeslot(minutesToTime(roundedMinutes))
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col rounded-xl border border-border/60 bg-card">
      <div className="shrink-0 border-b border-border/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">{"AI \u52a8\u6001\u65e5\u7a0b"}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {"\u70b9\u51fb\u65f6\u95f4\u7ebf\u53ef\u5feb\u901f\u6dfb\u52a0\u81ea\u5b9a\u4e49\u5b89\u6392"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(["meal", "exercise", "rest", "medication"] as BlockCategory[]).map((category) => {
              const meta = categoryMeta[category]
              return (
                <div key={category} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", meta.bgDot)} />
                  <span className="text-[11px] text-muted-foreground">{meta.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative flex-1 overflow-y-auto px-4 py-0"
        onClick={handleTimelineClick}
      >
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 }).map((_, hourIndex) => {
            const hour = TIMELINE_START_HOUR + hourIndex

            return (
              <div key={hour} className="relative" style={{ height: `${60 * PIXELS_PER_MINUTE}px` }}>
                <div className="absolute left-0 right-0 border-t border-border/50" style={{ top: 0 }} />
                <div
                  className="absolute left-0 text-[11px] font-medium tabular-nums text-muted-foreground/60"
                  style={{ top: -6 }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div
                  className="absolute left-0 right-0 border-t border-border/20"
                  style={{ top: `${30 * PIXELS_PER_MINUTE}px` }}
                />
              </div>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-[70px] right-4 top-0">
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
                isDeleting={deletingId === block.id}
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
