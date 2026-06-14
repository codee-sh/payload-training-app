# AGENTS.md

Operational guide for AI agents working in this repository.

---

## Before Writing Code

- Write everything in English: code, comments, variable names, documentation.
- Check `.ai/specs/` before coding any non-trivial feature.
- Prefer minimal, focused changes. Do not refactor code outside the task scope.
- Run `yarn build` after every implementation to catch type errors.
- Comment and naming conventions are defined in the `code-style` skill. Load it before writing or reviewing TypeScript.

---

## Task Router

Match the task to the table before starting. A single task often maps to multiple rows.

| Task | Action |
|---|---|
| Creating a new collection or extending the schema | Load skill `payload-build-collections` |
| Adding a custom admin view, tab, or field UI | Load skill `payload-build-modules` |
| Debugging hooks, queries, access control, transactions | Load skill `payload` |
| Writing or reviewing any user-facing string | Load skill `ui-copy` |
| Writing questions for a client or stakeholder | Load skill `writing-questions` |
| Starting a new spec or reviewing one | Load skill `spec-writing` |
| Any TypeScript code | Load skill `code-style` |

---

## Skills

Skills extend the agent with task-specific guidance, checklists, and reference material.

**Structure:** Each skill lives in its own folder under `.ai/skills/` with a `SKILL.md` entry point and optional `reference/` files loaded on demand.

**Automatic triggering:** If the task matches a skill's description, load the skill before starting — without waiting to be asked.

**Reference files:** `SKILL.md` specifies which references to load for a given subtask. Do not load all references blindly.

### Source of truth: `.ai/skills/`

`.ai/skills/` is the canonical location. Skills are symlinked from there into `.claude/skills/` and `.codex/skills/` via:

```bash
yarn install-skills
```

**Always create or edit skills in `.ai/skills/`.** Never edit files directly in `.claude/skills/` or `.codex/skills/`.

### Available skills

| Skill | When to load |
|---|---|
| `code-style` | Any TypeScript code |
| `payload` | Debugging Payload: hooks, queries, access control, transactions, security |
| `payload-build-collections` | Creating a new collection or extending the schema |
| `payload-build-modules` | Adding a custom admin view, tab, or field component |
| `ui-copy` | Any user-facing string (labels, descriptions, toasts, errors) |
| `writing-questions` | Writing questions for a client or stakeholder |
| `spec-writing` | Writing or reviewing a feature spec |

### Skill combinations

| When working on | Load |
|---|---|
| Any TypeScript code | `code-style` |
| New collection | `payload-build-collections` + `code-style` |
| New admin view | `payload-build-modules` + `code-style` |
| Any user-facing string | `ui-copy` |

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
│   ├── common/
│   ├── ui/
│   └── workout/
├── data/                      # Static/seed data
├── i18n/                      # next-intl config
├── lib/                       # Utilities and SDK client
├── loaders/                   # Server-side data fetching
├── migrations/                # Payload DB migrations (auto-generated)
├── scripts/                   # One-off CLI scripts
├── types/
├── payload-types.ts           # Auto-generated — do not edit
└── payload.config.ts
.ai/
├── skills/                    # Skill definitions (source of truth)
└── specs/                     # Feature specs
```

---

## Key Commands

```bash
yarn dev                    # start dev server
yarn build                  # production build — run after every implementation
yarn payload migrate        # run pending DB migrations
yarn generate:types         # regenerate payload-types.ts
yarn generate:importmap     # regenerate admin import map (after adding custom views)
yarn seed                   # seed demo data
yarn lint                   # ESLint
yarn install-skills         # sync .ai/skills/ into .claude/ and .codex/
```
