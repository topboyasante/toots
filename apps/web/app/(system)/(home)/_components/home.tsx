"use client"

import {
  projectIdeaFormSchema,
  type ProjectIdeaFormValues,
} from "@/lib/schema/project"
import { rpc } from "@/lib/orpc"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { zodResolver } from "@hookform/resolvers/zod"
import { Paperclip, Plus, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { type Resolver, Controller, useForm } from "react-hook-form"

export default function Home() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProjectIdeaFormValues>({
    resolver: zodResolver(
      projectIdeaFormSchema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<ProjectIdeaFormValues>, //did this because of the type errors i was getting, but if you know a better way to do this, please let me know
    defaultValues: {
      idea: "",
    },
  })

  async function onSubmit(data: ProjectIdeaFormValues) {
    try {
      const trimmed = data.idea.trim()
      const firstLine = trimmed.split("\n")[0] ?? trimmed
      const name = firstLine.slice(0, 80)
      const description = trimmed

      const project = await rpc.projects.create({ name, description })
      router.push(`/project/${project.id}`)
      router.refresh()
    } catch (err) {
      form.setError("idea", {
        message: err instanceof Error ? err.message : "Failed to create project",
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto shadow-card rounded-4xl px-3 py-5">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Describe your project idea
        </h1>
        <p className="mt-2 text-sm text-muted-foreground/80">
          We&apos;ll ask clarifying questions, then generate Jira/Linear-style
          tickets with priorities, effort, and acceptance criteria.
        </p>
      </div>

      <div className="bg-card shadow-card rounded-2xl overflow-hidden border border-border">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={() => {}}
        />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-3 pt-3 pb-2 grow">
            <Controller<ProjectIdeaFormValues>
              name="idea"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Project idea
                  </FieldLabel>
                  <textarea
                    {...field}
                    id={field.name}
                    placeholder="e.g. A mobile app for team standups with async video notes and daily digests"
                    className="w-full bg-transparent p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground resize-none border-none outline-none text-sm min-h-10 max-h-[25vh]"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                    onInput={(e) => {
                      field.onChange(e);
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = target.scrollHeight + "px";
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="mb-2 px-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full border border-border hover:bg-accent"
                  >
                    <Plus className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-w-xs rounded-2xl p-1.5"
                >
                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem
                      className="rounded-[calc(1rem-6px)] text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={16} className="opacity-60" />
                      Attach files
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              type="submit"
              disabled={!form.watch("idea")?.trim() || form.formState.isSubmitting}
              className="size-7 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="size-3 fill-primary" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
