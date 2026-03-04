"use client"

import { useState, useRef } from "react"
import {
  ChevronRight,
  Sparkles,
  ChevronLeft,
  CalendarDays,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyTimeline } from "./daily-timeline"
import { PrinciplesPanel } from "./principles-panel"
import { AddBlockDialog } from "./add-block-dialog"
import type { ScheduleBlock } from "./types"
import { getInitialSchedule } from "./mock-data"

function formatDateLabel(date: Date): string {
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()]
  const label = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日  周${weekday}`
  return isToday ? `${label}（今天）` : label
}

export function HealthPlanView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(getInitialSchedule)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogTime, setAddDialogTime] = useState("12:00")
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const prevDay = () => {
    setCurrentDate((d) => {
      const n = new Date(d)
      n.setDate(n.getDate() - 1)
      return n
    })
  }
  const nextDay = () => {
    setCurrentDate((d) => {
      const n = new Date(d)
      n.setDate(n.getDate() + 1)
      return n
    })
  }
  const goToday = () => setCurrentDate(new Date())

  const handleRefreshBlock = (id: string) => {
    setRefreshingId(id)
    setTimeout(() => {
      setSchedule((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          if (b.category === "meal") {
            const altMeals = [
              ["清蒸鲈鱼", "凉拌黄瓜", "杂粮粥"],
              ["西兰花炒虾仁", "冬瓜排骨汤", "糙米饭"],
              ["番茄牛腩", "蒜蓉菠菜", "小米饭"],
            ]
            const picked = altMeals[Math.floor(Math.random() * altMeals.length)]
            return { ...b, details: picked }
          }
          if (b.category === "exercise") {
            const altExercises = [
              { title: "户外散步 30 分钟", details: ["公园步行", "保持匀速", "注意补水"] },
              { title: "太极拳 25 分钟", details: ["二十四式", "注意呼吸", "量力而行"] },
              { title: "游泳 30 分钟", details: ["自由泳", "适度休息", "注意热身"] },
            ]
            const picked = altExercises[Math.floor(Math.random() * altExercises.length)]
            return { ...b, title: picked.title, details: picked.details }
          }
          return b
        })
      )
      setRefreshingId(null)
    }, 600)
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>{"妈妈"}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{"健康计划"}</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">专属健康计划</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                onClick={prevDay}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToday}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {formatDateLabel(currentDate)}
              </button>
              <button
                onClick={nextDay}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Generated Hint */}
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.1]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              {"已根据妈妈的健康档案（高血压、高血脂）智能生成今日计划"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {"点击时间轴空白处可添加自定义安排，每个区块均支持一键换方案"}
            </p>
          </div>
        </div>

        {/* Main Content: Timeline + Principles Sidebar */}
        <div className="flex gap-6">
          {/* Left: Daily Timeline */}
          <div className="flex-1 min-w-0">
            <DailyTimeline
              schedule={schedule}
              refreshingId={refreshingId}
              onRefresh={handleRefreshBlock}
              onDelete={handleDeleteBlock}
              onClickTimeslot={handleClickTimeslot}
            />
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
