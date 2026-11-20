import React, { useState } from 'react';
import { DiffStage } from './components/DiffStage';
import { RubricSidebar } from './components/RubricSidebar';
import { BoundingBox, ComparisonMode, DiffMetrics, RubricAnnotation } from './types/diff';
import { generateMarkdownRubricReport } from './utils/reportGenerator';

const INITIAL_ANNOTATIONS: RubricAnnotation[] = [
  {
    id: 'rubric-1',
    label: 'KPI Card #2 Vertical Shift (+8px)',
    category: 'layout-shift',
    severity: 'major',
    bounds: { x: 270, y: 94, width: 238, height: 154 },
    assertionRule: 'expect(await card2.boundingBox()).toMatchObject({ y: 96, height: 140 })',
  },
  {
    id: 'rubric-2',
    label: 'Histogram Bar #4 Height & Fill Regression',
    category: 'color-contrast',
    severity: 'critical',
    bounds: { x: 234, y: 320, width: 48, height: 92 },
    assertionRule: 'expect(bar4).toHaveAttribute("height", "78")',
  },
];

export default function App() {
  const [mode, setMode] = useState<ComparisonMode>('split');
  const [splitRatio, setSplitRatio] = useState<number>(0.5);
  const [onionOpacity, setOnionOpacity] = useState<number>(0.5);
  const [tolerance, setTolerance] = useState<number>(24);
  const [metrics, setMetrics] = useState<DiffMetrics | null>(null);
  const [annotations, setAnnotations] = useState<RubricAnnotation[]>(INITIAL_ANNOTATIONS);
  const [selectedId, setSelectedId] = useState<string | null>('rubric-1');

  const handleCreateAnnotation = (bounds: BoundingBox) => {
    const id = `rubric-${Date.now()}`;
    const next: RubricAnnotation = {
      id,
      label: `Region Check #${annotations.length + 1}`,
      category: 'layout-shift',
      severity: 'major',
      bounds,
      assertionRule: `expect(region(${bounds.x}, ${bounds.y})).toHavePixelMismatchLessThan(0.01)`,
    };
    setAnnotations((prev) => [...prev, next]);
    setSelectedId(id);
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(
      {
        benchmark: 'canvas-ui-diff-bench',
        generatedAt: new Date().toISOString(),
        metrics,
        rubricCriteria: annotations,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-verification-rubric.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownRubricReport(metrics, annotations);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-verification-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="h-13 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-sky-400">Canvas UI Diff Bench</span>
          <span className="text-xs text-zinc-400 border-l border-zinc-800 pl-3">
            Visual Regression & Objective Rubric Authoring
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            {(['split', 'onion', 'heatmap'] as ComparisonMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  mode === m ? 'bg-sky-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === 'split' && (
            <label className="flex items-center gap-2 text-zinc-300">
              <span>Split Wipe</span>
              <input
                type="range"
                min={0.05}
                max={0.95}
                step={0.01}
                value={splitRatio}
                onChange={(e) => setSplitRatio(Number(e.target.value))}
              />
            </label>
          )}

          {mode === 'onion' && (
            <label className="flex items-center gap-2 text-zinc-300">
              <span>Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={onionOpacity}
                onChange={(e) => setOnionOpacity(Number(e.target.value))}
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-zinc-300">
            <span>ΔRGB Threshold: {tolerance}</span>
            <input
              type="range"
              min={4}
              max={96}
              step={2}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
            />
          </label>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <DiffStage
          mode={mode}
          splitRatio={splitRatio}
          onionOpacity={onionOpacity}
          tolerance={tolerance}
          annotations={annotations}
          selectedAnnotationId={selectedId}
          onSelectAnnotation={setSelectedId}
          onCreateAnnotation={handleCreateAnnotation}
          onMetricsComputed={setMetrics}
        />

        <RubricSidebar
          metrics={metrics}
          annotations={annotations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={(id, patch) =>
            setAnnotations((prev) =>
              prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
            )
          }
          onDelete={(id) => {
            setAnnotations((prev) => prev.filter((a) => a.id !== id));
            setSelectedId(null);
          }}
          onExportJson={handleExportJson}
          onExportMarkdown={handleExportMarkdown}
        />
      </main>
    </div>
  );
}
