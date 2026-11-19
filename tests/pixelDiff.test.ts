import { describe, expect, it } from 'vitest';
import { computePixelDiffBuffer, computeRegionMismatchPercent } from '../src/engine/pixelDiff';

describe('Canvas RGBA ImageData Pixel Diff Engine', () => {
  it('reports 0% mismatch for identical RGBA buffers', () => {
    const bufA = new Uint8ClampedArray([
      24, 24, 27, 255,
      99, 102, 241, 255,
      16, 185, 129, 255,
      244, 63, 94, 255,
    ]);
    const bufB = new Uint8ClampedArray(bufA);

    const { metrics } = computePixelDiffBuffer(bufA, bufB, 2, 2, 16);
    expect(metrics.mismatchedPixels).toBe(0);
    expect(metrics.mismatchPercentage).toBe(0);
    expect(metrics.passedThreshold).toBe(true);
  });

  it('flags mismatched pixels exceeding Euclidean RGB tolerance and paints rose heatmap pixels', () => {
    const baseline = new Uint8ClampedArray([
      20, 20, 20, 255,
      56, 189, 248, 255, // sky-400
    ]);
    const candidate = new Uint8ClampedArray([
      22, 21, 20, 255,   // within tolerance
      244, 63, 94, 255,  // rose-500 (large delta)
    ]);

    const { metrics, diffBuffer } = computePixelDiffBuffer(baseline, candidate, 2, 1, 15, 10);
    expect(metrics.mismatchedPixels).toBe(1);
    expect(metrics.mismatchPercentage).toBe(50);
    expect(metrics.passedThreshold).toBe(false);

    // Second pixel in diffBuffer should be highlighted in magenta/rose (244, 63, 94)
    expect(diffBuffer[4]).toBe(244);
    expect(diffBuffer[5]).toBe(63);
    expect(diffBuffer[6]).toBe(94);
  });

  it('computes localized region mismatch percentage inside a bounding box', () => {
    // 4x2 image (8 pixels)
    const base = new Uint8ClampedArray(8 * 4).fill(30);
    const cand = new Uint8ClampedArray(base);

    // Corrupt pixel at (x=2, y=1)
    const targetIdx = (1 * 4 + 2) * 4;
    cand[targetIdx] = 250;

    const mismatchInside = computeRegionMismatchPercent(
      base,
      cand,
      4,
      { x: 2, y: 1, width: 2, height: 1 },
      20
    );
    const mismatchOutside = computeRegionMismatchPercent(
      base,
      cand,
      4,
      { x: 0, y: 0, width: 2, height: 1 },
      20
    );

    expect(mismatchInside).toBe(50);
    expect(mismatchOutside).toBe(0);
  });
});
