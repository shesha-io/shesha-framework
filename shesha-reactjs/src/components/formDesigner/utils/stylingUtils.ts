import React from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { ComponentDimensions } from './dimensionUtils';

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
  originalDimensions: any,
  isInput
) => {
  const {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = stylingBox;

  const baseStyle = {
    boxSizing: 'border-box' as const,
  };

  return {
    ...baseStyle,
    ...originalDimensions,
    width: `calc(${dimensions.width} + ${marginLeft} + ${marginRight})`,
    maxWidth: `calc(${dimensions.maxWidth} + ${marginLeft} + ${marginRight})`,
    minWidth: `calc(${dimensions.minWidth} + ${marginLeft} + ${marginRight})`,
    height: isInput? 'max-content' : `calc(${dimensions.height} + ${marginTop} + ${marginBottom})`,
    minHeight: isInput? originalDimensions.minHeight : `calc(${dimensions.minHeight} + ${marginTop} + ${marginBottom})`,
    maxHeight: isInput? originalDimensions.maxHeight : `calc(${dimensions.maxHeight} + ${marginTop} + ${marginBottom})`,
    flexBasis: dimensions.flexBasis,
  };
};

export const createFormItemStyle = (
  stylingBox: StyleConfig,
  formMode: string,
  dimensionsStyles: React.CSSProperties,
  typeInfo: ComponentTypeInfo
) => {
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