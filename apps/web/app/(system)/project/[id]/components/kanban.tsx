"use client";

import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, UniqueIdentifier, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";
import Droppable from "@/components/ui/droppable";
import Draggable from "@/components/ui/draggable";
import TicketDetailSheet from "./ticket-detail-sheet";

type KanbanProps = {
  tickets: Partial<Ticket>[];
  isLoading?: boolean;
};

type ColumnId = "todo" | "in-progress" | "done";

type Column = {
  id: ColumnId;
  title: string;
  className: string;
};

export default function Kanban({ tickets, isLoading = false }: KanbanProps) {
  const columns: Column[] = [
    { id: "todo", title: "To Do", className: "bg-slate-100 dark:bg-slate-800" },
    { id: "in-progress", title: "In Progress", className: "bg-blue-100 dark:bg-blue-900" },
    { id: "done", title: "Done", className: "bg-green-100 dark:bg-green-900" },
  ];

  // Track which column each ticket is in (all start in "todo")
  const [columnAssignments, setColumnAssignments] = useState<
    Record<string, UniqueIdentifier>
  >({});

  // Track the currently dragging ticket
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Track the selected ticket for the detail sheet
  const [selectedTicket, setSelectedTicket] = useState<Partial<Ticket> | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Update column assignments when new tickets arrive
  useEffect(() => {
    setColumnAssignments((prev) => {
      const newAssignments = { ...prev };
      tickets.forEach((ticket) => {
        if (ticket?.id && !(ticket.id in newAssignments)) {
          newAssignments[ticket.id] = "todo";
        }
      });
      return newAssignments;
    });
  }, [tickets]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const ticket = tickets.find((t) => t?.id === active.id);
    setActiveTicket((ticket as Ticket) || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over) {
      setColumnAssignments((prev) => ({
        ...prev,
        [active.id]: over.id,
      }));
    }

    setActiveTicket(null);
  }

  // Render a ticket card
  const renderTicketCard = (ticket: Partial<Ticket>) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm">{ticket.title || "Loading..."}</h3>
        {ticket.priority && (
          <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary shrink-0">
            {ticket.priority}
          </span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {ticket.type && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {ticket.type}
          </span>
        )}
        {ticket.estimatedEffort && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {ticket.estimatedEffort}
          </span>
        )}
      </div>
      {ticket.labels && ticket.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {ticket.labels.map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4 px-2">{column.title}</h2>
            <Droppable
              id={column.id}
              className={`${column.className} min-h-[500px] max-h-[calc(100vh-200px)] overflow-y-auto flex flex-col gap-3 rounded-lg p-4`}
            >
              {/* Show skeleton loaders only in "todo" column when loading */}
              {isLoading && column.id === "todo" ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-border animate-pulse"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-6 w-8 bg-muted rounded"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-12 bg-muted rounded"></div>
                          <div className="h-5 w-8 bg-muted rounded"></div>
                        </div>
                        <div className="flex gap-1">
                          <div className="h-5 w-16 bg-muted rounded-full"></div>
                          <div className="h-5 w-12 bg-muted rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {tickets
                    .filter((ticket) => ticket?.id && columnAssignments[ticket.id] === column.id)
                    .map((ticket) => (
                      <Draggable
                        key={ticket.id!}
                        id={ticket.id!}
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setSheetOpen(true);
                        }}
                      >
                        {renderTicketCard(ticket)}
                      </Draggable>
                    ))}
                  {!isLoading && tickets.filter((t) => t?.id && columnAssignments[t.id] === column.id)
                    .length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Drop tickets here
                    </p>
                  )}
                </>
              )}
            </Droppable>
          </div>
        ))}
      </div>

        <DragOverlay>
          {activeTicket ? (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border border-border cursor-grabbing rotate-3 opacity-90">
              {renderTicketCard(activeTicket)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <TicketDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        ticket={selectedTicket}
      />
    </>
  );
}
