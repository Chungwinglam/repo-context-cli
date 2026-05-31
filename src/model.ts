export type AgentTarget = "codex" | "claude" | "cursor";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type FileKind = "source" | "test" | "config" | "documentation" | "lockfile" | "other";

export interface ScannedFile {
  path: string;
  kind: FileKind;
  sizeBytes: number;
}

export interface ScanResult {
  files: ScannedFile[];
  excluded: string[];
  truncated: boolean;
  warnings: string[];
}

export interface ProjectInfo {
  name: string;
  packageManager: PackageManager | null;
  stacks: string[];
  monorepo: MonorepoInfo;
}

export interface MonorepoInfo {
  detected: boolean;
  tools: string[];
  workspaceGlobs: string[];
  packageRoots: string[];
}

export interface ProjectCommands {
  install: string | null;
  dev: string | null;
  build: string | null;
  test: string | null;
  lint: string | null;
  format: string | null;
}

export interface DetectionSignal {
  source: string;
  description: string;
}

export interface DetectionResult {
  project: ProjectInfo;
  commands: ProjectCommands;
  signals: DetectionSignal[];
  warnings: string[];
}

export interface RepositoryContext {
  schemaVersion: 1;
  generatedBy: "Repo Context CLI";
  generatedAt: string;
  root: ".";
  target: AgentTarget;
  project: ProjectInfo;
  commands: ProjectCommands;
  summary: ContextSummary;
  files: ScannedFile[];
  excluded: string[];
  truncated: boolean;
  warnings: string[];
  signals: DetectionSignal[];
}

export interface ContextSummary {
  scope: "planned-generated-content";
  indexedFiles: number;
  indexedBytes: number;
  generatedFiles: number;
  generatedBytes: number;
  estimatedTokens: number;
  largestFiles: SummaryFile[];
}

export interface SummaryFile {
  path: string;
  kind: FileKind;
  sizeBytes: number;
}

export interface PackOptions {
  root: string;
  target: AgentTarget;
  outputDir: string;
  maxFiles: number;
  dryRun: boolean;
  force: boolean;
}

export type WriteStatus = "planned" | "written" | "overwritten" | "skipped";

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface WriteResult {
  path: string;
  status: WriteStatus;
  reason?: string;
}

export interface PackResult {
  context: RepositoryContext;
  writes: WriteResult[];
  warnings: string[];
}
