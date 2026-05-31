import { detectProject } from "./detector.js";
import type { GeneratedFile, PackOptions, PackResult, RepositoryContext } from "./model.js";
import { renderIndexJson } from "./renderers/json.js";
import { renderAgentsMarkdown, renderProjectMapMarkdown, renderTestingMarkdown } from "./renderers/markdown.js";
import { scanRepository } from "./scanner.js";
import { writeGeneratedFiles } from "./writer.js";

export async function createContextPackage(options: PackOptions): Promise<PackResult> {
  const scan = await scanRepository(options.root, { maxFiles: options.maxFiles });
  const detection = await detectProject(options.root);
  const warnings = [...scan.warnings, ...detection.warnings];

  if (scan.truncated) {
    warnings.push(`File index truncated to ${options.maxFiles} files.`);
  }

  const context: RepositoryContext = {
    schemaVersion: 1,
    generatedBy: "Repo Context CLI",
    generatedAt: new Date().toISOString(),
    root: ".",
    target: options.target,
    project: detection.project,
    commands: detection.commands,
    files: scan.files,
    excluded: scan.excluded,
    truncated: scan.truncated,
    warnings,
    signals: detection.signals
  };

  const generatedFiles = buildGeneratedFiles(context, options.outputDir);
  const writes = await writeGeneratedFiles(generatedFiles, {
    root: options.root,
    dryRun: options.dryRun,
    force: options.force
  });

  const skippedWarnings = writes
    .filter((write) => write.status === "skipped")
    .map((write) => `${write.path}: ${write.reason ?? "skipped"}`);

  return {
    context,
    writes,
    warnings: [...warnings, ...skippedWarnings]
  };
}

function buildGeneratedFiles(context: RepositoryContext, outputDir: string): GeneratedFile[] {
  const normalizedOutput = normalizeOutputDir(outputDir);

  return [
    {
      path: "AGENTS.md",
      content: renderAgentsMarkdown(context)
    },
    {
      path: "PROJECT_MAP.md",
      content: renderProjectMapMarkdown(context)
    },
    {
      path: "TESTING.md",
      content: renderTestingMarkdown(context)
    },
    {
      path: `${normalizedOutput}/index.json`,
      content: renderIndexJson(context)
    }
  ];
}

function normalizeOutputDir(outputDir: string): string {
  const rawOutput = outputDir.replace(/\\/g, "/").trim();
  if (rawOutput.startsWith("/") || /^[A-Za-z]:\//.test(rawOutput)) {
    throw new Error("--output must be a relative directory inside the repository");
  }

  const segments = rawOutput.split("/").filter((segment) => segment.length > 0 && segment !== ".");
  if (segments.some((segment) => segment === "..")) {
    throw new Error("--output must be a relative directory inside the repository");
  }

  return segments.join("/") || ".repo-context";
}
