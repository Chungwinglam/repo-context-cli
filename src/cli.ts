#!/usr/bin/env node
import { cwd, exit } from "node:process";
import type { AgentTarget, PackOptions, WriteResult } from "./model.js";
import { runMcpServer } from "./mcp.js";
import { createContextPackage } from "./pack.js";

interface ParsedArgs {
  command: "pack" | "mcp" | "help";
  target: AgentTarget;
  outputDir: string;
  maxFiles: number;
  dryRun: boolean;
  force: boolean;
  htmlReport: boolean;
  editorConfig: boolean;
  root: string;
  helpTopic: "main" | "mcp";
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === "help") {
    if (parsed.helpTopic === "mcp") {
      printMcpHelp();
    } else {
      printHelp();
    }
    return;
  }

  if (parsed.command === "mcp") {
    await runMcpServer({
      root: parsed.root,
      maxFiles: parsed.maxFiles
    });
    return;
  }

  const options: PackOptions = {
    root: cwd(),
    target: parsed.target,
    outputDir: parsed.outputDir,
    maxFiles: parsed.maxFiles,
    dryRun: parsed.dryRun,
    force: parsed.force,
    htmlReport: parsed.htmlReport,
    editorConfig: parsed.editorConfig
  };

  const result = await createContextPackage(options);
  printSummary(result.writes, result.warnings, parsed.dryRun);
}

function parseArgs(args: string[]): ParsedArgs {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    return defaultArgs("help");
  }

  const [command, ...flags] = args;
  if (command === "mcp") {
    return parseMcpArgs(flags);
  }

  if (command !== "pack") {
    throw new Error(`Unknown command: ${command}`);
  }

  const parsed = defaultArgs("pack");

  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];

    switch (flag) {
      case "--for":
        parsed.target = parseTarget(readFlagValue(flags, index, flag));
        index += 1;
        break;
      case "--output":
        parsed.outputDir = readFlagValue(flags, index, flag);
        index += 1;
        break;
      case "--max-files":
        parsed.maxFiles = parseMaxFiles(readFlagValue(flags, index, flag));
        index += 1;
        break;
      case "--dry-run":
        parsed.dryRun = true;
        break;
      case "--force":
        parsed.force = true;
        break;
      case "--html-report":
        parsed.htmlReport = true;
        break;
      case "--editor-config":
        parsed.editorConfig = true;
        break;
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }

  return parsed;
}

function parseMcpArgs(flags: string[]): ParsedArgs {
  if (flags.includes("--help") || flags.includes("-h")) {
    const parsed = defaultArgs("help");
    parsed.helpTopic = "mcp";
    return parsed;
  }

  const parsed = defaultArgs("mcp");

  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];

    switch (flag) {
      case "--root":
        parsed.root = readFlagValue(flags, index, flag);
        index += 1;
        break;
      case "--max-files":
        parsed.maxFiles = parseMaxFiles(readFlagValue(flags, index, flag));
        index += 1;
        break;
      default:
        throw new Error(`Unknown flag for mcp: ${flag}`);
    }
  }

  return parsed;
}

function defaultArgs(command: "pack" | "mcp" | "help"): ParsedArgs {
  return {
    command,
    target: "codex",
    outputDir: ".repo-context",
    maxFiles: 500,
    dryRun: false,
    force: false,
    htmlReport: false,
    editorConfig: false,
    root: cwd(),
    helpTopic: "main"
  };
}

function readFlagValue(flags: string[], index: number, flag: string): string {
  const value = flags[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseTarget(value: string): AgentTarget {
  if (value === "codex" || value === "claude" || value === "cursor") {
    return value;
  }

  throw new Error(`Unsupported target: ${value}`);
}

function parseMaxFiles(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("--max-files must be a non-negative integer");
  }
  return parsed;
}

function printSummary(writes: WriteResult[], warnings: string[], dryRun: boolean): void {
  const label = dryRun ? "Planned context package:" : "Context package result:";
  console.log(label);

  for (const write of writes) {
    const detail = write.reason ? ` (${write.reason})` : "";
    console.log(`- ${write.status}: ${write.path}${detail}`);
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

function printHelp(): void {
  console.log(`Usage:
  repo-context pack [--for codex|claude|cursor] [--output .repo-context] [--max-files 500] [--dry-run] [--force] [--html-report] [--editor-config]
  repo-context mcp [--root .] [--max-files 500]

Commands:
  pack    Generate repository context files
  mcp     Start a read-only stdio MCP server
`);
}

function printMcpHelp(): void {
  console.log(`Usage:
  repo-context mcp [--root .] [--max-files 500]

Options:
  --root       Repository root for this MCP server session. Defaults to the current directory.
  --max-files  Maximum number of indexed files returned by get_repo_context. Defaults to 500.

Tools:
  get_repo_context  Return redacted repository context without writing files.
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  exit(1);
});
