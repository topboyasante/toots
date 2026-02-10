import { prisma } from "@/lib/db"
import { listTicketsInput } from "@/lib/schema/project"
import { base } from "@/server/context"

export const listTickets = base.input(listTicketsInput).handler(async ({ input }) => {
  const tickets = await prisma.ticket.findMany({
    where: { projectId: input.projectId },
    orderBy: { sortOrder: "asc" },
  })
  return tickets
})

export const ticketsRouter = {
  list: listTickets,
}
