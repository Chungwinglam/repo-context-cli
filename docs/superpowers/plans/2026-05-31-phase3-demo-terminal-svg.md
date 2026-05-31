# Phase 3 Demo Terminal SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight terminal demo asset that improves README launch readiness without introducing binary tooling.

**Architecture:** Add a hand-authored `docs/demo.svg` that shows the main `repo-context` flow in a terminal-style frame. Link it from the README with a GitHub raw URL so the npm-rendered README does not depend on packaged relative assets. Update the roadmap to close Phase 3 and set the next-stage goal.

**Tech Stack:** Markdown documentation, SVG, Node.js 24, npm, TypeScript, Vitest.

---

### Task 1: Demo Asset

**Files:**
- Create: `docs/demo.svg`

- [x] Add a terminal-style SVG with accessible title and description.
- [x] Show `npx repo-context-cli pack --dry-run --for codex`.
- [x] Show planned generated files and a compact summary.
- [x] Keep the asset small, deterministic, and hand-editable.

### Task 2: README Demo Section

**Files:**
- Modify: `README.md`

- [x] Add a `Demo` section near the quickstart.
- [x] Embed `docs/demo.svg` through a GitHub raw URL.
- [x] Keep surrounding copy concise and consistent with current CLI behavior.

### Task 3: Roadmap Sync

**Files:**
- Modify: `ROADMAP.md`

- [x] Mark the Phase 3 demo candidate task complete.
- [x] Mark Phase 3 complete if all Phase 3 candidates are complete.
- [x] Record the activity log entry.
- [x] Set the next-stage goal.

### Task 4: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-05-31-phase3-demo-terminal-svg.md`

- [x] Run documentation and package verification.
- [x] Request `DXReviewer-01` and `CodeReviewer-01` because this changes README launch assets.
- [x] Fix Critical or Important review findings.
- [ ] Commit and push the branch.
