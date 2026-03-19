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
  title?: string // Optional, may be null from database
  schedule_type?: string // Optional, may be null from database
  details?: string[]
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
function extractTimeFromDateTime(dateTime: any): string {
  // Handle undefined or null
  if (!dateTime) {
    return "08:00"
  }

  console.log("extractTimeFromDateTime input:", dateTime, "type:", typeof dateTime)

  // Handle string input
  if (typeof dateTime === "string") {
    // Handle ISO string like "2026-03-19T12:00:00" or "2026-03-19T12:00:00.000Z"
    if (dateTime.includes("T")) {
      try {
        const timePart = dateTime.substring(11, 16) // Extract "HH:MM"
        console.log("Extracted from ISO string with T:", timePart)
        return timePart
      } catch (e) {
        console.warn("Failed to extract from ISO string:", dateTime, e)
      }
    }

    // Handle database format like "2026-03-19 12:00:00"
    if (dateTime.includes(" ") && /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateTime)) {
      try {
        const timePart = dateTime.substring(11, 16) // Extract "HH:MM" after space
        console.log("Extracted from database format:", timePart)
        return timePart
      } catch (e) {
        console.warn("Failed to extract from database format:", dateTime, e)
      }
    }

    // Handle already formatted time like "12:00"
    if (/^\d{2}:\d{2}/.test(dateTime)) {
      console.log("Using string time directly:", dateTime)
      return dateTime.substring(0, 5)
    }
    console.warn("Unknown string format:", dateTime)
    return "08:00"
  }

  // Handle number input (timestamp)
  if (typeof dateTime === "number") {
    const date = new Date(dateTime)
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // Handle LocalDateTime object with hour and minute fields or array-like structure
  if (typeof dateTime === "object" && dateTime !== null) {
    console.log("Processing object:", dateTime)

    // If it's an array like [year, month, day, hour, minute, second]
    if (Array.isArray(dateTime)) {
      const hourFromArray = dateTime.length >= 4 ? dateTime[3] : dateTime[0]
      const minuteFromArray = dateTime.length >= 5 ? dateTime[4] : dateTime[1]
      const resultFromArray = `${String(hourFromArray ?? 0).padStart(2, "0")}:${String(minuteFromArray ?? 0).padStart(2, "0")}`
      console.log("Constructed from array:", resultFromArray, "hour:", hourFromArray, "minute:", minuteFromArray)
      return resultFromArray
    }

    // Try standard LocalDateTime properties first
    let hour = dateTime.hour
    let minute = dateTime.minute

    // If not found, try array-like access
    if (hour === undefined) {
      hour = dateTime[0]
    }
    if (minute === undefined) {
      minute = dateTime[1]
    }

    // If still not found, try alternative property names
    if (hour === undefined) {
      hour = dateTime.h ?? dateTime.hours
    }
    if (minute === undefined) {
      minute = dateTime.m ?? dateTime.minutes
    }

    // Default to 0 if still not found
    hour = hour ?? 0
    minute = minute ?? 0

    const result = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    console.log("Constructed from object:", result, "hour:", hour, "minute:", minute)
    return result
  }

  console.warn("Could not extract time from:", dateTime, "type:", typeof dateTime)
  return "08:00"
}

// Helper function to infer category from time of day
function inferCategoryFromTime(startTime: string): BlockCategory {
  const hour = parseInt(startTime.split(":")[0])

  // Early morning (6-8): likely exercise or breakfast
  if (hour >= 6 && hour < 8) {
    return "exercise"
  }
  // Breakfast time (8-10)
  if (hour >= 8 && hour < 10) {
    return "meal"
  }
  // Morning: exercise (10-12)
  if (hour >= 10 && hour < 12) {
    return "exercise"
  }
  // Lunch time (12-14)
  if (hour >= 12 && hour < 14) {
    return "meal"
  }
  // Afternoon: rest (14-16)
  if (hour >= 14 && hour < 16) {
    return "rest"
  }
  // Afternoon exercise (16-18)
  if (hour >= 16 && hour < 18) {
    return "exercise"
  }
  // Dinner time (18-20)
  if (hour >= 18 && hour < 20) {
    return "meal"
  }
  // Evening: rest (20-24)
  if (hour >= 20 && hour < 24) {
    return "rest"
  }

  return "custom"
}

// Helper function to generate a title based on time and category
function generateTitleFromTimeAndCategory(startTime: string, category: BlockCategory): string {
  const categoryTitles: Record<BlockCategory, string[]> = {
    meal: ["早餐", "午餐", "晚餐", "加餐"],
    exercise: ["运动", "锻炼", "健身", "户外活动"],
    rest: ["休息", "睡眠", "放松", "午睡"],
    medication: ["用药", "服药", "吃药"],
    checkup: ["检查", "体检", "测量"],
    custom: ["日程"],
  }

  const titles = categoryTitles[category]
  const hour = parseInt(startTime.split(":")[0])

  // Use first title in most cases, but vary for meal type based on time
  if (category === "meal") {
    if (hour >= 6 && hour < 10) return "早餐"
    if (hour >= 10 && hour < 12) return "上午加餐"
    if (hour >= 12 && hour < 14) return "午餐"
    if (hour >= 14 && hour < 17) return "下午加餐"
    if (hour >= 17 && hour < 22) return "晚餐"
    return "加餐"
  }

  if (category === "rest") {
    if (hour >= 12 && hour < 14) return "午睡"
    if (hour >= 22 || hour < 6) return "睡眠"
    return "休息"
  }

  return titles[0]
}

