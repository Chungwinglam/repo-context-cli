# Phase 2 Gitignore and Package Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start Phase 2 by making repository scanning respect `.gitignore` and making package-manager detection safer on real-world JavaScript and TypeScript repositories.

**Architecture:** Keep the existing scanner/detector split. The scanner loads a root `.gitignore` matcher in addition to fixed default ignores, while the detector reports package-manager conflicts through warnings without changing renderer responsibilities.

**Tech Stack:** Node.js, TypeScript, Vitest, `ignore` package for Git ignore pattern semantics.

---

### Task 1: Add Gitignore Parsing Tests

**Files:**
- Modify: `tests/scanner.test.ts`

- [x] Add a failing test proving `.gitignore` excludes ignored files and directories while preserving fixed default ignores.
- [x] Run `npm test -- tests/scanner.test.ts` and verify the new test fails before implementation.

### Task 2: Implement Gitignore Parsing

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/scanner.ts`

- [x] Install the `ignore` package.
- [x] Load root `.gitignore` once in `scanRepository`.
- [x] Apply `.gitignore` matches to relative paths for files and directories.
- [x] Keep fixed default ignored directories active.
- [x] Run `npm test -- tests/scanner.test.ts` and verify the scanner tests pass.

### Task 3: Add Package Manager Hardening Tests

**Files:**
- Modify: `tests/detector.test.ts`

- [x] Add failing tests for pnpm/yarn/bun command inference.
- [x] Add a failing test for declared package manager versus lockfile conflict warnings.
- [x] Add a failing test for multiple lockfile warnings.
- [x] Run `npm test -- tests/detector.test.ts` and verify the new tests fail before implementation.

### Task 4: Implement Package Manager Hardening

**Files:**
- Modify: `src/detector.ts`

- [x] Detect all present lockfile package managers.
- [x] Prefer `package.json.packageManager` when present.
- [x] Warn when declared package manager conflicts with lockfiles.
- [x] Warn when multiple package-manager lockfiles are present.
- [x] Keep command output conservative and deterministic.
- [x] Run `npm test -- tests/detector.test.ts` and verify detector tests pass.

### Task 5: Roadmap and Verification

**Files:**
- Modify: `ROADMAP.md`
- Modify: `README.md` if user-facing behavior changed.

- [x] Update Phase 2 status and activity log in `ROADMAP.md`.
- [x] State the next-stage goal after this task.
- [x] Run `npm test`, `npm run lint`, CLI dry-run, and `npm pack --dry-run`.
- [x] Request `CodeReviewer-01` and `TestReviewer-01` if changes touch trust boundaries.
- [ ] Commit and push the branch.
