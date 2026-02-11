"use client"

import { useCallback, useRef, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { toast } from "sonner"
import { rpc } from "@/lib/orpc"
import type { KanbanStatus, Ticket } from "./types"
import { KANBAN_STATUSES } from "./types"
import { KanbanColumn } from "./kanban-column"
import { TicketCard } from "./ticket-card"
import { TicketDetailSheet } from "./ticket-detail-sheet"

export type KanbanBoardProps = {
  tickets: Ticket[]
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>
}

function groupByStatus(tickets: Ticket[]): Record<KanbanStatus, Ticket[]> {
  const groups = { todo: [] as Ticket[], "in-progress": [] as Ticket[], done: [] as Ticket[] }
  for (const t of tickets) {
    const status = (t.status in groups ? t.status : "todo") as KanbanStatus
    groups[status].push(t)
  }
  for (const status of KANBAN_STATUSES) {
    groups[status].sort((a, b) => a.sortOrder - b.sortOrder)
  }
  return groups
}

export function KanbanBoard({ tickets, setTickets }: KanbanBoardProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  // Keep a ref to tickets so dnd handlers can read current value
  // without needing to be in the useCallback dep array
  const ticketsRef = useRef(tickets)
  ticketsRef.current = tickets

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const ticket = ticketsRef.current.find((t) => t.id === String(event.active.id))
      setActiveTicket(ticket ?? null)
    },
    []
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || over.id === active.id) {
        setActiveTicket(null)
        return
      }
      const ticketId = String(active.id)
      const newStatus = KANBAN_STATUSES.includes(over.id as KanbanStatus) ? (over.id as KanbanStatus) : null
      if (!newStatus) {
        setActiveTicket(null)
        return
      }

      const current = ticketsRef.current
      const ticket = current.find((t) => t.id === ticketId)
      if (!ticket || ticket.status === newStatus) {
        setActiveTicket(null)
        return
      }

      const previousTickets = [...current]
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      )

      try {
        await rpc.tickets.updateStatus({ id: ticketId, status: newStatus })
      } catch {
        setTickets(previousTickets)
        toast.error("Failed to update ticket status")
      } finally {
        setActiveTicket(null)
      }
    },
    [setTickets]
  )

  const groups = groupByStatus(tickets)

  const handleTicketUpdated = useCallback(
    (updated: Ticket) => {
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setSelectedTicket((current) => (current?.id === updated.id ? updated : current))
    },
    [setTickets]
  )

  const handleTicketDeleted = useCallback(
    (id: string) => {
      setTickets((prev) => prev.filter((t) => t.id !== id))
      setSelectedTicket((current) => (current?.id === id ? null : current))
    },
    [setTickets]
  )

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={groups[status]}
              onTicketClick={setSelectedTicket}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTicket ? (
            <TicketCard ticket={activeTicket} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTicket && (
        <TicketDetailSheet
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onSaved={handleTicketUpdated}
          onDeleted={handleTicketDeleted}
        />
      )}
    </>
  )
}
