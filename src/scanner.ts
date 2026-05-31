import ignore, { type Ignore } from "ignore";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { DEFAULT_IGNORE_DIRS, isIgnoredDirectory } from "./ignore.js";
import type { FileKind, ScanResult, ScannedFile } from "./model.js";

export interface ScanOptions {
  maxFiles: number;
}

export async function scanRepository(root: string, options: ScanOptions): Promise<ScanResult> {
  const files: ScannedFile[] = [];
  const excluded = new Set<string>();
  const warnings: string[] = [];
  const limit = Math.max(0, options.maxFiles) + 1;
  const gitignore = await loadRootGitignore(root, warnings);

  async function walk(directory: string): Promise<void> {
    if (files.length >= limit) {
      return;
    }

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      warnings.push(`Skipped unreadable directory: ${toRelativePath(root, directory)} (${formatError(error)})`);
      return;
    }

    entries.sort((a, b) => comparePath(a.name, b.name));

    for (const entry of entries) {
      if (files.length >= limit) {
        return;
      }

      const absolutePath = join(directory, entry.name);
      const relativePath = toRelativePath(root, absolutePath);
      if (entry.isDirectory()) {
        if (isIgnoredDirectory(entry.name)) {
          excluded.add(entry.name);
          continue;
        }
        if (isGitignored(gitignore, relativePath, true)) {
          excluded.add(relativePath);
        }
        await walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      try {
        const fileStat = await stat(absolutePath);
        const path = relativePath;
        if (isGitignored(gitignore, path, false)) {
          continue;
        }
        files.push({
          path,
          kind: classifyFile(path),
          sizeBytes: fileStat.size
        });
      } catch (error) {
        warnings.push(`Skipped unreadable file: ${toRelativePath(root, absolutePath)} (${formatError(error)})`);
      }
    }
  }

  await walk(root);

  files.sort((a, b) => comparePath(a.path, b.path));
  const maxFiles = Math.max(0, options.maxFiles);
  const truncated = files.length > maxFiles;

  return {
    files: truncated ? files.slice(0, maxFiles) : files,
    excluded: Array.from(excluded).sort((a, b) => comparePath(a, b)),
    truncated,
    warnings
  };
}

async function loadRootGitignore(root: string, warnings: string[]): Promise<Ignore | null> {
  const path = join(root, ".gitignore");
  try {
    const content = await readFile(path, "utf8");
    return ignore().add(content);
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    warnings.push(`Unable to read .gitignore (${formatError(error)}).`);
    return null;
  }
}

function isGitignored(matcher: Ignore | null, path: string, directory: boolean): boolean {
  if (!matcher) {
    return false;
  }

  const candidate = directory ? `${path}/` : path;
  return matcher.ignores(candidate);
}

export { DEFAULT_IGNORE_DIRS };

function classifyFile(path: string): FileKind {
  const lowerPath = path.toLowerCase();
  const fileName = lowerPath.split("/").at(-1) ?? lowerPath;

  if (["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"].includes(fileName)) {
    return "lockfile";
  }

  if (
    fileName === "package.json" ||
    fileName === "tsconfig.json" ||
    fileName === "vite.config.ts" ||
    fileName === "vitest.config.ts" ||
    fileName.startsWith(".") ||
    fileName.endsWith(".config.js") ||
    fileName.endsWith(".config.ts")
  ) {
    return "config";
  }

  if (fileName === "readme.md" || lowerPath.startsWith("docs/") || fileName.endsWith(".md")) {
    return "documentation";
  }

  if (
    lowerPath.includes("__tests__/") ||
    fileName.includes(".test.") ||
    fileName.includes(".spec.") ||
    lowerPath.startsWith("tests/")
  ) {
    return "test";
  }

  if (/\.(js|jsx|mjs|cjs|ts|tsx|mts|cts|go|rs|py|java)$/.test(fileName)) {
    return "source";
  }

  return "other";
}

function toRelativePath(root: string, absolutePath: string): string {
  const path = relative(root, absolutePath);
  return path === "" ? "." : path.split(sep).join("/");
}

function formatError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") {
      return code;
    }
  }

  return error instanceof Error ? error.name : "unknown error";
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
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
