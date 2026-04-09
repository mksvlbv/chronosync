# ChronoSync — AI Prompt Log

This document records every significant AI prompt used in developing ChronoSync, a full-stack time-tracking application. Each entry follows a structured format: context, prompt, outcome, and architectural reasoning.

**AI Tools Used:** Windsurf (Cascade) for code generation, Variant AI for UI design references.

---

## Session 1: Project Setup & Architecture

### Prompt 1 — Project Initialization
**Context:** Starting a greenfield time-tracker application.
**Prompt:** Initialize a Next.js 14 project with TypeScript, TailwindCSS, Prisma ORM, Zustand, and Supabase Postgres. Set up the project structure with four architectural layers: UI components, Zustand stores, API client, and Prisma data layer.
**Outcome:** Created `chronosync` project with all dependencies installed. Configured TailwindCSS v4 with custom design tokens (dark theme, brand colors, typography scale). Established the `src/` directory structure.
**Reasoning:** Four-layer architecture ensures separation of concerns: UI components are decoupled from data fetching, Zustand manages client state independently, API client abstracts fetch logic, and Prisma handles database operations through type-safe queries.

### Prompt 2 — Database Schema Design
**Context:** Designing the data model for a time-tracking application with three core domain entities.
**Prompt:** Create a Prisma schema with three domain entities: Project (with color and client fields), TimeEntry (with start/stop timestamps, duration, and project reference), and TaskName (for autocomplete suggestions with usage tracking). Add proper indexes and cascading deletes.
**Outcome:** Generated `schema.prisma` with three models, composite unique constraint on TaskName, and database indexes on frequently queried fields (projectId, startTime, name). Successfully migrated to Supabase Postgres.
**Reasoning:** TaskName as a separate entity (rather than a string field) enables efficient autocomplete queries, usage-frequency sorting, and project-scoped suggestions. The `usageCount` field allows ranking suggestions by relevance.

### Prompt 3 — API Layer
**Context:** Building RESTful API routes for all CRUD operations.
**Prompt:** Create Next.js API routes for: Projects CRUD, TimeEntries CRUD with start/stop functionality, TaskName autocomplete search, and Reports aggregation (with day/week/month periods, project distribution, and chart data).
**Outcome:** Created 7 API route files handling all operations. Reports endpoint returns pre-computed chart data with per-day breakdowns and project aggregations.
**Reasoning:** Server-side aggregation in the Reports endpoint reduces client-side computation and keeps the UI layer thin. The stop endpoint is separate from the general update to enforce business logic (auto-calculating duration from timestamps).

---

## Session 2: State Management & API Client

