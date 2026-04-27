import * as vscode from "vscode";

import { ExtensionFovuxClient, getAuthToken } from "../fovux/extensionClient";
import { resolveFovuxHome } from "../fovux/paths";
import { startFovuxServer } from "../fovux/serverManager";
import { deleteUserPreset, getUserPresets, saveUserPreset } from "../fovux/userPresets";
import { createWebviewHtml } from "../webviews/html";
import {
  ExportWizardModelArtifact,
  TrainingLauncherInitialState,
  WebviewToExtensionMessage,
} from "../webviews/shared/types";
import { openDashboard } from "./openDashboard";

export async function openTrainingLauncher(context: vscode.ExtensionContext): Promise<void> {
  const panel = vscode.window.createWebviewPanel(
    "fovux.trainingLauncher",
    "Fovux Training Launcher",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [context.extensionUri],
    }
  );

  panel.webview.onDidReceiveMessage((message: WebviewToExtensionMessage) => {
    if (message.type === "openPath") {
      void vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(message.path));
      return;
    }
    if (message.type === "openDashboard") {
      void openDashboard(context);
      return;
    }
    if (message.type === "startServer") {
      void startFovuxServer()
        .then(() => renderTrainingLauncher(panel, context))
        .catch((error: unknown) => {
          void vscode.window.showErrorMessage(
            error instanceof Error ? error.message : String(error)
          );
        });
      return;
    }
    if (message.type === "refreshAuthToken") {
      void getAuthToken().then((authToken) =>
        panel.webview.postMessage({ type: "authTokenUpdated", authToken })
      );
      return;
    }
    if (message.type === "saveUserPreset") {
      void saveUserPreset(context, message.preset).then((presets) =>
        panel.webview.postMessage({ type: "userPresetsUpdated", presets })
      );
      return;
    }
    if (message.type === "deleteUserPreset") {
      void deleteUserPreset(context, message.name).then((presets) =>
        panel.webview.postMessage({ type: "userPresetsUpdated", presets })
      );
    }
  });

  await renderTrainingLauncher(panel, context);
}

async function renderTrainingLauncher(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
): Promise<void> {
  const client = await ExtensionFovuxClient.create();
  const isServerReachable = await client.health();
  let initialModels: ExportWizardModelArtifact[] = [];
  let initialError: string | null = null;

  if (isServerReachable) {
    try {
      const response = await client.invokeTool<{ models: ExportWizardModelArtifact[] }>(
        "model_list",
        {}
      );
      initialModels = response.models;
    } catch (error) {
      initialError = error instanceof Error ? error.message : String(error);
    }
  } else {
    initialError = "fovux-mcp HTTP server is offline. Start `fovux-mcp serve --http --tcp` first.";
  }

  const initialState: TrainingLauncherInitialState = {
    baseUrl: client.getBaseUrl(),
    authToken: client.getAuthToken(),
    initialModels,
    fovuxHome: resolveFovuxHome(),
    initialError,
    isServerReachable,
    userPresets: getUserPresets(context),
  };

  panel.webview.html = createWebviewHtml(
    panel.webview,
    context.extensionUri,
    "webviews/trainingLauncher/main.js",
    initialState
  );
}
