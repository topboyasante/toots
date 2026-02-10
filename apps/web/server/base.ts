import { type RouterClient } from "@orpc/server"
import { projectsRouter } from "./procedures/projects"
import { base, protectedBase, type RpcContext } from "./context"

export type { RpcContext }
export { base, protectedBase }

const router = {
  projects: projectsRouter,
}

export { router }
export type Router = typeof router
export type { RouterClient }
