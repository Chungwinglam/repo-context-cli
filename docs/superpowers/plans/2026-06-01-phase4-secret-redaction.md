# Phase 4 Secret Redaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conservative secret redaction so generated context packages do not expose obvious secret-like paths or command values.

**Architecture:** Add a focused `src/redaction.ts` module for secret-like path detection and command-value masking. Integrate it at the scanner boundary for paths and the pack boundary for detected commands, then expose aggregate redaction counts in markdown and JSON without listing redacted file names.

**Tech Stack:** TypeScript, Node.js 24, Vitest, Markdown documentation.

---

### Task 1: Redaction Model and Failing Tests

**Files:**
- Modify: `src/model.ts`
- Modify: `tests/scanner.test.ts`
- Modify: `tests/pack.test.ts`

- [x] Add `RedactionSummary` to the model with `secretLikePaths` and `commandValues` numeric counts.
- [x] Add scanner coverage proving `.env`, `.env.local`, `.npmrc`, and `.ssh/` are excluded without listing the sensitive paths in `files` or `excluded`.
- [x] Add redaction-module coverage proving command values such as `API_KEY=abc vite build` and credentialed URLs are redacted before they can reach `context.commands`.
- [x] Run the targeted tests and verify they fail because the redaction model and module do not exist yet.

### Task 2: Redaction Module

**Files:**
- Create: `src/redaction.ts`
- Modify: `src/scanner.ts`
- Modify: `src/pack.ts`

- [x] Implement `isSecretLikePath(path)` with conservative filename and directory patterns.
- [x] Implement `redactProjectCommands(commands)` so sensitive environment assignments and URL credentials become `<redacted>`.
- [x] Wire path exclusion into `scanRepository`.
- [x] Wire command redaction and aggregate warnings into `createContextPackage`.
- [x] Run the targeted tests and verify they pass.

### Task 3: Renderer and Documentation Surface

**Files:**
- Modify: `src/renderers/markdown.ts`
- Modify: `README.md`

- [x] Add a `Redactions` section to `PROJECT_MAP.md` with aggregate counts only.
- [x] Document secret-like path exclusion and command-value redaction in README safety defaults.
- [x] Run renderer/package tests and verify markdown and JSON surfaces stay deterministic.

### Task 4: Roadmap Sync

**Files:**
- Modify: `ROADMAP.md`
- Modify: `docs/superpowers/plans/2026-06-01-phase4-secret-redaction.md`

- [x] Mark Phase 4 as in progress.
- [x] Mark the secret redaction candidate task complete.
- [x] Add an activity log entry for the completed task.
- [x] Set `Next-stage goal: Add HTML report output.`

### Task 5: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-06-01-phase4-secret-redaction.md`

- [x] Run `npm run lint`.
- [x] Run `npm test`.
- [x] Run CLI dry-run smoke.
- [x] Run `git diff --check`.
- [x] Run `npm pack --dry-run`.
- [x] Request `CodeReviewer-01` and `SecurityReviewer-01` because this changes trust-boundary behavior.
- [x] Fix Critical or Important review findings.
- [x] Commit and push the branch.
