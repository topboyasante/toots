"use client";

import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Spinner } from "@workspace/ui/components/spinner";
import { toast } from "sonner";
import type { ClarifyingQuestion } from "./questions-card";
import { QuestionsCard } from "./questions-card";

const MESSAGE_SKIP = "Skip the questions and generate tickets now.";

function getUserFriendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();
  if (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("rate-limit") ||
    lower.includes("exceeded your current quota")
  ) {
    const retryMatch = message.match(/retry in (\d+(?:\.\d+)?)s/i);
    const seconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : 60;
    return `We're at capacity right now. Please try again in ${seconds > 0 ? `about ${seconds} seconds` : "a minute"}.`;
  }
  if (lower.includes("api key") || lower.includes("authentication") || lower.includes("unauthorized")) {
    return "There was a problem with the service. Please try again later.";
  }
  return "Something went wrong. Please try again.";
}

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

const TICKETS_GENERATED_CONFIRMATION =
  "I've generated the tickets. Check the board and say if you'd like any changes.";

function messageHasTicketsGeneratedPart(message: UIMessage): boolean {
  return message.parts?.some(
    (p) =>
      (p as { type?: string; data?: { showConfirmation?: boolean } }).type ===
        "data-ticketsGenerated" &&
      (p as { data?: { showConfirmation?: boolean } }).data?.showConfirmation
  ) ?? false
}

function extractClarifyingQuestions(messages: UIMessage[]): ClarifyingQuestion[] | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "assistant" || !msg.parts?.length) continue;
    for (const part of msg.parts) {
      const p = part as {
        type?: string;
        toolName?: string;
        args?: { questions?: ClarifyingQuestion[] };
        input?: { questions?: ClarifyingQuestion[] };
        output?: { questions?: ClarifyingQuestion[] };
      };
      const questions =
        p.type === "tool-setClarifyingQuestions"
          ? (p.input?.questions ?? p.output?.questions)
          : p.toolName === "setClarifyingQuestions"
            ? (p.args?.questions ?? (p as { input?: { questions?: ClarifyingQuestion[] } }).input?.questions)
            : undefined;
      if (Array.isArray(questions) && questions.length > 0) {
        return questions;
      }
    }
  }
  return null;
}

export type ProjectChatProps = {
  project: { id: string; name: string; description: string | null };
  initialMessages?: UIMessage[];
  /** Called after each AI response finishes (e.g. to refetch tickets) */
  onFinish?: () => void;
  /** Whether tickets already exist for this project */
  hasTickets?: boolean;
};

export function ProjectChat({ project, initialMessages = [], onFinish, hasTickets }: ProjectChatProps) {
  const { messages, sendMessage, status, stop, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { project },
    }),
    onFinish,
  });

  const clarifyingQuestions = useMemo(() => extractClarifyingQuestions(messages), [messages]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [optionalDetails, setOptionalDetails] = useState("");
  const [interviewFinished, setInterviewFinished] = useState(false);

  useEffect(() => {
    if (clarifyingQuestions?.length) setInterviewFinished(false);
  }, [clarifyingQuestions]);

  const hasAutoSentRef = useRef(false);
  useEffect(() => {
    if (initialMessages.length === 0 && messages.length === 0 && !hasAutoSentRef.current) {
      hasAutoSentRef.current = true;
      sendMessage({ text: buildProjectMessage(project) });
    }
  }, [initialMessages.length, messages.length, sendMessage, project]);

  const showQuestionsCard =
    clarifyingQuestions != null &&
    clarifyingQuestions.length > 0 &&
    !interviewFinished;

  const currentQuestion = showQuestionsCard ? clarifyingQuestions[questionIndex] : null;
  const selectedAnswer = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";

  const handleContinue = (questionId: string, answer: string, details: string) => {
    const question = clarifyingQuestions?.find((q) => q.id === questionId);
    if (!question || !clarifyingQuestions) return;

    const nextAnswers = { ...answers, [questionId]: answer };
    setAnswers(nextAnswers);

    if (questionIndex >= clarifyingQuestions.length - 1) {
      const parts = clarifyingQuestions.map(
        (q, i) => `${i + 1}. ${q.text}\nAnswer: ${nextAnswers[q.id] ?? "(skipped)"}`
      );
      const text =
        details.trim() !== ""
          ? `${parts.join("\n\n")}\n\nAdditional details: ${details.trim()}`
          : parts.join("\n\n");
      sendMessage({ text });
      setInterviewFinished(true);
      setQuestionIndex(0);
      setAnswers({});
      setOptionalDetails("");
    } else {
      setQuestionIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    if (!clarifyingQuestions) return;
    if (questionIndex >= clarifyingQuestions.length - 1) {
      sendMessage({ text: MESSAGE_SKIP });
      setInterviewFinished(true);
      setQuestionIndex(0);
      setAnswers({});
    } else {
      setQuestionIndex((i) => i + 1);
    }
  };

  const handleSubmit = async (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const text = message.text?.trim();
    if (!text) return;
    try {
      await sendMessage({
        text,
        files: message.files?.length ? message.files : undefined,
      });
    } catch (err) {
      toast.error("Failed to send message", {
        description: getUserFriendlyErrorMessage(err),
      });
    }
  };

  const sendSkip = () => sendMessage({ text: MESSAGE_SKIP });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <Conversation className="min-h-full">
          <ConversationContent className="px-0">
            {showQuestionsCard && (
              <div className="space-y-4 p-4">
                <QuestionsCard
                  questions={clarifyingQuestions}
                  questionIndex={questionIndex}
                  selectedAnswer={selectedAnswer}
                  optionalDetails={optionalDetails}
                  onQuestionIndexChange={setQuestionIndex}
                  onSelectAnswer={(answer) =>
                    currentQuestion && setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
                  }
                  onOptionalDetailsChange={setOptionalDetails}
                  onContinue={handleContinue}
                  onSkip={handleSkip}
                  isLoading={isLoading}
                />
                {!hasTickets && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      onClick={sendSkip}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      Skip to ticket generation
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!showQuestionsCard && messages.length === 0 && (
              <ConversationEmptyState
                title="Clarifying questions"
                description={
                  isLoading
                    ? "Asking clarifying questions…"
                    : "We'll ask a few questions to refine your project, then generate tickets. You can skip to ticket generation at any time."
                }
              >
                {!hasTickets && (
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
                )}
              </ConversationEmptyState>
            )}
            {messages.length > 0 &&
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>
                        {getMessageText(message)}
                        {messageHasTicketsGeneratedPart(message) && (
                          <>{getMessageText(message) ? " " : ""}{TICKETS_GENERATED_CONFIRMATION}</>
                        )}
                      </MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {getMessageText(message)}
                      </span>
                    )}
                  </MessageContent>
                </Message>
              ))}
            {isLoading && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner className="size-4 shrink-0" />
                    <span>Thinking…</span>
                  </div>
                </MessageContent>
              </Message>
            )}
            {error && (
              <Message from="assistant">
                <MessageContent>
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <p className="font-medium">Something went wrong</p>
                    <p className="mt-1 text-destructive/90">{getUserFriendlyErrorMessage(error)}</p>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="shrink-0 bg-background">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea name="message" placeholder="Answer the questions or ask to generate tickets…" />
          <PromptInputFooter className="w-full">
            <div className="flex-1 min-w-0 flex items-center">
              {!hasTickets && (
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
              )}
            </div>
            <PromptInputSubmit status={status} onStop={stop} className="shrink-0" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}