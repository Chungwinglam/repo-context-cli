import type { RepositoryContext } from "../model.js";
import { GENERATED_HEADER_PREFIX, GENERATED_MARKER } from "./markdown.js";

export interface EditorRenderOptions {
  outputDir: string;
}

export function renderEditorReadme(context: RepositoryContext, options: EditorRenderOptions): string {
  const indexPath = indexPathFor(options.outputDir);
  const refreshCommand = refreshCommandFor(context, options.outputDir);
  return `${header(context, options)}
# Editor Integration Guide

## Project Context

- Project name: ${context.project.name}
- Context target: ${context.target}
- Machine-readable index: \`${indexPath}\`

## Context Files

${renderContextFiles(indexPath)}

## Refresh

\`\`\`bash
${refreshCommand}
\`\`\`

This command refreshes the machine-readable files and editor guides in \`${options.outputDir}\`.

## Safety

- Repo Context CLI writes static guide files only.
- This output does not modify editor settings automatically.
- This output does not create \`.vscode/settings.json\` or \`.cursor/rules\`.
`;
}

export function renderCursorGuide(context: RepositoryContext, options: EditorRenderOptions): string {
  const indexPath = indexPathFor(options.outputDir);
  return `${header(context, options)}
# Cursor Guide

Use these generated files as project context for Cursor-assisted edits.

## Recommended Context

${renderContextFiles(indexPath)}

## Optional Live Context

Cursor-compatible MCP clients can start the read-only server with:

\`\`\`bash
npx repo-context-cli mcp
\`\`\`

The MCP server exposes \`get_repo_context\` and does not write generated files.

## Safety

- This guide is static documentation for Cursor workflows.
- Repo Context CLI does not modify editor settings automatically.
- This output does not create \`.cursor/rules\`.
`;
}

export function renderVsCodeGuide(context: RepositoryContext, options: EditorRenderOptions): string {
  const indexPath = indexPathFor(options.outputDir);
  return `${header(context, options)}
# VS Code Guide

Use these generated files with AI extensions or workflows that can read workspace files.

## Recommended Context

${renderContextFiles(indexPath)}

## Optional MCP Server

AI extensions or clients that support MCP can start the read-only server with:

\`\`\`bash
npx repo-context-cli mcp
\`\`\`

The MCP server exposes \`get_repo_context\` and does not write generated files.

## Safety

- This guide is extension-neutral and static.
- Repo Context CLI does not modify editor settings automatically.
- This output does not create \`.vscode/settings.json\`.
`;
}

function header(context: RepositoryContext, options: EditorRenderOptions): string {
  return `${GENERATED_HEADER_PREFIX}; ${GENERATED_MARKER}. Command: ${headerCommandFor(
    context,
    options.outputDir
  )}. Generated at: ${context.generatedAt}. -->\n\n`;
}

function renderContextFiles(indexPath: string): string {
  return [
    "- `AGENTS.md` for AI-agent operating rules.",
    "- `PROJECT_MAP.md` for repository structure and detected facts.",
    "- `TESTING.md` for detected development and verification commands.",
    `- \`${indexPath}\` for machine-readable context.`
  ].join("\n");
}

function indexPathFor(outputDir: string): string {
  return `${outputDir}/index.json`;
}

function refreshCommandFor(context: RepositoryContext, outputDir: string): string {
  const outputFlag = outputDir === ".repo-context" ? "" : ` --output ${outputDir}`;
  return `npx repo-context-cli pack --for ${context.target}${outputFlag} --editor-config`;
}

function headerCommandFor(context: RepositoryContext, outputDir: string): string {
  const outputFlag = outputDir === ".repo-context" ? "" : ` --output ${outputDir}`;
  return `repo-context pack --for ${context.target}${outputFlag} --editor-config`;
}
