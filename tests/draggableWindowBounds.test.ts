import { describe, expect, it } from 'vitest';
import { getViewportFitBounds } from '../src/components/global/DraggableWindow';

describe('viewport-fitted window bounds', () => {
  const fit = { widthRatio: 0.94, heightRatio: 0.96 };

  it('uses most of the area above the dock on a compact display', () => {
    const bounds = getViewportFitBounds({ width: 1280, height: 720, bottomInset: 118 }, fit);

    expect(bounds.size).toEqual({ width: 1188, height: 524 });
    expect(bounds.position).toEqual({ x: 46, y: 67 });
  });

  it('scales and recentres a window for a larger display', () => {
    const compact = getViewportFitBounds({ width: 1280, height: 720, bottomInset: 118 }, fit);
    const expanded = getViewportFitBounds({ width: 2048, height: 1150, bottomInset: 118 }, fit);

    expect(expanded.size.width).toBeGreaterThan(compact.size.width * 1.45);
    expect(expanded.size.height).toBeGreaterThan(compact.size.height * 1.5);
    expect(expanded.position.x).toBe(Math.round((2048 - expanded.size.width) / 2));
  });

  it('returns the same large-display bounds after a temporary compact viewport', () => {
    const first = getViewportFitBounds({ width: 2048, height: 1150, bottomInset: 118 }, fit);
    getViewportFitBounds({ width: 1280, height: 720, bottomInset: 118 }, fit);
    const recovered = getViewportFitBounds({ width: 2048, height: 1150, bottomInset: 118 }, fit);

    expect(recovered).toEqual(first);
  });
});
