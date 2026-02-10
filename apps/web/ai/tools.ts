import { tool as createTool, generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

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

export const generateTicketsTool = createTool({
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
      return { tickets }
    } catch (error) {
      console.error("[Tool] Error generating tickets:", error);
      throw new Error(`Failed to generate tickets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const tools = {
  generateTickets: generateTicketsTool,
};
