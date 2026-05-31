import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import type { DetectionResult, DetectionSignal, MonorepoInfo, PackageManager, ProjectCommands } from "./model.js";

interface PackageJson {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
}

export async function detectProject(root: string): Promise<DetectionResult> {
  const packageRead = await readPackageJson(root);
  const packageJson = packageRead.packageJson;
  const hasTsconfig = await exists(join(root, "tsconfig.json"));
  const packageManagerDetection = await detectPackageManager(root, packageJson);
  const packageManager = packageManagerDetection.packageManager;
  const stacks: string[] = [];
  const signals: DetectionSignal[] = [];
  const warnings: string[] = [...packageRead.warnings, ...packageManagerDetection.warnings];
  const monorepoDetection = await detectMonorepo(root, packageJson);
  const languageDetection = await detectLanguageStacks(root);

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

  stacks.push(...languageDetection.stacks.filter((stack) => !stacks.includes(stack)));
  signals.push(...languageDetection.signals);
  signals.push(...monorepoDetection.signals);

  const commands = inferCommands(packageManager, packageJson);

  if (!packageJson && !packageRead.exists) {
    warnings.push("No package.json detected; command inference is limited.");
  }

  return {
    project: {
      name: packageJson?.name ?? basename(root),
      packageManager,
      stacks,
      monorepo: monorepoDetection.monorepo
    },
    commands,
    signals,
    warnings
  };
}

interface MonorepoDetection {
  monorepo: MonorepoInfo;
  signals: DetectionSignal[];
}

interface StackDetection {
  stacks: string[];
  signals: DetectionSignal[];
}

const LANGUAGE_MARKERS: Array<{ stack: string; files: string[]; description: string }> = [
  {
    stack: "python",
    files: ["pyproject.toml", "requirements.txt", "setup.py"],
    description: "Detected Python project"
  },
  {
    stack: "rust",
    files: ["Cargo.toml"],
    description: "Detected Rust project"
  },
  {
    stack: "go",
    files: ["go.mod"],
    description: "Detected Go project"
  }
];

async function detectLanguageStacks(root: string): Promise<StackDetection> {
  const stacks: string[] = [];
  const signals: DetectionSignal[] = [];

  for (const marker of LANGUAGE_MARKERS) {
    const matchedFiles: string[] = [];
    for (const file of marker.files) {
      if (await fileExists(join(root, file))) {
        matchedFiles.push(file);
      }
    }

    if (matchedFiles.length === 0) {
      continue;
    }

    stacks.push(marker.stack);
    for (const file of matchedFiles) {
      signals.push({
        source: file,
        description: marker.description
      });
    }
  }

  const javaSignals = await detectJavaSignals(root);
  if (javaSignals.length > 0) {
    stacks.push("java");
    signals.push(...javaSignals);
  }

  return { stacks, signals };
}

async function detectJavaSignals(root: string): Promise<DetectionSignal[]> {
  const signals: DetectionSignal[] = [];

  if (await fileExists(join(root, "pom.xml"))) {
    signals.push({
      source: "pom.xml",
      description: "Detected Java project"
    });
  }

  for (const file of ["build.gradle", "build.gradle.kts"]) {
    const filePath = join(root, file);
    const content = await readTextFileIfPresent(filePath);
    if (content !== null && hasExplicitGradleJavaPlugin(content)) {
      signals.push({
        source: file,
        description: "Detected Java project"
      });
    }
  }

  return signals;
}

