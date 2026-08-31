/**
 * Leaf module, no imports: `contexts.ts` and `utils.ts` both need these, and importing them from
 * `utils.ts` left DEFAULT_OPTIONS undefined for whichever module the import cycle entered first.
 */

export const defaultDesignerWidth = `${(typeof window !== 'undefined' ? window.screen.availWidth : 1024)}px`;

/** 100% is the whole pane the canvas sits in, so there is nothing above it to expand into. */
export const MAX_CANVAS_WIDTH_PERCENT = 100;

/** Shared by the reducer and by the provider when it restores a persisted percentage. */
export const boundCanvasWidthPercent = (percent: number | undefined): number =>
  typeof percent === 'number' && Number.isFinite(percent) && percent > 0
    ? Math.min(percent, MAX_CANVAS_WIDTH_PERCENT)
    : MAX_CANVAS_WIDTH_PERCENT;

/** Levels the +/- buttons step through. Direct entry is free-form within [minZoom, maxZoom]. */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 175, 200] as const;

export const DEFAULT_OPTIONS = {
  minZoom: 10,
  maxZoom: 400,
  defaultZoom: 75,
  designerWidth: defaultDesignerWidth,
  zoomStep: 1,
  zoomLevels: ZOOM_LEVELS,
};
