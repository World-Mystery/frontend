"use client"

import { useEffect, useMemo, useState } from "react"
import { Brain, Sparkles, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ensureActiveMemberId } from "@/lib/member"
import {
  deleteAiMemory,
  getAiMemories,
  type AiMemory,
  type AiMemoryCategory,
} from "@/lib/ai-memory"

const categoryConfig: Record<
  AiMemoryCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  symptom: {
    label: "\u75c7\u72b6",
    bg: "bg-red-500/[0.07]",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-900/40",
  },
  medication: {
    label: "\u7528\u836f",
    bg: "bg-amber-500/[0.07]",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/40",
  },
  habit: {
    label: "\u4e60\u60ef",
    bg: "bg-blue-500/[0.07]",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/40",
  },
  preference: {
    label: "\u504f\u597d",
    bg: "bg-emerald-500/[0.07]",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900/40",
  },
  other: {
    label: "\u5176\u4ed6",
    bg: "bg-slate-500/[0.07]",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800/40",
  },
}

const categories: Array<"all" | AiMemoryCategory> = [
  "all",
  "symptom",
  "medication",
  "habit",
  "preference",
  "other",
]

const categoryLabels: Record<"all" | AiMemoryCategory, string> = {
  all: "\u5168\u90e8",
  symptom: "\u75c7\u72b6",
  medication: "\u7528\u836f",
  habit: "\u4e60\u60ef",
  preference: "\u504f\u597d",
  other: "\u5176\u4ed6",
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return "\u6682\u65e0\u65f6\u95f4"

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return "\u6682\u65e0\u65f6\u95f4"

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

function MemoryItem({
  memory,
  deleting,
  onDelete,
}: {
  memory: AiMemory
  deleting: boolean
  onDelete: (memory: AiMemory) => void
}) {
  const config = categoryConfig[memory.category]

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-all hover:shadow-sm",
        config.border,
        config.bg
      )}
    >
      <Badge
        variant="outline"
        className={cn("mt-0.5 shrink-0 text-[10px]", config.text, config.border)}
      >
        {config.label}
      </Badge>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground">{memory.content}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {"\u6765\u6e90\uff1a"}
          {memory.source || "\u5411\u91cf\u5e93"} &middot; {formatDate(memory.timestamp)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(memory)}
        disabled={deleting}
        aria-label={`删除记忆：${memory.content}`}
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20",
          deleting && "cursor-not-allowed opacity-100"
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function AiMemoryBase() {
  const [memories, setMemories] = useState<AiMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<"all" | AiMemoryCategory>("all")
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false

    const loadMemories = async () => {
      setLoading(true)
      setError(null)

      try {
        await ensureActiveMemberId()
        const data = await getAiMemories()
        if (!cancelled) {
          setMemories(data.filter((item) => item.content))
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "\u52a0\u8f7d AI \u8bb0\u5fc6\u5931\u8d25"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadMemories()

    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async (memory: AiMemory) => {
    if (deletingId) return

    setDeletingId(memory.id)
    try {
      await deleteAiMemory(memory.id)
      setMemories((current) => current.filter((item) => item.id !== memory.id))
    } catch (err) {
      toast({
        title: "删除失败",
        description: err instanceof Error ? err.message : "删除 AI 记忆失败",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMemories = useMemo(() => {
    if (filterCategory === "all") return memories
    return memories.filter((memory) => memory.category === filterCategory)
  }, [filterCategory, memories])

  return (
    <section className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07]">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {"AI \u8bb0\u5fc6\u5e93"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {"AI \u4ece\u5411\u91cf\u5e93\u4e2d\u8bfb\u53d6\u81ea\u52a8\u63d0\u53d6\u7684\u5065\u5eb7\u6807\u7b7e"}
              {" "}&middot; {memories.length} {"\u6761\u8bb0\u5fc6"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b border-border/30 px-5 py-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              filterCategory === category
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-4">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-center">
            <p className="text-sm text-destructive">
              {"AI \u8bb0\u5fc6\u52a0\u8f7d\u5931\u8d25"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
        ) : null}

        {!error && loading ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {"\u6b63\u5728\u4ece\u5411\u91cf\u5e93\u540c\u6b65 AI \u8bb0\u5fc6..."}
            </p>
          </div>
        ) : null}

        {!error && !loading && filteredMemories.length > 0
          ? filteredMemories.map((memory) => (
              <MemoryItem
                key={memory.id}
                memory={memory}
                deleting={deletingId === memory.id}
                onDelete={handleDelete}
              />
            ))
          : null}

        {!error && !loading && filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {"\u8be5\u5206\u7c7b\u4e0b\u6682\u65e0\u5411\u91cf\u5e93\u8bb0\u5fc6"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

