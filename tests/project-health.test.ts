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
});
