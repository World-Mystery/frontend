"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Pill,
  Stethoscope,
  Bot,
  AlertCircle,
  CalendarClock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthEvent } from "./types"

interface EventCardProps {
  event: HealthEvent
  onEdit: (event: HealthEvent) => void
  onDelete: (id: string) => void
  onMarkResolved: (id: string) => void
  onUpdateEntry: (eventId: string, entry: HealthEvent["timeline"][0]) => void
}

export function EventCard({ event, onEdit, onDelete, onMarkResolved, onUpdateEntry }: EventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showAiAdvice, setShowAiAdvice] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState("")
  const [editDescription, setEditDescription] = useState("")

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
      {/* Card Header */}
      <div className="flex items-start gap-3 px-5 py-4">
        {/* Status Indicator */}
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

        {/* Title & Meta */}
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
            </span>
            {event.diagnosis && (
              <span className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {event.diagnosis}
              </span>
            )}
          </div>
          {/* Follow-up reminder for active events */}
          {isActive && event.nextFollowUp && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <CalendarClock className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {"下次跟进: "}{event.nextFollowUp}
                {daysUntilFollowUp !== null && daysUntilFollowUp > 0 && (
                  <span className="text-muted-foreground font-normal">
                    {" "}({daysUntilFollowUp} 天后)
                  </span>
                )}
              </span>
            </div>
          )}
          {/* Resolution note for recovered events */}
          {!isActive && event.resolution && (
            <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              {event.resolution}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {isActive && (
            <button
              onClick={() => onMarkResolved(event.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-emerald-500/10"
              title="标记为已康复"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </button>
          )}
          <button
            onClick={() => onEdit(event)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
            title="编辑"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-destructive/10"
            title="删除"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/30 px-5 py-3">
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

      {/* Expandable Timeline */}
      <div className="border-t border-border/30">
        <button
          onClick={() => setExpanded(!expanded)}
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
            {/* Mini Timeline */}
            <div className="relative ml-3 border-l-2 border-border/50 pl-5">
              {event.timeline.map((entry, index) => (
                <div key={entry.id} className="relative pb-4 last:pb-0">
                  <div
                    className={cn(
                      "absolute -left-[calc(1.25rem+5px)] top-0.5 h-2 w-2 rounded-full border-2 border-card",
                      index === event.timeline.length - 1 && isActive
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                      <p className="mt-0.5 text-sm text-foreground leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingEntryId(entry.id)
                        setEditDate(entry.date)
                        setEditDescription(entry.description)
                      }}
                      className="opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                      title="编辑病程记录"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  {editingEntryId === entry.id && (
                    <div className="mt-2 space-y-2 rounded-lg border border-border p-3 bg-card">
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          日期
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="mt-1 h-8 w-full rounded-lg border border-border px-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground">
                          描述
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingEntryId(null)}
                          className="rounded-lg border border-border px-3 py-1 text-xs"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => {
                            if (editDate && editDescription.trim()) {
                              onUpdateEntry(event.id, {
                                ...entry,
                                date: editDate,
                                description: editDescription.trim(),
                              })
                              setEditingEntryId(null)
                            }
                          }}
                          className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Advice */}
            {event.aiAdvice && (
              <div className="mt-3">
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
          </div>
        )}
      </div>
    </div>
  )
}
