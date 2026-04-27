interface ClassStat {
  name: string;
  count: number;
  pct?: number;
}

interface ClassDistributionProps {
  classes: ClassStat[];
}

export function ClassDistribution({ classes }: ClassDistributionProps): JSX.Element {
  if (!classes.length) {
    return <p style={mutedStyle}>No class distribution available yet.</p>;
  }

  const maxCount = Math.max(...classes.map((item) => item.count), 1);
  return (
    <section style={panelStyle}>
      <h3 style={{ margin: 0 }}>Class Distribution</h3>
      <div style={{ display: "grid", gap: "8px" }}>
        {classes.map((item) => (
          <div key={item.name} style={{ display: "grid", gap: "4px" }}>
            <div style={rowStyle}>
              <span>{item.name}</span>
              <span style={mutedStyle}>
                {item.count} · {(item.pct ?? 0).toFixed(1)}%
              </span>
            </div>
            <div style={trackStyle}>
              <div
                style={{
                  ...fillStyle,
                  width: `${(item.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const panelStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "16px",
  background: "var(--vscode-sideBar-background)",
  border: "1px solid var(--vscode-panel-border)",
  borderRadius: "16px",
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
};

const trackStyle: CSSProperties = {
  height: "10px",
  background: "var(--vscode-editorWidget-background)",
  borderRadius: "999px",
  overflow: "hidden",
};

const fillStyle: CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, var(--vscode-charts-orange), var(--vscode-charts-yellow))",
  borderRadius: "999px",
};

const mutedStyle: CSSProperties = {
  color: "var(--vscode-descriptionForeground)",
  fontSize: "12px",
};
import type { CSSProperties, JSX } from "react";
