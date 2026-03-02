"use client"

import { Card } from "@/components/ui/card"
import { HealthEvent } from "./types"
import { AlertCircle, CheckCircle2, Calendar } from "lucide-react"

interface HealthEventsStatsProps {
  events: HealthEvent[]
}

export function HealthEventsStats({ events }: HealthEventsStatsProps) {
  const activeCount = events.filter((e) => e.status === "active").length
  const recoveredCount = events.filter((e) => e.status === "recovered").length
  const totalCount = events.length

  const upcomingFollowUps = events.filter(
    (e) =>
      e.status === "active" &&
      e.nextFollowUp &&
      new Date(e.nextFollowUp) > new Date()
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Events */}
      <Card className="p-5 bg-white dark:bg-slate-800 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              总事件数
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {totalCount}
            </p>
          </div>
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      {/* Active Events */}
      <Card className="p-5 bg-white dark:bg-slate-800 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              进行中
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>

      {/* Recovered Events */}
      <Card className="p-5 bg-white dark:bg-slate-800 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              已康复
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              {recoveredCount}
            </p>
          </div>
          <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>

      {/* Upcoming Follow-ups */}
      <Card className="p-5 bg-white dark:bg-slate-800 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              待跟进
            </p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {upcomingFollowUps}
            </p>
          </div>
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </Card>
    </div>
  )
}
