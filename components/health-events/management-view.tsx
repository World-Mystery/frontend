"use client"

import { HealthEvent } from "./types"
import { EventCard } from "./event-card"
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface ManagementViewProps {
  events: HealthEvent[]
  onEdit: (event: HealthEvent) => void
  onDelete: (id: string) => void
  onMarkResolved: (id: string) => void
}

export function ManagementView({
  events,
  onEdit,
  onDelete,
  onMarkResolved,
}: ManagementViewProps) {
  const activeEvents = events.filter((e) => e.status === "active")
  const recoveredEvents = events.filter((e) => e.status === "recovered")

  return (
    <div className="flex flex-col gap-8">
      {/* Active Events Section */}
      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/[0.07]">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            {"进行中"}
          </h2>
          <span className="rounded-md bg-red-500/[0.07] px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
            {activeEvents.length}
          </span>
        </div>
        {activeEvents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onMarkResolved={onMarkResolved}
              />
            ))}
          </div>
        ) : (
          <EmptySection message="暂无进行中的健康事件" />
        )}
      </section>

      {/* Recovered Events Section */}
      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/[0.07]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            {"已康复 / 归档"}
          </h2>
          <span className="rounded-md bg-emerald-500/[0.07] px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {recoveredEvents.length}
          </span>
        </div>
        {recoveredEvents.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recoveredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onMarkResolved={onMarkResolved}
              />
            ))}
          </div>
        ) : (
          <EmptySection message="暂无归档的健康事件" />
        )}
      </section>
    </div>
  )
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-card/50 py-10">
      <Inbox className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
