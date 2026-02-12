# Toots

**AI-native product discovery and project management** — upload customer interviews, feedback, and usage data; let AI tell you *what to build* and *why*; then break it into actionable tickets for your team or coding agent.

> Inspired by the idea of a **"Cursor for product management"**: an AI system focused on helping teams figure out what to build, not just how to build it.

## Vision

Most AI tools today help you *write code faster*. But writing code is only part of building a product people want. The hardest part is figuring out **what to build in the first place** — talking to users, synthesizing feedback, and deciding what problems are worth solving.

Toots aims to close that gap. Instead of starting with an idea you already have, Toots helps you:

1. **Ingest real data** — customer interviews, support tickets, product analytics, user feedback
2. **Surface insights** — AI synthesizes patterns across your data ("12/40 interviewees struggle with onboarding")
3. **Recommend what to build** — evidence-ranked feature proposals with citations back to source data
4. **Generate actionable tickets** — Jira/Linear-style issues grounded in evidence, ready for your team or coding agent

## Features

### Implemented

- **Auth** — Email/password sign-up and login (better-auth). Route protection for signed-in/signed-out users.
- **AI-generated tickets** — Describe a project; the AI asks clarifying questions, then generates tickets (Story, Task, Epic, etc.) with priority, effort, acceptance criteria, dependencies, and labels. Powered by Gemini.
- **Kanban board** — Drag-and-drop board (To Do → In Progress → Done) with persistent status updates.
- **Ticket detail** — Slide-out sheet to view and edit all ticket fields; delete with confirmation.
- **Projects & persistence** — Projects and tickets stored in PostgreSQL. Sidebar lists your projects grouped by month.
- **Project chat** — Collapsible chat panel per project to refine scope and request ticket changes via AI.

### Roadmap (the pivot)

The following features represent the pivot toward full product discovery. See [GitHub Issues](https://github.com/topboyasante/toots/issues) for detailed tasks.

- **Data source ingestion** — Upload or paste customer interviews, support tickets, survey results, and feedback. Parse and chunk text for AI analysis.
- **Knowledge base & embeddings** — Embed ingested data using pgvector for semantic retrieval. Enable the AI to search across all your customer data.
- **Insight extraction** — AI analyzes uploaded data to extract themes, pain points, feature requests, and opportunities, each with evidence strength and citations.
- **Insights dashboard** — A dedicated view showing synthesized insights ranked by evidence, with links back to source data.
- **"What should we build?" mode** — A new entry point alongside the existing "describe your project" flow. The AI recommends features based on ingested evidence instead of a user's idea.
- **Insight → Project bridge** — One click to turn an insight into a project with evidence-grounded tickets.
- **Evidence-aware chat** — When a project originates from an insight, the AI cites source data in its recommendations and ticket descriptions.
- **Data source integrations** — Connect to external tools (Intercom, PostHog, Zendesk, Slack, etc.) to automatically ingest customer signals.
- **Export** — Send tickets to Jira or Linear (OAuth, one-way export).
- **Coding agent handoff** — Format ticket output for coding agents (Cursor, Claude Code) with proposed UI changes, data model diffs, and workflow descriptions.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Data Sources (the "input" layer)               │
│  ┌───────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Interviews│ │ Analytics│ │ Feedback /     │  │
│  │ & Notes   │ │ Events   │ │ Support        │  │
│  └─────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│        └─────────────┼──────────────┘           │
│                      ▼                          │
│  Knowledge Base (embeddings + retrieval)        │
│                      │                          │
│                      ▼                          │
│  Insight Engine ("what should we build?")       │
│                      │                          │
│                      ▼                          │
│  Project + Ticket Generation                    │
│  (chat, clarifying questions, Kanban board)     │
└─────────────────────────────────────────────────┘
```

## Tech stack

- **Monorepo** — pnpm workspaces, Turborepo
- **App** — Next.js (App Router), React 19
- **API** — oRPC (type-safe RPC), Prisma, PostgreSQL
- **Auth** — better-auth (email/password)
- **AI** — Vercel AI SDK, Google Gemini
- **UI** — shadcn/ui (shared in `packages/ui`), Tailwind CSS, dnd-kit for Kanban
- **Embeddings** — pgvector (planned)

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

   Start PostgreSQL (e.g. with the project's Compose file):

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

## Contributing

This project is open source. Check the [GitHub Issues](https://github.com/topboyasante/toots/issues) for tasks to pick up — they're designed to be self-contained and actionable. Contributions welcome!

## License

MIT
