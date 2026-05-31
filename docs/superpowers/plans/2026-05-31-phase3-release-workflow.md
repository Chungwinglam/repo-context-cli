# Phase 3 Release Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions release workflow for npm trusted publishing with provenance-ready configuration.

**Architecture:** Add a dedicated release workflow triggered by published GitHub Releases. The workflow verifies the package, checks that the release tag matches `package.json`, and publishes through npm trusted publishing using OIDC instead of a long-lived npm token. Add release documentation that explains the npm-side trusted publisher setup and the current private-repository provenance limitation.

**Tech Stack:** GitHub Actions, Node.js 24, npm trusted publishing, Markdown documentation.

---

### Task 1: Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [x] Trigger on `release: published`.
- [x] Grant `contents: read` and `id-token: write` permissions.
- [x] Use Node.js 24 and the npm registry URL.
- [x] Run `npm ci`, `npm run build`, `npm run lint`, and `npm test`.
- [x] Check that the GitHub release tag matches `package.json` as `v<version>`.
- [x] Run `npm pack --dry-run`.
- [x] Run `npm publish` through npm trusted publishing without `NPM_TOKEN`.

### Task 2: Release Documentation

**Files:**
- Create: `docs/release.md`
- Modify: `README.md`

- [x] Document the release trigger and version/tag rule.
- [x] Document npm Trusted Publisher setup for `release.yml`.
- [x] Document why the workflow does not use `NPM_TOKEN`.
- [x] Document the private-repository provenance limitation.
- [x] Add a README link to release documentation.

### Task 3: Roadmap Sync

**Files:**
- Modify: `ROADMAP.md`

- [x] Mark the Phase 3 release workflow candidate task complete.
- [x] Record the activity log entry.
- [x] Set the next-stage goal.

### Task 4: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-05-31-phase3-release-workflow.md`

- [x] Run workflow syntax and package verification.
- [x] Request `CodeReviewer-01` and `DXReviewer-01` because this changes publishing automation.
- [x] Fix Critical or Important review findings.
- [ ] Commit and push the branch.
