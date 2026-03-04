"use client"

import { useState } from "react"
import { Upload, ChevronRight } from "lucide-react"
import { VitalsCards } from "./vitals-cards"
import { ProfileLifestyle } from "./profile-lifestyle"
import { TrendCharts } from "./trend-charts"
import { AiMemoryBase } from "./ai-memory-base"
import { ImportReportDialog } from "./import-report-dialog"

export function DashboardView() {
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>{"妈妈"}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{"健康仪表盘"}</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">健康仪表盘</h1>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md"
          >
            <Upload className="h-4 w-4 text-primary" />
            导入体检报告
          </button>
        </div>

        {/* Dashboard Sections */}
        <div className="flex flex-col gap-6">
          {/* Vitals */}
          <VitalsCards />

          {/* Profile & Lifestyle */}
          <ProfileLifestyle />

          {/* Trend Charts */}
          <TrendCharts />

          {/* AI Memory Base */}
          <AiMemoryBase />
        </div>
      </div>

      <ImportReportDialog open={showImport} onOpenChange={setShowImport} />
    </div>
  )
}
