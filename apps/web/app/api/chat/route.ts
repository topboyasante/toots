import { streamObject, gateway } from "ai";
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

const SYSTEM_PROMPT = `You are an expert project manager and technical lead who excels at breaking down project ideas into actionable tickets.

When a user describes a project idea, you will generate a comprehensive set of Jira/Linear-style tickets that cover all aspects of building that project.

Each ticket should have:
- id: unique ticket identifier (e.g., "ticket-1", "ticket-2")
- title: Clear, action-oriented title
- type: One of "Story", "Task", "Bug", "Epic", "Feature"
- priority: One of "P0", "P1", "P2", "P3"
- description: Detailed explanation of what needs to be done
- acceptanceCriteria: Array of criteria that must be met
- estimatedEffort: One of "XS", "S", "M", "L", "XL"
- dependencies: Array of ticket IDs this depends on
- labels: Array of relevant labels (e.g., "frontend", "backend", "database")

Generate tickets in a logical order:
1. Setup and infrastructure tickets first
2. Core functionality tickets
3. Feature implementation tickets
4. Testing and quality assurance tickets
5. Deployment and documentation tickets

Be thorough but realistic. Break down complex features into manageable tasks.`;

export async function POST(req: Request) {
  try {
    const context = await req.json();
    console.log("[API] Received context:", context);

    const result = streamObject({
      model: gateway("anthropic/claude-sonnet-4.5"),
      system: SYSTEM_PROMPT,
      prompt: context,
      schema: ticketsSchema,
    });

    console.log("[API] Starting stream...");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[API] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
