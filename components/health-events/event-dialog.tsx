"use client"

import { useState, useEffect } from "react"
import { HealthEvent, EventCategory, categoryLabels, categoryEmojis } from "./types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: HealthEvent | null
  onSave: (event: HealthEvent) => void
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  onSave,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [category, setCategory] = useState<EventCategory>("other")
  const [status, setStatus] = useState<"active" | "recovered">("active")
  const [nextFollowUp, setNextFollowUp] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description)
      setDate(event.date.toISOString().split("T")[0])
      setCategory(event.category)
      setStatus(event.status)
      setNextFollowUp(
        event.nextFollowUp
          ? event.nextFollowUp.toISOString().split("T")[0]
          : ""
      )
    } else {
      setTitle("")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
      setCategory("other")
      setStatus("active")
      setNextFollowUp("")
    }
  }, [event, open])

  const handleSave = () => {
    if (!title.trim() || !date) return

    const newEvent: HealthEvent = {
      id: event?.id || "",
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      category,
      status,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
    }

    onSave(newEvent)
  }

  const isValid = title.trim() && date

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>
            {event ? "编辑健康事件" : "新增健康事件"}
          </DialogTitle>
          <DialogDescription>
            详细记录您的健康情况，便于后续追踪和管理
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">
              事件名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="例如：胃痛、感冒、头痛等"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              具体描述
            </Label>
            <Textarea
              id="description"
              placeholder="描述症状、具体情况、初步诊断等信息"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-semibold">
                事件分类 <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{categoryEmojis[key as EventCategory]}</span>
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="font-semibold">
                事件日期 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="font-semibold">事件状态</Label>
            <RadioGroup value={status} onValueChange={(v: any) => setStatus(v)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="flex-1 cursor-pointer m-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-medium">治疗/跟进中</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    需要持续跟进和治疗的状态
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <RadioGroupItem value="recovered" id="recovered" />
                <Label htmlFor="recovered" className="flex-1 cursor-pointer m-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="font-medium">已康复/归档</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    已经解决或康复的事件
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Next Follow Up */}
          {status === "active" && (
            <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
              <Label htmlFor="nextFollowUp" className="font-semibold">
                下次跟进日期
              </Label>
              <Input
                id="nextFollowUp"
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                设置定期跟进日期，便于提醒和管理
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:border-slate-700"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {event ? "更新" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
