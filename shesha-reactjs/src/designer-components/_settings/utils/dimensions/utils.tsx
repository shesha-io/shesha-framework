import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { widthRelativeToCanvas } from "@/providers/canvas/utils";

const getDimension = (main: string | number, left: any, right: any, canvasWidth?: string) => {
  const value = canvasWidth !== null ? widthRelativeToCanvas(main, canvasWidth) : main;
  return `calc(${addPx(value)} - ${addPx(left || '0')} - ${addPx(right || '0')})`;
};

export const getDimensionsStyle = (dimensions: IDimensionsValue, additionalStyles?: CSSProperties, canvasWidth?): CSSProperties => {
  return {
    width: dimensions?.width
      ? hasNumber(dimensions.width)
        ? getDimension(dimensions.width, additionalStyles?.marginLeft, additionalStyles?.marginRight, canvasWidth)
        : dimensions.width
      : undefined,
    height: dimensions?.height
      ? hasNumber(dimensions.height)
        ? getDimension(dimensions.height, additionalStyles?.marginTop, additionalStyles?.marginBottom)
        : dimensions.height
      : undefined,
    minWidth: dimensions?.minWidth
      ? hasNumber(dimensions.minWidth)
        ? getDimension(dimensions.minWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight, canvasWidth)
        : dimensions.minWidth
      : undefined,
    minHeight: dimensions?.minHeight
      ? hasNumber(dimensions.minHeight)
        ? getDimension(dimensions.minHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
        : dimensions.minHeight
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? hasNumber(dimensions.maxWidth)
        ? getDimension(dimensions.maxWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight, canvasWidth)
        : dimensions.maxWidth
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? hasNumber(dimensions.maxHeight)
        ? getDimension(dimensions.maxHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
        : dimensions.maxHeight
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
