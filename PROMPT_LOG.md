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

---

## Session 5: Full Audit & Design Fidelity Pass

### Prompt 12 — Comprehensive Audit (Round 1)
**Context:** Post-deployment quality review against the original specification and Variant AI design references.
**Prompt:** Conduct a full audit of the project: compare every component against the 6 HTML design references, check all functionality, responsive behavior, and compliance with the technical specification.
**Outcome:** Identified 3 P0 critical bugs, 6 P1 UX issues, and 4 P2 polish items. Fixed all:
- Timer persistence (restore running timer on page reload via `/api/time-entries/running` endpoint)
- ContinueEntry refresh (entries list updates after restarting a task)
- Mobile touch visibility (action buttons always visible on touch devices)
- Bottom padding for mobile nav on all pages
- Disabled timer input while running (prevents orphaned state changes)
- Enter/Escape keyboard handling in project modal
- Phosphor Icons in mobile navigation
- Toast notification system for API error feedback
**Reasoning:** Timer persistence is critical for a time-tracker — losing a running timer on page refresh is a data-integrity issue. The `/api/time-entries/running` endpoint queries for entries without `endTime`, enabling the client to restore state from the database.

### Prompt 13 — Design Fidelity Audit (Round 2)
**Context:** Pixel-level comparison against all 6 Variant AI HTML reference files.
**Prompt:** Compare every component against the design references. Replace all inline SVGs with Phosphor Icons (as specified in the ТЗ), convert Projects page from card grid to list-row layout matching the reference, add "Recent:" task chips below the timer input.
**Outcome:** Replaced all inline SVGs across 6 component files with `@phosphor-icons/react` components (ListPlus, CaretDown, Play, Stop, PencilSimple, Trash, ArrowRight, Clock, Plus, X, FolderDashed, DownloadSimple, CaretLeft, CaretRight, ClockCountdown). Rewrote Projects page layout from 3-column card grid to full-width list rows. Added "Recent:" quick-pick chips. Fixed button texts ("Start", "Add Project").
**Reasoning:** The ТЗ explicitly requires `@phosphor-icons/react`. Inline SVGs, while functional, break consistency with the design system and add unnecessary bundle weight. The list-row layout for projects matches the reference exactly and provides better information density on desktop.

### Prompt 14 — Polish Pass (Skeletons, Toasts, Reports)
**Context:** Addressing four P3 cosmetic observations from the audit.
**Prompt:** Replace loading spinners with skeleton shimmer loaders on all pages. Add success toast notifications for all CRUD actions (create/edit/delete project, edit/delete entry, stop timer). Change Reports "Day" mode to show 24-hour breakdown instead of a single bar. Show em-dash for zero-duration projects.
**Outcome:** Added `.skeleton` CSS class with shimmer animation. Skeleton loaders replace spinners on Dashboard, Projects, and Reports pages. Success toasts added to all three Zustand stores. Reports API generates hourly chart data when `period=day`. `formatDurationShort(0)` returns "—".
**Reasoning:** Skeleton loaders provide better perceived performance than spinners by hinting at content shape. Success toasts close the feedback loop — users need confirmation that actions completed, not just absence of errors. Hourly breakdown in Day mode makes the chart useful for single-day analysis.

### Prompt 15 — Final Cleanup
**Context:** Final audit sweep before submission.
**Prompt:** Remove unused `recharts` dependency (200KB dead weight). Create `.env.example` for repository onboarding. Un-ignore it in `.gitignore`. Verify `@types/pg` is present in devDependencies.
**Outcome:** Removed `recharts` (37 packages), `.env.example` committed with `DATABASE_URL` and `DIRECT_URL` placeholders, `@types/pg` confirmed in devDependencies.
**Reasoning:** Unused dependencies increase install time and bundle size. `.env.example` is essential for developer onboarding — without it, cloning the repo requires guessing environment variable names.

### Prompt 16 — UI Bug Fixes (Responsive)
**Context:** User-reported visual bugs on mobile: overlapping chart elements on Reports Day/Month, Start button overlapping input dropdown, missing 3rd bottom nav item, cramped chart legend, tight spacing between timer and entries.
**Prompt:** Fix overlapping elements on Reports page (Day/Month chart overflow), dropdown z-index vs Start button, mobile bottom nav showing only 2 of 3 items, chart legend/title overlap on mobile, delete confirmation layout on narrow screens, and spacing between timer section and entries list.
**Outcome:** Chart scrolls horizontally when >10 bars. Start button z-index lowered from z-20 to z-10. Added `overflow-x-hidden` on body and `overflow-x-clip` on timer page to prevent 800px glow element from creating horizontal scroll. Reports summary card becomes compact horizontal bar on mobile. Legend uses inline scrollable row. Delete confirmation stacks vertically on mobile. Divider margin increased.
**Reasoning:** The 800px background glow element caused document-level horizontal overflow on mobile viewports, pushing the fixed bottom nav beyond the visible area. Each fix was minimal and scoped to the specific viewport breakpoint causing the issue.

### Prompt 17 — Playwright E2E Audit
**Context:** Manual bug discovery was unreliable. Automated testing needed to catch visual and functional regressions across all viewports.
**Prompt:** Install Playwright, write comprehensive visual screenshot tests (every page × 3 viewports × all states) and functional E2E tests (timer lifecycle, project CRUD, entry editing, reports navigation, CSV export, keyboard shortcuts, responsive layout checks). Run all tests, review 46 screenshots, fix issues found.
**Outcome:** 31 Playwright tests, all passing. 46 screenshots captured across Desktop (1440px), Tablet (768px), and Mobile (412px). Automated checks for: horizontal overflow, bottom nav visibility, dropdown z-index positioning, element spacing, title/legend overlap. Additional fixes: skeleton hydration (deterministic heights), fragile dynamic import, button text consistency ("Stop Tracker" → "Stop"), suggestions dropdown fallback to recent tasks.
**Reasoning:** Automated visual regression testing catches layout issues that code review alone misses. Screenshot-based verification across three breakpoints ensures responsive correctness. Functional tests validate the full user journey and prevent regressions in CRUD operations.
