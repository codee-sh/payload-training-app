#!/bin/sh
set -eu

# Links a single skill folder into a target skills directory.
# Skips if the symlink already points to the correct target.
ensure_skill_link() {
  skill_source="$1"
  skills_dir="$2"
  skill_name="$(basename "$skill_source")"
  link_path="$skills_dir/$skill_name"

  mkdir -p "$skills_dir"

  if [ -e "$link_path" ] && [ ! -L "$link_path" ]; then
    echo "Expected $link_path to be a symlink. Remove the existing path and re-run." >&2
    exit 1
  fi

  if [ -L "$link_path" ]; then
    rm -f "$link_path"
  fi

  ln -s "$skill_source" "$link_path"
  echo "Linked $link_path -> $skill_source"
}

# Link all skills from a source directory into a target skills directory.
link_skills_dir() {
  source_dir="$1"
  target_dir="$2"

  for skill in "$source_dir"/*/; do
    [ -d "$skill" ] || continue
    ensure_skill_link "$(cd "$skill" && pwd)" "$target_dir"
  done
}

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

link_skills_dir "$REPO_ROOT/.ai/skills"    "$REPO_ROOT/.claude/skills"
link_skills_dir "$REPO_ROOT/.agents/skills" "$REPO_ROOT/.claude/skills"
link_skills_dir "$REPO_ROOT/.ai/skills"    "$REPO_ROOT/.codex/skills"
link_skills_dir "$REPO_ROOT/.agents/skills" "$REPO_ROOT/.codex/skills"

echo ""
echo "Skills installation complete."
echo ""
echo "Test the install:"
echo "   Claude Code:"
echo "     claude"
echo "     > /skills"
echo "   Codex:"
echo "     codex"
echo "     > /skills"
