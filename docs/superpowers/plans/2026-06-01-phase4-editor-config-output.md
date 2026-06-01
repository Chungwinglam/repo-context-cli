# Phase 4 Editor Config Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional static editor integration output for Cursor, VS Code, and generic AI-editor workflows.

**Architecture:** Extend `repo-context pack` with an opt-in `--editor-config` flag. Reuse the existing context model, renderers, and safe writer so editor files are generated only when requested and remain inside the selected output directory.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, existing renderer and writer modules, no new runtime dependency.

---

### Task 1: CLI and Pack Behavior Tests

**Files:**
- Modify: `tests/cli.test.ts`
- Modify: `tests/pack.test.ts`

- [x] **Step 1: Add CLI help and invalid MCP flag tests**

Add assertions that top-level help includes `--editor-config`, and that `repo-context mcp --editor-config` exits non-zero with `Unknown flag for mcp: --editor-config`.

- [x] **Step 2: Add dry-run editor output test**

In `tests/pack.test.ts`, create a temp package repo and call `createContextPackage` with `editorConfig: true` and `dryRun: true`.

Expected planned paths:

```text
.repo-context/editors/README.md
.repo-context/editors/cursor.md
.repo-context/editors/vscode.md
```

Expected filesystem state: none of those files exists after dry-run.

- [x] **Step 3: Add selected output directory test**

Call `createContextPackage` with `outputDir: ".ai-context"` and `editorConfig: true`.

Expected written paths:

```text
.ai-context/editors/README.md
.ai-context/editors/cursor.md
.ai-context/editors/vscode.md
```

Expected content: `.ai-context/editors/cursor.md` references `.ai-context/index.json` and does not reference `.repo-context/index.json`.

- [x] **Step 4: Add overwrite safety test**

Pre-create `.repo-context/editors/README.md` with user-authored content, then run `createContextPackage` with `editorConfig: true`, `dryRun: false`, and `force: false`.

Expected result: the README write is skipped with the existing user-authored-file reason.

- [x] **Step 5: Add generated refresh test**

Run `createContextPackage` twice with `editorConfig: true`, `dryRun: false`, and `force: false`.

Expected result: the second run returns `overwritten` for generated editor docs because they include the standard generated header.

- [x] **Step 6: Add conservative content test**

Assert generated editor docs include wording that editor settings are not modified automatically and do not claim `.vscode/settings.json` or `.cursor/rules` was generated.

- [x] **Step 7: Verify RED**

Run:

```bash
npm test -- tests/cli.test.ts tests/pack.test.ts
```

Expected: failures because `editorConfig`, `--editor-config`, and the editor renderer do not exist yet.

### Task 2: Editor Renderer

**Files:**
- Create: `src/renderers/editors.ts`
- Modify: `src/model.ts`
- Modify: `src/pack.ts`

- [x] **Step 1: Extend `PackOptions`**

Add an optional boolean property:

```ts
editorConfig?: boolean;
```

- [x] **Step 2: Create editor renderer functions**

Create `src/renderers/editors.ts` with functions that accept `RepositoryContext` plus the normalized output directory and return strings:

```ts
export interface EditorRenderOptions {
  outputDir: string;
}

export function renderEditorReadme(context: RepositoryContext, options: EditorRenderOptions): string
export function renderCursorGuide(context: RepositoryContext, options: EditorRenderOptions): string
export function renderVsCodeGuide(context: RepositoryContext, options: EditorRenderOptions): string
```

Each output must include the generated header, project name, target, context file list, refresh command, selected index path, and a conservative note that no editor settings are modified automatically.

- [x] **Step 3: Append editor files from pack**

In `buildGeneratedFiles`, when `editorConfig` is true, append:

```text
<output>/editors/README.md
<output>/editors/cursor.md
<output>/editors/vscode.md
```

Reuse normalized output directory handling.

Pass the same normalized output directory to the editor renderer so generated content references the correct index path.

- [x] **Step 4: Verify pack tests**

Run:

```bash
npm test -- tests/pack.test.ts
```

Expected: editor output tests pass.

### Task 3: CLI Flag and Documentation

**Files:**
- Modify: `src/cli.ts`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`

- [x] **Step 1: Parse `--editor-config` for pack**

Add the flag to pack parsing and pass `editorConfig: parsed.editorConfig` into `createContextPackage`.

Do not accept the flag for `mcp`.

- [x] **Step 2: Update CLI help**

Show:

```text
repo-context pack ... [--editor-config]
```

- [x] **Step 3: Document editor output**

Update README with:

```bash
npx repo-context-cli pack --editor-config
```

Describe the generated `.repo-context/editors/` files and make clear they are static guides, not automatic editor mutation.

- [x] **Step 4: Update changelog and roadmap**

Add an unreleased changelog bullet and mark the editor integration output task complete in `ROADMAP.md`.

Set next-stage goal to:

```text
Add GitHub Action for keeping context files updated.
```

- [x] **Step 5: Verify GREEN**

Run:

```bash
npm test -- tests/cli.test.ts tests/pack.test.ts
npm run lint
npm test
```

Expected: all commands pass.
