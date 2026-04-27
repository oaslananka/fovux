/**
 * Fovux Studio — VS Code extension entry point.
 *
 * Activates the Fovux activity bar, registers commands, and starts
 * the run directory watcher.
 */

import * as vscode from "vscode";
import { openCompareRuns } from "./commands/compareRuns";
import { openAnnotationEditor } from "./commands/openAnnotationEditor";
import { openDashboard } from "./commands/openDashboard";
import { openDatasetInspector } from "./commands/openDatasetInspector";
import { openExportWizard } from "./commands/openExportWizard";
import { openTimeline } from "./commands/openTimeline";
import { openTrainingLauncher } from "./commands/openTrainingLauncher";
import { copyRunId, deleteRun, resumeRun, stopRun, tagRun } from "./commands/runActions";
import { registerFovuxLanguageModelTool } from "./fovux/languageModelTools";
import { resolveFovuxHome, resolveFovuxProfiles } from "./fovux/paths";
import {
  disposeFovuxServerManager,
  startFovuxServer,
  stopFovuxServer,
} from "./fovux/serverManager";
import { registerWalkthroughCommands } from "./commands/walkthroughActions";
import { logger } from "./util/logger";
import { showPrivacyBadge, disposeStatusBarItems } from "./util/statusBar";
import { ExportsSummary, ExportsTreeProvider } from "./views/exportsTree";
import { ModelsSummary, ModelsTreeProvider } from "./views/modelsTree";
import { RunsSummary, RunsTreeProvider } from "./views/runsTree";

export function activate(context: vscode.ExtensionContext): void {
  logger.info("Fovux Studio activating...");
  registerFovuxLanguageModelTool(context);
  registerWalkthroughCommands(context);
  showPrivacyBadge();

  const runsProvider = new RunsTreeProvider();
  const modelsProvider = new ModelsTreeProvider();
  const exportsProvider = new ExportsTreeProvider();
  const runsView = vscode.window.createTreeView("fovux.runsView", {
    treeDataProvider: runsProvider,
    showCollapseAll: true,
  });
  const modelsView = vscode.window.createTreeView("fovux.modelsView", {
    treeDataProvider: modelsProvider,
    showCollapseAll: true,
  });
  const exportsView = vscode.window.createTreeView("fovux.exportsView", {
    treeDataProvider: exportsProvider,
    showCollapseAll: false,
  });

  const syncViews = (): void => {
    syncRunsView(runsView, runsProvider.getSummary());
    syncModelsView(modelsView, modelsProvider.getSummary());
    syncExportsView(exportsView, exportsProvider.getSummary());
  };

  syncViews();
  context.subscriptions.push(runsProvider.onDidChangeTreeData(syncViews));
  context.subscriptions.push(modelsProvider.onDidChangeTreeData(syncViews));
  context.subscriptions.push(exportsProvider.onDidChangeTreeData(syncViews));

  context.subscriptions.push(
    runsProvider,
    modelsProvider,
    exportsProvider,
    runsView,
    modelsView,
    exportsView
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fovux.startServer", () => startFovuxServer()),
    vscode.commands.registerCommand("fovux.stopServer", () => stopFovuxServer()),
    vscode.commands.registerCommand("fovux.startTraining", () => openTrainingLauncher(context)),
    vscode.commands.registerCommand("fovux.openDashboard", () => openDashboard(context)),
    vscode.commands.registerCommand("fovux.openDatasetInspector", () =>
      openDatasetInspector(context)
    ),
    vscode.commands.registerCommand("fovux.openAnnotationEditor", () =>
      openAnnotationEditor(context)
    ),
    vscode.commands.registerCommand("fovux.openExportWizard", () => openExportWizard(context)),
    vscode.commands.registerCommand("fovux.openTimeline", () => openTimeline(context)),
    vscode.commands.registerCommand("fovux.compareRuns", () => openCompareRuns(context)),
    vscode.commands.registerCommand(
      "fovux.openRunInExplorer",
      (target: string | { runPath?: string }) => {
        const runPath = typeof target === "string" ? target : target?.runPath;
        if (runPath) {
          void vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(runPath));
        }
      }
    ),
    vscode.commands.registerCommand("fovux.stopRun", (item) => stopRun(item)),
    vscode.commands.registerCommand("fovux.resumeRun", (item) => resumeRun(item)),
    vscode.commands.registerCommand("fovux.copyRunId", (item) => copyRunId(item)),
    vscode.commands.registerCommand("fovux.deleteRun", (item) => deleteRun(item)),
    vscode.commands.registerCommand("fovux.tagRun", (item) => tagRun(item)),
    vscode.commands.registerCommand("fovux.revealPath", (targetPath: string) => {
      void vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(targetPath));
    }),
    vscode.commands.registerCommand("fovux.openFovuxHome", () => {
      void vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(resolveFovuxHome()));
    }),
    vscode.commands.registerCommand("fovux.selectProfile", async () => {
      const profiles = resolveFovuxProfiles();
      if (!profiles.length) {
        void vscode.window.showInformationMessage("No Fovux profiles are configured.");
        return;
      }
      const picked = await vscode.window.showQuickPick(
        profiles.map((profile) => ({ label: profile.name, description: profile.home })),
        { placeHolder: "Select FOVUX_HOME profile" }
      );
      if (!picked) {
        return;
      }
      await vscode.workspace
        .getConfiguration("fovux")
        .update("activeProfile", picked.label, vscode.ConfigurationTarget.Workspace);
      runsProvider.reconfigure();
      modelsProvider.reconfigure();
      exportsProvider.reconfigure();
      syncViews();
    }),
    vscode.commands.registerCommand("fovux.refreshViews", () => {
      runsProvider.refresh();
      modelsProvider.refresh();
      exportsProvider.refresh();
      syncViews();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("fovux")) {
        return;
      }
      runsProvider.reconfigure();
      modelsProvider.reconfigure();
      exportsProvider.reconfigure();
      syncViews();
    })
  );

  logger.info("Fovux Studio activated.");
}

