# Comparison Guide

Use this guide to decide when Repo Context CLI is useful versus lighter ad hoc ways of giving an AI coding agent repository context.

Repo Context CLI is not a replacement for reading source code, reviewing diffs, or understanding product requirements. It is a deterministic way to package repository facts so AI-agent sessions can start from the same baseline instead of repeated, stale, or guessed context.

## Quick Decision

Use Repo Context CLI when:

- Multiple AI-agent sessions need the same project facts.
- The repository has real setup, test, lint, or package-manager details that are easy to forget.
- Maintainers want generated context files that reviewers can inspect in a pull request.
- The team wants safe defaults: No LLM calls, no source edits, and safe generated-file overwrite behavior.
- The repository will benefit from refreshable context after scripts, packages, or workspace layout change.

Manual context is usually enough when:

- You are asking one short question about one file.
- The repository is tiny and has no reusable setup or testing conventions.
- You are working in a private spike and do not want to add generated files yet.
- The useful context is mostly product intent, design judgment, or business rules not discoverable from repository files.

Start with a dry run before deciding:

```bash
npx repo-context-cli pack --dry-run --for codex
```

## Manual prompt pasting

Manual prompt pasting is the fastest way to give an agent context for a single conversation. It works well when the context is small, subjective, or temporary.

Trade-offs:

- It is easy to omit commands, package-manager details, generated-file rules, or safety constraints.
- The next session cannot verify what was pasted before.
- Different agents or teammates may receive different versions of the same project facts.
- Stale pasted notes can survive after the repository changes.

Repo Context CLI is useful when the same facts should be generated from the repository, committed, refreshed, and reviewed instead of rewritten by hand.

## README-only onboarding

A strong README is still valuable. It explains the product, human workflow, support boundaries, and project intent better than generated context can.

Trade-offs:

- READMEs often focus on human users, not AI-agent operating rules.
- They may not list every relevant script, generated file target, monorepo signal, or context-size detail.
- They are hand-authored and can drift from package metadata, lockfiles, or workflow changes.

Repo Context CLI is useful alongside a README when an agent needs deterministic project facts, command candidates, generated context files, and a machine-readable `.repo-context/index.json`.

Do not use Repo Context CLI as a replacement for reading source code, maintaining a clear README, or making architectural decisions.

## Ad hoc directory-tree dumps

Directory-tree dumps are useful for quickly showing broad shape, especially before a repository has any context tooling.

Trade-offs:

- They can expose noisy or sensitive paths if copied casually.
- They show names but not reliable command detection, overwrite safety, redaction counts, or generated context summaries.
- They do not explain which files are generated, which commands are detected, or which facts are unknown.
- They are hard to refresh consistently across sessions.

Repo Context CLI is useful when a directory map needs to be paired with conservative detection, built-in ignores, `.gitignore` handling, redaction, and generated files that can be reviewed in Git.

## Where Repo Context CLI fits

Repo Context CLI works best as a baseline context layer:

1. Run `pack --dry-run` to inspect planned context output.
2. Generate context files only after the dry run looks reasonable.
3. Keep human-authored project intent in README, issue descriptions, design docs, and review comments.
4. Refresh generated context when scripts, package layout, language signals, or agent rules change.

It does not claim to improve model reasoning by itself. The value is narrower and more testable: consistent repository facts, safer first-session context, reviewable generated files, and fewer repeated setup explanations.

## Safe first comparison

To compare Repo Context CLI against your current prompt-pasting workflow:

```bash
npx repo-context-cli pack --dry-run --for codex
```

Then check:

- Would `AGENTS.md` capture rules you usually paste?
- Would `PROJECT_MAP.md` show useful project facts without exposing sensitive paths?
- Would `TESTING.md` make verification commands easier to repeat?
- Would reviewers be comfortable committing the generated files?

If the answer is no, keep using manual context for that repository. If the answer is yes, follow the adoption guide and generate the files on a small reviewable branch.
