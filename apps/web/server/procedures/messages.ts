import { prisma } from "@/lib/db"
import { listMessagesInput } from "@/lib/schema/project"
import { base } from "@/server/context"

export const listMessages = base.input(listMessagesInput).handler(async ({ input }) => {
  if (typeof (prisma as { message?: unknown }).message === "undefined") {
    throw new Error(
      "Prisma client is missing the Message model. Run: cd apps/web && pnpm exec prisma generate, then restart the dev server."
    )
  }
  const messages = await prisma.message.findMany({
    where: { projectId: input.projectId },
    orderBy: { createdAt: "asc" },
  })
  return messages
})

export const messagesRouter = {
  list: listMessages,
}
