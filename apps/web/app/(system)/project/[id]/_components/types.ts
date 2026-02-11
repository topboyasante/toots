/** Ticket as returned from rpc.tickets.list (Prisma Ticket model) */
export type Ticket = {
  id: string
  projectId: string
  title: string
  type: string
  priority: string
  description: string
  acceptanceCriteria: unknown
  estimatedEffort: string
  dependencies: unknown
  labels: unknown
  sortOrder: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export const KANBAN_STATUSES = ["todo", "in-progress", "done"] as const
export type KanbanStatus = (typeof KANBAN_STATUSES)[number]

export const STATUS_LABELS: Record<KanbanStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
}
