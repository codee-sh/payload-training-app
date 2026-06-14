# Training App

A coach-facing admin and client-facing training tracker built with Payload CMS and Next.js. Coaches build workout plans in the admin panel; clients log their sets through a mobile-friendly web interface.

## What it does

**Coach (admin panel)** — creates plans, assigns them to clients, defines workout structure down to individual exercise rows with target sets and tracking parameters.

**Client (web app)** — logs in, sees their active plan, works through workouts session by session, and logs each set (reps, weight, RIR, time, etc.).

## Data model

```
Plan
└── Microcycle
    └── Workout
        └── WorkoutGroup            (e.g. "A1/A2 superset")
            └── WorkoutExerciseRow  (exercise + tracking config)
                ├── SetLog          (per-set: reps, weight, RIR…)
                └── RoundLog        (per-round: time, distance…)
```

Logging is tracked per session via `WorkoutLog`, which links a client to a specific workout on a given date.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS / Auth | Payload CMS 3 |
| Database | PostgreSQL (`@payloadcms/db-postgres`) |
| Styling | Tailwind CSS |
| i18n | next-intl (Polish / English) |
| Forms | react-hook-form |
| Icons | lucide-react |

## Getting started

### Requirements

- Node.js ≥ 24
- Yarn 4 (`corepack enable`)
- PostgreSQL database

### Setup

```bash
git clone <repo-url>
cd training-app
yarn install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/training_app
PAYLOAD_SECRET=your-long-random-secret-here
```

Run migrations:

```bash
yarn payload migrate
```

### Run

```bash
yarn dev
```

- App: `http://localhost:3000/pl`
- Admin panel: `http://localhost:3000/admin`

### First-time setup

1. Open `/admin` and create the first user account — this becomes the super-admin
2. (Optional) seed demo data: `yarn seed`
3. Create a **Client** record for each athlete
4. Build a **Plan**, link microcycles → workouts → exercise rows
5. The client logs in at `/pl` using their email and password set in the admin

## Project structure

```
src/
├── access/                    # Shared access control functions (isAdmin, isAuthenticated…)
├── app/
│   ├── [locale]/(frontend)/   # Client-facing app (login, workout tracker)
│   └── (payload)/             # Payload admin routes and API
├── collections/               # Payload collection configs (one folder per collection)
│   ├── clients/
│   ├── exercises/
│   ├── plans/
│   ├── microcycles/
│   ├── workouts/
│   ├── workout-groups/
│   ├── workout-exercise-rows/
│   ├── workout-logs/
│   ├── set-logs/
│   ├── round-logs/
│   ├── media/
│   └── users/
├── components/
│   ├── common/                # App-wide UI (logout button…)
│   ├── ui/                    # Primitive components (button, input, surface…)
│   └── workout/               # Workout tracker components
├── data/                      # Static/seed data
├── i18n/                      # next-intl routing and request config
├── lib/                       # Shared utilities and SDK client
├── loaders/                   # Server-side data fetching functions
├── migrations/                # Payload database migrations
├── scripts/                   # One-off CLI scripts (seed, import-plan…)
├── types/                     # Shared TypeScript types
├── middleware.ts
├── payload-types.ts           # Auto-generated — do not edit manually
└── payload.config.ts
.ai/
└── skills/                    # AI assistant skill definitions
```

## Key scripts

| Script | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn payload migrate` | Run pending database migrations |
| `yarn generate:types` | Regenerate `payload-types.ts` from collection configs |
| `yarn generate:importmap` | Regenerate Payload admin import map (run after adding custom views) |
| `yarn seed` | Seed database with demo data |
| `yarn seed:export` | Export current database state to seed file |
| `yarn lint` | Run ESLint |
| `yarn install-skills` | Link `.ai/skills/` into `.claude/` and `.codex/` |

## Development

### Adding a collection

Follow `.ai/skills/payload-build-collections` — each collection lives in `src/collections/{kebab-case}/index.ts` and is registered in `src/collections/index.ts`.

After changing collection configs, regenerate types:

```bash
yarn generate:types
```

### Adding an admin view or custom field UI

Follow `.ai/skills/payload-build-modules`. After registering a new component path, run:

```bash
yarn generate:importmap
```

### AI skills

This project uses skill files for AI-assisted development. To install them into Claude Code and Codex:

```bash
yarn install-skills
```

Skills live in `.ai/skills/` and cover: Payload patterns, collection scaffolding, admin module structure, UI copy, and spec writing.
