# Generate a Pull Request Description

Follow this instruction when the user asks to "Generate PR description",
"Wygeneruj opis PR", or makes an equivalent request.

## Output

Write the final English Markdown description to:

```text
.ai/pr-description.md
```

Overwrite an existing file. Do not create or update the pull request unless the
user also asks for that action.

## Sources

Use the current branch compared with `origin/develop` by default. If the user
specifies another base branch, use `origin/<base-branch>`.

## Procedure

Run the following read-only checks from the repository root:

```bash
git status --short --branch
git diff --stat <base>...HEAD
git diff --name-status <base>...HEAD
git diff <base>...HEAD -- .changeset
git diff <base>...HEAD -- src/migrations
git diff <base>...HEAD
git diff --stat
git diff --name-status
```

Replace `<base>` with the selected remote base ref. Narrow the full source diff
to relevant files when it is too large to review as one output.

Then:

1. Read every changed changeset under `.changeset/`.
2. Use the name-status and stat output to establish the scope of the pull
   request.
3. Read relevant source diffs to verify what behavior actually changed.
4. Check added or changed migration files and identify any manual database or
   backfill step.
5. Determine which tests and checks were actually run from the current task
   context and available command results.
6. Review uncommitted changes separately. Include them only when they are part
   of the requested pull request, and do not present them as committed changes.
7. Synthesize the findings into the required format and save the result to
   `.ai/pr-description.md`.

Do not use the commit list as description content. Do not include commit hashes,
commit-by-commit summaries, or a commits section.

## Required format

```markdown
## Summary

- Describe the user-facing and operational outcome.
- Include material behavior changes.

## Architecture

- Describe important boundaries, data-flow changes, or refactors.
- Write `- No material architecture changes.` when not applicable.

## Database

- List included migrations and any manual deployment steps.
- Write `- No database changes.` when not applicable.

## Testing

- List only checks that were actually run and their result.
- Explicitly state important checks that were not run.
```

## Writing rules

- Keep the description concise and specific.
- Describe outcomes rather than listing files.
- Consolidate related changes into one bullet.
- Use changesets as the primary source for user-facing changes.
- Use source diffs to verify and enrich the changeset summaries.
- Write `Summary` from user-visible and operational outcomes.
- Write `Architecture` only for meaningful boundaries, data flow, public APIs,
  or structural changes; a list of changed directories is not architecture.
- Write `Database` from migration and schema evidence, including manual steps.
- Write `Testing` from observed command results, not from expected CI behavior.
- Never claim a test, migration, backfill, build, or deployment was run without
  evidence from the current task or repository state.
- Mention manual migration or backfill requirements explicitly.
- Do not include placeholders, speculative claims, implementation chronology,
  commit messages, or commit hashes.
- Do not include a generated-by-AI note.

## Validation

Before finishing:

1. Confirm all four required headings are present.
2. Confirm the description contains no commit list or commit hashes.
3. Confirm testing claims match the checks that were actually run.
4. Confirm `.ai/pr-description.md` is ignored by Git.
