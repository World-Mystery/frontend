"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Sparkles, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyTimeline } from "./daily-timeline"
import { PrinciplesPanel } from "./principles-panel"
import { AddBlockDialog } from "./add-block-dialog"
import { Button } from "@/components/ui/button"
import type { ScheduleBlock, BlockCategory } from "./types"
import { apiFetch } from "@/lib/api-client"

interface DailyScheduleVO {
  id: number
  start_time?: string | Record<string, number> | number[] | null
  end_time?: string | Record<string, number> | number[] | null
  startTime?: string | Record<string, number> | number[] | null
  endTime?: string | Record<string, number> | number[] | null
  title?: string | null
  schedule_type?: string | null
  scheduleType?: string | null
  details?: string[] | string | null
}

const scheduleTypeMap: Record<string, BlockCategory> = {
  "\u65e9\u9910": "meal",
  "\u5348\u9910": "meal",
  "\u665a\u9910": "meal",
  "\u7528\u9910": "meal",
  "\u996e\u98df": "meal",
  "\u8fd0\u52a8": "exercise",
  "\u953b\u70bc": "exercise",
  "\u5065\u8eab": "exercise",
  "\u4f11\u606f": "rest",
  "\u7761\u7720": "rest",
  "\u7528\u836f": "medication",
  "\u670d\u836f": "medication",
  "\u68c0\u67e5": "checkup",
  "\u590d\u67e5": "checkup",
  "\u81ea\u5b9a\u4e49": "custom",
}

const generatedTitleMap: Record<BlockCategory, string[]> = {
  meal: [
    "\u65e9\u9910",
    "\u5348\u9910",
    "\u665a\u9910",
    "\u52a0\u9910",
  ],
  exercise: [
    "\u8fd0\u52a8",
    "\u953b\u70bc",
    "\u5065\u8eab",
    "\u6237\u5916\u6d3b\u52a8",
  ],
  rest: [
    "\u4f11\u606f",
    "\u653e\u677e",
    "\u5348\u4f11",
    "\u7761\u7720",
  ],
  medication: [
    "\u7528\u836f",
    "\u670d\u836f",
    "\u836f\u7269\u63d0\u9192",
  ],
  checkup: [
    "\u68c0\u67e5",
    "\u590d\u67e5",
    "\u76d1\u6d4b",
  ],
  custom: ["\u65e5\u7a0b"],
}

function mapScheduleTypeToCategory(scheduleType?: string | null): BlockCategory {
  if (!scheduleType) return "custom"

  const normalized = scheduleType.trim()
  if (scheduleTypeMap[normalized]) {
    return scheduleTypeMap[normalized]
  }

  if (normalized.includes("\u9910") || normalized.includes("\u98df")) return "meal"
  if (normalized.includes("\u8fd0") || normalized.includes("\u953b")) return "exercise"
  if (normalized.includes("\u4f11") || normalized.includes("\u7761")) return "rest"
  if (normalized.includes("\u836f")) return "medication"
  if (normalized.includes("\u67e5") || normalized.includes("\u68c0")) return "checkup"

  return "custom"
}

function extractTimeFromDateTime(dateTime: DailyScheduleVO["start_time"]): string {
  if (!dateTime) {
    return "08:00"
  }

  if (typeof dateTime === "string") {
    const isoMatch = dateTime.match(/(?:T|\s)(\d{2}:\d{2})/)
    if (isoMatch?.[1]) {
      return isoMatch[1]
    }

    if (/^\d{2}:\d{2}/.test(dateTime)) {
      return dateTime.slice(0, 5)
    }

    return "08:00"
  }

  if (Array.isArray(dateTime)) {
    const hour = dateTime.length >= 4 ? dateTime[3] : dateTime[0]
    const minute = dateTime.length >= 5 ? dateTime[4] : dateTime[1]
    return `${String(hour ?? 0).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}`
  }

  if (typeof dateTime === "object") {
    const hour = dateTime.hour ?? dateTime.hours ?? dateTime.h ?? dateTime[3] ?? dateTime[0] ?? 0
    const minute = dateTime.minute ?? dateTime.minutes ?? dateTime.m ?? dateTime[4] ?? dateTime[1] ?? 0
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
  }

  return "08:00"
}

