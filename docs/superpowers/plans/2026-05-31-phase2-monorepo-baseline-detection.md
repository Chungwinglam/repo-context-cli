# Phase 2 Monorepo Baseline Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conservative monorepo baseline detection for npm workspaces, pnpm workspaces, Turbo, Nx, and common `packages/*` / `apps/*` layouts.

**Architecture:** Extend the existing detector and model with factual monorepo metadata. The detector reads root-level workspace signals and shallow package roots only; renderers summarize detected facts without inferring package graphs, dependency relationships, or workspace-specific commands.

**Tech Stack:** Node.js, TypeScript, Vitest.

---

### Task 1: Monorepo Model and Detector Tests

**Files:**
- Modify: `tests/detector.test.ts`
- Modify: `tests/pack.test.ts`

- [x] Add failing detector tests for npm workspaces with Turbo and package roots.
- [x] Add failing detector tests for pnpm workspace YAML with Nx.
- [x] Add detector coverage for npm workspaces object form plus standalone Turbo and Nx configuration.
- [x] Add failing detector tests for layout-only `packages/*` and `apps/*` package roots.
- [x] Add a pack test proving `.repo-context/index.json` includes `project.monorepo`.
- [x] Run `npm test -- tests/detector.test.ts tests/pack.test.ts` and confirm tests fail because monorepo fields are absent.

### Task 2: Implement Baseline Detection

**Files:**
- Modify: `src/model.ts`
- Modify: `src/detector.ts`

- [x] Add `MonorepoInfo` to `ProjectInfo`.
- [x] Detect `package.json.workspaces` array and object form.
- [x] Detect `pnpm-workspace.yaml` root package globs with a small parser for `packages:`.
- [x] Detect `turbo.json` and `nx.json` as tools.
- [x] Detect package roots under `packages/*/package.json` and `apps/*/package.json`.
- [x] Keep package roots relative and sorted.
- [x] Add factual detection signals and warnings only when needed.

### Task 3: Render Monorepo Summary

**Files:**
- Modify: `src/renderers/markdown.ts`

- [x] Add a short monorepo summary to `AGENTS.md`.
- [x] Add monorepo facts to `PROJECT_MAP.md`.
- [x] Keep command rendering unchanged; do not invent workspace-specific commands.

### Task 4: Roadmap and Verification

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `docs/superpowers/plans/2026-05-31-phase2-monorepo-baseline-detection.md`

- [x] Update README to mention baseline monorepo detection after implementation.
- [x] Update ROADMAP activity log and next-stage goal.
- [x] Run `npm test`, `npm run lint`, CLI dry-run, and `npm pack --dry-run`.
- [x] Request `CodeReviewer-01` and `TestReviewer-01` because this changes generated context shape.
- [x] Fix Critical or Important review findings.
- [ ] Commit and push the branch.
