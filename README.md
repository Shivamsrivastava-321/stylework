# Stylework — Lead Intake Service

A production-ready **Lead Intake Service** that receives Meta Ads webhook events, stores leads in MongoDB, provides a full audit trail, and exposes a polished React dashboard for CRM-style lead management.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         Client Browser                        │
│              React + Vite + TypeScript (port 3000)           │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼─────────────────────────────────┐
│                       Express API Server                      │
│            Node.js + TypeScript + Express (port 8000)        │
│                                                              │
│  POST /webhook/meta-lead   ─► LeadController.receive()       │
│  GET  /leads               ─► LeadController.list()          │
│  GET  /leads/:id           ─► LeadController.getById()       │
│  PATCH /leads/:id/status   ─► LeadController.updateStatus()  │
└────────────────────────────┬─────────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼─────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                      │
│            Collections: leads · activities                   │
└──────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
Stylework/
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/           # DB connection
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/        # Error handling, 404
│   │   ├── models/           # Mongoose schemas (Lead, Activity)
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Activity service (audit trail)
│   │   ├── validators/       # Zod schemas
│   │   ├── __tests__/        # Jest integration tests
│   │   ├── app.ts            # Express app
│   │   └── index.ts          # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/              # Axios API client
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── types/            # TypeScript interfaces
│   │   ├── __tests__/        # Vitest component tests
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css         # Design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── README.md
└── AGENT.md
```

---

## API Reference

### `POST /webhook/meta-lead`
Accepts Meta Ads lead gen webhook payloads. Supports both the full Meta format (`entry[].changes[].value`) and a simplified flat format for testing.

**Request Body (simplified):**
```json
{
  "form_id": "form_abc123",
  "ad_id": "ad_xyz",
  "ad_name": "Summer Sale",
  "campaign_id": "camp_001",
  "campaign_name": "Q3 Lead Gen",
  "field_data": [
    { "name": "full_name", "values": ["Jane Doe"] },
    { "name": "email", "values": ["jane@example.com"] },
    { "name": "phone_number", "values": ["+1-555-1234"] }
  ]
}
```

**Response:** `201 Created` with created lead(s).

---

### `GET /leads`
Returns paginated list of leads.

**Query Params:** `page`, `limit`, `status`, `search`

**Response:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 15, "total": 42, "totalPages": 3, ... }
}
```

---

### `GET /leads/:id`
Returns a single lead + activity timeline.

**Response:**
```json
{
  "lead": { ... },
  "activities": [...]
}
```

---

### `PATCH /leads/:id/status`
Updates a lead's status and creates audit activity records.

**Request Body:** `{ "status": "contacted" }`

**Valid statuses:** `new` | `contacted` | `qualified` | `converted` | `lost`

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (for containerized deployment)
- MongoDB Atlas account

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd Stylework

# Copy and fill in environment variables
cp .env.example .env
# Edit .env and add your MONGO_URI
```

### 2. Backend (Local Dev)

```bash
cd backend
cp .env.example .env
# Add your MONGO_URI to .env

npm install
npm run dev
# Server starts at http://localhost:8000
```

### 3. Frontend (Local Dev)

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

### 4. Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## Deployment Steps

### Docker (Local)

```bash
# At project root, create .env from example
cp .env.example .env
# Fill in MONGO_URI in .env

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health: http://localhost:8000/health

### Render (Cloud Deployment)

**Backend (Web Service):**
1. Create a new **Web Service** → connect your repo
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables: `MONGO_URI`, `FRONTEND_URL`, `NODE_ENV=production`

**Frontend (Static Site):**
1. Create a new **Static Site** → connect your repo
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add rewrite rule: `/* → /index.html` (200)
6. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## Audit Trail Design

Every meaningful action creates an `Activity` document:

| Action | Trigger |
|--------|---------|
| `lead_created` | POST /webhook/meta-lead |
| `status_changed` | PATCH /leads/:id/status |
| `lead_updated` | Any field change |
| `webhook_received` | (reserved for future) |

Activities are stored in a separate collection, indexed by `leadId`, and returned in reverse-chronological order on the `GET /leads/:id` endpoint.

---

## Trade-offs & Decisions

| Decision | Rationale |
|----------|-----------|
| **MongoDB + Mongoose** | Flexible schema suits Meta's varied `field_data` payloads |
| **Zod validation** | Runtime type safety at API boundary |
| **Separate Activity collection** | Clean audit trail, easy to query by lead |
| **TanStack Query** | Automatic caching, refetching, loading/error state management |
| **Framer Motion** | Smooth micro-animations without heavyweight deps |
| **Docker multi-stage builds** | Small production images (builder artifacts not included) |
| **Webhook field extraction** | Defensive extraction handles missing/renamed fields gracefully |

---

## Scaling Considerations

1. **Horizontal Scaling** — Stateless backend can scale with a load balancer; MongoDB Atlas handles connection pooling.
2. **Webhook Queue** — For high-volume production, add a Redis/BullMQ queue between the webhook endpoint and DB writes to prevent loss under burst traffic.
3. **Rate Limiting** — Add `express-rate-limit` on the webhook endpoint to protect against flooding.
4. **Pagination Index** — Add compound index `{ status: 1, createdAt: -1 }` for efficient filtered pagination queries.
5. **Full-text Search** — Current MongoDB `$text` index can be upgraded to Atlas Search (Lucene) for richer search capabilities.
6. **Real-time Updates** — Add WebSocket/SSE for live dashboard updates when new leads arrive.
7. **Webhook Signature Verification** — In production, verify the `X-Hub-Signature-256` header sent by Meta.

---

## Future Improvements

- [ ] Meta webhook signature verification (`X-Hub-Signature-256`)
- [ ] Real-time updates via WebSockets or Server-Sent Events
- [ ] Lead assignment to CRM agents
- [ ] Email/SMS notification on new lead
- [ ] Bulk status update UI
- [ ] CSV export of leads
- [ ] Analytics dashboard (conversion funnel, campaign ROI)
- [ ] Role-based access control (admin vs. agent)
- [ ] Rate limiting on the webhook endpoint
- [ ] Full-text search upgrade to Atlas Search
