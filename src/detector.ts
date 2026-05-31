import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import type { DetectionResult, DetectionSignal, PackageManager, ProjectCommands } from "./model.js";

interface PackageJson {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
}

export async function detectProject(root: string): Promise<DetectionResult> {
  const packageRead = await readPackageJson(root);
  const packageJson = packageRead.packageJson;
  const hasTsconfig = await exists(join(root, "tsconfig.json"));
  const packageManager = await detectPackageManager(root, packageJson);
  const stacks: string[] = [];
  const signals: DetectionSignal[] = [];
  const warnings: string[] = [...packageRead.warnings];

  if (packageJson) {
    stacks.push("node");
    signals.push({
      source: "package.json",
      description: "Detected Node.js project"
    });
  }

  if (hasTsconfig) {
    stacks.push("typescript");
    signals.push({
      source: "tsconfig.json",
      description: "Detected TypeScript configuration"
    });
  }

  const commands = inferCommands(packageManager, packageJson);

  if (!packageJson && !packageRead.exists) {
    warnings.push("No package.json detected; command inference is limited.");
  }

  return {
    project: {
      name: packageJson?.name ?? basename(root),
      packageManager,
      stacks
    },
    commands,
    signals,
    warnings
  };
}

async function readPackageJson(root: string): Promise<{ packageJson: PackageJson | null; exists: boolean; warnings: string[] }> {
  const packagePath = join(root, "package.json");

  try {
    return {
      packageJson: JSON.parse(await readFile(packagePath, "utf8")) as PackageJson,
      exists: true,
      warnings: []
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        packageJson: null,
        exists: false,
        warnings: []
      };
    }

    if (error instanceof SyntaxError) {
      return {
        packageJson: null,
        exists: true,
        warnings: ["package.json is not valid JSON; command inference is limited."]
      };
    }

    return {
      packageJson: null,
      exists: true,
      warnings: ["Unable to read package.json; command inference is limited."]
    };
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

async function detectPackageManager(root: string, packageJson: PackageJson | null): Promise<PackageManager | null> {
  const declared = parseDeclaredPackageManager(packageJson?.packageManager);
  if (declared) {
    return declared;
  }

  if (await exists(join(root, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await exists(join(root, "yarn.lock"))) {
    return "yarn";
  }
  if ((await exists(join(root, "bun.lock"))) || (await exists(join(root, "bun.lockb")))) {
    return "bun";
  }
  if (await exists(join(root, "package-lock.json"))) {
    return "npm";
  }

  return packageJson ? "npm" : null;
}

function inferCommands(packageManager: PackageManager | null, packageJson: PackageJson | null): ProjectCommands {
  const scripts = packageJson?.scripts ?? {};
  const hasPackage = packageJson !== null;

  return {
    install: hasPackage ? installCommand(packageManager ?? "npm") : null,
    dev: scriptCommand(packageManager ?? "npm", "dev", scripts),
    build: scriptCommand(packageManager ?? "npm", "build", scripts),
    test: scriptCommand(packageManager ?? "npm", "test", scripts),
    lint: scriptCommand(packageManager ?? "npm", "lint", scripts),
    format: scriptCommand(packageManager ?? "npm", "format", scripts)
  };
}

function installCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn install";
    case "bun":
      return "bun install";
    case "npm":
      return "npm install";
  }
}

function scriptCommand(packageManager: PackageManager, script: string, scripts: Record<string, string>): string | null {
  if (!Object.prototype.hasOwnProperty.call(scripts, script)) {
    return null;
  }

  if (script === "test") {
    return `${packageManager} test`;
  }

  if (packageManager === "yarn" || packageManager === "pnpm" || packageManager === "bun") {
    return `${packageManager} ${script}`;
  }

  return `npm run ${script}`;
}

function parseDeclaredPackageManager(value: string | undefined): PackageManager | null {
  if (!value) {
    return null;
  }

  const name = value.split("@")[0];
  if (name === "npm" || name === "pnpm" || name === "yarn" || name === "bun") {
    return name;
  }

  return null;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
