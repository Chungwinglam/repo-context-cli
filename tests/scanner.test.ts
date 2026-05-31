import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { scanRepository } from "../src/scanner.js";

async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "repo-context-scanner-"));
}

describe("scanRepository", () => {
  it("ignores noisy directories and classifies common file kinds", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "src"), { recursive: true });
    await mkdir(join(root, "node_modules", "pkg"), { recursive: true });
    await mkdir(join(root, "dist"), { recursive: true });
    await writeFile(join(root, "src", "index.ts"), "export {};\n", "utf8");
    await writeFile(join(root, "README.md"), "# Sample\n", "utf8");
    await writeFile(join(root, "package.json"), "{\"name\":\"sample\"}", "utf8");
    await writeFile(join(root, "node_modules", "pkg", "index.js"), "", "utf8");
    await writeFile(join(root, "dist", "bundle.js"), "", "utf8");

    const result = await scanRepository(root, { maxFiles: 100 });

    expect(result.files.map((file) => file.path)).toEqual([
      "README.md",
      "package.json",
      "src/index.ts"
    ]);
    expect(result.files.find((file) => file.path === "src/index.ts")?.kind).toBe("source");
    expect(result.files.find((file) => file.path === "README.md")?.kind).toBe("documentation");
    expect(result.excluded).toEqual(expect.arrayContaining(["node_modules", "dist"]));
    expect(result.truncated).toBe(false);
  });

  it("applies max-files deterministically and reports truncation", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "b.ts"), "", "utf8");
    await writeFile(join(root, "a.ts"), "", "utf8");
    await writeFile(join(root, "c.ts"), "", "utf8");

    const result = await scanRepository(root, { maxFiles: 2 });

    expect(result.files.map((file) => file.path)).toEqual(["a.ts", "b.ts"]);
    expect(result.truncated).toBe(true);
  });
});
