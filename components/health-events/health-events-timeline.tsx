"use client"

import { HealthEvent, categoryEmojis, categoryLabels } from "./types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, Trash2, CheckCircle2 } from "lucide-react"
import { formatDate, getDaysUntilFollowUp } from "./utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface HealthEventsTimelineProps {
  events: HealthEvent[]
  onEdit: (event: HealthEvent) => void
  onDelete: (id: string) => void
  onMarkResolved: (id: string) => void
}

export function HealthEventsTimeline({
  events,
  onEdit,
  onDelete,
  onMarkResolved,
}: HealthEventsTimelineProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sortedEvents.length === 0) {
    return (
      <Card className="p-16 text-center bg-white/50 dark:bg-slate-800/50">
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          暂无健康事件
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          点击"新增健康事件"开始记录您的健康历程
        </p>
      </Card>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600"></div>

      {/* Events */}
      <div className="space-y-6 pl-20">
        {sortedEvents.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            index={index}
            onEdit={onEdit}
            onDelete={() => setDeleteId(event.id)}
            onMarkResolved={onMarkResolved}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null}>
        <AlertDialogContent className="dark:bg-slate-900">
          <AlertDialogTitle>删除健康事件？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作无法撤销。确定要永久删除此事件吗？
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface TimelineEventProps {
  event: HealthEvent
  index: number
  onEdit: (event: HealthEvent) => void
  onDelete: () => void
  onMarkResolved: (id: string) => void
}

function TimelineEvent({
  event,
  index,
  onEdit,
  onDelete,
  onMarkResolved,
}: TimelineEventProps) {
  const daysUntil = event.nextFollowUp
    ? getDaysUntilFollowUp(event.nextFollowUp)
    : null
  const isActive = event.status === "active"

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[48px] top-2 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 z-10 transition-all ${
          isActive
            ? "bg-red-500 shadow-lg shadow-red-500/50"
            : "bg-green-500 shadow-lg shadow-green-500/50"
        }`}
      ></div>

      {/* Event card */}
      <Card
        className={`p-5 transition-all ${
          isActive
            ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md"
            : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 opacity-75"
        }`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {categoryEmojis[event.category]}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-red-500" : "bg-green-500"
                }`}
              ></span>
              <span
                className={
                  isActive
                    ? "text-red-700 dark:text-red-300"
                    : "text-green-700 dark:text-green-300"
                }
              >
                {isActive ? "进行中" : "已康复"}
              </span>
            </div>
          </div>

          {/* Category and Description */}
          <div>
            <div className="mb-2">
              <span className="inline-block px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300 rounded-md">
                {categoryLabels[event.category]}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {event.description}
            </p>
          </div>

          {/* Follow-up info */}
          {event.nextFollowUp && isActive && (
            <div
              className={`p-3 rounded-lg ${
                daysUntil !== null && daysUntil <= 3
                  ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50"
                  : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  daysUntil !== null && daysUntil <= 3
                    ? "text-orange-700 dark:text-orange-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                📅 下次跟进：{formatDate(event.nextFollowUp)}
                {daysUntil !== null && ` (${daysUntil} 天)`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span>健康事件</span>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkResolved(event.id)}
                  className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs"
                  title="标记为已解决"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  解决
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(event)}
                className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                编辑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
