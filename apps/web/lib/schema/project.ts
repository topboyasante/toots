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

export const getProjectBySlugInput = z.object({
  slug: z.string(),
});

export const listProjectsForSidebarInput = z.object({
  limit: z.number().int().min(1).max(50).optional().default(20),
})
