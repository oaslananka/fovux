/**
 * Doctor sidebar tree view for system health diagnostics.
 */

import * as vscode from "vscode";
import { ExtensionFovuxClient } from "../fovux/extensionClient";

interface DoctorCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export class DoctorTreeProvider implements vscode.TreeDataProvider<DoctorCheck> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private checks: DoctorCheck[] = [];

  async refresh(): Promise<void> {
    try {
      const client = await ExtensionFovuxClient.create();
      const result = await client.invokeTool<{ checks?: DoctorCheck[] }>(
        "fovux_doctor",
        {}
      );
      this.checks = result.checks ?? [];
    } catch {
      this.checks = [
        {
          name: "Server Connection",
          status: "fail",
          detail: "Could not reach fovux-mcp server.",
        },
      ];
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DoctorCheck): vscode.TreeItem {
    const icon =
      element.status === "pass"
        ? new vscode.ThemeIcon("check", new vscode.ThemeColor("testing.iconPassed"))
        : element.status === "warn"
          ? new vscode.ThemeIcon(
              "warning",
              new vscode.ThemeColor("testing.iconQueued")
            )
          : new vscode.ThemeIcon(
              "error",
              new vscode.ThemeColor("testing.iconFailed")
            );

    const item = new vscode.TreeItem(element.name);
    item.description = element.detail;
    item.iconPath = icon;
    item.tooltip = `${element.name}: ${element.status}\n${element.detail}`;
    return item;
  }

  getChildren(): DoctorCheck[] {
    return this.checks;
  }
}
