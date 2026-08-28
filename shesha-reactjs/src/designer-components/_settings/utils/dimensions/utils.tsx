import { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, allowForCanvasChromeHeight, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { dimensionRelativeToCanvas } from "@/providers/canvas/utils";
import { isDefined } from "@/utils/nullables";

/**
 * The most a percentage width may be: the whole of the container the component sits in. Anything
 * over this is overridden to it - strictly, so 100.5% is over the container as much as 200% is.
 */
export const MAX_DIMENSION_PERCENT = 100;

const PERCENT_WIDTH_REGEX = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/;

/**
 * Overrides a percentage width above `MAX_DIMENSION_PERCENT` with the whole container.
 *
 * Such a width is wider than the container the component sits in. On the designer canvas that
 * container is the device screen, and the canvas clips rather than scrolls, so the excess is not
 * merely off to one side - it is unreachable. Overriding keeps the component inside the screen it
 * is being designed for.
 *
 * A percentage below the limit is returned exactly as entered - 50% stays 50%. So is anything that
 * is not a plain percentage: a length, a keyword such as `max-content`, a `calc()`, or a viewport
 * unit. Only a percentage has the container-relative meaning this can act on; the rest either do
 * not resolve against the container or cannot be judged without evaluating them.
 */
export const boundWidthPercent = (value: string | number): string | number => {
  if (typeof value !== 'string') return value;

  const match = PERCENT_WIDTH_REGEX.exec(value);
  if (!match) return value;

  const percent = parseFloat(match[1] ?? '');
  return Number.isFinite(percent) && percent > MAX_DIMENSION_PERCENT
    ? `${MAX_DIMENSION_PERCENT}%`
    : value;
};

/** True when `boundWidthPercent` would override the value, i.e. it is a percentage over the bound. */
export const exceedsWidthPercent = (value: string | number | undefined): boolean =>
  isDefined(value) && boundWidthPercent(value) !== value;

const getWidthDimension = (main: string | number, canvasWidth?: string, context?: object): string | number | undefined => {
  // Bounded first, so a percentage over 100% cannot reach the rendered style by any route -
  // including a value already saved in a form before the bound existed.
  const bounded = boundWidthPercent(main);

  // If canvasWidth is provided and bounded contains vw, convert to calc
  if (canvasWidth && typeof bounded === 'string' && /vw/i.test(bounded)) {
    return dimensionRelativeToCanvas(bounded, canvasWidth, 'vw');
  }

  // For simple numeric values or values without vw, use addPx
  if (typeof bounded === 'string' && /^calc\(/i.test(bounded.trim())) return bounded;
  return !hasNumber(bounded) ? bounded : addPx(bounded, context);
};

const getHeightDimension = (main: string | number, canvasHeight?: string, context?: object): string | number | undefined => {
  // A full-viewport height is reduced first: it resolves against the browser viewport, which is
  // taller than the canvas, so 100vh would otherwise always overshoot the device screen.
  const allowed = allowForCanvasChromeHeight(main);

  // If canvasHeight is provided and allowed contains vh, convert to calc
  if (canvasHeight && typeof allowed === 'string' && /vh/i.test(allowed)) {
    return dimensionRelativeToCanvas(allowed, canvasHeight, 'vh');
  }

  // For simple numeric values or values without vh, use addPx
  if (typeof allowed === 'string' && /^calc\(/i.test(allowed.trim())) return allowed;
  return !hasNumber(allowed) ? allowed : addPx(allowed, context);
};

/**
 * Checks if a value is a calc() expression (e.g., from converted vw/vh units).
 * @param value - The value to check
 * @returns true if the value is a calc() expression
 */
const isCalcExpression = (value: string | number | undefined): boolean => {
  if (typeof value !== 'string') return false;
  return value.trim().toLowerCase().startsWith('calc(');
};

/**
 * Internal helper that computes dimension calculation with margins.
 * Shared logic for getCalculatedDimension and getDesignerCalculatedDimension.
 *
 * @param main - The main dimension value
 * @param firstMargin - First margin value
 * @param secondMargin - Second margin value
 * @param defaultMain - Default value to use when main is null/undefined
 * @param fallbackForAddPx - Fallback value when addPx returns undefined
 * @param context - Optional context object for executing JS code
 * @returns A calc() string that subtracts margins from the main dimension
 */
const computeDimension = (
  main: string | number | undefined,
  firstMargin: string | number | undefined,
  secondMargin: string | number | undefined,
  defaultMain: string,
  fallbackForAddPx: string,
  context?: object,
): string => {
  const mainValue = main ?? defaultMain;
  const margin1 = addPx(firstMargin ?? 0, context);
  const margin2 = addPx(secondMargin ?? 0, context);

  // For calc() expressions (converted vw/vh), nest the calc to preserve the original calculation
  if (isCalcExpression(mainValue)) {
    return `calc(${mainValue} - ${margin1} - ${margin2})`;
  }

  // For non-numeric values (auto, max-content, min-content, etc.), return as-is
  // These CSS keywords can't be used in calc() expressions
  if (!hasNumber(mainValue)) {
    return typeof mainValue === 'string' ? mainValue : String(mainValue);
  }

  // For regular numeric values, use the standard calc format
  return `calc(${addPx(mainValue, context) ?? fallbackForAddPx} - ${margin1} - ${margin2})`;
};

export const getCalculatedDimension = (main: string | number | undefined, firstMargin?: string | number | undefined, secondMargin?: string | number | undefined, context?: object | undefined): string => {
  return computeDimension(main, firstMargin, secondMargin, 'auto', '0px', context);
};

/**
 * Calculates a dimension value adjusted for margins, with special handling for calc() expressions.
 * This is used in designer mode to account for margins while preserving canvas-relative calculations.
 *
 * For regular values: returns `calc(main - margin1 - margin2)`
 * For calc() expressions (e.g., converted vw/vh): nests the calc to preserve the original calculation
 *
 * @param main - The main dimension value (can be a calc() expression from vw/vh conversion)
 * @param firstMargin - First margin value (e.g., left or top margin)
 * @param secondMargin - Second margin value (e.g., right or bottom margin)
 * @param context - Optional context object for executing JS code
 * @returns A calc() string that subtracts margins from the main dimension
 *
 * @example
 * ```tsx
 * // Regular value
 * getDesignerCalculatedDimension('100%', '5px', '5px')
 * // Returns: 'calc(100% - 5px - 5px)'
 *
 * // Converted vw value (canvas-relative)
 * getDesignerCalculatedDimension('calc((50 * 1024px) / 100)', '5px', '5px')
 * // Returns: 'calc(calc((50 * 1024px) / 100) - 5px - 5px)'
 * ```
 */
export const getDesignerCalculatedDimension = (
  main: string | number | undefined,
  firstMargin?: string | number | undefined,
  secondMargin?: string | number | undefined,
  context?: object | undefined,
): string => {
  return computeDimension(main, firstMargin, secondMargin, '100%', '100%', context);
};

export const getDimensionsStyle = (
  dimensions: IDimensionsValue | undefined,
  canvasWidth?: string,
  canvasHeight?: string,
  context?: object,
): CSSProperties => {
  const { width, minWidth, maxWidth, height, minHeight, maxHeight } = dimensions || {};

  return {
    width: width
      ? getWidthDimension(width, canvasWidth, context)
      : undefined,
    height: height
      ? getHeightDimension(height, canvasHeight, context)
      : undefined,
    minWidth: minWidth
      ? getWidthDimension(minWidth, canvasWidth, context)
      : undefined,
    minHeight: minHeight
      ? getHeightDimension(minHeight, canvasHeight, context)
      : undefined,
    maxWidth: maxWidth
      ? getWidthDimension(maxWidth, canvasWidth, context)
      : undefined,
    maxHeight: maxHeight
      ? getHeightDimension(maxHeight, canvasHeight, context) : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
