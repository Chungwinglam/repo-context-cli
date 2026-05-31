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

The release job runs on `ubuntu-latest` with Node.js 24:

```text
npm ci
npm run build
npm run lint
npm test
verify tag equals v<package.json version>
npm pack --dry-run
npm publish
```

`npm pack --dry-run` is kept in the release workflow so package contents are listed before publishing.

## Provenance Status

npm trusted publishing automatically generates provenance attestations when all npm requirements are met. The current repository is still private, so npm provenance is not expected to be generated yet even if the package itself is public.

To get npm provenance for future releases:

- Make the GitHub repository public.
- Publish a public npm package.
- Keep publishing through the trusted GitHub Actions workflow.
- Keep `package.json#repository.url` matched to the GitHub repository.

## Manual Release Checklist

Before publishing a GitHub Release:

- Confirm `main` is green in CI.
- Confirm `package.json` has the intended version.
- Confirm `CHANGELOG.md` has release notes for that version.
- Make the GitHub repository public so npm users can load README assets served from GitHub raw URLs.
- Create and publish a GitHub Release tagged as `v<package.json version>`.
- Confirm the release workflow completed successfully.
- Confirm the npm package page shows the new version.