function inferCategoryFromTime(startTime: string): BlockCategory {
  const hour = Number(startTime.split(":")[0])

  if (hour >= 8 && hour < 10) return "meal"
  if (hour >= 12 && hour < 14) return "meal"
  if (hour >= 18 && hour < 20) return "meal"
  if ((hour >= 6 && hour < 8) || (hour >= 10 && hour < 12) || (hour >= 16 && hour < 18)) return "exercise"
  if ((hour >= 14 && hour < 16) || hour >= 20 || hour < 6) return "rest"

  return "custom"
}

function generateTitleFromTimeAndCategory(startTime: string, category: BlockCategory): string {
  const hour = Number(startTime.split(":")[0])

  if (category === "meal") {
    if (hour >= 6 && hour < 10) return "\u65e9\u9910"
    if (hour >= 10 && hour < 12) return "\u4e0a\u5348\u52a0\u9910"
    if (hour >= 12 && hour < 14) return "\u5348\u9910"
    if (hour >= 14 && hour < 17) return "\u4e0b\u5348\u52a0\u9910"
    if (hour >= 17 && hour < 22) return "\u665a\u9910"
  }

  if (category === "rest") {
    if (hour >= 12 && hour < 14) return "\u5348\u4f11"
    if (hour >= 22 || hour < 6) return "\u7761\u7720"
  }

  return generatedTitleMap[category][0]
}

function normalizeDetails(details: DailyScheduleVO["details"]): string[] {
  if (!details) return []
  if (Array.isArray(details)) return details.filter(Boolean)

  try {
    const parsed = JSON.parse(details)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return details.trim() ? [details.trim()] : []
  }
}

function convertToScheduleBlock(vo: DailyScheduleVO): ScheduleBlock {
  const startTime = extractTimeFromDateTime(vo.start_time ?? vo.startTime)
  const endTime = extractTimeFromDateTime(vo.end_time ?? vo.endTime)
  let category = mapScheduleTypeToCategory(vo.schedule_type ?? vo.scheduleType)

  if (category === "custom") {
    category = inferCategoryFromTime(startTime)
  }

  const title =
    typeof vo.title === "string" && vo.title.trim()
      ? vo.title.trim()
      : generateTitleFromTimeAndCategory(startTime, category)

  return {
    id: String(vo.id),
    startTime,
    endTime,
    title,
    category,
    details: normalizeDetails(vo.details),
    aiGenerated: true,
  }
}

