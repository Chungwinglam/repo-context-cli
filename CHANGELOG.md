# Changelog

All notable changes to Repo Context CLI are recorded in this file.

This project follows a simple changelog format inspired by Keep a Changelog. The current package version is `0.1.0`; this entry remains unreleased until an npm release workflow or manual release publishes it.

## 0.1.0 - Unreleased

### Added

- Added the `repo-context pack` CLI for generating AI-agent context files from a local repository.
- Added agent target support for `codex`, `claude`, and `cursor`.
- Added output controls for target selection, output directory, maximum indexed files, dry-run mode, and force overwrite mode.
- Added generated `AGENTS.md`, `PROJECT_MAP.md`, `TESTING.md`, and `.repo-context/index.json` outputs.
- Added optional `--html-report` output for a static, no-JavaScript `.repo-context/report.html` summary.
- Added optional `--editor-config` output for static Cursor, VS Code, and generic AI-editor guide files.
- Added `--generated-at` for deterministic generated timestamps in CI drift checks.
- Added read-only `repo-context mcp` stdio server mode with a `get_repo_context` tool.
- Added conservative repository scanning with deterministic path ordering and common file-kind classification.
- Added root `.gitignore` parsing while preserving fixed noisy-directory ignores.
- Added package-manager detection for npm, pnpm, yarn, and bun, including lockfile conflict warnings.
- Added JavaScript and TypeScript command inference from package scripts.
- Added baseline monorepo detection for npm workspaces, `pnpm-workspace.yaml`, Turbo, Nx, and common `packages/*` / `apps/*` package roots.
- Added baseline Python, Rust, Go, and Java stack detection from root-level project signals.
- Added deterministic context size totals, indexed byte totals, largest indexed files, and rough token estimates.
- Added small example repositories for JavaScript and TypeScript usage.
- Added contributor guidance for local development, fixture style, detector extensions, and roadmap sync.
- Added GitHub issue templates for bug reports and feature requests.

### Safety

- Added output path containment checks so generated files stay inside the repository.
- Added overwrite protection so user-authored generated-target files are skipped unless `--force` is used.
- Added generated-file markers so the CLI can distinguish its own prior outputs from user-authored files.
- Added conservative behavior for unknown commands and directory purposes instead of inventing unsupported facts.
- Added a check-only GitHub context refresh workflow that uses a deterministic generated timestamp and does not use `--force`, commit changes, or push changes.

### CI

- Added GitHub Actions CI for build, lint, and test verification on Node.js 24.
- Added CI coverage for the documented Node.js 20 and Node.js 24 support range.
- Added npm tarball install smoke coverage that packs the package, installs it in a fresh npm project, and runs the installed CLI binary.
- Added a GitHub Actions context drift check for tracked generated context files on pull requests, default-branch pushes, weekly schedule, and manual dispatch.
- Added release workflow tarball install smoke before `npm publish`.

### Documentation

- Added README quickstart, safety defaults, command reference, detected-facts summary, scope notes, roadmap link, and contributing link.
- Added an adoption guide for introducing Repo Context CLI into existing repositories with `--dry-run`, generated-file review, and optional context drift checks.
- Added project roadmap tracking phase status, completed milestones, activity log entries, and next-stage goals.
- Added a release readiness audit covering package contents, workflows, docs, and public-launch gates.
- Added a maintainer release checklist covering npm publish, Node support policy, release smoke, and post-release verification.
- Added lightweight `SECURITY.md` and `SUPPORT.md` project health files.
- Recorded public repository release-gate status, npm package name recheck, and npm Trusted Publishing setup constraints.
- Added MIT license.
