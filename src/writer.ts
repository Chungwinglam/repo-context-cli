import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { GeneratedFile, WriteResult } from "./model.js";
import { GENERATED_HEADER_PREFIX } from "./renderers/markdown.js";

export interface WriteOptions {
  root: string;
  dryRun: boolean;
  force: boolean;
}

export async function writeGeneratedFiles(files: GeneratedFile[], options: WriteOptions): Promise<WriteResult[]> {
  const results: WriteResult[] = [];
  const root = resolve(options.root);

  for (const file of files) {
    const absolutePath = resolve(root, file.path);
    if (!isPathInside(root, absolutePath)) {
      throw new Error(`Generated file path escapes repository root: ${file.path}`);
    }

    if (options.dryRun) {
      results.push({ path: file.path, status: "planned" });
      continue;
    }

    if (existsSync(absolutePath)) {
      const existing = await readFile(absolutePath, "utf8");
      const generated = isGeneratedFileContent(file.path, existing);

      if (!generated && !options.force) {
        results.push({
          path: file.path,
          status: "skipped",
          reason: "existing file is not marked as generated; pass --force to overwrite"
        });
        continue;
      }

      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.content, "utf8");
      results.push({ path: file.path, status: "overwritten" });
      continue;
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");
    results.push({ path: file.path, status: "written" });
  }

  return results;
}

function isPathInside(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

function isGeneratedFileContent(path: string, content: string): boolean {
  if (content.startsWith(GENERATED_HEADER_PREFIX)) {
    return true;
  }

  if (!path.endsWith(".json")) {
    return false;
  }

  try {
    const parsed = JSON.parse(content) as { generatedBy?: unknown; schemaVersion?: unknown };
    return parsed.generatedBy === "Repo Context CLI" && parsed.schemaVersion === 1;
  } catch {
    return false;
  }
}
