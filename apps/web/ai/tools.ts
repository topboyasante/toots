import { tool as createTool } from "ai";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const ticketSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["Story", "Task", "Bug", "Epic", "Feature"]),
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

const TICKET_GENERATION_PROMPT = `You are an expert project manager and technical lead who excels at breaking down project ideas into actionable tickets.

Break down the project idea into a comprehensive set of Jira/Linear-style tickets that cover all aspects of building that project.

Each ticket must have:
- id: unique ticket identifier (e.g., "ticket-1", "ticket-2")
- title: Clear, action-oriented title
- type: One of "Story", "Task", "Bug", "Epic", "Feature"
- priority: One of "P0", "P1", "P2", "P3"
- description: Detailed explanation of what needs to be done
- acceptanceCriteria: Array of criteria that must be met (at least 2-3 items)
- estimatedEffort: One of "XS", "S", "M", "L", "XL"
- dependencies: Array of ticket IDs this depends on (can be empty array)
- labels: Array of relevant labels (e.g., "frontend", "backend", "database")

Generate tickets in a logical order:
1. Setup and infrastructure tickets first
2. Core functionality tickets
3. Feature implementation tickets
4. Testing and quality assurance tickets
5. Deployment and documentation tickets

Be thorough but realistic. Break down complex features into manageable tasks. Generate at least 5-10 tickets for a typical project.`;

export const generateTicketsTool = createTool({
  description:
    "Generate a comprehensive set of Jira/Linear-style tickets for a project idea. This tool takes a project description and returns structured tickets covering setup, core functionality, features, testing, and deployment.",
  inputSchema: z.object({
    projectIdea: z.string().describe("The project idea or description to break down into tickets"),
  }),
  execute: async function ({ projectIdea }) {
    console.log("[Tool] Generating tickets for project idea:", projectIdea);

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: ticketsSchema,
        prompt: `${TICKET_GENERATION_PROMPT}\n\nProject Idea: ${projectIdea}`,
      });

      console.log("[Tool] Generated tickets:", object.tickets?.length || 0);
      return { tickets: object.tickets || [] };
    } catch (error) {
      console.error("[Tool] Error generating tickets:", error);
      throw new Error(`Failed to generate tickets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const tools = {
  generateTickets: generateTicketsTool,
};

