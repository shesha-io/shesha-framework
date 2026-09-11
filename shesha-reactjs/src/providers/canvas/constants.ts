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

/**
 * Converts viewport units (vw/vh) to be relative to a specific canvas dimension, whether the
 * value is the whole dimension ("100vh") or nested in an expression ("calc(100vh - 50px)")
 * @param dimension - The dimension value (e.g., "50vw", "100vh", "100px", 300)
 * @param canvasDimension - The canvas dimension to calculate relative to (e.g., '100vw', '1024px')
 * @param unit - The unit type to convert ('vw' or 'vh')
 * @returns The converted dimension string
 */
export const dimensionRelativeToCanvas = (
  dimension: string | number,
  canvasDimension: string,
  unit: 'vw' | 'vh',
): string => {
  if (typeof dimension === 'number') {
    return `${dimension}px`;
  }

  const trimmed = String(dimension).trim();
  const unitRegex = new RegExp(`^([\\d.]+)\\s*${unit}$`, 'i');
  const unitMatch = unitRegex.exec(trimmed);

  if (unitMatch && unitMatch[1] !== undefined) {
    const percentageOfCanvas = parseFloat(unitMatch[1]);
    if (!Number.isNaN(percentageOfCanvas)) {
      return `calc((${percentageOfCanvas} * ${canvasDimension}) / 100)`;
    }
  }

  // Nested in an expression: every occurrence resolves the same way the whole value would.
  const nestedRegex = new RegExp(String.raw`(\d+(?:\.\d+)?)\s*${unit}\b`, 'gi');
  return trimmed.replace(nestedRegex, (whole, value: string) => {
    const percentageOfCanvas = parseFloat(value);
    return Number.isNaN(percentageOfCanvas)
      ? whole
      : `((${percentageOfCanvas} * ${canvasDimension}) / 100)`;
  });
};

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
