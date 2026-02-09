import { z } from "zod";

export const projectIdeaFormSchema = z.object({
  idea: z
    .string()
    .min(1, "Describe your project idea.")
    .max(2000, "Keep your idea under 2000 characters."),
});

export type ProjectIdeaFormValues = z.infer<typeof projectIdeaFormSchema>;
