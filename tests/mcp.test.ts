import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";

const cliPath = join(process.cwd(), "dist", "cli.js");

interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string | null;
  method?: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

type JsonRpcPayload = JsonRpcMessage | JsonRpcMessage[];

const processes: Array<ReturnType<typeof spawn>> = [];

async function createTempRepo(): Promise<string> {
  return mkdtemp(join(tmpdir(), "repo-context-mcp-"));
}

afterEach(() => {
  for (const child of processes.splice(0)) {
    if (!child.killed) {
      child.kill();
    }
  }
});

describe("repo-context MCP server", () => {
  it("supports initialize, tools/list, and read-only get_repo_context calls over stdio", async () => {
    const root = await createTempRepo();
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "mcp-app",
        scripts: {
          test: "vitest run",
          build: "vite build"
        }
      }),
      "utf8"
    );
    await writeFile(join(root, "src", "index.ts"), "export const app = true;\n", "utf8");
    await writeFile(join(root, ".env"), "TOKEN=secret\n", "utf8");

    const server = startServer(root);

    server.send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25" } });
    const initialized = await server.nextMessage();
    expect(initialized.id).toBe(1);
    expect(initialized.error).toBeUndefined();
    expect(initialized.result).toMatchObject({
      protocolVersion: "2025-11-25",
      serverInfo: {
        name: "repo-context-cli"
      },
      capabilities: {
        tools: {}
      }
    });

    server.send({ jsonrpc: "2.0", id: "old-version", method: "initialize", params: { protocolVersion: "2024-11-05" } });
    const olderVersion = await server.nextMessage();
    expect(olderVersion.id).toBe("old-version");
    expect(olderVersion.result).toMatchObject({
      protocolVersion: "2025-11-25"
    });

    server.send({ jsonrpc: "2.0", method: "notifications/initialized" });
    server.send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const tools = await server.nextMessage();
    expect(tools.id).toBe(2);
    expect(tools.error).toBeUndefined();
    expect(tools.result).toMatchObject({
      tools: [
        {
          name: "get_repo_context"
        }
      ]
    });

    server.send({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_repo_context",
        arguments: {
          target: "cursor",
          maxFiles: 10
        }
      }
    });
    const toolResult = await server.nextMessage();
    expect(toolResult.id).toBe(3);
    expect(toolResult.error).toBeUndefined();
    expect(toolResult.result).toMatchObject({
      isError: false,
      structuredContent: {
        context: {
          target: "cursor",
          project: {
            name: "mcp-app"
          },
          redactions: {
            secretLikePaths: 1
          }
        }
      }
    });
    expect(JSON.stringify(toolResult.result)).not.toContain(".env");
    const textContent = getFirstTextContent(toolResult.result);
    expect(JSON.parse(textContent)).toMatchObject({
      context: {
        project: {
          name: "mcp-app"
        }
      }
    });
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(root, ".repo-context", "index.json"))).toBe(false);
  });

  it("returns JSON-RPC errors for unknown tools without writing files", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "README.md"), "# Notes\n", "utf8");
    const server = startServer(root);

    server.send({ jsonrpc: "2.0", id: "bad-tool", method: "tools/call", params: { name: "write_files" } });

    const response = await server.nextMessage();
    expect(response.id).toBe("bad-tool");
    expect(response.error).toMatchObject({
      code: -32602,
      message: expect.stringContaining("Unknown tool")
    });
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
  });

  it("returns method-not-found errors for unknown JSON-RPC methods", async () => {
    const root = await createTempRepo();
    const server = startServer(root);

    server.send({ jsonrpc: "2.0", id: "unknown-method", method: "prompts/list" });

    const response = await server.nextMessage();
    expect(response.id).toBe("unknown-method");
    expect(response.error).toMatchObject({
      code: -32601,
      message: expect.stringContaining("Unknown method")
    });
  });

  it("supports JSON-RPC batch requests with a single JSON array response", async () => {
    const root = await createTempRepo();
    const server = startServer(root);

    server.sendBatch([
      { jsonrpc: "2.0", id: "batch-init", method: "initialize", params: { protocolVersion: "2025-11-25" } },
      { jsonrpc: "2.0", id: "batch-tools", method: "tools/list" }
    ]);

    const response = await server.nextPayload();
    expect(Array.isArray(response)).toBe(true);
    expect((response as JsonRpcMessage[]).map((message) => message.id).sort()).toEqual(["batch-init", "batch-tools"]);
    expect(server.stdoutLines).toHaveLength(1);
  });

  it("rejects undeclared get_repo_context arguments such as root", async () => {
    const root = await createTempRepo();
    await writeFile(join(root, "README.md"), "# Notes\n", "utf8");
    const server = startServer(root);

    server.send({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_repo_context",
        arguments: {
          root: ".."
        }
      }
    });

    const response = await server.nextMessage();
    expect(response.id).toBe(4);
    expect(response.error).toMatchObject({
      code: -32602,
      message: expect.stringContaining("Unsupported get_repo_context argument")
    });
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
  });

  it("rejects JSON-RPC requests with invalid id types", async () => {
    const root = await createTempRepo();
    const server = startServer(root);

    server.send({ jsonrpc: "2.0", id: { bad: true }, method: "tools/list" });

    const response = await server.nextMessage();
    expect(response.id).toBeNull();
    expect(response.error).toMatchObject({
      code: -32600,
      message: expect.stringContaining("Invalid JSON-RPC id")
    });
  });

  it("returns parse errors while keeping stdout limited to JSON-RPC messages for malformed JSON input", async () => {
    const root = await createTempRepo();
    const server = startServer(root);

    server.writeLine("{not json");
    const parseError = await server.nextMessage();
    expect(parseError.id).toBeNull();
    expect(parseError.error).toMatchObject({
      code: -32700,
      message: expect.stringContaining("Parse error")
    });

    server.send({ jsonrpc: "2.0", id: 1, method: "tools/list" });

    const response = await server.nextMessage();
    expect(response.id).toBe(1);
    expect(response.result).toMatchObject({
      tools: [
        {
          name: "get_repo_context"
        }
      ]
    });
    expect(server.stdoutLines.every((line) => JSON.parse(line))).toBe(true);
  });
});

