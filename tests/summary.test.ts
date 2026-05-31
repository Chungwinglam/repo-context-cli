import { describe, expect, it } from "vitest";
import type { GeneratedFile, ScannedFile } from "../src/model.js";
import { buildContextSummary } from "../src/summary.js";

describe("buildContextSummary", () => {
  it("summarizes indexed files, generated files, bytes, token estimates, and largest files", () => {
    const files: ScannedFile[] = [
      { path: "src/index.ts", kind: "source", sizeBytes: 40 },
      { path: "README.md", kind: "documentation", sizeBytes: 80 },
      { path: "src/large.ts", kind: "source", sizeBytes: 120 },
      { path: "tests/app.test.ts", kind: "test", sizeBytes: 80 },
      { path: "package.json", kind: "config", sizeBytes: 60 },
      { path: "src/small.ts", kind: "source", sizeBytes: 10 }
    ];
    const generatedFiles: GeneratedFile[] = [
      { path: "AGENTS.md", content: "éé" },
      { path: ".repo-context/index.json", content: "hello\n" }
    ];

    const summary = buildContextSummary(files, generatedFiles);

    expect(summary).toEqual({
      scope: "planned-generated-content",
      indexedFiles: 6,
      indexedBytes: 390,
      generatedFiles: 2,
      generatedBytes: 10,
      estimatedTokens: 2,
      largestFiles: [
        { path: "src/large.ts", kind: "source", sizeBytes: 120 },
        { path: "README.md", kind: "documentation", sizeBytes: 80 },
        { path: "tests/app.test.ts", kind: "test", sizeBytes: 80 },
        { path: "package.json", kind: "config", sizeBytes: 60 },
        { path: "src/index.ts", kind: "source", sizeBytes: 40 }
      ]
    });
  });
});
