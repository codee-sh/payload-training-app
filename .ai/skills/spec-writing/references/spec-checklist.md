# Spec Review Checklist

Apply this checklist before finalizing any spec. Every item must be explicitly addressed or marked N/A with justification.

---

## Design & Scope

- [ ] TLDR is clear in 1–3 sentences
- [ ] Problem statement explains why this is needed
- [ ] MVP boundary is explicit — what is out of scope
- [ ] Phasing is testable — each phase ends with a working application

## Architecture (Medusa)

- [ ] Follows Module → Workflow → Route layer order (no bypasses)
- [ ] All mutations go through a workflow
- [ ] Only GET, POST, DELETE methods used
- [ ] Module name is camelCase (no dashes)
- [ ] No dynamic imports inside route handlers
- [ ] Business logic is in workflow steps, not in routes

## Data & Mapping

- [ ] All external fields are mapped to Medusa fields
- [ ] `external_id` (or equivalent) used for idempotency on sync/migration
- [ ] Prices stored as-is — no ×100 / ÷100 conversion
- [ ] Zod validation defined for all API inputs
- [ ] Data transformation uses `transform()` block, not a workflow step

## Workflows

- [ ] Built-in Medusa workflows reused where applicable (`createProductsWorkflow`, `updateProductsWorkflow`, etc.)
- [ ] `transform()` used for variable manipulation, conditionals, date creation inside workflows
- [ ] Steps with duplicate calls use `.config({ name: "unique-name" })`
- [ ] Workflow function is `function` (not async, not arrow)

## API Contracts

- [ ] Every new route is documented with method, path, request body, response shape
- [ ] Authentication/authorization requirement stated (admin? public? customer?)

## Integration / External APIs

- [ ] Authentication mechanism documented
- [ ] Pagination strategy defined
- [ ] Error handling for failed external API calls described
- [ ] Rate limiting / retry strategy mentioned if applicable

## Risks

- [ ] At least one risk identified with severity and mitigation
- [ ] Data consistency on partial failure addressed (what state is left if workflow aborts mid-run?)

## Open Questions

- [ ] All Open Questions from the skeleton are resolved and removed (or explicitly deferred with reason)

---

## Review Sign-off

| Check | Result | Notes |
|-------|--------|-------|
| Architecture | pass / fail | |
| Data mapping | pass / fail | |
| Workflow design | pass / fail | |
| Risks | pass / fail | |
| Open questions resolved | pass / fail | |
