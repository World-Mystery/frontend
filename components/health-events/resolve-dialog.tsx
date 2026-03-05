"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResolveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTitle: string
  onConfirm: (resolution: string) => void
}

export function ResolveDialog({
  open,
  onOpenChange,
  eventTitle,
  onConfirm,
}: ResolveDialogProps) {
  const [resolution, setResolution] = useState("")

  const handleConfirm = () => {
    onConfirm(resolution.trim() || "已康复")
    setResolution("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/[0.07]">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            标记为已康复
          </DialogTitle>
          <DialogDescription>
            {"将「"}{eventTitle}{"」标记为已康复/已解决。请记录最终结果。"}
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">
            结果记录
          </label>
          <input
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder="如：已停药，完全康复"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50"
            autoFocus
          />
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            确认康复
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
