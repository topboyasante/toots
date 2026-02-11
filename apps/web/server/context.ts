import { os } from "@orpc/server"

export type RpcContext = {
  headers: Headers
  session: { user: { id: string; email: string; name?: string }; session: object } | null
}

export const base = os.$context<RpcContext>()

const authMiddleware = base.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new Error("Unauthorized")
  }
  return next({
    context: { ...context, user: context.session.user },
  })
})

export const protectedBase = base.use(authMiddleware)
