"use client"

import { TopNav } from "@/components/top-nav"
import { LeftSidebar } from "@/components/left-sidebar"
import { ChatArea } from "@/components/chat-area"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { HealthEventsView } from "@/components/health-events/health-events-view"
import { HealthPlanView } from "@/components/health-plan/health-plan-view"
import { ProtectedRoute } from "@/components/auth/route-protector"
import { useState } from "react"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [activeNav, setActiveNav] = useState("qa")
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [sessionListVersion, setSessionListVersion] = useState(0)

  const handleNewChat = (sessionId?: number) => {
    setChatKey((prev) => prev + 1)
    setActiveNav("qa")
    if (typeof sessionId === "number") {
      setActiveSessionId(sessionId)
    } else {
      setActiveSessionId(null)
    }
  }

  const handleSessionCreated = (sessionId: number) => {
    setActiveSessionId(sessionId)
    setSessionListVersion((prev) => prev + 1)
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
                    refreshToken={sessionListVersion}
                />
            )}
            {activeNav === "qa" && (
                <ChatArea
                    key={chatKey}
                    sessionId={activeSessionId}
                    onSessionCreated={handleSessionCreated}
                />
            )}
            {activeNav === "dashboard" && <DashboardView />}
            {activeNav === "events" && <HealthEventsView />}
            {activeNav === "plans" && <HealthPlanView />}
          </div>
        </div>
      </ProtectedRoute>
  )
}
