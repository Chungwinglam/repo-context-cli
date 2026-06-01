# Phase 4 MCP Server Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only stdio MCP server mode with one `get_repo_context` tool backed by existing dry-run context generation.

**Architecture:** `repo-context mcp` starts a stdio JSON-RPC loop that speaks the minimal MCP lifecycle and tools methods. The MCP tool delegates to `createContextPackage` with `dryRun: true` and `force: false`, so it reuses scanning, detection, redaction, and summary logic without writing generated files.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, no new runtime dependency for this first stdio-only slice.

---

### Task 1: CLI and Protocol Tests

**Files:**
- Modify: `tests/cli.test.ts`
- Create: `tests/mcp.test.ts`

- [x] **Step 1: Write failing CLI tests**

Add tests that run `dist/cli.js mcp --help`, reject unknown `mcp` flags, and show `mcp` in top-level help.

- [x] **Step 2: Write failing stdio tests**

Spawn `dist/cli.js mcp`, send newline-delimited JSON-RPC requests for `initialize`, `tools/list`, and `tools/call`, and assert each stdout line parses as JSON.

- [x] **Step 3: Verify RED**

Run: `npm test -- tests/cli.test.ts tests/mcp.test.ts`

Expected: failures because `mcp` is not a supported command yet.

### Task 2: Minimal MCP Server

**Files:**
- Create: `src/mcp.ts`
- Modify: `src/cli.ts`
- Modify: `src/model.ts` only if shared types are required

- [x] **Step 1: Implement stdio JSON-RPC loop**

Add `runMcpServer({ root, maxFiles })` that reads `stdin` lines, writes only JSON-RPC messages to `stdout`, and writes diagnostics only to `stderr`.

- [x] **Step 2: Implement methods**

Support `initialize`, `notifications/initialized`, `tools/list`, and `tools/call` for `get_repo_context`. Unknown methods and malformed JSON return JSON-RPC errors when an id exists.

- [x] **Step 3: Keep tool read-only**

Call `createContextPackage` with `dryRun: true`, `force: false`, `outputDir: ".repo-context"`, `htmlReport: false`, and caller-provided `target` / `maxFiles`.

- [x] **Step 4: Verify GREEN**

Run: `npm test -- tests/cli.test.ts tests/mcp.test.ts`

Expected: new MCP and CLI tests pass.

### Task 3: Documentation and Roadmap

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

- [x] **Step 1: Document `repo-context mcp`**

Describe stdio-only, read-only behavior, `get_repo_context`, and the fact that it does not write generated files.

- [x] **Step 2: Update roadmap**

Mark MCP server mode complete, keep Phase 4 in progress, and set the next-stage goal.

- [x] **Step 3: Verify all**

Run: `npm run lint` and `npm test`.

Expected: lint succeeds and all tests pass.
