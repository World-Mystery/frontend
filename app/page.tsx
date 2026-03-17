"use client"

import { TopNav } from "@/components/top-nav"
import { LeftSidebar } from "@/components/left-sidebar"
import { ChatArea } from "@/components/chat-area"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { HealthEventsView } from "@/components/health-events/health-events-view"
import { HealthPlanView } from "@/components/health-plan/health-plan-view"
import { ProtectedRoute } from "@/components/auth/route-protector"
import { useEffect, useState } from "react"
import { addChatSession } from "@/lib/chat-session"
import { ensureActiveMemberId } from "@/lib/member"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [activeNav, setActiveNav] = useState("qa")
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)

  useEffect(() => {
    const createInitialSession = async () => {
      try {
        await ensureActiveMemberId()
        const newId = await addChatSession()
        if (newId) {
          setActiveSessionId(newId)
          setChatKey((prev) => prev + 1)
          return
        }
      } catch (e) {
        // keep empty state on failure
      }
    }
    void createInitialSession()
  }, [])

  const handleNewChat = (sessionId?: number) => {
    setChatKey((prev) => prev + 1)
    setActiveNav("qa")
    if (sessionId) {
      setActiveSessionId(sessionId)
    } else {
      setActiveSessionId(null)
    }
  }

  return (
      <ProtectedRoute>
        <div className="flex h-screen flex-col">
          <TopNav activeNav={activeNav} onNavChange={setActiveNav} />
          <div className="flex flex-1 overflow-hidden">
            {activeNav === "qa" && (
                <LeftSidebar
                    onNewChat={handleNewChat}
                    onSelectSession={(id) => setActiveSessionId(id)}
                    activeSessionId={activeSessionId}
                />
            )}
            {activeNav === "qa" && <ChatArea key={chatKey} sessionId={activeSessionId} />}
            {activeNav === "dashboard" && <DashboardView />}
            {activeNav === "events" && <HealthEventsView />}
            {activeNav === "plans" && <HealthPlanView />}
          </div>
        </div>
      </ProtectedRoute>
  )
}
