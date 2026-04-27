import type { CSSProperties, JSX } from "react";

import { postToExtension } from "../../shared/types";
import { BBoxCanvasLayer } from "./BBoxCanvasLayer";

interface SamplePreviewProps {
  samples: Array<{
    path: string;
    uri: string;
    boxes: Array<{
      className: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  }>;
}

export function SamplePreview({ samples }: SamplePreviewProps): JSX.Element {
  if (!samples.length) {
    return <p style={mutedStyle}>No sample previews were returned for this dataset.</p>;
  }

  return (
    <section style={panelStyle}>
      <div style={titleStyle}>
        <h3 style={{ margin: 0 }}>Sample Preview</h3>
        <span style={mutedStyle}>Click any sample to reveal it in Explorer.</span>
      </div>
      <div style={gridStyle}>
        {samples.map((sample) => (
          <button
            key={sample.path}
            type="button"
            onClick={() => postToExtension({ type: "openPath", path: sample.path })}
            style={cardStyle}
            aria-label={`Reveal ${sample.path}`}
          >
            <div style={mediaFrameStyle}>
              <img src={sample.uri} alt={sample.path} style={imageStyle} />
              <BBoxCanvasLayer boxes={sample.boxes} />
            </div>
            <span style={metaStyle}>{sample.boxes.length} labeled boxes</span>
            <span style={pathStyle}>{sample.path}</span>
          </button>
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

const titleStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "baseline",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  padding: "10px",
  borderRadius: "12px",
  border: "1px solid var(--vscode-panel-border)",
  background: "var(--vscode-editorWidget-background)",
  textAlign: "left",
  cursor: "pointer",
};

const imageStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  borderRadius: "8px",
  background: "var(--vscode-editor-background)",
};

const mediaFrameStyle: CSSProperties = {
  position: "relative",
  width: "100%",
};

const metaStyle: CSSProperties = {
  fontSize: "12px",
  color: "var(--vscode-charts-orange)",
};

const pathStyle: CSSProperties = {
  fontSize: "12px",
  color: "var(--vscode-descriptionForeground)",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const mutedStyle: CSSProperties = {
  color: "var(--vscode-descriptionForeground)",
  fontSize: "12px",
};
