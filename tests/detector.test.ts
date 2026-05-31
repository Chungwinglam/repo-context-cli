import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { detectProject } from "../src/detector.js";

async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "repo-context-detector-"));
}

describe("detectProject", () => {
  it("detects Node and TypeScript signals with script commands", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "sample-app",
        scripts: {
          dev: "vite",
          build: "tsc -b",
          test: "vitest run",
          lint: "eslint ."
        }
      }),
      "utf8"
    );
    await writeFile(join(root, "tsconfig.json"), "{}", "utf8");
    await writeFile(join(root, "package-lock.json"), "{}", "utf8");

    const result = await detectProject(root);

    expect(result.project.name).toBe("sample-app");
    expect(result.project.packageManager).toBe("npm");
    expect(result.project.stacks).toEqual(["node", "typescript"]);
    expect(result.commands).toMatchObject({
      dev: "npm run dev",
      build: "npm run build",
      test: "npm test",
      lint: "npm run lint",
      install: "npm install"
    });
    expect(result.signals).toContainEqual({
      source: "package.json",
      description: "Detected Node.js project"
    });
  });

  it("reports missing commands as null instead of inventing commands", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({ name: "minimal-package", scripts: {} }),
      "utf8"
    );

    const result = await detectProject(root);

    expect(result.commands.test).toBeNull();
    expect(result.commands.build).toBeNull();
    expect(result.commands.dev).toBeNull();
    expect(result.commands.install).toBe("npm install");
  });

  it("reports invalid package.json without pretending package.json is absent", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "package.json"), "{not-json", "utf8");

    const result = await detectProject(root);

    expect(result.project.name).toBeTruthy();
    expect(result.commands.install).toBeNull();
    expect(result.warnings).toContain("package.json is not valid JSON; command inference is limited.");
    expect(result.warnings).not.toContain("No package.json detected; command inference is limited.");
  });
});
