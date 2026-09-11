/**
 * Width bounding, in a leaf module so both the `getDimensionsStyle` path and the CSS-string path in
 * `_common/styles/utils.ts` can use it. Importing it from `./utils` instead would pull
 * `providers/canvas/utils` - and through it the providers barrel - into every component that emits
 * styles, which is the import cycle `canvas/constants.ts` exists to avoid.
 */
import { isDefined } from "@/utils/nullables";

/** The most a container-relative width may be: the whole of the container the component sits in. */
export const MAX_DIMENSION_PERCENT = 100;

const PERCENT_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;
const VW_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*vw\s*$/i;
const ABSOLUTE_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*(px|in|cm|mm|q|pt|pc)\s*$/i;

/** Units that convert to px exactly, so a width in them can be compared against the canvas. */
const PX_PER_UNIT: Record<string, number> = {
  px: 1, in: 96, cm: 96 / 2.54, mm: 9.6 / 2.54, q: 96 / 2.54 / 40, pt: 96 / 72, pc: 16,
};

const toPx = (value: number, unit: string): number | undefined => {
  const perUnit = PX_PER_UNIT[unit.toLowerCase()];
  return isDefined(perUnit) && Number.isFinite(value) ? value * perUnit : undefined;
};

/**
 * Overrides a width wider than the container the component sits in. On the designer canvas that
 * container is the device screen, and the canvas clips rather than scrolls, so the excess is not
 * merely off to one side - it is unreachable.
 *
 * Handles a percentage only, which CSS resolves against the containing block wherever this runs.
 * `vw` resolves against the browser viewport, so it is not container-relative until something
 * converts it - see `boundWidthToCanvas`. Absolute lengths need the canvas width to judge.
 *
 * Anything else is returned exactly as entered: a keyword such as `max-content`, a `calc()`, or a
 * font-relative unit (`em`, `rem`, `ch`), which cannot be judged without the resolved font size.
 */
export const boundWidth = (value: string | number): string | number => {
  if (typeof value !== 'string') return value;

  const percent = PERCENT_WIDTH_REGEX.exec(value);
  if (!percent) return value;

  const parsed = parseFloat(percent[1] ?? '');
  return Number.isFinite(parsed) && parsed > MAX_DIMENSION_PERCENT ? `${MAX_DIMENSION_PERCENT}%` : value;
};

/**
 * `boundWidth`, plus the units that only become container-relative once the canvas width is known:
 *
 * - `vw`, because `getWidthDimension` rewrites it as a fraction of the canvas, so 100vw is the
 *   canvas. Bounded here rather than in `boundWidth` because on a rendered page nothing rewrites
 *   it - it is viewport-relative, a deliberate `200vw` scroller is valid, and clamping it would
 *   both fail to fit any canvas and override the configured width.
 * - absolute lengths, compared against the canvas in px.
 *
 * The canvas width must be a plain length, which is what the canvas provider always reports.
 */
export const boundWidthToCanvas = (value: string | number, canvasWidth: string | undefined): string | number => {
  const bounded = boundWidth(value);
  if (typeof bounded !== 'string' || !isDefined(canvasWidth)) return bounded;

  const vw = VW_WIDTH_REGEX.exec(bounded);
  if (vw) {
    const parsed = parseFloat(vw[1] ?? '');
    return Number.isFinite(parsed) && parsed > MAX_DIMENSION_PERCENT ? `${MAX_DIMENSION_PERCENT}vw` : bounded;
  }

  const canvasMatch = ABSOLUTE_WIDTH_REGEX.exec(canvasWidth);
  if (!canvasMatch) return bounded;
  const canvasLimit = toPx(parseFloat(canvasMatch[1] ?? ''), canvasMatch[2] ?? 'px');
  if (!isDefined(canvasLimit) || canvasLimit <= 0) return bounded;

  const match = ABSOLUTE_WIDTH_REGEX.exec(bounded);
  if (!match) return bounded;
  const widthPx = toPx(parseFloat(match[1] ?? ''), match[2] ?? 'px');
  if (!isDefined(widthPx)) return bounded;

  return widthPx > canvasLimit ? `${Math.floor(canvasLimit)}px` : bounded;
};
