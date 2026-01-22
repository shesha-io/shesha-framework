import { CSSProperties } from 'react';
import { ComponentTypeInfo } from './componentTypeUtils';
import { IStyleType } from '@/index';

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
  const { shouldSkip } = typeInfo;

  const width = shouldSkip
    ? '100%'
    : dimensionsStyles?.width || 'auto';

  const height = shouldSkip
    ? '100%'
    : dimensionsStyles?.height || 'auto';

  const getDimensionValue = (dimensionType: keyof DimensionConfig): string | number => {
    if (shouldSkip) return '100%';
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

/**
 * Returns 100% dimensions for components wrapped in the root container.
 * The wrapper handles actual sizing, so components fill 100% of the wrapper.
 */
export const getDeviceDimensions = (): IStyleType['dimensions'] => {
  return {
    width: '100%',
    height: '100%',
  };
};

export const getDeviceFlexBasis = (
  dimensionsStyles: CSSProperties,
): string | number => {
  return dimensionsStyles?.width;
};
