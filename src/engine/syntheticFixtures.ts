/**
 * Renders a deterministic Baseline vs Candidate UI Mockup directly onto HTML5 2D contexts
 * so the benchmark runs out-of-the-box with reproducible pixel deltas.
 */
export function renderBaselineMockup(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  // App surface background
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, width, height);

  // Navigation header
  ctx.fillStyle = '#18181b';
  ctx.fillRect(24, 24, width - 48, 52);

  // Brand pill
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(40, 38, 120, 24);

  // KPI Card 1
  ctx.fillStyle = '#18181b';
  ctx.fillRect(24, 96, 230, 140);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(44, 120, 90, 18);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(44, 152, 160, 28);

  // KPI Card 2
  ctx.fillStyle = '#18181b';
  ctx.fillRect(274, 96, 230, 140);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(294, 120, 110, 18);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(294, 152, 150, 28);

  // Chart panel
  ctx.fillStyle = '#18181b';
  ctx.fillRect(24, 256, width - 48, 176);

  const barHeights = [64, 92, 115, 78, 126, 98, 110];
  barHeights.forEach((h, idx) => {
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(54 + idx * 62, 405 - h, 36, h);
  });
}

/**
 * Renders the Candidate UI implementation containing 3 intentional visual regressions:
 * 1. KPI Card 2 shifted +8px vertically and wrong accent hue.
 * 2. Chart bar #4 height regression.
 * 3. Missing status indicator in header.
 */
export function renderCandidateMockup(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  renderBaselineMockup(ctx, width, height);

  // Intentional Defect 1: Card 2 layout shift (+8px Y) & wrong badge color
  ctx.fillStyle = '#09090b';
  ctx.fillRect(274, 96, 230, 140);

  ctx.fillStyle = '#18181b';
  ctx.fillRect(274, 104, 230, 140);
  ctx.fillStyle = '#f43f5e'; // Mismatched color (#f43f5e instead of #38bdf8)
  ctx.fillRect(294, 128, 110, 18);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(294, 160, 150, 28);

  // Intentional Defect 2: Bar #4 rendering height regression
  ctx.fillStyle = '#18181b';
  ctx.fillRect(54 + 3 * 62, 270, 36, 135);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(54 + 3 * 62, 405 - 42, 36, 42);
}