### Prompt 4 — Zustand Stores
**Context:** Client-side state management for timer, entries, and projects.
**Prompt:** Create three Zustand stores: TimerStore (manages running state, elapsed seconds, active entry), EntriesStore (today's entries with CRUD), ProjectsStore (project list with load/add/update/remove). Include a "continue task" feature that restarts tracking with the same description and project.
**Outcome:** Three stores with clean interfaces, optimistic UI updates for deletions, and automatic data refresh after mutations.
**Reasoning:** Separating into three stores prevents unnecessary re-renders. The timer store manages an interval internally, keeping timing logic contained. The "continue task" feature was added based on real-world time-tracking UX patterns.

### Prompt 5 — Type-Safe API Client
**Context:** Abstracting fetch calls into a dedicated layer.
**Prompt:** Create a typed API client layer under `src/lib/api/` with functions for each endpoint. Include TypeScript interfaces matching the Prisma schema and proper error handling.
**Outcome:** Four API client modules (projects, time-entries, task-names, reports) with full TypeScript coverage and consistent error handling.
**Reasoning:** This layer decouples components from fetch implementation details. If the API contract changes, only this layer needs updating. TypeScript interfaces provide compile-time safety across the client-server boundary.

---

## Session 3: UI Implementation

### Prompt 6 — Design System & Layout
**Context:** Translating Variant AI design references into a production design system.
**Prompt:** Create a dark-theme design system matching the Variant AI references: base colors (#09090b through #f4f4f5), brand emerald (#10b981), Inter + JetBrains Mono fonts, custom scrollbar, selection color, and a timer-pulse animation. Build a header with pill navigation, avatar, and active timer indicator.
**Outcome:** Complete design system in `globals.css` using TailwindCSS v4 `@theme` directive. Header component with desktop pill navigation, mobile bottom nav, and a green pulsing timer badge visible when tracking.
**Reasoning:** Using CSS custom properties through Tailwind's `@theme` ensures design tokens are available everywhere without extra configuration. The timer badge in the header provides persistent feedback about tracking state across all pages.

### Prompt 7 — Dashboard (Timer + Entries)
**Context:** Building the main page with timer controls and today's entries.
**Prompt:** Create the dashboard with: a large monospace timer display (5-10rem), task description input with autocomplete, project selector dropdown, start/stop button with glow effects, and a grouped-by-project entries list with inline editing, deletion, and "continue task" buttons.
**Outcome:** Four components (TimerInput, TimerDisplay, TimeEntryList, page.tsx) implementing the full dashboard. Timer uses text-shadow glow when active. Entries show hover actions for edit/delete.
**Reasoning:** Component decomposition follows single-responsibility: TimerInput handles task setup, TimerDisplay handles the clock and button, TimeEntryList handles the log. Grouping entries by project matches the design reference and improves scannability.

### Prompt 8 — Projects Page
**Context:** Project management with CRUD and color selection.
**Prompt:** Build the Projects page with a card grid, modal dialog for add/edit (name, client, 8-color picker), delete confirmation overlay, and empty state. Include total tracked time per project.
**Outcome:** Full Projects page with responsive grid, modal with color picker, inline delete confirmation, and an inviting empty state with CTA.
**Reasoning:** The delete confirmation as an overlay on the card (rather than a separate modal) reduces context switching. The 8-color palette matches the design reference and prevents choice paralysis.

### Prompt 9 — Reports Page
**Context:** Analytics view with charts, filters, and CSV export.
**Prompt:** Create the Reports page with: period selector (Day/Week/Month), date navigation, stacked bar chart colored by project, summary card (total tracked, daily average), detailed activities table, and CSV export.
**Outcome:** Complete reports page with custom bar chart, responsive layout, and browser-native CSV download.
**Reasoning:** Custom bar chart (instead of a heavy charting library) keeps bundle size small and matches the design exactly. CSV export uses Blob API for client-side generation without server round-trips.

---

## Session 4: Polish & Deployment

### Prompt 10 — Keyboard Shortcuts & Seed Data
**Context:** Adding productivity features and demo data.
**Prompt:** Add Space key shortcut for start/stop timer (disabled when focused on inputs). Create a seed script with 4 projects and 11 time entries spread across a week for realistic demo data.
**Outcome:** KeyboardShortcuts component with proper input detection. Seed script populates database with believable project names and time distributions.
**Reasoning:** Keyboard shortcuts are expected in productivity tools. Seed data ensures the deployed demo looks polished and demonstrates all features immediately.

### Prompt 11 — Prisma 7 Adapter Configuration
**Context:** Resolving Prisma 7 breaking changes (driver adapters required).
**Prompt:** Configure Prisma 7 with @prisma/adapter-pg for database connections. Update prisma.config.ts to use DIRECT_URL for migrations (bypassing pgbouncer) and DATABASE_URL with connection pooling for the application.
**Outcome:** Working Prisma 7 setup with proper dual-URL configuration for Supabase's connection pooler architecture.
**Reasoning:** Supabase uses pgbouncer for connection pooling (port 6543), which is incompatible with Prisma migrations. The DIRECT_URL (port 5432) bypasses pgbouncer for schema changes, while DATABASE_URL uses pooling for application queries.
