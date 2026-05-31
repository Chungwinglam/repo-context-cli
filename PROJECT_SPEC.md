# Repo Context CLI Project Specification

Date: 2026-05-31
Status: Draft

## 1. Project Goal

Repo Context CLI is a command-line tool that scans a code repository and generates a compact, useful context package for AI coding agents such as Codex, Claude Code, and Cursor.

The first version should help a user answer four questions quickly:

- What is this project?
- Where are the important files and directories?
- How do I run, build, and test it?
- What rules should an AI coding agent follow before editing it?

The tool should not try to become a full AI agent. Its job is to prepare reliable project context.

## 2. Target Users

Primary users:

- Developers who use Codex, Claude Code, Cursor, or similar AI coding tools.
- Solo builders who frequently open unfamiliar repositories.
- Maintainers who want a standard project briefing file for AI contributors.

Early adopters are likely to be developers already using AI tools in terminal-based workflows.

## 3. Problem Statement

AI coding tools often fail or waste time because they receive weak project context. Users repeatedly paste repository structure, explain test commands, describe coding rules, and warn the agent not to edit generated files.

Repo Context CLI solves this by generating standard context files from the repository itself.

## 4. MVP Scope

The MVP is a pure CLI tool.

It should:

- Run inside any local repository directory.
- Scan common project files and directory structure.
- Detect basic project type signals.
- Generate Markdown files for humans and AI agents.
- Generate a machine-readable JSON index.
- Support output templates for Codex, Claude, and Cursor.

The MVP should not:

- Include a Web UI.
- Include an MCP server.
- Call any LLM API.
- Modify business source code.
- Infer deep architecture with unreliable guesses.
- Require a remote service or account.

## 5. CLI Commands

### 5.1 Main Command

```bash
repo-context pack
```

Scans the current directory and writes the default context package.

### 5.2 Target-Specific Templates

```bash
repo-context pack --for codex
repo-context pack --for claude
repo-context pack --for cursor
```

The `--for` flag controls the agent-specific guidance in generated files.

Supported MVP values:

- `codex`
- `claude`
- `cursor`

Default value:

- `codex`

### 5.3 Optional Flags

```bash
repo-context pack --output .repo-context
repo-context pack --max-files 500
repo-context pack --dry-run
```

MVP behavior:

- `--output` controls where machine-readable files are written.
- `--max-files` limits indexed files to keep output predictable.
- `--dry-run` prints what would be generated without writing files.

## 6. Generated Output

Default output:

```text
AGENTS.md
PROJECT_MAP.md
TESTING.md
.repo-context/
  index.json
```

### 6.1 AGENTS.md

Purpose:

- Give AI coding agents project-specific operating rules.

Content:

- Project summary.
- Detected stack.
- Important directories.
- Editing rules.
- Files and directories to avoid.
- Verification expectations.

Example topics:

- Do not edit generated files.
- Prefer existing patterns.
- Run relevant tests before claiming completion.
- Keep changes scoped.

### 6.2 PROJECT_MAP.md

Purpose:

- Explain the repository layout.

Content:

- Root-level directory tree.
- Important config files.
- Source directories.
- Test directories.
- Documentation directories.
- Build output directories excluded from analysis.

The MVP should stay factual. If a directory purpose is not obvious, the generated text should say that it was detected but not classified.

### 6.3 TESTING.md

Purpose:

- Collect likely development commands in one place.

Content:

- Install command.
- Development command.
- Build command.
- Test command.
- Lint or format command if detected.
- Notes about uncertainty.

Commands should be inferred from files such as:

- `package.json`
- `pyproject.toml`
- `Cargo.toml`
- `go.mod`
- `Makefile`

If no command is detected, the file should say so clearly instead of inventing one.

### 6.4 .repo-context/index.json

Purpose:

- Provide a machine-readable repository index for future features.

