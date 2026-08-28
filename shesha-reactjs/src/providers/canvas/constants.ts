/**
 * Canvas constants, deliberately kept in a leaf module with no imports.
 *
 * `contexts.ts` needs these defaults and `utils.ts` needs them too, but `utils.ts` reaches
 * `@/utils/object` - which pulls in the providers barrel, and so `contexts.ts` - before its own
 * body has run. Importing the defaults from `utils.ts` therefore left `DEFAULT_OPTIONS` undefined
 * for whichever module the cycle entered first. Holding them here removes the cycle: nothing this
 * module imports can import it back.
 */

export const defaultDesignerWidth = `${(typeof window !== 'undefined' ? window.screen.availWidth : 1024)}px`;

/**
 * Upper bound for a percentage canvas width. 100% is the whole pane the canvas sits in; asking for
 * more has nothing to expand into, so anything greater is capped here rather than pushed past the
 * pane edge.
 */
export const MAX_CANVAS_WIDTH_PERCENT = 100;

/**
 * Bounds a canvas width percentage to `MAX_CANVAS_WIDTH_PERCENT`, falling back to it for anything
 * unusable. Shared by the reducer and by the provider when it restores a persisted percentage, so
 * a hand-edited or stale storage value cannot put the canvas past its pane.
 */
export const boundCanvasWidthPercent = (percent: number | undefined): number =>
  typeof percent === 'number' && Number.isFinite(percent) && percent > 0
    ? Math.min(percent, MAX_CANVAS_WIDTH_PERCENT)
    : MAX_CANVAS_WIDTH_PERCENT;

/**
 * Predefined zoom levels (percentages) that the +/- buttons step through, in 25% increments.
 * Direct numeric entry in the zoom input is free-form within [minZoom, maxZoom]
 * and is not restricted to these levels.
 */
export const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 175, 200] as const;

export const DEFAULT_OPTIONS = {
  minZoom: 10,
  maxZoom: 400,
  defaultZoom: 75,
  sizes: [25, 50, 25],
  configTreePanelWidth: (val: number = 20): number => typeof window !== 'undefined' ? (val / 100) * window.innerWidth : 200,
  gutter: 4,
  designerWidth: defaultDesignerWidth,
  zoomStep: 1,
  zoomLevels: ZOOM_LEVELS,
  modalMargins: 32,
};
