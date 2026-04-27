/**
 * Bundle-size regression check for the VSIX package.
 *
 * Compares the current VSIX size against a baseline and fails if the
 * size exceeds the baseline by more than 15%.
 *
 * Usage:
 *   node scripts/check-bundle-size.js [--update-baseline]
 */

const { readFileSync, writeFileSync, existsSync, statSync, readdirSync } = require("node:fs");
const { join, resolve } = require("node:path");

const ROOT = resolve(__dirname, "..");
const BASELINE_PATH = join(ROOT, "scripts", "bundle-size-baseline.json");
const THRESHOLD = 0.15; // 15% growth allowed

function findVsix() {
  const files = readdirSync(ROOT).filter((f) => f.endsWith(".vsix"));
  if (files.length === 0) {
    console.error("No .vsix file found. Run `pnpm exec vsce package` first.");
    process.exit(1);
  }
  return join(ROOT, files[0]);
}

function main() {
  const updateBaseline = process.argv.includes("--update-baseline");
  const vsixPath = findVsix();
  const currentSize = statSync(vsixPath).size;

  console.log("VSIX: " + vsixPath);
  console.log("Size: " + (currentSize / 1024).toFixed(1) + " KB");

  if (updateBaseline) {
    const baseline = { sizeBytes: currentSize, updatedAt: new Date().toISOString() };
    writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
    console.log("Baseline updated to " + currentSize + " bytes.");
    return;
  }

  if (!existsSync(BASELINE_PATH)) {
    console.log("No baseline found. Run with --update-baseline to create one.");
    console.log("Skipping size check.");
    return;
  }

  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf-8"));
  const baselineSize = baseline.sizeBytes;
  const maxAllowed = Math.floor(baselineSize * (1 + THRESHOLD));
  const growth = ((currentSize - baselineSize) / baselineSize * 100).toFixed(1);

  console.log("Baseline: " + (baselineSize / 1024).toFixed(1) + " KB");
  console.log("Growth: " + growth + "%");
  console.log("Max allowed: " + (maxAllowed / 1024).toFixed(1) + " KB (+" + (THRESHOLD * 100).toFixed(0) + "%)");

  if (currentSize > maxAllowed) {
    console.error("FAIL: VSIX size " + currentSize + " exceeds baseline " + baselineSize + " by " + growth + "% (max " + (THRESHOLD * 100).toFixed(0) + "%).");
    process.exit(1);
  }

  console.log("PASS: Bundle size within acceptable range.");
}

main();
