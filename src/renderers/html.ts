import type { FileKind, ProjectCommands, RepositoryContext, ScannedFile } from "../model.js";
import { GENERATED_HEADER_PREFIX, GENERATED_MARKER } from "./markdown.js";

type CountByKind = Record<FileKind, { count: number; bytes: number }>;

const fileKinds: FileKind[] = ["source", "test", "config", "documentation", "lockfile", "other"];

export function renderHtmlReport(context: RepositoryContext): string {
  const title = `Repo Context Report - ${context.project.name}`;

  return `${GENERATED_HEADER_PREFIX}; ${GENERATED_MARKER}. Command: repo-context pack --for ${context.target} --html-report. Generated at: ${context.generatedAt}. -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #172033;
      --muted: #5d6b82;
      --line: #d8dee9;
      --accent: #136f63;
      --accent-bg: #e7f5f1;
      --warning-bg: #fff7e6;
      --warning-text: #7a4d00;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }

    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 48px;
    }

    header {
      margin-bottom: 24px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 20px;
    }

    h1,
    h2,
    h3,
    p {
      margin-top: 0;
    }

    h1 {
      margin-bottom: 8px;
      font-size: 2rem;
      line-height: 1.15;
    }

    h2 {
      margin-bottom: 14px;
      font-size: 1.15rem;
    }

    h3 {
      margin-bottom: 8px;
      font-size: 1rem;
    }

    .subtitle {
      margin-bottom: 0;
      color: var(--muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    section,
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
    }

    section {
      margin-bottom: 16px;
    }

    .metric {
      margin-bottom: 4px;
      color: var(--muted);
      font-size: 0.86rem;
    }

    .value {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
    }

    .pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pill {
      border-radius: 999px;
      background: var(--accent-bg);
      color: var(--accent);
      padding: 4px 10px;
      font-size: 0.85rem;
      font-weight: 650;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      border-bottom: 1px solid var(--line);
      padding: 10px 8px;
      text-align: left;
      vertical-align: top;
    }

    th {
      color: var(--muted);
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    td code {
      overflow-wrap: anywhere;
      white-space: normal;
    }

    ul {
      margin: 0;
      padding-left: 20px;
    }

    code {
      border-radius: 4px;
      background: #edf2f7;
      padding: 2px 5px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 0.9em;
    }

    .warning {
      border-color: #f0d48a;
      background: var(--warning-bg);
      color: var(--warning-text);
    }

    .muted {
      color: var(--muted);
    }

    @media (max-width: 640px) {
      main {
        width: min(100% - 20px, 1120px);
        padding-top: 20px;
      }

      section,
      .card {
        padding: 14px;
      }

      table,
      thead,
      tbody,
      tr,
      th,
      td {
        display: block;
      }

      th {
        border-bottom: 0;
        padding-bottom: 0;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Repo Context Report</h1>
      <p class="subtitle">${escapeHtml(context.project.name)} - generated for ${escapeHtml(
        context.target
      )} - ${escapeHtml(context.generatedAt)}</p>
    </header>

    <div class="grid" aria-label="Context metrics">
      ${metricCard("Indexed files", String(context.summary.indexedFiles))}
      ${metricCard("Indexed bytes", formatBytes(context.summary.indexedBytes))}
      ${metricCard("Generated files", String(context.summary.generatedFiles))}
      ${metricCard("Estimated tokens", String(context.summary.estimatedTokens))}
    </div>

    <section>
      <h2>Project Summary</h2>
      <table>
        <tbody>
          ${factRow("Project name", context.project.name)}
          ${factRow("Package manager", context.project.packageManager ?? "not detected")}
          ${factRow("Stacks", formatList(context.project.stacks))}
          ${factRow("Monorepo", context.project.monorepo.detected ? "detected" : "not detected")}
          ${factRow("Truncated", context.truncated ? "yes" : "no")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Commands</h2>
      ${renderCommands(context.commands)}
    </section>

    <div class="grid">
      <section>
        <h2>Redactions</h2>
        <table>
          <tbody>
            ${factRow("Secret-like paths redacted", String(context.redactions.secretLikePaths))}
            ${factRow("Command values redacted", String(context.redactions.commandValues))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Monorepo</h2>
        ${renderMonorepo(context)}
      </section>
    </div>

    <div class="grid">
      <section>
        <h2>Largest Files</h2>
        ${renderFileTable(context.summary.largestFiles)}
      </section>

      <section>
        <h2>File Categories</h2>
        ${renderFileCategoryTable(context.files)}
      </section>
    </div>

    <section>
      <h2>Detection Signals</h2>
      ${renderSignals(context)}
    </section>

    ${renderWarnings(context)}
  </main>
</body>
</html>
`;
}

function metricCard(label: string, value: string): string {
  return `<div class="card"><p class="metric">${escapeHtml(label)}</p><p class="value">${escapeHtml(value)}</p></div>`;
}

function factRow(label: string, value: string): string {
  return `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
}

function renderCommands(commands: ProjectCommands): string {
  const rows: Array<[string, string | null]> = [
    ["Install", commands.install],
    ["Development", commands.dev],
    ["Build", commands.build],
    ["Test", commands.test],
    ["Lint", commands.lint],
    ["Format", commands.format]
  ];

  return `<table>
    <thead><tr><th>Command</th><th>Value</th></tr></thead>
    <tbody>
      ${rows
        .map(
          ([label, command]) =>
            `<tr><td>${escapeHtml(label)}</td><td>${
              command ? `<code>${escapeHtml(command)}</code>` : '<span class="muted">not detected</span>'
            }</td></tr>`
        )
        .join("\n")}
    </tbody>
  </table>`;
}

function renderMonorepo(context: RepositoryContext): string {
  const { monorepo } = context.project;
  if (!monorepo.detected) {
    return '<p class="muted">No monorepo signals detected.</p>';
  }

  return `<table>
    <tbody>
      ${factRow("Tools", formatList(monorepo.tools))}
      ${factRow("Workspace globs", formatList(monorepo.workspaceGlobs))}
      ${factRow("Package roots", formatList(monorepo.packageRoots))}
    </tbody>
  </table>`;
}

function renderFileTable(files: ScannedFile[]): string {
  if (files.length === 0) {
    return '<p class="muted">No files indexed.</p>';
  }

  return `<table>
    <thead><tr><th>Path</th><th>Kind</th><th>Size</th></tr></thead>
    <tbody>
      ${files
        .map(
          (file) =>
            `<tr><td><code>${escapeHtml(file.path)}</code></td><td>${escapeHtml(file.kind)}</td><td>${escapeHtml(
              formatBytes(file.sizeBytes)
            )}</td></tr>`
        )
        .join("\n")}
    </tbody>
  </table>`;
}

function renderFileCategoryTable(files: ScannedFile[]): string {
  const counts = countFilesByKind(files);

  return `<table>
    <thead><tr><th>Kind</th><th>Files</th><th>Bytes</th></tr></thead>
    <tbody>
      ${fileKinds
        .map((kind) => {
          const value = counts[kind];
          return `<tr><td>${escapeHtml(kind)}</td><td>${value.count}</td><td>${escapeHtml(formatBytes(value.bytes))}</td></tr>`;
        })
        .join("\n")}
    </tbody>
  </table>`;
}

function renderSignals(context: RepositoryContext): string {
  if (context.signals.length === 0) {
    return '<p class="muted">No strong project signals detected.</p>';
  }

  return `<ul>
    ${context.signals
      .map((signal) => `<li><code>${escapeHtml(signal.source)}</code>: ${escapeHtml(signal.description)}</li>`)
      .join("\n")}
  </ul>`;
}

function renderWarnings(context: RepositoryContext): string {
  if (context.warnings.length === 0) {
    return "";
  }

  return `<section class="warning">
    <h2>Warnings</h2>
    <ul>
      ${context.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("\n")}
    </ul>
  </section>`;
}

function countFilesByKind(files: ScannedFile[]): CountByKind {
  const counts = Object.fromEntries(fileKinds.map((kind) => [kind, { count: 0, bytes: 0 }])) as CountByKind;

  for (const file of files) {
    counts[file.kind].count += 1;
    counts[file.kind].bytes += file.sizeBytes;
  }

  return counts;
}

function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "not detected";
}

function formatBytes(bytes: number): string {
  return `${bytes.toLocaleString("en-US")} bytes`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
