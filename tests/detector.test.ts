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

  it("uses declared pnpm package manager for script commands", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "pnpm-app",
        packageManager: "pnpm@10.0.0",
        scripts: {
          dev: "vite",
          test: "vitest run"
        }
      }),
      "utf8"
    );
    await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n", "utf8");

    const result = await detectProject(root);

    expect(result.project.packageManager).toBe("pnpm");
    expect(result.commands.install).toBe("pnpm install");
    expect(result.commands.dev).toBe("pnpm dev");
    expect(result.commands.test).toBe("pnpm test");
    expect(result.warnings).toEqual([]);
  });

  it("uses yarn and bun lockfiles for command inference when no packageManager is declared", async () => {
    const yarnRoot = await createTempRepo();
    await writeFile(
      join(yarnRoot, "package.json"),
      JSON.stringify({ name: "yarn-app", scripts: { build: "tsc -b" } }),
      "utf8"
    );
    await writeFile(join(yarnRoot, "yarn.lock"), "# yarn lock\n", "utf8");

    const yarnResult = await detectProject(yarnRoot);
    expect(yarnResult.project.packageManager).toBe("yarn");
    expect(yarnResult.commands.install).toBe("yarn install");
    expect(yarnResult.commands.build).toBe("yarn build");

    const bunRoot = await createTempRepo();
    await writeFile(
      join(bunRoot, "package.json"),
      JSON.stringify({ name: "bun-app", scripts: { lint: "eslint ." } }),
      "utf8"
    );
    await writeFile(join(bunRoot, "bun.lock"), "", "utf8");

    const bunResult = await detectProject(bunRoot);
    expect(bunResult.project.packageManager).toBe("bun");
    expect(bunResult.commands.install).toBe("bun install");
    expect(bunResult.commands.lint).toBe("bun lint");
  });

  it("warns when package manager declaration conflicts with lockfiles", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "conflict-app",
        packageManager: "pnpm@10.0.0",
        scripts: { test: "vitest run" }
      }),
      "utf8"
    );
    await writeFile(join(root, "package-lock.json"), "{}", "utf8");
    await writeFile(join(root, "yarn.lock"), "# yarn lock\n", "utf8");

    const result = await detectProject(root);

    expect(result.project.packageManager).toBe("pnpm");
    expect(result.commands.test).toBe("pnpm test");
    expect(result.warnings).toContain(
      "package.json declares pnpm but lockfiles suggest npm, yarn; using declared package manager."
    );
    expect(result.warnings).toContain(
      "Multiple package-manager lockfiles detected: npm, yarn. Verify the intended package manager."
    );
  });

  it("warns on multiple lockfiles without a declared package manager", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({ name: "multi-lock-app", scripts: { test: "vitest run" } }),
      "utf8"
    );
    await writeFile(join(root, "package-lock.json"), "{}", "utf8");
    await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n", "utf8");

    const result = await detectProject(root);

    expect(result.project.packageManager).toBe("npm");
    expect(result.commands.test).toBe("npm test");
    expect(result.warnings).toContain(
      "Multiple package-manager lockfiles detected: npm, pnpm. Verify the intended package manager."
    );
  });

  it("uses declared yarn when lockfiles point to another package manager", async () => {
    const root = await createTempRepo();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "declared-yarn-app",
        packageManager: "yarn@4.0.0",
        scripts: { build: "tsc -b" }
      }),
      "utf8"
    );
    await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n", "utf8");

    const result = await detectProject(root);

    expect(result.project.packageManager).toBe("yarn");
    expect(result.commands.build).toBe("yarn build");
    expect(result.warnings).toContain(
      "package.json declares yarn but lockfiles suggest pnpm; using declared package manager."
    );
  });
});
