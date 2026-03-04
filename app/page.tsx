"use client"

import { TopNav } from "@/components/top-nav"
import { LeftSidebar } from "@/components/left-sidebar"
import { ChatArea } from "@/components/chat-area"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { useState } from "react"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [activeNav, setActiveNav] = useState("qa")

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1)
    setActiveNav("qa")
  }

  return (
    <div className="flex h-screen flex-col">
      <TopNav activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="flex flex-1 overflow-hidden">
        {activeNav === "qa" && <LeftSidebar onNewChat={handleNewChat} />}
        {activeNav === "qa" && <ChatArea key={chatKey} />}
        {activeNav === "dashboard" && <DashboardView />}
      </div>
    </div>
  )
}
