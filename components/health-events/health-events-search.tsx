"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { categoryLabels } from "./types"

interface HealthEventsSearchProps {
  onSearchChange: (query: string) => void
  onCategoryChange: (category: string) => void
  onStatusChange: (status: string) => void
  searchQuery: string
  selectedCategory: string
  selectedStatus: string
}

export function HealthEventsSearch({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  searchQuery,
  selectedCategory,
  selectedStatus,
}: HealthEventsSearchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters =
    searchQuery || selectedCategory !== "all" || selectedStatus !== "all"

  const handleReset = () => {
    onSearchChange("")
    onCategoryChange("all")
    onStatusChange("all")
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="搜索事件名称或描述..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 dark:bg-slate-800 dark:border-slate-700"
        />
      </div>

      {/* Filters */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
              <SelectValue placeholder="筛选分类" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all">所有分类</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="active">进行中</SelectItem>
              <SelectItem value="recovered">已康复</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filter toggle and reset */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="dark:border-slate-700 dark:bg-slate-800"
        >
          {isOpen ? "隐藏" : "显示"}筛选
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4 mr-1" />
            重置筛选
          </Button>
        )}
      </div>
    </div>
  )
}
