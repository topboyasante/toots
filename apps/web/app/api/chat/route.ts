import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { createTools } from "@/ai/tools";
import { prisma } from "@/lib/db";

function extractText(message: UIMessage): string {
  if (!message.parts?.length) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

const SYSTEM_PROMPT = `You are an expert project manager assistant that helps people turn any work project idea into actionable tickets—whether it's a product launch, a marketing campaign, an event, a process change, an HR initiative, or anything else that happens at work.

YOUR WORKFLOW:
1. When a user first describes a project idea, analyze it and ask 2-4 clarifying questions to gather context. Tailor your questions to the kind of project (e.g. for a campaign: audience and channels; for an event: date and scale; for a process: stakeholders and success metrics). You might ask about:
   - Goals and success criteria
   - Who's involved (stakeholders, audience, customers)
   - Key deliverables or milestones
   - Timeline and constraints
   - Dependencies or things that must be true for success

2. Wait for the user's responses to your questions.

3. After gathering context (or if the user says "skip", "proceed", "generate tickets", "that's enough", or similar), call the generateTickets tool with a clear summary of the project based on the entire conversation.

4. The tool will generate structured tickets that you can then present to the user.

IMPORTANT:
- Ask questions that fit the project type—avoid assuming everything is software or technical
- If the user says "skip", "proceed", "generate", "that's enough", or similar, call the generateTickets tool
- When calling the tool, provide a project description that includes goals, context, and any details from the conversation
- Be friendly and conversational`;

const PROJECT_CONTEXT_PREFIX = (project: {
  id: string
  name: string
  description: string | null
}) =>
  `Current project: ${project.name} (id: ${project.id}). Description: ${project.description ?? "No description"}.\n\n`;

const PROJECT_CHAT_SYSTEM_PROMPT = `You are an expert project manager assistant that helps people turn work project ideas into actionable tickets.

The user has ALREADY SUBMITTED their project idea (see "Current project" above with name and description). Do NOT ask them to describe the idea again.

YOUR WORKFLOW:
1. Start by asking 2-4 clarifying questions tailored to this project. You MUST call the setClarifyingQuestions tool FIRST with the list of questions (each with id, text, and optional options for multiple choice), then send your normal conversational message. Use unique ids per question (e.g. "q1", "q2"). Tailor questions to the project type (e.g. campaign: audience and channels; event: date and scale; process: stakeholders and success metrics). You might ask about goals, who's involved, key deliverables, timeline, or dependencies.

2. Wait for the user's responses. After they answer, you may ask follow-ups (call setClarifyingQuestions again with the new questions if you ask more) or call the generateTickets tool when you have enough context.

3. If the user says they want to skip (e.g. "skip", "skip the questions", "generate tickets now", "I don't want to answer", "skip to ticket generation", or similar), call the generateTickets tool IMMEDIATELY with the project name and description above plus any context from the conversation. Do not ask more questions.

4. When calling generateTickets, provide a clear project summary (name, description, and any details from the conversation).

5. After calling generateTickets, always tell the user clearly that you have generated the tickets (e.g. "I've generated the tickets" or "Done—I've created the tickets") and briefly invite them to check the board or ask for changes.

After tickets exist, the user can ask you to add more (generateTickets), remove some (listTickets then removeTickets with the IDs), or change tickets (listTickets then updateTickets with id and fields). Match ticket references by title when they say things like "remove the onboarding ticket" or "bump the launch task to P0".

IMPORTANT:
- When asking clarifying questions, ALWAYS call setClarifyingQuestions first with the same questions (and options if multiple choice), then reply conversationally.
- Ask questions that fit the project type—avoid assuming everything is software or technical.
- On any clear skip/proceed signal, call generateTickets right away.
- Be friendly and conversational.`;

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "Google Generative AI API key is missing. Set GOOGLE_GENERATIVE_AI_API_KEY in your .env file.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const { messages, project }: { messages: UIMessage[]; project?: { id: string; name: string; description: string | null } } = body

    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === "user" && project) {
      await prisma.message.upsert({
        where: { id: lastMsg.id },
        update: {},
        create: {
          id: lastMsg.id,
          projectId: project.id,
          role: "user",
          content: extractText(lastMsg),
        },
      })
    }

    const systemPrompt = project
      ? PROJECT_CONTEXT_PREFIX(project) + PROJECT_CHAT_SYSTEM_PROMPT
      : SYSTEM_PROMPT

    const ticketGenContext = project ? { ticketsGenerated: false } : undefined
    const tools = createTools(project?.id, ticketGenContext)

    const modelMessages = await convertToModelMessages(messages)
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const result = streamText({
          model: google("gemini-2.5-flash"),
          system: systemPrompt,
          messages: modelMessages,
          tools,
          stopWhen: stepCountIs(2),
          async onFinish({ text }) {
            if (project && text) {
              await prisma.message.create({
                data: {
                  id: generateId(),
                  projectId: project.id,
                  role: "assistant",
                  content: text,
                },
              })
            }
            if (
              ticketGenContext?.ticketsGenerated &&
              !(typeof text === "string" && text.trim())
            ) {
              writer.write({
                type: "data-ticketsGenerated",
                data: { showConfirmation: true },
              })
            }
          },
        })
        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch (error) {
    console.error("[API] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}