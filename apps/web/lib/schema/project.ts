import { z } from "zod";

export const projectIdeaFormSchema = z.object({
  idea: z
    .string()
    .min(1, "Describe your project idea.")
    .max(2000, "Keep your idea under 2000 characters."),
});

export type ProjectIdeaFormValues = z.infer<typeof projectIdeaFormSchema>;

// RPC procedure schemas
export const listProjectsInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  cursor: z.number().int().min(0).optional().default(0),
});

export const getProjectInput = z.object({
  id: z.string(),
});

export const createProjectInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
});

export const updateProjectInput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const deleteProjectInput = z.object({
  id: z.string(),
});

export const listProjectsForSidebarInput = z.object({
  limit: z.number().int().min(1).max(50).optional().default(20),
})

export const listMessagesInput = z.object({ projectId: z.string() })
export const listTicketsInput = z.object({ projectId: z.string() })

export const updateTicketInput = z.object({
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

export const updateTicketStatusInput = z.object({
  id: z.string(),
  status: z.enum(["todo", "in-progress", "done"]),
})

export const deleteTicketInput = z.object({
  id: z.string(),
})
