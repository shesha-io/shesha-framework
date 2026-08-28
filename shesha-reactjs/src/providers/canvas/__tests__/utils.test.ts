import { describe, expect, it } from 'vitest';
import { MAX_CANVAS_WIDTH_PERCENT, getCanvasLayoutWidth, parseCanvasWidthPercent } from '../utils';

describe('parseCanvasWidthPercent', () => {
  it('reads a well-formed percentage below the maximum as itself', () => {
    expect(parseCanvasWidthPercent('80%')).toEqual({ percent: 80, wasClamped: false });
    expect(parseCanvasWidthPercent('  33.5 % ')).toEqual({ percent: 33.5, wasClamped: false });
  });

  it('overrides anything above the maximum, and reports that it did', () => {
    expect(parseCanvasWidthPercent('101%')).toEqual({ percent: MAX_CANVAS_WIDTH_PERCENT, wasClamped: true });
    expect(parseCanvasWidthPercent('150%')).toEqual({ percent: MAX_CANVAS_WIDTH_PERCENT, wasClamped: true });
    expect(parseCanvasWidthPercent('9999%')).toEqual({ percent: MAX_CANVAS_WIDTH_PERCENT, wasClamped: true });
  });

  it('treats exactly the maximum as applied, not overridden', () => {
    expect(parseCanvasWidthPercent('100%')).toEqual({ percent: MAX_CANVAS_WIDTH_PERCENT, wasClamped: false });
  });

  it('ignores values that are not a usable percentage width', () => {
    // A device preset, a malformed entry, a negative (the pattern admits no sign), and zero -
    // none is a width the canvas can take, so the caller is left to ignore them.
    expect(parseCanvasWidthPercent('1024px')).toBeUndefined();
    expect(parseCanvasWidthPercent('abc%')).toBeUndefined();
    expect(parseCanvasWidthPercent('-10%')).toBeUndefined();
    expect(parseCanvasWidthPercent('0%')).toBeUndefined();
    expect(parseCanvasWidthPercent('')).toBeUndefined();
  });
});

describe('getCanvasLayoutWidth', () => {
  it('divides the available width by the zoom factor so the zoomed canvas fills its pane', () => {
    expect(getCanvasLayoutWidth(800, 100)).toBe('800px');
    expect(getCanvasLayoutWidth(800, 50)).toBe('1600px');
    expect(getCanvasLayoutWidth(800, 200)).toBe('400px');
  });

  it('takes only the requested share of the available width', () => {
    expect(getCanvasLayoutWidth(800, 100, 50)).toBe('400px');
    expect(getCanvasLayoutWidth(800, 100, 80)).toBe('640px');
    expect(getCanvasLayoutWidth(800, 50, 50)).toBe('800px');
  });

  it('never exceeds the available width, whatever percentage arrives', () => {
    expect(getCanvasLayoutWidth(800, 100, MAX_CANVAS_WIDTH_PERCENT)).toBe('800px');
    expect(getCanvasLayoutWidth(800, 100, 150)).toBe('800px');
    expect(getCanvasLayoutWidth(800, 100, 10000)).toBe('800px');
  });

  it('falls back to the whole width for a percentage that is not usable', () => {
    expect(getCanvasLayoutWidth(800, 100, 0)).toBe('800px');
    expect(getCanvasLayoutWidth(800, 100, -25)).toBe('800px');
    expect(getCanvasLayoutWidth(800, 100, Number.NaN)).toBe('800px');
  });

  it('floors sub-pixel results so the canvas can never overflow its pane', () => {
    expect(getCanvasLayoutWidth(1000, 30)).toBe('3333px');
  });

  it('falls back to the default zoom rather than dividing by zero', () => {
    expect(getCanvasLayoutWidth(750, 0)).toBe('1000px');
  });
});
