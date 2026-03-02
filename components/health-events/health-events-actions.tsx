"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, Printer, MoreVertical } from "lucide-react"
import { HealthEvent } from "./types"
import { formatDate } from "./utils"

interface HealthEventsActionsProps {
  events: HealthEvent[]
}

export function HealthEventsActions({ events }: HealthEventsActionsProps) {
  const handleExportCSV = () => {
    const headers = ["事件名称", "分类", "发生日期", "状态", "下次跟进", "描述"]
    const rows = events.map((event) => [
      event.title,
      event.category,
      formatDate(event.date),
      event.status === "active" ? "进行中" : "已康复",
      event.nextFollowUp ? formatDate(event.nextFollowUp) : "-",
      event.description,
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `health-events-${formatDate(new Date())}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="dark:border-slate-700 dark:bg-slate-800"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-slate-800">
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="cursor-pointer dark:hover:bg-slate-700"
        >
          <Download className="w-4 h-4 mr-2" />
          导出为 CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem
          onClick={handlePrint}
          className="cursor-pointer dark:hover:bg-slate-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          打印
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
