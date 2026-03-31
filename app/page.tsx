"use client"

import { TopNav } from "@/components/top-nav"
import { LeftSidebar } from "@/components/left-sidebar"
import { ChatArea } from "@/components/chat-area"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { HealthEventsView } from "@/components/health-events/health-events-view"
import { HealthPlanView } from "@/components/health-plan/health-plan-view"
import { ProtectedRoute } from "@/components/auth/route-protector"
import { useState } from "react"
import type { Member } from "@/lib/member"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [activeNav, setActiveNav] = useState("qa")
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [sessionListVersion, setSessionListVersion] = useState(0)
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null)
  const [activeMemberName, setActiveMemberName] = useState("未选择成员")

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

  const handleActiveMemberChange = (member: Member | null) => {
    setActiveMemberId(member?.id ?? null)
    setActiveMemberName(member?.nickname?.trim() || "未选择成员")
  }

  return (
      <ProtectedRoute>
        <div className="flex h-screen flex-col">
          <TopNav
            activeNav={activeNav}
            onNavChange={setActiveNav}
            onActiveMemberChange={handleActiveMemberChange}
          />
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
            {activeNav === "dashboard" && (
              <DashboardView
                key={`dashboard-${activeMemberId ?? "none"}`}
                currentMemberName={activeMemberName}
              />
            )}
            {activeNav === "events" && (
              <HealthEventsView
                key={`events-${activeMemberId ?? "none"}`}
                currentMemberName={activeMemberName}
              />
            )}
            {activeNav === "plans" && (
              <HealthPlanView
                key={`plans-${activeMemberId ?? "none"}`}
                currentMemberName={activeMemberName}
              />
            )}
          </div>
        </div>
      </ProtectedRoute>
  )
}
