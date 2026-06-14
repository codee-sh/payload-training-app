# Specification Template

File naming: `.ai/specs/YYYY-MM-DD-kebab-case-title.md`

---

```markdown
# {Feature Title}

**Date:** YYYY-MM-DD
**Status:** draft | review | approved | implemented
**Area:** backend | storefront | admin | integration

---

## TLDR

{1–3 sentences. What is this, why does it exist, what does it change.}

---

## Open Questions

> Remove this section once all questions are resolved. STOP and wait for answers before proceeding to Design.

- Q1: {Decision that blocks architecture or data model}
- Q2: …

---

## Problem Statement

{What is broken, missing, or suboptimal today? Why does this need to be built?}

---

## Proposed Solution

{High-level description of the approach. What we build and how it fits into the existing system.}

---

## Architecture

{Module → Workflow → Route layer diagram or description.}

### File Structure

\```
src/
├── modules/{module-name}/
│   ├── index.ts
│   ├── service.ts
│   └── types.ts
├── workflows/
│   ├── steps/
│   │   └── {step-name}.ts
│   └── {workflow-name}.ts
├── api/admin/{route}/
│   └── route.ts
└── jobs/
    └── {job-name}.ts
\```

---

## Data Models / Mapping

{If integrating an external system, include a mapping table.}

| External Field | Medusa Field | Notes |
|---------------|--------------|-------|
| … | … | … |

---

## API Contracts

{List every new route with method, path, request body (Zod schema), and response shape.}

\```
POST /admin/{route}
Body: {
  field: type   // description
}
Response: { … }
\```

---

## Workflow Design

{Step-by-step description of each workflow, including which built-in Medusa workflows are reused.}

\```
workflowName
├── [step] stepOne — description
├── [step] useQueryGraphStep (built-in)
├── [transform()] data mapping
├── [step] createProductsWorkflow (built-in)
└── [step] updateProductsWorkflow (built-in)
\```

---

## Phasing

### Phase 1 — {Name}
{Description. Deliverable: what works at the end of this phase.}

### Phase 2 — {Name}
{Description.}

---

## Implementation Plan

### Phase 1

- [ ] Step 1: {Concrete, testable task}
- [ ] Step 2: …

### Phase 2

- [ ] Step 1: …

---

## Risks & Impact

| Risk | Severity | Mitigation |
|------|----------|-----------|
| … | high / medium / low | … |

---

## Open Questions

- [ ] {Unresolved decision — remove when answered}

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | … | Initial draft |
```
