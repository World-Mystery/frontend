"use client"

import { useCallback, useEffect, useState } from "react"
import { Upload, ChevronRight } from "lucide-react"
import { VitalsCards } from "./vitals-cards"
import { ProfileLifestyle } from "./profile-lifestyle"
import { TrendCharts } from "./trend-charts"
import { AiMemoryBase } from "./ai-memory-base"
import { ImportReportDialog } from "./import-report-dialog"
import { ensureActiveMemberId } from "@/lib/member"
import { getProfile, updateProfile, type ProfileUpdatePayload, type Profile } from "@/lib/profile"
import { useToast } from "@/hooks/use-toast"

export function DashboardView() {
  const [showImport, setShowImport] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const loadProfile = useCallback(async () => {
    try {
      await ensureActiveMemberId()
      const data = await getProfile()
      setProfile(data)
    } catch (err) {
      console.error(err)
      toast({ title: "加载档案失败", description: err instanceof Error ? err.message : String(err), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleUpdateProfile = async (payload: ProfileUpdatePayload) => {
    setSaving(true)
    try {
      const data = await updateProfile(payload)
      setProfile(data)
      toast({ title: "已保存", description: "健康档案已更新" })
    } catch (err) {
      console.error(err)
      toast({ title: "保存失败", description: err instanceof Error ? err.message : String(err), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{"妈妈"}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{"健康仪表盘"}</span>
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
          <VitalsCards
            profile={profile}
            loading={loading}
            saving={saving}
            onSave={handleUpdateProfile}
            onError={(msg) => toast({ title: "数据格式不正确", description: msg, variant: "destructive" })}
          />

          {/* Profile & Lifestyle */}
          <ProfileLifestyle
            profile={profile}
            loading={loading}
            saving={saving}
            onUpdate={handleUpdateProfile}
            onError={(msg) => toast({ title: "数据格式不正确", description: msg, variant: "destructive" })}
          />

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
