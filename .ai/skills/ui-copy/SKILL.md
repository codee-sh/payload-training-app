---
name: ui-copy
description: Guidelines for writing user-facing text in this project — labels, descriptions, headings, empty states, error messages, tooltips. Load when writing any UI string regardless of framework or surface.
---

# UI Copy

---

## Language

All UI text is written in **English**. This includes headings, labels, descriptions, button text, empty states, error messages, and tooltips.

---

## Tone

- Clear and direct. No filler words.
- Neutral and professional. Not conversational or playful.
- Write for someone who knows the domain.

---

## Punctuation

**No em dashes (`—`) or en dashes (`–`).** Use a period or rewrite the sentence instead.

| Instead of | Write |
|------------|-------|
| `Fixed mapping — resolves each customer's Sales Org` | `Fixed mapping. Resolves each customer's Sales Org.` |
| `Read-only — cannot be edited` | `Read-only. Cannot be edited.` |

**Single-sentence descriptions** do not end with a period.

**Multi-sentence descriptions** end every sentence with a period.

**Button labels** use sentence case, not title case.
- Correct: `Add mapping`, `Save changes`
- Incorrect: `Add Mapping`, `Save Changes`

**Section headings** use title case (`Sales Channel Mapping`). Form labels and inline descriptions use sentence case.

---

## Naming

- Use the full, descriptive name when context is needed. Avoid abbreviations in user-facing text.
- Prefer the domain term over a generic synonym. Match the language used in specs and in conversation with the client.
- When an internal identifier or constant is shown in UI, its label should reflect what it represents to the user, not what it is in code.

---

## Empty states

Short and non-alarming. Do not explain why something is empty unless the reason is actionable.

- `No mappings configured yet.`
- `No results found.`

---

## When to load this skill

Load before writing any user-facing string: headings, labels, descriptions, placeholders, success/error messages, empty states, tooltips.
