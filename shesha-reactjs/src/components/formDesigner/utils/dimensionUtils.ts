import { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { addPx } from '@/utils/style';

export interface DimensionConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  flexBasis?: string;
}

export const getComponentDimensions = (
  typeInfo: ComponentTypeInfo,
  dimensionsStyles: CSSProperties,
): CSSProperties => {
  const { isDataTableContext, isInput } = typeInfo;

  const width = isDataTableContext
    ? '100%'
    : addPx(dimensionsStyles?.width) || 'auto';

  const height = isDataTableContext
    ? '100%'
    : isInput
      ? 'auto'
      : addPx(dimensionsStyles?.height);

  const getDimensionValue = (dimensionType: keyof DimensionConfig): string | number | undefined => {
    if (isDataTableContext) return '100%';
    return addPx(dimensionsStyles?.[dimensionType]);
  };

  const flexBasis = addPx(dimensionsStyles?.maxWidth || dimensionsStyles?.width);

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
  dimensionsStyles: CSSProperties,
): CSSProperties => {
  const { isInput } = typeInfo;

  return {
    width: '100%',
    height: isInput ? dimensionsStyles?.height : '100%',
  };
};

export const getDeviceFlexBasis = (
  dimensionsStyles: CSSProperties,
): string | number => {
  return dimensionsStyles?.width;
};
