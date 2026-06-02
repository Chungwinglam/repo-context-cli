# Release Readiness Audit

Date: 2026-06-01

Scope:

- npm package metadata and package contents.
- GitHub Actions CI, release, and context refresh workflows.
- README, changelog, contributing guide, license, and release documentation.
- First public release readiness for `repo-context-cli@0.1.0`.

## Summary

Repo Context CLI completed the first public npm bootstrap release. The local package builds, the CLI help works from `dist/cli.js`, the GitHub repository is public, the release workflow has a version-tag guard, CI includes an installed-package smoke test, and `repo-context-cli@0.1.0` is visible on npm.

The remaining release-path work is to exercise the GitHub Release workflow with `0.1.1` now that npm Trusted Publishing is configured.

Overall status: First public npm release complete; `0.1.1` is prepared to validate the trusted GitHub Actions path.

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
- `npm view repo-context-cli version --json` returned `0.1.0` on 2026-06-02 after the manual bootstrap publish.
- `npm view repo-context-cli@0.1.0 version bin repository dist --json` confirmed the published `repo-context` binary, repository URL, tarball integrity, 46-file package, and 149875-byte unpacked size.
- `npm view repo-context-cli@0.1.0 dependencies main directories author --json` confirmed the published package depends on `ignore` only and did not include the local smoke-test self-dependency mistake.
- A fresh temporary install smoke passed from the public registry on 2026-06-02: `npm install repo-context-cli@0.1.0 --omit=dev`, installed `repo-context --help`, and installed `repo-context pack --dry-run --for codex`.
- `npx npm@latest trust github repo-context-cli --file release.yml --repo Chungwinglam/repo-context-cli --allow-publish --yes` returned npm registry HTTP 201 for trust creation on 2026-06-02.
- `repo-context-cli@0.1.1` release metadata was prepared on 2026-06-02 with no CLI behavior changes from `0.1.0`.

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

Status: Complete. The package now exists on npm and Trusted Publishing is configured for GitHub Actions workflow `release.yml` with `npm publish` allowed.

The official `npm trust` CLI path requires npm CLI 11.10.0 or newer and an existing package on the npm registry. The local npm CLI was 11.9.0, so setup used `npx npm@latest`, which resolved to npm 11.16.0. The trust creation request returned npm registry HTTP 201 on 2026-06-02.

The `0.1.0` release was manually bootstrapped because npm Trusted Publishing required the package to exist first. Do not republish `0.1.0`. Use the GitHub Release workflow for `0.1.1` or the next patch.

Manual bootstrap attempt record:

- On 2026-06-01, `npm whoami` succeeded as `ryanlin23`, confirming the local npm login was active.
- A first visible PowerShell token helper failed before publishing because the npmrc auth line was not preserved as a string in the encoded command, so PowerShell tried to execute `//registry.npmjs.org/:_authToken=...` as a command.
- A corrected temporary-npmrc helper reached `npm publish --access public`, but npm returned `E403`: publishing requires two-factor authentication or a granular access token with bypass 2FA enabled.
- `npm view repo-context-cli version --json` still returned `E404` after the failed publish attempts, confirming `repo-context-cli@0.1.0` was not created on npm.

Completion record:

- On 2026-06-02, npm account 2FA was confirmed in `auth-and-writes` mode.
- `repo-context-cli@0.1.0` was published manually from `main`.
- `npm view repo-context-cli version --json` returned `0.1.0`.
- A clean install smoke from the public registry passed in a temporary project.
- npm Trusted Publishing was configured for `Chungwinglam/repo-context-cli` / `release.yml` with `npm publish` allowed.

Before the first trusted-workflow release:

- Bump to `0.1.1` or the next patch.
- Add changelog notes for that patch.
- Publish a GitHub Release tagged exactly as `v<package.json version>`.
- Confirm the release workflow publishes through Trusted Publishing and npm shows provenance for the new version.

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

Do not republish `0.1.0`.

Completed since this audit was opened:

- Maintainer release checklist.
- Node.js 20 and Node.js 24 CI verification.
- Release tarball install smoke before `npm publish`.
- Adoption guide for existing repositories.
- Public GitHub repository gate.
- npm package name recheck after making the repository public.
- Manual npm bootstrap publish of `repo-context-cli@0.1.0`.
- Public registry install smoke for `repo-context-cli@0.1.0`.
- npm Trusted Publishing configuration for GitHub Actions workflow `release.yml`.

Remaining before the next release:

1. Publish GitHub Release `v0.1.1` to trigger `.github/workflows/release.yml`.
2. Confirm the workflow publishes through Trusted Publishing.
3. Confirm `npm view repo-context-cli version --json` returns `0.1.1`.
4. Confirm npm provenance is shown for the workflow-published version.
