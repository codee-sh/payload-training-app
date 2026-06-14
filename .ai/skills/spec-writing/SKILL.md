---
name: spec-writing
description: Guide for creating high-quality, architecturally compliant specifications for this Medusa.js project. Use when starting a new spec or reviewing one against staff-engineer standards.
---

# Spec Writing & Review

Design and review specifications against this project's Medusa architecture, naming, and quality rules.

---

## Workflow

1. **Load Context** — Read `AGENTS.md` Task Router. Load the relevant spec from `.ai/specs/` if one exists for this topic. **Check `.ai/specs/references/` for any additional data files (field mappings, data exports, design docs) — read all files found there before proceeding.**
2. **Initialize** — Create an empty file: `.ai/specs/YYYY-MM-DD-kebab-case-title.md`
3. **Start Minimal** — Write a **Skeleton Spec** first: TLDR + 2–3 key sections. Do NOT write the full spec in one pass.
   - Before the skeleton, scan the brief for **critical unknowns** — decisions that block architecture, data model, or scope.
   - If unknowns exist, add a numbered **Open Questions** block (`Q1`, `Q2`, …) right after the TLDR.
   - **STOP after presenting the skeleton.** Do not proceed to Research or beyond until the user answers all questions. This is a hard gate.
4. **Iterate** — Apply answers to fill in the skeleton. Remove resolved questions. Repeat the gate for any new unknowns.
5. **Research** — Validate requirements against Medusa's built-in capabilities and official patterns. Check if a built-in workflow already exists before designing a custom one.
6. **Design** — Architecture, data flow, module structure, workflow steps, API contracts.
7. **Implementation Breakdown** — Break into **Phases** (stories) and **Steps** (testable tasks). Each step must result in a runnable application.
8. **Review** — Apply the [Spec Checklist](references/spec-checklist.md).
9. **Compliance Gate** — Apply the [Compliance Review](references/compliance-review.md).
10. **Output** — Finalize the spec file.

---

## Output Formats

### 1. New Specification

Use [Specification Template](references/spec-template.md). Adapt structure as needed, but always cover:

- **TLDR & Overview** — what and why
- **Problem Statement** — what are we solving
- **Proposed Solution** — high-level approach
- **Architecture** — module → workflow → route layers
- **Data Mapping** — external source → Medusa fields
- **Phasing** — delivery breakdown
- **Implementation Plan** — concrete steps
- **Open Questions** — unresolved decisions

### 2. Architectural Review

When reviewing an existing spec:

```
# Architectural Review: {Spec Title}

## Summary
{1–3 sentences: what the spec proposes and overall health}

## Findings

### Critical
{Medusa layer violations, workflow bypasses, wrong HTTP methods, module name with dashes}

### High
{Missing idempotency, no error handling strategy, missing data mapping gaps}

### Medium
{Missing failure scenarios, ambiguous field names, missing pagination strategy}

### Low
{Stylistic nits, minor inconsistencies}

## Checklist
See references/spec-checklist.md
```

---

## Review Heuristics

1. **Layer Order** — Does the spec follow Module → Workflow → Route? No layer may be bypassed.
2. **Idempotency** — Is there an `external_id` or equivalent key to prevent duplicate imports on re-run?
3. **Transform vs. Step** — Is data mapping done in a `transform()` block (correct) or in a workflow step (wrong)?
4. **Built-in First** — Does the spec use `createProductsWorkflow` / `updateProductsWorkflow` instead of reinventing them?
5. **Open Questions Gate** — Are all architectural unknowns resolved before design proceeds?

---

## Quick Rule Reference (Medusa)

- `camelCase` module names — never dashes (`structPim` ✓, `struct-pim` ✗)
- `GET`, `POST`, `DELETE` only — never `PUT` or `PATCH`
- All mutations through a workflow — never call module service from a route
- Prices stored as-is — never multiply or divide by 100
- Static imports only — no `await import()` inside route handlers
- `transform()` for data manipulation inside workflows — not plain steps
- Use `external_id` for idempotency on all migration/sync operations
- Zod validation for all API route inputs

---

## Reference Materials

- [Spec Checklist](references/spec-checklist.md)
- [Compliance Review](references/compliance-review.md)
- [Specification Template](references/spec-template.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [Medusa Magento Example](https://docs.medusajs.com/resources/integrations/guides/magento)
