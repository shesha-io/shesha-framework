import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";
import { widthRelativeToCanvas } from "@/components/sidebarContainer/canvasUtils";

const getWidth = (main: string | number, canvasWidth?, stylingBox?) => {
  const { marginLeft, marginRight } = stylingBox || {};

  const width = canvasWidth ? widthRelativeToCanvas(main, canvasWidth) : main;
  return `calc(${addPx(width)} - ${marginLeft} - ${marginRight})`;
};

const getHeight = (main: string | number, canvasWidth?) => {
  const width = canvasWidth ? widthRelativeToCanvas(main, canvasWidth) : main;
  return `calc(${addPx(width)})`;
};

export const getDimensionsStyle = (dimensions: IDimensionsValue, canvasWidth?, stylingBox?): CSSProperties => {

  return {
    width: dimensions?.width
      ? getWidth(dimensions.width, canvasWidth, stylingBox)
      : undefined,
    height: dimensions?.height
      ? getWidth(dimensions.height, canvasWidth, stylingBox)
      : undefined,
    minWidth: dimensions?.minWidth
      ? getWidth(dimensions.minWidth, canvasWidth, stylingBox)
      : undefined,
    minHeight: dimensions?.minHeight
      ? getHeight(dimensions.minHeight, canvasWidth)
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? getHeight(dimensions.maxWidth, canvasWidth)
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? getHeight(dimensions.maxHeight, canvasWidth)
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
