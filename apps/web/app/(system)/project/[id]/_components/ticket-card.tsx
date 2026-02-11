"use client"

import { forwardRef } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@workspace/ui/components/badge"
import type { Ticket } from "./types"
import { cn } from "@workspace/ui/lib/utils"

export type TicketCardProps = {
  ticket: Ticket
  onClick?: () => void
  isDragOverlay?: boolean
}

export const TicketCard = forwardRef<HTMLDivElement, TicketCardProps & React.HTMLAttributes<HTMLDivElement>>(
  function TicketCard({ ticket, onClick, isDragOverlay, className, style: styleProp, ...rest }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        style={styleProp}
        className={cn(
          "rounded-xl border bg-card text-card-foreground p-3 flex flex-col gap-2 select-none",
          isDragOverlay
            ? "shadow-xl ring-2 ring-primary/30 cursor-grabbing"
            : "cursor-grab active:cursor-grabbing",
          className
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        {...rest}
      >
        <p className="text-sm font-medium leading-snug line-clamp-2">{ticket.title}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">
            {ticket.type}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {ticket.priority}
          </Badge>
          <Badge variant="ghost" className="text-[10px]">
            {ticket.estimatedEffort}
          </Badge>
        </div>
      </div>
    )
  }
)

/** Wrapper that hooks into dnd-kit's useDraggable */
export function DraggableTicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: { ticket },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <TicketCard
      ref={setNodeRef}
      style={style}
      ticket={ticket}
      onClick={onClick}
      className={cn("touch-none transition-shadow", isDragging && "opacity-30")}
      {...listeners}
      {...attributes}
    />
  )
}
