import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";

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
  margins?: CSSProperties,
): CSSProperties => {
  const { width, minWidth, maxWidth, height, minHeight, maxHeight } = dimensions || {};
  const { marginTop: top, marginLeft: left, marginRight: right, marginBottom: bottom } = margins || {};

  return {
    width: width
      ? getCalculatedDimension(width, left, right)
      : undefined,
    height: height
      ? getCalculatedDimension(height, top, bottom)
      : undefined,
    minWidth: minWidth
      ? getCalculatedDimension(minWidth, left, right)
      : undefined,
    minHeight: minHeight
      ? getCalculatedDimension(minHeight, top, bottom)
      : undefined,
    maxWidth: maxWidth
      ? getCalculatedDimension(maxWidth, left, right)
      : undefined,
    maxHeight: maxHeight
      ? getCalculatedDimension(maxHeight, top, bottom)
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
