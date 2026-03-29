"use client"

import { Send, Paperclip, Sparkles, Heart, Activity, Utensils, Dumbbell } from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ensureActiveMemberId } from "@/lib/member"
import { streamAiChat } from "@/lib/ai-chat"
import { addChatHistory, listChatHistory } from "@/lib/chat-history"
import { addChatSession } from "@/lib/chat-session"
import { ChatMarkdown } from "@/components/chat-markdown"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const welcomeSuggestions = [
  {
    icon: Heart,
    title: "分析体检报告",
    desc: "帮我分析妈妈的体检报告",
  },
  {
    icon: Activity,
    title: "血压管理建议",
    desc: "爸爸的血压偏高，有什么建议吗？",
  },
  {
    icon: Dumbbell,
    title: "运动计划",
    desc: "制定适合老年人的运动计划",
  },
  {
    icon: Utensils,
    title: "饮食建议",
    desc: "介绍一些降低胆固醇的食物",
  },
]

type ChatAreaProps = {
  sessionId: number | null
  onSessionCreated?: (sessionId: number) => void
}

export function ChatArea({ sessionId, onSessionCreated }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const skipHistoryLoadSessionRef = useRef<number | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px"
    }
  }, [input])

  useEffect(() => {
    let cancelled = false
    const loadHistory = async () => {
      if (!sessionId) {
        setMessages([])
        setIsTyping(false)
        return
      }
      if (skipHistoryLoadSessionRef.current === sessionId) {
        skipHistoryLoadSessionRef.current = null
        return
      }
      try {
        const items = await listChatHistory(sessionId)
        if (cancelled) return
        let previousRole: Message["role"] | null = null
        setMessages(
          items.map((item) => ({
            id: String(item.id),
            role: (() => {
              const storedRole: Message["role"] = item.role === "assistant" ? "assistant" : "user"
              const normalizedRole =
                storedRole === "assistant"
                  ? "assistant"
                  : previousRole === "user"
                    ? "assistant"
                    : "user"
              previousRole = normalizedRole
              return normalizedRole
            })(),
            content: item.message ?? "",
          }))
        )
      } catch (error) {
        if (!cancelled) {
          setMessages([])
        }
      } finally {
        if (!cancelled) setIsTyping(false)
      }
    }
    void loadHistory()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const handleSend = async (text?: string) => {
    const content = text || input.trim()
    if (!content || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }

    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput("")
    setIsTyping(true)

    try {
      const memberId = await ensureActiveMemberId()
      if (!memberId) {
        throw new Error("Missing memberId")
      }

      let currentSessionId: number | undefined = sessionId ?? undefined
      if (!currentSessionId) {
        currentSessionId = await addChatSession()
        if (!currentSessionId) {
          throw new Error("Failed to create session")
        }
        skipHistoryLoadSessionRef.current = currentSessionId
        onSessionCreated?.(currentSessionId)
      }

      await addChatHistory(currentSessionId, content, "user")

      await streamAiChat({
        message: content,
        memberId,
        sessionId: currentSessionId,
        onDelta: (delta) => {
          setMessages((prev) =>
              prev.map((msg) =>
                  msg.id === assistantId
                      ? { ...msg, content: msg.content + delta }
                      : msg
              )
          )
        },
      })
    } catch (error) {
      setMessages((prev) =>
          prev.map((msg) =>
              msg.id === assistantId
                  ? { ...msg, content: "AI 响应失败，请稍后再试。" }
                  : msg
          )
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmptyState = messages.length === 0
  const latestAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "assistant") return messages[i]?.id
    }
    return undefined
  }, [messages])

  return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Main scrollable area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {isEmptyState ? (
              /* Empty state: centered greeting */
              <div className="flex min-h-full flex-col items-center justify-center px-6 pb-64">
                <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/[0.07]">
                  <Sparkles className="h-8 w-8 text-primary/80" />
                </div>
                <h1 className="mb-2 text-balance text-center text-2xl font-semibold tracking-tight text-foreground/90">
                  {"你好，有什么可以帮你的吗？"}
                </h1>
                <p className="max-w-sm text-balance text-center text-sm leading-relaxed text-muted-foreground/80">
                  {"我是你的健康助手，可以帮你分析体检报告、提供健康建议、制定康复计划。"}
                </p>
              </div>
          ) : (
              /* Messages */
              <div className="mx-auto max-w-3xl px-6 pb-64 pt-6">
                {messages.map((msg) => {
                  const isAssistant = msg.role === "assistant"
                  const isLatestAssistant = isAssistant && msg.id === latestAssistantId
                  const showTypingDots = isLatestAssistant && isTyping && msg.content.length === 0

                  return (
                      <div
                          key={msg.id}
                          className={cn(
                              "mb-5 flex",
                              msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                      >
                        {isAssistant && (
                            <div className="mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.07]">
                              <Sparkles className="h-4 w-4 text-primary/70" />
                            </div>
                        )}
                        <div
                            className={cn(
                                "max-w-[78%] text-[14.5px] leading-[1.65]",
                                msg.role === "user"
                                    ? "rounded-[20px] rounded-br-md bg-primary/[0.08] px-5 py-3 text-foreground"
                                    : "text-foreground/90"
                            )}
                        >
                          {isAssistant ? (
                              <div>
                                {showTypingDots ? (
                                    <div className="flex items-center gap-1 py-1">
                                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:0ms]" />
                                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:150ms]" />
                                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:300ms]" />
                                    </div>
                                ) : (
                                    <ChatMarkdown content={msg.content} />
                                )}
                              </div>
                          ) : (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
          )}
        </div>

        {/* Bottom floating area with gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col">
          {/* Gradient fade overlay - only when there are messages */}
          {!isEmptyState && (
              <div className="h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
          )}

          {/* Suggestion chips + input area */}
          <div className="pointer-events-auto bg-background pb-5">
            <div className="mx-auto max-w-3xl px-6">
              {/* Suggestion cards - only visible when no messages */}
              {isEmptyState && (
                  <div className="mb-10 grid grid-cols-4 gap-2.5">
                    {welcomeSuggestions.map((s) => {
                      const Icon = s.icon
                      return (
                          <button
                              key={s.title}
                              onClick={() => handleSend(s.desc)}
                              className="group flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card/80 px-4 pb-4 pt-3.5 text-left backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-primary/[0.03] hover:shadow-sm"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/[0.06] transition-colors group-hover:bg-primary/[0.1]">
                              <Icon className="h-4 w-4 text-primary/60 transition-colors group-hover:text-primary/80" />
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground/90">
                                {s.title}
                              </p>
                              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground/60">
                                {s.desc}
                              </p>
                            </div>
                          </button>
                      )
                    })}
                  </div>
              )}

              {/* Input bar */}
              <div className="flex items-end gap-2 rounded-[20px] border border-border/50 bg-card px-4 pt-4 pb-2 shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all focus-within:border-primary/25 focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <button
                    className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-accent/60"
                    aria-label="添加附件"
                >
                  <Paperclip className="h-[18px] w-[18px] text-muted-foreground/50" />
                </button>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入你的健康问题..."
                    rows={2}
                    className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent pt-1.5 pb-14 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
                />

                <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center btn-bubble disabled:opacity-50"
                    aria-label="发送"
                >
                  <Send className="h-4 w-4 text-sky-900" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}




