# Phase 2 Npm Install Smoke CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CI smoke test proving the packed npm tarball can be installed in a fresh project and run the CLI.

**Architecture:** Extend the existing GitHub Actions workflow with a separate `package-smoke` job. The job builds the package, creates a tarball with `npm pack`, installs that tarball in a temporary npm project, and runs the installed `repo-context` binary directly with `pack --dry-run --for codex`.

**Tech Stack:** GitHub Actions, Node.js 24, npm.

---

### Task 1: CI Workflow Update

**Files:**
- Modify: `.github/workflows/ci.yml`

- [x] Add a separate `package-smoke` job.
- [x] Use `actions/checkout@v4` and `actions/setup-node@v4` with Node 24 and npm cache.
- [x] Run `npm ci` and `npm run build` before packing.
- [x] Run `npm pack --pack-destination ./artifacts`.
- [x] Create a fresh temp project outside the repository package root.
- [x] Install the generated tarball into the temp project.
- [x] Run the installed `repo-context` binary directly with `pack --dry-run --for codex` from the temp project.

### Task 2: Documentation and Roadmap

**Files:**
- Modify: `ROADMAP.md`
- Modify: `docs/superpowers/plans/2026-05-31-phase2-npm-install-smoke-ci.md`

- [x] Mark the CI smoke test candidate task complete.
- [x] Record the activity log entry.
- [x] Decide the next-stage goal after this task.
- [x] Check off completed plan items.

### Task 3: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-05-31-phase2-npm-install-smoke-ci.md`

- [x] Run `npm test`, `npm run lint`, local npm tarball install smoke, `git diff --check`, and `npm pack --dry-run`.
- [x] Request `CodeReviewer-01` and `TestReviewer-01` because CI release confidence is changing.
- [x] Fix Critical or Important review findings.
- [ ] Commit and push the branch.
