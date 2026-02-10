import "server-only"

import "@/lib/db"
import { auth } from "@/lib/auth"
import type { RouterClient } from "@/server/base"
import { router } from "@/server/base"
import { createRouterClient } from "@orpc/server"
import { headers } from "next/headers"

;(globalThis as { $client?: RouterClient<typeof router> }).$client =
  createRouterClient(router, {
    context: async () => {
      const h = await headers()
      const session = await auth.api.getSession({ headers: h })
      return { headers: h, session }
    },
  })
