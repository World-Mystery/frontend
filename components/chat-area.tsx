"use client"

import { Send, Paperclip, Sparkles, ArrowUp, Heart, Activity, Utensils, Dumbbell } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

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
    desc: "爸爸的血压偏高，有什么建议？",
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

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  const handleSend = (text?: string) => {
    const content = text || input.trim()
    if (!content) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(content),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmptyState = messages.length === 0

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Main scrollable area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isEmptyState ? (
          /* Empty state: centered greeting */
          <div className="flex min-h-full flex-col items-center justify-center px-6 pb-64">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/[0.07]">
              <Sparkles className="h-8 w-8 text-primary/80" />
            </div>
            <h1 className="mb-2 text-balance text-center text-2xl font-semibold tracking-tight text-foreground/90">
              {"你好，有什么可以帮你的？"}
            </h1>
            <p className="max-w-sm text-balance text-center text-sm leading-relaxed text-muted-foreground/80">
              {"我是你的健康助手，可以帮你分析体检报告、提供健康建议、制定康复计划"}
            </p>
          </div>
        ) : (
          /* Messages */
          <div className="mx-auto max-w-3xl px-6 pb-64 pt-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "mb-5 flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
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
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-5 flex justify-start">
                <div className="mr-3 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/[0.07]">
                  <Sparkles className="h-4 w-4 text-primary/70" />
                </div>
                <div className="py-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/30 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
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
              <div className="mb-4 grid grid-cols-4 gap-2.5">
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
            <div className="flex items-end gap-2 rounded-[20px] border border-border/50 bg-card px-4 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all focus-within:border-primary/25 focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
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
                className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent py-2 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={cn(
                  "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                  input.trim()
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                    : "text-muted-foreground/30"
                )}
                aria-label="发送消息"
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
            </div>

            <p className="mt-2.5 text-center text-[11px] text-muted-foreground/40">
              {"健康助手提供的信息仅供参考，不能替代专业医疗建议"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getSimulatedResponse(input: string): string {
  if (input.includes("体检") || input.includes("报告")) {
    return "我来帮你分析体检报告。请上传报告图片或告诉我具体的检查指标数值，我会为你逐项解读各项指标的含义，并给出相应的健康建议。常见需要关注的指标包括血压、血糖、血脂、肝肾功能等。"
  }
  if (input.includes("血压")) {
    return "高血压是一种需要长期管理的慢性疾病。建议：1) 每日定时测量血压并记录；2) 减少盐分摄入，每日不超过5克；3) 适当运动，如每天快走30分钟；4) 保证充足睡眠；5) 按医嘱规律服药。如果血压持续偏高，请及时就医。"
  }
  if (input.includes("运动") || input.includes("计划")) {
    return "为老年人制定运动计划需要考虑身体状况。建议方案：每周运动5天，每次30-45分钟。可以包括：1) 快走或慢跑；2) 太极拳或瑜伽；3) 轻度力量训练；4) 平衡训练。运动前做好热身，注意心率不超过最大心率的70%。如有心脑血管疾病，请先咨询医生。"
  }
  if (input.includes("食物") || input.includes("饮食") || input.includes("胆固醇")) {
    return "降低胆固醇的推荐食物：1) 燕麦和全谷物 - 富含可溶性纤维；2) 深海鱼类 - 富含Omega-3脂肪酸；3) 坚果类 - 如核桃、杏仁；4) 豆类 - 如黄豆、绿豆；5) 新鲜蔬果 - 特别是深色蔬菜。同时应减少油炸食品、动物内脏和高糖食品的摄入。"
  }
  return "感谢你的提问。作为你的健康助手，我可以帮你分析健康数据、解读体检报告、提供饮食和运动建议。请告诉我更多细节，我会给出更有针对性的建议。如有紧急情况，请直接就医。"
}
