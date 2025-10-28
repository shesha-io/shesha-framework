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
  const { isDataTableContext } = typeInfo;

  const width = isDataTableContext
    ? '100%'
    : dimensionsStyles?.width || 'auto';

  const height = isDataTableContext
    ? '100%'
    : dimensionsStyles?.height || 'auto';

  const getDimensionValue = (dimensionType: keyof DimensionConfig): string | number => {
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
  stylingBoxMargin: CSSProperties
): CSSProperties => {

  return {
    width: `calc(100% - ${stylingBoxMargin?.marginLeft || '0px'} - ${stylingBoxMargin?.marginRight || '0px'} )`,
    height: `calc(100% - ${stylingBoxMargin?.marginTop || '0px'} - ${stylingBoxMargin?.marginBottom || '0px'} )`,
  };
};

export const getDeviceFlexBasis = (
  dimensionsStyles: CSSProperties,
): string | number => {
  return dimensionsStyles?.width;
};
