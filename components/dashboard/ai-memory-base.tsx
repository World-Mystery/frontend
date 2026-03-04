"use client"

import { useState } from "react"
import { Brain, X, Pencil, Check, Plus, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MemoryTag {
  id: string
  content: string
  source: string
  date: string
  category: "symptom" | "medication" | "habit" | "preference" | "other"
}

const categoryConfig = {
  symptom: { label: "症状", bg: "bg-red-500/[0.07]", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-900/40" },
  medication: { label: "用药", bg: "bg-amber-500/[0.07]", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/40" },
  habit: { label: "习惯", bg: "bg-blue-500/[0.07]", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/40" },
  preference: { label: "偏好", bg: "bg-emerald-500/[0.07]", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/40" },
  other: { label: "其他", bg: "bg-slate-500/[0.07]", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-800/40" },
}

const initialMemories: MemoryTag[] = [
  { id: "1", content: "近期容易失眠，入睡困难", source: "睡眠质量改善方案", date: "2026-02-28", category: "symptom" },
  { id: "2", content: "对布洛芬有轻微胃部不适反应", source: "日常用药注意事项", date: "2026-02-25", category: "medication" },
  { id: "3", content: "晨起血压偏高，建议晨间监测", source: "关于妈妈血压的咨询", date: "2026-03-01", category: "symptom" },
  { id: "4", content: "偏好清淡饮食，不喜油腻", source: "爸爸的糖尿病饮食建议", date: "2026-02-20", category: "preference" },
  { id: "5", content: "每天晚饭后散步30分钟", source: "运动康复计划", date: "2026-02-22", category: "habit" },
  { id: "6", content: "降压药需在早餐前服用", source: "日常用药注意事项", date: "2026-02-18", category: "medication" },
  { id: "7", content: "有时会感到头晕，可能与血压波动有关", source: "关于妈妈血压的咨询", date: "2026-03-02", category: "symptom" },
  { id: "8", content: "睡前喝牛奶有助入睡", source: "睡眠质量改善方案", date: "2026-02-28", category: "habit" },
]

function MemoryItem({
  memory,
  onDelete,
  onUpdate,
}: {
  memory: MemoryTag
  onDelete: (id: string) => void
  onUpdate: (id: string, content: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(memory.content)
  const config = categoryConfig[memory.category]

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(memory.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(memory.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") handleCancel()
  }

  return (
    <div className={cn("group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-all hover:shadow-sm", config.border, config.bg)}>
      <Badge variant="outline" className={cn("mt-0.5 shrink-0 text-[10px]", config.text, config.border)}>
        {config.label}
      </Badge>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 flex-1 rounded border border-border bg-background px-2 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              autoFocus
            />
            <button onClick={handleSave} className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={handleCancel} className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground hover:bg-accent">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground leading-relaxed">{memory.content}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {"来源："}{memory.source} &middot; {memory.date}
            </p>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-background/80"
            aria-label="编辑记忆"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10"
            aria-label="删除记忆"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}
    </div>
  )
}

export function AiMemoryBase() {
  const [memories, setMemories] = useState(initialMemories)
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const handleDelete = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  const handleUpdate = (id: string, content: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m))
    )
  }

  const categories = ["all", ...Object.keys(categoryConfig)] as const
  const categoryLabels: Record<string, string> = {
    all: "全部",
    ...Object.fromEntries(Object.entries(categoryConfig).map(([k, v]) => [k, v.label])),
  }

  const filteredMemories =
    filterCategory === "all"
      ? memories
      : memories.filter((m) => m.category === filterCategory)

  return (
    <section className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07]">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">AI 记忆库</h2>
            <p className="text-xs text-muted-foreground">
              AI 从对话中自动提取的健康标签 &middot; {memories.length} 条记忆
            </p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 border-b border-border/30 px-5 py-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              filterCategory === cat
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Memory list */}
      <div className="flex flex-col gap-2 p-4">
        {filteredMemories.length > 0 ? (
          filteredMemories.map((memory) => (
            <MemoryItem
              key={memory.id}
              memory={memory}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{"该分类暂无记忆标签"}</p>
          </div>
        )}
      </div>
    </section>
  )
}
