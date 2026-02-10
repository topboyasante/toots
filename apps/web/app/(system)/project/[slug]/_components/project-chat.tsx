"use client";

import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
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
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

const MESSAGE_SKIP = "Skip the questions and generate tickets now.";

function buildProjectMessage(project: { name: string; description: string | null }): string {
  return project.description?.trim() || project.name;
}

function getMessageText(message: UIMessage): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export type ProjectChatProps = {
  project: { id: string; name: string; description: string | null };
  initialMessages?: UIMessage[];
};

export function ProjectChat({ project, initialMessages = [] }: ProjectChatProps) {
  const { messages, sendMessage, status, stop } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { project },
    }),
  });

  const hasAutoSentRef = useRef(false);
  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0 && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      sendMessage({ text: buildProjectMessage(project) });
    }
  }, [initialMessages.length, messages.length, sendMessage, project]);

  const handleSubmit = async (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const text = message.text?.trim();
    if (!text) return;
    await sendMessage({
      text,
      files: message.files?.length ? message.files : undefined,
    });
  };

  const sendSkip = () => sendMessage({ text: MESSAGE_SKIP });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <Conversation className="min-h-full">
          <ConversationContent className="px-0">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Clarifying questions"
                description={
                  isLoading
                    ? "Asking clarifying questions…"
                    : "We'll ask a few questions to refine your project, then generate tickets. You can skip to ticket generation at any time."
                }
              >
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    onClick={sendSkip}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    Skip to ticket generation
                  </Button>
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>
                        {getMessageText(message)}
                      </MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {getMessageText(message)}
                      </span>
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="shrink-0 bg-background">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea name="message" placeholder="Answer the questions or ask to generate tickets…" />
          <PromptInputFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={sendSkip}
              disabled={isLoading}
            >
              Skip to ticket generation
            </Button>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}