# Security Policy

Repo Context CLI is a local CLI tool. It does not call an LLM API, does not require a hosted service, and should not collect secrets.

## Supported Versions

Security fixes target the latest unreleased `0.1.x` line until the first public release is published. After public release, supported versions will be documented in the release notes for each maintained line.

## Reporting a Vulnerability

If you believe you found a vulnerability, privately report it before opening a public issue.

Before public launch, enable GitHub private vulnerability reporting for this repository and use that as the primary private reporting channel. Until that setting is available on the public repository, do not publish a security issue publicly; contact the maintainer through the repository owner profile and include only a short request for a private security contact path.

Do not include secrets, tokens, private keys, private source code, or private repository archives in the initial report.

Useful report details:

- A short description of the vulnerability.
- The affected command, such as `repo-context pack` or `repo-context mcp`.
- A minimal safe reproduction using dummy files.
- The operating system and Node.js version.
- Whether generated files, path handling, redaction, or overwrite behavior is involved.

## Security Scope

In scope:

- Path traversal or generated output escaping the repository root.
- Secret-like files or command values appearing in generated context.
- Unsafe overwrite behavior for user-authored files.
- MCP server behavior that exposes more than read-only repository context.
- npm package or GitHub Actions release-chain issues.

Out of scope:

- Private data pasted into public issues by a reporter.
- Behavior caused by running the CLI on intentionally malicious repositories without a concrete security impact.
- Requests for private support unrelated to vulnerability handling.
