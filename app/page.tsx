"use client"

import { TopNav } from "@/components/top-nav"
import { LeftSidebar } from "@/components/left-sidebar"
import { ChatArea } from "@/components/chat-area"
import { useState } from "react"

export default function Home() {
  const [chatKey, setChatKey] = useState(0)

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar onNewChat={handleNewChat} />
        <ChatArea key={chatKey} />
      </div>
    </div>
  )
}
