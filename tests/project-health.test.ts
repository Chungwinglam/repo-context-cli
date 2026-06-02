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

  it("tracks public positioning audit for adoption growth", async () => {
    const positioningAudit = await readProjectFile("docs/positioning-audit.md");

    expect(positioningAudit).toContain("# Public Positioning Audit");
    expect(positioningAudit).toContain("GitHub repository description: empty at audit time");
    expect(positioningAudit).toContain("npm latest version: `0.1.1`");
    expect(positioningAudit).toContain("includes npm provenance attestations");
    expect(positioningAudit).toContain("README first screen is accurate but not yet conversion-focused");
    expect(positioningAudit).toContain("Optional features appear before the core evaluation path");
    expect(positioningAudit).toContain("Recommended keyword additions");
    expect(positioningAudit).toContain("Improve README first-screen positioning");
    expect(positioningAudit).toContain("Update the README first screen and public package/repository metadata");
  });

  it("keeps the README first screen focused on the public offer", async () => {
    const readme = await readProjectFile("README.md");

    expect(readme).toContain("Generate deterministic repository context for AI coding agents.");
    expect(readme).toContain("AI coding agents lose time when each session starts from pasted notes");
    expect(readme).toContain("Start with a dry run");
    expect(readme).toContain("No LLM calls, no source edits, safe overwrite behavior");

    const quickstartIndex = readme.indexOf("## Quickstart");
    const optionalIntegrationsIndex = readme.indexOf("## Optional Integrations");
    const safetyIndex = readme.indexOf("## Safety Defaults");

    expect(quickstartIndex).toBeGreaterThan(-1);
    expect(safetyIndex).toBeGreaterThan(-1);
    expect(optionalIntegrationsIndex).toBeGreaterThan(safetyIndex);
    expect(optionalIntegrationsIndex).toBeGreaterThan(quickstartIndex);
  });

  it("documents a focused example gallery for common AI-agent workflows", async () => {
    const examples = await readProjectFile("docs/examples.md");
    const readme = await readProjectFile("README.md");
    const roadmap = await readProjectFile("ROADMAP.md");

    expect(examples).toContain("# Example Gallery");
    expect(examples).toContain("New project orientation");
    expect(examples).toContain("Safe adoption in an existing repository");
    expect(examples).toContain("Context refresh pull request");
    expect(examples).toContain("MCP and editor-assisted workflows");
    expect(examples).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(examples).toContain("No LLM calls, no source edits, and no automatic editor setting changes");
    expect(examples).toContain("For a no-write session, start only the MCP server.");
    expect(examples).toContain("When you want editor guides, generate them explicitly with `pack --editor-config`.");
    expect(readme).toContain("docs/examples.md");
    expect(roadmap).toContain("Add a focused example gallery for common AI-agent workflows. (Complete)");
  });

  it("documents when Repo Context CLI is useful versus prompt pasting", async () => {
    const comparison = await readProjectFile("docs/comparison.md");
    const readme = await readProjectFile("README.md");
    const roadmap = await readProjectFile("ROADMAP.md");

    expect(comparison).toContain("# Comparison Guide");
    expect(comparison).toContain("Manual prompt pasting");
    expect(comparison).toContain("README-only onboarding");
    expect(comparison).toContain("Ad hoc directory-tree dumps");
    expect(comparison).toContain("Use Repo Context CLI when");
    expect(comparison).toContain("Do not use Repo Context CLI as a replacement for reading source code");
    expect(comparison).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(comparison).toContain("No LLM calls, no source edits, and safe generated-file overwrite behavior");
    expect(readme).toContain("docs/comparison.md");
    expect(roadmap).toContain("Add a short comparison guide explaining when Repo Context CLI is useful versus ad hoc prompt pasting. (Complete)");
  });

  it("documents lightweight metrics and feedback loops for adoption growth", async () => {
    const metrics = await readProjectFile("docs/metrics.md");
    const readme = await readProjectFile("README.md");
    const roadmap = await readProjectFile("ROADMAP.md");

    expect(metrics).toContain("# Metrics and Feedback Plan");
    expect(metrics).toContain("No telemetry");
    expect(metrics).toContain("npm downloads");
    expect(metrics).toContain("GitHub issues");
    expect(metrics).toContain("adoption signals");
    expect(metrics).toContain("Weekly snapshot");
    expect(metrics).toContain("manual review");
    expect(metrics).toContain("Download counts are directional");
    expect(metrics).toContain("Repeated confusion");
    expect(metrics).toContain("Do not collect repository contents");
    expect(readme).toContain("docs/metrics.md");
    expect(roadmap).toContain("Add a lightweight metrics and feedback plan for npm downloads, GitHub issues, and adoption signals. (Complete)");
  });

  it("documents project closeout and localized README introductions", async () => {
    const closeout = await readProjectFile("docs/project-closeout.md");
    const readme = await readProjectFile("README.md");
    const chineseReadme = await readProjectFile("README.zh-CN.md");
    const japaneseReadme = await readProjectFile("README.ja.md");
    const koreanReadme = await readProjectFile("README.ko.md");
    const roadmap = await readProjectFile("ROADMAP.md");

    expect(closeout).toContain("# Project Closeout");
    expect(closeout).toContain("Public launch baseline: Complete");
    expect(closeout).toContain("Current npm version: `0.1.1`");
    expect(closeout).toContain("Phase 6 adoption growth and community proof is complete");
    expect(closeout).toContain("4500 GitHub stars is an adoption goal, not a completed outcome");
    expect(closeout).toContain("Non-blocking follow-ups");
    expect(closeout).toContain("Monitor public adoption signals");

    expect(readme).toContain("[简体中文](README.zh-CN.md)");
    expect(readme).toContain("[日本語](README.ja.md)");
    expect(readme).toContain("[한국어](README.ko.md)");
    expect(readme).toContain("docs/project-closeout.md");

    expect(chineseReadme).toContain("# Repo Context CLI");
    expect(chineseReadme).toContain("为 AI 编码代理生成确定性的仓库上下文");
    expect(chineseReadme).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(chineseReadme).toContain("无 LLM 调用");
    expect(chineseReadme).toContain("不会编辑业务源码");

    expect(japaneseReadme).toContain("# Repo Context CLI");
    expect(japaneseReadme).toContain("AI コーディングエージェント向け");
    expect(japaneseReadme).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(japaneseReadme).toContain("LLM 呼び出しはありません");
    expect(japaneseReadme).toContain("業務ソースコードは編集しません");

    expect(koreanReadme).toContain("# Repo Context CLI");
    expect(koreanReadme).toContain("AI 코딩 에이전트를 위한");
    expect(koreanReadme).toContain("npx repo-context-cli pack --dry-run --for codex");
    expect(koreanReadme).toContain("LLM 호출 없음");
    expect(koreanReadme).toContain("업무 소스 코드를 수정하지 않습니다");

    expect(roadmap).toContain("Current phase: Phase 7 planned");
    expect(roadmap).toContain("Project status: Public launch baseline complete");
    expect(roadmap).toContain("Last completed milestone: Project closeout and localized README introductions");
    expect(roadmap).toMatch(/## Phase 6: Adoption Growth and Community Proof\s+Status: Complete/);
    expect(roadmap).toMatch(/## Phase 7: Maintenance and Adoption Operations\s+Status: Planned/);
    expect(roadmap).toContain("Next-stage goal: Monitor public adoption signals and triage first external feedback before expanding scope.");
  });

  it("tracks external public-release gate status", async () => {
    const roadmap = await readProjectFile("ROADMAP.md");
    const audit = await readProjectFile("docs/release-readiness-audit.md");
    const release = await readProjectFile("docs/release.md");

    expect(roadmap).toContain("Public repository: `Chungwinglam/repo-context-cli`");
    expect(roadmap).toContain("Current phase: Phase 7 planned");
    expect(roadmap).toContain("Last completed milestone: Project closeout and localized README introductions");
    expect(roadmap).toContain("`repo-context-cli@0.1.0` exists on npm");
    expect(roadmap).toContain("Validate npm Trusted Publishing with a GitHub Release workflow patch. (Complete");
    expect(roadmap).toContain("Run a public README and npm package positioning audit. (Complete)");
    expect(roadmap).toContain("Improve README first-screen positioning and public package/repository metadata. (Complete)");
    expect(roadmap).toContain("Add a focused example gallery for common AI-agent workflows. (Complete)");
    expect(roadmap).toContain("Add a short comparison guide explaining when Repo Context CLI is useful versus ad hoc prompt pasting. (Complete)");
    expect(roadmap).toContain("Add a lightweight metrics and feedback plan for npm downloads, GitHub issues, and adoption signals. (Complete)");
    expect(roadmap).toContain("Close Phase 6 with an adoption-growth readiness review and define Phase 7 scope. (Complete)");
    expect(roadmap).toContain("Next-stage goal: Monitor public adoption signals and triage first external feedback before expanding scope.");
    expect(audit).toContain("Status: Complete. The GitHub repository is now public");
    expect(audit).toContain("`npm view repo-context-cli version --json` returned npm `E404` again on 2026-06-01");
    expect(audit).toContain("`npm view repo-context-cli version --json` returned `0.1.0` on 2026-06-02");
    expect(audit).toContain("Status: Complete. The package now exists on npm and Trusted Publishing is configured");
    expect(audit).toContain("Do not republish `0.1.0`");
    expect(audit).toContain("workflow-published `repo-context-cli@0.1.1` package is visible on npm");
    expect(audit).toContain("1 package with a verified attestation");
    expect(release).toContain("The package must already exist on npm before `npm trust github` can configure a trusted publisher");
    expect(release).toContain("`repo-context-cli@0.1.0` was manually bootstrapped on 2026-06-02");
    expect(release).toContain("Future releases should use the GitHub Release workflow");
    expect(release).toContain("`0.1.1` validated Trusted Publishing and npm provenance");
    expect(release).toContain("npm audit signatures");
    expect(release).toContain("npm CLI 11.10.0 or newer");
  });

  it("keeps npm patch release metadata publish-ready", async () => {
    const packageJson = JSON.parse(await readProjectFile("package.json")) as {
      version?: string;
      description?: string;
      keywords?: string[];
      bin?: Record<string, string>;
    };
    const changelog = await readProjectFile("CHANGELOG.md");
    const audit = await readProjectFile("docs/release-readiness-audit.md");

    expect(packageJson.version).toBe("0.1.1");
    expect(packageJson.description).toBe("Generate deterministic repository context for AI coding agents.");
    expect(packageJson.keywords).toEqual(
      expect.arrayContaining(["ai-agents", "context", "developer-tools", "mcp", "repository"]),
    );
    expect(packageJson.bin?.["repo-context"]).toBe("dist/cli.js");
    expect(changelog).toContain("The current package version is `0.1.1`");
    expect(changelog).toContain("## 0.1.1 - 2026-06-02");
    expect(changelog).toContain("Kept CLI behavior unchanged from `0.1.0`");
    expect(changelog).toContain("## 0.1.0 - 2026-06-01");
    expect(changelog).not.toContain("## 0.1.0 - Unreleased");
    expect(changelog).not.toContain("entry remains unreleased");
    expect(audit).toContain("`repo-context-cli@0.1.1` release metadata was prepared");
    expect(audit).toContain("The changelog contains dated `0.1.0` release notes");
  });
});
