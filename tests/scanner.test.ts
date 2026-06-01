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

  it("respects root gitignore patterns while preserving default ignores", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "src"), { recursive: true });
    await mkdir(join(root, "tmp"), { recursive: true });
    await mkdir(join(root, "node_modules", "pkg"), { recursive: true });
    await writeFile(join(root, ".gitignore"), "tmp/\n*.log\nsrc/generated.ts\n", "utf8");
    await writeFile(join(root, "src", "index.ts"), "export {};\n", "utf8");
    await writeFile(join(root, "src", "generated.ts"), "export const generated = true;\n", "utf8");
    await writeFile(join(root, "debug.log"), "debug\n", "utf8");
    await writeFile(join(root, "tmp", "scratch.txt"), "scratch\n", "utf8");
    await writeFile(join(root, "node_modules", "pkg", "index.js"), "", "utf8");

    const result = await scanRepository(root, { maxFiles: 100 });

    expect(result.files.map((file) => file.path)).toEqual([".gitignore", "src/index.ts"]);
    expect(result.excluded).toEqual(expect.arrayContaining(["node_modules", "tmp"]));
  });

  it("supports high-risk gitignore semantics through the ignore matcher", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "artifacts"), { recursive: true });
    await mkdir(join(root, "packages", "app"), { recursive: true });
    await mkdir(join(root, "src", "generated"), { recursive: true });
    await writeFile(
      join(root, ".gitignore"),
      "# comments and blanks are ignored\n\n*.log\n!keep.log\n/root-only.txt\nartifacts/*\n!artifacts/keep.txt\n**/generated/**\n",
      "utf8"
    );
    await writeFile(join(root, "debug.log"), "debug\n", "utf8");
    await writeFile(join(root, "keep.log"), "keep\n", "utf8");
    await writeFile(join(root, "root-only.txt"), "root\n", "utf8");
    await writeFile(join(root, "artifacts", "drop.txt"), "drop\n", "utf8");
    await writeFile(join(root, "artifacts", "keep.txt"), "keep\n", "utf8");
    await writeFile(join(root, "packages", "app", "root-only.txt"), "nested\n", "utf8");
    await writeFile(join(root, "src", "generated", "client.ts"), "export {};\n", "utf8");

    const result = await scanRepository(root, { maxFiles: 100 });

    expect(result.files.map((file) => file.path)).toEqual([
      ".gitignore",
      "artifacts/keep.txt",
      "keep.log",
      "packages/app/root-only.txt"
    ]);
  });

  it("redacts secret-like paths without listing them in the context", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, ".ssh"), { recursive: true });
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, ".env"), "API_KEY=secret\n", "utf8");
    await writeFile(join(root, ".env.local"), "TOKEN=secret\n", "utf8");
    await writeFile(join(root, ".npmrc"), "//registry.npmjs.org/:_authToken=secret\n", "utf8");
    await writeFile(join(root, ".ssh", "id_rsa"), "PRIVATE KEY\n", "utf8");
    await writeFile(join(root, "src", "index.ts"), "export {};\n", "utf8");

    const result = await scanRepository(root, { maxFiles: 100 });

    expect(result.files.map((file) => file.path)).toEqual(["src/index.ts"]);
    expect(result.excluded).not.toContain(".env");
    expect(result.excluded).not.toContain(".env.local");
    expect(result.excluded).not.toContain(".npmrc");
    expect(result.excluded).not.toContain(".ssh");
    expect(result.redactions.secretLikePaths).toBe(4);
  });
});
