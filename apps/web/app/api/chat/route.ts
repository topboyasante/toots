import { streamText, convertToModelMessages, UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { tools } from "@/ai/tools";

const SYSTEM_PROMPT = `You are a helpful assistant that helps users break down project ideas into actionable tickets.

When a user describes a project idea, you should call the generateTickets tool with their project idea. The tool will generate a comprehensive set of Jira/Linear-style tickets for them.

Simply call the generateTickets tool with the project idea the user provides.`;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log("[API] Received messages:", messages.length);
    console.log("[API] Last message:", messages[messages.length - 1]);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      tools,
      onFinish: async ({ text, toolCalls, toolResults }) => {
        console.log("[API] Stream finished");
        console.log("[API] Text:", text);
        console.log("[API] Tool calls:", toolCalls);
        console.log("[API] Tool results:", toolResults);
      },
    });

    console.log("[API] Starting stream...");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[API] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
