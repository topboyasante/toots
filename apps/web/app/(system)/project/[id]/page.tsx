import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import Link from "next/link"
import { rpc } from "@/lib/orpc"
import { notFound } from "next/navigation"
import { ProjectView } from "./_components/project-view"
import type { Ticket } from "./_components/types"
import type { UIMessage } from "ai"

type Props = { params: Promise<{ id: string }> }

function messagesToUIMessages(messages: { id: string; role: string; content: string }[]): UIMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    parts: [{ type: "text" as const, text: m.content }],
  }))
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const project = await rpc.projects.get({ id })

  if (!project) notFound()

  const [storedMessages, initialTickets] = await Promise.all([
    rpc.messages.list({ projectId: project.id }),
    rpc.tickets.list({ projectId: project.id }),
  ])
  const initialMessages = messagesToUIMessages(storedMessages)

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-6">
      <div className="shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="mt-6 min-h-0 flex-1 flex flex-col">
        <ProjectView
          project={{
            id: project.id,
            name: project.name,
            description: project.description ?? null,
          }}
          initialMessages={initialMessages}
          initialTickets={initialTickets as Ticket[]}
        />
      </div>
    </div>
  )
}
