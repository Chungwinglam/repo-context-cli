# Repo Context CLI Roadmap

This file is the source of truth for project phase status. Update it whenever a small task is completed.

## Current Status

- Current phase: Phase 2 in progress
- Last completed milestone: Phase 2 monorepo baseline detection
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

Status: In progress

Goal: Make the CLI more trustworthy on real-world repositories without losing the conservative MVP behavior.

Candidate tasks:

- Add `.gitignore` parsing while preserving fixed default ignores. (Complete)
- Add pnpm, yarn, bun, and package-manager conflict tests. (Complete)
- Add Python, Rust, Go, and Java basic detection.
- Add monorepo baseline detection for npm workspaces, pnpm workspaces, Turbo, Nx, and common `packages/*` / `apps/*` layouts. (Complete)
- Add token and size summary for generated context packages.
- Add npm package install smoke test in CI.

## Phase 3: Open Source Launch Quality

Status: Planned

Goal: Improve adoption readiness for a public launch.

Candidate tasks:

- Add demo terminal recording or GIF.
- Add `CONTRIBUTING.md` with fixture and detector-extension guidance.
- Add `CHANGELOG.md`.
- Add release workflow with npm provenance.
- Improve README examples with before/after AI-agent context.

## Phase 4: Advanced Integrations

Status: Planned

Goal: Add optional integrations only after the CLI remains stable.

Candidate tasks:

- HTML report output.
- Secret redaction.
- MCP server mode.
- Editor integrations.
- GitHub Action for keeping context files updated.

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

Next-stage goal: Add Python, Rust, Go, and Java basic detection.
