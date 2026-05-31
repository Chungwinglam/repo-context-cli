import type { RepositoryContext } from "../model.js";

export function renderIndexJson(context: RepositoryContext): string {
  return `${JSON.stringify(context, null, 2)}\n`;
}