function startServer(cwd: string): {
  stdoutLines: string[];
  send(message: unknown): void;
  sendBatch(messages: unknown[]): void;
  writeLine(line: string): void;
  nextPayload(): Promise<JsonRpcPayload>;
  nextMessage(): Promise<JsonRpcMessage>;
} {
  const child = spawn(process.execPath, [cliPath, "mcp"], {
    cwd,
    stdio: ["pipe", "pipe", "pipe"]
  });
  processes.push(child);

  const stdoutLines: string[] = [];
  const received: JsonRpcPayload[] = [];
  const pending: Array<(message: JsonRpcPayload) => void> = [];
  let stdoutBuffer = "";

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdoutBuffer += chunk;
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      stdoutLines.push(line);
      const message = JSON.parse(line) as JsonRpcPayload;
      const resolve = pending.shift();
      if (resolve) {
        resolve(message);
      } else {
        received.push(message);
      }
    }
  });

  return {
    stdoutLines,
    send(message: unknown): void {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    },
    sendBatch(messages: unknown[]): void {
      child.stdin.write(`${JSON.stringify(messages)}\n`);
    },
    writeLine(line: string): void {
      child.stdin.write(`${line}\n`);
    },
    nextPayload(): Promise<JsonRpcPayload> {
      const message = received.shift();
      if (message) {
        return Promise.resolve(message);
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timed out waiting for MCP response")), 5000);
        pending.push((message) => {
          clearTimeout(timeout);
          resolve(message);
        });
      });
    },
    async nextMessage(): Promise<JsonRpcMessage> {
      const message = await this.nextPayload();
      if (Array.isArray(message)) {
        throw new Error("Expected single JSON-RPC message but received a batch response");
      }

      return message;
    }
  };
}

function getFirstTextContent(result: unknown): string {
  if (
    typeof result === "object" &&
    result !== null &&
    "content" in result &&
    Array.isArray((result as { content: unknown }).content)
  ) {
    const [first] = (result as { content: Array<{ text?: unknown }> }).content;
    if (typeof first?.text === "string") {
      return first.text;
    }
  }

  throw new Error("Missing text content");
}
