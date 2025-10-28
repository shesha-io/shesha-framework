import React, { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
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
  dimensions: CSSProperties,
  stylingBox: StyleConfig,
  originalDimensions: CSSProperties,
): CSSProperties => {
  const baseStyle = {
    boxSizing: 'border-box' as const,
  };

  const margins = {
    marginTop: addPx(stylingBox?.marginTop || 0),
    marginBottom: addPx(stylingBox?.marginBottom || 0),
    marginLeft: addPx(stylingBox?.marginLeft || 0),
    marginRight: addPx(stylingBox?.marginRight || 0),
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
    height: hasNumber(dimensions.height) ? `calc(${dimensions.height} + ${marginTop} + ${marginBottom})` : dimensions.height,
    minHeight: hasNumber(dimensions.minHeight) ? `calc(${dimensions.minHeight} + ${marginTop} + ${marginBottom})` : dimensions.minHeight,
    maxHeight: hasNumber(dimensions.maxHeight) ? `calc(${dimensions.maxHeight} + ${marginTop} + ${marginBottom})` : dimensions.maxHeight,
    flexBasis: dimensions.flexBasis,
  };
};


