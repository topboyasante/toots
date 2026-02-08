# Toots

**AI-powered project manager** — create and manage tickets for tech and non-tech work, export to Jira or Linear, track progress, assign work, award points for completed tasks, and (optionally) have AI agents work on tickets.

## Features

### Implemented

- **AI-generated tickets** — Describe a project idea; the app asks clarifying questions, then generates Jira/Linear-style tickets (Story, Task, Bug, Epic, Feature) with priority, effort, acceptance criteria, dependencies, and labels. Powered by Gemini.
- **Kanban board** — Drag-and-drop board (To Do → In Progress → Done) for generated tickets.
- **Ticket detail view** — Slide-out sheet with full description, acceptance criteria, dependencies, and labels.
- **Project idea flow** — Home page form to enter an idea; redirects to a project chat where tickets are generated.

### Planned

- **Export** — Send boards and tickets to **Jira** or **Linear**.
- **Assignments & points** — Assign tickets and award points to whoever completes them.
- **Persistence** — Save projects and ticket state (currently in-memory only).
- **Agents** — Optional AI agents to work on tickets.

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
