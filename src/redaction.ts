import type { MonorepoInfo, ProjectCommands, RedactionSummary } from "./model.js";

const SECRET_DIRECTORIES = new Set([".aws", ".azure", ".gnupg", ".gpg", ".kube", ".ssh"]);
const SECRET_FILE_NAMES = new Set([
  ".npmrc",
  ".netrc",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
  "id_rsa",
  "known_hosts"
]);
const SAFE_ENV_TEMPLATES = new Set([".env.dist", ".env.example", ".env.sample", ".env.template"]);

const SECRET_EXTENSIONS = /\.(key|p12|pfx|pem)$/i;
const ASSIGNMENT_PATTERN = /(^|[\s;&|])([A-Za-z_][A-Za-z0-9_]*)=(?:"[^"]*"|'[^']*'|[^\s;&|]+)/g;
const URL_CREDENTIAL_PATTERN = /\b([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^:@/\s]+):([^@/\s]+)@/g;

export function emptyRedactionSummary(): RedactionSummary {
  return {
    secretLikePaths: 0,
    commandValues: 0
  };
}

export function isSecretLikePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  const segments = normalized.split("/").filter(Boolean);

  if (segments.some((segment) => SECRET_DIRECTORIES.has(segment))) {
    return true;
  }

  if (segments.some(isSecretEnvSegment)) {
    return true;
  }

  const fileName = segments.at(-1) ?? normalized;
  return SECRET_FILE_NAMES.has(fileName) || SECRET_EXTENSIONS.test(fileName);
}

export function redactProjectCommands(commands: ProjectCommands): { commands: ProjectCommands; redactedValues: number } {
  let redactedValues = 0;

  function redact(command: string | null): string | null {
    if (command === null) {
      return null;
    }

    const assignmentRedacted = command.replace(ASSIGNMENT_PATTERN, (match, prefix: string, name: string) => {
      if (!isSecretVariableName(name)) {
        return match;
      }

      redactedValues += 1;
      return `${prefix}${name}=<redacted>`;
    });

    return assignmentRedacted.replace(URL_CREDENTIAL_PATTERN, (_match, scheme: string) => {
      redactedValues += 1;
      return `${scheme}<redacted>:<redacted>@`;
    });
  }

  return {
    commands: {
      install: redact(commands.install),
      dev: redact(commands.dev),
      build: redact(commands.build),
      test: redact(commands.test),
      lint: redact(commands.lint),
      format: redact(commands.format)
    },
    redactedValues
  };
}

export function redactMonorepoInfo(monorepo: MonorepoInfo): { monorepo: MonorepoInfo; redactedPaths: number } {
  const workspaceGlobs = redactPathList(monorepo.workspaceGlobs);
  const packageRoots = redactPathList(monorepo.packageRoots);
  const tools = [...monorepo.tools];

  return {
    monorepo: {
      detected: tools.length > 0 || workspaceGlobs.values.length > 0 || packageRoots.values.length > 0,
      tools,
      workspaceGlobs: workspaceGlobs.values,
      packageRoots: packageRoots.values
    },
    redactedPaths: workspaceGlobs.redacted + packageRoots.redacted
  };
}

function redactPathList(paths: string[]): { values: string[]; redacted: number } {
  const values: string[] = [];
  let redacted = 0;

  for (const path of paths) {
    if (isSecretLikePath(path)) {
      redacted += 1;
      continue;
    }

    values.push(path);
  }

  return { values, redacted };
}

function isSecretEnvSegment(segment: string): boolean {
  if (segment === ".env") {
    return true;
  }

  return segment.startsWith(".env.") && !SAFE_ENV_TEMPLATES.has(segment);
}

function isSecretVariableName(name: string): boolean {
  const normalized = name.toUpperCase();
  return (
    hasToken(normalized, "TOKEN") ||
    hasToken(normalized, "SECRET") ||
    hasToken(normalized, "PASSWORD") ||
    hasToken(normalized, "PASS") ||
    hasToken(normalized, "AUTH") ||
    hasToken(normalized, "CREDENTIAL") ||
    hasCompoundToken(normalized, "API", "KEY") ||
    hasCompoundToken(normalized, "ACCESS", "KEY") ||
    hasCompoundToken(normalized, "PRIVATE", "KEY")
  );
}

function hasToken(value: string, token: string): boolean {
  return value.split("_").includes(token);
}

function hasCompoundToken(value: string, first: string, second: string): boolean {
  const parts = value.split("_");
  return parts.includes(first) && parts.includes(second);
}
