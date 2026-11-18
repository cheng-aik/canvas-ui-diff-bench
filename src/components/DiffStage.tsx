import React, { useEffect, useRef, useState } from 'react';
import { computePixelDiffBuffer } from '../engine/pixelDiff';
import { renderBaselineMockup, renderCandidateMockup } from '../engine/syntheticFixtures';
import { BoundingBox, ComparisonMode, DiffMetrics, RubricAnnotation } from '../types/diff';

interface DiffStageProps {
  mode: ComparisonMode;
  splitRatio: number;
  onionOpacity: number;
  tolerance: number;
  annotations: RubricAnnotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onCreateAnnotation: (bounds: BoundingBox) => void;
  onMetricsComputed: (metrics: DiffMetrics) => void;
}

const STAGE_WIDTH = 640;
const STAGE_HEIGHT = 460;

export const DiffStage: React.FC<DiffStageProps> = ({
  mode,
  splitRatio,
  onionOpacity,
  tolerance,
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onCreateAnnotation,
  onMetricsComputed,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draftBox, setDraftBox] = useState<{ startX: number; startY: number; currX: number; currY: number } | null>(
    null
  );

  useEffect(() => {
    const baselineCanvas = document.createElement('canvas');
    baselineCanvas.width = STAGE_WIDTH;
    baselineCanvas.height = STAGE_HEIGHT;
    const baseCtx = baselineCanvas.getContext('2d')!;
    renderBaselineMockup(baseCtx, STAGE_WIDTH, STAGE_HEIGHT);

    const candidateCanvas = document.createElement('canvas');
    candidateCanvas.width = STAGE_WIDTH;
    candidateCanvas.height = STAGE_HEIGHT;
    const candCtx = candidateCanvas.getContext('2d')!;
    renderCandidateMockup(candCtx, STAGE_WIDTH, STAGE_HEIGHT);

    const baseData = baseCtx.getImageData(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    const candData = candCtx.getImageData(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    const { metrics, diffBuffer } = computePixelDiffBuffer(
      baseData.data,
      candData.data,
      STAGE_WIDTH,
      STAGE_HEIGHT,
      tolerance
    );
    onMetricsComputed(metrics);

    const outCanvas = displayCanvasRef.current;
    if (!outCanvas) return;
    const ctx = outCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    if (mode === 'heatmap') {
      const diffImg = new ImageData(new Uint8ClampedArray(diffBuffer), STAGE_WIDTH, STAGE_HEIGHT);
      ctx.putImageData(diffImg, 0, 0);
    } else if (mode === 'onion') {
      ctx.globalAlpha = 1;
      ctx.drawImage(baselineCanvas, 0, 0);
      ctx.globalAlpha = onionOpacity;
      ctx.drawImage(candidateCanvas, 0, 0);
      ctx.globalAlpha = 1;
    } else {
      // Split-screen wipe comparator
      const splitX = Math.round(STAGE_WIDTH * splitRatio);
      ctx.drawImage(baselineCanvas, 0, 0);

      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, STAGE_WIDTH - splitX, STAGE_HEIGHT);
      ctx.clip();
      ctx.drawImage(candidateCanvas, 0, 0);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, STAGE_HEIGHT);
      ctx.stroke();
    }

    // Render rubric annotation bounding boxes
    annotations.forEach((ann) => {
      const isSelected = ann.id === selectedAnnotationId;
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#f43f5e';
      ctx.lineWidth = isSelected ? 2.5 : 1.75;
      ctx.strokeRect(ann.bounds.x, ann.bounds.y, ann.bounds.width, ann.bounds.height);

      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.16)' : 'rgba(244, 63, 94, 0.14)';
      ctx.fillRect(ann.bounds.x, ann.bounds.y, ann.bounds.width, ann.bounds.height);

      // Label tag
      ctx.fillStyle = isSelected ? '#0284c7' : '#e11d48';
      ctx.fillRect(ann.bounds.x, ann.bounds.y - 18, Math.min(180, ann.label.length * 7 + 14), 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 10px monospace';
      ctx.fillText(ann.label, ann.bounds.x + 5, ann.bounds.y - 5);
    });

    if (draftBox) {
      const x = Math.min(draftBox.startX, draftBox.currX);
      const y = Math.min(draftBox.startY, draftBox.currY);
      const w = Math.abs(draftBox.currX - draftBox.startX);
      const h = Math.abs(draftBox.currY - draftBox.startY);
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [mode, splitRatio, onionOpacity, tolerance, annotations, selectedAnnotationId, draftBox]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * STAGE_WIDTH),
      y: Math.round(((e.clientY - rect.top) / rect.height) * STAGE_HEIGHT),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    // Check if user clicked an existing annotation box
    const hit = annotations.find(
      (a) =>
        pt.x >= a.bounds.x &&
        pt.x <= a.bounds.x + a.bounds.width &&
        pt.y >= a.bounds.y &&
        pt.y <= a.bounds.y + a.bounds.height
    );
    if (hit) {
      onSelectAnnotation(hit.id);
      return;
    }
    onSelectAnnotation(null);
    setDraftBox({ startX: pt.x, startY: pt.y, currX: pt.x, currY: pt.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draftBox) return;
    const pt = getCanvasCoords(e);
    setDraftBox({ ...draftBox, currX: pt.x, currY: pt.y });
  };

  const handlePointerUp = () => {
    if (!draftBox) return;
    const x = Math.min(draftBox.startX, draftBox.currX);
    const y = Math.min(draftBox.startY, draftBox.currY);
    const width = Math.abs(draftBox.currX - draftBox.startX);
    const height = Math.abs(draftBox.currY - draftBox.startY);

    if (width > 16 && height > 16) {
      onCreateAnnotation({ x, y, width, height });
    }
    setDraftBox(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 select-none">
      <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
          <span>Canvas Resolution: {STAGE_WIDTH}x{STAGE_HEIGHT}px</span>
          <span className="font-mono text-sky-400">
            Drag anywhere on canvas to draw a new verification bounding box
          </span>
        </div>
        <canvas
          ref={displayCanvasRef}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-lg border border-zinc-800 cursor-crosshair block"
        />
      </div>
    </div>
  );
};
