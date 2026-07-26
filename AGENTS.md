# AGENTS.md

Operational guide for AI agents working in this repository.

---

## Before Writing Code

- Write everything in English: code, comments, variable names, documentation.
- Do not implement code, schema, migration, script, configuration, or documentation changes unless the user explicitly authorizes implementation with "wdrażamy" or an equivalent clear instruction. Analysis, investigation, and recommendations do not authorize changes.
- Check `.ai/specs/` before coding any non-trivial feature.
- Skills are installed in `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex). `.agents/skills/` is the local source of truth — edit a skill **only** there, then run `ags push-skill` to propagate it to the source repo (it also syncs the `.claude/skills/` copy). See Installing skills.
- Prefer minimal, focused changes. Do not refactor code outside the task scope.
- Do not run `yarn build` automatically after implementation. Run it only when the user explicitly asks.
- Comment and naming conventions are defined in the `code-style` skill. Load it before writing or reviewing TypeScript.

---

## Task Router

Match the task to the table before starting. A single task often maps to multiple rows.

| Task | Action |
|---|---|
| Creating a new collection or extending the schema | Load skill `payload-build-collections` |
| Adding a custom admin view, tab, or field UI | Load skill `payload-build-modules` |
| Building a front-end component or page (`src/components`, `src/modules/*/components`, `(frontend)`) | Load skill `payload-frontend-build-components` |
| Debugging hooks, queries, access control, transactions | Load skill `payload` |
| Security review, or adding/modifying auth, access control, uploads, CORS/CSRF, headers | Load skill `payload-security`; keep `.ai/audits/security-audit.md` current |
| Writing questions for a client or stakeholder | Load skill `writing-questions` |
| Starting a new spec or reviewing one | Load skill `spec-writing` |
| Generating a pull request description | Follow `.ai/instructions/generate-pr-description.md` |
| Any TypeScript code | Load skill `code-style` |

---

## Skills

Skills extend the agent with task-specific guidance, checklists, and reference material.

**Structure:** Each skill lives in its own folder under `.claude/skills/` and `.agents/skills/` with a `SKILL.md` entry point and optional `reference/` files loaded on demand.

**Automatic triggering:** If the task matches a skill's description, load the skill before starting — without waiting to be asked.

**Reference files:** `SKILL.md` specifies which references to load for a given subtask. Do not load all references blindly.

### Installing skills

Skills are managed with [npx skills](https://github.com/vercel-labs/skills). To install from the source repository:

```bash
npx skills add <source-path-or-url> -a claude-code -a codex --copy
```

This installs into `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex). A `skills-lock.json` file tracks the source and version of each installed skill.

### Editing skills

`.agents/skills/` is the local source of truth. Edit a skill **only** there, then push it upstream:

```bash
ags push-skill   # reads .agents/skills, pushes to the source repo, then syncs .claude/skills
```

Do not edit `.claude/skills/` by hand — it is a derived copy that `ags push-skill` overwrites from `.agents/skills/`. Likewise do not hand-edit the source repo; let `ags push-skill` write it.

### Available skills

| Skill | When to load |
|---|---|
| `code-style` | Any TypeScript code |
| `payload` | Debugging Payload: hooks, queries, access control, transactions, security |
| `payload-build-collections` | Creating a new collection or extending the schema |
| `payload-build-modules` | Adding a custom admin view, tab, or field component |
| `payload-frontend-build-components` | Building a front-end React component or page (Next.js + Tailwind) |
| `payload-security` | Security review, or auth/access control/uploads/CORS/CSRF/headers/logging changes |
| `writing-questions` | Writing questions for a client or stakeholder |
| `spec-writing` | Writing or reviewing a feature spec |

### Skill combinations

| When working on | Load |
|---|---|
| Any TypeScript code | `code-style` |
| New collection | `payload-build-collections` + `code-style` |
| New admin view | `payload-build-modules` + `code-style` |
| Front-end component or page | `payload-frontend-build-components` + `code-style` |
| Collection security / access control | `payload-security` + `payload` |

---

## Project Structure

```
src/
├── access/                    # Shared access control functions
├── app/
│   ├── [locale]/(frontend)/   # Client-facing app
│   └── (payload)/             # Payload admin routes and API
├── collections/               # One folder per collection (index.ts + optional hooks.ts, types.ts)
├── components/
│   ├── common/                # App-wide, non-domain components
│   └── ui/                    # Domain-agnostic UI primitives
├── data/                      # Static/seed data
├── i18n/                      # next-intl config
├── lib/                       # Business-agnostic utilities and SDK client
├── migrations/                # Payload DB migrations (auto-generated)
├── modules/                   # Vertical business modules
│   └── <module>/
│       ├── <area>/            # Domain area (types, constants, rules)
│       ├── components/        # Module-owned frontend components
│       ├── server/            # Server-only queries and use cases
│       └── admin/             # Module-owned Payload Admin UI
├── scripts/                   # One-off CLI scripts
├── payload-types.ts           # Auto-generated — do not edit
└── payload.config.ts
.claude/skills/                # Skills for Claude Code
.agents/skills/                # Skills for Codex
.ai/
├── specs/                     # Feature specs (tracked)
└── audits/                    # Security audit status (gitignored — lists unpatched gaps)
```

---

## Module Architecture

- `src/modules/` is organized by business capability, not by Payload collection. A module
  is a vertical slice that may own domain rules, frontend components, server queries, and
  Payload Admin UI.
- Closely related concepts belong to areas inside one module. For example, `training`
  contains `exercises`, `plans`, and `logs`; do not create a separate top-level module for
  every table or entity.
- Keep `src/app/` thin: route files compose module entry points but do not own feature
  implementations. Modules must never import from `src/app/`.
- Keep Payload `CollectionConfig`, fields, hooks, access control, relationships, and
  indexes in `src/collections/`. Collections may import only client-safe domain APIs from
  modules, never module components, admin UI, or server entry points.
- Put domain-specific React components under `src/modules/<module>/components/`. Keep only
  domain-agnostic primitives in `src/components/ui/` and cross-module application UI in
  `src/components/common/`.
- Put server-side queries and use cases under an explicit `server/` entry point and add
  `import 'server-only'`. Do not re-export server code from a client-safe module barrel.
- Put Payload Admin implementations under `src/modules/<module>/admin/<feature>/`.
  Collection configuration must reference the exact component file and the import map
  must be regenerated after a path changes.
- Use `types.ts` only for types and interfaces, and `constants.ts` only for constants and
  declarative configuration. Name operation files after their responsibility; do not add
  generic `utils.ts`, `helpers.ts`, or `models.ts` files.
- Code outside a domain area must use its public `index.ts`. Environment-specific APIs use
  explicit subpaths such as `@/modules/training/plans/server` or
  `@/modules/training/components/workout-plans`.
- Cross-module dependencies must use public entry points, remain one-directional, and
  stay cycle-free. For example, `sharing` may use the public `training/plans/server` API;
  `training` must not depend back on `sharing`.
- Keep only business-agnostic technical functions and SDK clients in `src/lib/`.

---

## Payload-Generated Types

- `src/payload-types.ts` is generated by Payload from collection, field, global, and
  `payload.config.ts` definitions. Never edit it manually; regenerate it with
  `yarn generate:types`.
- A type declared in a module may use the same name as a generated Payload type. Types
  exported from different files do not conflict merely because their names match.
- A naming conflict occurs only when two types with the same local name are imported
  into the same scope. Alias the imports when both representations are needed, for
  example `Workout as PayloadWorkout` and `Workout as PlanWorkout`.
- Name module-owned types according to their domain role. Do not add prefixes or
  suffixes solely to avoid a same-name type exported by another module.

---

## Key Commands

```bash
yarn dev                    # start dev server
yarn build                  # production build - run only when explicitly requested
yarn payload migrate:create # generate a migration after a schema change - run manually
yarn payload migrate        # run pending DB migrations - run manually
yarn generate:types         # regenerate payload-types.ts
yarn generate:importmap     # regenerate admin import map (after adding custom views)
yarn seed                   # seed demo data
yarn lint                   # ESLint
npx skills add <src> -a claude-code -a codex --copy  # install skills
```

## Database Migrations

- Generate migrations with `yarn payload migrate:create` after every schema change.
- Maintainers run `yarn payload migrate:create` and `yarn payload migrate` manually. Agents must not run either command.
- Agents must never create migration files manually or edit Payload-generated migration files.
- Keep Payload-generated schema migrations in their generated form. Do not add manual SQL or data updates to them.

## Data Backfills

- Implement every data backfill as a separate, idempotent script through the Payload Local API.
- Do not add data backfill SQL to Payload-generated schema migrations.
- Maintainers run backfill scripts manually. Agents must not run them.

---

## Pull Request Descriptions

- Treat `Generate PR description`, `Wygeneruj opis PR`, and equivalent requests
  as an instruction to generate the file below.
- When asked to generate a pull request description, follow
  `.ai/instructions/generate-pr-description.md`.
- Store the generated description in `.ai/pr-description.md`. This file is a local,
  gitignored artifact and must not be committed.
- `yarn pr:create` reads that file and creates a new pull request or updates the
  existing open pull request for the current branch.
- Pull request descriptions must not contain commit lists or commit hashes.

---

## Release

Releases use [Changesets](https://github.com/changesets/changesets).

- For any user-facing change, add a changeset: `yarn changeset` (or create a `.changeset/*.md` file with the bump level and summary).
- **The maintainer runs the release flow** — `yarn prepare-release` (runs `changeset version`, commits the bump, pushes `develop`, creates the `release/vX.Y.Z` branch, and opens the release PR).
- Agents must **not** run `prepare-release` or `git push` to remote. Prepare locally only — create the changeset and commits — then hand off with the exact command (`yarn prepare-release`). Push/publish only if the maintainer explicitly asks this time.
- Branch model and the full human release process: see `CONTRIBUTING.md`.
