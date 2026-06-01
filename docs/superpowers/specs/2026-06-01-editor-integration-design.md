# Editor Integration Planning Design

Date: 2026-06-01
Status: Approved for implementation planning

## Goal

Add a low-risk editor integration path that helps developers connect Repo Context CLI output to AI-aware editors without turning this project into an editor extension first.

The first implementation should make editor usage more obvious and repeatable while preserving the core CLI contract: deterministic local context generation, no LLM calls, no remote account, and no default behavior changes.

## Problem

Repo Context CLI already creates useful context files and exposes a read-only MCP server. The missing step is an editor-facing handoff:

- Cursor and VS Code users need a clear way to point their editor workflow at generated context.
- Maintainers should be able to commit a small generated editor guide instead of writing setup notes by hand.
- Future editor extensions need a stable generated artifact to build on.

Directly building a VS Code or Cursor extension now would add packaging, marketplace, and maintenance overhead before the integration shape is proven.

## Recommended Approach

Start with optional static editor integration output from `repo-context pack`.

Add a new flag:

```bash
repo-context pack --editor-config
```

When enabled, the CLI writes editor integration files under the selected output directory:

```text
.repo-context/
  editors/
    README.md
    cursor.md
    vscode.md
```

If `--output .ai-context` is used, the editor files are written to:

```text
.ai-context/
  editors/
    README.md
    cursor.md
    vscode.md
```

Default `repo-context pack` output remains unchanged.

## Output Semantics

`README.md` should describe the editor integration package in editor-neutral terms:

- Which context files were generated.
- The actual configured output directory for machine-readable files.
- How an editor or AI assistant should consume them.
- How to refresh the package.
- What is intentionally not automated.

`cursor.md` should focus on Cursor-friendly usage:

- Refer to `AGENTS.md`, `PROJECT_MAP.md`, `TESTING.md`, and the actual generated index path, such as `.repo-context/index.json` or `.ai-context/index.json`.
- Suggest using the generated files as project context.
- Mention the optional `repo-context mcp` server as a read-only live context source.
- Avoid claiming automatic Cursor configuration unless the CLI actually writes one.

`vscode.md` should focus on VS Code and extension-neutral workflows:

- Explain how to keep generated context files in the workspace.
- Suggest using them with AI extensions that can read workspace files or MCP servers.
- Mention the optional MCP server command.
- Avoid naming unsupported extension-specific settings as if they are configured.

## Safety Requirements

- The feature must be opt-in.
- It must not create `.vscode/settings.json`, `.cursor/rules`, or any editor-owned file in the first slice.
- It must not overwrite user-authored editor files.
- It must reuse the existing generated-file writer, dry-run, force, and path containment behavior.
- It must respect `--output`.
- It must keep all generated content factual and conservative.
- It must not infer installed editors, extensions, or user preferences.

## Non-Goals

- No VS Code extension package.
- No Cursor extension package.
- No automatic editor settings mutation.
- No marketplace publishing.
- No background daemon.
- No LLM API calls.
- No new npm dependency.

## Architecture

Add a boolean `editorConfig` option to the existing pack flow.

The renderer layer should get a focused editor renderer, for example:

```text
src/renderers/editors.ts
```

The editor renderer must receive the normalized output directory or an explicit generated-path list so it does not hard-code `.repo-context/index.json` when the user selected another output directory.

`createContextPackage` should append editor files to the existing generated file list only when `editorConfig` is true. The writer should remain the only module that touches disk.

The CLI should parse `--editor-config` for `pack`, reject it for `mcp`, and show it in help text.

## Data Flow

```text
repo-context pack --editor-config
  -> scanner and detector build RepositoryContext
  -> markdown/json/html renderers build existing files
  -> editor renderer builds optional editor docs
  -> writer plans or writes all generated files safely
```

## Testing Strategy

Add tests before implementation:

- CLI help lists `--editor-config`.
- `pack --dry-run --editor-config` plans editor files without writing them.
- `pack --output .ai-context --editor-config` writes editor files under `.ai-context/editors/`.
- Existing user-authored editor output is skipped unless `--force` is passed.
- Generated editor guides include the standard generated header so a second run refreshes them with `overwritten` status.
- `mcp --editor-config` is rejected as an invalid MCP flag.
- Renderer output does not claim unsupported automatic editor setup.
- Renderer output references the selected output directory when `--output` is not `.repo-context`.

Run:

```bash
npm test -- tests/cli.test.ts tests/pack.test.ts
npm run lint
npm test
```

## Rollout

This should be a small Phase 4 task after the planning spec:

1. Add the flag and pack option.
2. Add editor renderer output.
3. Add tests for dry-run, output directory, overwrite safety, and CLI validation.
4. Update README, CHANGELOG, and ROADMAP.

## Open Decision

The first editor integration should be documentation-style generated output only. Real editor-specific files can be revisited after users validate the shape.
