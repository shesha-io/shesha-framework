import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx } from "@/utils/style";
import { IDropdownOption } from "@/designer-components/settingsInput/interfaces";

const getDimension = (main: string | number, left: any, right: any) => {
  return `calc(${addPx(main)} - ${addPx(left || '0')} - ${addPx(right || '0')})`;
};

export const getDimensionsStyle = (dimensions: IDimensionsValue, additionalStyles?: CSSProperties): CSSProperties => {
  return {
    width: dimensions?.width
      ? getDimension(dimensions.width, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : undefined,
    height: dimensions?.height
      ? getDimension(dimensions.height, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : undefined,
    minWidth: dimensions?.minWidth
      ? getDimension(dimensions.minWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : undefined,
    minHeight: dimensions?.minHeight
      ? getDimension(dimensions.minHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : undefined,
    maxWidth: dimensions?.maxWidth
      ? getDimension(dimensions.maxWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : undefined,
    maxHeight: dimensions?.maxHeight
      ? getDimension(dimensions.maxHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : undefined,
  };
};

export const overflowOptions: IDropdownOption[] = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
