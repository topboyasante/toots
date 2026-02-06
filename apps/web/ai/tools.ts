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
    "Generate a comprehensive set of Jira/Linear-style tickets for a project. Call this tool when you have gathered enough context about the project (either through questions or the user has asked to proceed). Provide a comprehensive project description that includes all relevant details from the conversation.",
  inputSchema: z.object({
    projectDescription: z
      .string()
      .describe(
        "A comprehensive project description that includes the initial idea, target audience, key features, technical requirements, and any other relevant context gathered from the conversation. This should be a complete summary that allows for accurate ticket generation."
      ),
  }),
  execute: async function ({ projectDescription }) {
    console.log("[Tool] Generating tickets for project description:", projectDescription.substring(0, 200) + "...");

    try {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: ticketsSchema,
        prompt: `${TICKET_GENERATION_PROMPT}\n\nProject Description:\n${projectDescription}`,
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

