"use client"

import { Menu, SquarePen, LogOut, X, MessageSquare, Clock, Sparkles } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { clearAllAuth } from "@/lib/auth"

const chatHistory = [
  { id: "1", title: "关于妈妈血压的咨询", date: "今天" },
  { id: "2", title: "爸爸的糖尿病饮食建议", date: "今天" },
  { id: "3", title: "体检报告解读", date: "昨天" },
  { id: "4", title: "日常用药注意事项", date: "昨天" },
  { id: "5", title: "运动康复计划", date: "3天前" },
  { id: "6", title: "睡眠质量改善方案", date: "上周" },
]

interface LeftSidebarProps {
  onNewChat: () => void
}

export function LeftSidebar({ onNewChat }: LeftSidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    clearAllAuth()
    router.replace("/auth")
  }

  return (
    <>
      {/* Overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-foreground/5 backdrop-blur-[2px]"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Collapsed sidebar - icon rail */}
      <aside className="z-40 flex w-14 shrink-0 flex-col items-center border-r border-border/60 bg-card/60 py-3">
        <button
          onClick={() => setExpanded(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          aria-label="打开侧边栏"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={onNewChat}
          className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          aria-label="新建对话"
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

      {/* Expanded sidebar panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-border/60 bg-white shadow-xl shadow-foreground/[0.05] transition-transform duration-300 ease-out dark:bg-card",
          expanded ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">健康助手</span>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pb-2 pt-3">
          <button
            onClick={() => {
              onNewChat()
              setExpanded(false)
            }}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <SquarePen className="h-4 w-4 text-primary" />
            新建对话
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {(() => {
            let currentDate = ""
            return chatHistory.map((chat) => {
              const showDate = chat.date !== currentDate
              currentDate = chat.date
              return (
                <div key={chat.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 px-2 pb-1 pt-3">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{chat.date}</span>
                    </div>
                  )}
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent">
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                </div>
              )
            })
          })()}
        </div>

        {/* Bottom logout */}
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
