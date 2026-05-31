import type { ContextSummary, GeneratedFile, ScannedFile } from "./model.js";

const LARGEST_FILE_LIMIT = 5;

export function emptyContextSummary(): ContextSummary {
  return {
    scope: "planned-generated-content",
    indexedFiles: 0,
    indexedBytes: 0,
    generatedFiles: 0,
    generatedBytes: 0,
    estimatedTokens: 0,
    largestFiles: []
  };
}

export function buildContextSummary(files: ScannedFile[], generatedFiles: GeneratedFile[]): ContextSummary {
  const indexedBytes = files.reduce((total, file) => total + file.sizeBytes, 0);
  const generatedBytes = generatedFiles.reduce(
    (total, file) => total + Buffer.byteLength(file.content, "utf8"),
    0
  );
  const generatedCharacters = generatedFiles.reduce((total, file) => total + file.content.length, 0);

  return {
    scope: "planned-generated-content",
    indexedFiles: files.length,
    indexedBytes,
    generatedFiles: generatedFiles.length,
    generatedBytes,
    estimatedTokens: Math.ceil(generatedCharacters / 4),
    largestFiles: [...files]
      .sort((left, right) => right.sizeBytes - left.sizeBytes || comparePath(left.path, right.path))
      .slice(0, LARGEST_FILE_LIMIT)
      .map((file) => ({
        path: file.path,
        kind: file.kind,
        sizeBytes: file.sizeBytes
      }))
  };
}

export function summariesEqual(left: ContextSummary, right: ContextSummary): boolean {
  return (
    left.scope === right.scope &&
    left.indexedFiles === right.indexedFiles &&
    left.indexedBytes === right.indexedBytes &&
    left.generatedFiles === right.generatedFiles &&
    left.generatedBytes === right.generatedBytes &&
    left.estimatedTokens === right.estimatedTokens &&
    left.largestFiles.length === right.largestFiles.length &&
    left.largestFiles.every((file, index) => {
      const rightFile = right.largestFiles[index];
      return (
        rightFile !== undefined &&
        file.path === rightFile.path &&
        file.kind === rightFile.kind &&
        file.sizeBytes === rightFile.sizeBytes
      );
    })
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
