"use client"

import { Bell, Search, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "qa", label: "健康问答", active: true },
  { id: "dashboard", label: "健康仪表盘", active: false },
  { id: "events", label: "健康事件", active: false },
  { id: "plans", label: "健康计划", active: false },
]

export function TopNav() {
  const [activeNav, setActiveNav] = useState("qa")
  const [showMemberMenu, setShowMemberMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  return (
    <header className="relative z-50 flex h-14 items-center justify-between border-b border-border/60 bg-white px-5 dark:bg-card">
      {/* Left: Member Switcher */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setShowMemberMenu(!showMemberMenu)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/80 text-sm font-medium text-primary-foreground">
            M
          </div>
          <span className="text-sm font-medium text-foreground">妈妈</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {showMemberMenu && (
          <>
            <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-background/80" onClick={() => setShowMemberMenu(false)} />
            <div className="absolute left-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-border/50 bg-white p-1.5 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
              {["妈妈", "爸爸", "我"].map((member) => (
                <button
                  key={member}
                  onClick={() => setShowMemberMenu(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {member[0]}
                  </div>
                  {member}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Center: Nav Links */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeNav === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {activeNav === item.id && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Right: Notification + Search */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-background/80" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border/50 bg-white p-2 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground">通知</p>
                <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm text-foreground">妈妈的体检报告已解析完成</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">2 分钟前</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm text-foreground">该问问爸爸今天血压情况了</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">1 小时前</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <Search className="h-[18px] w-[18px] text-muted-foreground" />
          </button>

          {showSearch && (
            <>
              <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-background/80" onClick={() => setShowSearch(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border/50 bg-white p-1 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
                <div className="flex items-center gap-2 px-3 py-1">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="搜索对话记录..."
                    className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
