"use client"

import { useState } from "react"
import { HealthEventsList } from "@/components/health-events/health-events-list"
import { HealthEventsTimeline } from "@/components/health-events/health-events-timeline"
import { HealthEventsStats } from "@/components/health-events/health-events-stats"
import { HealthEventsActions } from "@/components/health-events/health-events-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventDialog } from "@/components/health-events/event-dialog"
import { HealthEvent } from "@/components/health-events/types"

export default function HealthEventsPage() {
  const [events, setEvents] = useState<HealthEvent[]>([
    {
      id: "1",
      title: "胃痛",
      description: "上腹部疼痛，进食后加重",
      date: new Date(2024, 2, 15),
      status: "active",
      nextFollowUp: new Date(2024, 3, 15),
      category: "digestive",
    },
    {
      id: "2",
      title: "感冒",
      description: "发热、咳嗽、流鼻涕",
      date: new Date(2024, 1, 20),
      status: "recovered",
      category: "respiratory",
    },
    {
      id: "3",
      title: "头痛",
      description: "持续性头痛，偶尔伴随头晕",
      date: new Date(2024, 2, 10),
      status: "active",
      nextFollowUp: new Date(2024, 3, 10),
      category: "neurological",
    },
    {
      id: "4",
      title: "腰扭伤",
      description: "弯腰时受伤，腰部疼痛",
      date: new Date(2023, 12, 5),
      status: "recovered",
      category: "orthopedic",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null)

  const handleAddEvent = () => {
    setEditingEvent(null)
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: HealthEvent) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const handleSaveEvent = (event: HealthEvent) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === event.id ? event : e)))
    } else {
      setEvents([...events, { ...event, id: Date.now().toString() }])
    }
    setIsDialogOpen(false)
  }

  const handleMarkResolved = (id: string) => {
    setEvents(
      events.map((e) =>
        e.id === id
          ? { ...e, status: "recovered" as const, nextFollowUp: undefined }
          : e
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with gradient background */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg dark:from-blue-700 dark:to-indigo-700">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">健康事件追踪</h1>
              <p className="text-blue-100 dark:text-blue-200">
                直观查看您的健康历程，管理医疗状态和跟进计划
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span>进行中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>已康复</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Button
            onClick={handleAddEvent}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增健康事件
          </Button>
          <HealthEventsActions events={events} />
        </div>

        {/* Statistics Cards */}
        <HealthEventsStats events={events} />

        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="list">列表视图</TabsTrigger>
            <TabsTrigger value="timeline">时间轴视图</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <HealthEventsList
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onMarkResolved={handleMarkResolved}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <HealthEventsTimeline
              events={events}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onMarkResolved={handleMarkResolved}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Dialog */}
      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={editingEvent}
        onSave={handleSaveEvent}
      />
    </div>
  )
}
