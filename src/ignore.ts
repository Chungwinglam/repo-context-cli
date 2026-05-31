export const DEFAULT_IGNORE_DIRS = [
  ".git",
  ".repo-context",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".turbo",
  ".venv",
  "venv",
  "__pycache__",
  "target",
  "vendor"
];

export function isIgnoredDirectory(name: string): boolean {
  return DEFAULT_IGNORE_DIRS.includes(name);
}
