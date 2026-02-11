import { auth } from "@/lib/auth"
import { router } from "@/server/base"
import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

async function handleRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {
      headers: request.headers,
      session,
    },
  })

  return response ?? new Response("Not found", { status: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest