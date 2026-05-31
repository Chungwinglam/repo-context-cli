# Repo Context CLI Agent Rules

This file is hand-written project guidance for AI coding agents working in this repository. It is not generated output.

## Project Goal

Build Repo Context CLI into a trustworthy open-source developer tool that can grow beyond the MVP toward broad AI coding workflow adoption.

## Required Workflow Rules

- Keep implementation scoped to the current task and the roadmap stage in `ROADMAP.md`.
- Before editing code, inspect the relevant source, tests, and docs.
- For behavior changes, add or update tests first when practical, then make the implementation pass.
- Do not invent repository capabilities that are not implemented or documented.
- Preserve safe CLI behavior: no path escape, no silent overwrite of user-authored files, no unreliable architecture guesses.
- Run the smallest meaningful verification before reporting completion.

## Roadmap Sync Rule

Every completed small task must update `ROADMAP.md` in the same work cycle.

The roadmap update must include:

- What changed or was completed.
- Whether the current phase status changed.
- The next-stage goal after this task.

Every final task report must also include a short `Next stage goal` line so the project always has an explicit forward target.

If a task does not change product scope, still update the roadmap activity log or status note so the decision is visible.

## Subagent Naming

Use stable role names in prompts and reports:

- `SpecReviewer-01`
- `DXReviewer-01`
- `CodeReviewer-01`
- `TestReviewer-01`
- `Implementer-<Area>-NN`

Do not rely on random system-generated nicknames for project communication.
