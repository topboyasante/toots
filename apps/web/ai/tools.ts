import { tool as createTool, generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { prisma } from "@/lib/db"

const ticketSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["Story", "Task", "Epic", "Milestone", "Deliverable"]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  estimatedEffort: z.enum(["XS", "S", "M", "L", "XL"]),
  dependencies: z.array(z.string()),
  labels: z.array(z.string()),
});

const ticketsSchema = z.object({
  tickets: z.array(ticketSchema),
});

const TICKET_GENERATION_PROMPT = `You are an expert project manager who breaks down any kind of work project into actionable tickets—product launches, campaigns, events, process improvements, HR initiatives, sales enablement, and more.

Break down the project into a clear set of Jira/Linear-style tickets that cover what actually needs to happen for this project to succeed. Match the ticket types and labels to the domain (e.g. a marketing project might have "content", "channels", "launch"; an event might have "venue", "agenda", "invites"; a process change might have "stakeholders", "training", "rollout").

Each ticket must have:
- id: unique ticket identifier (e.g., "ticket-1", "ticket-2")
- title: Clear, action-oriented title
- type: One of "Story", "Task", "Epic", "Milestone", "Deliverable"
- priority: One of "P0", "P1", "P2", "P3"
- description: What needs to be done and why it matters for this project
- acceptanceCriteria: Array of criteria that must be met (at least 2-3 items)
- estimatedEffort: One of "XS", "S", "M", "L", "XL"
- dependencies: Array of ticket IDs this depends on (can be empty array)
- labels: Array of relevant labels for this project type (e.g. "planning", "stakeholders", "launch", "content", "design", "budget", "comms"—avoid defaulting to technical terms unless the project is technical)

Generate tickets in a logical order for this kind of project, e.g.:
- Planning and discovery first
- Core work streams or phases
- Key milestones or deliverables
- Review, launch, or handoff
- Follow-up or iteration

Be thorough but realistic. Generate at least 5-10 tickets for a typical project.`;

const ticketUpdateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  description: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  estimatedEffort: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
})

export function createTools(projectId?: string) {
  return {
    listTickets: createTool({
      description:
        "List current tickets for the project. Use this to find ticket IDs by title when the user asks to update, remove, or change specific tickets (e.g. 'remove the onboarding ticket', 'make ticket X higher priority').",
      inputSchema: z.object({}),
      execute: async function () {
        if (!projectId) return { tickets: [] }
        const tickets = await prisma.ticket.findMany({
          where: { projectId },
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, status: true, type: true, priority: true },
        })
        return { tickets }
      },
    }),

    updateTickets: createTool({
      description:
        "Update one or more tickets. Use listTickets first to get ticket IDs. You can update title, type, priority, description, status (todo, in-progress, done), estimatedEffort, acceptanceCriteria, dependencies, or labels.",
      inputSchema: z.object({
        updates: z.array(ticketUpdateSchema).describe("List of ticket updates, each with id and fields to change"),
      }),
      execute: async function ({ updates }) {
        if (!projectId || !updates.length) return { updated: 0 }
        let count = 0
        for (const u of updates) {
          const ticket = await prisma.ticket.findFirst({
            where: { id: u.id, projectId },
            include: { project: true },
          })
          if (!ticket) continue
          const { id, ...data } = u
          const updateData: Record<string, unknown> = {}
          if (data.title !== undefined) updateData.title = data.title
          if (data.type !== undefined) updateData.type = data.type
          if (data.priority !== undefined) updateData.priority = data.priority
          if (data.description !== undefined) updateData.description = data.description
          if (data.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = data.acceptanceCriteria
          if (data.estimatedEffort !== undefined) updateData.estimatedEffort = data.estimatedEffort
          if (data.dependencies !== undefined) updateData.dependencies = data.dependencies
          if (data.labels !== undefined) updateData.labels = data.labels
          if (data.status !== undefined) updateData.status = data.status
          await prisma.ticket.update({ where: { id }, data: updateData })
          count++
        }
        return { updated: count }
      },
    }),

    removeTickets: createTool({
      description:
        "Remove one or more tickets by ID. Use listTickets first to get ticket IDs when the user refers to tickets by name (e.g. 'delete the onboarding ticket').",
      inputSchema: z.object({
        ticketIds: z.array(z.string()).describe("Ticket IDs to remove"),
      }),
      execute: async function ({ ticketIds }) {
        if (!projectId || !ticketIds.length) return { removed: 0 }
        const result = await prisma.ticket.deleteMany({
          where: { id: { in: ticketIds }, projectId },
        })
        return { removed: result.count }
      },
    }),

    generateTickets: createTool({
      description:
        "Generate a set of Jira/Linear-style tickets for a work project. Call this when you have enough context (from questions or because the user asked to proceed). The project can be anything—product, marketing, event, process, HR, etc. Provide a clear project description with goals and context from the conversation.",
      inputSchema: z.object({
        projectDescription: z
          .string()
          .describe(
            "A clear project description: the goal, who's involved, key deliverables, timeline or constraints, and any other context from the conversation. Enough for accurate, domain-appropriate ticket generation."
          ),
      }),
      execute: async function ({ projectDescription }) {
        console.log("[Tool] Generating tickets for project description:", projectDescription.substring(0, 200) + "...");

        try {
          const { output } = await generateText({
            model: google("gemini-2.5-flash"),
            output: Output.object({
              schema: ticketsSchema,
              name: "Tickets",
              description: "Generated project tickets",
            }),
            prompt: `${TICKET_GENERATION_PROMPT}\n\nProject Description:\n${projectDescription}`,
          })

          const tickets = output?.tickets ?? []
          console.log("[Tool] Generated tickets:", tickets.length)

          if (projectId && tickets.length > 0) {
            await prisma.ticket.createMany({
              data: tickets.map((t, i) => ({
                projectId,
                title: t.title,
                type: t.type,
                priority: t.priority,
                description: t.description,
                acceptanceCriteria: t.acceptanceCriteria,
                estimatedEffort: t.estimatedEffort,
                dependencies: t.dependencies,
                labels: t.labels,
                sortOrder: i,
                status: "todo",
              })),
            })
          }

          return { tickets }
        } catch (error) {
          console.error("[Tool] Error generating tickets:", error);
          throw new Error(`Failed to generate tickets: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    }),
  }
}
