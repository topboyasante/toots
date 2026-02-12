# Toots

**AI-powered project assistant** — describe a project, get AI-generated tickets, manage them on a Kanban board, and (planned) export to Jira or Linear.

## Features

### Implemented

- **Auth** — Email/password sign up and login (better-auth). Route protection: signed-out users are redirected to login; signed-in users visiting `/login` or `/register` are redirected to the app.
- **AI-generated tickets** — Describe a project on the home page; the app asks clarifying questions in a project chat, then generates Jira/Linear-style tickets (Story, Task, Epic, etc.) with priority, effort, acceptance criteria, dependencies, and labels. Powered by Gemini.
- **Kanban board** — Drag-and-drop board (To Do → In Progress → Done) for project tickets. Status updates persist.
- **Ticket detail** — Slide-out sheet to view and edit ticket title, description, type, priority, effort, acceptance criteria, dependencies, labels, and status; delete with confirmation.
- **Projects & persistence** — Projects and tickets stored in PostgreSQL. Sidebar lists your projects; create new projects from home. Project URLs use id (`/project/[id]`).
- **Project chat** — Collapsible chat panel per project to refine scope and request more ticket changes (add, remove, update) via AI.

### Planned

- **Export** — Send tickets to **Jira** or **Linear** (OAuth; one-way export).
- **Assignments & points** — Assign tickets and award points for completed work.
- **Agents** — Optional AI agents to work on tickets.

## Tech stack

- **Monorepo** — pnpm workspaces, Turborepo
- **App** — Next.js (App Router), React 19
- **API** — oRPC (type-safe RPC), Prisma, PostgreSQL
- **Auth** — better-auth (email/password)
- **AI** — Vercel AI SDK, Google Gemini
- **UI** — shadcn/ui (shared in `packages/ui`), Tailwind CSS, dnd-kit for Kanban

## Development

### Prerequisites

- Node.js ≥ 20
- pnpm
- PostgreSQL (local or Docker)

### Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Database**

   Start PostgreSQL (e.g. with the project’s Compose file):

   ```bash
   docker compose up -d
   ```

   Ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are set (e.g. in a root `.env` or export them). Defaults often used: `postgres` / `postgres` / `toots`.

3. **Environment**

   In `apps/web`, create a `.env` file with:

   - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5432/toots`)
   - `BETTER_AUTH_SECRET` — Random secret for session signing
   - `BETTER_AUTH_URL` — Base URL of the app (e.g. `http://localhost:3000`)
   - `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key for ticket generation

4. **Migrations**

   From the repo root (or `apps/web`):

   ```bash
   pnpm --filter web db:migrate
   ```

   Or from `apps/web`: `pnpm db:migrate`

5. **Run the app**

   ```bash
   pnpm dev
   ```

   This starts the Next.js app (and any other Turborepo dev targets). Open `http://localhost:3000`.

### Useful commands

- `pnpm dev` — Start dev server
- `pnpm build` — Build all apps
- `pnpm --filter web db:studio` — Open Prisma Studio for the web app DB
- `pnpm --filter web db:generate` — Regenerate Prisma client

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
