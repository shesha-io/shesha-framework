import React, { CSSProperties } from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";
import { addPx, hasNumber } from "@/utils/style";

const getDimension = (main: string | number, left: any, right: any) => {
  return `calc(${addPx(main)} - ${addPx(left || '0')} - ${addPx(right || '0')})`;
};

const getDimensionValue = (
    additionalValue: string | number | undefined,
    dimensionValue: string | number | undefined,
    marginStart: any,
    marginEnd: any
  ): string | number | undefined => {
    if (additionalValue !== undefined) {
      return hasNumber(additionalValue) 
        ? getDimension(additionalValue, marginStart, marginEnd)
        : additionalValue;
    }
    if (dimensionValue !== undefined) {
      return hasNumber(dimensionValue)
        ? getDimension(dimensionValue, marginStart, marginEnd)
        : dimensionValue;
    }
    return undefined;
  };
export const getDimensionsStyle = (dimensions: IDimensionsValue, additionalStyles?: CSSProperties): CSSProperties => {
  const width = getDimensionValue(
      additionalStyles?.width,
      dimensions?.width,
      additionalStyles?.marginLeft,
      additionalStyles?.marginRight
    );

  const height = getDimensionValue(
    additionalStyles?.height,
    dimensions?.height,
    additionalStyles?.marginTop,
    additionalStyles?.marginBottom
  );

  const minWidth = getDimensionValue(
    additionalStyles?.minWidth,
    dimensions?.minWidth,
    additionalStyles?.marginLeft,
    additionalStyles?.marginRight
  );

  const maxWidth = getDimensionValue(
    additionalStyles?.maxWidth,
    dimensions?.maxWidth,
    additionalStyles?.marginLeft,
    additionalStyles?.marginRight
  );

  const minHeight = getDimensionValue(
    additionalStyles?.minHeight,
    dimensions?.minHeight,
    additionalStyles?.marginTop,
    additionalStyles?.marginBottom
  );

  const maxHeight = getDimensionValue(
    additionalStyles?.maxHeight,
    dimensions?.maxHeight,
    additionalStyles?.marginTop,
    additionalStyles?.marginBottom
  );


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