// Helper function to convert DailyScheduleVO to ScheduleBlock
function convertToScheduleBlock(vo: any): ScheduleBlock {
  // Handle missing start_time and end_time by generating them
  let startTime = "08:00"
  let endTime = "08:30"

  // Try to extract from start_time/startTime if they exist
  const startSource = vo.start_time ?? vo.startTime
  if (startSource) {
    startTime = extractTimeFromDateTime(startSource)
  }

  // Try to extract from end_time/endTime if they exist
  const endSource = vo.end_time ?? vo.endTime
  if (endSource) {
    endTime = extractTimeFromDateTime(endSource)
  }

  // Determine category - try to use provided one, or infer from time
  let category = mapScheduleTypeToCategory(vo.schedule_type || vo.scheduleType || "")
  if (category === "custom") {
    // If no schedule_type provided, infer from time
    category = inferCategoryFromTime(startTime)
  }

  // Generate title if not provided
  let title = vo.title
  if (!title || (typeof title === "string" && title.trim() === "")) {
    title = generateTitleFromTimeAndCategory(startTime, category)
  }

  // Parse details - ensure it's always an array
  let details: string[] = []
  if (vo.details) {
    if (typeof vo.details === "string") {
      // If details is a string, try to parse it as JSON
      try {
        const parsed = JSON.parse(vo.details)
        details = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        // If parsing fails, treat the whole string as a single item
        details = [vo.details]
      }
    } else if (Array.isArray(vo.details)) {
      // If it's already an array, use it directly
      details = vo.details
    }
  }

  // If no start_time/end_time, generate based on index or use defaults
  console.log(`Converting VO to ScheduleBlock - id: ${vo.id}, title: ${title}, category: ${category}, start: ${startTime}, end: ${endTime}, details:`, details)

  return {
    id: vo.id?.toString() || Math.random().toString(),
    startTime,
    endTime,
    title,
    category,
    details,
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
    const initializeAndLoad = async () => {
      try {
        // First, ensure memberId is initialized
        const { ensureActiveMemberId, getStoredMemberId } = await import("@/lib/member")
        console.log("Ensuring active member ID is set...")
        const memberId = await ensureActiveMemberId()
        console.log("Active member ID ensured:", memberId)

        // Verify memberId is stored in localStorage
        const storedId = getStoredMemberId()
        console.log("Stored member ID after ensure:", storedId)

        // Then load schedules
        if (memberId) {
          await loadSchedules()
        } else {
          console.error("No active member ID found after initialization")
          setSchedule([])
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to initialize:", error)
        setSchedule([])
        setLoading(false)
      }
    }

    initializeAndLoad()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      console.log("Loading schedules from API...")
      const response = await apiFetch("/health-plan/schedules/list")
      console.log("API response status:", response.status)
      console.log("Response headers:", {
        'content-type': response.headers.get('content-type'),
      })

      if (!response.ok) {
        console.error("Failed to load schedules: HTTP", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error response body:", errorText)
        setSchedule([])
        setLoading(false)
        return
      }

      const result = await response.json()
      console.log("Loaded schedules (raw):", result)
      console.log("Schedule data:", result.data)
      console.log("Schedule data type:", typeof result.data)
      console.log("Is array?", Array.isArray(result.data))

      if (!result.data) {
        console.warn("API returned no data, result:", result)
        setSchedule([])
        setLoading(false)
        return
      }

      if (!Array.isArray(result.data)) {
        console.error("API data is not an array, got:", typeof result.data, result.data)
        setSchedule([])
        setLoading(false)
        return
      }

      if (result.data.length === 0) {
        console.warn("API returned empty array")
        setSchedule([])
        setLoading(false)
        return
      }

      console.log(`Processing ${result.data.length} schedules...`)
      // Log the first item to see its structure
      if (result.data.length > 0) {
        console.log("First item structure:", result.data[0])
      }

      const schedules = result.data
        .map((vo: any, index: number) => {
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
        .filter((block: any): block is ScheduleBlock => block !== null)

      console.log(`Successfully converted ${schedules.length} schedules`)
      if (schedules.length > 0) {
        setSchedule(schedules.sort((a: ScheduleBlock, b: ScheduleBlock) => a.startTime.localeCompare(b.startTime)))
      } else {
        console.warn("No schedules converted successfully")
        setSchedule([])
      }
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
        prev.map((b: ScheduleBlock) => (b.id === id ? updatedBlock : b))
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
        .filter((block: any): block is ScheduleBlock => block !== null)

      setSchedule(schedules.sort((a: ScheduleBlock, b: ScheduleBlock) => a.startTime.localeCompare(b.startTime)))
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
