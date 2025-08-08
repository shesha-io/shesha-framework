import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";

const getDimension = (main: string | number, left: any, right: any) => {
  return `calc(${addPx(main)} - ${addPx(left || '0')} - ${addPx(right || '0')})`;
};

export const getDimensionsStyle = (dimensions: IDimensionsValue, additionalStyles?: CSSProperties): CSSProperties => {
  const width = additionalStyles?.width ? 
    hasNumber(additionalStyles?.width) ?
      getDimension(additionalStyles?.width, additionalStyles?.marginLeft, additionalStyles?.marginRight) :
       additionalStyles.width :
        hasNumber(dimensions?.width) ?
    getDimension(dimensions.width, additionalStyles?.marginLeft, additionalStyles?.marginRight)
    : dimensions?.width;

  const height = additionalStyles?.height
    ? hasNumber(additionalStyles?.height)
      ? getDimension(additionalStyles?.height, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : additionalStyles.height
    : hasNumber(dimensions?.height)
      ? getDimension(dimensions.height, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : dimensions?.height;

  const minWidth = additionalStyles?.minWidth
    ? hasNumber(additionalStyles?.minWidth)
      ? getDimension(additionalStyles?.minWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : additionalStyles.minWidth
    : hasNumber(dimensions?.minWidth)
      ? getDimension(dimensions.minWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : dimensions?.minWidth;

  const maxWidth = additionalStyles?.maxWidth
    ? hasNumber(additionalStyles?.maxWidth)
      ? getDimension(additionalStyles?.maxWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : additionalStyles.maxWidth
    : hasNumber(dimensions?.maxWidth)
      ? getDimension(dimensions.maxWidth, additionalStyles?.marginLeft, additionalStyles?.marginRight)
      : dimensions?.maxWidth;

  const minHeight = additionalStyles?.minHeight
    ? hasNumber(additionalStyles?.minHeight)
      ? getDimension(additionalStyles?.minHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : additionalStyles.minHeight
    : hasNumber(dimensions?.minHeight)
      ? getDimension(dimensions.minHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : dimensions?.minHeight;

  const maxHeight = additionalStyles?.maxHeight
    ? hasNumber(additionalStyles?.maxHeight)
      ? getDimension(additionalStyles?.maxHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : additionalStyles.maxHeight
    : hasNumber(dimensions?.maxHeight)
      ? getDimension(dimensions.maxHeight, additionalStyles?.marginTop, additionalStyles?.marginBottom)
      : dimensions?.maxHeight;


  return {
    width: additionalStyles?.width || dimensions?.width ? width : undefined,
    height: additionalStyles?.height || dimensions?.height? height: undefined,
    minWidth: additionalStyles?.minWidth || dimensions?.minWidth? minWidth: undefined,
    minHeight: additionalStyles?.minHeight || dimensions?.minHeight? minHeight: undefined,
    maxWidth: additionalStyles?.maxWidth || dimensions?.maxWidth? maxWidth: undefined,
    maxHeight: additionalStyles?.maxHeight || dimensions?.maxHeight? maxHeight: undefined,
  };
};

export const overflowOptions = [
  { value: "visible", label: "Visible", icon: <EyeOutlined /> },
  { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
  { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
  { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
