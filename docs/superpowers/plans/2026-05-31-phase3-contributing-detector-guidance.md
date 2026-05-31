# Phase 3 Contributing and Detector Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start Phase 3 by adding contributor documentation for local development, fixture style, and safe detector extensions.

**Architecture:** Add a root `CONTRIBUTING.md` that reflects the current TypeScript CLI, existing test style, and conservative detector boundaries. Update roadmap status and activity log so Phase 3 begins with an explicit next-stage goal.

**Tech Stack:** Markdown documentation, Node.js 24, npm, TypeScript, Vitest.

---

### Task 1: Contributing Guide

**Files:**
- Create: `CONTRIBUTING.md`
- Modify: `README.md`

- [x] Document the project principles for trustworthy repository context generation.
- [x] Document local setup and verification commands.
- [x] Document fixture style based on current `tests/*.test.ts` temp repositories and `examples/*`.
- [x] Document detector-extension steps for `src/detector.ts`, `src/model.ts`, renderer impact, and tests.
- [x] Document PR checklist and roadmap update expectations.
- [x] Add a README link to the contributing guide.

### Task 2: Roadmap Sync

**Files:**
- Modify: `ROADMAP.md`

- [x] Mark the Phase 3 contributing guide candidate task complete.
- [x] Move Phase 3 from planned to in progress.
- [x] Record the activity log entry.
- [x] Set the next-stage goal.

### Task 3: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-05-31-phase3-contributing-detector-guidance.md`

- [x] Run documentation-appropriate verification.
- [x] Request `DXReviewer-01` and `CodeReviewer-01` because this changes contributor workflow guidance.
- [x] Fix Critical or Important review findings.
- [ ] Commit and push the branch.
