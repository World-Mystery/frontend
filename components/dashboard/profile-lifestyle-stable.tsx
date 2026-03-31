"use client"

import { useEffect, useState } from "react"
import { Check, Pencil, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Profile, ProfileUpdatePayload } from "@/lib/profile-stable"

type TagGroup = {
  id: string
  label: string
  tags: string[]
}

const TEXT = {
  edit: "\u7f16\u8f91",
  delete: "\u5220\u9664",
  add: "\u6dfb\u52a0...",
  create: "\u65b0\u589e",
  save: "\u4fdd\u5b58",
  cancel: "\u53d6\u6d88\u7f16\u8f91",
  empty: "\u6682\u65e0\u8bb0\u5f55",
  medicalTitle: "\u5065\u5eb7\u753b\u50cf",
  medicalSubtitle: "\u65e2\u5f80\u75c5\u53f2\u4e0e\u4e2d\u533b\u4f53\u8d28",
  lifestyleTitle: "\u751f\u6d3b\u4e60\u60ef",
  lifestyleSubtitle: "\u65e5\u5e38\u751f\u6d3b\u65b9\u5f0f\u8bb0\u5f55",
  allergy: "\u8fc7\u654f\u539f",
  chronic: "\u57fa\u7840\u75c5/\u6162\u6027\u75c5",
  family: "\u5bb6\u65cf\u75c5\u53f2",
  surgery: "\u65e2\u5f80\u624b\u672f\u53f2",
  tcm: "\u4e2d\u533b\u4f53\u8d28",
  smoking: "\u5438\u70df\u53f2",
  drinking: "\u996e\u9152\u53f2",
  sleep: "\u5e73\u5747\u7761\u7720\u65f6\u957f",
  sleepUnit: "\u5c0f\u65f6/\u5929",
  invalidSleep: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u7761\u7720\u65f6\u957f\u6570\u503c",
} as const

function EditableTagGroup({
  group,
  onUpdate,
  disabled,
  saving,
}: {
  group: TagGroup
  onUpdate: (id: string, tags: string[]) => Promise<void>
  disabled?: boolean
  saving?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tags, setTags] = useState(group.tags)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    setTags(group.tags)
  }, [group.tags])

  const handleSave = async () => {
    const trimmed = newTag.trim()
    const nextTags = trimmed && !tags.includes(trimmed) ? [...tags, trimmed] : tags

    await onUpdate(group.id, nextTags)
    setTags(nextTags)
    setNewTag("")
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTags(group.tags)
    setNewTag("")
    setIsEditing(false)
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed || tags.includes(trimmed)) {
      return
    }

    setTags((currentTags) => [...currentTags, trimmed])
    setNewTag("")
  }

  const handleRemoveTag = async (index: number) => {
    const previousTags = tags
    const nextTags = tags.filter((_, tagIndex) => tagIndex !== index)

    setTags(nextTags)
    try {
      await onUpdate(group.id, nextTags)
    } catch {
      setTags(previousTags)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleAddTag()
    }
    if (event.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div className="group flex items-start gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/40">
      <span className="w-28 shrink-0 pt-0.5 text-sm font-medium text-muted-foreground">
        {group.label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {isEditing ? (
          <>
            {tags.map((tag, index) => (
              <Badge key={`${group.id}-${tag}-${index}`} variant="secondary" className="gap-1 pr-1 text-xs">
                {tag}
                <button
                  onClick={() => {
                    void handleRemoveTag(index)
                  }}
                  disabled={saving}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`${TEXT.delete}${tag}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={TEXT.add}
                disabled={saving}
                className="h-6 w-24 rounded border border-border bg-background px-1.5 text-xs text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                disabled={saving}
                className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`${TEXT.create}${group.label}`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => {
                  void handleSave()
                }}
                disabled={saving}
                className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`${TEXT.save}${group.label}`}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`${TEXT.cancel}${group.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </>
        ) : (
          <>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Badge key={`${group.id}-${tag}-${index}`} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/60">{TEXT.empty}</span>
            )}
            <button
              onClick={() => setIsEditing(true)}
              disabled={disabled}
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all hover:bg-accent group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`${TEXT.edit}${group.label}`}
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

type ProfileLifestyleProps = {
  profile: Profile | null
  loading?: boolean
  saving?: boolean
  onUpdate: (payload: ProfileUpdatePayload) => Promise<void>
  onError?: (message: string) => void
}

export function ProfileLifestyle({
  profile,
  loading,
  saving,
  onUpdate,
  onError,
}: ProfileLifestyleProps) {
  const medicalGroups: TagGroup[] = [
    { id: "allergy", label: TEXT.allergy, tags: profile?.allergies ?? [] },
    { id: "chronic", label: TEXT.chronic, tags: profile?.chronicDiseases ?? [] },
    { id: "family", label: TEXT.family, tags: profile?.familyHistory ?? [] },
    { id: "surgery", label: TEXT.surgery, tags: profile?.pastSurgeries ?? [] },
    { id: "tcm", label: TEXT.tcm, tags: profile?.bodyConstitution ? [profile.bodyConstitution] : [] },
  ]

  const lifestyleGroups: TagGroup[] = [
    { id: "smoking", label: TEXT.smoking, tags: profile?.smokingStatus ? [profile.smokingStatus] : [] },
    { id: "drinking", label: TEXT.drinking, tags: profile?.drinkingStatus ? [profile.drinkingStatus] : [] },
    {
      id: "sleep",
      label: TEXT.sleep,
      tags:
        profile?.averageSleepHours === null || profile?.averageSleepHours === undefined
          ? []
          : [`${profile.averageSleepHours} ${TEXT.sleepUnit}`],
    },
  ]

  const handleUpdate = async (id: string, tags: string[]) => {
    const payload: ProfileUpdatePayload = {}

    switch (id) {
      case "allergy":
        payload.allergies = tags
        break
      case "chronic":
        payload.chronicDiseases = tags
        break
      case "family":
        payload.familyHistory = tags
        break
      case "surgery":
        payload.pastSurgeries = tags
        break
      case "tcm":
        payload.bodyConstitution = tags[0] ?? null
        break
      case "smoking":
        payload.smokingStatus = tags[0] ?? null
        break
      case "drinking":
        payload.drinkingStatus = tags[0] ?? null
        break
      case "sleep": {
        const raw = tags[0]
        if (!raw) {
          payload.averageSleepHours = null
          break
        }

        const numberValue = Number.parseFloat(raw)
        if (!Number.isFinite(numberValue)) {
          onError?.(TEXT.invalidSleep)
          return
        }

        payload.averageSleepHours = numberValue
        break
      }
      default:
        return
    }

    await onUpdate(payload)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{TEXT.medicalTitle}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{TEXT.medicalSubtitle}</p>
        </div>
        <div className="divide-y divide-border/30 px-2 py-1">
          {medicalGroups.map((group) => (
            <EditableTagGroup
              key={group.id}
              group={group}
              onUpdate={handleUpdate}
              disabled={loading || saving}
              saving={saving}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{TEXT.lifestyleTitle}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{TEXT.lifestyleSubtitle}</p>
        </div>
        <div className="divide-y divide-border/30 px-2 py-1">
          {lifestyleGroups.map((group) => (
            <EditableTagGroup
              key={group.id}
              group={group}
              onUpdate={handleUpdate}
              disabled={loading || saving}
              saving={saving}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
