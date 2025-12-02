"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect } from "react";
import { z } from "zod";
import Kanban from "./kanban";

type Props = {
  projectIdea: string;
};

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

export default function ProjectChat({ projectIdea }: Props) {
  const { object, submit, isLoading, error } = useObject({
    api: "/api/chat",
    schema: ticketsSchema,
  });

  useEffect(() => {
    if (projectIdea) {
      console.log("[Client] Submitting project idea:", projectIdea);
      submit(projectIdea);
    }
  }, [projectIdea, submit]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Error: {error.message}
        </div>
      )}

      <Kanban
        tickets={(object?.tickets?.filter((t) => t !== undefined) ?? []) as Partial<typeof ticketSchema._type>[]}
        isLoading={isLoading}
      />
    </div>
  );
}
