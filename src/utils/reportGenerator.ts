import { DiffMetrics, RubricAnnotation } from '../types/diff';

/**
 * Generates a structured Markdown evaluation rubric report suitable for
 * automated UI grading pipelines and PR review artifacts.
 */
export function generateMarkdownRubricReport(
  metrics: DiffMetrics | null,
  annotations: RubricAnnotation[]
): string {
  const statusBadge = metrics?.passedThreshold ? 'PASS' : 'REGRESSION_DETECTED';
  const lines: string[] = [
    '# UI Visual Verification & Rubric Report',
    '',
    `- **Status**: \`${statusBadge}\``,
    `- **Resolution**: \`${metrics ? `${metrics.width}x${metrics.height}` : '640x460'}\``,
    `- **Global Pixel Mismatch**: \`${metrics ? `${metrics.mismatchPercentage}%` : 'N/A'}\` (${metrics?.mismatchedPixels ?? 0} px)`,
    `- **Mean Perceptual ΔRGB**: \`${metrics?.meanColorDelta ?? 0}\``,
    '',
    '## Annotated Rubric Assertions',
    '',
    '| ID | Criterion | Category | Severity | Bounding Box `[x, y, w, h]` | Executable Assertion |',
    '| :--- | :--- | :--- | :--- | :--- | :--- |',
  ];

  for (const ann of annotations) {
    const box = `[${ann.bounds.x}, ${ann.bounds.y}, ${ann.bounds.width}, ${ann.bounds.height}]`;
    lines.push(
      `| \`${ann.id}\` | ${ann.label} | \`${ann.category}\` | **${ann.severity.toUpperCase()}** | \`${box}\` | \`${ann.assertionRule}\` |`
    );
  }

  return lines.join('\n');
}
