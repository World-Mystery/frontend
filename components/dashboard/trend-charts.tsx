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
  ReferenceLine,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// 血压数据 - 一个月内（按日为锚点）
const bpData = Array.from({ length: 30 }, (_, i) => ({
  date: (i + 1) % 3 === 1 ? `${i + 1}日` : "",  // 隔两天标注一次
  systolic: 120 + Math.floor(Math.random() * 20),
  diastolic: 75 + Math.floor(Math.random() * 15),
}))

// 血糖 - 24小时数据
const glucoseHourlyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  glucose: 5.5 + Math.random() * 3,
}))

// 血糖 - 月视图数据（按天为锚点）
const glucoseMonthlyData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}日`,
  glucose: 5.5 + Math.random() * 2.5,
}))

// 心率 - 24小时数据
const heartRateHourlyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  rate: 65 + Math.floor(Math.random() * 25),
}))

// 心率 - 月视图数据（按天为锚点）
const heartRateMonthlyData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}日`,
  rate: 70 + Math.floor(Math.random() * 15),
}))

// 体重和BMI - 一年数据（按月为锚点）
const weightBMIData = [
  { month: "1月", weight: 74, bmi: 24.9 },
  { month: "2月", weight: 73.5, bmi: 24.7 },
  { month: "3月", weight: 73, bmi: 24.6 },
  { month: "4月", weight: 72.5, bmi: 24.4 },
  { month: "5月", weight: 72, bmi: 24.3 },
  { month: "6月", weight: 71.5, bmi: 24.1 },
  { month: "7月", weight: 71, bmi: 23.9 },
  { month: "8月", weight: 70.5, bmi: 23.8 },
  { month: "9月", weight: 70, bmi: 23.6 },
  { month: "10月", weight: 70.5, bmi: 23.8 },
  { month: "11月", weight: 71, bmi: 23.9 },
  { month: "12月", weight: 72, bmi: 24.3 },
]

const tabs = [
  { id: "bp", label: "血压" },
  { id: "glucose", label: "血糖" },
  { id: "heart-rate", label: "心率" },
  { id: "weight-bmi", label: "体重和BMI" },
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
        {activeTab === "weight-bmi" && <WeightBMIChart />}
      </div>
    </section>
  )
}

function BloodPressureChart() {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>正常范围: 收缩压 90-120 mmHg | 舒张压 60-80 mmHg</p>
      </div>
      <div className="overflow-x-auto">
        <ChartContainer
          config={{
            systolic: { label: "收缩压", color: COLORS.primary },
            diastolic: { label: "舒张压", color: COLORS.secondary },
          }}
          className="h-[280px] min-w-[900px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bpData} margin={{ top: 5, right: 75, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[50, 150]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {/* 正常范围参考线 */}
              <ReferenceLine y={120} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "收缩压上限", position: "right", offset: 20, fill: "#22c55e", fontSize: 11 }} />
              <ReferenceLine y={90} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "收缩压下限", position: "right", offset: 20, fill: "#22c55e", fontSize: 11 }} />
              <ReferenceLine y={80} stroke="rgba(59, 130, 246, 0.3)" strokeDasharray="5 5" label={{ value: "舒张压上限", position: "right", offset: 20, fill: "#3b82f6", fontSize: 11 }} />
              <ReferenceLine y={60} stroke="rgba(59, 130, 246, 0.3)" strokeDasharray="5 5" label={{ value: "舒张压下限", position: "right", offset: 20, fill: "#3b82f6", fontSize: 11 }} />
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
      </div>
    </div>
  )
}

function GlucoseChart() {
  const [glucoseView, setGlucoseView] = useState<"daily" | "monthly">("daily")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <p>正常范围: 3.9-6.1 mmol/L (空腹) | 7.8 mmol/L以下 (餐后2h)</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => setGlucoseView("daily")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              glucoseView === "daily"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            24小时
          </button>
          <button
            onClick={() => setGlucoseView("monthly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              glucoseView === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            月视图
          </button>
        </div>
      </div>
      <ChartContainer
        config={{
          glucose: { label: "血糖", color: COLORS.primary },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={glucoseView === "daily" ? glucoseHourlyData : glucoseMonthlyData}
            margin={{ top: 20, right: 20, left: 60, bottom: 5 }}
          >
            <defs>
              <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey={glucoseView === "daily" ? "time" : "date"}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[3, 10]} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* 正常范围参考线 */}
            <ReferenceLine y={6.1} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常上限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
            <ReferenceLine y={3.9} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常下限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="glucose"
              stroke={COLORS.primary}
              strokeWidth={2}
              fill="url(#glucoseGrad)"
              name="血糖"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

function HeartRateChart() {
  const [heartRateView, setHeartRateView] = useState<"daily" | "monthly">("daily")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <p>正常范围: 60-100 bpm</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => setHeartRateView("daily")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              heartRateView === "daily"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            24小时
          </button>
          <button
            onClick={() => setHeartRateView("monthly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              heartRateView === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            月视图
          </button>
        </div>
      </div>
      <ChartContainer
        config={{
          rate: { label: "心率", color: COLORS.accent1 },
        }}
        className="h-[280px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={heartRateView === "daily" ? heartRateHourlyData : heartRateMonthlyData}
            margin={{ top: 20, right: 20, left: 60, bottom: 5 }}
          >
            <defs>
              <linearGradient id="heartRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent1} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.accent1} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis
              dataKey={heartRateView === "daily" ? "time" : "date"}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[50, 110]} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* 正常范围参考线 */}
            <ReferenceLine y={100} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常上限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
            <ReferenceLine y={60} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常下限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="rate"
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

function WeightBMIChart() {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <p>正常范围: BMI 18.5-24.9 kg/m²</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* 体重图表 */}
        <ChartContainer
          config={{
            weight: { label: "体重", color: COLORS.primary },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightBMIData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[68, 76]} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.primary }}
                activeDot={{ r: 5 }}
                name="体重(kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* BMI图表 */}
        <ChartContainer
          config={{
            bmi: { label: "BMI", color: COLORS.secondary },
          }}
          className="h-[280px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightBMIData} margin={{ top: 20, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[23, 26]} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {/* 正常范围参考线 */}
              <ReferenceLine y={24.9} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常上限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
              <ReferenceLine y={18.5} stroke="rgba(34, 197, 94, 0.3)" strokeDasharray="5 5" label={{ value: "正常下限", position: "left", offset: 10, fill: "#22c55e", fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="bmi"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.secondary }}
                activeDot={{ r: 5 }}
                name="BMI(kg/m²)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
