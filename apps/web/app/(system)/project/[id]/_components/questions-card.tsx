"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRightIcon, ChevronDownIcon, ChevronUpIcon, MessageCircleIcon } from "lucide-react"

export type ClarifyingQuestion = {
  id: string
  text: string
  options?: string[]
}

export type QuestionsCardProps = {
  questions: ClarifyingQuestion[]
  questionIndex: number
  selectedAnswer: string
  optionalDetails: string
  onQuestionIndexChange: (index: number) => void
  onSelectAnswer: (answer: string) => void
  onOptionalDetailsChange: (value: string) => void
  onContinue: (questionId: string, answer: string, optionalDetails: string) => void
  onSkip: () => void
  isLoading: boolean
}

export function QuestionsCard({
  questions,
  questionIndex,
  selectedAnswer,
  optionalDetails,
  onQuestionIndexChange,
  onSelectAnswer,
  onOptionalDetailsChange,
  onContinue,
  onSkip,
  isLoading,
}: QuestionsCardProps) {
  const current = questions[questionIndex]
  if (!current) return null

  const hasOptions = current.options && current.options.length > 0
  const canContinue = hasOptions ? !!selectedAnswer.trim() : true
  const isLast = questionIndex === questions.length - 1

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">Questions</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => onQuestionIndexChange(Math.max(0, questionIndex - 1))}
              disabled={questionIndex <= 0 || isLoading}
              aria-label="Previous question"
            >
              <ChevronUpIcon className="size-4" />
            </Button>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              {questionIndex + 1} of {questions.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7"
              onClick={() => onQuestionIndexChange(Math.min(questions.length - 1, questionIndex + 1))}
              disabled={questionIndex >= questions.length - 1 || isLoading}
              aria-label="Next question"
            >
              <ChevronDownIcon className="size-4" />
            </Button>
          </div>
        </div>

        <p className="mt-4 font-medium leading-snug text-foreground">
          {questionIndex + 1}. {current.text}
        </p>

        {hasOptions ? (
          <div className="mt-3 flex flex-col gap-2">
            {current.options!.map((option, i) => {
              const label = String.fromCharCode(65 + i)
              const isSelected = selectedAnswer === option
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectAnswer(option)}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-3">
            <Input
              value={selectedAnswer}
              onChange={(e) => onSelectAnswer(e.target.value)}
              placeholder="Type your answer…"
              className="w-full"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip} disabled={isLoading}>
            Skip
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onContinue(current.id, selectedAnswer, optionalDetails)}
            disabled={!canContinue || isLoading}
          >
            Continue
            <ArrowRightIcon className="ml-1 size-4" />
          </Button>
        </div>
      </div>

      <div className="px-0.5">
        <Input
          value={optionalDetails}
          onChange={(e) => onOptionalDetailsChange(e.target.value)}
          placeholder="Add more optional details"
          className="w-full text-sm"
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
