"use client"

import { useCallback, useState } from "react"
import { rpc } from "@/lib/orpc"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { MessageSquareIcon } from "lucide-react"
import type { UIMessage } from "ai"
import type { Ticket } from "./types"
import { KanbanBoard } from "./kanban-board"
import { ChatPanel } from "./chat-panel"

export type ProjectViewProps = {
  project: { id: string; name: string; description: string | null }
  initialMessages: UIMessage[]
  initialTickets: Ticket[]
}

export function ProjectView({ project, initialMessages, initialTickets }: ProjectViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [chatOpen, setChatOpen] = useState(initialTickets.length === 0)

  const refreshTickets = useCallback(async () => {
    const list = await rpc.tickets.list({ projectId: project.id })
    setTickets(list as Ticket[])
  }, [project.id])

  return (
    <>
      <div
        className={cn(
          "min-h-0 flex-1 flex flex-col transition-[margin] duration-200 ease-out",
          chatOpen ? "mr-[392px]" : "mr-0"
        )}
      >
        <div className="shrink-0 flex items-center justify-end mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChatOpen((o) => !o)}
            className="transition-colors duration-150"
          >
            <MessageSquareIcon className={cn("size-4 mr-1.5 transition-opacity duration-150", chatOpen ? "opacity-100" : "opacity-80")} />
            {chatOpen ? "Close chat" : "Chat"}
          </Button>
        </div>
        <KanbanBoard tickets={tickets} setTickets={setTickets} />
      </div>
      <ChatPanel
        project={project}
        initialMessages={initialMessages}
        onTicketsChanged={refreshTickets}
        open={chatOpen}
        onOpenChange={setChatOpen}
        hasTickets={tickets.length > 0}
      />
    </>
  )
}
