"use client"

import { useState } from "react"
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

const bpData = [
  { date: "1月", systolic: 138, diastolic: 90 },
  { date: "2月", systolic: 142, diastolic: 92 },
  { date: "3月", systolic: 136, diastolic: 88 },
  { date: "4月", systolic: 140, diastolic: 91 },
  { date: "5月", systolic: 135, diastolic: 88 },
  { date: "6月", systolic: 132, diastolic: 85 },
  { date: "7月", systolic: 130, diastolic: 84 },
  { date: "8月", systolic: 128, diastolic: 82 },
]

const glucoseData = [
  { date: "1月", fasting: 6.1, postprandial: 8.9 },
  { date: "2月", fasting: 5.9, postprandial: 8.5 },
  { date: "3月", fasting: 6.0, postprandial: 8.7 },
  { date: "4月", fasting: 5.7, postprandial: 8.3 },
  { date: "5月", fasting: 5.8, postprandial: 8.2 },
  { date: "6月", fasting: 5.6, postprandial: 7.9 },
  { date: "7月", fasting: 5.5, postprandial: 7.8 },
  { date: "8月", fasting: 5.4, postprandial: 7.6 },
]

const heartRateData = [
  { date: "1月", rate: 76 },
  { date: "2月", rate: 74 },
  { date: "3月", rate: 75 },
  { date: "4月", rate: 73 },
  { date: "5月", rate: 72 },
  { date: "6月", rate: 71 },
  { date: "7月", rate: 70 },
  { date: "8月", rate: 72 },
]

const uricAcidData = [
  { date: "1月", value: 420 },
  { date: "2月", value: 410 },
  { date: "3月", value: 405 },
  { date: "4月", value: 398 },
  { date: "5月", value: 390 },
  { date: "6月", value: 385 },
  { date: "7月", value: 382 },
  { date: "8月", value: 380 },
]

const tabs = [
  { id: "bp", label: "血压" },
  { id: "glucose", label: "血糖" },
  { id: "heart-rate", label: "心率" },
  { id: "uric-acid", label: "尿酸" },
]

// Compute colors in JS since CSS variables don't work directly in Recharts
const COLORS = {
  primary: "oklch(0.6 0.12 240)",
  secondary: "oklch(0.6 0.118 184.704)",
  accent1: "oklch(0.65 0.15 160)",
  accent2: "oklch(0.7 0.12 30)",
}

export function TrendCharts() {
  const [activeTab, setActiveTab] = useState("bp")

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
        {activeTab === "bp" && <BloodPressureChart />}
        {activeTab === "glucose" && <GlucoseChart />}
        {activeTab === "heart-rate" && <HeartRateChart />}
        {activeTab === "uric-acid" && <UricAcidChart />}
      </div>
    </section>
  )
}

function BloodPressureChart() {
  return (
    <ChartContainer
      config={{
        systolic: { label: "收缩压", color: COLORS.primary },
        diastolic: { label: "舒张压", color: COLORS.secondary },
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={bpData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[70, 160]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.primary }}
            activeDot={{ r: 5 }}
            name="收缩压"
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke={COLORS.secondary}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.secondary }}
            activeDot={{ r: 5 }}
            name="舒张压"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function GlucoseChart() {
  return (
    <ChartContainer
      config={{
        fasting: { label: "空腹血糖", color: COLORS.primary },
        postprandial: { label: "餐后2h血糖", color: COLORS.accent2 },
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={glucoseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="fastingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="postprandialGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.accent2} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.accent2} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[4, 10]} tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="fasting"
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#fastingGrad)"
            name="空腹血糖"
          />
          <Area
            type="monotone"
            dataKey="postprandial"
            stroke={COLORS.accent2}
            strokeWidth={2}
            fill="url(#postprandialGrad)"
            name="餐后2h血糖"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function HeartRateChart() {
  return (
    <ChartContainer
      config={{
        rate: { label: "静息心率", color: COLORS.accent1 },
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={heartRateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.accent1} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.accent1} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[60, 85]} tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="rate"
            stroke={COLORS.accent1}
            strokeWidth={2}
            fill="url(#heartGrad)"
            name="静息心率"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function UricAcidChart() {
  return (
    <ChartContainer
      config={{
        value: { label: "尿酸", color: COLORS.secondary },
      }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={uricAcidData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[350, 440]} tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COLORS.secondary}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS.secondary }}
            activeDot={{ r: 5 }}
            name="尿酸"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
