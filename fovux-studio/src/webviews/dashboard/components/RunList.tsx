import type { CSSProperties, JSX } from "react";

import type { RunSummary } from "../../shared/api";
import { postToExtension } from "../../shared/types";

interface RunListProps {
  runs: RunSummary[];
  selectedRunIds: string[];
  onToggle: (runId: string) => void;
}

export function RunList({ runs, selectedRunIds, onToggle }: RunListProps): JSX.Element {
  if (!runs.length) {
    return (
      <section style={emptyStyle}>
        <h3 style={{ margin: 0 }}>Runs</h3>
        <p style={mutedStyle}>
          No tracked runs yet. Start a training run to populate the dashboard.
        </p>
      </section>
    );
  }

  return (
    <section style={listStyle} aria-label="Tracked runs">
      <div style={sectionTitleRowStyle}>
        <h3 style={{ margin: 0 }}>Runs</h3>
        <span style={mutedStyle}>Select up to five to overlay metrics.</span>
      </div>
      {runs.map((run) => {
        const checked = selectedRunIds.includes(run.id);
        return (
          <div key={run.id} style={itemStyle}>
            <label style={toggleRowStyle}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(run.id)}
                aria-label={`Toggle run ${run.id}`}
              />
              <span style={itemContentStyle}>
                <span style={titleRowStyle}>
                  <strong>{run.id}</strong>
                  <span style={{ ...statusBadgeStyle, ...statusTone(run.status) }}>
                    {run.status}
                  </span>
                </span>
                <span style={mutedStyle}>{run.model}</span>
                <span style={metaRowStyle}>
                  <span>
                    epoch {run.current_epoch ?? 0}/{run.epochs}
                  </span>
                  <span>
                    mAP50 {typeof run.best_map50 === "number" ? run.best_map50.toFixed(3) : "n/a"}
                  </span>
                </span>
                <span style={progressTrackStyle}>
                  <span
                    style={{
                      ...progressFillStyle,
                      width: `${Math.min(((run.current_epoch ?? 0) / Math.max(run.epochs, 1)) * 100, 100)}%`,
                    }}
                  />
                </span>
              </span>
            </label>
            {run.run_path ? (
              <button
                type="button"
                style={revealButtonStyle}
                onClick={() => postToExtension({ type: "openPath", path: run.run_path ?? "" })}
              >
                Reveal
              </button>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

const listStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  padding: "16px",
  background: "var(--vscode-sideBar-background)",
  border: "1px solid var(--vscode-panel-border)",
  borderRadius: "16px",
};

const sectionTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "12px",
};

const itemStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  alignItems: "start",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "var(--vscode-editorWidget-background)",
};

const itemContentStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
};

const mutedStyle: CSSProperties = {
  color: "var(--vscode-descriptionForeground)",
  fontSize: "12px",
};

const toggleRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "10px",
  alignItems: "start",
};

const titleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  fontSize: "12px",
  color: "var(--vscode-descriptionForeground)",
};

const statusBadgeStyle: CSSProperties = {
  padding: "2px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
};

const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: "6px",
  borderRadius: "999px",
  background: "var(--vscode-panel-border)",
  overflow: "hidden",
};

const progressFillStyle: CSSProperties = {
  display: "block",
  height: "100%",
  borderRadius: "999px",
  background: "var(--vscode-charts-blue)",
};

const revealButtonStyle: CSSProperties = {
  justifySelf: "start",
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid var(--vscode-panel-border)",
  background: "transparent",
  color: "var(--vscode-editor-foreground)",
  cursor: "pointer",
  fontSize: "12px",
};

const emptyStyle: CSSProperties = {
  padding: "16px",
  background: "var(--vscode-sideBar-background)",
  border: "1px solid var(--vscode-panel-border)",
  borderRadius: "16px",
  display: "grid",
  gap: "8px",
};

function statusTone(status: string): CSSProperties {
  switch (status) {
    case "running":
      return { background: "var(--vscode-charts-blue)", color: "var(--vscode-editor-background)" };
    case "complete":
      return { background: "var(--vscode-charts-green)", color: "var(--vscode-editor-background)" };
    case "failed":
      return { background: "var(--vscode-charts-red)", color: "var(--vscode-editor-background)" };
    case "stopped":
      return {
        background: "var(--vscode-charts-yellow)",
        color: "var(--vscode-editor-background)",
      };
    default:
      return { background: "var(--vscode-panel-border)", color: "var(--vscode-editor-foreground)" };
  }
}
