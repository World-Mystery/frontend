"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyTimeline } from "./daily-timeline"
import { PrinciplesPanel } from "./principles-panel"
import { AddBlockDialog } from "./add-block-dialog"
import { Button } from "@/components/ui/button"
import type { ScheduleBlock, BlockCategory } from "./types"
import { apiFetch } from "@/lib/api-client"

interface DailyScheduleVO {
  id: number
  start_time: string | { [key: string]: number } // Can be ISO string or LocalDateTime object
  end_time: string | { [key: string]: number }
  title: string
  schedule_type: string
  details: string[]
}

// Helper function to convert schedule_type to BlockCategory
function mapScheduleTypeToCategory(scheduleType: string): BlockCategory {
  const typeMap: Record<string, BlockCategory> = {
    "餐饮": "meal",
    "运动": "exercise",
    "休息": "rest",
    "用药": "medication",
    "检查": "checkup",
    "自定义": "custom",
  }
  return typeMap[scheduleType] || "custom"
}

// Helper function to extract HH:MM time from various formats
function extractTimeFromDateTime(dateTime: string | { [key: string]: number }): string {
  console.log("extractTimeFromDateTime input:", dateTime, typeof dateTime)

  if (typeof dateTime === "string") {
    // Handle ISO string like "2026-03-19T12:00:00"
    if (dateTime.includes("T")) {
      const result = dateTime.substring(11, 16) // Extract "HH:MM"
      console.log("Extracted from ISO string:", result)
      return result
    }
    // Handle already formatted time like "12:00"
    console.log("Returning as-is string:", dateTime)
    return dateTime
  }

  // Handle LocalDateTime object with hour and minute fields or array-like structure
  if (typeof dateTime === "object" && dateTime !== null) {
    console.log("Processing object:", dateTime)

    // Try standard LocalDateTime properties first
    let hour = (dateTime as any).hour ?? (dateTime as any)[0] ?? null
    let minute = (dateTime as any).minute ?? (dateTime as any)[1] ?? null

    // If still null, try other possible property names
    if (hour === null) {
      hour = (dateTime as any).h ?? (dateTime as any).hours ?? 0
    }
    if (minute === null) {
      minute = (dateTime as any).m ?? (dateTime as any).minutes ?? 0
    }

    hour = hour ?? 0
    minute = minute ?? 0

    const result = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    console.log("Constructed from object:", result)
    return result
  }

  console.warn("Could not extract time from:", dateTime)
  return "00:00"
}

// Helper function to convert DailyScheduleVO to ScheduleBlock
function convertToScheduleBlock(vo: DailyScheduleVO): ScheduleBlock {
  const startTime = extractTimeFromDateTime(vo.start_time)
  const endTime = extractTimeFromDateTime(vo.end_time)

  return {
    id: vo.id.toString(),
    startTime,
    endTime,
    title: vo.title,
    category: mapScheduleTypeToCategory(vo.schedule_type),
    details: vo.details || [],
    aiGenerated: true,
  }
}

