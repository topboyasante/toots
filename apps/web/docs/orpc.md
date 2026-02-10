# oRPC in this project

A short guide to oRPC and how we use it, for anyone new to the codebase.

## What is oRPC?

**oRPC** is a **type-safe RPC (Remote Procedure Call)** layer over HTTP. You define procedures on the server (with inputs and outputs), and call them from the client like normal async functions. Types flow from server to client, so you get autocomplete and compile-time checks without writing API types by hand.

- **One router** holds all procedures, organized in nested objects (e.g. `projects.list`, `projects.create`).
- **Procedures** are like API endpoints: they accept input (validated with Zod), run logic, and return data.
- **Context** (e.g. auth session, request headers) is provided once per request and is available inside every procedure.
- **Middleware** can run before procedures (e.g. to require auth or add to context).

## Core concepts

| Concept | What it is |
|--------|-------------|
| **Router** | A plain object whose keys are procedure names or nested routers. Our root router lives in `server/base.ts`. |
| **Procedure** | A single “endpoint”: input schema, optional middleware, and a handler that does the work. |
| **Input / output validation** | We use **Zod** to validate inputs (and optionally outputs). Invalid input is rejected before the handler runs. |
| **Context** | Data provided per request: headers and session. Built in the route handler and in the server-side client; procedures receive it as `context`. |
| **Middleware** | A function that runs before the handler, can read/change context, and must call `next()` to continue. We use it for auth (e.g. `protectedBase`). |
| **Handler** | The async function that implements the procedure. It receives `{ input, context }` and returns the result. |

## How it fits this project

- **Router**  
  Defined in `server/base.ts`. It composes procedure routers (e.g. `projects`) and exports the root `router` and types (`Router`, `RouterClient`).

- **Procedures**  
  Live under `server/procedures/`. Each file exports a small router (e.g. `projectsRouter` with `list`, `create`, …). These are mounted on the root in `base.ts` (e.g. `router.projects = projectsRouter`).

- **Route handler**  
  `app/rpc/[[...rest]]/route.ts` receives HTTP requests at `/rpc`, gets the session (better-auth), builds context `{ headers, session }`, and passes it to the oRPC handler. All RPC traffic goes through this route.

- **Client**  
  `lib/orpc.ts` exports a typed `rpc` client. In the **browser** it uses HTTP to `/rpc`. On the **server** (e.g. Server Components) it uses a direct router client when available (see SSR below), so no extra HTTP call is made.

- **Auth**  
  Session is fetched in the route handler and in the server-side client and passed as `context.session`. Procedures that require a logged-in user use `protectedBase` (in `base.ts`), which uses middleware that checks `context.session` and adds `context.user`.

- **SSR**  
  `lib/orpc.server.ts` creates a direct router client and assigns it to `globalThis.$client`. It’s loaded from `instrumentation.ts` and from `app/layout.tsx` so it’s ready for server rendering. The shared `rpc` in `lib/orpc.ts` uses this client on the server when present, and falls back to the HTTP client otherwise.

## Quick examples

**Defining a procedure** (e.g. in `server/procedures/projects.ts`):

```ts
import { os } from "@orpc/server"
import { z } from "zod"

export const listProjects = os
  .input(z.object({ limit: z.number().optional().default(20) }))
  .handler(async ({ input, context }) => {
    // context.session, context.headers available
    return { items: [], nextCursor: input.limit }
  })

export const projectsRouter = { list: listProjects }
```

**Calling from the app** (Server or Client Component, or a server action):

```ts
import { rpc } from "@/lib/orpc"

const result = await rpc.projects.list({ limit: 10 })
// result is typed; input is validated
```

**Using auth in a protected procedure** (in `server/base.ts` we have `protectedBase`):

```ts
// In a procedure file, use protectedBase instead of base for procedures that require login
export const createProject = protectedBase
  .input(z.object({ name: z.string() }))
  .handler(async ({ input, context }) => {
    // context.user is set by auth middleware
    return { id: "...", name: input.name }
  })
```

## Learn more

- [oRPC docs](https://orpc.dev) — router, procedures, middleware, adapters.
- [Next.js adapter](https://orpc.dev/docs/adapters/next) — how the route handler and client are set up.
- [Optimize SSR](https://orpc.dev/docs/best-practices/optimize-ssr) — server-side client and `globalThis.$client`.
