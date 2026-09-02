import { describe, expect, it } from 'vitest';
import { sheshaStyles } from '@/styles';
import { MAX_CANVAS_WIDTH_PERCENT, calculateAutoZoom, getCanvasContentBoxWidth, getCanvasLayoutWidth, parseCanvasContextWidth, parseCanvasWidthPercent } from '../utils';

describe('getCanvasContentBoxWidth - the published width components are bounded by', () => {
  const PADDING = 2 * sheshaStyles.paddingLG;

  it('subtracts the canvas padding from the border-box width', () => {
    expect(getCanvasContentBoxWidth('1733px')).toBe(`${1733 - PADDING}px`);
    expect(getCanvasContentBoxWidth('375px')).toBe(`${375 - PADDING}px`);
  });

  it('never goes negative on a width narrower than the padding', () => {
    expect(getCanvasContentBoxWidth('10px')).toBe('0px');
  });

  it('leaves a width it cannot read untouched', () => {
    expect(getCanvasContentBoxWidth('auto')).toBe('auto');
  });
});

describe('parseCanvasContextWidth - a script writing canvasContext.designerWidth', () => {
  it('reads a plain length, with or without the px unit', () => {
    expect(parseCanvasContextWidth('1024')).toEqual({ kind: 'px', width: 1024 });
    expect(parseCanvasContextWidth('1024px')).toEqual({ kind: 'px', width: 1024 });
    expect(parseCanvasContextWidth(' 375 px ')).toEqual({ kind: 'px', width: 375 });
  });

  it('routes a percentage to widthPercent instead of reading it as pixels', () => {
    // parseFloat('80%') is 80, which used to pin an 80px mobile canvas and persist it.
    expect(parseCanvasContextWidth('80%')).toEqual({ kind: 'percent', percent: 80 });
    expect(parseCanvasContextWidth('150%')).toEqual({ kind: 'percent', percent: MAX_CANVAS_WIDTH_PERCENT });
  });

  it('ignores anything that is not a plain length or a percentage', () => {
    expect(parseCanvasContextWidth('50vw')).toBeUndefined();
    expect(parseCanvasContextWidth('80em')).toBeUndefined();
    expect(parseCanvasContextWidth('abc')).toBeUndefined();
    expect(parseCanvasContextWidth('0')).toBeUndefined();
    expect(parseCanvasContextWidth('')).toBeUndefined();
  });
});

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

describe('calculateAutoZoom', () => {
  it('fits the canvas into the pane', () => {
    expect(calculateAutoZoom({ currentZoom: 100, designerWidth: '1920px', containerWidth: 1162 })).toBe(60);
    expect(calculateAutoZoom({ currentZoom: 100, designerWidth: '1920px', containerWidth: 385 })).toBe(20);
  });

  it('keeps the zoom it was given when the pane measures zero', () => {
    // A pane of zero is a pane that cannot be measured yet - a hidden document tab, a collapsed
    // panel. Fitting into nothing used to pin the zoom to the 10% minimum and fight whatever put
    // it back, which is the reported oscillation.
    expect(calculateAutoZoom({ currentZoom: 60, designerWidth: '1920px', containerWidth: 0 })).toBe(60);
    expect(calculateAutoZoom({ currentZoom: 25, designerWidth: '1920px', containerWidth: 0 })).toBe(25);
  });

  it('keeps the zoom it was given when the canvas width is not a usable number', () => {
    expect(calculateAutoZoom({ currentZoom: 75, designerWidth: 'auto', containerWidth: 1162 })).toBe(75);
  });

  it('still bounds a real measurement to the allowed range', () => {
    expect(calculateAutoZoom({ currentZoom: 100, designerWidth: '1920px', containerWidth: 1 })).toBe(10);
    expect(calculateAutoZoom({ currentZoom: 100, designerWidth: '100px', containerWidth: 9000 })).toBe(400);
  });
});