function hasExplicitGradleJavaPlugin(content: string): boolean {
  const uncommented = stripGradleComments(content);

  return (
    /id\s*\(?\s*["']java(?:-library)?["']/.test(uncommented) ||
    /apply\s+plugin:\s*["']java(?:-library)?["']/.test(uncommented) ||
    /`java(?:-library)?`/.test(uncommented) ||
    /plugins\s*\{[^}]*?(?:^|[\s;{])java(?:[\s;}])[^}]*\}/m.test(uncommented)
  );
}

function stripGradleComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

async function detectMonorepo(root: string, packageJson: PackageJson | null): Promise<MonorepoDetection> {
  const tools: string[] = [];
  const workspaceGlobs: string[] = [];
  const packageRoots = await detectPackageRoots(root, ["packages/*", "apps/*"]);
  const signals: DetectionSignal[] = [];

  const npmWorkspaces = normalizeWorkspaceGlobs(packageJson?.workspaces);
  if (npmWorkspaces.length > 0) {
    tools.push("npm-workspaces");
    workspaceGlobs.push(...npmWorkspaces);
    signals.push({
      source: "package.json#workspaces",
      description: "Detected npm workspaces"
    });
  }

  const pnpmWorkspaces = await readPnpmWorkspaceGlobs(root);
  if (pnpmWorkspaces.length > 0) {
    tools.push("pnpm-workspace");
    workspaceGlobs.push(...pnpmWorkspaces);
    signals.push({
      source: "pnpm-workspace.yaml",
      description: "Detected pnpm workspace"
    });
  }

  if (await exists(join(root, "turbo.json"))) {
    tools.push("turbo");
    signals.push({
      source: "turbo.json",
      description: "Detected Turbo configuration"
    });
  }

  if (await exists(join(root, "nx.json"))) {
    tools.push("nx");
    signals.push({
      source: "nx.json",
      description: "Detected Nx configuration"
    });
  }

  if (tools.length === 0 && packageRoots.length > 0) {
    tools.push("package-layout");
    signals.push({
      source: "packages/* and apps/*",
      description: "Detected package roots in common monorepo directories"
    });
  }

  const normalizedTools = uniqueSortedByFirstSeen(tools);
  const normalizedGlobs = uniqueSortedByFirstSeen(workspaceGlobs);

  return {
    monorepo: {
      detected: normalizedTools.length > 0 || normalizedGlobs.length > 0 || packageRoots.length > 0,
      tools: normalizedTools,
      workspaceGlobs: normalizedGlobs,
      packageRoots
    },
    signals
  };
}

function normalizeWorkspaceGlobs(workspaces: PackageJson["workspaces"]): string[] {
  if (Array.isArray(workspaces)) {
    return workspaces.filter(isNonEmptyString);
  }

  if (workspaces && Array.isArray(workspaces.packages)) {
    return workspaces.packages.filter(isNonEmptyString);
  }

  return [];
}

async function readPnpmWorkspaceGlobs(root: string): Promise<string[]> {
  try {
    return parsePnpmWorkspaceYaml(await readFile(join(root, "pnpm-workspace.yaml"), "utf8"));
  } catch (error) {
    return isMissingFileError(error) ? [] : [];
  }
}

function parsePnpmWorkspaceYaml(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const globs: string[] = [];
  let inPackages = false;

  for (const line of lines) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }

    if (inPackages && /^\S/.test(line)) {
      break;
    }

    if (!inPackages) {
      continue;
    }

    const match = line.match(/^\s*-\s*(.+?)\s*$/);
    if (!match) {
      continue;
    }

    const value = stripYamlString(match[1] ?? "");
    if (value) {
      globs.push(value);
    }
  }

  return globs;
}

function stripYamlString(value: string): string {
  const withoutComment = value.replace(/\s+#.*$/, "").trim();
  return withoutComment.replace(/^['"]|['"]$/g, "");
}

async function detectPackageRoots(root: string, globs: string[]): Promise<string[]> {
  const roots = new Set<string>();

  for (const glob of globs) {
    const match = glob.match(/^([^*?[\]{}!]+)\/\*$/);
    if (!match) {
      continue;
    }

    const directory = match[1]?.replace(/\/+$/, "");
    if (!directory || directory.includes("..")) {
      continue;
    }

    for (const child of await listChildDirectories(join(root, directory))) {
      const packageRoot = `${directory}/${child}`;
      if (await exists(join(root, packageRoot, "package.json"))) {
        roots.add(packageRoot);
      }
    }
  }

  return Array.from(roots).sort((a, b) => comparePath(a, b));
}

async function listChildDirectories(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => comparePath(a, b));
  } catch {
    return [];
  }
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

interface PackageManagerDetection {
  packageManager: PackageManager | null;
  warnings: string[];
}

async function detectPackageManager(root: string, packageJson: PackageJson | null): Promise<PackageManagerDetection> {
  const declared = parseDeclaredPackageManager(packageJson?.packageManager);
  const lockfileManagers = await detectLockfileManagers(root);
  const warnings = buildPackageManagerWarnings(declared, lockfileManagers);

  if (declared) {
    return { packageManager: declared, warnings };
  }

  if (lockfileManagers.length > 0) {
    return { packageManager: lockfileManagers[0] ?? null, warnings };
  }

  return { packageManager: packageJson ? "npm" : null, warnings };
}

async function detectLockfileManagers(root: string): Promise<PackageManager[]> {
  const managers: PackageManager[] = [];

  if (await exists(join(root, "package-lock.json"))) {
    managers.push("npm");
  }
  if (await exists(join(root, "pnpm-lock.yaml"))) {
    managers.push("pnpm");
  }
  if (await exists(join(root, "yarn.lock"))) {
    managers.push("yarn");
  }
  if ((await exists(join(root, "bun.lock"))) || (await exists(join(root, "bun.lockb")))) {
    managers.push("bun");
  }

  return managers;
}

function buildPackageManagerWarnings(
  declared: PackageManager | null,
  lockfileManagers: PackageManager[]
): string[] {
  const warnings: string[] = [];

  if (declared && lockfileManagers.length > 0 && !lockfileManagers.includes(declared)) {
    warnings.push(
      `package.json declares ${declared} but lockfiles suggest ${lockfileManagers.join(", ")}; using declared package manager.`
    );
  }

  if (lockfileManagers.length > 1) {
    warnings.push(
      `Multiple package-manager lockfiles detected: ${lockfileManagers.join(", ")}. Verify the intended package manager.`
    );
  }

  return warnings;
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

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function readTextFileIfPresent(path: string): Promise<string | null> {
  if (!(await fileExists(path))) {
    return null;
  }

  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function uniqueSortedByFirstSeen(values: string[]): string[] {
  return Array.from(new Set(values));
}

function comparePath(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}