export function deactivate(): void {
  disposeFovuxServerManager();
  disposeStatusBarItems();
  logger.info("Fovux Studio deactivated.");
}

function syncRunsView(view: vscode.TreeView<unknown>, summary: RunsSummary): void {
  view.badge =
    summary.totalRuns > 0 ? { value: summary.totalRuns, tooltip: "Tracked runs" } : undefined;

  if (summary.totalRuns === 0) {
    view.message = `Watching ${summary.home}. No runs detected yet.`;
    return;
  }

  const parts = [
    summary.counts.running ? `${summary.counts.running} running` : "",
    summary.counts.complete ? `${summary.counts.complete} complete` : "",
    summary.counts.failed ? `${summary.counts.failed} failed` : "",
  ].filter((part) => part !== "");

  view.message = `${parts.join(" · ")} · ${summary.home}`;
}

function syncModelsView(view: vscode.TreeView<unknown>, summary: ModelsSummary): void {
  view.badge =
    summary.totalModels > 0
      ? { value: summary.totalModels, tooltip: "Indexed model artifacts" }
      : undefined;

  if (summary.totalModels === 0) {
    view.message = `Looking in ${summary.home}. No checkpoints or exports yet.`;
    return;
  }

  const parts = [
    summary.counts.checkpoints ? `${summary.counts.checkpoints} checkpoints` : "",
    summary.counts.exports ? `${summary.counts.exports} exports` : "",
    summary.counts.library ? `${summary.counts.library} library` : "",
  ].filter((part) => part !== "");

  view.message = `${parts.join(" · ")} · ${summary.home}`;
}

function syncExportsView(view: vscode.TreeView<unknown>, summary: ExportsSummary): void {
  view.badge =
    summary.totalExports > 0
      ? { value: summary.totalExports, tooltip: "Recorded exports" }
      : undefined;

  if (summary.totalExports === 0) {
    view.message = `Watching ${summary.home}. No export history yet.`;
    return;
  }

  view.message = `${summary.totalExports} exports · ${summary.home}`;
}
