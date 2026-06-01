import { detectProject } from "./detector.js";
import type { GeneratedFile, PackOptions, PackResult, RepositoryContext } from "./model.js";
import { renderIndexJson } from "./renderers/json.js";
import { renderHtmlReport } from "./renderers/html.js";
import { renderAgentsMarkdown, renderProjectMapMarkdown, renderTestingMarkdown } from "./renderers/markdown.js";
import { scanRepository } from "./scanner.js";
import { redactMonorepoInfo, redactProjectCommands } from "./redaction.js";
import { buildContextSummary, emptyContextSummary, summariesEqual } from "./summary.js";
import { writeGeneratedFiles } from "./writer.js";

export async function createContextPackage(options: PackOptions): Promise<PackResult> {
  const scan = await scanRepository(options.root, { maxFiles: options.maxFiles });
  const detection = await detectProject(options.root);
  const commandRedaction = redactProjectCommands(detection.commands);
  const monorepoRedaction = redactMonorepoInfo(detection.project.monorepo);
  const secretLikePathRedactions = scan.redactions.secretLikePaths + monorepoRedaction.redactedPaths;
  const warnings = [...scan.warnings, ...detection.warnings];

  if (scan.truncated) {
    warnings.push(`File index truncated to ${options.maxFiles} files.`);
  }

  if (secretLikePathRedactions > 0) {
    warnings.push(
      `Redacted ${secretLikePathRedactions} secret-like ${pluralize(
        "path",
        secretLikePathRedactions
      )} from the context package.`
    );
  }

  if (commandRedaction.redactedValues > 0) {
    warnings.push(
      `Redacted ${commandRedaction.redactedValues} detected command ${pluralize(
        "value",
        commandRedaction.redactedValues
      )} from the context package.`
    );
  }

  const baseContext: RepositoryContext = {
    schemaVersion: 1,
    generatedBy: "Repo Context CLI",
    generatedAt: new Date().toISOString(),
    root: ".",
    target: options.target,
    project: {
      ...detection.project,
      monorepo: monorepoRedaction.monorepo
    },
    commands: commandRedaction.commands,
    summary: emptyContextSummary(),
    files: scan.files,
    excluded: scan.excluded,
    truncated: scan.truncated,
    warnings,
    signals: detection.signals,
    redactions: {
      secretLikePaths: secretLikePathRedactions,
      commandValues: commandRedaction.redactedValues
    }
  };

  const { context, generatedFiles } = buildContextWithStableSummary(
    baseContext,
    options.outputDir,
    options.htmlReport === true
  );
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

function buildContextWithStableSummary(
  baseContext: RepositoryContext,
  outputDir: string,
  htmlReport: boolean
): { context: RepositoryContext; generatedFiles: GeneratedFile[] } {
  let context = baseContext;
  let generatedFiles = buildGeneratedFiles(context, outputDir, htmlReport);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const nextSummary = buildContextSummary(context.files, generatedFiles);
    const nextContext = { ...context, summary: nextSummary };
    const nextGeneratedFiles = buildGeneratedFiles(nextContext, outputDir, htmlReport);

    if (summariesEqual(nextSummary, context.summary)) {
      return { context: nextContext, generatedFiles: nextGeneratedFiles };
    }

    context = nextContext;
    generatedFiles = nextGeneratedFiles;
  }

  return { context, generatedFiles };
}

function buildGeneratedFiles(context: RepositoryContext, outputDir: string, htmlReport: boolean): GeneratedFile[] {
  const normalizedOutput = normalizeOutputDir(outputDir);

  const files: GeneratedFile[] = [
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

  if (htmlReport) {
    files.push({
      path: `${normalizedOutput}/report.html`,
      content: renderHtmlReport(context)
    });
  }

  return files;
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

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
