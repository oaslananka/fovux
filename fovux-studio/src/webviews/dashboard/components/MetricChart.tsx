interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: ChartPoint[];
}

interface MetricChartProps {
  title: string;
  series: ChartSeries[];
  emptyMessage: string;
}

export function MetricChart({ title, series, emptyMessage }: MetricChartProps): JSX.Element {
  const points = series.flatMap((item) => item.points);
  if (!points.length) {
    return (
      <section style={panelStyle}>
        <h3 style={sectionTitleStyle}>{title}</h3>
        <p style={mutedStyle}>{emptyMessage}</p>
      </section>
    );
  }

  const width = 520;
  const height = 220;
  const padding = 18;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xScale = (value: number): number => {
    if (maxX === minX) {
      return width / 2;
    }
    return padding + ((value - minX) / (maxX - minX)) * (width - padding * 2);
  };

  const yScale = (value: number): number => {
    if (maxY === minY) {
      return height / 2;
    }
    return height - padding - ((value - minY) / (maxY - minY)) * (height - padding * 2);
  };

  return (
    <section style={panelStyle}>
      <div style={headerRowStyle}>
        <h3 style={sectionTitleStyle}>{title}</h3>
        <span style={mutedStyle}>
          range {minY.toFixed(3)} to {maxY.toFixed(3)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} style={chartStyle}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={16}
          fill="var(--vscode-editorWidget-background)"
        />
        {series.map((item) => (
          <polyline
            key={item.label}
            fill="none"
            stroke={item.color}
            strokeWidth={2.5}
            points={item.points.map((point) => `${xScale(point.x)},${yScale(point.y)}`).join(" ")}
          />
        ))}
      </svg>
      <div style={legendStyle}>
        {series.map((item) => (
          <span key={item.label} style={{ ...legendItemStyle, borderColor: item.color }}>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--vscode-sideBar-background)",
  border: "1px solid var(--vscode-panel-border)",
  borderRadius: "16px",
  padding: "16px",
  display: "grid",
  gap: "12px",
};

const headerRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const sectionTitleStyle: CSSProperties = {
  margin: "0",
  fontSize: "14px",
};

const mutedStyle: CSSProperties = {
  margin: "0",
  color: "var(--vscode-descriptionForeground)",
  fontSize: "12px",
};

const chartStyle: CSSProperties = {
  width: "100%",
  height: "220px",
};

const legendStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const legendItemStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "12px",
};
import type { CSSProperties, JSX } from "react";
