"use client"

import { Menu, SquarePen, LogOut, X, MessageSquare, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { clearAllAuth } from "@/lib/auth"
import { ChatSession, deleteChatSession, listChatSessions } from "@/lib/chat-session"
import { ensureActiveMemberId } from "@/lib/member"

interface LeftSidebarProps {
  onNewChat: (sessionId?: number) => void
  onSelectSession: (sessionId: number) => void
  activeSessionId?: number | null
  refreshToken?: number
}

export function LeftSidebar({
  onNewChat,
  onSelectSession,
  activeSessionId,
  refreshToken = 0,
}: LeftSidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  const parseCreateTime = (value: unknown): Date | null => {
    if (!value) return null
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value
    if (typeof value === "string") {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof value === "number") {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    if (Array.isArray(value)) {
      const [y, m, d, h = 0, mi = 0, s = 0] = value as number[]
      const date = new Date(y, (m ?? 1) - 1, d ?? 1, h, mi, s)
      return isNaN(date.getTime()) ? null : date
    }
    return null
  }

  const formatCreateTime = (value: unknown): string => {
    const d = parseCreateTime(value)
    if (!d) return ""
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`
  }

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const da = parseCreateTime(a.createTime)?.getTime() ?? 0
      const db = parseCreateTime(b.createTime)?.getTime() ?? 0
      return db - da
    })
  }, [sessions])

  const refreshSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      await ensureActiveMemberId()
      const list = await listChatSessions()
      setSessions(list)
      return list
    } catch (e) {
      setError("加载会话失败，请稍后重试。")
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshSessions()
  }, [refreshToken])

  const handleLogout = () => {
    clearAllAuth()
    router.replace("/auth")
  }

  const handleAddSession = () => {
    setError(null)
    onNewChat()
    setExpanded(false)
  }

  const handleDeleteSession = async (sessionId: number) => {
    setDeletingId(sessionId)
    setError(null)
    try {
      await ensureActiveMemberId()
      await deleteChatSession(sessionId)
      await refreshSessions()
    } catch (e) {
      setError("删除会话失败，请稍后重试。")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-foreground/5 backdrop-blur-[2px]"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside className="z-40 flex w-14 shrink-0 flex-col items-center border-r border-border/60 bg-card/60 py-3">
        <button
          onClick={() => setExpanded(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          aria-label="打开侧边栏"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={handleAddSession}
          className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          aria-label="新建会话"
        >
          <SquarePen className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          aria-label="退出登录"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </button>
      </aside>

      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border/60 bg-white shadow-xl shadow-foreground/[0.05] transition-transform duration-300 ease-out dark:bg-card",
          expanded ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">对话记录</span>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-3 pb-2 pt-3">
          <button
            onClick={handleAddSession}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <SquarePen className="h-4 w-4 text-primary" />
            新建会话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1">
          {loading ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">加载中...</div>
          ) : sortedSessions.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">暂无会话，开始对话后会显示在这里。</div>
          ) : (
            <div className="flex flex-col gap-1">
              {sortedSessions.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button
                    onClick={() => {
                      onSelectSession(chat.id)
                      setExpanded(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent",
                      activeSessionId === chat.id ? "bg-accent" : ""
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span className="truncate">{chat.title || "新对话"}</span>
                      <span className="text-[11px] text-muted-foreground/70">
                        {formatCreateTime(chat.createTime)}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteSession(chat.id)}
                    disabled={deletingId === chat.id}
                    className="absolute right-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-muted-foreground shadow-sm transition hover:text-destructive group-hover:flex disabled:opacity-60"
                    aria-label="删除会话"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-border px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </div>
    </>
  )
}
