"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconMicrophone,
    IconPaperclip,
    IconPlus,
    IconSend
} from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Field, FieldGroup } from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  message: z
    .string()
    .min(10, "Please provide more details about your project idea.")
    .max(1000, "Your project idea is too long."),
  attachments: z
    .array(z.instanceof(File))
    .max(5, "You can attach up to 5 files.")
    .optional(),
});

function ProjectIdeaForm() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: "",
      attachments: [],
    },
  });

  function handleSubmit(data: z.infer<typeof schema>) {
    const projectId = crypto.randomUUID();
    router.push(`/project/${projectId}?idea=${encodeURIComponent(data.message)}`);
  }

  return (
    <div>
      <form className="group/composer w-full" id="p-idea-form" onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="attachments"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {}}
                />
              </Field>
            )}
          />
        </FieldGroup>

        <div
          className={cn(
            "w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-border transition-all duration-200",
            {
              "rounded-3xl grid grid-cols-1 grid-rows-[auto_1fr_auto]":
                isExpanded,
              "rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]":
                !isExpanded,
            }
          )}
          style={{
            gridTemplateAreas: isExpanded
              ? "'header' 'primary' 'footer'"
              : "'header header header' 'leading primary trailing' '. footer .'",
          }}
        >
          <div
            className={cn(
              "flex min-h-14 items-center overflow-x-hidden px-1.5",
              {
                "px-2 py-1 mb-0": isExpanded,
                "-my-2.5": !isExpanded,
              }
            )}
            style={{ gridArea: "primary" }}
          >
            <div className="flex-1 overflow-auto max-h-52">
              <Controller
                control={form.control}
                name="message"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      {...field}
                      placeholder="Describe your project idea..."
                      className="min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin dark:bg-transparent"
                      rows={1}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div
            className={cn("flex", { hidden: isExpanded })}
            style={{ gridArea: "leading" }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-accent outline-none ring-0"
                >
                  <IconPlus className="size-6 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-w-xs rounded-2xl p-1.5"
              >
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPaperclip size={20} className="opacity-60" />
                    Add photos & files
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div
            className="flex items-center gap-2"
            style={{ gridArea: isExpanded ? "footer" : "trailing" }}
          >
            <div className="ms-auto flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-accent"
              >
                <IconMicrophone className="size-5 text-muted-foreground" />
              </Button>

              {form.formState.isValid && (
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <IconSend className="size-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
      <form></form>
    </div>
  );
}

export default ProjectIdeaForm;