function sortSchedule(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

interface HealthPlanViewProps {
  currentMemberName: string
}

export function HealthPlanView({ currentMemberName }: HealthPlanViewProps) {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogTime, setAddDialogTime] = useState("12:00")
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [regeneratingAll, setRegeneratingAll] = useState(false)

  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        const { ensureActiveMemberId } = await import("@/lib/member")
        const memberId = await ensureActiveMemberId()

        if (!memberId) {
          setSchedule([])
          setLoading(false)
          return
        }

        await loadSchedules()
      } catch (error) {
        console.error("Failed to initialize health plan view:", error)
        setSchedule([])
        setLoading(false)
      }
    }

    initializeAndLoad()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const response = await apiFetch("/health-plan/schedules/list")

      if (!response.ok) {
        console.error("Failed to load schedules:", response.status, response.statusText)
        setSchedule([])
        return
      }

      const result = await response.json()
      const data = Array.isArray(result.data) ? result.data : []
      const nextSchedule = data
        .map((vo: DailyScheduleVO) => {
          try {
            return convertToScheduleBlock(vo)
          } catch (error) {
            console.error("Failed to convert schedule block:", vo, error)
            return null
          }
        })
        .filter((block: ScheduleBlock | null): block is ScheduleBlock => block !== null)

      setSchedule(sortSchedule(nextSchedule))
    } catch (error) {
      console.error("Failed to load schedules:", error)
      setSchedule([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshBlock = async (id: string) => {
    setRefreshingId(id)
    try {
      const response = await apiFetch(`/health-plan/schedules/${id}/regenerate`, {
        method: "PUT",
      })

      if (!response.ok) {
        console.error("Failed to regenerate schedule:", response.status, response.statusText)
        return
      }

      const result = await response.json()
      if (!result.data) {
        return
      }

      const updatedBlock = convertToScheduleBlock(result.data as DailyScheduleVO)
      setSchedule((prev) => sortSchedule(prev.map((block) => (block.id === id ? updatedBlock : block))))
    } catch (error) {
      console.error("Failed to regenerate schedule:", error)
    } finally {
      setRefreshingId(null)
    }
  }

  const handleRegenerateAll = async () => {
    setRegeneratingAll(true)
    try {
      const response = await apiFetch("/health-plan/schedules/generate-all", {
        method: "POST",
      })

      if (!response.ok) {
        console.error("Failed to regenerate all schedules:", response.status, response.statusText)
        return
      }

      const result = await response.json()
      const data = Array.isArray(result.data) ? result.data : []
      const nextSchedule = data
        .map((vo: DailyScheduleVO) => {
          try {
            return convertToScheduleBlock(vo)
          } catch (error) {
            console.error("Failed to convert schedule block:", vo, error)
            return null
          }
        })
        .filter((block: ScheduleBlock | null): block is ScheduleBlock => block !== null)

      setSchedule(sortSchedule(nextSchedule))
    } catch (error) {
      console.error("Failed to regenerate all schedules:", error)
    } finally {
      setRegeneratingAll(false)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await apiFetch(`/health-plan/schedules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        console.error("Failed to delete schedule:", response.status, response.statusText)
        return
      }

      setSchedule((prev) => prev.filter((block) => block.id !== id))
      setExpandedBlockId((prev) => (prev === id ? null : prev))
    } catch (error) {
      console.error("Failed to delete schedule:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddBlock = (block: ScheduleBlock) => {
    setSchedule((prev) => sortSchedule([...prev, block]))
  }

  const handleClickTimeslot = (time: string) => {
    setAddDialogTime(time)
    setAddDialogOpen(true)
  }

  const handleBlockClick = (block: ScheduleBlock) => {
    const duration = timeStringToMinutes(block.endTime) - timeStringToMinutes(block.startTime)
    if (duration === 15) {
      setExpandedBlockId((prev) => (prev === block.id ? null : block.id))
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{currentMemberName}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{"\u5065\u5eb7\u8ba1\u5212"}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.1]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                {"\u5df2\u6839\u636e\u8be5\u6210\u5458\u7684\u5065\u5eb7\u6863\u6848\u667a\u80fd\u751f\u6210\u4eca\u65e5\u8ba1\u5212"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {"\u6bcf\u4e2a\u65f6\u95f4\u5757\u90fd\u652f\u6301\u91cd\u751f\u6210\u548c\u4e00\u952e\u5220\u9664"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRegenerateAll}
            disabled={regeneratingAll}
            className="shrink-0"
            title={"\u66f4\u65b0\u5168\u90e8\u65e5\u7a0b"}
          >
            <RefreshCw className={cn("h-4 w-4", regeneratingAll && "animate-spin")} />
          </Button>
        </div>

        <div className="flex h-full gap-6">
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{"\u52a0\u8f7d\u4e2d..."}</p>
              </div>
            ) : (
              <DailyTimeline
                schedule={schedule}
                refreshingId={refreshingId}
                deletingId={deletingId}
                onRefresh={handleRefreshBlock}
                onDelete={handleDeleteBlock}
                onClickTimeslot={handleClickTimeslot}
                onBlockClick={handleBlockClick}
                expandedBlockId={expandedBlockId}
              />
            )}
          </div>

          <div className="hidden w-80 shrink-0 lg:block">
            <PrinciplesPanel />
          </div>
        </div>
      </div>

      <AddBlockDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        defaultTime={addDialogTime}
        onAdd={handleAddBlock}
        existingSchedule={schedule}
      />
    </div>
  )
}
