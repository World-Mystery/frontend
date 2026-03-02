"use client"

import { useState } from "react"
import { HealthEvent, categoryLabels } from "./types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, Trash2, CheckCircle2 } from "lucide-react"
import { formatDate, getDaysUntilFollowUp } from "./utils"
import { HealthEventsSearch } from "./health-events-search"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface HealthEventsListProps {
  events: HealthEvent[]
  onEdit: (event: HealthEvent) => void
  onDelete: (id: string) => void
  onMarkResolved: (id: string) => void
}

export function HealthEventsList({
  events,
  onEdit,
  onDelete,
  onMarkResolved,
}: HealthEventsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory

    const matchesStatus =
      selectedStatus === "all" || event.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const activeEvents = filteredEvents.filter((e) => e.status === "active")
  const recoveredEvents = filteredEvents.filter((e) => e.status === "recovered")

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <HealthEventsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Active Events Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            治疗/跟进中 ({activeEvents.length})
          </h2>
        </div>

        {activeEvents.length === 0 ? (
          <Card className="p-8 text-center bg-white/50 dark:bg-slate-800/50">
            <p className="text-slate-500 dark:text-slate-400">
              暂无进行中的健康事件
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={() => setDeleteId(event.id)}
                onMarkResolved={onMarkResolved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recovered Events Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            已康复/归档 ({recoveredEvents.length})
          </h2>
        </div>

        {recoveredEvents.length === 0 ? (
          <Card className="p-8 text-center bg-white/50 dark:bg-slate-800/50">
            <p className="text-slate-500 dark:text-slate-400">
              暂无已康复的事件
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 opacity-75">
            {recoveredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={() => setDeleteId(event.id)}
                onMarkResolved={onMarkResolved}
                isRecovered
              />
            ))}
          </div>
        )}
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

interface EventCardProps {
  event: HealthEvent
  onEdit: (event: HealthEvent) => void
  onDelete: () => void
  onMarkResolved: (id: string) => void
  isRecovered?: boolean
}

function EventCard({
  event,
  onEdit,
  onDelete,
  onMarkResolved,
  isRecovered = false,
}: EventCardProps) {
  const daysUntil = event.nextFollowUp
    ? getDaysUntilFollowUp(event.nextFollowUp)
    : null

  return (
    <Card className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {event.title}
            </h3>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-full">
              {categoryLabels[event.category]}
            </span>
            {event.status === "active" && (
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-xs font-medium text-red-700 dark:text-red-300 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                进行中
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-medium">发生日期：</span>
              <span>{formatDate(event.date)}</span>
            </div>

            {event.nextFollowUp && !isRecovered && (
              <div
                className={`flex items-center gap-2 font-medium ${
                  daysUntil !== null && daysUntil <= 3
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                <span>下次跟进：</span>
                <span>
                  {formatDate(event.nextFollowUp)}
                  {daysUntil !== null && ` (${daysUntil} 天)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {event.status === "active" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkResolved(event.id)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(event)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
