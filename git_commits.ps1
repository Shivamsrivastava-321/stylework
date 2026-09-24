#!/usr/bin/env pwsh
# Run this script from the Stylework root directory to create all 15 Git commits
# Usage: .\git_commits.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Initializing Git repository with 15 meaningful commits..." -ForegroundColor Cyan

git init
git config user.email "dev@stylework.io"
git config user.name "Stylework Dev"

# Commit 1 — Project scaffold
git add .gitignore .env.example
git commit -m "chore: initialize project scaffold with monorepo structure

- Add root .gitignore for node_modules, dist, .env
- Add .env.example documenting required environment variables
- Establish backend/ and frontend/ directory structure"

# Commit 2 — Backend package config
git add backend/package.json backend/tsconfig.json backend/jest.config.json
git commit -m "chore(backend): add package.json, tsconfig, and jest configuration

- Express 4, Mongoose 8, Zod 3, Helmet, Morgan
- TypeScript strict mode targeting ES2020
- Jest + ts-jest for integration testing"

# Commit 3 — Database models
git add backend/src/models/
git commit -m "feat(backend): define Lead and Activity Mongoose models

- Lead model: formId, email, fullName, phone, status, rawPayload
- Activity model: leadId ref, action enum, description, metadata
- Indexes for efficient queries: status, email, leadId, text search"

# Commit 4 — Zod validators
git add backend/src/validators/
git commit -m "feat(backend): add Zod validation schemas for webhook and status

- MetaWebhookSchema handles both full Meta format and simplified format
- UpdateLeadStatusSchema validates against allowed status enum
- Runtime type safety at the API boundary"

# Commit 5 — Activity service
git add backend/src/services/
git commit -m "feat(backend): implement audit trail activity service

- createActivity() helper used by all controllers
- getActivitiesForLead() returns timeline sorted newest-first
- Centralized audit logic decoupled from route handlers"

# Commit 6 — Webhook + lead controllers
git add backend/src/controllers/
git commit -m "feat(backend): implement all lead controller handlers

- receiveMetaWebhook: parses Meta payload, extracts fields, stores lead
- getLeads: paginated list with status filter and text search
- getLeadById: returns lead + activity timeline
- updateLeadStatus: updates status and records audit activities"

# Commit 7 — Routes
git add backend/src/routes/
git commit -m "feat(backend): define Express routes for webhook and leads

- POST /webhook/meta-lead -> receiveMetaWebhook
- GET  /leads            -> getLeads (paginated)
- GET  /leads/:id        -> getLeadById
- PATCH /leads/:id/status -> updateLeadStatus"

# Commit 8 — App bootstrap and middleware
git add backend/src/ backend/.env.example
git commit -m "feat(backend): bootstrap Express app with middleware and error handling

- Helmet security headers
- CORS with configurable frontend origin
- Global error handler with dev stack traces
- 404 not-found handler
- Morgan request logging (disabled in test env)
- /health endpoint for Docker healthcheck"

# Commit 9 — Backend tests
git add backend/src/__tests__/
git commit -m "test(backend): add Jest integration tests for all API endpoints

- Health check test
- Webhook creation with valid/invalid payloads
- Lead list with pagination
- Lead detail 404 and found cases
- Status update validation and 404 cases
- Mongoose models mocked to avoid real DB dependency"

# Commit 10 — Backend Dockerfile
git add backend/Dockerfile
git commit -m "chore(backend): add multi-stage Dockerfile for production build

- Stage 1 (builder): compiles TypeScript to dist/
- Stage 2 (production): lean Node alpine with only prod deps
- HEALTHCHECK with wget against /health endpoint"

# Commit 11 — Frontend scaffold
git add frontend/package.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/index.html frontend/.env frontend/nginx.conf
git commit -m "chore(frontend): scaffold Vite React TypeScript project

- React 18, React Router v6, TanStack Query v5
- Framer Motion for animations, Lucide icons
- Vitest for testing, Axios for HTTP
- nginx.conf for SPA routing in production"

# Commit 12 — Design system CSS
git add frontend/src/index.css
git commit -m "feat(frontend): implement dark glassmorphism design system

- CSS custom properties for the full design token system
- Dark purple/cyan color palette with glassmorphism cards
- Status badge styles, timeline, stat cards, filter bar
- Loading skeleton animations, pagination, responsive layout"

# Commit 13 — Components
git add frontend/src/components/ frontend/src/types/ frontend/src/api/
git commit -m "feat(frontend): build core UI components and API client

- Layout: sidebar with NavLink active state
- LeadCard: avatar initials, email, phone, status badge, campaign
- StatusBadge: color-coded per status value
- ActivityTimeline: color-coded dots per action type
- LoadingSkeleton: shimmer animation while loading
- Axios API client with response error interceptor"

# Commit 14 — Pages
git add frontend/src/pages/ frontend/src/App.tsx frontend/src/main.tsx
git commit -m "feat(frontend): implement all application pages

- LeadListPage: stats grid, search, status filter, pagination
- LeadDetailPage: lead info, status selector, activity timeline, raw payload
- WebhookTestPage: form/JSON mode toggle, field builder, randomizer
- React Query for data fetching, react-hot-toast for notifications"

# Commit 15 — Docker Compose + docs
git add frontend/src/__tests__/ frontend/Dockerfile docker-compose.yml README.md AGENT.md
git commit -m "feat: add frontend tests, Docker Compose, README, and AGENT.md

- Vitest component tests: StatusBadge, LeadCard, ActivityTimeline
- Multi-stage frontend Dockerfile with nginx SPA serving
- docker-compose.yml with health-check dependency between services
- README: architecture diagram, API reference, setup, trade-offs, scaling
- AGENT.md: AI tools, prompts, generated vs manual sections"

Write-Host ""
Write-Host "✅ All 15 commits created successfully!" -ForegroundColor Green
Write-Host ""
git log --oneline
