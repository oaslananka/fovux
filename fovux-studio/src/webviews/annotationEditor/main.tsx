import { useState } from "react";
import type { CSSProperties, JSX, PointerEvent } from "react";
import { createRoot } from "react-dom/client";

import {
  postToExtension,
  readInitialState,
  type AnnotationEditorInitialState,
  type DatasetSampleBox,
} from "../shared/types";

function AnnotationEditorApp(): JSX.Element {
  const initial = readInitialState<AnnotationEditorInitialState>({
    imagePath: "",
    imageUri: "",
    classNames: ["class_0"],
    initialBoxes: [],
    initialError: "Initial annotation editor state was not provided.",
  });
  const [boxes, setBoxes] = useState<DatasetSampleBox[]>(initial.initialBoxes);
  const [draft, setDraft] = useState<DatasetSampleBox | null>(null);
  const [classId, setClassId] = useState(0);
  const [status, setStatus] = useState<string | null>(initial.initialError);

  return (
    <main style={pageStyle}>
      <header style={toolbarStyle}>
        <div>
          <p style={eyebrowStyle}>Annotation Editor</p>
          <h1 style={titleStyle}>Draw YOLO boxes directly on the sample</h1>
        </div>
        <div style={controlsStyle}>
          <select
            aria-label="Class label"
            style={inputStyle}
            value={classId}
            onChange={(event) => setClassId(Number(event.target.value))}
          >
            {initial.classNames.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <button type="button" style={buttonStyle} onClick={save}>
            Save labels
          </button>
          <button type="button" style={secondaryButtonStyle} onClick={() => setBoxes([])}>
            Clear
          </button>
        </div>
      </header>

      {status ? <p style={statusStyle}>{status}</p> : null}

      <section
        style={stageStyle}
        onPointerDown={startBox}
        onPointerMove={moveBox}
        onPointerUp={finishBox}
        onPointerCancel={() => setDraft(null)}
      >
        <img src={initial.imageUri} alt={initial.imagePath} style={imageStyle} draggable={false} />
        {[...boxes, ...(draft ? [draft] : [])].map((box, index) => (
          <span
            key={`${box.classId}-${index}`}
            style={{
              ...boxStyle,
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
            }}
          >
            <span style={labelStyle}>{box.className}</span>
          </span>
        ))}
      </section>

      <footer style={footerStyle}>
        <code style={pathStyle}>{initial.imagePath}</code>
        <span>{boxes.length} boxes</span>
      </footer>
    </main>
  );

  function startBox(event: PointerEvent<HTMLElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = normalizedPoint(event);
    const className = initial.classNames[classId] ?? `class_${classId}`;
    setDraft({
      classId,
      className,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    });
  }

  function moveBox(event: PointerEvent<HTMLElement>): void {
    if (!draft) {
      return;
    }
    const point = normalizedPoint(event);
    setDraft(normalizeBox(draft, point));
  }

  function finishBox(event: PointerEvent<HTMLElement>): void {
    if (!draft) {
      return;
    }
    const nextBox = normalizeBox(draft, normalizedPoint(event));
    if (nextBox.width > 0.005 && nextBox.height > 0.005) {
      setBoxes((current) => [...current, nextBox]);
    }
    setDraft(null);
  }

  function save(): void {
    postToExtension({ type: "saveAnnotation", imagePath: initial.imagePath, boxes });
    setStatus("Saving labels...");
  }
}

function normalizedPoint(event: PointerEvent<HTMLElement>): { x: number; y: number } {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height),
  };
}

function normalizeBox(start: DatasetSampleBox, point: { x: number; y: number }): DatasetSampleBox {
  const x = Math.min(start.x, point.x);
  const y = Math.min(start.y, point.y);
  return {
    ...start,
    x,
    y,
    width: Math.abs(point.x - start.x),
    height: Math.abs(point.y - start.y),
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  boxSizing: "border-box",
  padding: 20,
  display: "grid",
  gridTemplateRows: "auto auto 1fr auto",
  gap: 12,
  background: "var(--vscode-editor-background)",
  color: "var(--vscode-editor-foreground)",
  fontFamily: "var(--vscode-font-family)",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "end",
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "var(--vscode-charts-orange)",
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 26,
  lineHeight: 1.15,
};

const controlsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const stageStyle: CSSProperties = {
  position: "relative",
  minHeight: 360,
  border: "1px solid var(--vscode-panel-border)",
  background: "var(--vscode-editorWidget-background)",
  overflow: "hidden",
  cursor: "crosshair",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
  userSelect: "none",
};

const boxStyle: CSSProperties = {
  position: "absolute",
  border: "2px solid var(--vscode-charts-orange)",
  pointerEvents: "none",
};

const labelStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: -20,
  padding: "2px 6px",
  background: "var(--vscode-charts-orange)",
  color: "var(--vscode-editor-background)",
  fontSize: 11,
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  padding: "8px 10px",
  border: "1px solid var(--vscode-input-border)",
  background: "var(--vscode-input-background)",
  color: "var(--vscode-input-foreground)",
};

const buttonStyle: CSSProperties = {
  padding: "8px 12px",
  border: "1px solid var(--vscode-button-border, var(--vscode-panel-border))",
  background: "var(--vscode-button-background)",
  color: "var(--vscode-button-foreground)",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "var(--vscode-editorWidget-background)",
  color: "var(--vscode-editor-foreground)",
};

const statusStyle: CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--vscode-inputValidation-infoBorder)",
  background: "var(--vscode-inputValidation-infoBackground)",
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const pathStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const rootNode = document.getElementById("root");
if (rootNode) {
  createRoot(rootNode).render(<AnnotationEditorApp />);
}
