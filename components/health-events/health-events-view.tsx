"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  LayoutList,
  Loader2,
  Plus,
  Search,
} from "lucide-react"
import { EventDialog } from "./event-dialog"
import { ManagementView } from "./management-view"
import { RecordDialog } from "./record-dialog"
import { ResolveDialog } from "./resolve-dialog"
import { TimelineView } from "./timeline-view"
import type { HealthEvent } from "./types"
import { cn } from "@/lib/utils"
import { getStoredMemberId } from "@/lib/member"
import {
  getHealthEventRecords,
  getTodayDateString,
  listHealthEvents,
  mapBackendEventToUI,
  mapBackendRecordToTimelineEntry,
  sortTimelineEntries,
  type HealthEventRecord,
} from "@/lib/health-event"

type ViewMode = "management" | "timeline"

interface HealthEventsViewProps {
  currentMemberName: string
}

export function HealthEventsView({ currentMemberName }: HealthEventsViewProps) {
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("management")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null)
  const [resolveTarget, setResolveTarget] = useState<HealthEvent | null>(null)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [recordDialogEvent, setRecordDialogEvent] = useState<HealthEvent | null>(null)
  const [editingEntry, setEditingEntry] = useState<HealthEvent["timeline"][number] | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        const memberId = getStoredMemberId()
        if (!memberId) {
          setError("未能获取成员信息，请重新登录")
          return
        }

        const backendEvents = await listHealthEvents(memberId)
        const uiEvents = await Promise.all(
          backendEvents.map(async (event) => {
            try {
              const records = await getHealthEventRecords(event.id)
              return mapBackendEventToUI(event, records)
            } catch {
              return mapBackendEventToUI(event)
            }
          })
        )

        setEvents(uiEvents)
      } catch (err) {
        const message = err instanceof Error ? err.message : "加载健康事件失败"
        setError(message)
        console.error("Failed to load health events:", err)
      } finally {
        setLoading(false)
      }
    }

    void loadEvents()
  }, [])

  const activeCount = events.filter((event) => event.status === "active").length
  const recoveredCount = events.filter((event) => event.status === "recovered").length
  const upcomingFollowUps = events.filter(
    (event) =>
      event.status === "active" &&
      event.nextFollowUp &&
      new Date(event.nextFollowUp).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000
  ).length

  const filteredEvents = searchQuery
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.symptoms.some((symptom) =>
            symptom.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          event.medications.some((medication) =>
            medication.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (event.diagnosis &&
            event.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : events

  const handleSaveEvent = (saved: HealthEvent) => {
    setEvents((previousEvents) => {
      const existingEvent = previousEvents.find((event) => String(event.id) === String(saved.id))
      if (!existingEvent) {
        return [saved, ...previousEvents]
      }

      return previousEvents.map((event) =>
        String(event.id) === String(saved.id)
          ? {
              ...event,
              ...saved,
              timeline:
                existingEvent.timeline.length > 0 ? existingEvent.timeline : saved.timeline,
              resolution: saved.resolution ?? existingEvent.resolution,
              resolvedDate: saved.resolvedDate ?? existingEvent.resolvedDate,
            }
          : event
      )
    })
    setEditingEvent(null)
  }

  const handleDelete = (id: string) => {
    setEvents((previousEvents) =>
      previousEvents.filter((event) => String(event.id) !== id)
    )
  }

  const handleMarkResolved = (id: string) => {
    const target = events.find((event) => String(event.id) === id)
    if (target) {
      setResolveTarget(target)
    }
  }

  const handleConfirmResolve = (resolution: string) => {
    if (!resolveTarget) return

    setEvents((previousEvents) =>
      previousEvents.map((event) =>
        String(event.id) === String(resolveTarget.id)
          ? {
              ...event,
              status: "recovered",
              resolvedDate: getTodayDateString(),
              resolution,
              nextFollowUp: undefined,
            }
          : event
      )
    )
    setResolveTarget(null)
  }

  const handleEdit = (event: HealthEvent) => {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setDialogOpen(true)
  }

  const handleAddEntry = (event: HealthEvent) => {
    setRecordDialogEvent(event)
    setEditingEntry(null)
    setRecordDialogOpen(true)
  }

  const handleEditEntry = (
    event: HealthEvent,
    entry: HealthEvent["timeline"][number]
  ) => {
    setRecordDialogEvent(event)
    setEditingEntry(entry)
    setRecordDialogOpen(true)
  }

  const handleSaveRecord = async (savedRecord: HealthEventRecord) => {
    if (!recordDialogEvent) return

    const eventId = Number(recordDialogEvent.id)

    try {
      const records = await getHealthEventRecords(eventId)
      const refreshedTimeline =
        records.length > 0
          ? sortTimelineEntries(records.map(mapBackendRecordToTimelineEntry))
          : [mapBackendRecordToTimelineEntry(savedRecord)]

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          Number(event.id) === eventId
            ? {
                ...event,
                timeline: refreshedTimeline,
              }
            : event
        )
      )
    } catch (err) {
      console.error("Failed to refresh health event records:", err)

      const fallbackEntry = mapBackendRecordToTimelineEntry(savedRecord)
      setEvents((previousEvents) =>
        previousEvents.map((event) => {
          if (Number(event.id) !== eventId) {
            return event
          }

          const nextTimeline = event.timeline.some((entry) => entry.id === fallbackEntry.id)
            ? event.timeline.map((entry) =>
                entry.id === fallbackEntry.id ? fallbackEntry : entry
              )
            : [
                fallbackEntry,
                ...event.timeline.filter((entry) => !entry.id.startsWith("t-")),
              ]

          return {
            ...event,
            timeline: sortTimelineEntries(nextTimeline),
          }
        })
      )
    } finally {
      setRecordDialogEvent(null)
      setEditingEntry(null)
    }
  }

  if (error && !loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">加载失败</h3>
                <p className="mt-1 text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{currentMemberName}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">健康事件</span>
            </div>
          </div>
          <button
            onClick={handleNewEvent}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md"
          >
            <Plus className="h-4 w-4 text-primary" />
            新增健康事件
          </button>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/[0.07]">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">进行中</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.07]">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{recoveredCount}</p>
              <p className="text-xs text-muted-foreground">已康复</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/[0.07]">
              <CalendarClock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{upcomingFollowUps}</p>
              <p className="text-xs text-muted-foreground">近期跟进</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索事件名称、症状、用药..."
              className="h-10 w-full rounded-xl border border-border/60 bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center rounded-xl border border-border/60 bg-card p-1">
            <button
              onClick={() => setViewMode("management")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                viewMode === "management"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              管理视图
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                viewMode === "timeline"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              历程视图
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无健康事件记录</p>
          </div>
        ) : viewMode === "management" ? (
          <ManagementView
            events={filteredEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkResolved={handleMarkResolved}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
          />
        ) : (
          <TimelineView events={filteredEvents} onEdit={handleEdit} />
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        onSave={handleSaveEvent}
      />
      <ResolveDialog
        open={!!resolveTarget}
        onOpenChange={(open) => !open && setResolveTarget(null)}
        eventTitle={resolveTarget?.title || ""}
        onConfirm={handleConfirmResolve}
      />
      <RecordDialog
        open={recordDialogOpen}
        onOpenChange={(open) => {
          setRecordDialogOpen(open)
          if (!open) {
            setRecordDialogEvent(null)
            setEditingEntry(null)
          }
        }}
        eventId={recordDialogEvent ? Number(recordDialogEvent.id) : null}
        eventTitle={recordDialogEvent?.title || ""}
        entry={editingEntry}
        onSave={handleSaveRecord}
      />
    </div>
  )
}
