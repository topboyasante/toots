import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { Router, RouterClient } from "@/server/base"

declare global {
  // eslint-disable-next-line no-var
  var $client: RouterClient<Router> | undefined
}

const link = new RPCLink({
  url:
    typeof window !== "undefined"
      ? `${window.location.origin}/rpc`
      : `${process.env.NEXT_PUBLIC_APP_URL}/rpc`,
  headers: async () => {
    if (typeof window !== "undefined") return {}
    const { headers } = await import("next/headers")
    return await headers()
  },
})

function getRpc(): RouterClient<Router> {
  if (typeof window !== "undefined") {
    return createORPCClient(link) as RouterClient<Router>
  }
  return (globalThis.$client ?? createORPCClient(link)) as RouterClient<Router>
}

/**
 * Typed RPC client. Use from server or client components.
 * On the server, uses the direct router client when available (SSR optimization).
 * In the browser, uses HTTP to /rpc.
 *
 * @example
 * const result = await rpc.projects.list({ limit: 10 })
 */
export const rpc = new Proxy({} as RouterClient<Router>, {
  get(_, key) {
    return (getRpc() as Record<string, unknown>)[key as string]
  },
})
