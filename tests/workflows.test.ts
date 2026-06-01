import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const contextRefreshWorkflow = new URL("../.github/workflows/context-refresh.yml", import.meta.url);
const execFileAsync = promisify(execFile);
const cliPath = join(process.cwd(), "dist", "cli.js");
const stableGeneratedAt = "1970-01-01T00:00:00.000Z";

async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "repo-context-workflow-"));
}

describe("GitHub Actions workflows", () => {
  it("keeps the context refresh workflow conservative and check-only", async () => {
    const workflow = normalizeLineEndings(await readFile(contextRefreshWorkflow, "utf8"));

    expect(workflow).toContain("name: Context Refresh");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("node-version: 24");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run build");
    expect(workflow).toContain(
      `node dist/cli.js pack --for codex --html-report --editor-config --generated-at ${stableGeneratedAt}`
    );
    expect(workflow).toContain("git diff --exit-code -- AGENTS.md PROJECT_MAP.md TESTING.md .repo-context");

    expect(workflow).not.toContain("--force");
    expect(workflow).not.toContain("contents: write");
    expect(workflow).not.toContain("git commit");
    expect(workflow).not.toContain("git push");
  });

  it("keeps tracked context files clean when the workflow generation command is rerun", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"workflow-app\"}", "utf8");

    await execFileAsync("git", ["init"], { cwd: root });
    await execFileAsync(process.execPath, workflowPackArgs(), { cwd: root });
    await execFileAsync("git", ["add", "AGENTS.md", "PROJECT_MAP.md", "TESTING.md", ".repo-context"], { cwd: root });
    await execFileAsync(process.execPath, workflowPackArgs(), { cwd: root });

    await expect(
      execFileAsync("git", ["diff", "--exit-code", "--", "AGENTS.md", "PROJECT_MAP.md", "TESTING.md", ".repo-context"], {
        cwd: root
      })
    ).resolves.toBeDefined();
  });
});

function workflowPackArgs(): string[] {
  return [
    cliPath,
    "pack",
    "--for",
    "codex",
    "--html-report",
    "--editor-config",
    "--generated-at",
    stableGeneratedAt
  ];
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n");
}
