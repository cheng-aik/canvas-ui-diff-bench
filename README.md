# Canvas UI Diff Bench

![CI Verification](https://github.com/cheng-aik/canvas-ui-diff-bench/actions/workflows/ci.yml/badge.svg)

An **HTML5 Canvas 2D Visual Regression Comparator & Objective Rubric Workbench** built with **React 18** and **TypeScript**. Designed for evaluating frontend UI implementations against reference design mockups using pixel-level `ImageData` analysis and spatial bounding-box assertions.

## Core Capabilities

- **3 Interactive Canvas Inspection Modes**:
  - **Split-Curtain Wipe**: Real-time clipping plane (`ctx.clip()`) comparing Baseline reference against Candidate implementation.
  - **Onion-Skin Alpha Compositing**: Adjustable opacity overlay for spotting sub-pixel layout shifts and typography drift.
  - **Perceptual ΔRGB Heatmap**: Euclidean RGB distance thresholding over raw `Uint8ClampedArray` buffers with dimmed luminance context.
- **Interactive Bounding-Box Rubric Authoring**: Drag directly on the HTML5 Canvas to annotate visual defect regions, classify defect severity (`layout-shift`, `color-contrast`, `typography-mismatch`, `missing-element`), and attach executable Playwright/DOM assertion rules.
- **Offscreen Buffer Caching**: Memoizes baseline, candidate, and heatmap `ImageData` buffers to keep split-curtain scrubbing and bounding-box drawing locked at 60 FPS.
- **Deterministic Verification Export**: Exports self-contained JSON evaluation rubrics containing global mismatch telemetry and localized bounding-box assertions.

## Project Structure

```
src/
├── components/
│   ├── DiffStage.tsx          # HTML5 Canvas 2D renderer, split-clip & box drawing
│   └── RubricSidebar.tsx      # Telemetry dashboard & assertion rule editor
├── engine/
│   ├── pixelDiff.ts           # Uint8ClampedArray RGBA diff & region mismatch math
│   └── syntheticFixtures.ts   # Deterministic baseline vs regression UI canvas renderer
└── types/
    └── diff.ts                # Strict TypeScript definitions for metrics & annotations
```

## Quick Start

```bash
npm install
npm run dev
```

## Running Unit Verification

```bash
npm test
```
