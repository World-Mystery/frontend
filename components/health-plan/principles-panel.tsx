"use client"

import { useState } from "react"
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Droplets,
  Fish,
  Apple,
  Beef,
  Wine,
  Cigarette,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Principle {
  id: string
  text: string
  icon: React.ElementType
  detail?: string
}

interface PrincipleGroup {
  level: "green" | "yellow" | "red"
  label: string
  sublabel: string
  icon: React.ElementType
  items: Principle[]
}

const principleGroups: PrincipleGroup[] = [
  {
    level: "green",
    label: "鼓励",
    sublabel: "坚持这些好习惯",
    icon: ShieldCheck,
    items: [
      { id: "g1", text: "每日饮水 2000ml", icon: Droplets, detail: "少量多次，避免一次大量饮水" },
      { id: "g2", text: "多摄入深海鱼", icon: Fish, detail: "富含 Omega-3，每周 2-3 次" },
      { id: "g3", text: "每日蔬果 500g", icon: Apple, detail: "深色蔬菜占一半以上" },
      { id: "g4", text: "规律作息 22:30 前入睡", icon: ShieldCheck, detail: "充足睡眠有助于血压稳定" },
    ],
  },
  {
    level: "yellow",
    label: "适量",
    sublabel: "注意控制量和频率",
    icon: ShieldAlert,
    items: [
      { id: "y1", text: "红肉每周不超过两次", icon: Beef, detail: "优选瘦肉，每次不超过 100g" },
      { id: "y2", text: "鸡蛋每日不超过 1 个", icon: ShieldAlert, detail: "胆固醇偏高时需控制蛋黄" },
      { id: "y3", text: "食盐每日 < 5g", icon: ShieldAlert, detail: "高血压患者低盐饮食核心" },
      { id: "y4", text: "咖啡每日不超过 1 杯", icon: ShieldAlert, detail: "避免下午 3 点后饮用" },
    ],
  },
  {
    level: "red",
    label: "避免",
    sublabel: "对当前健康状况有害",
    icon: ShieldX,
    items: [
      { id: "r1", text: "绝对禁酒", icon: Wine, detail: "高血压 + 高血脂，酒精会加重肝脏负担" },
      { id: "r2", text: "避免动物内脏", icon: ShieldX, detail: "嘌呤和胆固醇极高，诱发痛风" },
      { id: "r3", text: "远离腌制食品", icon: ShieldX, detail: "含盐量极高，加重高血压" },
      { id: "r4", text: "禁止吸烟环境", icon: Cigarette, detail: "二手烟同样损伤血管内皮" },
    ],
  },
]

const levelStyles = {
  green: {
    border: "border-emerald-200 dark:border-emerald-900/40",
    bg: "bg-emerald-500/[0.04]",
    headerBg: "bg-emerald-500/[0.07]",
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  yellow: {
    border: "border-amber-200 dark:border-amber-900/40",
    bg: "bg-amber-500/[0.04]",
    headerBg: "bg-amber-500/[0.07]",
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  red: {
    border: "border-red-200 dark:border-red-900/40",
    bg: "bg-red-500/[0.04]",
    headerBg: "bg-red-500/[0.07]",
    dot: "bg-red-500",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
}

function PrincipleCard({ group }: { group: PrincipleGroup }) {
  const [expanded, setExpanded] = useState(true)
  const style = levelStyles[group.level]
  const GroupIcon = group.icon

  return (
    <div className={cn("rounded-xl border overflow-hidden", style.border)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors",
          style.headerBg
        )}
      >
        <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", style.badge)}>
          <GroupIcon className={cn("h-3.5 w-3.5", style.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm font-semibold", style.text)}>{group.label}</span>
          <span className="ml-2 text-[11px] text-muted-foreground">{group.sublabel}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Items */}
      {expanded && (
        <div className={cn("px-3 py-2", style.bg)}>
          {group.items.map((item) => {
            const ItemIcon = item.icon
            return (
              <div
                key={item.id}
                className="group flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-card/60"
              >
                <div className={cn("mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                  {item.detail && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PrinciplesPanel() {
  return (
    <div className="sticky top-6 flex flex-col gap-4">
      {/* Section Title */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/[0.07]">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">健康原则</h2>
          <p className="text-[11px] text-muted-foreground">基于体检数据生成</p>
        </div>
      </div>

      {/* Principle Cards */}
      {principleGroups.map((group) => (
        <PrincipleCard key={group.level} group={group} />
      ))}
    </div>
  )
}
