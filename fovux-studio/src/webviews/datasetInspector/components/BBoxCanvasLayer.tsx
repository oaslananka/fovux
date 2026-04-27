import { useEffect, useRef } from "react";
import type { CSSProperties, JSX } from "react";

interface BBoxCanvasLayerProps {
  boxes: Array<{
    className: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export function BBoxCanvasLayer({ boxes }: BBoxCanvasLayerProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) {
      return;
    }

    const draw = (): void => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 2;
      context.font = "11px var(--vscode-font-family)";
      context.textBaseline = "top";

      for (const box of boxes) {
        const x = box.x * width;
        const y = box.y * height;
        const boxWidth = box.width * width;
        const boxHeight = box.height * height;
        context.strokeStyle = "rgb(245, 166, 35)";
        context.fillStyle = "rgb(245, 166, 35)";
        context.strokeRect(x, y, boxWidth, boxHeight);
        const textWidth = context.measureText(box.className).width + 10;
        const labelY = Math.max(0, y - 18);
        context.fillRect(x, labelY, textWidth, 18);
        context.fillStyle = "rgb(24, 24, 27)";
        context.fillText(box.className, x + 5, labelY + 3);
      }
    };

    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [boxes]);

  return <canvas ref={canvasRef} style={canvasStyle} aria-hidden="true" />;
}

const canvasStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};
