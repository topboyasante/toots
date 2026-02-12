"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@workspace/ui/lib/utils"
import type { KanbanStatus, Ticket } from "./types"
import { STATUS_LABELS } from "./types"

const STATUS_DOT_CLASS: Record<KanbanStatus, string> = {
  todo: "bg-muted-foreground/50",
  "in-progress": "bg-amber-500",
  done: "bg-emerald-500",
}
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
        "flex flex-col min-w-[280px] flex-1 rounded-xl bg-muted/40 border border-border text-card-foreground",
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="shrink-0 py-3 px-4">
        <div className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status])} aria-hidden />
            {STATUS_LABELS[status]}
          </span>
          <span className="text-muted-foreground/80 text-xs tabular-nums">{tickets.length}</span>
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
