import { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { canvasRelativeVh, dimensionRelativeToCanvas } from "@/providers/canvas/utils";

const getWidthDimension = (main: string | number, canvasWidth?: string, context?: object): string | number | undefined => {
  // If canvasWidth is provided and main contains vw, convert to calc
  if (canvasWidth && typeof main === 'string' && /vw/i.test(main)) {
    return dimensionRelativeToCanvas(main, canvasWidth, 'vw');
  }

  // A width can be given in vh too, and it is measured against the canvas like any other vh
  const value = canvasRelativeVh(main);

  // For simple numeric values or values without vw, use addPx
  if (typeof value === 'string' && /^calc\(/i.test(value.trim())) return value;
  return !hasNumber(value) ? value : addPx(value, context);
};

const getHeightDimension = (main: string | number, context?: object): string | number | undefined => {
  // vh is measured against the designer canvas rather than the browser window
  const value = canvasRelativeVh(main);

  // For simple numeric values or values without vh, use addPx
  if (typeof value === 'string' && /^calc\(/i.test(value.trim())) return value;
  return !hasNumber(value) ? value : addPx(value, context);
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

// No canvas height parameter: `vh` is rewritten to read the canvas's own custom property, so it
// needs no measurement passed in. See `canvasRelativeVh`.
export const getDimensionsStyle = (
  dimensions: IDimensionsValue | undefined,
  canvasWidth?: string,
  context?: object,
): CSSProperties => {
  const { width, minWidth, maxWidth, height, minHeight, maxHeight } = dimensions || {};

  return {
    width: width
      ? getWidthDimension(width, canvasWidth, context)
      : undefined,
    height: height
      ? getHeightDimension(height, context)
      : undefined,
    minWidth: minWidth
      ? getWidthDimension(minWidth, canvasWidth, context)
      : undefined,
    minHeight: minHeight
      ? getHeightDimension(minHeight, context)
      : undefined,
    maxWidth: maxWidth
      ? getWidthDimension(maxWidth, canvasWidth, context)
      : undefined,
    maxHeight: maxHeight
      ? getHeightDimension(maxHeight, context) : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