export function HealthPlanView() {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogTime, setAddDialogTime] = useState("12:00")
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [regeneratingAll, setRegeneratingAll] = useState(false)

  // Load schedules from API on mount
  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      console.log("Loading schedules from API...")
      const response = await apiFetch("/health-plan/schedules/list")
      console.log("API response status:", response.status)

      if (!response.ok) {
        console.error("Failed to load schedules: HTTP", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response body:", errorText)
        return
      }

      const result = await response.json()
      console.log("Loaded schedules (raw):", result)
      console.log("Schedule data:", result.data)
      console.log("Schedule data type:", typeof result.data)
      console.log("Is array?", Array.isArray(result.data))

      if (!result.data) {
        console.warn("API returned no data")
        setSchedule([])
        return
      }

      if (!Array.isArray(result.data)) {
        console.error("API data is not an array:", result.data)
        setSchedule([])
        return
      }

      console.log(`Processing ${result.data.length} schedules...`)
      const schedules = result.data
        .map((vo: DailyScheduleVO, index: number) => {
          try {
            console.log(`Converting schedule ${index}:`, vo)
            const converted = convertToScheduleBlock(vo)
            console.log(`Converted schedule ${index}:`, converted)
            return converted
          } catch (e) {
            console.error("Failed to convert schedule block:", vo, e)
            return null
          }
        })
        .filter((block): block is ScheduleBlock => block !== null)

      console.log(`Successfully converted ${schedules.length} schedules`)
      setSchedule(schedules.sort((a, b) => a.startTime.localeCompare(b.startTime)))
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
        console.error("Failed to regenerate schedule: HTTP", response.status, response.statusText)
        return
      }

      const result = await response.json()
      console.log("Regenerated schedule:", result)

      if (!result.data) {
        console.warn("API returned no data for regenerated schedule")
        return
      }

      const updatedBlock = convertToScheduleBlock(result.data)
      setSchedule((prev) =>
        prev.map((b) => (b.id === id ? updatedBlock : b))
      )
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
        console.error("Failed to regenerate all schedules: HTTP", response.status, response.statusText)
        return
      }

      const result = await response.json()
      console.log("Regenerated all schedules:", result)

      if (!result.data) {
        console.warn("API returned no data for regenerated schedules")
        setSchedule([])
        return
      }

      if (!Array.isArray(result.data)) {
        console.error("API data is not an array:", result.data)
        setSchedule([])
        return
      }

      const schedules = result.data
        .map((vo: DailyScheduleVO) => {
          try {
            return convertToScheduleBlock(vo)
          } catch (e) {
            console.error("Failed to convert schedule block:", vo, e)
            return null
          }
        })
        .filter((block): block is ScheduleBlock => block !== null)

      setSchedule(schedules.sort((a, b) => a.startTime.localeCompare(b.startTime)))
    } catch (error) {
      console.error("Failed to regenerate all schedules:", error)
    } finally {
      setRegeneratingAll(false)
    }
  }

  const handleDeleteBlock = (id: string) => {
    setSchedule((prev) => prev.filter((b) => b.id !== id))
  }

  const handleAddBlock = (block: ScheduleBlock) => {
    setSchedule((prev) => [...prev, block].sort((a, b) => a.startTime.localeCompare(b.startTime)))
  }

  const handleClickTimeslot = (time: string) => {
    setAddDialogTime(time)
    setAddDialogOpen(true)
  }

  const handleBlockClick = (block: ScheduleBlock) => {
    // Toggle expand/collapse for short blocks
    const duration = timeStringToMinutes(block.endTime) - timeStringToMinutes(block.startTime)
    if (duration === 15) {
      setExpandedBlockId(expandedBlockId === block.id ? null : block.id)
    }
  }

  // Helper function to parse time string "HH:MM" to minutes
  function timeStringToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{"妈妈"}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{"健康计划"}</span>
          </div>
        </div>

        {/* AI Generated Hint + Refresh All Button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3 flex-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.1]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {"已根据该成员的健康档案智能生成今日计划"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {"每个区块均支持一键换方案"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRegenerateAll}
            disabled={regeneratingAll}
            className="shrink-0"
            title="更新全部日程"
          >
            <RefreshCw className={cn("h-4 w-4", regeneratingAll && "animate-spin")} />
          </Button>
        </div>

        {/* Main Content: Timeline + Principles Sidebar */}
        <div className="flex gap-6 h-full">
          {/* Left: Daily Timeline */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <DailyTimeline
                schedule={schedule}
                refreshingId={refreshingId}
                onRefresh={handleRefreshBlock}
                onDelete={handleDeleteBlock}
                onClickTimeslot={handleClickTimeslot}
                onBlockClick={handleBlockClick}
                expandedBlockId={expandedBlockId}
              />
            )}
          </div>

          {/* Right: Principles Sidebar */}
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
