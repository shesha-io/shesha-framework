import { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';

export interface DimensionConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

export interface ComponentDimensions {
  width: string;
  height: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

export const getComponentDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: ComponentDimensions,
): ComponentDimensions => {
  const { isDataTableContext, isInput } = typeInfo;

  const width = isDataTableContext
    ? '100%'
    : dimensionsStyles?.width || 'auto';

  const height = isDataTableContext
    ? '100%'
    : isInput
      ? 'auto'
      : dimensionsStyles?.height;

  const getDimensionValue = (dimensionType: keyof DimensionConfig): string => {
    if (isDataTableContext) return '100%';
    return dimensionsStyles?.[dimensionType];
  };

  const flexBasis = dimensionsStyles?.maxWidth || dimensionsStyles?.width;

  return {
    width,
    height,
    maxWidth: getDimensionValue('maxWidth'),
    minWidth: getDimensionValue('minWidth'),
    maxHeight: getDimensionValue('maxHeight'),
    minHeight: getDimensionValue('minHeight'),
    flexBasis,
  };
};

export const getDeviceDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: ComponentDimensions,
): CSSProperties => {
  const { isInput } = typeInfo;
  // const {marginBottom, marginTop, marginLeft, margingRight} = stylingBox;

  return {
    width: '100%',
    height: isInput ? dimensionsStyles?.height : '100%',
  };
};

export const getDeviceFlexBasis = (
  dimensionsStyles: ComponentDimensions,
): string => {
  return dimensionsStyles?.width;
};
