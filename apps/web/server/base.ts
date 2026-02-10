import { type RouterClient } from "@orpc/server"
import { messagesRouter } from "./procedures/messages"
import { projectsRouter } from "./procedures/projects"
import { ticketsRouter } from "./procedures/tickets"
import { base, protectedBase, type RpcContext } from "./context"

export type { RpcContext }
export { base, protectedBase }

const router = {
  projects: projectsRouter,
  messages: messagesRouter,
  tickets: ticketsRouter,
}

export { router }
export type Router = typeof router
export type { RouterClient }
