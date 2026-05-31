import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
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
  });
});
