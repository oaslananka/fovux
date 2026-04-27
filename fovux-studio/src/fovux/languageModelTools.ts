import * as vscode from "vscode";

import { classifyCompat } from "./compat";
import { EmbeddedMcpClient } from "./mcpClient";
import { GRANULAR_TOOLS } from "./tools/definitions";

interface FovuxToolInvocationInput {
  tool: string;
  args?: Record<string, unknown>;
}

interface GranularToolInput {
  [key: string]: unknown;
}

export function registerFovuxLanguageModelTool(context: vscode.ExtensionContext): void {
  if (!vscode.lm?.registerTool) {
    return;
  }

  // Register the generic dispatcher (backward compatible)
  const genericTool: vscode.LanguageModelTool<FovuxToolInvocationInput> = {
    prepareInvocation(options) {
      return {
        invocationMessage: `Running Fovux tool ${options.input.tool}`,
        confirmationMessages: {
          title: "Run Fovux MCP tool?",
          message: `Fovux Studio will call ${options.input.tool} on your local fovux-mcp server.`,
        },
      };
    },
    async invoke(options) {
      const result = await new EmbeddedMcpClient().callTool<unknown>(
        options.input.tool,
        options.input.args ?? {}
      );
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(result, null, 2)),
      ]);
    },
  };

  context.subscriptions.push(vscode.lm.registerTool("fovux_callTool", genericTool));

  // Register granular tools
  for (const definition of GRANULAR_TOOLS) {
    const granularTool: vscode.LanguageModelTool<GranularToolInput> = {
      prepareInvocation(options) {
        return {
          invocationMessage: `Running ${definition.displayName}`,
          confirmationMessages: {
            title: `Run ${definition.displayName}?`,
            message: `Fovux Studio will call ${definition.mcpToolName} on your local fovux-mcp server.`,
          },
        };
      },
      async invoke(options) {
        // Check server compatibility before proceeding
        const client = new EmbeddedMcpClient();
        const result = await client.callTool<unknown>(
          definition.mcpToolName,
          options.input
        );
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(result, null, 2)),
        ]);
      },
    };

    context.subscriptions.push(
      vscode.lm.registerTool(definition.name, granularTool)
    );
  }
}
