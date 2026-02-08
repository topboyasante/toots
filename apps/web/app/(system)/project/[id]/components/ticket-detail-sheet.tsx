"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import type { Ticket } from "@/types/ticket";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Partial<Ticket> | null;
};

export default function TicketDetailSheet({
  open,
  onOpenChange,
  ticket,
}: Props) {
  if (!ticket) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {ticket.type && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {ticket.type}
              </span>
            )}
            {ticket.priority && (
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                {ticket.priority}
              </span>
            )}
            {ticket.estimatedEffort && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {ticket.estimatedEffort}
              </span>
            )}
          </div>
          <SheetTitle className="text-left pr-8">
            {ticket.title || "Untitled Ticket"}
          </SheetTitle>
          {ticket.id && (
            <SheetDescription className="text-left">
              {ticket.id}
            </SheetDescription>
          )}
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6 pr-4">
            {ticket.description && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm">{ticket.description}</p>
              </section>
            )}

            {ticket.acceptanceCriteria &&
              ticket.acceptanceCriteria.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Acceptance Criteria
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    {ticket.acceptanceCriteria.map((criterion, idx) => (
                      <li key={idx}>{criterion}</li>
                    ))}
                  </ul>
                </section>
              )}

            {ticket.dependencies && ticket.dependencies.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Dependencies
                </h3>
                <div className="flex flex-wrap gap-1">
                  {ticket.dependencies.map((depId) => (
                    <span
                      key={depId}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {depId}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {ticket.labels && ticket.labels.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Labels
                </h3>
                <div className="flex flex-wrap gap-1">
                  {ticket.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
