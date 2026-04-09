# ChronoSync — Time Tracker

A production-ready time-tracking application built with Next.js 16, Prisma ORM, Supabase Postgres, and Zustand. Designed from Variant AI references with a premium dark-theme UI.

## Live Demo

🔗 [chronosync-nu.vercel.app](https://chronosync-nu.vercel.app)

## Features

- **Timer** — Start/stop with real-time display, keyboard shortcut (Space), task autocomplete
- **Time Entries** — Inline editing, grouped by project, "continue task" for quick restart
- **Projects** — CRUD with 8-color palette, client/tag, total tracked time per project
- **Reports** — Day/Week/Month views, stacked bar chart, CSV export, detailed activities table
- **Responsive** — Adaptive layout with mobile bottom navigation

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # RESTful endpoints (Projects, TimeEntries, TaskNames, Reports)
│   ├── projects/           # Projects management page
│   └── reports/            # Analytics & reporting page
├── components/             # React UI components
├── store/                  # Zustand state management (timer, entries, projects)
├── lib/
│   ├── api/                # Type-safe API client layer
│   ├── prisma.ts           # Database client singleton
│   └── utils.ts            # Shared utilities, formatters, constants
└── generated/prisma/       # Auto-generated Prisma client
```

**4-Layer Architecture:**
1. **UI Components** — Presentational React components with TailwindCSS
2. **State (Zustand)** — Client-side stores for timer, entries, projects
3. **API Client** — Typed fetch wrappers abstracting server communication
4. **Data (Prisma)** — Type-safe ORM queries, schema, and migrations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase Postgres |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| State | Zustand |
| Styling | TailwindCSS v4 |
| Fonts | Inter, JetBrains Mono |

## Domain Entities

- **Project** — `id`, `name`, `color`, `client`
- **TimeEntry** — `id`, `description`, `startTime`, `endTime`, `duration`, `projectId`
- **TaskName** — `id`, `name`, `projectId`, `usageCount`, `lastUsedAt`

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase connection strings

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed demo data
node --import tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Tools

This project was built entirely using AI-assisted development:
- **Windsurf (Cascade)** — Architecture, code generation, debugging
- **Variant AI** — UI design references and design system DNA

See [PROMPT_LOG.md](./PROMPT_LOG.md) for detailed prompt history.
