"use client"

import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Bot,
  Clock,
  Stethoscope,
  Pill,
  ChevronDown,
  ChevronRight,
  CalendarClock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthEvent } from "./types"

interface TimelineViewProps {
  events: HealthEvent[]
  onEdit: (event: HealthEvent) => void
  // timeline view no longer supports marking events as resolved
}

/** Group events by year+month descending */
function groupByMonth(events: HealthEvent[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
  const groups: { key: string; label: string; events: HealthEvent[] }[] = []
  for (const event of sorted) {
    const d = new Date(event.startDate)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`
    let group = groups.find((g) => g.key === key)
    if (!group) {
      group = { key, label, events: [] }
      groups.push(group)
    }
    group.events.push(event)
  }
  return groups
}

function TimelineEventNode({
  event,
  isLast,
  onEdit,
}: {
  event: HealthEvent
  isLast: boolean
  onEdit: (event: HealthEvent) => void
}) {
  // all events start collapsed by default
  const [expanded, setExpanded] = useState(false)
  const [showAiAdvice, setShowAiAdvice] = useState(false)
  const isActive = event.status === "active"

  return (
    <div className="relative flex gap-4">
      {/* Vertical line and node dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
            isActive
              ? "border-red-300 bg-red-500/[0.07] dark:border-red-800"
              : "border-emerald-300 bg-emerald-500/[0.07] dark:border-emerald-800"
          )}
        >
          {isActive ? (
            <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          )}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border/50" />
        )}
      </div>

      {/* Content Card */}
      <div
        className={cn(
          "group mb-6 flex-1 rounded-xl border bg-card transition-all hover:shadow-sm",
          isActive
            ? "border-border/60 hover:border-primary/20"
            : "border-border/40"
        )}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start gap-3 px-5 py-4 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  isActive
                    ? "border-red-200 text-red-600 dark:border-red-900/40 dark:text-red-400"
                    : "border-emerald-200 text-emerald-600 dark:border-emerald-900/40 dark:text-emerald-400"
                )}
              >
                {isActive ? "治疗/跟进中" : "已康复"}
              </Badge>
              {event.aiGenerated && (
                <Badge
                  variant="outline"
                  className="gap-0.5 border-primary/20 text-[10px] px-1.5 py-0 text-primary"
                >
                  <Bot className="h-2.5 w-2.5" />
                  AI 记录
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.startDate}
                {event.resolvedDate && ` ~ ${event.resolvedDate}`}
              </span>
              {event.diagnosis && (
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {event.diagnosis}
                </span>
              )}
            </div>
            {isActive && event.nextFollowUp && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <CalendarClock className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {"下次跟进: "}{event.nextFollowUp}
                </span>
              </div>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="border-t border-border/30 px-5 py-4">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {event.symptoms.map((s, i) => (
                <Badge key={`s-${i}`} variant="secondary" className="text-[11px] font-normal">
                  {s}
                </Badge>
              ))}
              {event.medications.map((m, i) => (
                <Badge
                  key={`m-${i}`}
                  variant="outline"
                  className="gap-0.5 text-[11px] font-normal border-amber-200 text-amber-600 dark:border-amber-900/40 dark:text-amber-400"
                >
                  <Pill className="h-2.5 w-2.5" />
                  {m}
                </Badge>
              ))}
            </div>

            {/* Sub-timeline */}
            <div className="relative ml-2 border-l-2 border-border/40 pl-5">
              {event.timeline.map((entry, index) => (
                <div key={entry.id} className="relative pb-3.5 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[calc(1.25rem+5px)] top-0.5 h-2 w-2 rounded-full border-2 border-card",
                      index === event.timeline.length - 1 && isActive
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                  <p className="mt-0.5 text-sm text-foreground leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>

            {/* AI Advice */}
            {event.aiAdvice && (
              <div className="mt-4">
                <button
                  onClick={() => setShowAiAdvice(!showAiAdvice)}
                  className="flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  <Bot className="h-3 w-3" />
                  {showAiAdvice ? "收起 AI 建议" : "查看 AI 护理建议"}
                </button>
                {showAiAdvice && (
                  <div className="mt-2 rounded-lg border border-primary/10 bg-primary/[0.03] px-4 py-3">
                    <p className="text-sm text-foreground leading-relaxed">{event.aiAdvice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resolution */}
            {!isActive && event.resolution && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/[0.05] px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {event.resolution}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function TimelineView({ events, onEdit}: TimelineViewProps) {
  const groups = groupByMonth(events)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/50 py-16">
        <Clock className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">{"暂无健康事件记录"}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key}>
          {/* Month Label */}
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-xs text-muted-foreground">{group.events.length} 个事件</span>
          </div>
          {/* Events */}
          <div>
            {group.events.map((event, index) => (
              <TimelineEventNode
                key={event.id}
                event={event}
                isLast={index === group.events.length - 1}
                onEdit={onEdit}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
