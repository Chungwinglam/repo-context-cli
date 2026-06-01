# Repo Context CLI Roadmap

This file is the source of truth for project phase status. Update it whenever a small task is completed.

## Current Status

- Current phase: Phase 5 in progress
- Last completed milestone: Phase 5 maintainer release checklist
- Private repository: `Chungwinglam/repo-context-cli`
- Default branch: `main`

## Operating Rule

After each completed small task:

- Update this roadmap in the same work cycle.
- Record the task outcome in the activity log.
- Update the current phase if needed.
- State the next-stage goal in the final response.

## Phase 1: MVP CLI

Status: Complete

Delivered:

- TypeScript Node CLI with `repo-context pack`.
- Agent target flag: `--for codex|claude|cursor`.
- Output controls: `--output`, `--max-files`, `--dry-run`, `--force`.
- Generated files: `AGENTS.md`, `PROJECT_MAP.md`, `TESTING.md`, `.repo-context/index.json`.
- Conservative scanner, detector, renderers, writer, and pack orchestration modules.
- Safe overwrite behavior and output path escape protection.
- Tests for scanner, detector, pack behavior, CLI entrypoint, and trust boundaries.
- README, MIT license, GitHub Actions CI, and example repositories.

## Phase 2: Trust and Ecosystem Coverage

Status: Complete

Goal: Make the CLI more trustworthy on real-world repositories without losing the conservative MVP behavior.

Candidate tasks:

- Add `.gitignore` parsing while preserving fixed default ignores. (Complete)
- Add pnpm, yarn, bun, and package-manager conflict tests. (Complete)
- Add Python, Rust, Go, and Java basic detection. (Complete)
- Add monorepo baseline detection for npm workspaces, pnpm workspaces, Turbo, Nx, and common `packages/*` / `apps/*` layouts. (Complete)
- Add token and size summary for generated context packages. (Complete)
- Add npm package install smoke test in CI. (Complete)

## Phase 3: Open Source Launch Quality

Status: Complete

Goal: Improve adoption readiness for a public launch.

Candidate tasks:

- Add demo terminal recording or GIF. (Complete)
- Add `CONTRIBUTING.md` with fixture and detector-extension guidance. (Complete)
- Add `CHANGELOG.md`. (Complete)
- Add release workflow with npm trusted publishing / provenance-ready configuration. (Complete)
- Improve README examples with before/after AI-agent context. (Complete)

## Phase 4: Advanced Integrations

Status: Complete

Goal: Add optional integrations only after the CLI remains stable.

Candidate tasks:

- Secret redaction. (Complete)
- HTML report output. (Complete)
- MCP server mode. (Complete)
- Editor integrations. (Static editor config output complete)
- GitHub Action for keeping context files updated. (Check-only tracked context drift workflow complete)

## Phase 5: Release and Adoption Readiness

Status: In progress

Goal: Prepare the first public release path and improve the odds that new users can evaluate the tool quickly.

Candidate tasks:

- Run a release readiness audit for package metadata, docs, workflows, and generated artifacts. (Complete)
- Add a maintainer release checklist for npm publish and post-release verification. (Complete)
- Add GitHub issue templates and lightweight project health files.
- Add an adoption guide showing how to introduce Repo Context CLI into an existing repository.

## Activity Log

### 2026-05-31

