import { createInterface } from "node:readline";
import { stat } from "node:fs/promises";
import { stdin, stdout, stderr } from "node:process";
import { resolve } from "node:path";
import type { AgentTarget, PackResult } from "./model.js";
import { createContextPackage } from "./pack.js";

type JsonRpcId = string | number | null;

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

interface JsonRpcRequest {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

interface McpServerOptions {
  root: string;
  maxFiles: number;
}

const supportedProtocolVersion = "2025-11-25";
const serverVersion = "0.1.0";

export async function runMcpServer(options: McpServerOptions): Promise<void> {
  const root = resolve(options.root);
  await assertDirectory(root);
  const input = createInterface({
    input: stdin,
    crlfDelay: Infinity
  });

  input.on("line", (line) => {
    void handleLine(line, { root, maxFiles: options.maxFiles });
  });

  await new Promise<void>((resolvePromise) => {
    input.on("close", resolvePromise);
  });
}

async function handleLine(line: string, options: McpServerOptions): Promise<void> {
  if (line.trim().length === 0) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    writeError(null, -32700, "Parse error");
    return;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      writeError(null, -32600, "Invalid JSON-RPC batch");
      return;
    }

    const responses: JsonRpcResponse[] = [];
    for (const item of parsed) {
      const response = await handleParsedMessage(item, options);
      if (response) {
        responses.push(response);
      }
    }

    if (responses.length > 0) {
      writeMessage(responses);
    }
    return;
  }

  const response = await handleParsedMessage(parsed, options);
  if (response) {
    writeMessage(response);
  }
}

async function handleParsedMessage(parsed: unknown, options: McpServerOptions): Promise<JsonRpcResponse | null> {
  if (!isObject(parsed)) {
    return errorMessage(null, -32600, "Invalid JSON-RPC request");
  }

  if (parsed.jsonrpc !== "2.0" || typeof parsed.method !== "string") {
    if ("id" in parsed) {
      return errorMessage(normalizeId(parsed.id), -32600, "Invalid JSON-RPC request");
    }
    return null;
  }

  if ("id" in parsed && !isValidId(parsed.id)) {
    return errorMessage(null, -32600, "Invalid JSON-RPC id");
  }

  if (!("id" in parsed)) {
    handleNotification(parsed.method);
    return null;
  }

  const id = normalizeId(parsed.id);
  try {
    const result = await handleRequest(parsed.method, parsed.params, options);
    return resultMessage(id, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorMessage(id, error instanceof JsonRpcError ? error.code : -32602, message);
  }
}

function handleNotification(method: string): void {
  if (method !== "notifications/initialized") {
    stderr.write(`Ignoring MCP notification: ${method}\n`);
  }
}

async function handleRequest(method: string, params: unknown, options: McpServerOptions): Promise<unknown> {
  switch (method) {
    case "initialize":
      return initializeResult(params);
    case "tools/list":
      return toolsListResult();
    case "tools/call":
      return toolsCallResult(params, options);
    default:
      throw new JsonRpcError(-32601, `Unknown method: ${method}`);
  }
}

function initializeResult(_params: unknown): unknown {
  return {
    protocolVersion: supportedProtocolVersion,
    capabilities: {
      tools: {}
    },
    serverInfo: {
      name: "repo-context-cli",
      version: serverVersion
    }
  };
}

function toolsListResult(): unknown {
  return {
    tools: [
      {
        name: "get_repo_context",
        title: "Get repository context",
        description:
          "Scan the configured repository root and return a redacted Repo Context CLI context package without writing files.",
        annotations: {
          readOnlyHint: true,
          destructiveHint: false
        },
        inputSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            target: {
              type: "string",
              enum: ["codex", "claude", "cursor"],
              description: "AI coding agent target. Defaults to codex."
            },
            maxFiles: {
              type: "integer",
              minimum: 0,
              description: "Maximum number of indexed files. Defaults to the server --max-files value."
            }
          }
        }
      }
    ]
  };
}

async function toolsCallResult(params: unknown, options: McpServerOptions): Promise<unknown> {
  const call = parseToolCall(params);
  if (call.name !== "get_repo_context") {
    throw new Error(`Unknown tool: ${call.name}`);
  }

  const args = parseToolArguments(call.arguments, options.maxFiles);
  const result = await createContextPackage({
    root: options.root,
    target: args.target,
    outputDir: ".repo-context",
    maxFiles: args.maxFiles,
    dryRun: true,
    force: false,
    htmlReport: false
  });

  return {
    content: [
      {
        type: "text",
        text: renderToolJson(result)
      }
    ],
    structuredContent: {
      context: result.context,
      writes: result.writes,
      warnings: result.warnings
    },
    isError: false
  };
}

function parseToolCall(params: unknown): { name: string; arguments: unknown } {
  if (!isObject(params) || typeof params.name !== "string") {
    throw new Error("tools/call requires a string tool name");
  }

  return {
    name: params.name,
    arguments: params.arguments
  };
}

function parseToolArguments(args: unknown, defaultMaxFiles: number): { target: AgentTarget; maxFiles: number } {
  if (args === undefined) {
    return { target: "codex", maxFiles: defaultMaxFiles };
  }

  if (!isObject(args)) {
    throw new Error("get_repo_context arguments must be an object");
  }

  for (const key of Object.keys(args)) {
    if (key !== "target" && key !== "maxFiles") {
      throw new Error(`Unsupported get_repo_context argument: ${key}`);
    }
  }

  return {
    target: parseTarget(args.target),
    maxFiles: parseMaxFiles(args.maxFiles, defaultMaxFiles)
  };
}

function parseTarget(value: unknown): AgentTarget {
  if (value === undefined) {
    return "codex";
  }

  if (value === "codex" || value === "claude" || value === "cursor") {
    return value;
  }

  throw new Error("target must be one of codex, claude, cursor");
}

function parseMaxFiles(value: unknown, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("maxFiles must be a non-negative integer");
  }

  return value;
}

function renderToolJson(result: PackResult): string {
  return JSON.stringify(
    {
      context: result.context,
      writes: result.writes,
      warnings: result.warnings
    },
    null,
    2
  );
}

function writeError(id: JsonRpcId, code: number, message: string): void {
  writeMessage(errorMessage(id, code, message));
}

function resultMessage(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}

function errorMessage(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message
    }
  };
}

function writeMessage(message: unknown): void {
  stdout.write(`${JSON.stringify(message)}\n`);
}

function normalizeId(value: unknown): JsonRpcId {
  return isValidId(value) ? value : null;
}

function isValidId(value: unknown): value is JsonRpcId {
  return value === null || typeof value === "string" || typeof value === "number";
}

class JsonRpcError extends Error {
  constructor(readonly code: number, message: string) {
    super(message);
  }
}

async function assertDirectory(path: string): Promise<void> {
  try {
    const stats = await stat(path);
    if (!stats.isDirectory()) {
      throw new Error("--root must point to an existing directory");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "--root must point to an existing directory") {
      throw error;
    }

    throw new Error("--root must point to an existing directory");
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
