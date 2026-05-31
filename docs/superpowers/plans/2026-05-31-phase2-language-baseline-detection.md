# Phase 2 Language Baseline Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add conservative Python, Rust, Go, and Java baseline detection without inventing commands.

**Architecture:** Extend the existing detector with root-level ecosystem signals that append to `project.stacks` and `signals`. Keep command inference tied to existing JavaScript package scripts only, so non-JavaScript repositories get useful language facts while commands remain `null` unless already known. Treat Gradle as Java only when a build file explicitly applies the `java` or `java-library` plugin; settings files alone are not Java evidence.

**Tech Stack:** Node.js, TypeScript, Vitest.

---

### Task 1: Language Detection Tests

**Files:**
- Modify: `tests/detector.test.ts`
- Modify: `tests/pack.test.ts`

- [x] Add failing detector tests for Python markers: `pyproject.toml`, `requirements.txt`, and `setup.py`.
- [x] Add failing detector tests for Rust and Go markers: `Cargo.toml` and `go.mod`.
- [x] Add failing detector tests for Java markers: `pom.xml`, explicit Java Gradle plugins in `build.gradle`, and explicit Java Gradle plugins in `build.gradle.kts`.
- [x] Add a pack test proving non-JavaScript language stacks are written to `.repo-context/index.json` while commands remain uninvented.
- [x] Add follow-up coverage for independent Python marker files, Gradle settings non-detection, commented Gradle plugins, marker directories, and serialized Rust, Go, and Java signals.
- [x] Run `npm test -- tests/detector.test.ts tests/pack.test.ts` and confirm the new tests fail because language stacks are absent.

### Task 2: Implement Conservative Language Signals

**Files:**
- Modify: `src/detector.ts`

- [x] Add root-file checks for Python markers and append `python` once.
- [x] Add root-file checks for `Cargo.toml` and append `rust`.
- [x] Add root-file checks for `go.mod` and append `go`.
- [x] Add root-file checks for Maven and explicit Java Gradle plugin markers and append `java` once.
- [x] Require language marker paths to be files, not directories.
- [x] Ignore commented-out Gradle Java plugin declarations.
- [x] Add factual detection signals that cite the exact file source.
- [x] Keep `inferCommands` unchanged so no Python, Rust, Go, or Java commands are guessed.

### Task 3: Documentation and Roadmap

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Modify: `docs/superpowers/plans/2026-05-31-phase2-language-baseline-detection.md`

- [x] Update README to describe baseline language detection.
- [x] Mark the roadmap candidate task complete and record the activity log entry.
- [x] Set the next-stage goal after this task.
- [x] Check off completed plan items as implementation and verification progress.

### Task 4: Verification, Review, and Publish

**Files:**
- Modify: `docs/superpowers/plans/2026-05-31-phase2-language-baseline-detection.md`

- [x] Run `npm test`, `npm run lint`, CLI dry-run, `git diff --check`, and `npm pack --dry-run`.
- [x] Request `CodeReviewer-01` and `TestReviewer-01` because detector behavior and generated JSON shape are changing.
- [x] Fix Critical or Important review findings.
- [x] Commit and push the branch.
