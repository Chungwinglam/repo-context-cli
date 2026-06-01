# Release Readiness Audit

Date: 2026-06-01

Scope:

- npm package metadata and package contents.
- GitHub Actions CI, release, and context refresh workflows.
- README, changelog, contributing guide, license, and release documentation.
- First public release readiness for `repo-context-cli@0.1.0`.

## Summary

Repo Context CLI is close to first-release ready from a repository and package-contents perspective. The local package builds, the CLI help works from `dist/cli.js`, the release workflow has a version-tag guard, CI includes an installed-package smoke test, and `npm pack --dry-run` lists the expected package contents.

The project is not yet fully release-ready because external release gates remain and the adoption guide is still pending: the GitHub repository is still private, npm Trusted Publishing must be configured on npm before publishing through GitHub Actions, and maintainers still need public adoption guidance before broad promotion.

Overall status: Release candidate after external release gates and checklist hardening.

## Evidence

- `npm run build` passed.
- `node dist\cli.js --help` printed the expected `pack` and `mcp` command help.
- `npm pack --dry-run` passed for `repo-context-cli@0.1.0`.
- Dry-run package size: 35.4 kB packed, 148.3 kB unpacked.
- Dry-run package contents: 46 files, including `dist`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`.
- `npm view repo-context-cli version --json` returned npm `E404` on 2026-06-01, so the package name appears unclaimed or inaccessible at audit time. Recheck immediately before publishing because registry state can change.

## Ready

- `package.json` has core npm metadata: name, version, description, homepage, repository, bugs, bin, files, engines, keywords, and MIT license.
- The CLI entry point is `dist/cli.js` and is included in the packed files.
- CI runs build, lint, tests, and a tarball install smoke test.
- The release workflow runs build, lint, tests, tag/version validation, `npm pack --dry-run`, and `npm publish`.
- Release documentation explains GitHub Release triggering, tag naming, npm Trusted Publishing setup, and provenance expectations.
- The README covers quickstart, generated outputs, safety defaults, optional integrations, command reference, detected facts, roadmap, changelog, release, and contributing links.
- The changelog contains unreleased `0.1.0` notes that describe the current feature set.
- The license is present and included in the package.

## Release Blockers

### B1. Public launch requires making the GitHub repository public

The repository is still recorded as private in `ROADMAP.md`. That is acceptable for development but blocks a credible public npm launch and can prevent npm users from viewing README-linked GitHub assets.

Before public release:

- Make `Chungwinglam/repo-context-cli` public.
- Confirm README links and the demo SVG render from the public repository.
- Confirm the repository URL in `package.json` still matches the public repository.

### B2. npm Trusted Publishing setup must be completed outside the repo

The workflow is ready for trusted publishing, but npm-side trusted publisher configuration cannot be verified from the repository.

Before public release:

- Configure npm Trusted Publishing for `Chungwinglam/repo-context-cli`.
- Use workflow filename `release.yml`.
- Confirm the package name is still available immediately before first publish.

## Important Follow-Ups

### F1. Add a maintainer release checklist

`docs/release.md` already has a manual checklist, but Phase 5 should turn it into a stricter maintainer checklist with pre-release, release, and post-release verification sections.

Status: Complete. `docs/release.md` now includes pre-release, external-gate, release, post-release, and failed-release guidance.

### F2. Decide Node support verification policy

`package.json` and contributor docs support Node.js 20 or newer, while CI and release workflows currently verify Node.js 24. This is acceptable for the first audit but should be made explicit before public release.

Status: Complete. CI now verifies the test job on Node.js 20 and Node.js 24.

### F3. Add release tarball install smoke before publish

CI already installs the packed tarball in a fresh npm project, but the release workflow currently runs `npm pack --dry-run` and then publishes. A release-tag-specific install smoke would make the publish path stricter.

Status: Complete. The release workflow now packs to `./artifacts`, installs the tarball in a fresh npm project, and runs `repo-context pack --dry-run --for codex` before `npm publish`.

### F4. Clarify the original project spec status

`PROJECT_SPEC.md` is still marked `Status: Draft` and describes the original MVP scope. The implemented project has since moved beyond that MVP with MCP, HTML reports, editor guides, and GitHub Actions.

Recommended action: mark the spec as the original MVP spec or move current product truth to README/ROADMAP so new contributors do not mistake old non-goals for current constraints.

### F5. Add lightweight repository health files

The repo has a contributing guide and license, but public launch quality would improve with issue templates and a small support/security policy.

Status: Complete. The repository now includes GitHub issue forms for bug reports and feature requests, plus `SECURITY.md` and `SUPPORT.md`.

### F6. Add an adoption guide

The README explains what the tool does, but a focused adoption guide would help maintainers introduce Repo Context CLI into an existing repository without overwriting hand-authored context files.

Recommended action: document a safe adoption flow using `--dry-run`, generated-file review, and optional context drift checks.

## Acceptable Risks

- The release workflow publishes only from GitHub Releases, not tags pushed directly. This is intentional and documented.
- The package includes source maps and declaration files in `dist`. That increases package size slightly but keeps debugging and library reuse possible.
- The context refresh workflow checks tracked context files only. Ignored untracked `.repo-context` outputs are not enforced unless maintainers commit them intentionally.
- This repository currently has hand-authored `AGENTS.md` and does not track `PROJECT_MAP.md`, `TESTING.md`, or `.repo-context/`; the context refresh workflow is therefore a reusable guardrail rather than a strong self-enforcing check for this repo's own generated context files.

## Release Readiness Decision

Do not publish yet.

Completed since this audit was opened:

- Maintainer release checklist.
- Node.js 20 and Node.js 24 CI verification.
- Release tarball install smoke before `npm publish`.

Remaining before public release:

1. Resolve external gates: public repository and npm trusted publisher setup.
2. Recheck package name availability immediately before first publish.
3. Add adoption guidance before broad promotion.
