#!/usr/bin/env bash
set -euo pipefail

# Creates or updates a GitHub pull request using a locally prepared description.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BASE_BRANCH="${BASE_BRANCH:-develop}"
BASE_REF="${BASE_REF:-origin/${BASE_BRANCH}}"
PR_BODY_FILE="${PR_BODY_FILE:-.ai/pr-description.md}"
PR_DRY_RUN="${PR_DRY_RUN:-false}"
PR_ALLOW_FALLBACK="${PR_ALLOW_FALLBACK:-false}"
PR_TESTING="${PR_TESTING:-- Not run (not requested).}"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -z "$CURRENT_BRANCH" || "$CURRENT_BRANCH" == "HEAD" ]]; then
  echo "Error: unable to determine the current branch." >&2
  exit 1
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Error: base ref '$BASE_REF' does not exist." >&2
  echo "Fetch it first or override BASE_REF." >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/create-pr.XXXXXX")"
trap 'rm -rf "$TEMP_DIR"' EXIT

extract_changeset_summary() {
  awk '
    BEGIN { separatorCount=0; summary="" }
    /^---$/ { separatorCount++; next }
    separatorCount >= 2 {
      if (summary == "" && $0 ~ /[^[:space:]]/) {
        summary=$0
        next
      }
      if (summary != "" && $0 ~ /^[[:space:]]*$/) {
        exit
      }
      if (summary != "") {
        summary=summary " " $0
      }
    }
    END { print summary }
  ' "$1"
}

write_fallback_description() {
  local output_file="$1"
  local changeset_summaries_file="$TEMP_DIR/changeset-summaries.txt"
  local changed_files_file="$TEMP_DIR/changed-files.txt"
  local changed_areas_file="$TEMP_DIR/changed-areas.txt"
  local migrations_file="$TEMP_DIR/migrations.txt"

  : > "$changeset_summaries_file"
  : > "$changed_files_file"
  : > "$changed_areas_file"
  : > "$migrations_file"

  git diff --name-only "$BASE_REF"...HEAD > "$changed_files_file"

  while IFS= read -r changeset_file; do
    [[ -f "$changeset_file" ]] || continue
    [[ "$(basename "$changeset_file")" == "README.md" ]] && continue

    local summary
    summary="$(extract_changeset_summary "$changeset_file")"
    if [[ -n "$summary" ]]; then
      printf '%s\n' "$summary" >> "$changeset_summaries_file"
    fi
  done < <(git diff --name-only "$BASE_REF"...HEAD -- '.changeset/*.md')

  awk -F/ '
    NF == 1 { print $1; next }
    NF > 1 { print $1 "/" $2 }
  ' "$changed_files_file" | sort -u > "$changed_areas_file"

  awk '/^src\/migrations\// { print }' "$changed_files_file" > "$migrations_file"

  {
    echo "## Summary"
    echo
    if [[ -s "$changeset_summaries_file" ]]; then
      while IFS= read -r summary; do
        printf -- '- %s\n' "$summary"
      done < "$changeset_summaries_file"
    else
      echo "- Update the areas included in this pull request."
    fi

    echo
    echo "## Architecture"
    echo
    if [[ -s "$changed_areas_file" ]]; then
      echo "- Changed areas:"
      while IFS= read -r changed_area; do
        printf -- '  - `%s`\n' "$changed_area"
      done < "$changed_areas_file"
    else
      echo "- No material architecture changes."
    fi

    echo
    echo "## Database"
    echo
    if [[ -s "$migrations_file" ]]; then
      echo "- Included migration files:"
      while IFS= read -r migration_file; do
        printf -- '  - `%s`\n' "$migration_file"
      done < "$migrations_file"
      echo "- Database migrations must be run manually."
    else
      echo "- No database changes."
    fi

    echo
    echo "## Testing"
    echo
    printf '%s\n' "$PR_TESTING"
  } > "$output_file"
}

validate_description() {
  local description_file="$1"

  if [[ ! -s "$description_file" ]]; then
    echo "Error: pull request description is empty: $description_file" >&2
    exit 1
  fi

  local required_heading
  for required_heading in "## Summary" "## Architecture" "## Database" "## Testing"; do
    if ! grep -Fqx "$required_heading" "$description_file"; then
      echo "Error: missing required heading '$required_heading' in $description_file." >&2
      exit 1
    fi
  done
}

if [[ ! -s "$PR_BODY_FILE" ]]; then
  if [[ "$PR_ALLOW_FALLBACK" != "true" ]]; then
    echo "Error: missing pull request description: $PR_BODY_FILE" >&2
    echo "Ask an AI agent to 'Generate PR description' and follow:" >&2
    echo "  .ai/instructions/generate-pr-description.md" >&2
    echo "To use the deterministic fallback instead:" >&2
    echo "  PR_ALLOW_FALLBACK=true yarn pr:create" >&2
    exit 1
  fi

  PR_BODY_FILE="$TEMP_DIR/fallback-description.md"
  write_fallback_description "$PR_BODY_FILE"
fi

validate_description "$PR_BODY_FILE"

if [[ "$PR_DRY_RUN" == "true" ]]; then
  cat "$PR_BODY_FILE"
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required but not found in PATH." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh CLI is not authenticated. Run 'gh auth login'." >&2
  exit 1
fi

existing_pr_number="$(
  gh pr list \
    --base "$BASE_BRANCH" \
    --head "$CURRENT_BRANCH" \
    --state open \
    --json number \
    --jq '.[0].number // empty'
)"

if [[ -n "$existing_pr_number" ]]; then
  gh pr edit "$existing_pr_number" --body-file "$PR_BODY_FILE"
  echo "Pull request #$existing_pr_number updated successfully."
  exit 0
fi

PR_TITLE="${PR_TITLE:-${CURRENT_BRANCH}}"

gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body-file "$PR_BODY_FILE"

echo "Pull request created successfully."
