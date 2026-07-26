# Contributing Guide

This guide explains how we organize releases, structure branches, and prepare pull requests so changes land smoothly.

## Branch Model

- **`main`** – Release-ready code. Every commit is tagged and deployable. Keep PRs targeting `main` limited to hotfixes or release preparation approved by maintainers.
- **`develop`** – Nightly builds and upcoming release work. Base regular feature work off `develop` so it can soak in automation and shared testing.
- **Topic branches** – Create a dedicated branch per change using the format `feat/<concise-feature-name>` (for example `feat/customer-export`). Use other prefixes when appropriate (`fix/`, `chore/`, `docs/`).

## Working on Features

> **External contributors:** your flow ends at a PR to `develop` — branch from `develop`, add a changeset, open the PR. You do **not** create releases; maintainers handle the [Release Process](#release-process) below.

1. **Branch from `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

2. **Keep commits scoped and descriptive**:
   ```bash
   git commit -m "feat: add customer export feature"
   ```

3. **Keep your branch up to date**:
   ```bash
   git pull --rebase origin develop
   ```

4. **Open PR targeting `develop`**:
   - Describe the user impact, architectural notes, and testing performed
   - Ensure the branch merges cleanly and CI is green before requesting review
   - Reference related issues or discussions

   Ask an AI agent to `Generate PR description` (or `Wygeneruj opis PR`) before
   running:

   ```bash
   yarn pr:create
   ```

   The agent follows `.ai/instructions/generate-pr-description.md` and writes the
   local, gitignored `.ai/pr-description.md` file. The command creates a new pull
   request or updates the existing open pull request for the current branch.

   To preview the description without changing GitHub:

   ```bash
   PR_DRY_RUN=true yarn pr:create
   ```

   If no AI model is available, prepare the description manually from the
   tracked template:

   ```bash
   cp .ai/templates/pr-description.md .ai/pr-description.md
   ```

   Replace every instruction in the copied file before running
   `yarn pr:create`. The command rejects an incomplete template.

## Release Process

> **Maintainers only.** Steps 1–3 are automated by `yarn prepare-release` (runs `changeset version`, commits, pushes `develop`, creates the `release/vX.Y.Z` branch, and opens the release PR). The steps below document what the script does.

### Normal Release Flow

1. **Prepare release on `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   yarn changeset version  # Updates package.json and CHANGELOG.md
   git add .
   git commit -m "chore: version packages"
   git push origin develop
   ```

2. **Create release branch**:
   ```bash
   git checkout -b release/v1.1.X
   git push origin release/v1.1.X
   ```

3. **Open PR: `release/v1.1.X` → `main`**:
   - Title: `release: v1.1.X`
   - Description: Include summary of changes from CHANGELOG.md
   - Wait for review/approval

4. **After PR merge to `main`**:
   - Tag will be created automatically (or create manually):
     ```bash
     git checkout main
     git pull origin main
     git tag -a v1.1.X -m "Release v1.1.X"
     git push origin v1.1.X
     ```
   - Create GitHub Release using workflow: Actions → "Create Release" → Run workflow

5. **Synchronize `develop`** (if needed):
   ```bash
   git checkout develop
   git merge main  # Only if main has commits not in develop
   git push origin develop
   ```

### Hotfix Flow

1. **Create hotfix branch from `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   ```

2. **Make fix and commit**:
   ```bash
   # ... make changes ...
   git commit -m "fix: critical bug description"
   git push origin hotfix/critical-bug
   ```

3. **Open PR: `hotfix/critical-bug` → `main`**:
   - After merge, create tag and release

4. **Merge `main` → `develop`** (synchronization):
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

## Pull Requests

- **Open PRs against `develop`** unless you are coordinating a release hotfix
- **Describe the user impact**, architectural notes, and testing performed
- **Ensure the branch merges cleanly** and CI is green before requesting review
- **Reference related issues** or discussions
- **Tag maintainers early** if you need design or architectural guidance

## Versioning

We use [Changesets](https://github.com/changesets/changesets) for version management:

- **Add changeset** when making changes:
  ```bash
  yarn changeset
  ```

- **Version bump** happens during release preparation:
  ```bash
  yarn changeset version
  ```

- **Version format**: Semantic versioning (MAJOR.MINOR.PATCH)

## Helpful Resources

- 📚 Documentation: Check project README.md
- 💬 Issues: [GitHub Issues](https://github.com/codee-sh/payload-training-app/issues)

Thanks for contributing!
