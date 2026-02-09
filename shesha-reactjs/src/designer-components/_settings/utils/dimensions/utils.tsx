import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { widthRelativeToCanvas, heightRelativeToCanvas } from "@/providers/canvas/utils";

const getWidthDimension = (main: string | number, canvasWidth?: string): string | number => {
  // If canvasWidth is provided and main contains vw, convert to calc
  if (canvasWidth && typeof main === 'string' && /vw/i.test(main)) {
    return widthRelativeToCanvas(main, canvasWidth);
  }

  // For simple numeric values or values without vw, use addPx
  return !hasNumber(main) ? main : addPx(main);
};

const getHeightDimension = (main: string | number, canvasHeight?: string): string | number => {
  // If canvasHeight is provided and main contains vh, convert to calc
  if (canvasHeight && typeof main === 'string' && /vh/i.test(main)) {
    return heightRelativeToCanvas(main, canvasHeight);
  }

  // For simple numeric values or values without vh, use addPx
  return !hasNumber(main) ? main : addPx(main);
};

export const getCalculatedDimension = (main: string | number, firstMargin?: string | number, secondMargin?: string | number): string => {
  return `calc(${main} - ${firstMargin ?? 0} - ${secondMargin ?? 0})`;
};

export const getDimensionsStyle = (
  dimensions: IDimensionsValue | undefined,
  canvasWidth?: string,
  canvasHeight?: string,
): CSSProperties => {
  return {
    width: dimensions?.width
      ? getWidthDimension(dimensions.width, canvasWidth)
      : undefined,
    height: dimensions?.height
      ? getHeightDimension(dimensions.height, canvasHeight)
      : undefined,
    minWidth: dimensions?.minWidth
      ? getWidthDimension(dimensions.minWidth, canvasWidth)
      : undefined,
    minHeight: dimensions?.minHeight
      ? getHeightDimension(dimensions.minHeight, canvasHeight)
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? getWidthDimension(dimensions.maxWidth, canvasWidth)
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? getHeightDimension(dimensions.maxHeight, canvasHeight)
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
