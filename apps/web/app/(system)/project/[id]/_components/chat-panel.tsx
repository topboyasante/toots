"use client"

import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import { ProjectChat } from "./project-chat"
import type { UIMessage } from "ai"
import { cn } from "@workspace/ui/lib/utils"

export type ChatPanelProps = {
  project: { id: string; name: string; description: string | null }
  initialMessages: UIMessage[]
  onTicketsChanged: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  hasTickets: boolean
}

export function ChatPanel({ project, initialMessages, onTicketsChanged, open, onOpenChange, hasTickets }: ChatPanelProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed top-0 right-0 z-30 h-dvh flex flex-col bg-background border-l shadow-lg transition-[width] duration-200 ease-out overflow-hidden",
          open ? "w-[380px]" : "w-0 border-0"
        )}
      >
        {open && (
          <div className="flex flex-col h-full w-[380px] min-w-[380px]">
            <div className="shrink-0 px-4 py-3 border-b flex items-start justify-between">
              <div>
                <h2 className="text-sm font-medium">Project chat</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ask to add, remove, or change tickets.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                aria-label="Close chat"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 flex flex-col px-3 pb-3">
              <ProjectChat
                project={project}
                initialMessages={initialMessages}
                onFinish={onTicketsChanged}
                hasTickets={hasTickets}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
