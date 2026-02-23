import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { dimensionRelativeToCanvas } from "@/providers/canvas/utils";

const getWidthDimension = (main: string | number, canvasWidth?: string): string | number => {
  // If canvasWidth is provided and main contains vw, convert to calc
  if (canvasWidth && typeof main === 'string' && /vw/i.test(main)) {
    return dimensionRelativeToCanvas(main, canvasWidth, 'vw');
  }

  // For simple numeric values or values without vw, use addPx
  return !hasNumber(main) ? main : addPx(main);
};

const getHeightDimension = (main: string | number, canvasHeight?: string): string | number => {
  // If canvasHeight is provided and main contains vh, convert to calc
  if (canvasHeight && typeof main === 'string' && /vh/i.test(main)) {
    return dimensionRelativeToCanvas(main, canvasHeight, 'vh');
  }

  // For simple numeric values or values without vh, use addPx
  return !hasNumber(main) ? main : addPx(main);
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

export const getCalculatedDimension = (main: string | number, firstMargin?: string | number, secondMargin?: string | number): string => {
  const mainValue = main ?? 'auto';
  const margin1 = addPx(firstMargin ?? 0);
  const margin2 = addPx(secondMargin ?? 0);

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
  return `calc(${addPx(mainValue)} - ${margin1} - ${margin2})`;
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
  main: string | number,
  firstMargin?: string | number,
  secondMargin?: string | number,
): string => {
  const mainValue = main ?? '100%';
  const margin1 = addPx(firstMargin ?? 0);
  const margin2 = addPx(secondMargin ?? 0);

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
  return `calc(${addPx(mainValue)} - ${margin1} - ${margin2})`;
};

export const getDimensionsStyle = (
  dimensions: IDimensionsValue | undefined,
  canvasWidth?: string,
  canvasHeight?: string,
): CSSProperties => {
  const { width, minWidth, maxWidth, height, minHeight, maxHeight } = dimensions || {};

  return {
    width: width
      ? getWidthDimension(width, canvasWidth)
      : undefined,
    height: height
      ? getHeightDimension(height, canvasHeight)
      : undefined,
    minWidth: minWidth
      ? getWidthDimension(minWidth, canvasWidth)
      : undefined,
    minHeight: minHeight
      ? getHeightDimension(minHeight, canvasHeight)
      : undefined,
    maxWidth: maxWidth
      ? getWidthDimension(maxWidth, canvasWidth)
      : undefined,
    maxHeight: maxHeight
      ? getHeightDimension(maxHeight, canvasHeight) : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
