import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { widthRelativeToCanvas } from "@/providers/canvas/utils";

const getDimension = (main: string | number, canvasWidth?): string | number => {
  const width = canvasWidth ? widthRelativeToCanvas(main, canvasWidth) : main;

  return !hasNumber(main) ? main : addPx(width);
};

export const getCalculatedDimension = (main: string | number, firstMargin?: string | number, secondMargin?: string | number): string => {
  return `calc(${main} - ${firstMargin} - ${secondMargin})`;
};

export const getDimensionsStyle = (dimensions: IDimensionsValue | undefined, canvasWidth?: string): CSSProperties => {
  return {
    width: dimensions?.width
      ? getDimension(dimensions.width, canvasWidth)
      : undefined,
    height: dimensions?.height
      ? getDimension(dimensions.height, canvasWidth)
      : undefined,
    minWidth: dimensions?.minWidth
      ? getDimension(dimensions.minWidth, canvasWidth)
      : undefined,
    minHeight: dimensions?.minHeight
      ? getDimension(dimensions.minHeight, canvasWidth)
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? getDimension(dimensions.maxWidth, canvasWidth)
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? getDimension(dimensions.maxHeight, canvasWidth)
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
