# Release Readiness Audit

Date: 2026-06-01

Scope:

- npm package metadata and package contents.
- GitHub Actions CI, release, and context refresh workflows.
- README, changelog, contributing guide, license, and release documentation.
- First public release readiness for `repo-context-cli@0.1.0`.

## Summary

Repo Context CLI is close to first-release ready from a repository and package-contents perspective. The local package builds, the CLI help works from `dist/cli.js`, the GitHub repository is public, the release workflow has a version-tag guard, CI includes an installed-package smoke test, and `npm pack --dry-run` lists the expected package contents.

The project is not yet fully release-ready because npm-side release gates remain: the package is not yet visible on npm, npm Trusted Publishing is not configured, and the trusted-publisher CLI path requires an existing package record.

Overall status: Release candidate after external release gates.

## Evidence

- `npm run build` passed.
- `node dist\cli.js --help` printed the expected `pack` and `mcp` command help.
- `npm pack --dry-run` passed for `repo-context-cli@0.1.0`.
- Dry-run package size: 35.4 kB packed, 148.3 kB unpacked.
- Dry-run package contents: 46 files, including `dist`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`.
- `npm view repo-context-cli version --json` returned npm `E404` on 2026-06-01, so the package name appears unclaimed or inaccessible at audit time. Recheck immediately before publishing because registry state can change.
- `npm view repo-context-cli version --json` returned npm `E404` again on 2026-06-01 after the repository was made public.
- `gh repo view Chungwinglam/repo-context-cli --json visibility` returned `PUBLIC` on 2026-06-01.
- The README demo SVG raw URL returned HTTP 200 on 2026-06-01.

## Ready

- `package.json` has core npm metadata: name, version, description, homepage, repository, bugs, bin, files, engines, keywords, and MIT license.
- The CLI entry point is `dist/cli.js` and is included in the packed files.
- CI runs build, lint, tests, and a tarball install smoke test.
- The release workflow runs build, lint, tests, tag/version validation, `npm pack --dry-run`, and `npm publish`.
- Release documentation explains GitHub Release triggering, tag naming, npm Trusted Publishing setup, and provenance expectations.
- The README covers quickstart, generated outputs, safety defaults, optional integrations, command reference, detected facts, roadmap, changelog, release, and contributing links.
- The changelog contains dated `0.1.0` release notes that describe the current feature set.
- The license is present and included in the package.
- The GitHub repository is public, so README links and raw GitHub assets can be accessed without private repository credentials.

## Release Blockers

### B1. Public launch requires making the GitHub repository public

Status: Complete. The GitHub repository is now public, and the README demo SVG raw asset returned HTTP 200 on 2026-06-01.

Before public release, keep `package.json#repository.url` matched to `https://github.com/Chungwinglam/repo-context-cli`.

### B2. npm Trusted Publishing setup must be completed outside the repo

The workflow is ready for trusted publishing, but npm-side trusted publisher configuration cannot be completed from the repository alone.

Blocked until the package exists on npm. The official `npm trust` CLI path requires npm CLI 11.10.0 or newer and an existing package on the npm registry. On 2026-06-01, the local npm CLI was 11.9.0 and did not include `npm trust`, while `npm view repo-context-cli version --json` returned `E404`.

Bootstrap publish `0.1.0` manually only if npm still requires an existing package before Trusted Publishing can be configured. Do not trigger the `v0.1.0` GitHub Release expecting Trusted Publishing to work while the package is still absent from npm. After the package exists and Trusted Publishing is configured, use the GitHub Release workflow for `0.1.1` or the next patch after Trusted Publishing is configured.

Before public release:

- Complete the npm package existence step for `repo-context-cli`.
- Configure npm Trusted Publishing for `Chungwinglam/repo-context-cli`.
- Use workflow filename `release.yml`.
- Allow `npm publish`.
- Confirm the package name is still available immediately before the first package creation or publish step.

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

Status: Complete. `docs/adoption.md` now documents a safe branch-based rollout using `--dry-run`, generated-file review, force-overwrite caution, optional HTML/editor outputs, and optional check-only context drift automation.

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
- Adoption guide for existing repositories.
- Public GitHub repository gate.
- npm package name recheck after making the repository public.

Remaining before public release:

1. Decide and execute the npm bootstrap path: if `repo-context-cli` still does not exist, manually publish `0.1.0` after the full release checklist instead of triggering `v0.1.0` through the unconfigured release workflow.
2. Configure npm Trusted Publishing for GitHub Actions workflow `release.yml` with `npm publish` allowed.
3. Confirm `npm trust list repo-context-cli` or npm package settings show the trusted publisher.
4. Use the GitHub Release workflow for `0.1.1` or the next patch after Trusted Publishing is configured.
