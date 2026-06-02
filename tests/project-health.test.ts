import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readProjectFile(path: string): Promise<string> {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("project health files", () => {
  it("provides focused GitHub issue templates", async () => {
    const config = await readProjectFile(".github/ISSUE_TEMPLATE/config.yml");
    const bugReport = await readProjectFile(".github/ISSUE_TEMPLATE/bug_report.yml");
    const featureRequest = await readProjectFile(".github/ISSUE_TEMPLATE/feature_request.yml");

    expect(config).toContain("blank_issues_enabled: false");
    expect(config).toContain("Contact options");
    expect(bugReport).toContain("name: Bug report");
    expect(bugReport).toContain("labels: [bug, needs-triage]");
    expect(bugReport).toContain("repo-context pack --dry-run");
    expect(bugReport).toContain("Operating system and shell");
    expect(bugReport).toContain("No secrets, tokens, or private source snippets");
    expect(featureRequest).toContain("name: Feature request");
    expect(featureRequest).toContain("labels: [enhancement, needs-triage]");
    expect(featureRequest).toContain("What problem would this solve?");
    expect(featureRequest).toContain("trust boundary");
  });

  it("documents lightweight support and security policy", async () => {
    const security = await readProjectFile("SECURITY.md");
    const support = await readProjectFile("SUPPORT.md");

    expect(security).toContain("Supported Versions");
    expect(security).toContain("privately report");
    expect(security).toContain("GitHub private vulnerability reporting");
    expect(security).toContain("Do not include secrets");
    expect(support).toContain("Support");
    expect(support).toContain("GitHub Issues");
    expect(support).toContain("not a hosted service");
  });

  it("links health files from contributor and user docs", async () => {
    const readme = await readProjectFile("README.md");
    const contributing = await readProjectFile("CONTRIBUTING.md");

    expect(readme).toContain("SECURITY.md");
    expect(readme).toContain("SUPPORT.md");
    expect(contributing).toContain(".github/ISSUE_TEMPLATE");
    expect(contributing).toContain("SECURITY.md");
  });

  it("documents a safe adoption path for existing repositories", async () => {
    const adoption = await readProjectFile("docs/adoption.md");
    const readme = await readProjectFile("README.md");
    const audit = await readProjectFile("docs/release-readiness-audit.md");

    expect(adoption).toContain("# Adoption Guide");
    expect(adoption).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(adoption).toContain("Review the planned writes");
    expect(adoption).toContain("Dry run shows planned outputs and scan warnings");
    expect(adoption).toContain("Do not use `--force`");
    expect(adoption).toContain("npx repo-context-cli pack --for codex --html-report --editor-config");
    expect(adoption).toContain("--generated-at 1970-01-01T00:00:00.000Z");
    expect(adoption).toContain("regenerate and recommit");
    expect(adoption).toContain("context-refresh.yml");
    expect(adoption).toContain("No secrets, tokens, or private source snippets");
    expect(readme).toContain("docs/adoption.md");
    expect(audit).toContain("Status: Complete. `docs/adoption.md`");
  });

  it("tracks external public-release gate status", async () => {
    const roadmap = await readProjectFile("ROADMAP.md");
    const audit = await readProjectFile("docs/release-readiness-audit.md");
    const release = await readProjectFile("docs/release.md");

    expect(roadmap).toContain("Public repository: `Chungwinglam/repo-context-cli`");
    expect(roadmap).toContain("Last completed milestone: Phase 5 external public-release gates");
    expect(roadmap).toContain("`repo-context-cli@0.1.0` exists on npm");
    expect(roadmap).toContain("Next-stage goal: Prepare a `0.1.1` patch release");
    expect(audit).toContain("Status: Complete. The GitHub repository is now public");
    expect(audit).toContain("`npm view repo-context-cli version --json` returned npm `E404` again on 2026-06-01");
    expect(audit).toContain("`npm view repo-context-cli version --json` returned `0.1.0` on 2026-06-02");
    expect(audit).toContain("Status: Complete. The package now exists on npm and Trusted Publishing is configured");
    expect(audit).toContain("Do not republish `0.1.0`");
    expect(audit).toContain("Confirm npm provenance is shown for the workflow-published version");
    expect(release).toContain("The package must already exist on npm before `npm trust github` can configure a trusted publisher");
    expect(release).toContain("`repo-context-cli@0.1.0` was manually bootstrapped on 2026-06-02");
    expect(release).toContain("Future releases should use the GitHub Release workflow");
    expect(release).toContain("verify provenance on `0.1.1` or the next GitHub Release workflow publish");
    expect(release).toContain("npm CLI 11.10.0 or newer");
  });

  it("keeps npm bootstrap release metadata publish-ready", async () => {
    const packageJson = JSON.parse(await readProjectFile("package.json")) as {
      bin?: Record<string, string>;
    };
    const changelog = await readProjectFile("CHANGELOG.md");
    const audit = await readProjectFile("docs/release-readiness-audit.md");

    expect(packageJson.bin?.["repo-context"]).toBe("dist/cli.js");
    expect(changelog).toContain("## 0.1.0 - 2026-06-01");
    expect(changelog).not.toContain("## 0.1.0 - Unreleased");
    expect(changelog).not.toContain("entry remains unreleased");
    expect(audit).toContain("The changelog contains dated `0.1.0` release notes");
  });
});
