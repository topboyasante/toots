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

export function getPriorityStyle(priority: string): string {
  switch (priority) {
    case "P0":
      return "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
    case "P1":
      return "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
    case "P2":
      return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
    case "P3":
    default:
      return "bg-muted text-muted-foreground"
  }
}

/** Dot color for type badge (pill with dot) */
export function getTypeDotClass(type: string): string {
  switch (type) {
    case "Story":
      return "bg-blue-500"
    case "Task":
      return "bg-emerald-500"
    case "Epic":
      return "bg-violet-500"
    case "Milestone":
      return "bg-amber-500"
    case "Deliverable":
      return "bg-slate-400"
    default:
      return "bg-muted-foreground"
  }
}
