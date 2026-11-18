export type ComparisonMode = 'split' | 'onion' | 'heatmap';

export type DefectCategory =
  | 'layout-shift'
  | 'color-contrast'
  | 'typography-mismatch'
  | 'missing-element';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RubricAnnotation {
  id: string;
  label: string;
  category: DefectCategory;
  severity: 'minor' | 'major' | 'critical';
  bounds: BoundingBox;
  assertionRule: string;
}

export interface DiffMetrics {
  width: number;
  height: number;
  totalPixels: number;
  mismatchedPixels: number;
  mismatchPercentage: number;
  meanColorDelta: number;
  passedThreshold: boolean;
}