- Completed Phase 1 MVP implementation and pushed it to the private GitHub repository.
- Added repo-local agent workflow rules in `AGENTS.md`.
- Added the roadmap sync rule and made Phase 2 planning the next project target.
- Started Phase 2 with root `.gitignore` parsing and package-manager detection hardening.
- Added pnpm, yarn, bun command inference coverage plus lockfile conflict warnings.
- Added high-risk boundary coverage for `.gitignore` negation, anchored patterns, globstar ignores, and multi-lockfile package-manager warnings.
- Merged `phase2-gitignore-package-manager` into `main`.
- Deleted the merged `phase2-gitignore-package-manager` branch locally and on `origin`.
- Added baseline monorepo detection for npm workspaces, pnpm workspaces, Turbo, Nx, and common package roots.
- Merged `phase2-monorepo-baseline-detection` into `main`.
- Deleted the merged `phase2-monorepo-baseline-detection` branch locally and on `origin`.
- Added baseline Python, Rust, Go, and Java detection without command inference.
- Merged `phase2-language-baseline-detection` into `main`.
- Deleted the merged `phase2-language-baseline-detection` branch locally and on `origin`.
- Added deterministic token and size summaries for generated context packages.
- Merged `phase2-token-size-summary` into `main`.
- Deleted the merged `phase2-token-size-summary` branch locally and on `origin`.
- Added an npm tarball install smoke test to CI.
- Started Phase 3 with `CONTRIBUTING.md`, including local development, fixture style, detector-extension guidance, and PR checklist.
- Added `CHANGELOG.md` with initial unreleased `0.1.0` release notes.
- Added a GitHub release workflow for npm trusted publishing plus release documentation with provenance constraints.
- Improved README adoption examples with before/after AI-agent context.
- Added a README terminal demo SVG and completed Phase 3 launch-quality tasks.
- Merged `phase3-demo-terminal-svg` into `main`.
- Deleted the merged `phase3-demo-terminal-svg` branch locally and on `origin`.
- Started Phase 4 with conservative secret-like path exclusion and command-value redaction.
- Merged `phase4-secret-redaction` into `main`.
- Deleted the merged `phase4-secret-redaction` branch locally and on `origin`.

### 2026-06-01

- Diagnosed the visual companion localhost failure as a Windows/Codex launcher issue: the first manual launch passed a short-lived owner PID, so the server exited with `owner process exited`; the stable workaround starts `server.cjs` without `BRAINSTORM_OWNER_PID` and verifies HTTP before sharing a URL.
- Added optional `--html-report` output for a static no-JavaScript `.repo-context/report.html`; Phase 4 remains in progress.
- Merged `phase4-html-report-output` into `main`.
- Deleted the merged `phase4-html-report-output` branch locally and on `origin`.
- Added read-only stdio MCP server mode with a `get_repo_context` tool; Phase 4 remains in progress.
- Hardened MCP server mode with fixed protocol negotiation, JSON-RPC batch/id validation, tool read-only annotations, and JSON text content for tool results; Phase 4 remains in progress.
- Addressed `CodeReviewer-01` MCP compatibility feedback by returning standard JSON-RPC batch arrays and parse-error responses; Phase 4 remains in progress.
- Merged `phase4-mcp-server-mode` into `main`.
- Deleted the merged `phase4-mcp-server-mode` branch locally and on `origin`.
- Completed editor integration planning with an approved design spec and implementation plan for optional static editor config output; Phase 4 remains in progress.
- Merged `phase4-editor-integration-planning` into `main`.
- Deleted the merged `phase4-editor-integration-planning` branch locally and on `origin`.
- Added optional `--editor-config` output for static Cursor, VS Code, and generic AI-editor guides under the selected output directory; Phase 4 remains in progress.
- Merged `phase4-editor-config-output` into `main`.
- Deleted the merged `phase4-editor-config-output` branch locally and on `origin`.
- Added `--generated-at` plus a check-only GitHub Action for deterministic tracked context file drift detection without `--force`, bot commits, or push permissions; Phase 4 is complete.
- Fast-forward merged `phase4-context-refresh-action` into `main`, fixed workflow test line-ending tolerance after Windows checkout, and cleaned up the merged branch locally and on `origin`; Phase 5 remains planned.
- Started Phase 5 with `docs/release-readiness-audit.md`, covering package metadata, npm package dry-run contents, release workflow readiness, Node support verification gaps, documentation state, and remaining public-launch gates; Phase 5 is in progress.
- Merged `phase5-release-readiness-audit` into `main` and deleted the merged branch locally and on `origin`; Phase 5 remains in progress.
- Added a maintainer release checklist to `docs/release.md`, CI verification for Node.js 20 and 24, and release workflow tarball install smoke before `npm publish`; Phase 5 remains in progress.
- Merged `phase5-maintainer-release-checklist` into `main` and deleted the merged branch locally and on `origin`; Phase 5 remains in progress.

Next-stage goal: Add GitHub issue templates and lightweight project health files.
