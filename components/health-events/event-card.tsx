"use client"

import { useState } from "react"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Bot,
  Pencil,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthEvent } from "./types"

interface EventCardProps {
  event: HealthEvent
  onEdit: (event: HealthEvent) => void
  onDelete: (id: string) => void
  onMarkResolved: (id: string) => void
  onAddEntry: (event: HealthEvent) => void
  onEditEntry: (event: HealthEvent, entry: HealthEvent["timeline"][number]) => void
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onMarkResolved,
  onAddEntry,
  onEditEntry,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAiAdvice, setShowAiAdvice] = useState(false)

  const isActive = event.status === "active"

  const daysUntilFollowUp = event.nextFollowUp
    ? Math.ceil(
        (new Date(event.nextFollowUp).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card transition-all hover:shadow-sm",
        isActive
          ? "border-border/60 hover:border-primary/20"
          : "border-border/40 opacity-80 hover:opacity-100"
      )}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <div
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isActive ? "bg-red-500/[0.07]" : "bg-emerald-500/[0.07]"
          )}
        >
          {isActive ? (
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
            <Badge
              variant="outline"
              className={cn(
                "px-1.5 py-0 text-[10px]",
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
                className="gap-0.5 border-primary/20 px-1.5 py-0 text-[10px] text-primary"
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
            </span>
            {event.diagnosis && (
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {event.diagnosis}
              </span>
            )}
          </div>
          {isActive && event.nextFollowUp && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <CalendarClock className="h-3 w-3 text-amber-500" />
              <span className="font-medium text-amber-600 dark:text-amber-400">
                下次跟进：{event.nextFollowUp}
                {daysUntilFollowUp !== null && daysUntilFollowUp > 0 && (
                  <span className="font-normal text-muted-foreground">
                    {" "}({daysUntilFollowUp} 天后)
                  </span>
                )}
              </span>
            </div>
          )}
          {!isActive && event.resolution && (
            <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              {event.resolution}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {isActive && (
            <button
              onClick={() => onMarkResolved(String(event.id))}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-emerald-500/10"
              title="标记为已康复"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </button>
          )}
          <button
            onClick={() => onEdit(event)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
            title="编辑事件"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(String(event.id))}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-destructive/10"
            title="删除事件"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/30 px-5 py-3">
        {event.symptoms.map((symptom, index) => (
          <Badge key={`symptom-${index}`} variant="secondary" className="text-[11px] font-normal">
            {symptom}
          </Badge>
        ))}
        {event.medications.map((medication, index) => (
          <Badge
            key={`medication-${index}`}
            variant="outline"
            className="gap-0.5 border-amber-200 text-[11px] font-normal text-amber-600 dark:border-amber-900/40 dark:text-amber-400"
          >
            <Pill className="h-2.5 w-2.5" />
            {medication}
          </Badge>
        ))}
      </div>

      <div className="border-t border-border/30">
        <button
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-center gap-1 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
        >
          {expanded ? (
            <>
              收起详情
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              展开病程记录 ({event.timeline.length})
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {expanded && (
          <div className="px-5 pb-4">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-sky-500/[0.08] px-3 py-2">
              <div>
                <p className="text-xs font-medium text-foreground">详细病程记录</p>
                <p className="text-[11px] text-muted-foreground">
                  为当前健康事件补充检查、用药和症状变化等记录
                </p>
              </div>
              <button
                onClick={() => onAddEntry(event)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/15 bg-background px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.05]"
              >
                <Plus className="h-3.5 w-3.5" />
                新增记录
              </button>
            </div>

            <div className="relative ml-3 border-l-2 border-border/50 pl-5">
              {event.timeline.map((entry, index) => (
                <div key={entry.id} className="group/entry relative pb-4 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[calc(1.25rem+5px)] top-0.5 h-2 w-2 rounded-full border-2 border-card",
                      index === 0 && isActive ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                        {entry.description}
                      </p>
                    </div>
                    {!entry.id.startsWith("t-") && (
                      <button
                        onClick={() => onEditEntry(event, entry)}
                        className="rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-primary group-hover/entry:opacity-100"
                        title="编辑病程记录"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {event.aiAdvice && (
              <div className="mt-3">
                <button
                  onClick={() => setShowAiAdvice((current) => !current)}
                  className="flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  <Bot className="h-3 w-3" />
                  {showAiAdvice ? "收起 AI 建议" : "查看 AI 护理建议"}
                </button>
                {showAiAdvice && (
                  <div className="mt-2 rounded-lg border border-primary/10 bg-primary/[0.03] px-4 py-3">
                    <p className="text-sm leading-relaxed text-foreground">{event.aiAdvice}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