Initial schema:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-05-31T00:00:00.000Z",
  "root": "absolute-or-relative-project-root",
  "target": "codex",
  "project": {
    "name": "detected-project-name",
    "packageManager": "npm",
    "stacks": ["node", "typescript"]
  },
  "commands": {
    "install": "npm install",
    "dev": "npm run dev",
    "build": "npm run build",
    "test": "npm test"
  },
  "files": [
    {
      "path": "src/index.ts",
      "kind": "source",
      "sizeBytes": 1234
    }
  ],
  "excluded": [
    "node_modules",
    ".git",
    "dist"
  ]
}
```

## 7. Project Detection Rules

The MVP should detect common ecosystem signals:

| Signal file | Stack |
| --- | --- |
| `package.json` | Node.js / JavaScript / TypeScript |
| `tsconfig.json` | TypeScript |
| `pyproject.toml` | Python |
| `requirements.txt` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` | Java / Maven |
| `build.gradle` | Java / Gradle |
| `Makefile` | Make-based workflow |

Detection should be additive. A repository can have multiple stacks.

## 8. Default Ignore Rules

The scanner should ignore noisy or generated directories by default:

```text
.git
node_modules
dist
build
coverage
.next
.nuxt
.turbo
.venv
venv
__pycache__
target
vendor
```

Future versions can support `.gitignore` parsing. The MVP can start with a fixed ignore list.

## 9. Architecture

Recommended implementation language:

- TypeScript running on Node.js.

Reason:

- Natural `npx` distribution.
- Good filesystem tooling.
- Familiar to many open-source contributors.
- Easy to publish as an npm package.

Core modules:

- `cli`: parses command flags and displays output.
- `scanner`: walks the repository and applies ignore rules.
- `detector`: identifies stack, package manager, and likely commands.
- `model`: defines the normalized project context object.
- `renderers`: generates Markdown and JSON outputs.
- `templates`: stores agent-specific wording for Codex, Claude, and Cursor.
- `writer`: writes files and handles dry-run behavior.

## 10. Data Flow

```text
CLI flags
  -> scanner reads repository files
  -> detector extracts project signals
  -> normalized context model is created
  -> renderers create Markdown and JSON
  -> writer saves generated files
```

The scanner and detector should not write files. Renderers should not read from disk. This keeps the code easier to test.

## 11. Error Handling

Expected behavior:

- If run outside a recognizable project, still generate a basic directory map.
- If output files already exist, the MVP may overwrite generated context files after printing a clear warning and the list of files that will be written.
- If permissions prevent reading some files, skip them and report a warning.
- If the repository is too large, respect `--max-files` and report that the index was truncated.

MVP simplification:

- A stricter `--force` workflow can be added after the first release.
- Generated files should include a header saying they were generated by Repo Context CLI.

## 12. Testing Strategy

Unit tests:

- Project detection from fixture directories.
- Command inference from `package.json`, `pyproject.toml`, `Cargo.toml`, and `go.mod`.
- Ignore rule behavior.
- Markdown renderer output.
- JSON schema shape.

Integration tests:

- Run `repo-context pack` against small fixture repositories.
- Verify generated file names.
- Verify generated content contains expected sections.
- Verify `--dry-run` does not write files.

Manual smoke test:

```bash
repo-context pack --for codex
```

Expected result:

- `AGENTS.md` exists.
- `PROJECT_MAP.md` exists.
- `TESTING.md` exists.
- `.repo-context/index.json` exists.
- CLI prints a short success summary.

## 13. First Implementation Milestone

Milestone 1 should deliver:

- npm-ready TypeScript CLI project.
- `repo-context pack` command.
- Fixed ignore list.
- Node/TypeScript project detection.
- Basic Markdown generation.
- Basic JSON index generation.
- Unit tests for scanner, detector, and renderers.

This milestone should be useful on JavaScript and TypeScript repositories first.

## 14. Later Roadmap

Phase 2:

- Python, Rust, Go, Java command detection.
- `.gitignore` support.
- Safer overwrite behavior.
- Better monorepo detection.

Phase 3:

- HTML report output.
- Token budget estimates.
- Secret redaction.
- Better project summaries.

Phase 4:

- MCP server mode.
- Editor integrations.
- GitHub Action for keeping context files updated.

## 15. Open Decisions

Resolved for MVP:

- First version is CLI-only.
- TypeScript + Node.js is the recommended implementation.
- No LLM API calls in the MVP.
- Default target template is Codex.

Decisions to revisit later:

- Final package name.
- Whether generated Markdown files should live at repo root or under `.repo-context`.
- Whether overwrite should require `--force` from the first version.
- Whether to parse `.gitignore` in MVP or Phase 2.
