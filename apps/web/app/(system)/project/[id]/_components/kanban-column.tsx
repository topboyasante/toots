"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@workspace/ui/lib/utils"
import type { KanbanStatus, Ticket } from "./types"
import { STATUS_LABELS } from "./types"
import { DraggableTicketCard } from "./ticket-card"

export type KanbanColumnProps = {
  status: KanbanStatus
  tickets: Ticket[]
  onTicketClick: (ticket: Ticket) => void
}

export function KanbanColumn({ status, tickets, onTicketClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] flex-1 rounded-xl border bg-card text-card-foreground ring-1 ring-foreground/10",
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="shrink-0 py-3 px-4 border-b">
        <div className="text-sm font-medium flex items-center justify-between">
          {STATUS_LABELS[status]}
          <span className="text-muted-foreground font-normal">{tickets.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 gap-2 flex flex-col min-h-[120px] scrollbar-hide">
        {tickets.map((ticket) => (
          <DraggableTicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
        ))}
      </div>
    </div>
  )
}
