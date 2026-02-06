"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Kanban from "./kanban";
import { Button } from "@workspace/ui/components/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import type { ToolUIPart } from "ai";

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
  const { messages, sendMessage, status, error } = useChat();

  const hasSubmittedRef = useRef(false);
  const lastProjectIdeaRef = useRef<string>("");
  const [input, setInput] = useState("");

  useEffect(() => {
    if (
      projectIdea &&
      (projectIdea !== lastProjectIdeaRef.current || !hasSubmittedRef.current)
    ) {
      hasSubmittedRef.current = true;
      lastProjectIdeaRef.current = projectIdea;
      sendMessage({ text: projectIdea });
    }
  }, [projectIdea, sendMessage]);

  const isLoading = status === "submitted" || status === "streaming";

  const tickets = useMemo(() => {
    const extractedTickets: Partial<Ticket>[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "assistant") {
        for (const part of message.parts) {
          if (part.type === "tool-generateTickets" && "state" in part) {
            if (part.state === "output-available") {
              const output = "output" in part ? part.output : null;
              if (output && typeof output === "object" && "tickets" in output) {
                const toolTickets = (output.tickets as Ticket[]) || [];
                if (toolTickets.length > 0) {
                  extractedTickets.push(...toolTickets);
                  return extractedTickets;
                }
              }
            }
          }
        }
      }
    }

    return extractedTickets;
  }, [messages]);

  const hasTickets = tickets.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  };

  const handleSkip = () => {
    sendMessage({ text: "skip" });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {!hasTickets && (
        <div className="flex flex-col h-[600px] border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Project Planning Chat</h3>
          </div>

          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Start Planning"
                  description="Describe your project idea to begin"
                />
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.parts.map((part, idx) => {
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={idx}>
                              {part.text}
                            </MessageResponse>
                          );
                        }

                        if (
                          part.type.startsWith("tool-") &&
                          "state" in part
                        ) {
                          const toolPart = part as ToolUIPart;
                          return (
                            <Tool key={idx} defaultOpen={false}>
                              <ToolHeader
                                type={toolPart.type}
                                state={toolPart.state}
                                title={toolPart.type
                                  .split("-")
                                  .slice(1)
                                  .join("-")}
                              />
                              <ToolContent>
                                {"input" in toolPart && toolPart.input && (
                                  <ToolInput input={toolPart.input} />
                                )}
                                {"output" in toolPart &&
                                  ("errorText" in toolPart ? (
                                    <ToolOutput
                                      output={toolPart.output}
                                      errorText={toolPart.errorText}
                                    />
                                  ) : (
                                    <ToolOutput output={toolPart.output} />
                                  ))}
                              </ToolContent>
                            </Tool>
                          );
                        }

                        return null;
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}

              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <Loader />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Answer questions or type 'skip' to proceed..."
                className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
              {messages.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip
                </Button>
              )}
            </form>
          </div>
        </div>
      )}

      {hasTickets && (
        <div>
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              ✓ Tickets generated! View the tickets below.
            </p>
          </div>
          <Kanban tickets={tickets} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
