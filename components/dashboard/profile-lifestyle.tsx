"use client"

import { useState } from "react"
import { Pencil, Check, X, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagGroup {
  id: string
  label: string
  tags: string[]
}

const initialProfile: TagGroup[] = [
  { id: "allergy", label: "过敏原", tags: ["青霉素", "花粉"] },
  { id: "chronic", label: "基础病/慢性病", tags: ["高血压", "高血脂"] },
  { id: "family", label: "家族病史", tags: ["糖尿病", "冠心病"] },
  { id: "surgery", label: "既往手术史", tags: ["阑尾切除 (2015)"] },
  { id: "tcm", label: "中医体质", tags: ["气虚质", "偏寒"] },
]

const initialLifestyle: TagGroup[] = [
  { id: "smoking", label: "吸烟史", tags: ["已戒烟 3 年"] },
  { id: "drinking", label: "饮酒史", tags: ["偶尔少量"] },
  { id: "sleep", label: "平均睡眠时长", tags: ["6.5 小时/天"] },
]

function EditableTagGroup({
  group,
  onUpdate,
}: {
  group: TagGroup
  onUpdate: (id: string, tags: string[]) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tags, setTags] = useState(group.tags)
  const [newTag, setNewTag] = useState("")

  const handleSave = () => {
    onUpdate(group.id, tags)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTags(group.tags)
    setNewTag("")
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === "Escape") handleCancel()
  }

  return (
    <div className="group flex items-start gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/40">
      <span className="w-28 shrink-0 pt-0.5 text-sm font-medium text-muted-foreground">
        {group.label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {isEditing ? (
          <>
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(i)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="添加..."
                className="h-6 w-20 rounded border border-border bg-background px-1.5 text-xs text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={handleSave}
                className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={handleCancel}
                className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground transition-colors hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </>
        ) : (
          <>
            {tags.length > 0 ? (
              tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/60">暂无记录</span>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all hover:bg-accent group-hover:opacity-100"
              aria-label={`编辑${group.label}`}
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function ProfileLifestyle() {
  const [profile, setProfile] = useState(initialProfile)
  const [lifestyle, setLifestyle] = useState(initialLifestyle)

  const handleUpdateProfile = (id: string, tags: string[]) => {
    setProfile((prev) => prev.map((g) => (g.id === id ? { ...g, tags } : g)))
  }

  const handleUpdateLifestyle = (id: string, tags: string[]) => {
    setLifestyle((prev) => prev.map((g) => (g.id === id ? { ...g, tags } : g)))
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {/* Medical History */}
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">健康画像</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">既往病史与中医体质</p>
        </div>
        <div className="divide-y divide-border/30 px-2 py-1">
          {profile.map((group) => (
            <EditableTagGroup
              key={group.id}
              group={group}
              onUpdate={handleUpdateProfile}
            />
          ))}
        </div>
      </div>

      {/* Lifestyle */}
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">生活习惯</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">日常生活方式记录</p>
        </div>
        <div className="divide-y divide-border/30 px-2 py-1">
          {lifestyle.map((group) => (
            <EditableTagGroup
              key={group.id}
              group={group}
              onUpdate={handleUpdateLifestyle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
