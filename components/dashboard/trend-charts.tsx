"use client"

import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { ensureActiveMemberId } from "@/lib/member"
import { getVitalsChart, type GraphDTO } from "@/lib/vitals"

type SingleSeriesPoint = { time: string; value: number | null }
type HrvSeriesPoint = {
  time: string
  sdann: number | null
  rmssd: number | null
  nn50: number | null
  pnn50: number | null
}

const tabs = [
  { id: "heart-rate", label: "心率" },
  { id: "blood-oxygen", label: "血氧" },
  { id: "microcirculation", label: "微循环" },
  { id: "hrv", label: "心脏指标" },
]

// Compute colors in JS since CSS variables don't work directly in Recharts
const COLORS = {
  primary: "oklch(0.6 0.12 240)",
  secondary: "oklch(0.6 0.118 184.704)",
  accent1: "oklch(0.65 0.15 160)",
  accent2: "oklch(0.7 0.12 30)",
}

export function TrendCharts() {
  const [activeTab, setActiveTab] = useState("heart-rate")
  const [graphData, setGraphData] = useState<GraphDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        await ensureActiveMemberId()
        const data = await getVitalsChart()
        setGraphData(data)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "加载失败")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const timeAxis = useMemo(() => graphData?.timeAxis ?? [], [graphData])
  const heartRateSeries = useMemo(
    () => mapSingleSeries(timeAxis, graphData?.heartRateData),
    [graphData?.heartRateData, timeAxis]
  )
  const bloodOxygenSeries = useMemo(
    () => mapSingleSeries(timeAxis, graphData?.bloodOxygenData),
    [graphData?.bloodOxygenData, timeAxis]
  )
  const microcirculationSeries = useMemo(
    () => mapSingleSeries(timeAxis, graphData?.microcirculationData),
    [graphData?.microcirculationData, timeAxis]
  )
  const hrvSeries = useMemo(() => mapHrvSeries(graphData), [graphData])

  return (
    <section className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">趋势可视化</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            核心指标随时间变化趋势
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {error && <p className="mb-3 text-xs text-destructive">数据加载失败：{error}</p>}
        {!error && loading && (
          <p className="mb-3 text-xs text-muted-foreground">数据加载中...</p>
        )}
        {activeTab === "heart-rate" && (
          <HeartRateChart data={heartRateSeries} loading={loading} />
        )}
        {activeTab === "blood-oxygen" && (
          <BloodOxygenChart data={bloodOxygenSeries} loading={loading} />
        )}
        {activeTab === "microcirculation" && (
          <MicrocirculationChart data={microcirculationSeries} loading={loading} />
        )}
        {activeTab === "hrv" && <HrvChart data={hrvSeries} loading={loading} />}
      </div>
    </section>
  )
}

function HeartRateChart({ data, loading }: { data: SingleSeriesPoint[]; loading: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>正常范围: 60-100 bpm</p>
        {loading && <p className="mt-1">数据加载中...</p>}
        {!loading && data.length === 0 && <p className="mt-1">暂无数据</p>}
      </div>
      <ChartContainer
        config={{
          value: { label: "心率", color: COLORS.accent1 },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 60, bottom: 5 }}>
            <defs>
              <linearGradient id="heartRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent1} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.accent1} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis domain={[50, 120]} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.accent1}
              strokeWidth={2}
              fill="url(#heartRateGrad)"
              name="心率"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

function BloodOxygenChart({ data, loading }: { data: SingleSeriesPoint[]; loading: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>正常范围: 95%-100%</p>
        {loading && <p className="mt-1">数据加载中...</p>}
        {!loading && data.length === 0 && <p className="mt-1">暂无数据</p>}
      </div>
      <ChartContainer
        config={{
          value: { label: "血氧", color: COLORS.primary },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 60, bottom: 5 }}>
            <defs>
              <linearGradient id="bloodOxygenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2}
              fill="url(#bloodOxygenGrad)"
              name="血氧"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

function MicrocirculationChart({ data, loading }: { data: SingleSeriesPoint[]; loading: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>微循环监测</p>
        {loading && <p className="mt-1">数据加载中...</p>}
        {!loading && data.length === 0 && <p className="mt-1">暂无数据</p>}
      </div>
      <ChartContainer
        config={{
          value: { label: "微循环", color: COLORS.secondary },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 60, bottom: 5 }}>
            <defs>
              <linearGradient id="microGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.secondary}
              strokeWidth={2}
              fill="url(#microGrad)"
              name="微循环"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

function HrvChart({ data, loading }: { data: HrvSeriesPoint[]; loading: boolean }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>HRV 指标 (SDANN / RMSSD / NN50 / pNN50)</p>
        {loading && <p className="mt-1">数据加载中...</p>}
        {!loading && data.length === 0 && <p className="mt-1">暂无数据</p>}
      </div>
      <ChartContainer
        config={{
          sdann: { label: "SDANN", color: COLORS.primary },
          rmssd: { label: "RMSSD", color: COLORS.secondary },
          nn50: { label: "NN50", color: COLORS.accent1 },
          pnn50: { label: "pNN50", color: COLORS.accent2 },
        }}
        className="h-[320px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="sdann"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS.primary }}
              activeDot={{ r: 5 }}
              name="SDANN"
            />
            <Line
              type="monotone"
              dataKey="rmssd"
              stroke={COLORS.secondary}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS.secondary }}
              activeDot={{ r: 5 }}
              name="RMSSD"
            />
            <Line
              type="monotone"
              dataKey="nn50"
              stroke={COLORS.accent1}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS.accent1 }}
              activeDot={{ r: 5 }}
              name="NN50"
            />
            <Line
              type="monotone"
              dataKey="pnn50"
              stroke={COLORS.accent2}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS.accent2 }}
              activeDot={{ r: 5 }}
              name="pNN50"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

function mapSingleSeries(
  times: string[],
  values?: (number | null | undefined)[]
): SingleSeriesPoint[] {
  return times.map((time, idx) => ({
    time,
    value: values?.[idx] ?? null,
  }))
}

function mapHrvSeries(data: GraphDTO | null): HrvSeriesPoint[] {
  const times = data?.timeAxis ?? []
  const sdann = data?.sdannData ?? []
  const rmssd = data?.rmssdData ?? []
  const nn50 = data?.nn50Data ?? []
  const pnn50 = data?.pnn50Data ?? []

  return times.map((time, idx) => ({
    time,
    sdann: sdann?.[idx] ?? null,
    rmssd: rmssd?.[idx] ?? null,
    nn50: nn50?.[idx] ?? null,
    pnn50: pnn50?.[idx] ?? null,
  }))
}

