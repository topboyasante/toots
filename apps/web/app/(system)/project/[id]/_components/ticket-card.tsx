"use client"

import { forwardRef } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Circle, CircleDot, CheckCircle2 } from "lucide-react"
import type { Ticket } from "./types"
import { getPriorityStyle, getTypeDotClass } from "./types"
import { cn } from "@workspace/ui/lib/utils"

export type TicketCardProps = {
  ticket: Ticket
  onClick?: () => void
  isDragOverlay?: boolean
}

function formatCreatedAt(date: Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function StatusIcon({ status }: { status: string }) {
  const iconClass = "size-4 shrink-0 text-muted-foreground"
  if (status === "done") return <CheckCircle2 className={cn(iconClass, "text-emerald-500")} aria-hidden />
  if (status === "in-progress") return <CircleDot className={iconClass} aria-hidden />
  return <Circle className={iconClass} aria-hidden />
}

export const TicketCard = forwardRef<HTMLDivElement, TicketCardProps & React.HTMLAttributes<HTMLDivElement>>(
  function TicketCard({ ticket, onClick, isDragOverlay, className, style: styleProp, ...rest }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        style={styleProp}
        className={cn(
          "rounded-xl bg-card border border-border text-card-foreground p-4 flex flex-col gap-3 select-none transition-all duration-150",
          isDragOverlay
            ? "ring-2 ring-primary/30 cursor-grabbing"
            : "cursor-grab active:cursor-grabbing hover:-translate-y-px",
          className
        )}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        {...rest}
      >
        <div className="flex gap-2.5 min-w-0">
          <StatusIcon status={ticket.status} />
          <p className="text-sm font-semibold leading-snug line-clamp-2 flex-1 min-w-0">
            {ticket.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium">
            <span className={cn("size-1.5 shrink-0 rounded-full", getTypeDotClass(ticket.type))} aria-hidden />
            {ticket.type}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border-0", getPriorityStyle(ticket.priority))}>
            <span className="size-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden />
            {ticket.priority}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            {ticket.estimatedEffort}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Created {formatCreatedAt(ticket.createdAt)}
        </p>
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
