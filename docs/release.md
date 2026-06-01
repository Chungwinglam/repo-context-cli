# Release Process

Repo Context CLI publishes to npm from GitHub Actions through npm trusted publishing. The workflow is configured for provenance-ready publishing without storing a long-lived npm token in repository secrets.

## Release Trigger

The release workflow is `.github/workflows/release.yml`.

It runs when a GitHub Release is published:

```yaml
on:
  release:
    types: [published]
```

Before publishing, the workflow verifies that the release tag matches the package version exactly:

```text
package.json version 0.1.0 -> release tag v0.1.0
```

If the tag and package version do not match, the workflow exits before `npm publish`.

## npm Trusted Publisher Setup

Configure npm Trusted Publishing for the package before publishing from GitHub Actions.

On npmjs.com, configure the package trusted publisher with:

- Provider: GitHub Actions
- Organization or user: `Chungwinglam`
- Repository: `repo-context-cli`
- Workflow filename: `release.yml`
- Allowed actions: `npm publish`

The workflow grants:

```yaml
permissions:
  contents: read
  id-token: write
```

`id-token: write` lets GitHub Actions mint the OIDC token that npm uses for trusted publishing. The workflow intentionally does not use `NPM_TOKEN`.

## Publish Steps

The release job runs on `ubuntu-latest` with Node.js 24. CI verifies the documented runtime support range on Node.js 20 and Node.js 24 before release.

```text
npm ci
npm run build
npm run lint
npm test
verify tag equals v<package.json version>
npm pack --dry-run
npm pack --pack-destination ./artifacts
install the packed tarball in a fresh npm project
repo-context pack --dry-run --for codex
npm publish
```

`npm pack --dry-run` is kept in the release workflow so package contents are listed before publishing. The release tarball smoke test then installs the packed artifact in a fresh npm project and runs the installed `repo-context` binary before `npm publish`.

## Provenance Status

npm trusted publishing automatically generates provenance attestations when all npm requirements are met. The current repository is still private, so npm provenance is not expected to be generated yet even if the package itself is public.

To get npm provenance for future releases:

- Make the GitHub repository public.
- Publish a public npm package.
- Keep publishing through the trusted GitHub Actions workflow.
- Keep `package.json#repository.url` matched to the GitHub repository.

## Maintainer Release Checklist

Use this checklist for every npm release.

### Pre-Release

- Confirm `main` is green in CI, including Node.js 20 and Node.js 24 test jobs.
- Confirm `package.json` has the intended version.
- Confirm `CHANGELOG.md` has release notes for that version and no stale unreleased wording for the version being published.
- Recheck package name availability before the first publish with `npm view repo-context-cli version --json`; `E404` means the name is not visible on the public registry at that moment.
- Run `npm pack --dry-run` locally and review the tarball contents.
- Run the tarball install smoke locally when packaging, binary, or dependency behavior changed.
- Confirm `docs/release-readiness-audit.md` has no unresolved release blocker that applies to the target release.

### External Gates

- Make the GitHub repository public before the public npm release.
- Configure npm Trusted Publishing for `Chungwinglam/repo-context-cli`.
- Confirm the trusted publisher uses workflow filename `release.yml` and allows `npm publish`.
- Confirm no long-lived `NPM_TOKEN` is required by the release workflow.

### Release

- Create a GitHub Release tagged exactly as `v<package.json version>`.
- Publish the GitHub Release to trigger `.github/workflows/release.yml`.
- Confirm the release workflow passes build, lint, test, tag/version validation, package dry-run, release tarball smoke, and `npm publish`.

### Post-Release

- Confirm the npm package page shows the new version.
- Confirm the package README renders correctly on npm.
- Confirm provenance is shown when npm and GitHub public repository requirements are met.
- Install the published package in a fresh directory and run:

```bash
npm init -y
npm install repo-context-cli
npx repo-context-cli pack --dry-run --for codex
```

- Confirm the GitHub Release links to the intended commit.
- If the release workflow fails before `npm publish`, fix the issue and publish a corrected GitHub Release with the same version tag only after confirming npm does not show the version.
- If `npm publish` succeeds but a post-release check fails, do not overwrite the version. Open a follow-up fix and publish a new patch version if needed.
