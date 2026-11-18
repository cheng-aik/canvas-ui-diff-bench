import { DiffMetrics } from '../types/diff';

export interface PixelDiffResult {
  metrics: DiffMetrics;
  diffBuffer: Uint8ClampedArray;
}

/**
 * Compares two RGBA pixel buffers (Uint8ClampedArray) pixel-by-pixel using a
 * perceptual YIQ / Euclidean RGB distance threshold, producing a high-contrast
 * heatmap buffer and objective verification metrics.
 */
export function computePixelDiffBuffer(
  baseline: Uint8ClampedArray,
  candidate: Uint8ClampedArray,
  width: number,
  height: number,
  colorTolerance = 24,
  maxMismatchPercent = 2.0
): PixelDiffResult {
  const totalPixels = width * height;
  const diffBuffer = new Uint8ClampedArray(baseline.length);

  let mismatchedPixels = 0;
  let cumulativeDelta = 0;

  for (let i = 0; i < baseline.length; i += 4) {
    const r1 = baseline[i];
    const g1 = baseline[i + 1];
    const b1 = baseline[i + 2];

    const r2 = candidate[i];
    const g2 = candidate[i + 1];
    const b2 = candidate[i + 2];

    const dr = Math.abs(r1 - r2);
    const dg = Math.abs(g1 - g2);
    const db = Math.abs(b1 - b2);

    const delta = Math.sqrt(dr * dr + dg * dg + db * db);
    cumulativeDelta += delta;

    if (delta > colorTolerance) {
      mismatchedPixels++;
      // Highlight mismatched pixel in high-visibility magenta/rose
      diffBuffer[i] = 244;
      diffBuffer[i + 1] = 63;
      diffBuffer[i + 2] = 94;
      diffBuffer[i + 3] = 255;
    } else {
      // Dimmed grayscale background of baseline for spatial context
      const luma = Math.round(0.299 * r1 + 0.587 * g1 + 0.114 * b1);
      const dimmed = Math.round(luma * 0.35);
      diffBuffer[i] = dimmed;
      diffBuffer[i + 1] = dimmed;
      diffBuffer[i + 2] = dimmed;
      diffBuffer[i + 3] = 255;
    }
  }

  const mismatchPercentage = Number(((mismatchedPixels / totalPixels) * 100).toFixed(2));
  const meanColorDelta = Number((cumulativeDelta / totalPixels).toFixed(2));

  return {
    metrics: {
      width,
      height,
      totalPixels,
      mismatchedPixels,
      mismatchPercentage,
      meanColorDelta,
      passedThreshold: mismatchPercentage <= maxMismatchPercent,
    },
    diffBuffer,
  };
}
