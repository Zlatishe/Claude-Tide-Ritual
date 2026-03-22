interface ShellPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export function generateShellPositions(
  count: number,
  containerWidth: number,
  containerHeight: number,
): ShellPosition[] {
  const positions: ShellPosition[] = [];
  const minSpacing = Math.min(containerWidth, containerHeight) * (containerWidth < 640 ? 0.18 : 0.13);
  const xPadding = 0.15; // Keep shells fully visible within viewport
  const yPaddingTop = 0.15; // Ensures ready-to-release tag clears header
  const yPaddingBottom = 0.22; // Above waves & CTA area
  const maxAttempts = 120;

  for (let i = 0; i < count; i++) {
    let bestPos: ShellPosition | null = null;
    let bestMinDist = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = xPadding + Math.random() * (1 - 2 * xPadding);
      const y = yPaddingTop + Math.random() * (1 - yPaddingTop - yPaddingBottom);

      let minDist = Infinity;
      for (const existing of positions) {
        const dx = (x - existing.x) * containerWidth;
        const dy = (y - existing.y) * containerHeight;
        const dist = Math.sqrt(dx * dx + dy * dy);
        minDist = Math.min(minDist, dist);
      }

      if (positions.length === 0 || minDist > minSpacing) {
        bestPos = {
          x,
          y,
          rotation: (Math.random() - 0.5) * 40,
          scale: 0.8 + Math.random() * 0.45,
        };
        break;
      }

      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestPos = {
          x,
          y,
          rotation: (Math.random() - 0.5) * 40,
          scale: 0.8 + Math.random() * 0.45,
        };
      }
    }

    if (bestPos) {
      positions.push(bestPos);
    }
  }

  return positions;
}

export function getShellCount(width: number): number {
  if (width < 640) return 5 + Math.round(Math.random());
  if (width < 1024) return 6 + Math.round(Math.random());
  return 8 + Math.floor(Math.random() * 3);
}
