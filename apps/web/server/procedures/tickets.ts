import { prisma } from "@/lib/db"
import {
  deleteTicketInput,
  listTicketsInput,
  updateTicketInput,
  updateTicketStatusInput,
} from "@/lib/schema/project"
import { base, protectedBase } from "@/server/context"

export const listTickets = base.input(listTicketsInput).handler(async ({ input }) => {
  const tickets = await prisma.ticket.findMany({
    where: { projectId: input.projectId },
    orderBy: { sortOrder: "asc" },
  })
  return tickets
})

export const updateTicket = protectedBase.input(updateTicketInput).handler(async ({ input, context }) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: input.id },
    include: { project: true },
  })
  if (!ticket || ticket.project.userId !== context.user.id) {
    throw new Error("Ticket not found")
  }
  const { id, ...data } = input
  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.type !== undefined) updateData.type = data.type
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.description !== undefined) updateData.description = data.description
  if (data.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = data.acceptanceCriteria
  if (data.estimatedEffort !== undefined) updateData.estimatedEffort = data.estimatedEffort
  if (data.dependencies !== undefined) updateData.dependencies = data.dependencies
  if (data.labels !== undefined) updateData.labels = data.labels
  if (data.status !== undefined) updateData.status = data.status
  return prisma.ticket.update({
    where: { id },
    data: updateData,
  })
})

export const updateTicketStatus = protectedBase
  .input(updateTicketStatusInput)
  .handler(async ({ input, context }) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: input.id },
      include: { project: true },
    })
    if (!ticket || ticket.project.userId !== context.user.id) {
      throw new Error("Ticket not found")
    }
    return prisma.ticket.update({
      where: { id: input.id },
      data: { status: input.status },
    })
  })

export const deleteTicket = protectedBase.input(deleteTicketInput).handler(async ({ input, context }) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: input.id },
    include: { project: true },
  })
  if (!ticket || ticket.project.userId !== context.user.id) {
    throw new Error("Ticket not found")
  }
  await prisma.ticket.delete({
    where: { id: input.id },
  })
  return { success: true }
})

export const ticketsRouter = {
  list: listTickets,
  update: updateTicket,
  updateStatus: updateTicketStatus,
  delete: deleteTicket,
}
