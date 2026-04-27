import { describe, expect, it } from "vitest";

import {
  estimateTrainingMinutes,
  TRAINING_PRESETS,
} from "../../src/webviews/trainingLauncher/presets";
import { getUserPresets, saveUserPreset } from "../../src/fovux/userPresets";
import { mockGlobalState } from "./helpers/vscodeMock";
import "./helpers/vscodeMock";

describe("training launcher presets", () => {
  it("includes the release presets", () => {
    expect(TRAINING_PRESETS.map((preset) => preset.id)).toEqual(
      expect.arrayContaining(["fast_prototype", "production", "mobile_edge", "accuracy_max"])
    );
  });

  it("estimates a non-zero training duration", () => {
    expect(estimateTrainingMinutes(30, 16, 640)).toBeGreaterThanOrEqual(5);
  });

  it("persists user presets in VS Code globalState", async () => {
    const context = { globalState: mockGlobalState };
    await saveUserPreset(context as never, {
      name: "edge baseline",
      createdAt: "2026-04-27T00:00:00.000Z",
      config: {
        model: "yolov8n.pt",
        epochs: 50,
        batch: 16,
        imgsz: 640,
        device: "auto",
        tags: "edge",
        extraArgs: "{}",
        maxConcurrentRuns: 1,
      },
    });

    expect(getUserPresets(context as never)).toHaveLength(1);
    expect(mockGlobalState.update).toHaveBeenCalledWith("fovux.userPresets", expect.any(Array));
  });
});
