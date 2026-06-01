import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const cliPath = join(process.cwd(), "dist", "cli.js");

async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "repo-context-cli-"));
}

describe("repo-context CLI", () => {
  it("runs pack --dry-run through the real CLI without writing files", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"cli-app\"}", "utf8");

    const result = await execFileAsync(process.execPath, [cliPath, "pack", "--dry-run", "--for", "claude"], {
      cwd: root
    });

    expect(result.stdout).toContain("Planned context package:");
    expect(result.stdout).toContain("planned: AGENTS.md");
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
  });

  it("lists MCP server mode in top-level help", async () => {
    const root = await createTempRepo();

    const result = await execFileAsync(process.execPath, [cliPath, "--help"], {
      cwd: root
    });

    expect(result.stdout).toContain("mcp     Start a read-only stdio MCP server");
    expect(result.stdout).toContain("--editor-config");
    expect(result.stdout).toContain("--generated-at");
  });

  it("honors output directory and max-files flags through the real CLI", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "package.json"), "{\"name\":\"flag-app\"}", "utf8");
    await writeFile(join(root, "src", "index.ts"), "export {};\n", "utf8");

    const result = await execFileAsync(
      process.execPath,
      [cliPath, "pack", "--for", "cursor", "--output", ".ai-context", "--max-files", "1"],
      { cwd: root }
    );

    expect(result.stdout).toContain("written: .ai-context/index.json");
    expect(existsSync(join(root, ".ai-context", "index.json"))).toBe(true);
  });

  it("places the optional HTML report under the selected output directory", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"cli-output-report-app\"}", "utf8");

    const result = await execFileAsync(
      process.execPath,
      [cliPath, "pack", "--output", ".ai-context", "--html-report"],
      { cwd: root }
    );

    expect(result.stdout).toContain("written: .ai-context/report.html");
    expect(existsSync(join(root, ".ai-context", "report.html"))).toBe(true);
    expect(existsSync(join(root, ".repo-context", "report.html"))).toBe(false);
  });

  it("writes optional editor config guides through the real CLI", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"cli-editor-app\"}", "utf8");

    const result = await execFileAsync(
      process.execPath,
      [cliPath, "pack", "--output", ".ai-context", "--editor-config"],
      { cwd: root }
    );

    expect(result.stdout).toContain("written: .ai-context/editors/README.md");
    expect(result.stdout).toContain("written: .ai-context/editors/cursor.md");
    expect(result.stdout).toContain("written: .ai-context/editors/vscode.md");
    expect(existsSync(join(root, ".ai-context", "editors", "README.md"))).toBe(true);
    expect(existsSync(join(root, ".ai-context", "editors", "cursor.md"))).toBe(true);
    expect(existsSync(join(root, ".ai-context", "editors", "vscode.md"))).toBe(true);
  });

  it("supports optional HTML report output through the real CLI", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"cli-report-app\"}", "utf8");

    const result = await execFileAsync(process.execPath, [cliPath, "pack", "--html-report"], {
      cwd: root
    });

    expect(result.stdout).toContain("written: .repo-context/report.html");
    expect(existsSync(join(root, ".repo-context", "report.html"))).toBe(true);
  });

  it("supports deterministic generated timestamps through the real CLI", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{\"name\":\"cli-timestamp-app\"}", "utf8");

    await execFileAsync(
      process.execPath,
      [cliPath, "pack", "--generated-at", "1970-01-01T00:00:00.000Z"],
      { cwd: root }
    );

    const index = JSON.parse(await readFile(join(root, ".repo-context", "index.json"), "utf8"));
    const agents = await readFile(join(root, "AGENTS.md"), "utf8");

    expect(index.generatedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(agents).toContain("Generated at: 1970-01-01T00:00:00.000Z");
  });

  it("prints MCP help without starting the server", async () => {
    const root = await createTempRepo();

    const result = await execFileAsync(process.execPath, [cliPath, "mcp", "--help"], {
      cwd: root
    });

    expect(result.stdout).toContain("repo-context mcp");
    expect(result.stdout).toContain("--max-files");
  });

  it("rejects invalid MCP root before starting the server", async () => {
    const root = await createTempRepo();
    const missingRoot = join(root, "missing");

    await expect(
      execFileAsync(process.execPath, [cliPath, "mcp", "--root", missingRoot], { cwd: root })
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("--root must point to an existing directory")
    });
  });

  it("exits non-zero for invalid flags", async () => {
    const root = await createTempRepo();

    await expect(execFileAsync(process.execPath, [cliPath, "pack", "--for", "react"], { cwd: root })).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("Unsupported target: react")
    });

    await expect(execFileAsync(process.execPath, [cliPath, "pack", "--max-files", "-1"], { cwd: root })).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("--max-files must be a non-negative integer")
    });

    await expect(
      execFileAsync(process.execPath, [cliPath, "pack", "--generated-at", "not-a-date"], { cwd: root })
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("--generated-at must be a valid date/time value")
    });

    await expect(execFileAsync(process.execPath, [cliPath, "mcp", "--force"], { cwd: root })).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("Unknown flag for mcp: --force")
    });

    await expect(
      execFileAsync(process.execPath, [cliPath, "mcp", "--editor-config"], { cwd: root })
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("Unknown flag for mcp: --editor-config")
    });
  });
});
