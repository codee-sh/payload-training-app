#!/usr/bin/env bash
set -euo pipefail

# Creates or updates a GitHub pull request using a locally prepared description.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BASE_BRANCH="${BASE_BRANCH:-develop}"
BASE_REF="${BASE_REF:-origin/${BASE_BRANCH}}"
PR_BODY_FILE="${PR_BODY_FILE:-.ai/pr-description.md}"
PR_DRY_RUN="${PR_DRY_RUN:-false}"

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

  if grep -Fq "PR_DESCRIPTION_REQUIRED" "$description_file"; then
    echo "Error: complete all required sections in $description_file." >&2
    exit 1
  fi
}

if [[ ! -s "$PR_BODY_FILE" ]]; then
  echo "Error: missing pull request description: $PR_BODY_FILE" >&2
  echo "First ask an AI agent to 'Generate PR description'." >&2
  echo "The agent must use the 'generate-pr-description' skill." >&2
  echo "If no AI model is available, start from the manual template:" >&2
  echo "  cp .ai/templates/pr-description.md .ai/pr-description.md" >&2
  echo "Then preview it with:" >&2
  echo "  PR_DRY_RUN=true yarn pr:create" >&2
  exit 1
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
