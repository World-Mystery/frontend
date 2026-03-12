"use client"

import { useState, useRef } from "react"
import {
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyTimeline } from "./daily-timeline"
import { PrinciplesPanel } from "./principles-panel"
import { AddBlockDialog } from "./add-block-dialog"
import type { ScheduleBlock } from "./types"
import { getInitialSchedule } from "./mock-data"

export function HealthPlanView() {
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(getInitialSchedule)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDialogTime, setAddDialogTime] = useState("12:00")
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null)

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
          if (b.category === "rest") {
            const altRest = [
              ["脑部放松", "舒缓呼吸", "闭目冥想"],
              ["午后小睡", "静卧休息", "恢复精力"],
              ["阅读放松", "舒适环境", "缓解压力"],
            ]
            const picked = altRest[Math.floor(Math.random() * altRest.length)]
            return { ...b, details: picked }
          }
          if (b.category === "medication") {
            const altMeds = [
              ["按医嘱服用", "充分饮水", "记录用药"],
              ["饭后半小时", "温水送服", "不宜睡前"],
              ["定时服用", "不可漏服", "观察反应"],
            ]
            const picked = altMeds[Math.floor(Math.random() * altMeds.length)]
            return { ...b, details: picked }
          }
          if (b.category === "checkup") {
            const altCheckups = [
              ["测血压", "记录数值", "咨询建议"],
              ["测血糖", "空腹检验", "对比历史"],
              ["体重测量", "定时记录", "关注趋势"],
            ]
            const picked = altCheckups[Math.floor(Math.random() * altCheckups.length)]
            return { ...b, details: picked }
          }
          if (b.category === "custom") {
            const altCustom = [
              ["计划调整", "重新评估", "更新日程"],
              ["备注补充", "补充说明", "完善信息"],
              ["优化安排", "提升效率", "追踪进度"],
            ]
            const picked = altCustom[Math.floor(Math.random() * altCustom.length)]
            return { ...b, details: picked }
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

        {/* AI Generated Hint */}
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3">
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

        {/* Main Content: Timeline + Principles Sidebar */}
        <div className="flex gap-6 h-full">
          {/* Left: Daily Timeline */}
          <div className="flex-1 min-w-0">
            <DailyTimeline
              schedule={schedule}
              refreshingId={refreshingId}
              onRefresh={handleRefreshBlock}
              onDelete={handleDeleteBlock}
              onClickTimeslot={handleClickTimeslot}
              onBlockClick={handleBlockClick}
              expandedBlockId={expandedBlockId}
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
