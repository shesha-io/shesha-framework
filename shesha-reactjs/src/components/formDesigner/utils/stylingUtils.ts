import React, { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { ComponentDimensions } from './dimensionUtils';
import { addPx, hasNumber } from '@/utils/style';

export interface StyleConfig {
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
}

export const createRootContainerStyle = (
  dimensions: ComponentDimensions,
  stylingBox: StyleConfig,
  originalDimensions: ComponentDimensions,
  isInput: boolean,
): CSSProperties => {
  const baseStyle = {
    boxSizing: 'border-box' as const,
  };

  const margins = {
    marginTop: addPx(stylingBox?.marginTop || '0px'),
    marginBottom: addPx(stylingBox?.marginBottom || '0px'),
    marginLeft: addPx(stylingBox?.marginLeft || '0px'),
    marginRight: addPx(stylingBox?.marginRight || '0px'),
  };

  const {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = margins;

  return {
    ...baseStyle,
    ...originalDimensions,
    width: hasNumber(dimensions.width) ? `calc(${dimensions.width} + ${marginLeft} + ${marginRight})` : dimensions.width,
    maxWidth: hasNumber(dimensions.maxWidth) ? `calc(${dimensions.maxWidth} + ${marginLeft} + ${marginRight})` : dimensions.maxWidth,
    minWidth: hasNumber(dimensions.minWidth) ? `calc(${dimensions.minWidth} + ${marginLeft} + ${marginRight})` : dimensions.minWidth,
    height: isInput ? 'max-content' : hasNumber(dimensions.height) ? `calc(${dimensions.height} + ${marginTop} + ${marginBottom})` : dimensions.height,
    minHeight: isInput ? originalDimensions.minHeight : hasNumber(dimensions.minHeight) ? `calc(${dimensions.minHeight} + ${marginTop} + ${marginBottom})` : dimensions.minHeight,
    maxHeight: isInput ? originalDimensions.maxHeight : hasNumber(dimensions.maxHeight) ? `calc(${dimensions.maxHeight} + ${marginTop} + ${marginBottom})` : dimensions.maxHeight,
    flexBasis: dimensions.flexBasis,
  };
};

export const createFormItemStyle = (
  stylingBox: StyleConfig,
  formMode: string,
  dimensionsStyles: React.CSSProperties,
  typeInfo: ComponentTypeInfo,
): CSSProperties => {
  const { isDataTableContext, isInput } = typeInfo;
  const {
    marginLeft,
    marginRight,
    marginBottom,
    marginTop,
  } = stylingBox;

  return {
    ...(formMode !== 'designer' && {
      marginLeft,
      marginRight,
      marginBottom,
      marginTop,
    }),
    ...dimensionsStyles,
    flexBasis: 'auto',
    width: isDataTableContext
      ? '100%'
      : dimensionsStyles?.width || 'auto',
    height: isDataTableContext
      ? '100%'
      : isInput
        ? ''
        : dimensionsStyles?.height,
  };
};
