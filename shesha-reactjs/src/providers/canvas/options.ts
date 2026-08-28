/**
 * Canvas constants, kept apart from `./utils` because `contexts.ts` needs them while its own module
 * body is running.
 *
 * `utils.ts` reaches the providers barrel through its imports, and that barrel comes back round to
 * this provider's `contexts.ts` - so whichever of the two is imported first, the other can be
 * half-initialised when it is read. Holding the constants in a module with no imports of its own
 * takes them out of that cycle: this file is always fully evaluated before either side needs it.
 *
 * They are re-exported from `./utils`, which stays the import site for the rest of the codebase.
 */

export const defaultDesignerWidth = `${(typeof window !== 'undefined' ? window.screen.availWidth : 1024)}px`;

/**
 * Custom property holding the length of a single `vh` inside a canvas - the designer canvas, or the
 * preview pane that stands in for one. Set by whichever component owns that viewport; read by
 * `canvasRelativeVh` in `./utils`. Nothing sets it elsewhere, so the `1vh` fallback leaves `vh`
 * meaning exactly what it always did.
 *
 * Lives here rather than in `./utils` because the components that set it are themselves inside the
 * import cycle described above.
 */
export const CANVAS_VH_VAR = '--sha-canvas-vh';

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
