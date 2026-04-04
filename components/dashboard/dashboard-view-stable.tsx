"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronRight, Upload } from "lucide-react"
import { VitalsCards } from "./vitals-cards-stable"
import { ProfileLifestyle } from "./profile-lifestyle-stable"
import { TrendCharts } from "./trend-charts"
import { AiMemoryBase } from "./ai-memory"
import { ImportReportDialog } from "./import-report-dialog"
import { ensureActiveMemberId } from "@/lib/member"
import {
  getProfile,
  updateProfile,
  type Profile,
  type ProfileUpdatePayload,
} from "@/lib/profile-stable"
import { useToast } from "@/hooks/use-toast"

type DashboardViewProps = {
  currentMemberName: string
}

const TEXT = {
  loadFailed: "\u52a0\u8f7d\u6863\u6848\u5931\u8d25",
  saved: "\u5df2\u4fdd\u5b58",
  savedDescription: "\u5065\u5eb7\u6863\u6848\u5df2\u66f4\u65b0",
  saveFailed: "\u4fdd\u5b58\u5931\u8d25",
  dashboard: "\u5065\u5eb7\u4eea\u8868\u76d8",
  importReport: "\u5bfc\u5165\u4f53\u68c0\u62a5\u544a",
  invalidData: "\u6570\u636e\u683c\u5f0f\u4e0d\u6b63\u786e",
} as const

export function DashboardView({ currentMemberName }: DashboardViewProps) {
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
    } catch (error) {
      console.error(error)
      toast({
        title: TEXT.loadFailed,
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
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
      toast({ title: TEXT.saved, description: TEXT.savedDescription })
    } catch (error) {
      console.error(error)
      toast({
        title: TEXT.saveFailed,
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
      throw error
    } finally {
      setSaving(false)
    }
  }

  const showInvalidData = (message: string) => {
    toast({
      title: TEXT.invalidData,
      description: message,
      variant: "destructive",
    })
  }

  const handleImportSuccess = () => {
    window.setTimeout(() => {
      void loadProfile()
    }, 2500)

    window.setTimeout(() => {
      void loadProfile()
    }, 6000)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{currentMemberName}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{TEXT.dashboard}</span>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md"
          >
            <Upload className="h-4 w-4 text-primary" />
            {TEXT.importReport}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <VitalsCards
            profile={profile}
            loading={loading}
            saving={saving}
            onSave={handleUpdateProfile}
            onError={showInvalidData}
          />

          <ProfileLifestyle
            profile={profile}
            loading={loading}
            saving={saving}
            onUpdate={handleUpdateProfile}
            onError={showInvalidData}
          />

          <TrendCharts />
          <AiMemoryBase />
        </div>
      </div>

      <ImportReportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  )
}
