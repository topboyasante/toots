"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import Kanban from "./kanban";

type Props = {
  projectIdea: string;
};

type Ticket = {
  id: string;
  title: string;
  type?: "Story" | "Task" | "Bug" | "Epic" | "Feature";
  priority?: "P0" | "P1" | "P2" | "P3";
  description?: string;
  acceptanceCriteria?: string[];
  estimatedEffort?: "XS" | "S" | "M" | "L" | "XL";
  dependencies?: string[];
  labels?: string[];
};

export default function ProjectChat({ projectIdea }: Props) {
  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
  });

  // Track if we've already submitted to prevent re-submissions
  const hasSubmittedRef = useRef(false);
  const lastProjectIdeaRef = useRef<string>("");

  useEffect(() => {
    // Only submit if projectIdea exists and hasn't been submitted yet
    if (
      projectIdea &&
      (projectIdea !== lastProjectIdeaRef.current || !hasSubmittedRef.current)
    ) {
      console.log("[Client] Submitting project idea:", projectIdea);
      hasSubmittedRef.current = true;
      lastProjectIdeaRef.current = projectIdea;
      sendMessage({ text: projectIdea });
    }
  }, [projectIdea, sendMessage]);

  // Extract tickets from tool results
  const tickets: Partial<Ticket>[] = [];
  const isLoading = status === "submitted" || status === "streaming";

  // Debug: Log messages to see what we're receiving
  useEffect(() => {
    if (messages.length > 0) {
      console.log("[Client] Total messages:", messages.length);
      console.log("[Client] Status:", status);
      messages.forEach((message, idx) => {
        console.log(`[Client] Message ${idx} (${message.role}):`, {
          id: message.id,
          role: message.role,
          partsCount: message.parts.length,
          parts: message.parts.map((p) => {
            const partInfo: any = { type: p.type };
            if ("state" in p) {
              partInfo.state = p.state;
            }
            if ("output" in p && p.output) {
              partInfo.hasOutput = true;
              partInfo.outputKeys = Object.keys(p.output);
            }
            if ("input" in p && p.input) {
              partInfo.hasInput = true;
            }
            return partInfo;
          }),
        });
      });
    }
  }, [messages, status]);

  // Find tickets from tool outputs in messages
  // Process messages in reverse to get the most recent tickets first
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "assistant") {
      for (const part of message.parts) {
        // Check for tool-generateTickets parts
        if (part.type === "tool-generateTickets") {
          console.log("[Client] Found tool-generateTickets part:", {
            state: "state" in part ? part.state : "no state",
            hasOutput: "output" in part,
            output: "output" in part ? part.output : undefined,
          });

          // Handle different tool states
          if ("state" in part) {
            if (part.state === "output-available") {
              const output = "output" in part ? part.output : null;
              if (output && typeof output === "object" && "tickets" in output) {
                const toolTickets = (output.tickets as Ticket[]) || [];
                console.log("[Client] Extracted tickets from output:", toolTickets.length);
                if (toolTickets.length > 0) {
                  tickets.push(...toolTickets);
                  // Break out of both loops once we find tickets
                  i = -1;
                  break;
                }
              } else {
                console.log("[Client] Output format unexpected:", output);
              }
            } else if (part.state === "input-available") {
              console.log("[Client] Tool call received, waiting for output...");
            } else if (part.state === "output-error") {
              console.error("[Client] Tool execution error:", "errorText" in part ? part.errorText : "Unknown error");
            }
          }
        }
      }
    }
  }

  if (tickets.length > 0) {
    console.log("[Client] Final tickets array length:", tickets.length);
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <Kanban tickets={tickets} isLoading={isLoading} />
    </div>
  );
}
