import React from 'react';
import { DefectCategory, DiffMetrics, RubricAnnotation } from '../types/diff';

interface RubricSidebarProps {
  metrics: DiffMetrics | null;
  annotations: RubricAnnotation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<RubricAnnotation>) => void;
  onDelete: (id: string) => void;
  onExportJson: () => void;
}

export const RubricSidebar: React.FC<RubricSidebarProps> = ({
  metrics,
  annotations,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onExportJson,
}) => {
  const selected = annotations.find((a) => a.id === selectedId) ?? null;

  return (
    <aside className="w-96 border-l border-zinc-800 bg-zinc-900/90 p-4 flex flex-col justify-between text-xs overflow-y-auto">
      <div className="space-y-4">
        {/* Objective Pixel Verification Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-200">Objective Diff Telemetry</span>
            {metrics && (
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                  metrics.passedThreshold
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {metrics.passedThreshold ? 'PASS' : 'REGRESSION DETECTED'}
              </span>
            )}
          </div>

          {metrics && (
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/80">
                <div className="text-zinc-400 text-[10px]">Mismatch %</div>
                <div className="text-sm text-rose-400 font-semibold">
                  {metrics.mismatchPercentage}%
                </div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/80">
                <div className="text-zinc-400 text-[10px]">Diff Pixels</div>
                <div className="text-sm text-zinc-200">
                  {metrics.mismatchedPixels.toLocaleString()}
                </div>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800/80">
                <div className="text-zinc-400 text-[10px]">Mean ΔRGB</div>
                <div className="text-sm text-sky-400">{metrics.meanColorDelta}</div>
              </div>
            </div>
          )}
        </div>

        {/* Bounding-Box Annotations List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-zinc-200">
              Visual Rubric Annotations ({annotations.length})
            </h3>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                onClick={() => onSelect(ann.id)}
                className={`p-2 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                  ann.id === selectedId
                    ? 'bg-sky-950/40 border-sky-500/80 text-sky-100'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="font-medium">{ann.label}</div>
                  <div className="font-mono text-[10px] text-zinc-400">
                    [{ann.bounds.x}, {ann.bounds.y}, {ann.bounds.width}x{ann.bounds.height}] ·{' '}
                    {ann.category}
                  </div>
                </div>
                <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                  {ann.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Annotation Editor */}
        {selected && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2.5">
            <div className="font-semibold text-sky-400">Edit Rubric Criterion</div>
            <div>
              <label className="block text-zinc-400 mb-1">Criterion Label</label>
              <input
                type="text"
                value={selected.label}
                onChange={(e) => onUpdate(selected.id, { label: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={selected.category}
                  onChange={(e) =>
                    onUpdate(selected.id, { category: e.target.value as DefectCategory })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100"
                >
                  <option value="layout-shift">Layout Shift</option>
                  <option value="color-contrast">Color / Contrast</option>
                  <option value="typography-mismatch">Typography</option>
                  <option value="missing-element">Missing Element</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Severity</label>
                <select
                  value={selected.severity}
                  onChange={(e) =>
                    onUpdate(selected.id, {
                      severity: e.target.value as RubricAnnotation['severity'],
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                Objective Verification Assertion (Playwright / DOM Rule)
              </label>
              <textarea
                rows={2}
                value={selected.assertionRule}
                onChange={(e) => onUpdate(selected.id, { assertionRule: e.target.value })}
                className="w-full font-mono text-[11px] bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
              />
            </div>

            <button
              onClick={() => onDelete(selected.id)}
              className="w-full bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 rounded py-1 font-medium"
            >
              Delete Annotation
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onExportJson}
        className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 rounded-lg transition-colors"
      >
        Export Verification Rubric JSON
      </button>
    </aside>
  );
};
