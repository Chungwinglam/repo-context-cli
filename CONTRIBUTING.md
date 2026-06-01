# Contributing to Repo Context CLI

Repo Context CLI is built to generate trustworthy repository context for AI coding agents without calling an LLM or editing business source code. Contributions should preserve that trust boundary.

## Project Principles

- Prefer conservative facts over clever guesses.
- Report unknown commands, stacks, and directory purposes as unknown instead of inventing them.
- Keep generated output deterministic so changes are easy to review.
- Preserve implemented safe-write guarantees: no path escape and no silent overwrite of user-authored files. Treat dependency and build-output folders as out of scope unless a task explicitly adds tested protection.
- Keep each change scoped to the current roadmap task in `ROADMAP.md`.

## Local Development

Requirements:

- Node.js 20 or newer.
- npm. CI currently verifies with Node.js 24.

Install and verify:

```bash
npm ci
npm run build
npm run lint
npm test
```

Package smoke checks are useful when changing `package.json`, `bin`, build output, CI packaging, or generated file paths. This snippet is written for Bash, Git Bash, WSL, or CI shells:

```bash
npm run build
pack_dir="$(mktemp -d)"
npm pack --pack-destination "$pack_dir"

smoke_dir="$(mktemp -d)"
cd "$smoke_dir"
npm init -y
npm install "$pack_dir"/repo-context-cli-*.tgz
./node_modules/.bin/repo-context pack --dry-run --for codex
```

On Windows PowerShell, use `npm.cmd` for npm commands, or run the smoke snippet through Git Bash or WSL.

## Repository Map

- `src/cli.ts`: CLI argument parsing and command dispatch.
- `src/pack.ts`: context package orchestration.
- `src/detector.ts`: conservative project, package-manager, language, and monorepo detection.
- `src/scanner.ts`: deterministic file indexing and `.gitignore` handling.
- `src/summary.ts`: deterministic size and rough token summaries for generated context packages.
- `src/writer.ts`: generated-file write safety and overwrite behavior.
- `src/renderers/markdown.ts`: generated `AGENTS.md`, `PROJECT_MAP.md`, and `TESTING.md` content.
- `src/renderers/json.ts`: generated `.repo-context/index.json` content.
- `tests/*.test.ts`: Vitest coverage using temporary repositories.
- `examples/*`: small user-facing sample repositories.

## Fixture Guidance

Prefer focused temporary repositories in tests over large static fixtures. The current test style creates a fresh temp directory with `mkdtemp(join(tmpdir(), "..."))`, writes only the files needed for the behavior under test, and calls the real scanner, detector, or pack API.

Use this style when adding detector or scanner coverage:

```ts
const root = await mkdtemp(join(tmpdir(), "repo-context-detector-"));
await writeFile(join(root, "package.json"), JSON.stringify({ name: "sample" }), "utf8");

const result = await detectProject(root);

expect(result.project.name).toBe("sample");
```

Add or update `examples/*` only when the repository shape is useful to users outside the test suite. Keep examples small, readable, and free of generated dependency folders such as `node_modules`, `dist`, or `.repo-context`.

Static fixtures are appropriate only when multiple tests need the same larger repository shape. If you add one, keep it minimal, give it a descriptive lowercase hyphenated name, and avoid files that require network access or package-manager installs.

## Detector Extension Guidance

Detector changes should start with a failing test in `tests/detector.test.ts`. Use a temp repository that contains the smallest root-level signal needed to prove the behavior.

When adding a new detection signal:

1. Add or update the test first.
2. Keep the signal based on concrete files or fields, such as `package.json`, lockfiles, root config files, or explicit tool configuration.
3. Update `src/detector.ts` with the smallest change that satisfies the test.
4. If the context schema needs new fields, update `src/model.ts`, `src/renderers/json.ts`, markdown rendering where relevant, and pack tests that read `index.json`.
5. Add warnings for ambiguous or conflicting signals instead of silently choosing a risky interpretation.
6. Update README or roadmap text when user-visible detected facts change.

Command inference should remain narrow. JavaScript package scripts may map to package-manager commands. Non-JavaScript stacks currently detect project facts only and should not infer build, test, or install commands unless that behavior is explicitly added with tests and documentation.

Monorepo detection should remain baseline-oriented. It can report concrete tools, workspace globs, and shallow package roots, but it should not infer dependency graphs, task pipelines, or package ownership from partial evidence.

## Pull Request Checklist

Before opening or merging a contribution:

- Keep the change scoped to one roadmap-sized task.
- Add or update tests before behavior changes when practical.
- Run `npm run build`, `npm run lint`, and `npm test` for code changes.
- Run the package smoke check for packaging or CLI entrypoint changes.
- Update `README.md` when user-facing behavior changes.
- Update `ROADMAP.md` when a small task is completed, including the next-stage goal.
- Do not commit generated context output unless the task explicitly asks for it.

## Issues, Support, and Security

Use `.github/ISSUE_TEMPLATE/bug_report.yml` for reproducible bugs and `.github/ISSUE_TEMPLATE/feature_request.yml` for focused feature requests. Keep reports small, factual, and free of secrets or private source snippets.

See `SUPPORT.md` for support boundaries. See `SECURITY.md` for vulnerability reporting; suspected vulnerabilities should not be opened as public issues.

## Roadmap Sync

`ROADMAP.md` is the project source of truth for phase status. Every completed small task must record what changed, whether the current phase status changed, and the next-stage goal.

Final task reports should include a short `Next stage goal` line so the next contribution starts from a clear target.
