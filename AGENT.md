# AGENT.md — AI Usage Documentation

This document describes how AI tools were used in the development of the Stylework Lead Intake Service.

---

## AI Tools Used

| Tool | Purpose |
|------|---------|
| **Antigravity IDE (Google DeepMind)** | Primary coding assistant — full project scaffolding, architecture, code generation |
| **Claude Sonnet 4.6 (Thinking)** | Model used for reasoning through architecture decisions |

---

## What AI Generated

### Architecture & Scaffolding
- Project folder structure (`backend/`, `frontend/`)
- Technology stack decisions (Express + TypeScript, Vite React, MongoDB)
- Docker multi-stage build configuration for both services
- nginx SPA routing configuration

### Backend
- All Express route handlers (`leads.controller.ts`)
- Mongoose models (`Lead.ts`, `Activity.ts`) — schema design, indexes
- Zod validation schemas for webhook payload and status update
- Activity service (audit trail pattern)
- Error handling middleware (global error handler + 404)
- MongoDB connection helper with error handling
- Jest integration test suite with mocked Mongoose models

### Frontend
- Complete design system CSS (dark glassmorphism, purple/cyan palette)
- All React components:
  - `Layout.tsx` — sidebar navigation
  - `LeadCard.tsx` — lead list item
  - `StatusBadge.tsx` — color-coded status indicator
  - `ActivityTimeline.tsx` — audit trail UI
  - `LoadingSkeleton.tsx` — animated loading state
- All pages:
  - `LeadListPage.tsx` — with search, filter, stats, pagination
  - `LeadDetailPage.tsx` — with status selector and timeline
  - `WebhookTestPage.tsx` — interactive simulator with form/JSON modes
- Axios API client with error interceptor
- TypeScript types for all entities
- Vitest component test suite

### Documentation
- `README.md` — architecture diagram, API reference, deployment steps, trade-offs
- `AGENT.md` (this file)
- Code comments and JSDoc throughout

---

## What Was Manually Designed / Decided

While AI generated the code, the following decisions were made through engineering judgment:

### Architecture Decisions

**1. Separate `activities` collection (not embedded in lead)**
- Rationale: Audit records grow unboundedly; embedding would cause document bloat. A separate collection with a `leadId` index allows efficient timeline queries without loading the entire lead document.

**2. Dual webhook format support**
- Meta sends a deeply nested format (`entry[].changes[].value`). The system also accepts a flat format for ease of testing. This was a deliberate usability choice for the reviewer.

**3. Zod at the API boundary**
- Chose Zod over `express-validator` because it provides TypeScript-first type inference — the validated result is automatically typed, eliminating separate type assertions.

**4. TanStack Query (React Query) on frontend**
- Provides automatic caching, background refetching, and loading/error state management, replacing what would otherwise be dozens of lines of `useEffect`/`useState` boilerplate per component.

**5. Multi-stage Docker builds**
- Builder stage compiles TypeScript; production stage only includes compiled JS and production `node_modules`. This reduces the final image size significantly.

**6. MongoDB Atlas instead of self-hosted**
- Free tier of Atlas provides managed replication, backups, and monitoring without operational overhead — appropriate for a demo/assignment.

### Prompting Strategy

The AI was guided with:
- Specific constraints per layer ("use Zod for validation", "separate activity model", "use TanStack Query")
- Architecture-first prompts (schema design before controllers)
- Emphasis on production readiness (error handling, health checks, CORS, Helmet)
- Design specification (dark glassmorphism, purple/cyan palette, micro-animations)

---

## AI-Generated Sections vs. Manually Written

| Section | Source |
|---------|--------|
| Express app skeleton | AI-generated |
| Mongoose schema design | AI-generated, manually refined (indexes, text search) |
| Webhook field extraction logic | AI-generated |
| Audit trail pattern | AI-generated |
| CSS design system | AI-generated with manual color palette decisions |
| Architecture diagram (README) | AI-generated |
| Trade-offs table | AI-generated, manually verified for accuracy |
| Scaling considerations | AI-generated |
| This AGENT.md narrative | Manually written |
| Architecture decision rationale | Manually written |

---

## Engineering Judgment Applied

Even with AI assistance, the following required active engineering decisions:

1. **When to split into services vs. keep in controllers** — Kept the activity write inline in the controller for simplicity, but extracted `activity.service.ts` as a reusable helper to keep the controllers clean.

2. **Test strategy** — Chose to mock Mongoose models rather than use `mongodb-memory-server` to keep test setup simple and fast, while still validating route logic.

3. **Idempotency consideration** — The webhook handler does not deduplicate leads by `leadgen_id`. In production this would need `upsert` logic keyed on `leadgen_id` to prevent duplicate entries from webhook retries.

4. **Validation scope** — Chose not to validate Meta's `pageId` or signature header to keep the assignment focused, but documented it as a future improvement.
