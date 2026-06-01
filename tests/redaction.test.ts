import { describe, expect, it } from "vitest";
import { isSecretLikePath, redactProjectCommands } from "../src/redaction.js";
import type { ProjectCommands } from "../src/model.js";

const emptyCommands: ProjectCommands = {
  install: null,
  dev: null,
  build: null,
  test: null,
  lint: null,
  format: null
};

describe("redaction", () => {
  it("detects secret-like paths while leaving templates alone", () => {
    expect(isSecretLikePath(".env")).toBe(true);
    expect(isSecretLikePath(".env.local")).toBe(true);
    expect(isSecretLikePath(".env.local/*")).toBe(true);
    expect(isSecretLikePath(".npmrc")).toBe(true);
    expect(isSecretLikePath(".ssh/id_rsa")).toBe(true);
    expect(isSecretLikePath("certs/deploy.pem")).toBe(true);
    expect(isSecretLikePath(".env.example")).toBe(false);
    expect(isSecretLikePath("src/index.ts")).toBe(false);
  });

  it("redacts sensitive command assignments and URL credentials", () => {
    const result = redactProjectCommands({
      ...emptyCommands,
      build: "API_KEY=super-secret vite build",
      test: "curl https://user:pass@example.com/health",
      lint: "MONKEY=value npm run lint"
    });

    expect(result.commands.build).toBe("API_KEY=<redacted> vite build");
    expect(result.commands.test).toBe("curl https://<redacted>:<redacted>@example.com/health");
    expect(result.commands.lint).toBe("MONKEY=value npm run lint");
    expect(result.redactedValues).toBe(2);
  });
});
