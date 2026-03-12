"use client"

import { useState } from "react"
import {
  Plus,
  ChevronRight,
  LayoutList,
  GitBranch,
  Search,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ManagementView } from "./management-view"
import { TimelineView } from "./timeline-view"
import { EventDialog } from "./event-dialog"
import { ResolveDialog } from "./resolve-dialog"
import { initialEvents } from "./mock-data"
import type { HealthEvent } from "./types"

type ViewMode = "management" | "timeline"

export function HealthEventsView() {
  const [events, setEvents] = useState<HealthEvent[]>(initialEvents)
  const [viewMode, setViewMode] = useState<ViewMode>("management")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null)
  const [resolveTarget, setResolveTarget] = useState<HealthEvent | null>(null)

  // Stats
  const activeCount = events.filter((e) => e.status === "active").length
  const recoveredCount = events.filter((e) => e.status === "recovered").length
  const upcomingFollowUps = events.filter(
    (e) =>
      e.status === "active" &&
      e.nextFollowUp &&
      new Date(e.nextFollowUp).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000
  ).length

  // Search filter
  const filteredEvents = searchQuery
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          e.medications.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (e.diagnosis && e.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : events

  const handleSaveEvent = (saved: HealthEvent) => {
    setEvents((prev) => {
      const existing = prev.find((e) => e.id === saved.id)
      if (existing) {
        return prev.map((e) => (e.id === saved.id ? saved : e))
      }
      return [saved, ...prev]
    })
    setEditingEvent(null)
  }

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const handleMarkResolved = (id: string) => {
    const target = events.find((e) => e.id === id)
    if (target) {
      setResolveTarget(target)
    }
  }

  const handleConfirmResolve = (resolution: string) => {
    if (!resolveTarget) return
    setEvents((prev) =>
      prev.map((e) =>
        e.id === resolveTarget.id
          ? {
              ...e,
              status: "recovered" as const,
              resolvedDate: new Date().toISOString().split("T")[0],
              resolution,
              nextFollowUp: undefined,
            }
          : e
      )
    )
    setResolveTarget(null)
  }

  const handleEdit = (event: HealthEvent) => {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  const handleUpdateEntry = (eventId: string, updatedEntry: HealthEvent["timeline"][0]) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              timeline: e.timeline.map((t) => (t.id === updatedEntry.id ? updatedEntry : t)),
            }
          : e
      )
    )
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setDialogOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{"妈妈"}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{"健康事件"}</span>
            </div>
            {/* title removed per design; keep breadcrumb only */}
          </div>
          <button
            onClick={handleNewEvent}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md"
          >
            <Plus className="h-4 w-4 text-primary" />
            新增健康事件
          </button>
        </div>

        {/* Summary Stats */}
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

        {/* Search + View Switcher Bar */}
        <div className="mb-6 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索事件名称、症状、用药..."
              className="h-10 w-full rounded-xl border border-border/60 bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* View Switcher */}
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

        {/* Content */}
        {viewMode === "management" ? (
          <ManagementView
            events={filteredEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkResolved={handleMarkResolved}
            onUpdateEntry={handleUpdateEntry}
          />
        ) : (
          <TimelineView
            events={filteredEvents}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Dialogs */}
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
    </div>
  )
}
