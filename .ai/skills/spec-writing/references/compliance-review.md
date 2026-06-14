# Final Compliance Review

Run this after the spec checklist passes. Validates the spec against the hard rules in `AGENTS.md`.

---

## Compliance Matrix

| Rule | Source | Status | Notes |
|------|--------|--------|-------|
| Module name is camelCase | AGENTS.md | ✅ / ❌ / N/A | |
| No PUT/PATCH methods | AGENTS.md | ✅ / ❌ / N/A | |
| All mutations through workflow | AGENTS.md | ✅ / ❌ / N/A | |
| No module service called from route | AGENTS.md | ✅ / ❌ / N/A | |
| Prices not multiplied/divided by 100 | AGENTS.md | ✅ / ❌ / N/A | |
| Static imports only | AGENTS.md | ✅ / ❌ / N/A | |
| `transform()` used for data manipulation in workflows | AGENTS.md | ✅ / ❌ / N/A | |
| `external_id` for idempotency | AGENTS.md | ✅ / ❌ / N/A | |
| Zod validation on all API inputs | AGENTS.md | ✅ / ❌ / N/A | |
| Built-in Medusa workflows preferred over custom | Medusa docs | ✅ / ❌ / N/A | |
| `query.graph()` for cross-module reads | AGENTS.md | ✅ / ❌ / N/A | |
| `query.index()` for cross-module filtering | AGENTS.md | ✅ / ❌ / N/A | |

---

## Verdict

- **APPROVED** — All rules pass or are explicitly N/A with justification.
- **CHANGES REQUIRED** — List violations below.

### Violations (if any)

- …
