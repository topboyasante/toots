import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { Router, RouterClient } from "@/server/base"
import { router } from "@/server/base"

declare global {
  // eslint-disable-next-line no-var
  var $client: RouterClient<typeof router> | undefined
}

const link = new RPCLink({
  url:
    typeof window !== "undefined"
      ? `${window.location.origin}/rpc`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/rpc`,
  headers: async () => {
    if (typeof window !== "undefined") return {}
    const { headers } = await import("next/headers")
    return await headers()
  },
})

/**
 * Typed RPC client. Use from server or client components.
 * On the server, uses the direct router client when available (SSR optimization).
 * In the browser, uses HTTP to /rpc.
 *
 * @example
 * const result = await rpc.projects.list({ limit: 10 })
 */
export const rpc: RouterClient<Router> =
  ((typeof window === "undefined" && globalThis.$client) ??
    createORPCClient(link)) as RouterClient<Router>
