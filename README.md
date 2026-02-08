# Toots

**AI-powered project manager** — create and manage tickets for tech and non-tech work, export to Jira or Linear, track progress, assign work, award points for completed tasks, and (optionally) have AI agents work on tickets.

## Features

- **AI-generated tickets** — Describe a project idea and get tickets generated for tech and non-tech use cases.
- **Export** — Send boards and tickets to **Jira** or **Linear**.
- **Tracking** — Kanban-style boards, assignments, and status tracking.
- **Points & recognition** — Assign and award points to whoever completes tickets.
- **Agents** — Optional AI agents to work on tickets (planned).

## Tech stack

- Monorepo: **pnpm**, **Turborepo**
- App: **Next.js**, **shadcn/ui** (shared in `packages/ui`)

## Development

```bash
pnpm install
pnpm dev
```

### Adding UI components

From the repo root, add shadcn components to the web app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components live in `packages/ui/src/components`. Use them in the app via:

```tsx
import { Button } from "@workspace/ui/components/button"
```

Tailwind and `globals.css` are set up to use the shared `ui` package.
