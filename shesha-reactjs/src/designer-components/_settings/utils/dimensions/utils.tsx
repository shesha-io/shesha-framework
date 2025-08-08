import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { hasNumber } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";

export const getDimensionsStyle = (dimensions: IDimensionsValue): CSSProperties => {
  return {
    width: dimensions?.width
      ? hasNumber(dimensions.width) ?
        dimensions.width
        : dimensions.width
      : undefined,
    height: dimensions?.height
      ? hasNumber(dimensions.height) ?
        dimensions.height
        : dimensions.height
      : undefined,
    minWidth: dimensions?.minWidth
      ? hasNumber(dimensions.minWidth) ?
        dimensions.minWidth
        : dimensions.minWidth
      : undefined,
    minHeight: dimensions?.minHeight
      ? hasNumber(dimensions.minHeight) ?
        dimensions.minHeight
        : dimensions.minHeight
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? hasNumber(dimensions.maxWidth) ?
        dimensions.maxWidth
        : dimensions.maxWidth
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? hasNumber(dimensions.maxHeight) ?
        dimensions.maxHeight
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
