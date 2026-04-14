export type BlockCategory = "meal" | "exercise" | "rest" | "medication" | "checkup" | "custom"

export interface ScheduleBlock {
  id: string
  startTime: string
  endTime: string
  title: string
  category: BlockCategory
  details: string[]
  aiGenerated: boolean
}

export interface AiFeedback {
  type: "warning" | "suggestion" | "positive"
  message: string
}

export const categoryMeta: Record<
  BlockCategory,
  { label: string; color: string; bgLight: string; bgDot: string; textColor: string }
> = {
  meal: {
    label: "\u996e\u98df",
    color: "bg-amber-500",
    bgLight: "bg-amber-500/[0.07]",
    bgDot: "bg-amber-400",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  exercise: {
    label: "\u8fd0\u52a8",
    color: "bg-blue-500",
    bgLight: "bg-blue-500/[0.07]",
    bgDot: "bg-blue-400",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  rest: {
    label: "\u4f11\u606f",
    color: "bg-emerald-500",
    bgLight: "bg-emerald-500/[0.07]",
    bgDot: "bg-emerald-400",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  medication: {
    label: "\u7528\u836f",
    color: "bg-violet-500",
    bgLight: "bg-violet-500/[0.07]",
    bgDot: "bg-violet-400",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  checkup: {
    label: "\u68c0\u67e5",
    color: "bg-rose-500",
    bgLight: "bg-rose-500/[0.07]",
    bgDot: "bg-rose-400",
    textColor: "text-rose-600 dark:text-rose-400",
  },
  custom: {
    label: "\u81ea\u5b9a\u4e49",
    color: "bg-slate-500",
    bgLight: "bg-slate-500/[0.07]",
    bgDot: "bg-slate-400",
    textColor: "text-slate-600 dark:text-slate-400",
  },
}
