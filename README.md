# PlaceReady — AI Placement Readiness Platform

PlaceReady is a full-stack web platform that helps **students** prepare for campus
placements and helps **colleges** track student readiness at scale. It uses AI
to analyze each student's academic and skill profile and produces an
actionable, recruiter-grade assessment — including a placement readiness score,
reasoning, strengths, improvement areas, recommended skills, and suggested job
roles — all surfaced through a searchable dashboard with live insights.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [Project Structure](#project-structure)
6. [Architecture & Design Decisions](#architecture--design-decisions)
7. [API Reference](#api-reference)
8. [Data Model](#data-model)
9. [How the AI Analysis Works](#how-the-ai-analysis-works)
10. [Seeded Data](#seeded-data)
11. [Available Scripts](#available-scripts)

---

## Project Overview

Campus placement cells typically track students in spreadsheets, which makes it
hard to (a) get a holistic view of each student's employability and (b) spot
cohort-wide gaps early. PlaceReady solves both problems:

- **For students** — turns a static profile into a personalized, AI-driven
  readiness report with concrete next steps (skills to learn, roles to target,
  weaknesses to address).
- **For colleges** — provides a single dashboard to search, filter, and rank
  students by readiness, watch cohort-level trends (branch distribution, score
  histogram, top skills), and identify who needs intervention before placements
  begin.

The readiness score is **not** a black box. Every score comes with a
human-readable reasoning and a breakdown showing how academic performance,
skills, projects, internships, certifications, and achievements each
contributed.

### Features

- **Student Management (CRUD)**
  - Create, view, update, and delete student profiles.
  - Rich profiles: academics (branch, year, CGPA, 10th/12th %), skills with
    proficiency levels (1–5), projects with tech stacks, internships,
    certifications, achievements, and links (LinkedIn / GitHub / Resume).
  - Placement status tracking (Active / Looking / Placed / Not Looking).

- **AI Analysis** (per student, on demand)
  - Student Summary
  - Strengths
  - Areas for Improvement
  - Recommended Skills
  - Suggested Job Roles

- **Placement Readiness**
  - A 0–100 readiness score with a level (Not Ready / Developing / Ready /
    Highly Ready).
  - Reasoning explaining the score, referencing concrete profile signals.
  - A score-composition breakdown chart.
  - Bulk "Analyze All" to process an entire cohort in one click.

- **Dashboard**
  - KPI cards: Total Students, Average Readiness, Placement-Ready count,
    Placed count.
  - Live charts: readiness distribution donut, score histogram, students by
    branch, top skills.
  - Searchable + filterable student table (search, branch, status, readiness
    range, sortable columns).
  - A detail drawer per student showing the full profile and AI analysis.

---

## Tech Stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 16 (App Router) + React 19                  |
| Language         | TypeScript 5                                        |
| Styling          | Tailwind CSS 4 + shadcn/ui (New York)               |
| Icons            | lucide-react                                        |
| Charts           | recharts                                            |
| Database         | Prisma ORM + SQLite                                 |
| AI               | @google/genai (LLM chat completions)             |
| Theme            | next-themes (light/dark)                            |
| Notifications    | sonner                                              |
| Runtime / PM     | Bun                                                 |

> **Note on the AI SDK:** `@google/genai` is **server-only**. It is never
> imported in client components — all AI calls happen inside Next.js API
> routes.

---

## Setup Instructions

### Prerequisites

- [Bun](https://bun.sh/) (recommended) — this project uses Bun for installs,
  scripts, and the dev server.
- Node.js 18+ (if you prefer npm/yarn, the scripts still work).

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the database

The SQLite database path is configured in `.env`:

```
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

Create the schema in the database and generate the Prisma client:

```bash
bun run db:push
```

### 3. Seed sample data (optional but recommended)

Loads 10 realistic engineering students across CS / IT / ECE / EE / Mechanical
branches so you can immediately explore the dashboard:

```bash
bun run scripts/seed.ts
```

### 4. Start the dev server

```bash
bun run dev
```

The app runs on **http://localhost:3000** (the only user-facing route is `/`).

> In this sandboxed environment, open the app via the **Preview Panel** on the
> right side of the IDE — do not navigate to `localhost:3000` directly.

### 5. Lint

```bash
bun run lint
```

### Quick start (one-liner after install)

```bash
bun run db:push && bun run scripts/seed.ts && bun run dev
```

---

## Project Structure

```
.
├── prisma/
│   └── schema.prisma            # Student + Analysis models
├── db/
│   └── custom.db                # SQLite database file
├── scripts/
│   └── seed.ts                  # Seeds 10 sample students
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (ThemeProvider, Toaster)
│   │   ├── page.tsx             # Single route — renders <AppShell/>
│   │   ├── globals.css          # Tailwind + emerald theme tokens
│   │   └── api/
│   │       ├── students/
│   │       │   ├── route.ts                 # GET (list/filter) / POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET / PUT / DELETE
│   │       │       └── analyze/route.ts     # POST — run AI analysis
│   │       └── insights/route.ts            # GET — aggregated dashboard stats
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (preinstalled)
│   │   ├── theme-provider.tsx
│   │   └── placement/
│   │       ├── app-shell.tsx                 # Orchestrates state + dialogs
│   │       ├── dashboard-header.tsx          # Sticky header + theme toggle
│   │       ├── stats-cards.tsx               # KPI cards
│   │       ├── insights-panel.tsx            # 4 recharts visualizations
│   │       ├── student-list.tsx              # Filter bar + responsive table
│   │       ├── student-detail-dialog.tsx     # Profile + AI analysis drawer
│   │       ├── student-form-dialog.tsx       # Create/edit with nested arrays
│   │       ├── score-ring.tsx                # Circular readiness gauge
│   │       └── readiness-badge.tsx
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── types.ts             # Shared domain types + constants
│   │   ├── student.ts           # Serialization + heuristic readiness baseline
│   │   ├── ai.ts                # @google/genai analysis + fallback
│   │   ├── api-client.ts        # Typed fetch wrappers for the frontend
│   │   └── utils.ts             # cn() helper
│   └── hooks/                   # use-mobile, use-toast
├── .env                         # DATABASE_URL
└── package.json
```

---

## Architecture & Design Decisions

### 1. Single-page, API-driven architecture

The entire user experience lives on one route (`/`), rendered by a single
client component (`AppShell`). All data operations go through REST API routes
under `/api/*`. This keeps the UI fast and interactive (instant filter
feedback, optimistic dialogs) while keeping business logic and the AI SDK
strictly on the server.

**Why not Server Actions?** The brief asked for an API-first approach. Using
`fetch`-based API routes also makes the backend reusable (e.g. for a future
mobile app or import script) and gives clear request/response contracts.

### 2. Hybrid AI readiness scoring (LLM + heuristic)

The readiness score is the product of **two signals blended together**:

1. **Heuristic baseline** (`computeReadinessBaseline` in `src/lib/student.ts`)
   — a transparent, deterministic score computed from profile signals:
   - CGPA → up to 30 pts
   - Technical skills (count × average proficiency) → up to 25 pts
   - Projects → up to 20 pts
   - Internships → up to 15 pts
   - Certifications → up to 10 pts
   - Achievements + academic history → up to 10 pts (bonus)

2. **LLM assessment** (`analyzeStudent` in `src/lib/ai.ts`) — the AI receives
   the full profile plus the baseline score and returns a qualitative judgment
   including its own suggested score.

The **final score = 60% LLM + 40% heuristic**. This gives the AI room to reward
project depth, skill relevance, and internship quality that a formula can't
capture, while the baseline anchors the score so it never drifts absurdly.
Crucially, the breakdown is shown to the user, so the score is **explainable,
not a black box**.

### 3. Graceful AI fallback

If the LLM call fails (network, malformed JSON, timeout), the system does
**not** break. It falls back to a rule-based analysis derived from the
heuristic baseline (e.g. "if CGPA ≥ 8 → strength", "if no internships →
improvement"). This guarantees the platform always returns a useful,
structured result — the AI is an enhancement, not a dependency.

### 4. Strict JSON prompting with defensive parsing

The LLM is instructed (via system prompt) to return **only** a JSON object
with a fixed schema. The parser (`extractJson`) strips markdown code fences
and isolates the outermost `{ ... }` before `JSON.parse`. Every field is then
coerced with type guards (`asStringArray`, `clampScore`) so a slightly-off
response can't crash the UI. The score is clamped to `[0, 100]` and arrays are
capped at 8 items.

### 5. Data modeling: JSON fields inside SQLite

SQLite has no native array/object type. Rather than introducing many join
tables (skills, projects, certs, internships, achievements), these are stored
as **JSON-encoded strings** on the `Student` row. This trade-off is deliberate:

- **Pros:** simple schema, fast reads (one row per student), easy to evolve
  the nested shape without migrations, perfect for a profile-centric app where
  you almost always read the whole student at once.
- **Cons:** you can't query inside the JSON natively (e.g. "find all students
  who know React") — but filtering by skill is done in application code after
  parsing, which is fast enough for the cohort sizes a single college has
  (hundreds to low thousands).

The `Analysis` model is a 1:1 relation (one cached analysis per student) so
re-analysis is an upsert and the dashboard can read scores without re-running
the AI.

### 6. Frontend state & data fetching

- A single `AppShell` holds: the student list, filters, selected student, and
  dialog open states. This avoids a global store for what is fundamentally one
  screen.
- The student list is **debounced** (250 ms on search, immediate on dropdown
  changes) and uses an `AbortController` so stale requests are cancelled.
- Insights are refetched after any mutation (create/update/delete/analyze) so
  the charts stay in sync.
- A typed `api-client.ts` centralizes all `fetch` calls and error handling,
  giving the components a clean `api.listStudents(...)`-style interface.

### 7. UI/UX standards

- **shadcn/ui** components throughout (Dialog, Sheet, Table, Select, Badge,
  Progress, etc.) for consistency and accessibility.
- **Emerald accent palette** (chosen to evoke growth / readiness) — no indigo
  or blue, per the design constraints. Full light/dark theme via `next-themes`.
- **Sticky footer** with `min-h-screen flex flex-col` + `mt-auto` so it never
  floats over content.
- **Responsive table** — columns hide progressively (CGPA on `md`, Skills on
  `lg`, Status on `sm`) so the table stays usable on a 390 px phone.
- **Custom thin scrollbars** and accessible labels/ARIA where relevant.
- **Sonner toasts** for all async feedback (success/error).

### 8. Security boundaries

- The AI SDK is imported **only** in `src/lib/ai.ts`, which is imported **only**
  by the `/api/students/[id]/analyze` route (server-side). It never reaches the
  client bundle.
- All API routes validate input (required fields, CGPA range, email format on
  the client) and return structured error messages.

---

## API Reference

All routes are relative to the app root and return JSON.

### `GET /api/students`

Query params: `search`, `branch`, `status`, `minScore`, `maxScore`, `sortBy`
(`updatedAt` | `createdAt` | `name` | `cgpa` | `graduationYear`), `order`
(`asc` | `desc`).

Returns: `{ students: Student[] }` — each student includes its `analysis` if
one exists.

### `POST /api/students`

Body: a `StudentInput` object (see `src/lib/types.ts`).

Returns: `{ student: Student }` (201) or `{ error }` (400/409).

### `GET /api/students/:id`

Returns: `{ student: Student }` (with nested `analysis`).

### `PUT /api/students/:id`

Body: a full `StudentInput`. Returns: `{ student: Student }`.

### `DELETE /api/students/:id`

Returns: `{ success: true }`. Cascades to delete the student's analysis.

### `POST /api/students/:id/analyze`

Runs (or re-runs) the AI analysis and upserts the `Analysis` row.

Returns: `{ analysis: Analysis, breakdown: { label, value, max }[] }`.

### `GET /api/insights`

Returns aggregated cohort stats for the dashboard:

```json
{
  "stats": {
    "totalStudents": 10,
    "analyzedStudents": 10,
    "avgReadiness": 73,
    "placedCount": 1,
    "readyCount": 8,
    "developingCount": 2,
    "notReadyCount": 1,
    "branchDistribution": [{ "branch": "Computer Science", "count": 5 }],
    "readinessDistribution": [{ "level": "Highly Ready", "count": 5 }],
    "topSkills": [{ "skill": "Python", "count": 7 }]
  },
  "scoreBuckets": [
    { "range": "0-20", "count": 0 },
    { "range": "20-40", "count": 1 },
    { "range": "40-60", "count": 2 },
    { "range": "60-80", "count": 2 },
    { "range": "80-100", "count": 5 }
  ]
}
```

---

## Data Model

Defined in `prisma/schema.prisma`:

```prisma
model Student {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  phone           String?
  rollNumber      String?
  branch          String
  year            Int
  graduationYear  Int
  cgpa            Float
  tenthPct        Float?
  twelfthPct      Float?
  // JSON-encoded arrays/objects (SQLite has no native array type)
  skills          String   // [{ name, level(1-5) }]
  projects        String   // [{ title, description, tech[] }]
  certifications  String   // [{ name, issuer, date }]
  internships     String   // [{ company, role, duration, description }]
  achievements    String   // string[]
  linkedinUrl     String?
  githubUrl       String?
  resumeUrl       String?
  status          String   @default("Active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  analysis        Analysis?
}

model Analysis {
  id                 String   @id @default(cuid())
  studentId          String   @unique
  student            Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  summary            String
  strengths          String   // JSON string[]
  improvements       String   // JSON string[]
  recommendedSkills  String   // JSON string[]
  suggestedRoles     String   // JSON string[]
  readinessScore     Int      // 0-100
  readinessLevel     String   // Not Ready | Developing | Ready | Highly Ready
  readinessReasoning String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

**Readiness level thresholds:**

| Score   | Level         |
| ------- | ------------- |
| 80–100  | Highly Ready  |
| 60–79   | Ready         |
| 40–59   | Developing    |
| 0–39    | Not Ready     |

---

## How the AI Analysis Works

1. The user clicks **Analyze** (per-student) or **Analyze All** (bulk).
2. `POST /api/students/:id/analyze` loads the student record and parses its
   JSON fields into a typed `Student` object.
3. `computeReadinessBaseline(student)` produces the heuristic score + a
   per-category breakdown.
4. A structured prompt is assembled containing:
   - A **system prompt** defining the analyst persona and the exact JSON schema
     required.
   - A **user message** with a human-readable rendering of the full profile
     plus the baseline score as an anchor.
5. `zai.chat.completions.create({ messages, thinking: { type: "disabled" } })`
   is called (server-side only).
6. The response is parsed defensively (strip fences, isolate JSON, coerce
   fields, clamp the score).
7. The final score = `round(0.6 * aiScore + 0.4 * baselineScore)`, mapped to a
   readiness level.
8. The result is **upserted** into the `Analysis` table and returned to the
   client, which updates both the table row and the insights charts.

If step 5–6 fails for any reason, a rule-based fallback analysis is generated
from the baseline so the user always gets a result.

---

## Seeded Data

Running `bun run scripts/seed.ts` wipes and inserts 10 students with varied
profiles — from a highly-ready Google/Amazon intern with multiple
certifications, to a developing 3rd-year Mechanical student with no
internships. This gives you an immediate, realistic spread of readiness scores
to explore the dashboard and charts.

---

## Available Scripts

| Script                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `bun run dev`                | Start the Next.js dev server on port 3000 (logs to `dev.log`). |
| `bun run lint`               | Run ESLint.                                            |
| `bun run db:push`            | Create/apply the Prisma schema to SQLite + generate the client. |
| `bun run db:generate`        | Regenerate the Prisma client.                          |
| `bun run db:migrate`         | Create and apply a migration (dev).                    |
| `bun run db:reset`           | Reset the database (dev).                              |
| `bun run scripts/seed.ts`    | Seed 10 sample students.                               |
| `bun run build` / `bun run start` | Production build & start (not used in this sandbox). |

---

## License

This project is provided as-is for demonstration purposes.
